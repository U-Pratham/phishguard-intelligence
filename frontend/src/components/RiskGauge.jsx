import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const VERDICT_STYLES = {
  "HIGH RISK": {
    color: "#f43f5e",
    badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  },
  SUSPICIOUS: {
    color: "#f59e0b",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  "LOW RISK": {
    color: "#10b981",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
};

export default function RiskGauge({ score = 0, verdict = "LOW RISK", scoreType }) {
  const style = VERDICT_STYLES[verdict] || VERDICT_STYLES["LOW RISK"];
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  const data = [
    { name: "Risk", value: clamped },
    { name: "Remaining", value: 100 - clamped },
  ];

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800/80 bg-[#0a101b] p-5">
      <div className="relative h-40 w-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="78%"
              startAngle={180}
              endAngle={0}
              innerRadius={64}
              outerRadius={82}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill={style.color} />
              <Cell fill="#1e293b" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center">
          <span className="font-mono text-4xl font-bold tracking-tight text-slate-100">
            {clamped}
          </span>
          <span className="text-[11px] uppercase tracking-widest text-slate-400">
            Combined Risk / 100
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-col items-center gap-1.5 text-center">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wider ${style.badge}`}
        >
          {verdict}
        </span>
        <p className="text-[11px] text-slate-500">
          {scoreType || "Heuristic & evidence fusion score (not a probability)"}
        </p>
      </div>
    </div>
  );
}
