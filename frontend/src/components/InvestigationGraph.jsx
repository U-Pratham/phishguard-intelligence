import React, { useMemo } from "react";
import ReactFlow, { Background, Controls, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { Network } from "lucide-react";

const VERDICT_BORDER = {
  "HIGH RISK": "#f43f5e",
  SUSPICIOUS: "#f59e0b",
  "LOW RISK": "#10b981",
};

const LABEL_BORDER = {
  "Confirmed threat": "#f43f5e",
  "Suspicious indicators": "#f59e0b",
  "No match found": "#06b6d4",
  "Source unavailable": "#64748b",
};

const SEVERITY_BORDER = {
  high: "#f43f5e",
  medium: "#f59e0b",
  low: "#06b6d4",
};

function baseNodeStyle(borderColor, bg = "#0a101b") {
  return {
    background: bg,
    color: "#e2e8f0",
    border: `1.5px solid ${borderColor}`,
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "11px",
    width: 210,
    boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
  };
}

function matchSourceNodeId(evidenceSource, sources) {
  const lower = (evidenceSource || "").toLowerCase();
  for (let i = 0; i < sources.length; i += 1) {
    const srcLower = sources[i].source.toLowerCase();
    if (
      lower === srcLower ||
      (lower.includes("ml") && srcLower.includes("ml")) ||
      (lower.includes("urlhaus") && srcLower.includes("urlhaus")) ||
      (lower.includes("local") && srcLower.includes("local"))
    ) {
      return `src-${i}`;
    }
  }
  return sources.length > 0 ? "src-0" : "target";
}

export default function InvestigationGraph({ result }) {
  const { nodes, edges } = useMemo(() => {
    if (!result) return { nodes: [], edges: [] };

    const sources = result.sources_checked || [];
    const evidence = result.evidence || [];
    const builtNodes = [];
    const builtEdges = [];

    const maxRows = Math.max(sources.length, Math.min(evidence.length, 6), 1);
    const centerY = ((maxRows - 1) * 95) / 2;

    // 1. Target Node
    const inputPreview =
      result.submitted_input.length > 42
        ? `${result.submitted_input.slice(0, 42)}...`
        : result.submitted_input;

    builtNodes.push({
      id: "target",
      position: { x: 10, y: centerY },
      data: {
        label: (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
              Submitted {result.scan_type}
            </div>
            <div className="mt-0.5 break-all font-mono text-[11px] text-slate-100">
              {inputPreview}
            </div>
          </div>
        ),
      },
      style: baseNodeStyle("#06b6d4"),
    });

    // 2. Detection Source Nodes
    const sourceStartY = centerY - ((sources.length - 1) * 95) / 2;
    sources.forEach((src, idx) => {
      const border = LABEL_BORDER[src.label] || "#64748b";
      const nodeId = `src-${idx}`;
      builtNodes.push({
        id: nodeId,
        position: { x: 265, y: sourceStartY + idx * 95 },
        data: {
          label: (
            <div>
              <div className="font-semibold text-slate-100">{src.source}</div>
              <div className="mt-0.5 text-[10px] text-slate-300">{src.label}</div>
            </div>
          ),
        },
        style: baseNodeStyle(border),
      });

      builtEdges.push({
        id: `e-target-${nodeId}`,
        source: "target",
        target: nodeId,
        style: { stroke: "#334155", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#475569" },
      });
    });

    // 3. Evidence Nodes (or clean-state node if 0 evidence items)
    const verdictId = "verdict";
    if (evidence.length === 0) {
      const noEvId = "ev-none";
      builtNodes.push({
        id: noEvId,
        position: { x: 525, y: centerY },
        data: {
          label: (
            <div>
              <div className="font-semibold text-slate-200">No Threat Indicators</div>
              <div className="mt-0.5 text-[10px] text-slate-400">
                0 heuristic or confirmed intel flags
              </div>
            </div>
          ),
        },
        style: baseNodeStyle("#10b981"),
      });

      sources.forEach((_, idx) => {
        builtEdges.push({
          id: `e-src-${idx}-${noEvId}`,
          source: `src-${idx}`,
          target: noEvId,
          style: { stroke: "#334155", strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#475569" },
        });
      });

      builtEdges.push({
        id: `e-${noEvId}-${verdictId}`,
        source: noEvId,
        target: verdictId,
        style: { stroke: "#10b981", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
      });
    } else {
      const visibleEvidence = evidence.slice(0, 6);
      const evStartY = centerY - ((visibleEvidence.length - 1) * 95) / 2;

      visibleEvidence.forEach((ev, idx) => {
        const evId = `ev-${idx}`;
        const border = SEVERITY_BORDER[ev.severity] || "#06b6d4";
        builtNodes.push({
          id: evId,
          position: { x: 525, y: evStartY + idx * 95 },
          data: {
            label: (
              <div>
                <div className="font-semibold text-slate-100">{ev.title}</div>
                <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{ev.category}</span>
                  <span className="font-mono text-slate-200">+{ev.points}</span>
                </div>
              </div>
            ),
          },
          style: baseNodeStyle(border),
        });

        const srcNodeId = matchSourceNodeId(ev.source, sources);
        builtEdges.push({
          id: `e-${srcNodeId}-${evId}`,
          source: srcNodeId,
          target: evId,
          style: { stroke: border, strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: border },
        });
        builtEdges.push({
          id: `e-${evId}-${verdictId}`,
          source: evId,
          target: verdictId,
          label: ev.externally_verified ? "verified" : `+${ev.points}`,
          labelStyle: { fill: "#94a3b8", fontSize: 10 },
          labelBgStyle: { fill: "#070b12", fillOpacity: 0.85 },
          style: { stroke: border, strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: border },
        });
      });

      // Connect any source with no evidence edges directly to verdict so the graph stays connected
      sources.forEach((_, idx) => {
        const srcId = `src-${idx}`;
        const hasOutgoing = builtEdges.some((e) => e.source === srcId);
        if (!hasOutgoing) {
          builtEdges.push({
            id: `e-${srcId}-${verdictId}`,
            source: srcId,
            target: verdictId,
            style: { stroke: "#334155", strokeDasharray: "4 4", strokeWidth: 1.2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#475569" },
          });
        }
      });
    }

    // 4. Final Verdict Node
    const verdictBorder = VERDICT_BORDER[result.verdict] || "#10b981";
    builtNodes.push({
      id: verdictId,
      position: { x: 785, y: centerY },
      data: {
        label: (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Combined Verdict
            </div>
            <div className="mt-0.5 text-xs font-bold text-slate-100">
              {result.verdict} · {result.risk_score}/100
            </div>
          </div>
        ),
      },
      style: baseNodeStyle(verdictBorder, "#0d1420"),
    });

    return { nodes: builtNodes, edges: builtEdges };
  }, [result]);

  if (!result) return null;

  return (
    <div className="rounded-xl border border-slate-800/80 bg-[#0a101b] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Threat Investigation Graph
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          {nodes.length} nodes · {edges.length} evidence links
        </span>
      </div>

      <div className="h-80 w-full overflow-hidden rounded-lg border border-slate-800 bg-[#070b12]">
        <ReactFlow
          key={result.id ?? `${result.scan_type}-${result.submitted_input}`}
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1e293b" gap={18} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
