export const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { id: "hi", label: "हिन्दी (Hindi)" },
];

export const LANG_STORAGE_KEY = "phishguard_simple_lang";

export function getInitialLanguage() {
  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (LANGUAGES.some((l) => l.id === saved)) {
      return saved;
    }
  } catch {
    // ignore storage errors
  }
  return "en";
}

export const SIMPLE_TRANSLATIONS = {
  en: {
    langLabel: "Language",
    nav: {
      home: "Home",
      link: "Check a Link",
      message: "Check a Message",
      help: "I already clicked a suspicious link",
      privacy: "Privacy & How it works",
    },
    hero: {
      badge: "Free Public Safety Checker",
      title: "Check if a link or message is suspicious",
      subtitle:
        "Think a message might be a scam? Check suspicious links, emails, and texts before you click. We explain the risks in plain language.",
      linkCardTitle: "Check a Link",
      linkCardDesc: "Paste a website link to see whether it looks suspicious.",
      linkCardCta: "Check a website link",
      msgCardTitle: "Check a Message",
      msgCardDesc: "Paste an SMS, email, or WhatsApp message to check for scam warning signs.",
      msgCardCta: "Check a message",
    },
    checker: {
      switchToMsg: "Switch to Check a Message",
      switchToLink: "Switch to Check a Link",
      linkTitle: "Check if a link is suspicious",
      linkDesc: "Paste the website address you received before opening it.",
      linkLabel: "Website link",
      linkPlaceholder: "Example: https://company.com/login or bit.ly/3x...",
      msgTitle: "Check a suspicious message",
      msgDesc: "Paste the complete SMS, email, or WhatsApp message below.",
      msgLabel: "Complete message text",
      msgPlaceholder:
        "Example: URGENT: Your bank account will be locked today. Reply with your OTP or click http://...",
      privacyBanner:
        "Do not include your real passwords, OTPs, bank details, or private personal information.",
      examplesLabel: "Try an example:",
      exNormalUrl: "Normal website (Google)",
      exFakePaypal: "Fake PayPal login link",
      exIpUrl: "Suspicious numeric IP link",
      exBankSms: "Fake bank suspension SMS",
      exPrizeSms: "Prize & OTP scam text",
      exNormalMsg: "Normal message",
      checkBtn: "Check Now",
      checkingBtn: "Checking...",
      emptyError: "Please paste a link or message before checking.",
      genericError: "Could not complete the safety check. Please try again.",
    },
    results: {
      badge: "Safety Check Result",
      checkedItem: "Checked item:",
      whatWeFound: "What we found",
      whyDangerous: "Why this might be dangerous",
      whatToDo: "What you should do",
      whatWeChecked: "What we checked",
      limitationsTitle: "Important limitations",
      moreDetails: "More details",
      viewAdvanced: "View Advanced Analysis",
      checkedAt: "Checked at:",
      noFlagsFound:
        "We did not find common scam patterns, fake brand tricks, or known malicious listings.",
      whySafeNote:
        "Even when a check looks safe, scammers can create brand-new links at any time. Only trust messages from senders you know.",
      limitationsText:
        "Automated checks look for common scam patterns and known threat databases. A 'Looks relatively safe' result cannot guarantee a site or sender is 100% trustworthy.",
      verdicts: {
        "LOW RISK": {
          headline: "Looks relatively safe",
          emoji: "🟢",
          subtitle:
            "We didn't find obvious scam warning signs. Still, only trust links and messages from people or companies you know.",
        },
        SUSPICIOUS: {
          headline: "Be cautious",
          emoji: "🟡",
          subtitle:
            "This has warning signs that are common in scam links or messages. Verify who sent it before you click or reply.",
        },
        "HIGH RISK": {
          headline: "Likely dangerous",
          emoji: "🔴",
          subtitle:
            "Multiple strong warning signs were found. Do not click this link, reply, or share any personal information.",
        },
      },
      checkedItems: {
        url: [
          "Link structure, domain spelling, and hidden redirect tricks",
          "Automated comparison against known safe and phishing link patterns",
          "Known malicious link database lookup (when available)",
        ],
        message: [
          "Urgent pressure, account threats, and requests for passwords or OTPs",
          "Fake prize, payment, or brand impersonation wording",
          "Any web links included inside the message",
        ],
      },
      actionsByVerdict: {
        "LOW RISK": [
          "Confirm you expected this link or message from the sender.",
          "If it asks you to log in, check the website address carefully in your browser.",
        ],
        SUSPICIOUS: [
          "Do not enter passwords, OTPs, or payment details until you verify the sender.",
          "Visit the organization's official website directly instead of using this link.",
        ],
        "HIGH RISK": [
          "Do not open the link, reply to the message, or download any files.",
          "Never share your OTP, password, PIN, or bank details.",
          "If needed, contact the company using their official phone number or app.",
          "Delete the message and block or report the sender.",
        ],
      },
      reasons: {
        intel_urlhaus_confirmed:
          "Security threat databases have already reported this exact link as dangerous.",
        ml_url_phishing_prediction:
          "Our automated pattern checker noticed this link's structure looks similar to known scam links.",
        url_no_https:
          "This link does not use a secure, encrypted connection (HTTPS), which real login and banking sites use.",
        url_ip_host:
          "This link uses a raw number address instead of a normal website name—a common trick to hide who runs the site.",
        url_very_long:
          "This link is unusually long, which scammers sometimes use to hide the real website address.",
        url_long:
          "This link is longer than normal, so check the website name carefully.",
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
          "This link uses account or login words (such as 'login', 'verify', or 'update') common in fake sign-in pages.",
        url_obfuscation:
          "Parts of this link are encoded or scrambled, which can hide where it actually goes.",
        url_dangerous_scheme:
          "This is a special browser command link rather than a normal webpage.",
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
      },
    },
    help: {
      title: "I already clicked a suspicious link",
      subtitle:
        "Stay calm. Choose what happened below for immediate, practical steps to protect yourself.",
      warning:
        "Never enter your real password, OTP, PIN, or bank details into any online checker.",
      recommendedHeading: "Recommended next steps:",
      scenarios: [
        {
          id: "opened_only",
          label: "I only opened the link",
          advice: [
            "Close the browser tab right away.",
            "Do not tap any buttons, pop-ups, or download prompts on that page.",
            "Run a quick security scan using your device's built-in antivirus.",
          ],
        },
        {
          id: "entered_password",
          label: "I entered my password",
          advice: [
            "Change that password immediately on the real, official website (type the address yourself).",
            "If you reuse that password on email, banking, or social media, change those too.",
            "Turn on two-factor authentication (2FA) and sign out of unfamiliar devices.",
          ],
        },
        {
          id: "entered_otp",
          label: "I entered an OTP",
          advice: [
            "Contact your bank or service provider right away using their official phone number or app.",
            "Change your account password and PIN immediately.",
            "Watch your recent transactions and SMS alerts for any unauthorized activity.",
          ],
        },
        {
          id: "entered_bank",
          label: "I entered bank/payment details",
          advice: [
            "Call your bank or card issuer immediately using the number on the back of your card to freeze or block it.",
            "Report the payment as fraud right away so they can help protect your account.",
            "Save screenshots of the scam message or link for your bank's fraud report.",
          ],
        },
        {
          id: "downloaded_file",
          label: "I downloaded a file",
          advice: [
            "Do not open the downloaded file or grant it any permissions.",
            "Disconnect from the internet if your device starts acting strangely.",
            "Run a full scan with Windows Security or a trusted antivirus and delete the file.",
          ],
        },
        {
          id: "granted_permissions",
          label: "I granted permissions",
          advice: [
            "Open your browser or phone settings and revoke site/app permissions (notifications, camera, location, accessibility, or device admin).",
            "Uninstall any unfamiliar app or browser extension that was just added.",
            "Restart your device and run a full security scan.",
          ],
        },
      ],
    },
    privacy: {
      title: "Privacy & How PhishGuard Works",
      subtitle: "Honest information about what is checked and stored when you run a scan.",
      cards: [
        {
          title: "1. What information is analyzed",
          body: "Only the website link or message text you paste into the checker is analyzed. PhishGuard never opens or downloads the suspicious webpage on your device.",
        },
        {
          title: "2. External threat-intelligence checks",
          body: "When external threat intelligence (URLhaus) is enabled on the server, submitted links—and web links found inside messages—are sent to URLhaus to check if they are already reported as malicious.",
        },
        {
          title: "3. What is stored in scan history",
          body: "Submitted links, messages, and analysis results are saved in the local SQLite database so researchers can review threat trends and statistics in Analyst Mode.",
        },
        {
          title: "4. How to protect your privacy",
          body: "Never paste real passwords, OTPs, bank account numbers, Aadhaar/SSN, or private personal messages into this tool. Remove personal details before checking a message.",
        },
      ],
    },
  },

  kn: {
    langLabel: "ಭಾಷೆ",
    nav: {
      home: "ಮುಖಪುಟ",
      link: "ಲಿಂಕ್ ಪರಿಶೀಲಿಸಿ",
      message: "ಸಂದೇಶ ಪರಿಶೀಲಿಸಿ",
      help: "ನಾನು ಈಗಾಗಲೇ ಅನುಮಾನಾಸ್ಪದ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿದ್ದೇನೆ",
      privacy: "ಗೌಪ್ಯತೆ ಮತ್ತು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
    },
    hero: {
      badge: "ಉಚಿತ ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತಾ ಪರಿಶೀಲನೆ",
      title: "ಲಿಂಕ್ ಅಥವಾ ಸಂದೇಶ ಅನುಮಾನಾಸ್ಪದವಾಗಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ",
      subtitle:
        "ಯಾವುದಾದರೂ ಸಂದೇಶ ಮೋಸದಂತೆ ಕಾಣುತ್ತಿದೆಯೇ? ಕ್ಲಿಕ್ ಮಾಡುವ ಮೊದಲು ಅನುಮಾನಾಸ್ಪದ ಲಿಂಕ್‌ಗಳು, ಇಮೇಲ್‌ಗಳು ಮತ್ತು SMS ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ. ನಾವು ಅಪಾಯಗಳನ್ನು ಸರಳ ಕನ್ನಡದಲ್ಲಿ ವಿವರಿಸುತ್ತೇವೆ.",
      linkCardTitle: "ಲಿಂಕ್ ಪರಿಶೀಲಿಸಿ",
      linkCardDesc: "ವೆಬ್‌ಸೈಟ್ ಲಿಂಕ್ ಸುರಕ್ಷಿತವಾಗಿದೆಯೇ ಅಥವಾ ಅನುಮಾನಾಸ್ಪದವಾಗಿದೆಯೇ ಎಂದು ನೋಡಿ.",
      linkCardCta: "ವೆಬ್‌ಸೈಟ್ ಲಿಂಕ್ ಪರಿಶೀಲಿಸಿ",
      msgCardTitle: "ಸಂದೇಶ ಪರಿಶೀಲಿಸಿ",
      msgCardDesc: "ಮೋಸದ ಸೂಚನೆಗಳಿಗಾಗಿ SMS, ಇಮೇಲ್ ಅಥವಾ WhatsApp ಸಂದೇಶವನ್ನು ಅಂಟಿಸಿ.",
      msgCardCta: "ಸಂದೇಶವನ್ನು ಪರಿಶೀಲಿಸಿ",
    },
    checker: {
      switchToMsg: "ಸಂದೇಶ ಪರಿಶೀಲನೆಗೆ ಬದಲಿಸಿ",
      switchToLink: "ಲಿಂಕ್ ಪರಿಶೀಲನೆಗೆ ಬದಲಿಸಿ",
      linkTitle: "ಲಿಂಕ್ ಅನುಮಾನಾಸ್ಪದವಾಗಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ",
      linkDesc: "ತೆರೆಯುವ ಮೊದಲು ನಿಮಗೆ ಬಂದ ವೆಬ್‌ಸೈಟ್ ಲಿಂಕ್ ಅನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ.",
      linkLabel: "ವೆಬ್‌ಸೈಟ್ ಲಿಂಕ್",
      linkPlaceholder: "ಉದಾಹರಣೆ: https://company.com/login ಅಥವಾ bit.ly/3x...",
      msgTitle: "ಅನುಮಾನಾಸ್ಪದ ಸಂದೇಶವನ್ನು ಪರಿಶೀಲಿಸಿ",
      msgDesc: "ಸಂಪೂರ್ಣ SMS, ಇಮೇಲ್ ಅಥವಾ WhatsApp ಸಂದೇಶವನ್ನು ಕೆಳಗೆ ಅಂಟಿಸಿ.",
      msgLabel: "ಸಂಪೂರ್ಣ ಸಂದೇಶದ ಪಠ್ಯ",
      msgPlaceholder:
        "ಉದಾಹರಣೆ: ತುರ್ತು: ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆ ಇಂದು ಲಾಕ್ ಆಗುತ್ತದೆ. OTP ಕಳುಹಿಸಿ ಅಥವಾ http://... ಕ್ಲಿಕ್ ಮಾಡಿ",
      privacyBanner:
        "ನಿಮ್ಮ ನಿಜವಾದ ಪಾಸ್‌ವರ್ಡ್‌ಗಳು, OTP, ಬ್ಯಾಂಕ್ ವಿವರಗಳು ಅಥವಾ ಖಾಸಗಿ ಮಾಹಿತಿಯನ್ನು ಹಾಕಬೇಡಿ.",
      examplesLabel: "ಉದಾಹರಣೆ ಪ್ರಯತ್ನಿಸಿ:",
      exNormalUrl: "ಸಾಮಾನ್ಯ ವೆಬ್‌ಸೈಟ್ (Google)",
      exFakePaypal: "ನಕಲಿ PayPal ಲಾಗಿನ್ ಲಿಂಕ್",
      exIpUrl: "ಅನುಮಾನಾಸ್ಪದ IP ಸಂಖ್ಯೆಯ ಲಿಂಕ್",
      exBankSms: "ನಕಲಿ ಬ್ಯಾಂಕ್ SMS",
      exPrizeSms: "ಬಹುಮಾನ ಮತ್ತು OTP ಮೋಸದ ಸಂದೇಶ",
      exNormalMsg: "ಸಾಮಾನ್ಯ ಸಂದೇಶ",
      checkBtn: "ಈಗ ಪರಿಶೀಲಿಸಿ",
      checkingBtn: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
      emptyError: "ಪರಿಶೀಲಿಸುವ ಮೊದಲು ದಯವಿಟ್ಟು ಲಿಂಕ್ ಅಥವಾ ಸಂದೇಶವನ್ನು ಅಂಟಿಸಿ.",
      genericError: "ಸುರಕ್ಷತಾ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    },
    results: {
      badge: "ಸುರಕ್ಷತಾ ಪರಿಶೀಲನೆಯ ಫಲಿತಾಂಶ",
      checkedItem: "ಪರಿಶೀಲಿಸಿದ ವಿಷಯ:",
      whatWeFound: "ನಾವು ಕಂಡುಕೊಂಡದ್ದು",
      whyDangerous: "ಇದು ಏಕೆ ಅಪಾಯಕಾರಿಯಾಗಿರಬಹುದು",
      whatToDo: "ನೀವು ಏನು ಮಾಡಬೇಕು",
      whatWeChecked: "ನಾವು ಏನು ಪರಿಶೀಲಿಸಿದ್ದೇವೆ",
      limitationsTitle: "ಪ್ರಮುಖ ಮಿತಿಗಳು",
      moreDetails: "ಹೆಚ್ಚಿನ ವಿವರಗಳು",
      viewAdvanced: "ಸುಧಾರಿತ ವಿಶ್ಲೇಷಣೆ ನೋಡಿ (Advanced Analysis)",
      checkedAt: "ಪರಿಶೀಲಿಸಿದ ಸಮಯ:",
      noFlagsFound:
        "ಸಾಮಾನ್ಯ ಮೋಸದ ಮಾದರಿಗಳು, ನಕಲಿ ಬ್ರಾಂಡ್ ತಂತ್ರಗಳು ಅಥವಾ ತಿಳಿದಿರುವ ಅಪಾಯಕಾರಿ ಪಟ್ಟಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
      whySafeNote:
        "ಫಲಿತಾಂಶ ಸುರಕ್ಷಿತವಾಗಿ ಕಂಡರೂ, ವಂಚಕರು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಹೊಸ ಲಿಂಕ್‌ಗಳನ್ನು ರಚಿಸಬಹುದು. ನಿಮಗೆ ತಿಳಿದಿರುವ ಕಳುಹಿಸುವವರನ್ನು ಮಾತ್ರ ನಂಬಿರಿ.",
      limitationsText:
        "ಸ್ವಯಂಚಾಲಿತ ಪರಿಶೀಲನೆಗಳು ಸಾಮಾನ್ಯ ಮೋಸದ ಮಾದರಿಗಳು ಮತ್ತು ತಿಳಿದಿರುವ ಡೇಟಾಬೇಸ್‌ಗಳನ್ನು ಮಾತ್ರ ನೋಡುತ್ತವೆ. 'ಸುರಕ್ಷಿತವಾಗಿ ಕಾಣುತ್ತದೆ' ಎಂದರೆ 100% ಖಾತ್ರಿ ಎಂದಲ್ಲ.",
      verdicts: {
        "LOW RISK": {
          headline: "ತುಲನಾತ್ಮಕವಾಗಿ ಸುರಕ್ಷಿತವಾಗಿ ಕಾಣುತ್ತದೆ",
          emoji: "🟢",
          subtitle:
            "ಸ್ಪಷ್ಟ ಮೋಸದ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಆದರೂ ನಿಮಗೆ ಪರಿಚಿತವಿರುವ ವ್ಯಕ್ತಿ ಅಥವಾ ಸಂಸ್ಥೆಯ ಲಿಂಕ್‌ಗಳನ್ನು ಮಾತ್ರ ನಂಬಿರಿ.",
        },
        SUSPICIOUS: {
          headline: "ಎಚ್ಚರಿಕೆಯಿಂದಿರಿ",
          emoji: "🟡",
          subtitle:
            "ಇದರಲ್ಲಿ ಮೋಸದ ಲಿಂಕ್ ಅಥವಾ ಸಂದೇಶಗಳಲ್ಲಿ ಕಾಣುವ ಕೆಲವು ಎಚ್ಚರಿಕೆಯ ಚಿಹ್ನೆಗಳಿವೆ. ಕ್ಲಿಕ್ ಮಾಡುವ ಮೊದಲು ಪರಿಶೀಲಿಸಿ.",
        },
        "HIGH RISK": {
          headline: "ಅಪಾಯಕಾರಿ ಸಾಧ್ಯತೆ ಹೆಚ್ಚು",
          emoji: "🔴",
          subtitle:
            "ಹಲವು ಬಲವಾದ ಅಪಾಯದ ಸೂಚನೆಗಳು ಕಂಡುಬಂದಿವೆ. ಈ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ, ಉತ್ತರಿಸಬೇಡಿ ಮತ್ತು ಯಾವುದೇ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.",
        },
      },
      checkedItems: {
        url: [
          "ಲಿಂಕ್ ರಚನೆ, ಡೊಮೇನ್ ಕಾಗುಣಿತ ಮತ್ತು ಗುಪ್ತ ತಂತ್ರಗಳು",
          "ತಿಳಿದಿರುವ ಸುರಕ್ಷಿತ ಮತ್ತು ಮೋಸದ ಲಿಂಕ್ ಮಾದರಿಗಳೊಂದಿಗೆ ಹೋಲಿಕೆ",
          "ಅಪಾಯಕಾರಿ ಲಿಂಕ್ ಡೇಟಾಬೇಸ್ ಪರಿಶೀಲನೆ (ಲಭ್ಯವಿದ್ದಾಗ)",
        ],
        message: [
          "ತುರ್ತು ಒತ್ತಡ, ಖಾತೆ ಬೆದರಿಕೆಗಳು ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್/OTP ಕೇಳುವಿಕೆ",
          "ನಕಲಿ ಬಹುಮಾನ, ಹಣ ಪಾವತಿ ಅಥವಾ ಬ್ರಾಂಡ್ ನಕಲು ಪದಗಳು",
          "ಸಂದೇಶದ ಒಳಗಿರುವ ವೆಬ್ ಲಿಂಕ್‌ಗಳು",
        ],
      },
      actionsByVerdict: {
        "LOW RISK": [
          "ಈ ಲಿಂಕ್ ಅಥವಾ ಸಂದೇಶವನ್ನು ನೀವು ನಿರೀಕ್ಷಿಸಿದ್ದೀರಾ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
          "ಲಾಗಿನ್ ಕೇಳಿದರೆ, ಬ್ರೌಸರ್‌ನಲ್ಲಿ ವೆಬ್‌ಸೈಟ್ ವಿಳಾಸವನ್ನು ಜಾಗರೂಕತೆಯಿಂದ ಗಮನಿಸಿ.",
        ],
        SUSPICIOUS: [
          "ಕಳುಹಿಸಿದವರನ್ನು ದೃಢಪಡಿಸುವವರೆಗೆ ಪಾಸ್‌ವರ್ಡ್, OTP ಅಥವಾ ಬ್ಯಾಂಕ್ ವಿವರಗಳನ್ನು ನೀಡಬೇಡಿ.",
          "ಈ ಲಿಂಕ್ ಬಳಸುವ ಬದಲು ಸಂಸ್ಥೆಯ ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್‌ಗೆ ನೇರವಾಗಿ ಭೇಟಿ ನೀಡಿ.",
        ],
        "HIGH RISK": [
          "ಲಿಂಕ್ ತೆರೆಯಬೇಡಿ, ಸಂದೇಶಕ್ಕೆ ಉತ್ತರಿಸಬೇಡಿ ಮತ್ತು ಯಾವುದೇ ಫೈಲ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಬೇಡಿ.",
          "ನಿಮ್ಮ OTP, ಪಾಸ್‌ವರ್ಡ್, PIN ಅಥವಾ ಬ್ಯಾಂಕ್ ವಿವರಗಳನ್ನು ಎಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.",
          "ಅಗತ್ಯವಿದ್ದರೆ ಕಂಪನಿಯ ಅಧಿಕೃತ ಫೋನ್ ಸಂಖ್ಯೆ ಅಥವಾ ಆ್ಯಪ್ ಮೂಲಕ ಸಂಪರ್ಕಿಸಿ.",
          "ಸಂದೇಶವನ್ನು ಅಳಿಸಿ ಮತ್ತು ಕಳುಹಿಸಿದವರನ್ನು ಬ್ಲಾಕ್ ಅಥವಾ ರಿಪೋರ್ಟ್ ಮಾಡಿ.",
        ],
      },
      reasons: {
        intel_urlhaus_confirmed:
          "ಸುರಕ್ಷತಾ ಡೇಟಾಬೇಸ್‌ಗಳು ಈಗಾಗಲೇ ಈ ಲಿಂಕ್ ಅನ್ನು ಅಪಾಯಕಾರಿ ಎಂದು ವರದಿ ಮಾಡಿವೆ.",
        ml_url_phishing_prediction:
          "ನಮ್ಮ ಸ್ವಯಂಚಾಲಿತ ಮಾದರಿ ಪರಿಶೀಲಕವು ಈ ಲಿಂಕ್‌ನ ರಚನೆ ತಿಳಿದಿರುವ ಮೋಸದ ಲಿಂಕ್‌ಗಳಂತಿದೆ ಎಂದು ಗುರುತಿಸಿದೆ.",
        url_no_https:
          "ಈ ಲಿಂಕ್ ಸುರಕ್ಷಿತ HTTPS ಸಂಪರ್ಕವನ್ನು ಬಳಸುತ್ತಿಲ್ಲ; ನಿಜವಾದ ಬ್ಯಾಂಕ್ ಮತ್ತು ಲಾಗಿನ್ ಸೈಟ್‌ಗಳು HTTPS ಬಳಸುತ್ತವೆ.",
        url_ip_host:
          "ಈ ಲಿಂಕ್ ಸಾಮಾನ್ಯ ವೆಬ್‌ಸೈಟ್ ಹೆಸರಿನ ಬದಲು ಸಂಖ್ಯೆಗಳ ವಿಳಾಸವನ್ನು (IP) ಬಳಸುತ್ತಿದೆ.",
        url_very_long:
          "ಈ ಲಿಂಕ್ ಅಸಾಮಾನ್ಯವಾಗಿ ಉದ್ದವಾಗಿದೆ; ನಿಜವಾದ ವಿಳಾಸವನ್ನು ಮರೆಮಾಡಲು ವಂಚಕರು ಇದನ್ನು ಬಳಸುತ್ತಾರೆ.",
        url_long:
          "ಈ ಲಿಂಕ್ ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಉದ್ದವಾಗಿದೆ, ಆದ್ದರಿಂದ ವೆಬ್‌ಸೈಟ್ ಹೆಸರನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಪರಿಶೀಲಿಸಿ.",
        url_excessive_subdomains:
          "ನಂಬಿಕಸ್ಥ ಬ್ರಾಂಡ್‌ನಂತೆ ಕಾಣಿಸಲು ನಿಜವಾದ ವೆಬ್‌ಸೈಟ್ ಹೆಸರಿನ ಮುಂದೆ ಹೆಚ್ಚುವರಿ ಪದಗಳನ್ನು ಸೇರಿಸಲಾಗಿದೆ.",
        url_shortener:
          "ಇದು ಚಿಕ್ಕದಾಗಿಸಿದ (shortened) ಲಿಂಕ್ ಆಗಿದ್ದು, ಕ್ಲಿಕ್ ಮಾಡುವವರೆಗೆ ನಿಜವಾದ ವೆಬ್‌ಸೈಟ್ ಅನ್ನು ಮರೆಮಾಡುತ್ತದೆ.",
        url_brand_impersonation:
          "ಈ ಲಿಂಕ್‌ನಲ್ಲಿ ಪ್ರಸಿದ್ಧ ಬ್ರಾಂಡ್ ಹೆಸರಿದೆ, ಆದರೆ ಇದು ಆ ಕಂಪನಿಯ ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್ ಅಲ್ಲ.",
        url_typosquat:
          "ಪ್ರಸಿದ್ಧ ಬ್ರಾಂಡ್ ಅನ್ನು ಅನುಕರಿಸಲು ಹೋಲುವ ಅಕ್ಷರಗಳು ಅಥವಾ ಸಂಖ್ಯೆಗಳನ್ನು ಬಳಸಲಾಗಿದೆ.",
        url_suspicious_chars:
          "ನಿಜವಾದ ಗಮ್ಯಸ್ಥಾನವನ್ನು ಮರೆಮಾಡಲು ಅಸಾಮಾನ್ಯ ಚಿಹ್ನೆಗಳು ಅಥವಾ ಪೋರ್ಟ್ ಸಂಖ್ಯೆಗಳನ್ನು ಬಳಸಲಾಗಿದೆ.",
        url_suspicious_keywords:
          "ನಕಲಿ ಲಾಗಿನ್ ಪುಟಗಳಲ್ಲಿ ಕಾಣುವ 'login', 'verify', ಅಥವಾ 'update' ನಂತಹ ಪದಗಳಿವೆ.",
        url_obfuscation:
          "ಈ ಲಿಂಕ್‌ನ ಕೆಲವು ಭಾಗಗಳನ್ನು ಎನ್‌ಕೋಡ್ ಮಾಡಲಾಗಿದ್ದು, ಅದು ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತದೆ ಎಂಬುದನ್ನು ಮರೆಮಾಡಬಹುದು.",
        url_dangerous_scheme:
          "ಇದು ಸಾಮಾನ್ಯ ವೆಬ್ ಪುಟದ ಬದಲು ವಿಶೇಷ ಬ್ರೌಸರ್ ಕಮಾಂಡ್ ಲಿಂಕ್ ಆಗಿದೆ.",
        msg_urgency:
          "ಸಂದೇಶವು ತಕ್ಷಣವೇ ಕ್ರಮ ಕೈಗೊಳ್ಳುವಂತೆ ಒತ್ತಡ ಹೇರುತ್ತದೆ—ನೀವು ಯೋಚಿಸದಂತೆ ಮಾಡಲು ವಂಚಕರು ಹೀಗೆ ಮಾಡುತ್ತಾರೆ.",
        msg_account_threat:
          "ನಿಮ್ಮ ಖಾತೆ ಲಾಕ್ ಅಥವಾ ಮುಚ್ಚಲಾಗುತ್ತದೆ ಎಂದು ಹೆದರಿಸಿ ಕ್ಲಿಕ್ ಮಾಡಿಸಲು ಪ್ರಯತ್ನಿಸುತ್ತದೆ.",
        msg_credential_request:
          "ಪಾಸ್‌ವರ್ಡ್, PIN ಅಥವಾ OTP ಕೇಳುತ್ತಿದೆ. ನಿಜವಾದ ಕಂಪನಿಗಳು ಇವುಗಳನ್ನು ಎಂದಿಗೂ ಕೇಳುವುದಿಲ್ಲ.",
        msg_prize_scam:
          "ಅನಿರೀಕ್ಷಿತ ಬಹುಮಾನ ಅಥವಾ ಉಡುಗೊರೆ ಸಿಕ್ಕಿದೆ ಎಂದು ಆಸೆ ತೋರಿಸುವ ಮೋಸದ ಸಂದೇಶವಾಗಿದೆ.",
        msg_payment_demand:
          "ತಕ್ಷಣ ಹಣ ಪಾವತಿ, ಶುಲ್ಕ, ಗಿಫ್ಟ್ ಕಾರ್ಡ್ ಅಥವಾ ಕ್ರಿಪ್ಟೋ ಕೇಳುತ್ತಿದೆ.",
        msg_impersonation:
          "ಬ್ಯಾಂಕ್, ಡೆಲಿವರಿ ಅಥವಾ ಸಪೋರ್ಟ್ ತಂಡದಂತೆ ನಟಿಸುವ ಸಾಮಾನ್ಯ ಪದಗಳನ್ನು ಬಳಸಿದೆ.",
        msg_suspicious_url:
          "ಸಂದೇಶದಲ್ಲಿರುವ ಲಿಂಕ್ ಹಲವು ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆಗಳನ್ನು ತೋರಿಸಿದೆ.",
        msg_contains_url:
          "ಸಂದೇಶದಲ್ಲಿ ಹೊರಗಿನ ಲಿಂಕ್ ಇದೆ. ತೆರೆಯುವ ಮೊದಲು ಅದು ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತದೆ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
      },
    },
    help: {
      title: "ನಾನು ಈಗಾಗಲೇ ಅನುಮಾನಾಸ್ಪದ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿದ್ದೇನೆ",
      subtitle:
        "ಗಾಬರಿಯಾಗಬೇಡಿ. ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸಿಕೊಳ್ಳಲು ಕೆಳಗೆ ಏನಾಯಿತು ಎಂಬುದನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      warning:
        "ಯಾವುದೇ ಆನ್‌ಲೈನ್ ಪರಿಶೀಲಕದಲ್ಲಿ ನಿಮ್ಮ ನಿಜವಾದ ಪಾಸ್‌ವರ್ಡ್, OTP, PIN ಅಥವಾ ಬ್ಯಾಂಕ್ ವಿವರಗಳನ್ನು ಹಾಕಬೇಡಿ.",
      recommendedHeading: "ಮುಂದೆ ಮಾಡಬೇಕಾದ ಸುರಕ್ಷತಾ ಕ್ರಮಗಳು:",
      scenarios: [
        {
          id: "opened_only",
          label: "ನಾನು ಕೇವಲ ಲಿಂಕ್ ತೆರೆದಿದ್ದೇನೆ",
          advice: [
            "ತಕ್ಷಣ ಬ್ರೌಸರ್ ಟ್ಯಾಬ್ ಅನ್ನು ಮುಚ್ಚಿ.",
            "ಆ ಪುಟದಲ್ಲಿ ಯಾವುದೇ ಬಟನ್, ಪಾಪ್-ಅಪ್ ಅಥವಾ ಡೌನ್‌ಲೋಡ್ ಒತ್ತಬೇಡಿ.",
            "ನಿಮ್ಮ ಸಾಧನದ ಆ್ಯಂಟಿವೈರಸ್ ಮೂಲಕ ತ್ವರಿತ ಸುರಕ್ಷತಾ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
          ],
        },
        {
          id: "entered_password",
          label: "ನಾನು ನನ್ನ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿದ್ದೇನೆ",
          advice: [
            "ತಕ್ಷಣ ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್‌ಗೆ ನೇರವಾಗಿ ಹೋಗಿ (ಲಿಂಕ್ ಮೂಲಕ ಅಲ್ಲ) ಆ ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಿ.",
            "ಇದೇ ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ಇಮೇಲ್, ಬ್ಯಾಂಕ್ ಅಥವಾ ಇತರ ಖಾತೆಗಳಲ್ಲಿ ಬಳಸಿದ್ದರೆ ಅವುಗಳನ್ನೂ ಬದಲಾಯಿಸಿ.",
            "Two-factor authentication (2FA) ಆನ್ ಮಾಡಿ ಮತ್ತು ಅಪರಿಚಿತ ಸಾಧನಗಳಿಂದ ಸೈನ್ ಔಟ್ ಮಾಡಿ.",
          ],
        },
        {
          id: "entered_otp",
          label: "ನಾನು OTP ನಮೂದಿಸಿದ್ದೇನೆ",
          advice: [
            "ತಕ್ಷಣ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಅಥವಾ ಸೇವಾ ಪೂರೈಕೆದಾರರ ಅಧಿಕೃತ ಫೋನ್ ಸಂಖ್ಯೆ ಅಥವಾ ಆ್ಯಪ್ ಮೂಲಕ ಸಂಪರ್ಕಿಸಿ.",
            "ನಿಮ್ಮ ಖಾತೆಯ ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತು PIN ಅನ್ನು ತಕ್ಷಣ ಬದಲಾಯಿಸಿ.",
            "ಅನಧಿಕೃತ ವಹಿವಾಟುಗಳಿಗಾಗಿ ನಿಮ್ಮ ಖಾತೆಯ ಅಲರ್ಟ್‌ಗಳನ್ನು ಗಮನಿಸಿ.",
          ],
        },
        {
          id: "entered_bank",
          label: "ನಾನು ಬ್ಯಾಂಕ್/ಪಾವತಿ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿದ್ದೇನೆ",
          advice: [
            "ಕಾರ್ಡ್ ಹಿಂದೆ ಇರುವ ಅಧಿಕೃತ ಸಂಖ್ಯೆಗೆ ತಕ್ಷಣ ಕರೆ ಮಾಡಿ ನಿಮ್ಮ ಕಾರ್ಡ್ ಅಥವಾ ಖಾತೆಯನ್ನು ಬ್ಲಾಕ್/ಫ್ರೀಜ್ ಮಾಡಿಸಿ.",
            "ಮೋಸದ ವಹಿವಾಟನ್ನು ತಕ್ಷಣವೇ ಬ್ಯಾಂಕ್‌ಗೆ ವರದಿ ಮಾಡಿ.",
            "ದೂರಿಗಾಗಿ ಸಂದೇಶ ಮತ್ತು ಲಿಂಕ್‌ನ ಸ್ಕ್ರೀನ್‌ಶಾಟ್‌ಗಳನ್ನು ಉಳಿಸಿಟ್ಟುಕೊಳ್ಳಿ.",
          ],
        },
        {
          id: "downloaded_file",
          label: "ನಾನು ಫೈಲ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿದ್ದೇನೆ",
          advice: [
            "ಡೌನ್‌ಲೋಡ್ ಆದ ಫೈಲ್ ಅನ್ನು ತೆರೆಯಬೇಡಿ ಮತ್ತು ಯಾವುದೇ ಅನುಮತಿ ನೀಡಬೇಡಿ.",
            "ಸಾಧನವು ವಿಚಿತ್ರವಾಗಿ ವರ್ತಿಸಿದರೆ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಳಿಸಿ.",
            "Windows Security ಅಥವಾ ವಿಶ್ವಾಸಾರ್ಹ ಆ್ಯಂಟಿವೈರಸ್‌ನಿಂದ ಪೂರ್ಣ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಆ ಫೈಲ್ ಅಳಿಸಿ.",
          ],
        },
        {
          id: "granted_permissions",
          label: "ನಾನು ಅನುಮತಿಗಳನ್ನು (permissions) ನೀಡಿದ್ದೇನೆ",
          advice: [
            "ಬ್ರೌಸರ್ ಅಥವಾ ಫೋನ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ಗೆ ಹೋಗಿ ಅನುಮತಿಗಳನ್ನು (notifications, camera, accessibility, device admin) ರದ್ದುಗೊಳಿಸಿ.",
            "ಹೊಸದಾಗಿ ಸೇರಿದ ಅಪರಿಚಿತ ಆ್ಯಪ್ ಅಥವಾ ಬ್ರೌಸರ್ ಎಕ್ಸ್‌ಟೆನ್ಶನ್ ಅನ್ನು ತೆಗೆದುಹಾಕಿ.",
            "ಸಾಧನವನ್ನು ರೀಸ್ಟಾರ್ಟ್ ಮಾಡಿ ಮತ್ತು ಪೂರ್ಣ ಸುರಕ್ಷತಾ ಸ್ಕ್ಯಾನ್ ನಡೆಸಿ.",
          ],
        },
      ],
    },
    privacy: {
      title: "ಗೌಪ್ಯತೆ ಮತ್ತು PhishGuard ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
      subtitle: "ನೀವು ಪರಿಶೀಲನೆ ನಡೆಸಿದಾಗ ಏನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ ಎಂಬುದರ ಪ್ರಾಮಾಣಿಕ ಮಾಹಿತಿ.",
      cards: [
        {
          title: "1. ಯಾವ ಮಾಹಿತಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತದೆ",
          body: "ನೀವು ಅಂಟಿಸುವ ವೆಬ್‌ಸೈಟ್ ಲಿಂಕ್ ಅಥವಾ ಸಂದೇಶದ ಪಠ್ಯವನ್ನು ಮಾತ್ರ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತದೆ. PhishGuard ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಆ ಅನುಮಾನಾಸ್ಪದ ಪುಟವನ್ನು ಎಂದಿಗೂ ತೆರೆಯುವುದಿಲ್ಲ.",
        },
        {
          title: "2. ಬಾಹ್ಯ ಸುರಕ್ಷತಾ ಡೇಟಾಬೇಸ್ ಪರಿಶೀಲನೆ",
          body: "ಸರ್ವರ್‌ನಲ್ಲಿ URLhaus ಸಕ್ರಿಯವಾಗಿದ್ದಾಗ, ನೀವು ಸಲ್ಲಿಸಿದ ಲಿಂಕ್‌ಗಳು (ಹಾಗೂ ಸಂದೇಶದ ಒಳಗಿರುವ ಲಿಂಕ್‌ಗಳು) ಅವು ಅಪಾಯಕಾರಿಯೇ ಎಂದು ಪರಿಶೀಲಿಸಲು URLhaus ಗೆ ಕಳುಹಿಸಲ್ಪಡುತ್ತವೆ.",
        },
        {
          title: "3. ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸದಲ್ಲಿ ಏನು ಸಂಗ್ರಹವಾಗುತ್ತದೆ",
          body: "ವಿಶ್ಲೇಷಣಾ ಅಂಕಿಅಂಶಗಳು ಮತ್ತು ಸಂಶೋಧನೆಗಾಗಿ ಸಲ್ಲಿಸಿದ ಲಿಂಕ್‌ಗಳು, ಸಂದೇಶಗಳು ಮತ್ತು ಫಲಿತಾಂಶಗಳನ್ನು ಸ್ಥಳೀಯ SQLite ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗುತ್ತದೆ.",
        },
        {
          title: "4. ನಿಮ್ಮ ಗೌಪ್ಯತೆಯನ್ನು ಹೇಗೆ ರಕ್ಷಿಸುವುದು",
          body: "ನಿಜವಾದ ಪಾಸ್‌ವರ್ಡ್‌ಗಳು, OTP, ಬ್ಯಾಂಕ್ ಖಾತೆ ಸಂಖ್ಯೆಗಳು ಅಥವಾ ಖಾಸಗಿ ವೈಯಕ್ತಿಕ ವಿವರಗಳನ್ನು ಎಂದಿಗೂ ಅಂಟಿಸಬೇಡಿ. ಪರಿಶೀಲಿಸುವ ಮೊದಲು ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ತೆಗೆದುಹಾಕಿ.",
        },
      ],
    },
  },

  hi: {
    langLabel: "भाषा",
    nav: {
      home: "होम",
      link: "लिंक जांचें",
      message: "संदेश जांचें",
      help: "मैंने पहले ही संदिग्ध लिंक पर क्लिक कर दिया है",
      privacy: "गोपनीयता और यह कैसे काम करता है",
    },
    hero: {
      badge: "मुफ़्त सार्वजनिक सुरक्षा जांच",
      title: "जांचें कि कोई लिंक या संदेश संदिग्ध है या नहीं",
      subtitle:
        "क्या कोई संदेश धोखाधड़ी जैसा लग रहा है? क्लिक करने से पहले संदिग्ध लिंक, ईमेल और SMS की जांच करें। हम जोखिम को सरल हिंदी में समझाते हैं।",
      linkCardTitle: "लिंक जांचें",
      linkCardDesc: "वेबसाइट लिंक पेस्ट करके देखें कि यह संदिग्ध दिखता है या नहीं।",
      linkCardCta: "वेबसाइट लिंक जांचें",
      msgCardTitle: "संदेश जांचें",
      msgCardDesc: "धोखाधड़ी के संकेतों की जांच के लिए SMS, ईमेल या WhatsApp संदेश पेस्ट करें।",
      msgCardCta: "संदेश जांचें",
    },
    checker: {
      switchToMsg: "संदेश जांच पर जाएं",
      switchToLink: "लिंक जांच पर जाएं",
      linkTitle: "जांचें कि लिंक संदिग्ध है या नहीं",
      linkDesc: "खोलने से पहले मिला हुआ वेबसाइट लिंक यहां पेस्ट करें।",
      linkLabel: "वेबसाइट लिंक",
      linkPlaceholder: "उदाहरण: https://company.com/login या bit.ly/3x...",
      msgTitle: "संदिग्ध संदेश की जांच करें",
      msgDesc: "नीचे पूरा SMS, ईमेल या WhatsApp संदेश पेस्ट करें।",
      msgLabel: "पूरा संदेश",
      msgPlaceholder:
        "उदाहरण: जरूरी: आपका बैंक खाता आज बंद हो जाएगा। OTP भेजें या http://... पर क्लिक करें",
      privacyBanner:
        "कृपया अपना असली पासवर्ड, OTP, बैंक विवरण या निजी जानकारी इसमें न डालें।",
      examplesLabel: "उदाहरण आज़माएं:",
      exNormalUrl: "सामान्य वेबसाइट (Google)",
      exFakePaypal: "नकली PayPal लॉगिन लिंक",
      exIpUrl: "संदिग्ध IP नंबर लिंक",
      exBankSms: "नकली बैंक SMS",
      exPrizeSms: "इनाम और OTP घोटाला संदेश",
      exNormalMsg: "सामान्य संदेश",
      checkBtn: "अभी जांचें",
      checkingBtn: "जांच हो रही है...",
      emptyError: "जांचने से पहले कृपया कोई लिंक या संदेश पेस्ट करें।",
      genericError: "सुरक्षा जांच पूरी नहीं हो सकी। कृपया फिर से प्रयास करें।",
    },
    results: {
      badge: "सुरक्षा जांच परिणाम",
      checkedItem: "जांचा गया विवरण:",
      whatWeFound: "हमने क्या पाया",
      whyDangerous: "यह खतरनाक क्यों हो सकता है",
      whatToDo: "आपको क्या करना चाहिए",
      whatWeChecked: "हमने क्या जांचा",
      limitationsTitle: "महत्वपूर्ण सीमाएं",
      moreDetails: "अधिक विवरण",
      viewAdvanced: "विस्तृत विश्लेषण देखें (Advanced Analysis)",
      checkedAt: "जांच का समय:",
      noFlagsFound:
        "सामान्य धोखाधड़ी पैटर्न, नकली ब्रांड चाल या ज्ञात खतरनाक सूची में कोई मेल नहीं मिला।",
      whySafeNote:
        "भले ही परिणाम सुरक्षित दिखे, ठग कभी भी नए लिंक बना सकते हैं। केवल उन्हीं भेजने वालों पर भरोसा करें जिन्हें आप जानते हैं।",
      limitationsText:
        "स्वचालित जांच केवल सामान्य धोखाधड़ी पैटर्न और ज्ञात डेटाबेस को देखती है। 'अपेक्षाकृत सुरक्षित' का मतलब 100% गारंटी नहीं है।",
      verdicts: {
        "LOW RISK": {
          headline: "अपेक्षाकृत सुरक्षित लगता है",
          emoji: "🟢",
          subtitle:
            "हमें धोखाधड़ी के स्पष्ट संकेत नहीं मिले। फिर भी केवल जाने-पहचाने लोगों या कंपनियों के लिंक पर ही भरोसा करें।",
        },
        SUSPICIOUS: {
          headline: "सावधान रहें",
          emoji: "🟡",
          subtitle:
            "इसमें धोखाधड़ी वाले लिंक या संदेशों जैसे कुछ चेतावनी संकेत हैं। क्लिक या जवाब देने से पहले भेजने वाले की पुष्टि करें।",
        },
        "HIGH RISK": {
          headline: "खतरनाक होने की संभावना",
          emoji: "🔴",
          subtitle:
            "कई मजबूत खतरे के संकेत मिले हैं। इस लिंक पर क्लिक न करें, जवाब न दें और कोई भी निजी जानकारी साझा न करें।",
        },
      },
      checkedItems: {
        url: [
          "लिंक की बनावट, डोमेन वर्तनी और छिपे हुए रीडायरेक्ट तरीके",
          "ज्ञात सुरक्षित और फ़िशिंग लिंक पैटर्न से स्वचालित तुलना",
          "ज्ञात खतरनाक लिंक डेटाबेस की जांच (उपलब्ध होने पर)",
        ],
        message: [
          "जल्दबाज़ी का दबाव, खाते की धमकी और पासवर्ड या OTP की मांग",
          "नकली इनाम, भुगतान या ब्रांड की नकल वाली भाषा",
          "संदेश के अंदर मौजूद कोई भी वेब लिंक",
        ],
      },
      actionsByVerdict: {
        "LOW RISK": [
          "सुनिश्चित करें कि आप भेजने वाले से इस लिंक या संदेश की उम्मीद कर रहे थे।",
          "यदि लॉगिन करने को कहा जाए, तो ब्राउज़र में वेबसाइट का पता ध्यान से जांचें।",
        ],
        SUSPICIOUS: [
          "भेजने वाले की पुष्टि किए बिना पासवर्ड, OTP या भुगतान विवरण दर्ज न करें।",
          "इस लिंक के बजाय सीधे कंपनी की आधिकारिक वेबसाइट पर जाएं।",
        ],
        "HIGH RISK": [
          "लिंक न खोलें, संदेश का जवाब न दें और कोई फ़ाइल डाउनलोड न करें।",
          "अपना OTP, पासवर्ड, PIN या बैंक विवरण कभी साझा न करें।",
          "जरूरत हो तो कंपनी के आधिकारिक फोन नंबर या ऐप से संपर्क करें।",
          "संदेश हटा दें और भेजने वाले को ब्लॉक या रिपोर्ट करें।",
        ],
      },
      reasons: {
        intel_urlhaus_confirmed:
          "सुरक्षा डेटाबेस ने पहले ही इस लिंक को खतरनाक के रूप में रिपोर्ट किया है।",
        ml_url_phishing_prediction:
          "हमारे स्वचालित पैटर्न चेकर ने पाया कि इस लिंक की बनावट ज्ञात धोखाधड़ी लिंक से मिलती है।",
        url_no_https:
          "यह लिंक सुरक्षित HTTPS कनेक्शन का उपयोग नहीं करता, जबकि असली बैंकिंग और लॉगिन साइटें करती हैं।",
        url_ip_host:
          "यह लिंक सामान्य वेबसाइट नाम के बजाय नंबर वाले पते (IP) का उपयोग करता है।",
        url_very_long:
          "यह लिंक असामान्य रूप से लंबा है, जिसका उपयोग असली वेबसाइट छिपाने के लिए किया जा सकता है।",
        url_long:
          "यह लिंक सामान्य से अधिक लंबा है, इसलिए वेबसाइट का नाम ध्यान से जांचें।",
        url_excessive_subdomains:
          "असली ब्रांड जैसा दिखने के लिए वेबसाइट नाम से पहले कई अतिरिक्त शब्द जोड़े गए हैं।",
        url_shortener:
          "यह एक छोटा किया गया (shortened) लिंक है जो क्लिक करने से पहले असली वेबसाइट छिपाता है।",
        url_brand_impersonation:
          "इस लिंक में एक प्रसिद्ध ब्रांड का नाम है, लेकिन यह कंपनी की आधिकारिक वेबसाइट नहीं है।",
        url_typosquat:
          "प्रसिद्ध ब्रांड की नकल करने के लिए मिलते-जुलते अक्षरों या अंकों का उपयोग किया गया है।",
        url_suspicious_chars:
          "असली वेबसाइट छिपाने के लिए इसमें असामान्य चिह्न या पोर्ट नंबर मौजूद हैं।",
        url_suspicious_keywords:
          "इसमें 'login', 'verify', या 'update' जैसे शब्द हैं जो नकली लॉगिन पेजों में आम हैं।",
        url_obfuscation:
          "इस लिंक के कुछ हिस्से एन्कोड किए गए हैं, जो असली मंजिल को छिपा सकते हैं।",
        url_dangerous_scheme:
          "यह सामान्य वेबपेज के बजाय एक विशेष ब्राउज़र कमांड लिंक है।",
        msg_urgency:
          "संदेश तुरंत कार्रवाई करने का दबाव डालता है—ठग ऐसा इसलिए करते हैं ताकि आप सोच न पाएं।",
        msg_account_threat:
          "खाता बंद या लॉक होने की धमकी देकर डराने और क्लिक कराने की कोशिश करता है।",
        msg_credential_request:
          "संदेश पासवर्ड, PIN या OTP मांग रहा है। असली कंपनियां इन्हें कभी नहीं मांगतीं।",
        msg_prize_scam:
          "यह अनचाहे इनाम, उपहार या लॉटरी का लालच देने वाला संदेश है।",
        msg_payment_demand:
          "संदेश तुरंत पैसे, शुल्क, गिफ्ट कार्ड या क्रिप्टो भेजने की मांग कर रहा है।",
        msg_impersonation:
          "यह बैंक, डिलीवरी सेवा या सपोर्ट टीम बनने का दिखावा करता है।",
        msg_suspicious_url:
          "संदेश में मौजूद लिंक ने कई सुरक्षा चेतावनी संकेत दिखाए हैं।",
        msg_contains_url:
          "संदेश में एक बाहरी लिंक है। क्लिक करने से पहले सुनिश्चित करें कि यह कहां जाता है।",
      },
    },
    help: {
      title: "मैंने पहले ही संदिग्ध लिंक पर क्लिक कर दिया है",
      subtitle:
        "घबराएं नहीं। खुद को सुरक्षित रखने के लिए नीचे चुनें कि क्या हुआ था।",
      warning:
        "किसी भी ऑनलाइन चेकर में अपना असली पासवर्ड, OTP, PIN या बैंक विवरण कभी न डालें।",
      recommendedHeading: "तुरंत करने योग्य सुरक्षित कदम:",
      scenarios: [
        {
          id: "opened_only",
          label: "मैंने केवल लिंक खोला है",
          advice: [
            "ब्राउज़र टैब को तुरंत बंद कर दें।",
            "उस पेज पर किसी भी बटन, पॉप-अप या डाउनलोड पर क्लिक न करें।",
            "अपने डिवाइस के एंटीवायरस से एक त्वरित सुरक्षा स्कैन चलाएं।",
          ],
        },
        {
          id: "entered_password",
          label: "मैंने अपना पासवर्ड दर्ज कर दिया",
          advice: [
            "तुरंत आधिकारिक वेबसाइट पर खुद पता टाइप करके जाएं और अपना पासवर्ड बदलें।",
            "यदि आपने वही पासवर्ड ईमेल, बैंकिंग या अन्य खातों में उपयोग किया है, तो उन्हें भी बदलें।",
            "टू-फैक्टर ऑथेंटिकेशन (2FA) चालू करें और अनजान डिवाइस से लॉग आउट करें।",
          ],
        },
        {
          id: "entered_otp",
          label: "मैंने OTP दर्ज कर दिया",
          advice: [
            "आधिकारिक फोन नंबर या ऐप के जरिए तुरंत अपने बैंक या सेवा प्रदाता से संपर्क करें।",
            "अपने खाते का पासवर्ड और PIN तुरंत बदलें।",
            "किसी भी अनधिकृत लेन-देन के लिए अपने बैंक अलर्ट और स्टेटमेंट पर नजर रखें।",
          ],
        },
        {
          id: "entered_bank",
          label: "मैंने बैंक/भुगतान विवरण दर्ज कर दिया",
          advice: [
            "कार्ड के पीछे दिए नंबर पर तुरंत कॉल करके अपना कार्ड या खाता ब्लॉक/फ्रीज कराएं।",
            "धोखाधड़ी की रिपोर्ट तुरंत अपने बैंक को करें।",
            "शिकायत के लिए संदेश और लिंक के स्क्रीनशॉट सुरक्षित रखें।",
          ],
        },
        {
          id: "downloaded_file",
          label: "मैंने एक फ़ाइल डाउनलोड की है",
          advice: [
            "डाउनलोड की गई फ़ाइल को न खोलें और न ही कोई अनुमति दें।",
            "यदि डिवाइस अजीब व्यवहार करे, तो इंटरनेट बंद कर दें।",
            "Windows Security या भरोसेमंद एंटीवायरस से पूरा स्कैन करें और फ़ाइल हटा दें।",
          ],
        },
        {
          id: "granted_permissions",
          label: "मैंने अनुमतियां (permissions) दे दी हैं",
          advice: [
            "ब्राउज़र या फोन सेटिंग्स में जाकर साइट/ऐप की अनुमतियां (notifications, camera, accessibility, device admin) हटा दें।",
            "हाल ही में जुड़े किसी भी अनजान ऐप या ब्राउज़र एक्सटेंशन को हटा दें।",
            "डिवाइस को रीस्टार्ट करें और पूरा सुरक्षा स्कैन चलाएं।",
          ],
        },
      ],
    },
    privacy: {
      title: "गोपनीयता और PhishGuard कैसे काम करता है",
      subtitle: "जांच चलाने पर क्या विश्लेषित और संग्रहीत होता है, इसकी ईमानदार जानकारी।",
      cards: [
        {
          title: "1. किस जानकारी का विश्लेषण होता है",
          body: "केवल वही वेबसाइट लिंक या संदेश का टेक्स्ट विश्लेषित किया जाता है जिसे आप पेस्ट करते हैं। PhishGuard आपके डिवाइस पर उस संदिग्ध पेज को कभी नहीं खोलता।",
        },
        {
          title: "2. बाहरी थ्रेट-इंटेलिजेंस जांच",
          body: "जब सर्वर पर URLhaus सक्रिय होता है, तो सबमिट किए गए लिंक (और संदेशों में मिले लिंक) यह जांचने के लिए URLhaus को भेजे जाते हैं कि क्या वे पहले से खतरनाक सूची में हैं।",
        },
        {
          title: "3. स्कैन इतिहास में क्या सेव होता है",
          body: "सबमिट किए गए लिंक, संदेश और परिणाम स्थानीय SQLite डेटाबेस में सेव होते हैं ताकि शोधकर्ता Analyst Mode में रुझान और आंकड़े देख सकें।",
        },
        {
          title: "4. अपनी गोपनीयता कैसे सुरक्षित रखें",
          body: "इसमें कभी भी असली पासवर्ड, OTP, बैंक खाता नंबर या निजी व्यक्तिगत विवरण न डालें। जांचने से पहले संवेदनशील जानकारी हटा दें।",
        },
      ],
    },
  },
};
