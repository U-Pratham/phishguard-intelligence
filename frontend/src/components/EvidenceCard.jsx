import React from "react";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";

const SEVERITY_MAP = {
  high: {
    border: "border-rose-500/30",
    bg: "bg-rose-500/5",
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    icon: ShieldAlert,
    iconColor: "text-rose-400",
  },
  medium: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    icon: AlertTriangle,
    iconColor: "text-amber-400",
  },
  low: {
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/5",
    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    icon: Info,
    iconColor: "text-cyan-400",
  },
};

export default function EvidenceCard({ item }) {
  const cfg = SEVERITY_MAP[item.severity] || SEVERITY_MAP.low;
  const Icon = cfg.icon;

  return (
    <div className={`rounded-lg border ${cfg.border} ${cfg.bg} p-4 transition-colors`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Icon className={`h-4 w-4 shrink-0 ${cfg.iconColor}`} />
          <h4 className="text-sm font-semibold text-slate-100">{item.title}</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded border border-slate-700/80 bg-slate-900/70 px-2 py-0.5 text-[11px] font-medium text-slate-300">
            {item.category}
          </span>
          <span className={`rounded border px-2 py-0.5 text-[11px] font-semibold uppercase ${cfg.badge}`}>
            {item.severity} (+{item.points})
          </span>
        </div>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-300">{item.detail}</p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/70 pt-2.5 text-[11px]">
        {item.matched_text ? (
          <code className="max-w-full truncate rounded bg-slate-950/90 px-2 py-0.5 font-mono text-cyan-300">
            Match: {item.matched_text}
          </code>
        ) : (
          <span />
        )}
        <span className="text-slate-500">Source: {item.source}</span>
      </div>
    </div>
  );
}
