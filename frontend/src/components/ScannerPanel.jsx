import React, { useState } from "react";
import { Globe, Loader2, MessageSquareWarning, Search, Sparkles } from "lucide-react";

const SAMPLE_URLS = [
  {
    label: "Suspicious PayPal Lookalike",
    value: "http://paypal-secure-login.account-verify-update.com/webscr?session=9921",
  },
  {
    label: "Raw IP Login",
    value: "http://192.168.45.12:8080/signin/verify",
  },
  {
    label: "Standard HTTPS Domain",
    value: "https://developer.mozilla.org/en-US/docs/Web/Security",
  },
];

const SAMPLE_MESSAGES = [
  {
    label: "Bank OTP Scam SMS",
    value:
      "URGENT: Your bank account will be suspended within 24 hours due to unusual activity. Verify your OTP and password immediately at http://bit.ly/3xVerifyNow",
  },
  {
    label: "Prize / Gift Card Lure",
    value:
      "Congratulations! You have won a free iPhone 16 reward. Pay a small delivery fee via gift card to claim your prize today!",
  },
  {
    label: "Routine Team Update",
    value: "Hey team, our sprint review is moved to 3:00 PM tomorrow in Room B.",
  },
];

export default function ScannerPanel({ onScanUrl, onScanMessage, isScanning }) {
  const [activeTab, setActiveTab] = useState("url");
  const [urlInput, setUrlInput] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isScanning) return;
    if (activeTab === "url" && urlInput.trim()) {
      onScanUrl(urlInput.trim());
    } else if (activeTab === "message" && messageInput.trim()) {
      onScanMessage(messageInput.trim());
    }
  };

  return (
    <div className="rounded-xl border border-slate-800/90 bg-[#0d1420] p-5 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              activeTab === "url"
                ? "border border-cyan-500/40 bg-cyan-500/15 text-cyan-300"
                : "border border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <Globe className="h-4 w-4" />
            URL Threat Scanner
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("message")}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              activeTab === "message"
                ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                : "border border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <MessageSquareWarning className="h-4 w-4" />
            Scam Message Analyzer
          </button>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[11px] font-medium text-slate-400">
          <Sparkles className="h-3 w-3 text-cyan-400" />
          Local Heuristic Engine
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        {activeTab === "url" ? (
          <div>
            <label htmlFor="url-input" className="block text-xs font-medium text-slate-400">
              Target URL to investigate
            </label>
            <div className="mt-1.5 flex flex-col gap-2.5 sm:flex-row">
              <input
                id="url-input"
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/login or suspicious-link.com"
                className="w-full rounded-lg border border-slate-700/80 bg-[#070b12] px-3.5 py-2.5 font-mono text-sm text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={isScanning || !urlInput.trim()}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Analyze URL
                  </>
                )}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-500">Test inputs:</span>
              {SAMPLE_URLS.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => setUrlInput(sample.value)}
                  className="rounded-md border border-slate-800 bg-slate-900/70 px-2.5 py-1 text-[11px] text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="msg-input" className="block text-xs font-medium text-slate-400">
              Suspicious SMS or email content
            </label>
            <textarea
              id="msg-input"
              rows={4}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Paste the suspicious SMS, WhatsApp, or email message here..."
              className="mt-1.5 w-full rounded-lg border border-slate-700/80 bg-[#070b12] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-500">Test inputs:</span>
                {SAMPLE_MESSAGES.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => setMessageInput(sample.value)}
                    className="rounded-md border border-slate-800 bg-slate-900/70 px-2.5 py-1 text-[11px] text-slate-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-300"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isScanning || !messageInput.trim()}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Analyze Message
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
