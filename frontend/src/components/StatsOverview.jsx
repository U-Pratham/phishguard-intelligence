import React from "react";
import { Activity, AlertOctagon, BarChart3, ShieldCheck } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function StatsOverview({ stats }) {
  const safeStats = stats || {
    total_scans: 0,
    url_scans: 0,
    message_scans: 0,
    high_risk_count: 0,
    suspicious_count: 0,
    low_risk_count: 0,
    average_risk_score: 0,
  };

  const chartData = [
    { name: "Low Risk", count: safeStats.low_risk_count, color: "#10b981" },
    { name: "Suspicious", count: safeStats.suspicious_count, color: "#f59e0b" },
    { name: "High Risk", count: safeStats.high_risk_count, color: "#f43f5e" },
  ];

  const cards = [
    {
      label: "Total Scans",
      value: safeStats.total_scans,
      sub: `${safeStats.url_scans} URL · ${safeStats.message_scans} Msg`,
      icon: Activity,
      accent: "text-cyan-400",
    },
    {
      label: "High Risk Detected",
      value: safeStats.high_risk_count,
      sub: `${safeStats.suspicious_count} suspicious`,
      icon: AlertOctagon,
      accent: "text-rose-400",
    },
    {
      label: "Avg Heuristic Score",
      value: `${safeStats.average_risk_score}`,
      sub: "Out of 100",
      icon: BarChart3,
      accent: "text-emerald-400",
    },
    {
      label: "Low Risk Scans",
      value: safeStats.low_risk_count,
      sub: "Heuristic baseline",
      icon: ShieldCheck,
      accent: "text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-slate-800/90 bg-[#0d1420] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{card.label}</span>
                <Icon className={`h-4 w-4 ${card.accent}`} />
              </div>
              <div className="mt-2 font-mono text-2xl font-bold text-slate-100">
                {card.value}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">{card.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-800/90 bg-[#0d1420] p-4 lg:col-span-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Verdict Distribution</span>
          <span className="text-[11px] text-slate-500">All-time</span>
        </div>
        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 6, left: -24, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                contentStyle={{
                  backgroundColor: "#0a101b",
                  border: "1px solid #1e293b",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#e2e8f0",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
