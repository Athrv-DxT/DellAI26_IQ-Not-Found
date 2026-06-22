"use client";

import React from "react";
import { Award, Trophy, Medal } from "lucide-react";
import { LeaderboardItem } from "../app/lib/useStore";

interface LeaderboardProps {
  items: LeaderboardItem[];
  compact?: boolean;
  showConfidence?: boolean;
}

const rankIcons = [
  <Trophy key={1} className="w-4 h-4 text-amber-600" />,
  <Medal  key={2} className="w-4 h-4 text-slate-500"  />,
  <Medal  key={3} className="w-4 h-4 text-orange-500" />,
];

const rankStyles = [
  { bg: "#fffbeb", border: "#fcd34d", color: "#b45309" },
  { bg: "#f8fafc", border: "#e2e8f0", color: "#475569" },
  { bg: "#fff7ed", border: "#fed7aa", color: "#c2410c" },
  { bg: "var(--bg-soft)", border: "var(--border)", color: "var(--text-faint)" },
];

const stateStyles: Record<string, { bg: string; border: string; color: string }> = {
  APPROVED:       { bg: "#f0fdf4", border: "#86efac", color: "#166534" },
  MATCHED:        { bg: "#eff6ff", border: "#93c5fd", color: "#1d4ed8" },
  PENDING_REVIEW: { bg: "#fffbeb", border: "#fcd34d", color: "#b45309" },
  SCORED:         { bg: "#f5f3ff", border: "#c4b5fd", color: "#7c3aed" },
};

export default function Leaderboard({ items, compact = false, showConfidence = true }: LeaderboardProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <Award className="w-10 h-10 opacity-20" style={{ color: "var(--text-faint)" }} />
        <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>No project evaluations registered.</p>
        <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>Scores will appear here after reviewer evaluations are submitted.</p>
      </div>
    );
  }

  const maxScore = Math.max(...items.map(i => i.normalized_score), 1);

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const rs = rankStyles[Math.min(idx, 3)];
        const ss = stateStyles[item.state] ?? { bg: "var(--bg-soft)", border: "var(--border)", color: "var(--text-muted)" };
        const barWidth = Math.round((item.normalized_score / maxScore) * 100);

        return (
          <div key={item.project_id}
            className="rounded-xl overflow-hidden transition-all duration-300 group"
            style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
            {/* Progress bar */}
            <div className="h-0.5 transition-all duration-700" style={{ width: `${barWidth}%`, background: "linear-gradient(90deg, var(--primary), var(--sky))" }} />

            <div className={`${compact ? "py-2.5" : "py-3.5"} px-4 flex items-center gap-3`}>
              {/* Rank badge */}
              <div className="w-8 h-8 flex items-center justify-center rounded-full border text-xs font-bold shrink-0"
                style={{ background: rs.bg, borderColor: rs.border, color: rs.color }}>
                {idx < 3 ? rankIcons[idx] : <span>{idx + 1}</span>}
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate transition" style={{ color: "var(--text)" }}>
                  {item.title}
                </h3>
                {!compact && (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold border"
                      style={{ background: ss.bg, borderColor: ss.border, color: ss.color }}>
                      {item.state}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                      {item.eval_count} evaluation{item.eval_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Score */}
              <div className="text-right shrink-0">
                <p className="font-black font-mono text-sm text-emerald-700">
                  {typeof item.normalized_score === "number" ? item.normalized_score.toFixed(2) : item.normalized_score}
                </p>
                {showConfidence && !compact && (
                  <p className="text-[10px] font-mono" style={{ color: "var(--text-faint)" }}>
                    Raw: {typeof item.raw_average === "number" ? item.raw_average.toFixed(2) : item.raw_average}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
