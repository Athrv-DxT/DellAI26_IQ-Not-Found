"use client";

import React from "react";
import { TrendingUp, Layers, AlertOctagon, CheckSquare, BarChart2 } from "lucide-react";
import { Submission, LeaderboardItem, BiasAlert } from "../app/lib/useStore";

interface AnalyticsChartsProps {
  submissions: Submission[];
  leaderboard: LeaderboardItem[];
  biasAlerts: BiasAlert[];
}

const TRACK_COLORS = [
  { from: "#3b82f6", to: "#6366f1", label: "sky" },
  { from: "#3ecf8e", to: "#10b981", label: "emerald" },
  { from: "#f59e0b", to: "#fbbf24", label: "amber" },
];

const TRACKS = [
  "AI & Intelligent Agents",
  "Web3 & Decentralized Systems",
  "Cloud & Developer Platforms",
];

const BIAS_DIMS = [
  { key: "gender",     name: "Gender Bias",    color: "#ef4444", textColor: "#b91c1c", bg: "#fef2f2", border: "#fca5a5" },
  { key: "geographic", name: "Geographic",      color: "#f59e0b", textColor: "#b45309", bg: "#fffbeb", border: "#fcd34d" },
  { key: "language",   name: "Language/Accent", color: "#3b82f6", textColor: "#1d4ed8", bg: "#eff6ff", border: "#93c5fd" },
  { key: "tech",       name: "Tech Stack Bias", color: "#8b5cf6", textColor: "#7c3aed", bg: "#faf5ff", border: "#d8b4fe" },
];

export default function AnalyticsCharts({ submissions, leaderboard, biasAlerts }: AnalyticsChartsProps) {
  const totalSubmissions = submissions.filter(s => s.state !== "FLAGGED_DUPLICATE").length;
  const scoredSubmissions = submissions.filter(s => s.state === "APPROVED" || s.state === "MATCHED").length;
  const completionPct = totalSubmissions > 0 ? Math.round((scoredSubmissions / totalSubmissions) * 100) : 0;

  const trackStats = TRACKS.map((t, i) => ({
    name: t, count: submissions.filter(s => s.track === t && s.state !== "FLAGGED_DUPLICATE").length, ...TRACK_COLORS[i],
  }));
  const maxTrack = Math.max(...trackStats.map(t => t.count), 1);

  const biasDims = BIAS_DIMS.map(dim => ({ ...dim, count: biasAlerts.filter(a => a.details.toLowerCase().includes(dim.key)).length }));
  const totalBias = biasAlerts.length;

  const timeline = [
    { day: "D1",  count: Math.max(2,  Math.round(totalSubmissions * 0.15)) },
    { day: "D2",  count: Math.max(5,  Math.round(totalSubmissions * 0.40)) },
    { day: "D3",  count: Math.max(9,  Math.round(totalSubmissions * 0.65)) },
    { day: "D4",  count: Math.max(12, Math.round(totalSubmissions * 0.85)) },
    { day: "Now", count: totalSubmissions },
  ];
  const maxTimeline = Math.max(...timeline.map(t => t.count), 1);

  const topN = leaderboard.slice(0, 5);
  const maxScore = Math.max(...topN.map(i => i.normalized_score), 1);

  const panelStyle = { background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "var(--r-xl)" };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Timeline */}
      <section className="p-6 space-y-4" style={panelStyle}>
        <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text)" }}>
          <TrendingUp className="w-4 h-4 text-sky-500" /> Registration Timeline
        </h2>
        <div className="relative h-44 flex items-end gap-3 pt-4">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {[20, 40, 60, 80].map(y => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="var(--border)" strokeWidth="0.5" />
            ))}
            <defs>
              <linearGradient id="tl-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#3ecf8e" />
              </linearGradient>
            </defs>
            <polyline
              points={timeline.map((d, i) => `${i * 25},${100 - (d.count / maxTimeline) * 85}`).join(" ")}
              fill="none" stroke="url(#tl-grad)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {timeline.map((d, i) => (
              <circle key={i} cx={i * 25} cy={100 - (d.count / maxTimeline) * 85} r="2.5" fill="#3b82f6" />
            ))}
          </svg>
          {timeline.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 z-10">
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded"
                style={{ background: "var(--surface)", border: "1.5px solid var(--border)", color: "var(--text)" }}>
                {d.count}
              </span>
              <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{d.day}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Track Bar Chart */}
      <section className="p-6 space-y-4" style={panelStyle}>
        <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text)" }}>
          <Layers className="w-4 h-4 text-emerald-500" /> Submissions per Track
        </h2>
        <div className="space-y-4 pt-2">
          {trackStats.map((t, i) => {
            const pct = Math.round((t.count / maxTrack) * 100);
            return (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold truncate max-w-[65%]" style={{ color: "var(--text)" }}>{t.name}</span>
                  <span className="font-mono font-bold" style={{ color: t.from }}>{t.count} projects</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--bg-soft)", border: "1.5px solid var(--border)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: `linear-gradient(to right, ${t.from}, ${t.to})` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bias Breakdown */}
      <section className="p-6 space-y-4" style={panelStyle}>
        <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text)" }}>
          <AlertOctagon className="w-4 h-4 text-rose-500" /> Bias Anomalies
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
          <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border)" strokeWidth="3" />
              {biasDims.map((dim, i) => {
                const total = totalBias || 1;
                const pct = (dim.count / total) * 100;
                let offset = 0;
                for (let j = 0; j < i; j++) offset += (biasDims[j].count / total) * 100;
                return (
                  <circle key={i} cx="18" cy="18" r="15.915" fill="none"
                    stroke={dim.color} strokeWidth="3"
                    strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-offset}
                    className="transition-all duration-500" />
                );
              })}
            </svg>
            <div className="absolute text-center">
              <p className="text-xl font-black font-mono" style={{ color: "var(--text)" }}>{totalBias}</p>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Flags</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {biasDims.map((dim, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 border rounded text-[9px] font-bold font-mono"
                  style={{ background: dim.bg, borderColor: dim.border, color: dim.textColor }}>
                  {dim.count}
                </span>
                <span className="font-semibold" style={{ color: "var(--text)" }}>{dim.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Score Distribution */}
      <section className="p-6 space-y-4" style={panelStyle}>
        <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text)" }}>
          <BarChart2 className="w-4 h-4 text-violet-500" /> Top Project Scores
        </h2>
        {topN.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-xs italic" style={{ color: "var(--text-faint)" }}>No evaluations yet.</div>
        ) : (
          <div className="flex items-end gap-3 h-44 pt-4">
            {topN.map((item, i) => {
              const pct = Math.round((item.normalized_score / maxScore) * 85);
              return (
                <div key={item.project_id} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-[9px] font-mono text-emerald-700 font-black">
                    {typeof item.normalized_score === "number" ? item.normalized_score.toFixed(1) : item.normalized_score}
                  </span>
                  <div className="w-full rounded-t-lg transition-all duration-700"
                    style={{ height: `${pct}%`, background: "linear-gradient(to top, #3b82f6, #8b5cf6)", minHeight: 4 }} />
                  <span className="text-[8px] uppercase tracking-wider text-center truncate w-full" style={{ color: "var(--text-faint)" }}>#{i + 1}</span>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <div>
            <p className="section-label">Evaluation Rate</p>
            <p className="text-lg font-black font-mono text-violet-700">{completionPct}%</p>
          </div>
          <div className="text-right">
            <p className="section-label">Scored / Total</p>
            <p className="text-lg font-black font-mono" style={{ color: "var(--text)" }}>{scoredSubmissions} / {totalSubmissions}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
