import React from "react";
import { BarChart2, Database } from "lucide-react";

function MetricBox({ label, value }) {
  return (
    <div className="rounded-lg border p-2.5 text-center pg-input">
      <div className="text-[10px] uppercase tracking-wider pg-text-muted">{label}</div>
      <div className="mt-1 font-mono text-sm font-bold pg-text-primary">
        {typeof value === "number" ? `${(value * 100).toFixed(2)}%` : "—"}
      </div>
    </div>
  );
}

export default function ModelPerformancePanel({ metrics }) {
  if (!metrics || !metrics.available) {
    return (
      <div className="rounded-xl border p-5 pg-surface">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-cyan-500" />
          <h3 className="text-sm font-semibold pg-text-primary">
            ML Model Evaluation & Benchmarks
          </h3>
        </div>
        <p className="mt-2 text-xs pg-text-muted">
          ML model artifacts are not loaded yet. Run{" "}
          <code className="rounded border px-1.5 py-0.5 text-cyan-500 pg-input">
            .\venv\Scripts\python.exe -m backend.ml.train
          </code>{" "}
          to train and evaluate the models.
        </p>
      </div>
    );
  }

  const rf = metrics.metrics?.RandomForestClassifier;
  const lr = metrics.metrics?.LogisticRegression;
  const selectedMetrics = metrics.metrics?.[metrics.selected_model];
  const cm = selectedMetrics?.confusion_matrix;

  return (
    <div className="rounded-xl border p-5 pg-surface">
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b pb-3.5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-cyan-500" />
          <h3 className="text-sm font-semibold pg-text-primary">
            ML Model Evaluation & Benchmarks (Held-Out Test Set)
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] pg-text-muted">
          <Database className="h-3.5 w-3.5 text-emerald-500" />
          <span>
            {metrics.dataset?.name} · {metrics.dataset?.used_rows?.toLocaleString()} URLs
            (80/20 stratified split)
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-8">
          {[
            { name: "RandomForestClassifier", data: rf },
            { name: "LogisticRegression", data: lr },
          ].map(
            (entry) =>
              entry.data && (
                <div
                  key={entry.name}
                  className={`rounded-xl border p-3.5 ${
                    metrics.selected_model === entry.name
                      ? "border-cyan-500/40 bg-cyan-500/5"
                      : "pg-surface-2"
                  }`}
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-xs font-semibold pg-text-primary">
                      {entry.name}
                    </span>
                    {metrics.selected_model === entry.name && (
                      <span className="rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-cyan-500">
                        Active Model
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <MetricBox label="Accuracy" value={entry.data.accuracy} />
                    <MetricBox label="Precision" value={entry.data.precision} />
                    <MetricBox label="Recall" value={entry.data.recall} />
                    <MetricBox label="F1-Score" value={entry.data.f1_score} />
                  </div>
                </div>
              )
          )}
        </div>

        <div className="rounded-xl border p-4 lg:col-span-4 pg-surface-2">
          <div className="text-xs font-semibold pg-text-primary">
            Confusion Matrix ({metrics.selected_model})
          </div>
          <p className="mt-0.5 text-[11px] pg-text-muted">
            Test samples: {selectedMetrics?.test_samples?.toLocaleString() ?? "—"}
          </p>

          {cm && cm.length === 2 ? (
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-2.5">
                <div className="text-[10px] pg-text-muted">True Legitimate</div>
                <div className="mt-1 font-mono text-base font-bold text-emerald-500">
                  {cm[0][0].toLocaleString()}
                </div>
              </div>
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-2.5">
                <div className="text-[10px] pg-text-muted">False Positive</div>
                <div className="mt-1 font-mono text-base font-bold text-amber-500">
                  {cm[0][1].toLocaleString()}
                </div>
              </div>
              <div className="rounded-lg border border-rose-500/25 bg-rose-500/5 p-2.5">
                <div className="text-[10px] pg-text-muted">False Negative</div>
                <div className="mt-1 font-mono text-base font-bold text-rose-500">
                  {cm[1][0].toLocaleString()}
                </div>
              </div>
              <div className="rounded-lg border border-cyan-500/25 bg-cyan-500/5 p-2.5">
                <div className="text-[10px] pg-text-muted">True Phishing</div>
                <div className="mt-1 font-mono text-base font-bold text-cyan-500">
                  {cm[1][1].toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs pg-text-muted">Confusion matrix unavailable.</p>
          )}
        </div>
      </div>
    </div>
  );
}
