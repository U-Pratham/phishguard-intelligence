const SIMPLE_VERDICT_MAP = {
  "LOW RISK": {
    headline: "Looks relatively safe",
    emoji: "🟢",
    subtitle:
      "We didn't find obvious scam or phishing warning signs. Still, only trust links and messages from people or companies you know.",
    badgeClass: "border-emerald-500/40 bg-emerald-500/15 text-emerald-500",
    cardClass: "border-emerald-500/35 bg-emerald-500/5",
    iconColor: "text-emerald-500",
  },
  SUSPICIOUS: {
    headline: "Be cautious",
    emoji: "🟡",
    subtitle:
      "This has warning signs that are common in scam links or messages. Double-check who sent it before you click or reply.",
    badgeClass: "border-amber-500/40 bg-amber-500/15 text-amber-500",
    cardClass: "border-amber-500/35 bg-amber-500/5",
    iconColor: "text-amber-500",
  },
  "HIGH RISK": {
    headline: "Likely scam / dangerous",
    emoji: "🔴",
    subtitle:
      "Multiple strong warning signs were found. Do not click this link, reply, or share any personal information.",
    badgeClass: "border-rose-500/40 bg-rose-500/15 text-rose-500",
    cardClass: "border-rose-500/35 bg-rose-500/5",
    iconColor: "text-rose-500",
  },
};

const PLAIN_EVIDENCE_BY_ID = {
  intel_urlhaus_confirmed:
    "Security threat databases have already reported this exact link as dangerous.",
  ml_url_phishing_prediction:
    "Our automated pattern checker noticed this link's structure looks similar to known scam links.",
  url_no_https:
    "This link does not use a secure, encrypted connection (HTTPS), which legitimate login and banking sites always use.",
  url_ip_host:
    "This link uses a raw network address (numbers) instead of a normal website name—a common trick to hide who runs the site.",
  url_very_long:
    "This link is unusually long, which scammers sometimes use to hide the real website address.",
  url_long:
    "This link is longer than normal, so it's worth checking the website name carefully.",
  url_excessive_subdomains:
    "This link stacks extra words before the real website name to make it look like a trusted brand.",
  url_shortener:
    "This is a shortened link that hides the real destination website until you click it.",
  url_brand_impersonation:
    "This link includes a well-known brand name, but it is NOT the company's official website.",
  url_typosquat:
    "This website name uses lookalike letters or numbers to imitate a well-known brand.",
  url_suspicious_chars:
    "This link contains unusual symbols or port numbers often used to disguise the real destination.",
  url_suspicious_keywords:
    "This link uses urgent or account-related words (like 'login', 'verify', or 'update') commonly seen in fake login pages.",
  url_obfuscation:
    "Parts of this link are encoded or scrambled, which can hide where the link actually goes.",
  url_dangerous_scheme:
    "This is a special browser command link rather than a normal webpage and could run unwanted code.",
  msg_urgency:
    "The message pressures you to act immediately—scammers use urgency so you don't stop to think.",
  msg_account_threat:
    "The message threatens that your account will be locked or closed to scare you into clicking.",
  msg_credential_request:
    "The message asks for a password, PIN, or one-time code (OTP). Real companies will never ask you to share these.",
  msg_prize_scam:
    "The message promises an unexpected prize, gift, or reward—a classic scam lure.",
  msg_payment_demand:
    "The message demands immediate payment, fees, gift cards, or cryptocurrency.",
  msg_impersonation:
    "The message claims to be from a bank, delivery service, or support team using generic phrasing.",
  msg_suspicious_url:
    "The message contains a link that triggered multiple safety warning signs.",
  msg_contains_url:
    "The message includes an external link. Make sure you know where it leads before tapping it.",
};

export function getSimpleVerdict(verdict) {
  return SIMPLE_VERDICT_MAP[verdict] || SIMPLE_VERDICT_MAP["LOW RISK"];
}

export function translateEvidenceToPlainEnglish(evidence = []) {
  const seen = new Set();
  const reasons = [];

  for (const item of evidence) {
    const plain =
      PLAIN_EVIDENCE_BY_ID[item.id] ||
      "This item showed patterns that are commonly seen in suspicious links or scam messages.";
    if (!seen.has(plain)) {
      seen.add(plain);
      reasons.push({
        id: item.id,
        text: plain,
        severity: item.severity,
      });
    }
  }

  return reasons;
}

export const CLICKED_HELP_SCENARIOS = [
  {
    id: "opened_only",
    label: "I only opened the link (didn't type anything)",
    advice: [
      "Close the browser tab right away.",
      "Do not tap any buttons, pop-ups, or download prompts on that page.",
      "If you're unsure, run a quick scan with your device's built-in antivirus or security check.",
    ],
  },
  {
    id: "entered_password",
    label: "I entered my password or login details",
    advice: [
      "Change that password immediately on the real, official website (type the address yourself—don't use the link).",
      "If you use that same password on other accounts (email, banking, social media), change those too.",
      "Turn on two-factor authentication (2FA) if it isn't already enabled.",
      "Check your account's recent login activity and sign out of any unfamiliar devices.",
    ],
  },
  {
    id: "entered_otp",
    label: "I shared a one-time code (OTP) or PIN",
    advice: [
      "Contact your bank or service provider right away using their official phone number or app.",
      "Change your account password and PIN immediately.",
      "Watch your recent transactions and alerts closely for any unauthorized activity.",
    ],
  },
  {
    id: "downloaded_file",
    label: "I downloaded or opened a file",
    advice: [
      "Do not open the file again or grant it any permissions.",
      "Disconnect from the internet if you suspect the device is acting strangely.",
      "Run a full scan with Windows Security (or your device's trusted antivirus) and delete the downloaded file.",
    ],
  },
  {
    id: "paid_money",
    label: "I sent money or entered card/bank details",
    advice: [
      "Call your bank or card issuer immediately using the number on the back of your card to freeze or block the card.",
      "Report the transaction as fraud as soon as possible so they can help protect your account.",
      "Keep screenshots of the message or link for your bank's fraud report.",
    ],
  },
];
