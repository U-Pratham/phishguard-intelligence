import React from "react";
import { Clock, Globe, MessageSquareWarning } from "lucide-react";

const VERDICT_PILL = {
  "HIGH RISK": "border-rose-500/30 bg-rose-500/15 text-rose-300",
  SUSPICIOUS: "border-amber-500/30 bg-amber-500/15 text-amber-300",
  "LOW RISK": "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
};

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function HistoryTable({ items, selectedId, onSelect, filterType, onFilterChange }) {
  return (
    <div className="rounded-xl border border-slate-800/90 bg-[#0d1420] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100">Scan History (SQLite)</h3>
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { label: "All", value: "" },
            { label: "URLs", value: "url" },
            { label: "Messages", value: "message" },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onFilterChange(opt.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                filterType === opt.value
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200 border border-transparent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-500">
          No scans recorded yet. Submit a URL or message above to begin.
        </div>
      ) : (
        <div className="mt-3 max-h-80 overflow-y-auto pr-1 space-y-2">
          {items.map((item) => {
            const isSelected = selectedId === item.id;
            const pill = VERDICT_PILL[item.verdict] || VERDICT_PILL["LOW RISK"];
            return (
              <button
                key={item.id ?? `${item.timestamp}-${item.submitted_input}`}
                type="button"
                onClick={() => onSelect(item)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  isSelected
                    ? "border-cyan-500/50 bg-cyan-500/10"
                    : "border-slate-800/80 bg-[#0a101b] hover:border-slate-700 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {item.scan_type === "url" ? (
                      <Globe className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                    ) : (
                      <MessageSquareWarning className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    )}
                    <span className="truncate font-mono text-xs text-slate-200">
                      {item.submitted_input}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-300">
                      {item.risk_score}/100
                    </span>
                    <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${pill}`}>
                      {item.verdict}
                    </span>
                  </div>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{item.evidence?.length || 0} indicator(s)</span>
                  <span>{formatTime(item.timestamp)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
