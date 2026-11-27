import React from "react";
import { AlertTriangle, BadgeCheck, Cpu, Info, ShieldAlert } from "lucide-react";

const SEVERITY_MAP = {
  high: {
    border: "border-rose-500/35",
    bg: "bg-rose-500/5",
    badge: "bg-rose-500/15 text-rose-500 border-rose-500/30",
    icon: ShieldAlert,
    iconColor: "text-rose-500",
  },
  medium: {
    border: "border-amber-500/35",
    bg: "bg-amber-500/5",
    badge: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
  },
  low: {
    border: "border-cyan-500/35",
    bg: "bg-cyan-500/5",
    badge: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30",
    icon: Info,
    iconColor: "text-cyan-500",
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
          <h4 className="text-sm font-semibold pg-text-primary">{item.title}</h4>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {item.externally_verified ? (
            <span className="inline-flex items-center gap-1 rounded border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-500">
              <BadgeCheck className="h-3 w-3" />
              Externally Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium pg-surface pg-text-secondary">
              <Cpu className="h-3 w-3 text-cyan-500" />
              Local Heuristic
            </span>
          )}
          <span className="rounded border px-2 py-0.5 text-[11px] font-medium pg-surface pg-text-secondary">
            {item.category}
          </span>
          <span className={`rounded border px-2 py-0.5 text-[11px] font-semibold uppercase ${cfg.badge}`}>
            {item.severity} (+{item.points})
          </span>
        </div>
      </div>

      <p className="mt-2 text-xs leading-relaxed pg-text-secondary">{item.detail}</p>

      <div
        className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5 text-[11px]"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {item.matched_text ? (
          <code className="max-w-full truncate rounded border px-2 py-0.5 font-mono text-cyan-500 pg-input">
            Match: {item.matched_text}
          </code>
        ) : (
          <span />
        )}
        <span className="pg-text-muted">Source: {item.source}</span>
      </div>
    </div>
  );
}
