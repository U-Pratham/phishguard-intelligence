import ipaddress
import math
import re
from collections import Counter
from urllib.parse import parse_qs, urlparse

SUSPICIOUS_KEYWORDS = (
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
)

SUSPICIOUS_TLDS = {
    "tk",
    "ml",
    "ga",
    "cf",
    "gq",
    "xyz",
    "top",
    "click",
    "link",
    "work",
    "zip",
    "mov",
    "club",
    "online",
    "site",
    "icu",
    "buzz",
    "info",
    "support",
    "cfd",
    "sbs",
}

FEATURE_NAMES = [
    "url_length",
    "domain_length",
    "num_dots",
    "num_subdomains",
    "num_hyphens",
    "num_digits",
    "num_special_chars",
    "num_params",
    "path_length",
    "has_https",
    "is_ip_host",
    "has_at_symbol",
    "suspicious_keyword_count",
    "encoding_count",
    "url_entropy",
    "suspicious_tld",
]

FEATURE_LABELS = {
    "url_length": "URL Length",
    "domain_length": "Domain Length",
    "num_dots": "Dot Count",
    "num_subdomains": "Subdomain Count",
    "num_hyphens": "Hyphen Count",
    "num_digits": "Digit Count",
    "num_special_chars": "Special Characters",
    "num_params": "Query Parameters",
    "path_length": "Path Length",
    "has_https": "HTTPS Present",
    "is_ip_host": "IP Address Hostname",
    "has_at_symbol": "@ Symbol Present",
    "suspicious_keyword_count": "Suspicious Keywords",
    "encoding_count": "URL Encoding Count",
    "url_entropy": "URL Shannon Entropy",
    "suspicious_tld": "Suspicious TLD",
}

_PERCENT_ENC_RE = re.compile(r"%[0-9a-fA-F]{2}")
_SPECIAL_CHAR_SET = set("?=&%@_-~!$+*,;#")


def _shannon_entropy(text: str) -> float:
    if not text:
        return 0.0
    counts = Counter(text)
    length = len(text)
    entropy = 0.0
    for count in counts.values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 4)


def _is_ip_host(host: str) -> bool:
    if not host:
        return False
    cleaned = host.strip("[]")
    try:
        ipaddress.ip_address(cleaned)
        return True
    except ValueError:
        pass
    if re.fullmatch(
        r"(?:0x[0-9a-f]+|0[0-7]+|\d+)(?:\.(?:0x[0-9a-f]+|0[0-7]+|\d+)){0,3}",
        cleaned,
        re.IGNORECASE,
    ):
        if cleaned.isdigit() and len(cleaned) >= 8:
            return True
        if "." in cleaned and all(
            part.startswith("0x") or part.isdigit() for part in cleaned.split(".")
        ):
            return True
    return False


def extract_url_features(raw_url: str) -> dict[str, float]:
    """Extract URL-only structural and lexical features consistently for training & inference."""
    submitted = (raw_url or "").strip()
    parse_target = submitted if "://" in submitted else f"http://{submitted}"
    try:
        parsed = urlparse(parse_target)
    except ValueError:
        parsed = urlparse("http://invalid-url")

    host = (parsed.hostname or "").lower()
    scheme = parsed.scheme.lower() if "://" in submitted else ""
    is_ip = _is_ip_host(host)

    # Strip cosmetic leading 'www.' so apex domains (e.g. google.com vs www.google.com)
    # generalize consistently and don't overfit to dataset-specific 'www.' prefixes.
    normalized_host = host[4:] if (not is_ip and host.startswith("www.") and host.count(".") >= 2) else host
    normalized_url = (
        submitted.replace("://www.", "://", 1)
        if (not is_ip and "://www." in submitted.lower() and normalized_host != host)
        else submitted
    )

    labels = [lbl for lbl in normalized_host.split(".") if lbl] if normalized_host and not is_ip else []
    num_subdomains = max(0, len(labels) - 2) if labels else 0
    tld = labels[-1] if len(labels) >= 2 else ""

    lowered_norm = normalized_url.lower()
    kw_count = sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in lowered_norm)
    enc_count = len(_PERCENT_ENC_RE.findall(normalized_url))
    num_params = len(parse_qs(parsed.query, keep_blank_values=True)) if parsed.query else 0

    return {
        "url_length": float(len(normalized_url)),
        "domain_length": float(len(normalized_host)),
        "num_dots": float(normalized_url.count(".")),
        "num_subdomains": float(num_subdomains),
        "num_hyphens": float(normalized_url.count("-")),
        "num_digits": float(sum(1 for ch in normalized_url if ch.isdigit())),
        "num_special_chars": float(sum(1 for ch in normalized_url if ch in _SPECIAL_CHAR_SET)),
        "num_params": float(num_params),
        "path_length": float(len(parsed.path or "")),
        "has_https": 1.0 if scheme == "https" else 0.0,
        "is_ip_host": 1.0 if is_ip else 0.0,
        "has_at_symbol": 1.0 if "@" in normalized_url else 0.0,
        "suspicious_keyword_count": float(kw_count),
        "encoding_count": float(enc_count),
        "url_entropy": _shannon_entropy(normalized_url),
        "suspicious_tld": 1.0 if tld in SUSPICIOUS_TLDS else 0.0,
    }


def features_to_vector(feature_dict: dict[str, float]) -> list[float]:
    return [float(feature_dict[name]) for name in FEATURE_NAMES]
