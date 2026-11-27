import ipaddress
import re
from datetime import datetime, timezone
from urllib.parse import unquote, urlparse

from backend.models import AnalysisResult, EvidenceItem

URL_SHORTENERS = {
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "ow.ly",
    "is.gd",
    "buff.ly",
    "rb.gy",
    "cutt.ly",
    "shorturl.at",
    "tiny.cc",
    "lnkd.in",
    "soo.gd",
    "s.id",
}

BRAND_OFFICIAL_DOMAINS = {
    "paypal": {"paypal.com"},
    "amazon": {"amazon.com", "amazon.in", "amazon.co.uk"},
    "apple": {"apple.com", "icloud.com"},
    "microsoft": {"microsoft.com", "live.com", "outlook.com", "office.com"},
    "google": {"google.com", "gmail.com", "accounts.google.com"},
    "netflix": {"netflix.com"},
    "chase": {"chase.com"},
    "bankofamerica": {"bankofamerica.com"},
    "wellsfargo": {"wellsfargo.com"},
    "fedex": {"fedex.com"},
    "dhl": {"dhl.com"},
    "ups": {"ups.com"},
    "usps": {"usps.com"},
    "instagram": {"instagram.com"},
    "whatsapp": {"whatsapp.com"},
    "coinbase": {"coinbase.com"},
    "binance": {"binance.com"},
    "discord": {"discord.com"},
    "steam": {"steampowered.com", "steamcommunity.com"},
    "hdfc": {"hdfcbank.com"},
    "sbi": {"onlinesbi.sbi", "sbi.co.in"},
    "icici": {"icicibank.com"},
}

TYPOSQUAT_PATTERNS = [
    ("paypa1", "paypal"),
    ("g00gle", "google"),
    ("micros0ft", "microsoft"),
    ("arnazon", "amazon"),
    ("app1e", "apple"),
    ("netf1ix", "netflix"),
    ("faceb00k", "facebook"),
    ("instagrarn", "instagram"),
]

SUSPICIOUS_URL_KEYWORDS = [
    "login",
    "signin",
    "verify",
    "secure",
    "account",
    "update",
    "confirm",
    "banking",
    "wallet",
    "password",
    "reset",
    "suspend",
    "urgent",
    "invoice",
    "claim",
    "bonus",
    "webscr",
    "auth",
    "kyc",
]

MESSAGE_RULES = [
    {
        "id": "msg_urgency",
        "title": "Urgency & Time-Pressure Language",
        "category": "Urgency",
        "severity": "medium",
        "points": 16,
        "patterns": [
            r"\burgent\b",
            r"\bimmediately\b",
            r"\bwithin\s+\d+\s+(?:hours?|hrs?|minutes?)\b",
            r"\bact now\b",
            r"\bexpires?\s+today\b",
            r"\bfinal notice\b",
            r"\blast chance\b",
            r"\baction required\b",
            r"\bright away\b",
            r"\blimited time\b",
            r"\basap\b",
        ],
        "detail": "Message pressures the recipient to act quickly, a common social-engineering tactic to bypass critical thinking.",
    },
    {
        "id": "msg_account_threat",
        "title": "Account Closure or Suspension Threat",
        "category": "Account Threat",
        "severity": "high",
        "points": 24,
        "patterns": [
            r"\baccount\s+(?:will be\s+)?(?:suspended|locked|closed|terminated|deactivated|restricted|frozen)\b",
            r"\bsuspended\b",
            r"\bunauthorized\s+(?:access|activity|login|transaction)\b",
            r"\bunusual\s+(?:activity|sign-in|login)\b",
            r"\bcompromised\b",
            r"\blegal action\b",
            r"\bpermanent(?:ly)?\s+blocked\b",
        ],
        "detail": "Message threatens account suspension, lockout, or legal consequences to induce panic.",
    },
    {
        "id": "msg_credential_request",
        "title": "OTP, PIN, or Password Request",
        "category": "Credential Harvesting",
        "severity": "high",
        "points": 30,
        "patterns": [
            r"\botp\b",
            r"\bone[- ]time\s+(?:password|passcode|code)\b",
            r"\bverification code\b",
            r"\bsecurity code\b",
            r"\b2fa\s+code\b",
            r"\bpassword\b",
            r"\bpasscode\b",
            r"\bpin\b",
            r"\bcvv\b",
            r"\bssn\b",
            r"\bsocial security\b",
            r"\blogin\s+(?:details|credentials)\b",
        ],
        "detail": "Message asks for or references sensitive authentication secrets (OTP, password, PIN, CVV).",
    },
    {
        "id": "msg_prize_scam",
        "title": "Prize, Lottery, or Reward Lure",
        "category": "Reward Scam",
        "severity": "medium",
        "points": 20,
        "patterns": [
            r"\bcongratulations\b",
            r"\byou(?:'ve| have)?\s+won\b",
            r"\bwinner\b",
            r"\bprize\b",
            r"\blottery\b",
            r"\bjackpot\b",
            r"\bclaim your\b",
            r"\bfree\s+(?:gift|iphone|reward|bonus|cash)\b",
            r"\bcashback\b",
            r"\bselected\s+for\s+a\s+reward\b",
        ],
        "detail": "Message offers an unsolicited prize, reward, or giveaway to lure the recipient into clicking or paying.",
    },
    {
        "id": "msg_payment_demand",
        "title": "Payment, Fee, or Crypto Demand",
        "category": "Payment Demand",
        "severity": "high",
        "points": 24,
        "patterns": [
            r"\bpay now\b",
            r"\bwire transfer\b",
            r"\bbitcoin\b",
            r"\bcrypto(?:currency)?\b",
            r"\busdt\b",
            r"\bgift card\b",
            r"\boverdue\b",
            r"\bunpaid\b",
            r"\bpenalty\b",
            r"\bcustoms\s+fee\b",
            r"\bdelivery\s+fee\b",
            r"\bbilling\s+issue\b",
            r"\bsend\s+money\b",
        ],
        "detail": "Message demands immediate payment, fees, gift cards, or cryptocurrency transfers.",
    },
    {
        "id": "msg_impersonation",
        "title": "Brand or Authority Impersonation Cues",
        "category": "Impersonation",
        "severity": "medium",
        "points": 15,
        "patterns": [
            r"\bdear\s+(?:customer|user|member|client)\b",
            r"\b(?:security|support|fraud|verification)\s+team\b",
            r"\b(?:irs|tax\s+department|customs)\b",
            r"\b(?:paypal|amazon|apple|microsoft|netflix|fedex|dhl|ups|usps|bank|sbi|hdfc|icici)\b",
            r"\bhr\s+department\b",
        ],
        "detail": "Message uses generic greetings or references trusted brands/authorities commonly impersonated in phishing.",
    },
]

URL_EXTRACT_REGEX = re.compile(
    r"(?:https?://|www\.)[^\s<>\"'\)\]]+",
    re.IGNORECASE,
)


def extract_urls_from_message(message: str) -> list[str]:
    """Extract unique URLs from a message body without duplicates."""
    seen: set[str] = set()
    urls: list[str] = []
    for raw in URL_EXTRACT_REGEX.findall(message):
        clean_url = raw.rstrip(".,;:!?")
        if clean_url and clean_url not in seen:
            seen.add(clean_url)
            urls.append(clean_url)
    return urls


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _verdict_from_score(score: int) -> str:
    if score >= 60:
        return "HIGH RISK"
    if score >= 30:
        return "SUSPICIOUS"
    return "LOW RISK"


def _extract_registrable_domain(host: str) -> str:
    parts = [p for p in host.split(".") if p]
    if len(parts) >= 2:
        return ".".join(parts[-2:])
    return host


def _is_ip_host(host: str) -> bool:
    cleaned = host.strip("[]")
    try:
        ipaddress.ip_address(cleaned)
        return True
    except ValueError:
        pass
    # Check hex/octal/integer IPv4 obfuscation like 0x7f.0.0.1 or 2130706433
    if re.fullmatch(r"(?:0x[0-9a-f]+|0[0-7]+|\d+)(?:\.(?:0x[0-9a-f]+|0[0-7]+|\d+)){0,3}", cleaned, re.IGNORECASE):
        if cleaned.isdigit() and len(cleaned) >= 8:
            return True
        if "." in cleaned and all(
            part.startswith("0x") or part.isdigit() for part in cleaned.split(".")
        ):
            return True
    return False


def analyze_url(raw_url: str) -> AnalysisResult:
    submitted = raw_url.strip()
    evidence: list[EvidenceItem] = []

    lowered = submitted.lower()
    has_scheme = "://" in submitted

    # Check dangerous URI schemes first
    if lowered.startswith(("javascript:", "data:", "vbscript:")):
        evidence.append(
            EvidenceItem(
                id="url_dangerous_scheme",
                title="Executable or Data URI Scheme",
                category="Obfuscation",
                severity="high",
                points=45,
                detail="The input uses a non-HTTP executable or data URI scheme, which can execute scripts or hide payloads.",
                matched_text=submitted[:40],
            )
        )
        score = 45
        verdict = _verdict_from_score(score)
        return AnalysisResult(
            scan_type="url",
            submitted_input=submitted,
            risk_score=score,
            verdict=verdict,
            evidence=evidence,
            explanation="Local heuristic analysis detected a potentially dangerous non-HTTP URI scheme.",
            recommended_actions=[
                "Do not open or paste this URI into a browser address bar.",
                "Inspect the source that delivered this link.",
            ],
            timestamp=_utc_now_iso(),
        )

    parse_target = submitted if has_scheme else f"http://{submitted}"
    parsed = urlparse(parse_target)
    host = (parsed.hostname or "").lower()
    scheme = parsed.scheme.lower() if has_scheme else ""

    # 1. HTTPS absence
    if scheme == "http" or not has_scheme:
        evidence.append(
            EvidenceItem(
                id="url_no_https",
                title="HTTPS Absence",
                category="Transport Security",
                severity="medium",
                points=14,
                detail=(
                    "URL uses unencrypted HTTP instead of HTTPS."
                    if scheme == "http"
                    else "URL was submitted without an HTTPS scheme."
                ),
                matched_text=scheme or "no scheme",
            )
        )

    # 2. IP address used instead of domain
    if host and _is_ip_host(host):
        evidence.append(
            EvidenceItem(
                id="url_ip_host",
                title="Raw IP Address Used as Host",
                category="Domain Anomaly",
                severity="high",
                points=30,
                detail="Legitimate services rarely ask users to log in via a raw or obfuscated IP address instead of a domain name.",
                matched_text=host,
            )
        )

    # 3. Suspicious URL length
    if len(submitted) > 120:
        evidence.append(
            EvidenceItem(
                id="url_very_long",
                title="Excessive URL Length",
                category="Structure",
                severity="high",
                points=18,
                detail=f"URL length is {len(submitted)} characters (>120), often used to hide the real destination or embed tracking/payload parameters.",
                matched_text=f"{len(submitted)} chars",
            )
        )
    elif len(submitted) > 75:
        evidence.append(
            EvidenceItem(
                id="url_long",
                title="Elevated URL Length",
                category="Structure",
                severity="medium",
                points=10,
                detail=f"URL length is {len(submitted)} characters (>75), which warrants checking the actual domain.",
                matched_text=f"{len(submitted)} chars",
            )
        )

    # 4. Excessive subdomains
    if host and not _is_ip_host(host):
        labels = [lbl for lbl in host.split(".") if lbl]
        if len(labels) >= 4:
            evidence.append(
                EvidenceItem(
                    id="url_excessive_subdomains",
                    title="Excessive Subdomains",
                    category="Domain Anomaly",
                    severity="medium",
                    points=15,
                    detail=f"Host has {len(labels)} domain labels ({host}). Attackers stack subdomains to mimic trusted sites.",
                    matched_text=host,
                )
            )

    # 5. URL shorteners
    reg_domain = _extract_registrable_domain(host) if host else ""
    if host in URL_SHORTENERS or reg_domain in URL_SHORTENERS:
        evidence.append(
            EvidenceItem(
                id="url_shortener",
                title="URL Shortener Service",
                category="Obfuscation",
                severity="medium",
                points=18,
                detail="Shortened URLs mask the final destination domain, making it harder to verify legitimacy before clicking.",
                matched_text=host,
            )
        )

    # 6. Misleading brand names or typosquatting in domain
    if host:
        brand_hit = None
        for brand, official_domains in BRAND_OFFICIAL_DOMAINS.items():
            if brand in host and reg_domain not in official_domains and host not in official_domains:
                brand_hit = brand
                break
        if brand_hit:
            evidence.append(
                EvidenceItem(
                    id="url_brand_impersonation",
                    title="Misleading Brand Name in Domain",
                    category="Impersonation",
                    severity="high",
                    points=28,
                    detail=f"The domain '{host}' contains the brand '{brand_hit}' but does not match its official domain.",
                    matched_text=host,
                )
            )
        else:
            for typo, real_brand in TYPOSQUAT_PATTERNS:
                if typo in host:
                    evidence.append(
                        EvidenceItem(
                            id="url_typosquat",
                            title="Lookalike / Typosquatted Brand Domain",
                            category="Impersonation",
                            severity="high",
                            points=30,
                            detail=f"The domain '{host}' appears to mimic '{real_brand}' using character substitution ('{typo}').",
                            matched_text=typo,
                        )
                    )
                    break

    # 7. Suspicious characters (@, punycode xn--, excessive hyphens, unusual port)
    suspicious_chars_found = []
    if "@" in submitted:
        suspicious_chars_found.append("'@' credential separator")
    if "xn--" in host:
        suspicious_chars_found.append("punycode ('xn--') IDN")
    if host.count("-") >= 3:
        suspicious_chars_found.append(f"{host.count('-')} hyphens in host")
    try:
        parsed_port = parsed.port
    except ValueError:
        parsed_port = None
        suspicious_chars_found.append("malformed port syntax")
    if parsed_port and parsed_port not in (80, 443):
        suspicious_chars_found.append(f"non-standard port :{parsed_port}")

    if suspicious_chars_found:
        has_at_or_puny = "@" in submitted or "xn--" in host
        evidence.append(
            EvidenceItem(
                id="url_suspicious_chars",
                title="Suspicious URL Characters or Port",
                category="Structure",
                severity="high" if has_at_or_puny else "medium",
                points=22 if has_at_or_puny else 14,
                detail="Detected unusual URL syntax: " + ", ".join(suspicious_chars_found) + ".",
                matched_text=", ".join(suspicious_chars_found),
            )
        )

    # 8. Suspicious keywords in URL path/query/subdomain
    url_body_for_kw = f"{host}{parsed.path}?{parsed.query}".lower()
    matched_keywords = sorted({kw for kw in SUSPICIOUS_URL_KEYWORDS if kw in url_body_for_kw})
    if matched_keywords:
        kw_count = len(matched_keywords)
        evidence.append(
            EvidenceItem(
                id="url_suspicious_keywords",
                title="Credential or Action Keywords in URL",
                category="Keywords",
                severity="high" if kw_count >= 3 else "medium",
                points=20 if kw_count >= 3 else 12,
                detail=f"URL contains {kw_count} sensitive keyword(s) often used in phishing lures: {', '.join(matched_keywords[:6])}.",
                matched_text=", ".join(matched_keywords[:6]),
            )
        )

    # 9. Encoded or obfuscated URL patterns
    percent_matches = re.findall(r"%[0-9a-fA-F]{2}", submitted)
    double_encoded = "%25" in submitted
    decoded_once = unquote(submitted)
    obfuscation_reasons = []
    if double_encoded:
        obfuscation_reasons.append("double percent-encoding (%25)")
    if len(percent_matches) >= 5:
        obfuscation_reasons.append(f"heavy percent-encoding ({len(percent_matches)} sequences)")
    if decoded_once != submitted and any(kw in decoded_once.lower() for kw in ("http://", "https://", "script", "login")):
        obfuscation_reasons.append("encoded redirect or keyword payload")

    if obfuscation_reasons:
        evidence.append(
            EvidenceItem(
                id="url_obfuscation",
                title="Encoded or Obfuscated URL Pattern",
                category="Obfuscation",
                severity="high",
                points=22,
                detail="URL uses encoding patterns that can conceal redirects or keywords: " + ", ".join(obfuscation_reasons) + ".",
                matched_text=", ".join(obfuscation_reasons),
            )
        )

    raw_score = sum(item.points for item in evidence)
    risk_score = min(100, raw_score)
    verdict = _verdict_from_score(risk_score)

    if verdict == "HIGH RISK":
        explanation = (
            f"Local heuristic analysis assigned a risk score of {risk_score}/100 (HIGH RISK) "
            f"based on {len(evidence)} strong indicator(s) commonly associated with phishing or malicious URLs."
        )
        actions = [
            "Do not open the link or enter any credentials or payment information.",
            "If this claims to be from a known organization, navigate to their official website manually.",
            "Report and block the sender if received via email or SMS.",
        ]
    elif verdict == "SUSPICIOUS":
        explanation = (
            f"Local heuristic analysis assigned a risk score of {risk_score}/100 (SUSPICIOUS) "
            f"due to {len(evidence)} structural or keyword indicator(s) that warrant caution."
        )
        actions = [
            "Verify the exact domain name before clicking or logging in.",
            "Avoid submitting sensitive data until the link's origin is confirmed.",
            "Check the sender's address or message context for additional red flags.",
        ]
    else:
        explanation = (
            f"Local heuristic analysis assigned a risk score of {risk_score}/100 (LOW RISK). "
            "No major local heuristic red flags were triggered; however, absence of heuristic indicators "
            "does NOT guarantee this URL is safe—new or clean-looking phishing domains may still exist."
        )
        actions = [
            "Confirm you expected this link and trust the sender before proceeding.",
            "Double-check the domain spelling and HTTPS certificate in your browser.",
        ]

    return AnalysisResult(
        scan_type="url",
        submitted_input=submitted,
        risk_score=risk_score,
        verdict=verdict,
        detection_source="Local Heuristic Engine",
        evidence=evidence,
        explanation=explanation,
        recommended_actions=actions,
        timestamp=_utc_now_iso(),
    )


def analyze_message(message: str) -> AnalysisResult:
    submitted = message.strip()
    evidence: list[EvidenceItem] = []

    for rule in MESSAGE_RULES:
        matches: list[str] = []
        for pattern in rule["patterns"]:
            for m in re.finditer(pattern, submitted, re.IGNORECASE):
                snippet = m.group(0).strip()
                if snippet.lower() not in [x.lower() for x in matches]:
                    matches.append(snippet)
        if matches:
            evidence.append(
                EvidenceItem(
                    id=rule["id"],
                    title=rule["title"],
                    category=rule["category"],
                    severity=rule["severity"],
                    points=rule["points"],
                    detail=rule["detail"],
                    matched_text=", ".join(matches[:4]),
                )
            )

    # Extract URLs inside the message and analyze them with the local URL engine
    found_urls = URL_EXTRACT_REGEX.findall(submitted)
    if found_urls:
        seen_urls: set[str] = set()
        for url in found_urls:
            clean_url = url.rstrip(".,;:!?")
            if clean_url in seen_urls:
                continue
            seen_urls.add(clean_url)
            url_res = analyze_url(clean_url)
            if url_res.risk_score >= 30:
                evidence.append(
                    EvidenceItem(
                        id="msg_suspicious_url",
                        title="Suspicious URL Embedded in Message",
                        category="Embedded URL",
                        severity="high" if url_res.risk_score >= 60 else "medium",
                        points=25 if url_res.risk_score >= 60 else 15,
                        detail=f"Embedded link '{clean_url}' scored {url_res.risk_score}/100 ({url_res.verdict}) in local URL heuristics.",
                        matched_text=clean_url,
                    )
                )
            else:
                evidence.append(
                    EvidenceItem(
                        id="msg_contains_url",
                        title="External Link Present in Message",
                        category="Embedded URL",
                        severity="low",
                        points=5,
                        detail=f"Message contains an embedded link ('{clean_url}'). Verify destination before clicking.",
                        matched_text=clean_url,
                    )
                )

    raw_score = sum(item.points for item in evidence)
    risk_score = min(100, raw_score)
    verdict = _verdict_from_score(risk_score)

    if verdict == "HIGH RISK":
        explanation = (
            f"Local heuristic analysis assigned a risk score of {risk_score}/100 (HIGH RISK). "
            f"The message exhibits {len(evidence)} social-engineering or scam indicator(s) such as urgency, "
            "credential requests, threats, or suspicious links."
        )
        actions = [
            "Do not click any links, reply, or share OTPs, passwords, or payment details.",
            "Contact the claimed organization directly using an official phone number or website.",
            "Delete the message and block/report the sender.",
        ]
    elif verdict == "SUSPICIOUS":
        explanation = (
            f"Local heuristic analysis assigned a risk score of {risk_score}/100 (SUSPICIOUS). "
            f"The message triggered {len(evidence)} heuristic indicator(s) commonly seen in phishing or scam outreach."
        )
        actions = [
            "Verify the sender independently before taking any requested action.",
            "Do not share sensitive codes, passwords, or financial information.",
        ]
    else:
        explanation = (
            f"Local heuristic analysis assigned a risk score of {risk_score}/100 (LOW RISK). "
            "Few or no local scam-language indicators were detected; however, absence of heuristic flags "
            "does NOT guarantee the message is legitimate."
        )
        actions = [
            "Confirm the sender identity if the message asks for money, credentials, or personal data.",
        ]

    return AnalysisResult(
        scan_type="message",
        submitted_input=submitted,
        risk_score=risk_score,
        verdict=verdict,
        detection_source="Local Heuristic Engine",
        evidence=evidence,
        explanation=explanation,
        recommended_actions=actions,
        timestamp=_utc_now_iso(),
    )
