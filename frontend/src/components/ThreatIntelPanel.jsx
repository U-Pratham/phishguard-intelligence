import React from "react";
import {
  AlertTriangle,
  Cpu,
  ExternalLink,
  Radar,
  SearchX,
  ShieldAlert,
  WifiOff,
} from "lucide-react";

const STATUS_LABEL_STYLE = {
  "Confirmed threat": {
    pill: "border-rose-500/40 bg-rose-500/15 text-rose-500",
    icon: ShieldAlert,
  },
  "Suspicious indicators": {
    pill: "border-amber-500/40 bg-amber-500/15 text-amber-500",
    icon: AlertTriangle,
  },
  "No match found": {
    pill: "border-cyan-500/30 bg-cyan-500/10 text-cyan-500",
    icon: SearchX,
  },
  "Source unavailable": {
    pill: "border-slate-500/40 bg-slate-500/10 pg-text-muted",
    icon: WifiOff,
  },
};

export default function ThreatIntelPanel({ result }) {
  const sourcesChecked = result?.sources_checked || [];
  const externalIntel = result?.external_intelligence || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border p-4 pg-surface-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-500">
            <Cpu className="h-3.5 w-3.5" />
            <span>Local Analysis</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed pg-text-secondary">
            {result.local_summary ||
              "Local heuristic rules evaluated structural, keyword, and behavioral indicators."}
          </p>
        </div>

        <div className="rounded-xl border p-4 pg-surface-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-500">
            <Radar className="h-3.5 w-3.5" />
            <span>Sources Checked</span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {sourcesChecked.length === 0 ? (
              <span className="text-xs pg-text-muted">Local Heuristic Engine only</span>
            ) : (
              sourcesChecked.map((src, idx) => {
                const cfg =
                  STATUS_LABEL_STYLE[src.label] || STATUS_LABEL_STYLE["Source unavailable"];
                const Icon = cfg.icon;
                return (
                  <div
                    key={`${src.source}-${idx}`}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${cfg.pill}`}
                    title={src.detail}
                  >
                    <Icon className="h-3 w-3 shrink-0" />
                    <span className="font-semibold pg-text-primary">{src.source}:</span>
                    <span>{src.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-4 pg-surface-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider pg-text-secondary">
            External Threat Intelligence
          </h3>
          <span className="text-[11px] pg-text-muted">{externalIntel.length} lookup(s)</span>
        </div>

        {externalIntel.length === 0 ? (
          <p className="mt-2 text-xs pg-text-muted">
            No external URLs were queried for this scan.
          </p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {externalIntel.map((intel, idx) => {
              const label =
                intel.status === "CONFIRMED MALICIOUS"
                  ? "Confirmed threat"
                  : intel.status === "NOT LISTED"
                  ? "No match found"
                  : "Source unavailable";
              const cfg =
                STATUS_LABEL_STYLE[label] || STATUS_LABEL_STYLE["Source unavailable"];
              const Icon = cfg.icon;

              return (
                <div key={`${intel.provider}-${idx}`} className="rounded-lg border p-3 pg-surface">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold pg-text-primary">
                        {intel.provider}
                      </span>
                      {intel.checked_target && (
                        <code className="max-w-[260px] truncate rounded border px-1.5 py-0.5 font-mono text-[10px] pg-input pg-text-muted">
                          {intel.checked_target}
                        </code>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.pill}`}
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed pg-text-secondary">
                    {intel.summary}
                  </p>

                  {(intel.threat_type ||
                    intel.url_status ||
                    intel.date_added ||
                    (intel.tags && intel.tags.length > 0)) && (
                    <div
                      className="mt-2.5 flex flex-wrap items-center gap-2 border-t pt-2 text-[11px] pg-text-muted"
                      style={{ borderColor: "var(--border-subtle)" }}
                    >
                      {intel.threat_type && (
                        <span className="rounded border px-2 py-0.5 pg-surface-2">
                          Threat: <strong className="text-rose-500">{intel.threat_type}</strong>
                        </span>
                      )}
                      {intel.url_status && (
                        <span className="rounded border px-2 py-0.5 pg-surface-2">
                          URL Status: <strong className="pg-text-primary">{intel.url_status}</strong>
                        </span>
                      )}
                      {intel.date_added && (
                        <span className="rounded border px-2 py-0.5 pg-surface-2">
                          Added: <strong className="pg-text-primary">{intel.date_added}</strong>
                        </span>
                      )}
                      {intel.tags &&
                        intel.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-cyan-500"
                          >
                            #{tag}
                          </span>
                        ))}
                      {intel.reference_url && (
                        <a
                          href={intel.reference_url}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-auto inline-flex items-center gap-1 text-cyan-500 hover:underline"
                        >
                          URLhaus Entry
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
