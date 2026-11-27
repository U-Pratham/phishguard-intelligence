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
      accent: "text-cyan-500",
    },
    {
      label: "High Risk Detected",
      value: safeStats.high_risk_count,
      sub: `${safeStats.suspicious_count} suspicious`,
      icon: AlertOctagon,
      accent: "text-rose-500",
    },
    {
      label: "Avg Combined Score",
      value: `${safeStats.average_risk_score}`,
      sub: "Heuristics + ML + Intel (0–100)",
      icon: BarChart3,
      accent: "text-emerald-500",
    },
    {
      label: "Low Risk Scans",
      value: safeStats.low_risk_count,
      sub: "Combined score < 30",
      icon: ShieldCheck,
      accent: "text-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl border p-4 pg-surface">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium pg-text-muted">{card.label}</span>
                <Icon className={`h-4 w-4 ${card.accent}`} />
              </div>
              <div className="mt-2 font-mono text-2xl font-bold pg-text-primary">
                {card.value}
              </div>
              <div className="mt-1 text-[11px] pg-text-muted">{card.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border p-4 lg:col-span-4 pg-surface">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium pg-text-muted">Verdict Distribution</span>
          <span className="text-[11px] pg-text-muted">All-time</span>
        </div>
        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 6, left: -24, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--chart-tick)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                contentStyle={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--text-primary)",
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
