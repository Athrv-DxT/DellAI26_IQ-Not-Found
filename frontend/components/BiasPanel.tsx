"use client";

import React from "react";
import { AlertTriangle, ShieldCheck, Clock } from "lucide-react";
import { BiasAlert } from "../app/lib/useStore";

interface BiasPanelProps {
  alerts: BiasAlert[];
  onResolve?: (id: number) => void;
  compact?: boolean;
}

const typeStyles: Record<string, { label: string; bg: string; border: string; color: string; dotColor: string }> = {
  gender:     { label: "Gender Bias",    bg: "#fef2f2", border: "#fca5a5", color: "#b91c1c", dotColor: "#ef4444" },
  geographic: { label: "Geographic",     bg: "#fffbeb", border: "#fcd34d", color: "#b45309", dotColor: "#f59e0b" },
  language:   { label: "Language/Accent",bg: "#eff6ff", border: "#93c5fd", color: "#1d4ed8", dotColor: "#3b82f6" },
  tech:       { label: "Tech Stack",     bg: "#faf5ff", border: "#d8b4fe", color: "#7c3aed", dotColor: "#8b5cf6" },
  default:    { label: "Outlier",        bg: "#fff7ed", border: "#fed7aa", color: "#c2410c", dotColor: "#f97316" },
};

function detectType(details: string) {
  const d = details.toLowerCase();
  if (d.includes("gender")) return "gender";
  if (d.includes("geographic") || d.includes("region")) return "geographic";
  if (d.includes("language") || d.includes("accent")) return "language";
  if (d.includes("tech")) return "tech";
  return "default";
}

export default function BiasPanel({ alerts, onResolve, compact = false }: BiasPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <ShieldCheck className="w-10 h-10 text-emerald-400" />
        <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>No evaluation bias outliers detected in active score sets.</p>
        <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>Z-score anomaly detection running continuously...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => {
        const type = detectType(alert.details);
        const s = typeStyles[type];
        return (
          <div key={alert.id}
            className="p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-in transition"
            style={{ background: s.bg, border: `1.5px solid ${s.border}`, animationDelay: `${idx * 60}ms`, animationFillMode: "backwards" }}>
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider"
                  style={{ background: "rgba(255,255,255,0.6)", border: `1px solid ${s.border}`, color: s.color }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: s.dotColor }} />
                  {s.label}
                </span>
                <span className="font-mono text-[9px] flex items-center gap-1" style={{ color: "var(--text-faint)" }}>
                  <Clock className="w-3 h-3" />
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: s.color }}>{alert.details}</p>
              {alert.action && (
                <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                  Action: <span className="font-mono" style={{ color: "var(--text-muted)" }}>{alert.action}</span>
                </p>
              )}
            </div>

            {onResolve && !compact && (
              <button onClick={() => onResolve(alert.id)}
                className="px-3.5 py-1.5 text-white font-bold rounded-lg text-[10px] shrink-0 whitespace-nowrap transition active:scale-95"
                style={{ background: "#3b82f6" }}>
                Resolve Alert
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
