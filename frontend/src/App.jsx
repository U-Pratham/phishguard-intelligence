import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  FileSearch,
  Info,
  Shield,
  SlidersHorizontal,
  Terminal,
} from "lucide-react";
import {
  analyzeMessage,
  analyzeUrl,
  checkHealth,
  fetchHistory,
  fetchMlMetrics,
  fetchStats,
} from "./api";
import EvidenceCard from "./components/EvidenceCard";
import HistoryTable from "./components/HistoryTable";
import InvestigationGraph from "./components/InvestigationGraph";
import MLAnalysisPanel from "./components/MLAnalysisPanel";
import ModelPerformancePanel from "./components/ModelPerformancePanel";
import RiskGauge from "./components/RiskGauge";
import ScannerPanel from "./components/ScannerPanel";
import SimpleModeView from "./components/SimpleModeView";
import StatsOverview from "./components/StatsOverview";
import ThemeSelector from "./components/ThemeSelector";
import ThreatIntelPanel from "./components/ThreatIntelPanel";

const VIEW_STORAGE_KEY = "phishguard_view_mode";

function getInitialView() {
  try {
    const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved === "advanced" || saved === "simple") {
      return saved;
    }
  } catch {
    // ignore storage errors
  }
  return "simple";
}

export default function App() {
  const [view, setView] = useState(getInitialView);
  const [health, setHealth] = useState({ status: "checking" });
  const [stats, setStats] = useState(null);
  const [mlMetrics, setMlMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [currentResult, setCurrentResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");

  const loadDashboardData = useCallback(
    async (typeFilter = filterType) => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          fetchStats(),
          fetchHistory(50, typeFilter),
        ]);
        setStats(statsRes);
        setHistory(historyRes);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data from backend.");
      }
    },
    [filterType]
  );

  useEffect(() => {
    checkHealth()
      .then((res) => setHealth(res))
      .catch(() => setHealth({ status: "offline" }));
    fetchMlMetrics()
      .then((res) => setMlMetrics(res))
      .catch(() => setMlMetrics({ available: false }));
    loadDashboardData("");
  }, []);

  const handleViewChange = (nextView) => {
    setError("");
    setView(nextView);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, nextView);
    } catch {
      // ignore storage errors
    }
  };

  const handleFilterChange = (newType) => {
    setFilterType(newType);
    loadDashboardData(newType);
  };

  const handleScanUrl = async (url) => {
    setError("");
    setIsScanning(true);
    try {
      const result = await analyzeUrl(url);
      setCurrentResult(result);
      await loadDashboardData(filterType);
    } catch (err) {
      setError(err.message || "URL analysis failed.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanMessage = async (message) => {
    setError("");
    setIsScanning(true);
    try {
      const result = await analyzeMessage(message);
      setCurrentResult(result);
      await loadDashboardData(filterType);
    } catch (err) {
      setError(err.message || "Message analysis failed.");
    } finally {
      setIsScanning(false);
    }
  };

  const urlhausStatus = health?.providers?.urlhaus;
  const mlStatus = health?.providers?.ml_classifier;

  return (
    <div
      className="min-h-screen transition-colors"
      style={{ backgroundColor: "var(--bg-app)", color: "var(--text-primary)" }}
    >
      {/* Top Bar */}
      <header
        className="sticky top-0 z-20 border-b backdrop-blur-md"
        style={{ backgroundColor: "var(--bg-header)", borderColor: "var(--border-subtle)" }}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10">
              <Shield className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight pg-text-primary">
                PhishGuard <span className="text-cyan-500">Intelligence</span>
              </h1>
              <p className="text-[11px] pg-text-muted">
                {view === "simple"
                  ? "Scam & Link Safety Checker"
                  : "Advanced Threat Investigation & Evidence Fusion"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Theme Selector */}
            <ThemeSelector />

            {/* Simple View / Advanced Analysis Switch */}
            <div
              role="group"
              aria-label="Analysis view"
              className="inline-flex items-center rounded-lg border p-0.5 pg-surface"
            >
              <button
                type="button"
                onClick={() => handleViewChange("simple")}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  view === "simple"
                    ? "bg-cyan-600 text-white"
                    : "pg-text-muted hover:text-cyan-500"
                }`}
              >
                Simple View
              </button>
              <button
                type="button"
                onClick={() => handleViewChange("advanced")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  view === "advanced"
                    ? "bg-emerald-600 text-white"
                    : "pg-text-muted hover:text-emerald-500"
                }`}
              >
                <SlidersHorizontal className="h-3 w-3" />
                Advanced Analysis
              </button>
            </div>

            {view === "advanced" && (
              <div className="hidden items-center gap-1.5 rounded-full border px-3 py-1 text-xs lg:inline-flex pg-surface pg-text-secondary">
                <Cpu className="h-3.5 w-3.5 text-emerald-500" />
                <span>
                  Heuristics{mlStatus === "loaded" ? " + ML" : " (ML Off)"}
                  {urlhausStatus === "configured" ? " + URLhaus" : " (URLhaus Key Missing)"}
                </span>
              </div>
            )}

            <div
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                health.status === "ok"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                  : health.status === "checking"
                  ? "pg-surface pg-text-muted"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-500"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  health.status === "ok"
                    ? "bg-emerald-500"
                    : health.status === "checking"
                    ? "bg-slate-500"
                    : "bg-rose-500"
                }`}
              />
              {health.status === "ok"
                ? "Online"
                : health.status === "checking"
                ? "Connecting..."
                : "Offline"}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {view === "simple" ? (
          <SimpleModeView
            onScanUrl={handleScanUrl}
            onScanMessage={handleScanMessage}
            isScanning={isScanning}
            currentResult={currentResult}
            error={error}
            onOpenAdvanced={() => handleViewChange("advanced")}
          />
        ) : (
          <>
            {/* Clear Advanced Analysis Banner + Return to Simple View */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 pg-surface">
              <div className="flex items-center gap-2.5 text-xs pg-text-secondary">
                <SlidersHorizontal className="h-4 w-4 text-emerald-500" />
                <span>
                  <strong>Advanced Analysis:</strong> Technical heuristics, ML classifier
                  features, URLhaus threat intelligence, investigation graph, and scan
                  history.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleViewChange("simple")}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold text-cyan-500 transition-colors hover:bg-cyan-500/10 pg-surface-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to Simple View
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Stats Overview */}
            <StatsOverview stats={stats} />

            {/* Scanner */}
            <ScannerPanel
              onScanUrl={handleScanUrl}
              onScanMessage={handleScanMessage}
              isScanning={isScanning}
            />

            {/* Investigation Report + History */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <section className="space-y-4 lg:col-span-7">
                <div className="rounded-xl border p-5 pg-surface">
                  <div
                    className="flex items-center justify-between border-b pb-3.5"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <div className="flex items-center gap-2">
                      <FileSearch className="h-4 w-4 text-cyan-500" />
                      <h2 className="text-sm font-semibold pg-text-primary">
                        Investigation Report
                      </h2>
                    </div>
                    {currentResult && (
                      <span className="rounded border px-2.5 py-0.5 text-[11px] font-medium pg-surface-2 pg-text-secondary">
                        {currentResult.detection_source}
                      </span>
                    )}
                  </div>

                  {!currentResult ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                      <Terminal className="h-8 w-8 pg-text-muted" />
                      <p className="mt-3 text-sm font-medium pg-text-secondary">
                        No active investigation selected
                      </p>
                      <p className="mt-1 max-w-md text-xs pg-text-muted">
                        Run a URL or scam message scan above, or select a previous scan from
                        the SQLite history panel to inspect its combined evidence report.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-5">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                        <div className="md:col-span-5">
                          <RiskGauge
                            score={currentResult.risk_score}
                            verdict={currentResult.verdict}
                            scoreType={currentResult.score_type}
                          />
                        </div>
                        <div className="flex flex-col justify-between rounded-xl border p-4 md:col-span-7 pg-surface-2">
                          <div>
                            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider pg-text-muted">
                              <span>Submitted {currentResult.scan_type}</span>
                              <span>Scan #{currentResult.id ?? "—"}</span>
                            </div>
                            <div className="mt-2 max-h-24 overflow-y-auto break-all rounded-md border p-2.5 font-mono text-xs text-cyan-500 pg-input">
                              {currentResult.submitted_input}
                            </div>
                            <p className="mt-3 text-xs leading-relaxed pg-text-secondary">
                              {currentResult.explanation}
                            </p>
                          </div>

                          <div
                            className="mt-4 border-t pt-3"
                            style={{ borderColor: "var(--border-subtle)" }}
                          >
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500">
                              Recommended Actions
                            </span>
                            <ul className="mt-1.5 space-y-1">
                              {currentResult.recommended_actions.map((action, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-xs pg-text-secondary"
                                >
                                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Local Analysis + Threat Intelligence + Sources Checked */}
                      <ThreatIntelPanel result={currentResult} />

                      {/* ML Phishing URL Classifier */}
                      {currentResult.ml_analysis && (
                        <MLAnalysisPanel
                          ml={currentResult.ml_analysis}
                          finalVerdict={currentResult.verdict}
                        />
                      )}

                      {/* Threat Investigation Graph */}
                      <InvestigationGraph result={currentResult} />

                      {/* Evidence Breakdown */}
                      <div>
                        <div className="mb-2.5 flex items-center justify-between">
                          <h3 className="text-xs font-semibold uppercase tracking-wider pg-text-muted">
                            Evidence Breakdown ({currentResult.evidence.length})
                          </h3>
                        </div>

                        {currentResult.evidence.length === 0 ? (
                          <div className="rounded-lg border p-4 text-xs pg-surface-2 pg-text-muted">
                            No local heuristic indicators or confirmed external matches were
                            found for this input. Note that absence of matches does not
                            prove the target is safe.
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {currentResult.evidence.map((item, idx) => (
                              <EvidenceCard key={`${item.id}-${idx}`} item={item} />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Limitations */}
                      {currentResult.limitations && currentResult.limitations.length > 0 && (
                        <div className="rounded-xl border p-4 pg-surface-2">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider pg-text-muted">
                            <Info className="h-3.5 w-3.5 text-cyan-500" />
                            <span>Limitations</span>
                          </div>
                          <ul className="mt-2 space-y-1 text-xs pg-text-muted">
                            {currentResult.limitations.map((lim, idx) => (
                              <li key={idx}>• {lim}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>

              <aside className="lg:col-span-5">
                <HistoryTable
                  items={history}
                  selectedId={currentResult?.id}
                  onSelect={setCurrentResult}
                  filterType={filterType}
                  onFilterChange={handleFilterChange}
                />
              </aside>
            </div>

            {/* ML Model Performance */}
            <ModelPerformancePanel metrics={mlMetrics} />
          </>
        )}
      </main>
    </div>
  );
}
