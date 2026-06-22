"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useStore } from "../lib/useStore";
import { ArrowLeft, BarChart2, TrendingUp, AlertOctagon, CheckSquare, RefreshCw, Layers, Database } from "lucide-react";

export default function AnalyticsDashboard() {
  const { submissions, leaderboard, biasAlerts, loading, refresh } = useStore();

  useEffect(() => { refresh(); }, []);

  const tracks = ["AI & Intelligent Agents", "Web3 & Decentralized Systems", "Cloud & Developer Platforms"];
  const trackStats = tracks.map(trackName => ({ name: trackName, count: submissions.filter(s => s.track === trackName && s.state !== "FLAGGED_DUPLICATE").length }));

  const biasDimensions = [
    { name: "Gender Bias",         count: biasAlerts.filter(a => a.details.toLowerCase().includes("gender")).length,     color: "#ef4444" },
    { name: "Geographic Bias",     count: biasAlerts.filter(a => a.details.toLowerCase().includes("geographic")).length, color: "#f59e0b" },
    { name: "Language/Accent",     count: biasAlerts.filter(a => a.details.toLowerCase().includes("language") || a.details.toLowerCase().includes("accent")).length, color: "#3b82f6" },
    { name: "Tech Stack Bias",     count: biasAlerts.filter(a => a.details.toLowerCase().includes("tech")).length,       color: "#8b5cf6" },
  ];

  const totalBiasAlerts = biasAlerts.length;
  const totalSubmissions = submissions.filter(s => s.state !== "FLAGGED_DUPLICATE").length;
  const scoredSubmissions = submissions.filter(s => s.state === "APPROVED" || s.state === "MATCHED").length;
  const completionPercentage = totalSubmissions > 0 ? Math.round((scoredSubmissions / totalSubmissions) * 100) : 0;

  const timelineData = [
    { day: "Day 1",      count: Math.max(2,  Math.round(totalSubmissions * 0.15)) },
    { day: "Day 2",      count: Math.max(5,  Math.round(totalSubmissions * 0.40)) },
    { day: "Day 3",      count: Math.max(9,  Math.round(totalSubmissions * 0.65)) },
    { day: "Day 4",      count: Math.max(12, Math.round(totalSubmissions * 0.85)) },
    { day: "Today",      count: totalSubmissions },
  ];

  const metricCards = [
    { label: "Total Submissions",   value: totalSubmissions,          icon: <Database className="w-6 h-6 text-sky-500" />,        color: "text-sky-700",     bg: "#f0f9ff", border: "#bae6fd" },
    { label: "Tracks Represented",  value: 3,                         icon: <Layers className="w-6 h-6 text-emerald-500" />,      color: "text-emerald-700", bg: "#f0fdf4", border: "#86efac" },
    { label: "Active Bias Flags",   value: totalBiasAlerts,           icon: <AlertOctagon className="w-6 h-6 text-rose-500" />,   color: "text-rose-700",    bg: "#fef2f2", border: "#fca5a5" },
    { label: "Scoring Completion",  value: `${completionPercentage}%`,icon: <CheckSquare className="w-6 h-6 text-violet-500" />,  color: "text-violet-700",  bg: "#faf5ff", border: "#d8b4fe" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
          Synchronizing Analytics Engine...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto space-y-6 animate-modal-open">

        {/* Header */}
        <header className="flex items-center justify-between pb-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="space-y-1">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition" style={{ color: "var(--sky)" }}>
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2" style={{ color: "var(--text)" }}>
              <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-sky-600" />
              </div>
              OS Metrics & Analytics
            </h1>
          </div>
          <button onClick={refresh} className="btn btn-ghost p-2.5">
            <RefreshCw className="w-4 h-4" />
          </button>
        </header>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {metricCards.map(({ label, value, icon, color, bg, border }) => (
            <div key={label} className="p-5 rounded-2xl flex items-center justify-between"
              style={{ background: bg, border: `1.5px solid ${border}` }}>
              <div>
                <p className="section-label mb-1">{label}</p>
                <p className={`text-2xl font-black font-mono ${color}`}>{value}</p>
              </div>
              {icon}
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Registration Timeline */}
          <section className="panel rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text)" }}>
              <TrendingUp className="w-4 h-4 text-sky-500" /> Registration Timeline
            </h2>
            <div className="h-56 relative flex items-end justify-between pt-5 px-2">
              <svg className="absolute inset-0 w-full h-full p-5 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="0" y1="20" x2="100" y2="20" stroke="var(--border)" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="var(--border)" strokeWidth="0.5" />
                <line x1="0" y1="80" x2="100" y2="80" stroke="var(--border)" strokeWidth="0.5" />
                <path d={`M 0 90 L 25 ${100 - (timelineData[0].count / (totalSubmissions || 1)) * 80} L 50 ${100 - (timelineData[1].count / (totalSubmissions || 1)) * 80} L 75 ${100 - (timelineData[2].count / (totalSubmissions || 1)) * 80} L 100 ${100 - (timelineData[4].count / (totalSubmissions || 1)) * 80}`}
                  fill="none" stroke="url(#line-grad)" strokeWidth="2.5" />
                <defs>
                  <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#3ecf8e" />
                  </linearGradient>
                </defs>
              </svg>
              {timelineData.map((d, idx) => (
                <div key={idx} className="flex flex-col items-center z-10 space-y-1">
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded" style={{ background: "var(--surface)", border: "1.5px solid var(--border)", color: "var(--text)" }}>{d.count}</span>
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{d.day}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Track Distribution */}
          <section className="panel rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text)" }}>
              <Layers className="w-4 h-4 text-emerald-500" /> Submissions per Track
            </h2>
            <div className="space-y-4 pt-2">
              {trackStats.map((track, idx) => {
                const maxVal = Math.max(...trackStats.map(t => t.count), 1);
                const percent = Math.round((track.count / maxVal) * 100);
                const colors = ["from-sky-400 to-sky-500", "from-violet-400 to-violet-500", "from-emerald-400 to-emerald-500"];
                const textColors = ["text-sky-700", "text-violet-700", "text-emerald-700"];
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold" style={{ color: "var(--text)" }}>{track.name}</span>
                      <span className={`font-mono font-black ${textColors[idx]}`}>{track.count} projects</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--bg-soft)", border: "1.5px solid var(--border)" }}>
                      <div className={`h-full bg-gradient-to-r ${colors[idx]} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Bias Breakdown */}
          <section className="panel rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text)" }}>
              <AlertOctagon className="w-4 h-4 text-rose-500" /> Bias Anomalies Breakdown
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
              {/* Donut */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border)" strokeWidth="2.5" />
                  {biasDimensions.map((dim, idx) => {
                    const total = totalBiasAlerts || 1;
                    const pct = (dim.count / total) * 100;
                    let offset = 0;
                    for (let i = 0; i < idx; i++) offset += (biasDimensions[i].count / total) * 100;
                    return (
                      <circle key={idx} cx="18" cy="18" r="15.915" fill="none"
                        stroke={dim.color} strokeWidth="3"
                        strokeDasharray={`${pct} ${100 - pct}`}
                        strokeDashoffset={-offset}
                        className="transition-all duration-500" />
                    );
                  })}
                </svg>
                <div className="absolute text-center">
                  <p className="text-xl font-black font-mono" style={{ color: "var(--text)" }}>{totalBiasAlerts}</p>
                  <p className="text-[9px] uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Flags</p>
                </div>
              </div>
              {/* Legend */}
              <div className="space-y-2.5">
                {biasDimensions.map((dim, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className="w-6 h-6 rounded flex items-center justify-center font-black text-[10px] font-mono" style={{ background: `${dim.color}15`, color: dim.color, border: `1.5px solid ${dim.color}30` }}>
                      {dim.count}
                    </span>
                    <span className="font-semibold" style={{ color: "var(--text)" }}>{dim.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Evaluation Progress */}
          <section className="panel rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text)" }}>
              <CheckSquare className="w-4 h-4 text-violet-500" /> Overall Evaluation Progress
            </h2>
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              <div className="relative w-44 h-24 flex items-end justify-center overflow-hidden">
                <svg className="w-44 h-44 absolute top-0" viewBox="0 0 36 36">
                  <path d="M 6 18 A 12 12 0 0 1 30 18" fill="none" stroke="var(--border)" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M 6 18 A 12 12 0 0 1 30 18" fill="none" stroke="#8b5cf6" strokeWidth="3.8" strokeLinecap="round"
                    strokeDasharray="100" strokeDashoffset={100 - (completionPercentage / 100) * 100}
                    className="transition-all duration-700" />
                </svg>
                <div className="text-center z-10">
                  <p className="text-3xl font-black font-mono text-violet-700">{completionPercentage}%</p>
                  <p className="section-label">Evaluation Rate</p>
                </div>
              </div>
              <p className="text-xs text-center leading-relaxed max-w-sm" style={{ color: "var(--text-muted)" }}>
                {scoredSubmissions} of {totalSubmissions} projects have been matched to reviewers and evaluated.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
