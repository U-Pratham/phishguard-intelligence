import React from "react";
import { Brain, Cpu, Info, ShieldAlert, ShieldCheck, WifiOff } from "lucide-react";

export default function MLAnalysisPanel({ ml, finalVerdict }) {
  if (!ml) return null;

  const isLoaded = ml.model_loaded;
  const isPhishing = ml.prediction === "phishing";
  const isStandaloneMlLowRisk = isLoaded && isPhishing && finalVerdict === "LOW RISK";

  const statusPill = !isLoaded
    ? "border-slate-500/40 bg-slate-500/10 pg-text-muted"
    : isPhishing
    ? "border-amber-500/40 bg-amber-500/15 text-amber-500"
    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";

  const StatusIcon = !isLoaded ? WifiOff : isPhishing ? ShieldAlert : ShieldCheck;

  return (
    <div className="rounded-xl border p-4 pg-surface-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-cyan-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider pg-text-primary">
            ML URL Pattern Classifier
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] pg-surface pg-text-secondary">
            <Cpu className="h-3 w-3 text-cyan-500" />
            {isLoaded ? `${ml.model_name} v${ml.model_version}` : "Model Unavailable"}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusPill}`}
          >
            <StatusIcon className="h-3 w-3" />
            {!isLoaded
              ? "Unavailable"
              : isPhishing
              ? `Pattern: Phishing (ML Score: ${ml.model_score ?? 0}/100)`
              : `Pattern: Legitimate (ML Score: ${ml.model_score ?? 0}/100)`}
          </span>
        </div>
      </div>

      <p className="mt-2.5 text-xs leading-relaxed pg-text-secondary">{ml.summary}</p>

      {isStandaloneMlLowRisk && (
        <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-2.5 text-[11px] pg-text-secondary">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-500" />
          <span>
            <strong>Why the final verdict is LOW RISK:</strong> The ML model flagged
            structural URL patterns, but local heuristics and external threat
            intelligence found no corroborating threat indicators. Evidence fusion caps
            standalone ML signals below the SUSPICIOUS threshold (30/100) to avoid
            false positives.
          </span>
        </div>
      )}

      {isLoaded && ml.top_features && ml.top_features.length > 0 && (
        <div
          className="mt-3 border-t pt-3"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider pg-text-muted">
            Top URL Features Evaluated
          </span>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ml.top_features.map((feat) => (
              <div
                key={feat.feature}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs pg-surface"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium pg-text-primary">{feat.label}</div>
                  <div className="text-[10px] pg-text-muted">
                    Importance: {(feat.importance * 100).toFixed(1)}%
                  </div>
                </div>
                <span className="ml-2 shrink-0 rounded border px-2 py-0.5 font-mono text-xs font-semibold text-cyan-500 pg-input">
                  {feat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-2.5 text-[11px] pg-text-muted">
        {ml.disclaimer} (Score is a pattern-similarity output, not a calibrated probability.)
      </p>
    </div>
  );
}
