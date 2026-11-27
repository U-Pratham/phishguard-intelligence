import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Cpu,
  FileSearch,
  Info,
  Shield,
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
import StatsOverview from "./components/StatsOverview";
import ThreatIntelPanel from "./components/ThreatIntelPanel";

export default function App() {
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
    <div className="min-h-screen bg-[#070b12] text-slate-100">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-[#070b12]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10">
              <Shield className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-100">
                PhishGuard <span className="text-cyan-400">Intelligence</span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Explainable Threat Investigation Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs text-slate-300 sm:inline-flex">
              <Cpu className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                Heuristics{mlStatus === "loaded" ? " + ML" : " (ML Off)"}
                {urlhausStatus === "configured" ? " + URLhaus" : " (URLhaus Key Missing)"}
              </span>
            </div>
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                health.status === "ok"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : health.status === "checking"
                  ? "border-slate-700 bg-slate-900 text-slate-400"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-300"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  health.status === "ok"
                    ? "bg-emerald-400"
                    : health.status === "checking"
                    ? "bg-slate-500"
                    : "bg-rose-400"
                }`}
              />
              {health.status === "ok"
                ? "API Online"
                : health.status === "checking"
                ? "Connecting..."
                : "API Offline"}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {error && (
          <div className="flex items-center gap-2.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
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
            <div className="rounded-xl border border-slate-800/90 bg-[#0d1420] p-5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
                <div className="flex items-center gap-2">
                  <FileSearch className="h-4 w-4 text-cyan-400" />
                  <h2 className="text-sm font-semibold text-slate-100">
                    Investigation Report
                  </h2>
                </div>
                {currentResult && (
                  <span className="rounded border border-slate-700 bg-slate-900 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                    {currentResult.detection_source}
                  </span>
                )}
              </div>

              {!currentResult ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <Terminal className="h-8 w-8 text-slate-600" />
                  <p className="mt-3 text-sm font-medium text-slate-300">
                    No active investigation selected
                  </p>
                  <p className="mt-1 max-w-md text-xs text-slate-500">
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
                    <div className="flex flex-col justify-between rounded-xl border border-slate-800/80 bg-[#0a101b] p-4 md:col-span-7">
                      <div>
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400">
                          <span>Submitted {currentResult.scan_type}</span>
                          <span>Scan #{currentResult.id ?? "—"}</span>
                        </div>
                        <div className="mt-2 max-h-24 overflow-y-auto break-all rounded-md border border-slate-800 bg-[#070b12] p-2.5 font-mono text-xs text-cyan-200">
                          {currentResult.submitted_input}
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-slate-300">
                          {currentResult.explanation}
                        </p>
                      </div>

                      <div className="mt-4 border-t border-slate-800/80 pt-3">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                          Recommended Actions
                        </span>
                        <ul className="mt-1.5 space-y-1">
                          {currentResult.recommended_actions.map((action, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs text-slate-300"
                            >
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
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
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Evidence Breakdown ({currentResult.evidence.length})
                      </h3>
                    </div>

                    {currentResult.evidence.length === 0 ? (
                      <div className="rounded-lg border border-slate-800 bg-[#0a101b] p-4 text-xs text-slate-400">
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
                    <div className="rounded-xl border border-slate-800/80 bg-[#0a101b] p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <Info className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Limitations</span>
                      </div>
                      <ul className="mt-2 space-y-1 text-xs text-slate-400">
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
      </main>
    </div>
  );
}
