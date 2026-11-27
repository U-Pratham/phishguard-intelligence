import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Home,
  Info,
  Languages,
  LifeBuoy,
  Link2,
  Loader2,
  Lock,
  MessageSquareText,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  getInitialLanguage,
  LANG_STORAGE_KEY,
  LANGUAGES,
  SIMPLE_TRANSLATIONS,
} from "../i18n/simpleTranslations";

const VERDICT_THEME = {
  "LOW RISK": {
    badgeClass: "border-emerald-500/40 bg-emerald-500/15 text-emerald-500",
    cardClass: "border-emerald-500/35 bg-emerald-500/5",
    iconColor: "text-emerald-500",
  },
  SUSPICIOUS: {
    badgeClass: "border-amber-500/40 bg-amber-500/15 text-amber-500",
    cardClass: "border-amber-500/35 bg-amber-500/5",
    iconColor: "text-amber-500",
  },
  "HIGH RISK": {
    badgeClass: "border-rose-500/40 bg-rose-500/15 text-rose-500",
    cardClass: "border-rose-500/35 bg-rose-500/5",
    iconColor: "text-rose-500",
  },
};

export default function SimpleModeView({
  onScanUrl,
  onScanMessage,
  isScanning,
  currentResult,
  error,
  onOpenAdvanced,
}) {
  const [lang, setLang] = useState(getInitialLanguage);
  const [section, setSection] = useState("home"); // home | link | message | help | privacy
  const [urlInput, setUrlInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [selectedSituation, setSelectedSituation] = useState("opened_only");

  useEffect(() => {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore storage errors
    }
  }, [lang]);

  const t = SIMPLE_TRANSLATIONS[lang] || SIMPLE_TRANSLATIONS.en;
  const activeChecker = section === "message" ? "message" : "link";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isScanning) return;
    setShowMoreDetails(false);
    if (activeChecker === "link" && urlInput.trim()) {
      onScanUrl(urlInput.trim());
    } else if (activeChecker === "message" && messageInput.trim()) {
      onScanMessage(messageInput.trim());
    }
  };

  const quickExamples =
    activeChecker === "link"
      ? [
          { label: t.checker.exNormalUrl, value: "https://google.com" },
          {
            label: t.checker.exFakePaypal,
            value:
              "http://paypal-secure-login.account-verify-update.com/webscr?session=9921",
          },
          {
            label: t.checker.exIpUrl,
            value: "http://192.168.45.12:8080/signin/verify",
          },
        ]
      : [
          {
            label: t.checker.exBankSms,
            value:
              "Your bank account has been suspended. Verify immediately to avoid closure. Submit your OTP at http://192.168.45.12/verify",
          },
          {
            label: t.checker.exPrizeSms,
            value:
              "Congratulations! You won a prize. Send your bank details and OTP to claim your reward.",
          },
          {
            label: t.checker.exNormalMsg,
            value: "Hi! Are we still meeting at 5 PM near the library today?",
          },
        ];

  const verdictStyle = currentResult
    ? VERDICT_THEME[currentResult.verdict] || VERDICT_THEME["LOW RISK"]
    : null;
  const verdictText = currentResult
    ? t.results.verdicts[currentResult.verdict] || t.results.verdicts["LOW RISK"]
    : null;

  const rawReasons = currentResult
    ? currentResult.reasons || currentResult.evidence || []
    : [];
  const translatedReasons = [];
  const seenReasonTexts = new Set();
  for (const r of rawReasons) {
    const text =
      t.results.reasons[r.id] || t.results.reasons.ml_url_phishing_prediction;
    if (text && !seenReasonTexts.has(text)) {
      seenReasonTexts.add(text);
      translatedReasons.push({ id: r.id, severity: r.severity, text });
    }
  }

  const localizedActions = currentResult
    ? t.results.actionsByVerdict[currentResult.verdict] ||
      currentResult.recommended_actions ||
      []
    : [];

  const localizedChecked = currentResult
    ? t.results.checkedItems[currentResult.scan_type] ||
      currentResult.what_we_checked ||
      []
    : [];

  const VerdictIcon =
    currentResult?.verdict === "HIGH RISK"
      ? ShieldAlert
      : currentResult?.verdict === "SUSPICIOUS"
      ? AlertTriangle
      : ShieldCheck;

  const activeScenario =
    t.help.scenarios.find((s) => s.id === selectedSituation) || t.help.scenarios[0];

  const navItems = [
    { id: "home", label: t.nav.home, icon: Home },
    { id: "link", label: t.nav.link, icon: Link2 },
    { id: "message", label: t.nav.message, icon: MessageSquareText },
    { id: "help", label: t.nav.help, icon: LifeBuoy },
    { id: "privacy", label: t.nav.privacy, icon: Lock },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-10">
      {/* Top Simple Navigation + Language Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav
          aria-label="Simple mode navigation"
          className="flex flex-wrap items-center gap-1.5 rounded-2xl border p-1.5 pg-surface"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                  isActive
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "pg-text-secondary hover:bg-cyan-500/10"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="inline-flex shrink-0 items-center gap-2 self-end rounded-xl border px-3 py-2 pg-surface sm:self-auto">
          <Languages className="h-4 w-4 text-cyan-500" />
          <label htmlFor="simple-lang-select" className="text-xs font-medium pg-text-muted">
            {t.langLabel}:
          </label>
          <select
            id="simple-lang-select"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="cursor-pointer bg-transparent text-xs font-semibold pg-text-primary focus:outline-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id} className="bg-slate-900 text-slate-100">
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* HOME LANDING SECTION */}
      {section === "home" && (
        <div className="space-y-8">
          <div className="mx-auto max-w-2xl pt-2 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t.hero.badge}
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight pg-text-primary sm:text-4xl">
              {t.hero.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed pg-text-muted">
              {t.hero.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setSection("link")}
              className="group flex flex-col justify-between rounded-2xl border p-6 text-left transition-all hover:border-cyan-500/60 hover:shadow-lg pg-surface"
            >
              <div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-500">
                  <Link2 className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold pg-text-primary">
                  {t.hero.linkCardTitle}
                </h3>
                <p className="mt-2 text-sm leading-relaxed pg-text-muted">
                  {t.hero.linkCardDesc}
                </p>
              </div>
              <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-500 transition-all group-hover:gap-2.5">
                <span>{t.hero.linkCardCta}</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSection("message")}
              className="group flex flex-col justify-between rounded-2xl border p-6 text-left transition-all hover:border-emerald-500/60 hover:shadow-lg pg-surface"
            >
              <div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
                  <MessageSquareText className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold pg-text-primary">
                  {t.hero.msgCardTitle}
                </h3>
                <p className="mt-2 text-sm leading-relaxed pg-text-muted">
                  {t.hero.msgCardDesc}
                </p>
              </div>
              <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-500 transition-all group-hover:gap-2.5">
                <span>{t.hero.msgCardCta}</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* CHECK A LINK OR CHECK A MESSAGE */}
      {(section === "link" || section === "message") && (
        <div className="space-y-6">
          <div className="rounded-2xl border p-6 shadow-lg sm:p-8 pg-surface">
            <div
              className="flex flex-wrap items-center justify-between gap-3 border-b pb-4"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div>
                <h2 className="text-xl font-bold pg-text-primary">
                  {activeChecker === "link" ? t.checker.linkTitle : t.checker.msgTitle}
                </h2>
                <p className="mt-1 text-sm pg-text-muted">
                  {activeChecker === "link" ? t.checker.linkDesc : t.checker.msgDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSection(activeChecker === "link" ? "message" : "link")}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-cyan-500 hover:bg-cyan-500/10 pg-surface-2"
              >
                {activeChecker === "link" ? t.checker.switchToMsg : t.checker.switchToLink}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {activeChecker === "link" ? (
                <div>
                  <label
                    htmlFor="simple-url-input"
                    className="block text-sm font-semibold pg-text-secondary"
                  >
                    {t.checker.linkLabel}
                  </label>
                  <input
                    id="simple-url-input"
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder={t.checker.linkPlaceholder}
                    className="mt-2 w-full rounded-xl border px-4 py-4 text-base pg-input focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  />
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="simple-msg-input"
                    className="block text-sm font-semibold pg-text-secondary"
                  >
                    {t.checker.msgLabel}
                  </label>
                  <textarea
                    id="simple-msg-input"
                    rows={5}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={t.checker.msgPlaceholder}
                    className="mt-2 w-full rounded-xl border px-4 py-4 text-base pg-input focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs pg-surface-2 pg-text-muted">
                <Lock className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>{t.checker.privacyBanner}</span>
              </div>

              <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs pg-text-muted">{t.checker.examplesLabel}</span>
                  {quickExamples.map((ex) => (
                    <button
                      key={ex.label}
                      type="button"
                      onClick={() =>
                        activeChecker === "link"
                          ? setUrlInput(ex.value)
                          : setMessageInput(ex.value)
                      }
                      className="rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-cyan-500/50 hover:text-cyan-500 pg-surface-2 pg-text-secondary"
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={
                    isScanning ||
                    (activeChecker === "link" ? !urlInput.trim() : !messageInput.trim())
                  }
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t.checker.checkingBtn}
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      {t.checker.checkBtn}
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-sm text-rose-500"
              >
                {error || t.checker.genericError}
              </div>
            )}
          </div>

          {/* RESULT CARD */}
          {currentResult && verdictStyle && verdictText && (
            <div className={`rounded-2xl border p-6 shadow-lg sm:p-8 ${verdictStyle.cardClass}`}>
              <div className="flex items-start gap-4">
                <div className="rounded-2xl border p-3 pg-surface">
                  <VerdictIcon className={`h-8 w-8 ${verdictStyle.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-wide ${verdictStyle.badgeClass}`}
                  >
                    <span>{verdictText.emoji}</span>
                    <span>{t.results.badge}</span>
                  </span>
                  <h3 className="mt-2 text-2xl font-bold pg-text-primary sm:text-3xl">
                    {verdictText.headline}
                  </h3>
                  <p className="mt-1.5 text-base leading-relaxed pg-text-secondary">
                    {verdictText.subtitle}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border px-4 py-3 text-xs pg-surface-2">
                <span className="font-semibold pg-text-muted">{t.results.checkedItem} </span>
                <span className="break-all font-mono pg-text-primary">
                  {currentResult.submitted_input}
                </span>
              </div>

              {/* What we found & Why this might be dangerous */}
              <div className="mt-6 rounded-xl border p-5 pg-surface">
                <h4 className="text-base font-bold pg-text-primary">
                  {translatedReasons.length > 0
                    ? t.results.whyDangerous
                    : t.results.whatWeFound}
                </h4>
                {translatedReasons.length === 0 ? (
                  <div className="mt-2 space-y-2 text-sm leading-relaxed pg-text-secondary">
                    <p>{t.results.noFlagsFound}</p>
                    <p className="pg-text-muted">{t.results.whySafeNote}</p>
                  </div>
                ) : (
                  <ul className="mt-3 space-y-2.5">
                    {translatedReasons.map((reason) => (
                      <li
                        key={reason.id}
                        className="flex items-start gap-3 text-sm leading-relaxed pg-text-secondary"
                      >
                        <span
                          className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                            reason.severity === "high"
                              ? "bg-rose-500"
                              : reason.severity === "medium"
                              ? "bg-amber-500"
                              : "bg-cyan-500"
                          }`}
                        />
                        <span>{reason.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* What you should do */}
              <div className="mt-4 rounded-xl border p-5 pg-surface">
                <h4 className="text-base font-bold pg-text-primary">
                  {t.results.whatToDo}
                </h4>
                <ul className="mt-3 space-y-2.5">
                  {localizedActions.map((action, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm leading-relaxed pg-text-secondary"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What we checked */}
              <div className="mt-4 rounded-xl border p-5 pg-surface">
                <h4 className="text-base font-bold pg-text-primary">
                  {t.results.whatWeChecked}
                </h4>
                <ul className="mt-2.5 space-y-1.5 text-sm pg-text-muted">
                  {localizedChecked.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>

              {/* Expandable More Details + Already Clicked */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowMoreDetails((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors hover:border-cyan-500/50 pg-surface pg-text-primary"
                >
                  <Info className="h-4 w-4 text-cyan-500" />
                  {t.results.moreDetails}
                  {showMoreDetails ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSection("help")}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-500 transition-colors hover:bg-amber-500/20"
                >
                  <LifeBuoy className="h-4 w-4" />
                  {t.nav.help}
                </button>

                {onOpenAdvanced && (
                  <button
                    type="button"
                    onClick={onOpenAdvanced}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-500 transition-colors hover:bg-cyan-500/20"
                  >
                    <span>{t.results.viewAdvanced}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {showMoreDetails && (
                <div className="mt-4 rounded-xl border p-4 text-sm pg-surface-2 pg-text-secondary">
                  <p className="font-semibold pg-text-primary">
                    {t.results.limitationsTitle}
                  </p>
                  <p className="mt-1">{t.results.limitationsText}</p>
                  <p className="mt-2 text-xs pg-text-muted">
                    {t.results.checkedAt} {new Date(currentResult.timestamp).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ALREADY CLICKED A SUSPICIOUS LINK */}
      {section === "help" && (
        <div className="rounded-2xl border p-6 shadow-lg sm:p-8 pg-surface">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/15 p-3 text-amber-500">
              <LifeBuoy className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold pg-text-primary">{t.help.title}</h2>
              <p className="text-sm pg-text-muted">{t.help.subtitle}</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-500">
            {t.help.warning}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {t.help.scenarios.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedSituation(item.id)}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                  selectedSituation === item.id
                    ? "border-amber-500 bg-amber-500/15 text-amber-500"
                    : "pg-surface-2 pg-text-secondary hover:border-cyan-500/40"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-xl border p-5 pg-surface-2">
            <h3 className="text-base font-bold text-amber-500">
              {t.help.recommendedHeading} {activeScenario.label}
            </h3>
            <ul className="mt-3 space-y-2.5">
              {activeScenario.advice.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-sm leading-relaxed pg-text-secondary"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* PRIVACY & HOW IT WORKS */}
      {section === "privacy" && (
        <div className="space-y-5 rounded-2xl border p-6 shadow-lg sm:p-8 pg-surface">
          <div>
            <h2 className="text-2xl font-bold pg-text-primary">{t.privacy.title}</h2>
            <p className="mt-1 text-sm pg-text-muted">{t.privacy.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {t.privacy.cards.map((card) => (
              <div key={card.title} className="rounded-xl border p-4 pg-surface-2">
                <h3 className="text-sm font-bold pg-text-primary">{card.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed pg-text-muted">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
