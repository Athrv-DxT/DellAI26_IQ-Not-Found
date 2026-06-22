"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useStore } from "../lib/useStore";
import BiasPanel from "../../components/BiasPanel";
import Leaderboard from "../../components/Leaderboard";
import AnalyticsCharts from "../../components/AnalyticsCharts";
import {
  Terminal, ShieldAlert, RefreshCw, Award, Play,
  CheckCircle2, AlertTriangle, Activity, Database,
  Layers, BarChart2, XCircle, Users, Send, Star, Trophy,
} from "lucide-react";

const API_BASE = "http://localhost:8000";
type ActiveTab = "overview" | "assignments" | "bias" | "analytics";

export default function DashboardPage() {
  const { submissions, leaderboard, logs, biasAlerts, loading, refresh, resolveAlert, overrideState } = useStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [evalStatus, setEvalStatus] = useState<{ evaluation_closed: boolean }>({ evaluation_closed: false });
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState("All");
  const [isVerifyingLedger, setIsVerifyingLedger] = useState(false);
  const [ledgerResult, setLedgerResult] = useState<{ is_valid: boolean; verified_blocks: number; errors?: string[] } | null>(null);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [winnerCert, setWinnerCert] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isGeneratingResults, setIsGeneratingResults] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const fetchAssignmentsAndResults = async () => {
    try {
      const [aRes, rRes] = await Promise.all([fetch(`${API_BASE}/api/assignments`), fetch(`${API_BASE}/api/results`)]);
      if (aRes.ok) setAssignments(await aRes.json());
      if (rRes.ok) setResults(await rRes.json());
    } catch {}
  };
  const fetchEvaluationStatus = async () => {
    try { const res = await fetch(`${API_BASE}/api/config/status`); if (res.ok) setEvalStatus(await res.json()); } catch {}
  };
  useEffect(() => { fetchEvaluationStatus(); fetchAssignmentsAndResults(); }, []);
  useEffect(() => { fetchAssignmentsAndResults(); }, [submissions, leaderboard]);
  useEffect(() => { terminalEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const triggerRefresh = async () => { setIsRefreshing(true); await refresh(); await fetchEvaluationStatus(); await fetchAssignmentsAndResults(); setIsRefreshing(false); };
  const handleAssignReviewers = async () => { setIsAssigning(true); try { const res = await fetch(`${API_BASE}/api/review/assign`, { method: "POST" }); if (res.ok) await triggerRefresh(); else alert("Failed to assign reviewers."); } catch { alert("Error assigning reviewers."); } finally { setIsAssigning(false); } };
  const handleGenerateResults = async () => { setIsGeneratingResults(true); try { const res = await fetch(`${API_BASE}/api/results/generate`, { method: "POST" }); if (res.ok) await triggerRefresh(); else alert("Failed to generate results."); } catch { alert("Error generating results."); } finally { setIsGeneratingResults(false); } };
  const toggleEvaluationStatus = async () => { setIsTogglingStatus(true); try { const res = await fetch(`${API_BASE}/api/config/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ evaluation_closed: !evalStatus.evaluation_closed }) }); if (res.ok) { setEvalStatus(await res.json()); await refresh(); } } catch {} finally { setIsTogglingStatus(false); } };
  const seedInitialData = async () => { setIsSeeding(true); try { const res = await fetch(`${API_BASE}/api/seed`, { method: "POST" }); if (res.ok) await refresh(); else alert("Failed to seed initial data."); } catch { alert("Error seeding database."); } finally { setIsSeeding(false); } };
  const runLedgerVerification = async () => { setIsVerifyingLedger(true); try { const res = await fetch(`${API_BASE}/api/audit-logs/verify`); if (res.ok) setLedgerResult(await res.json()); } catch {} finally { setIsVerifyingLedger(false); } };
  const fetchWinnerCertificate = async () => { try { const res = await fetch(`${API_BASE}/api/analytics/winner`); const data = await res.json(); if (data.status === "SUCCESS") { setWinnerCert(data.certificate); setIsWinnerModalOpen(true); } else alert(data.message || "Leaderboard is incomplete."); } catch { alert("Error generating winner certificate."); } };

  const flaggedSubmissions = submissions.filter(s => s.state === "FLAGGED_DUPLICATE");
  const filteredSubmissions = submissions.filter(s => s.state !== "FLAGGED_DUPLICATE" && (selectedTrack === "All" || s.track === selectedTrack));

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "overview",    label: "Overview",    icon: <Activity className="w-4 h-4" />    },
    { key: "assignments", label: "Assignments", icon: <Layers className="w-4 h-4" />     },
    { key: "bias",        label: "Bias Alerts", icon: <ShieldAlert className="w-4 h-4" />, badge: biasAlerts.length },
    { key: "analytics",  label: "Analytics",   icon: <BarChart2 className="w-4 h-4" />   },
  ];

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--text)" }}>Organizer Dashboard</h1>
            </div>
            <p className="text-xs pl-10" style={{ color: "var(--text-muted)" }}>Dell Future Minds AI Hackathon 2026 · Agentic OS Console</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Link href="/register" className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition" style={{ background: "rgba(62,207,142,0.1)", color: "var(--primary-deep)", border: "1.5px solid rgba(62,207,142,0.25)" }}>
              <Users className="w-3.5 h-3.5" /> Register
            </Link>
            <Link href="/submit" className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition" style={{ background: "rgba(59,130,246,0.08)", color: "#1d4ed8", border: "1.5px solid rgba(59,130,246,0.2)" }}>
              <Send className="w-3.5 h-3.5" /> Submit
            </Link>
            <Link href="/review" className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition" style={{ background: "rgba(245,158,11,0.08)", color: "#b45309", border: "1.5px solid rgba(245,158,11,0.2)" }}>
              <Star className="w-3.5 h-3.5" /> Review
            </Link>
            <Link href="/results" className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition" style={{ background: "rgba(99,102,241,0.08)", color: "#4f46e5", border: "1.5px solid rgba(99,102,241,0.2)" }}>
              <Trophy className="w-3.5 h-3.5" /> Results
            </Link>
            <button onClick={triggerRefresh} disabled={isRefreshing} className="btn btn-ghost flex items-center gap-1.5 text-xs px-4 py-2">
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} /> Sync
            </button>
          </div>
        </header>

        {/* ── Hero Card ── */}
        <div className="rounded-2xl p-6 relative overflow-hidden animate-modal-open"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)", border: "1.5px solid #334155" }}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider" style={{ background: "#f59e0b", color: "#0f172a" }}>Featured</span>
                <span className="text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1" style={{ background: evalStatus.evaluation_closed ? "#16a34a" : "#3ecf8e" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {evalStatus.evaluation_closed ? "Evaluations Closed" : "Live & Active"}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Dell Future Minds AI Hackathon 2026</h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Submissions", value: submissions.filter(s => s.state !== "FLAGGED_DUPLICATE").length, color: "text-sky-400"  },
                  { label: "Bias Flags",  value: biasAlerts.length,  color: "text-rose-400"  },
                  { label: "Leaderboard",value: leaderboard.length,  color: "text-amber-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <p className={`text-xl font-black font-mono ${color}`}>{value}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 lg:self-end">
              <button onClick={seedInitialData} disabled={isSeeding}
                className="px-5 py-2.5 text-xs font-black rounded-xl transition shadow-md disabled:opacity-50"
                style={{ background: "#ffffff", color: "#1e293b" }}>
                {isSeeding ? "Seeding..." : "Seed Demo Data"}
              </button>
              <button onClick={toggleEvaluationStatus} disabled={isTogglingStatus}
                className={`px-5 py-2.5 text-white font-black rounded-xl text-xs shadow-md border transition ${evalStatus.evaluation_closed ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-500" : "bg-rose-600 hover:bg-rose-500 border-rose-500"}`}>
                {evalStatus.evaluation_closed ? "Open Evaluations" : "Close Evaluations"}
              </button>
              <button onClick={fetchWinnerCertificate}
                className="px-5 py-2.5 text-xs font-black rounded-xl shadow-md transition"
                style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "#0f172a" }}>
                🏆 Winner Certificate
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 p-1.5 rounded-xl" style={{ background: "var(--bg-soft)", border: "1.5px solid var(--border)" }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`relative flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                activeTab === tab.key
                  ? "text-emerald-700 shadow-sm"
                  : "hover:bg-white/60"
              }`}
              style={activeTab === tab.key ? { background: "var(--surface)", color: "var(--primary-deep)", border: "1.5px solid var(--border)" } : { color: "var(--text-muted)" }}>
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-6 tab-content-active">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Terminal */}
              <section className="lg:col-span-7 panel rounded-2xl p-5 flex flex-col h-[480px]">
                <div className="flex items-center justify-between pb-3 mb-4 border-b" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text)" }}>Autonomous Log Stream</h2>
                  </div>
                  <span className="text-[10px] font-mono" style={{ color: "var(--text-faint)" }}>WebSocket active</span>
                </div>
                <div className="flex-1 overflow-y-auto rounded-xl p-4 space-y-2" style={{ background: "var(--night)", border: "1.5px solid #30363d" }}>
                  {logs.length === 0 ? (
                    <div className="text-slate-500 italic text-xs">[System] Awaiting pipeline events...</div>
                  ) : (
                    logs.map((log, idx) => (
                      <div key={idx} className="flex gap-2.5 leading-relaxed animate-slide-in text-xs font-mono" style={{ color: "#7ee787" }}>
                        <span className="text-slate-500 font-semibold shrink-0">[{new Date().toLocaleTimeString()}]</span>
                        <span className="break-all">{log.text}</span>
                      </div>
                    ))
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </section>

              {/* Leaderboard */}
              <section className="lg:col-span-5 panel rounded-2xl p-5 flex flex-col h-[480px]">
                <div className="pb-3 mb-4 border-b flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
                  <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text)" }}>Leaderboard</h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{ background: "rgba(59,130,246,0.08)", color: "#1d4ed8", border: "1.5px solid rgba(59,130,246,0.2)" }}>Z-Score</span>
                </div>
                <div className="flex-1 overflow-y-auto pr-1">
                  <Leaderboard items={leaderboard} compact />
                </div>
              </section>
            </div>

            {/* HITL */}
            {flaggedSubmissions.length > 0 && (
              <section className="rounded-2xl p-6 space-y-4 animate-modal-open"
                style={{ background: "#fef2f2", border: "1.5px solid #fca5a5" }}>
                <div className="flex items-center gap-2" style={{ color: "#b91c1c" }}>
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Human Intervention Required — Duplicates</h3>
                </div>
                <div className="rounded-xl overflow-hidden divide-y" style={{ background: "var(--surface)", border: "1.5px solid var(--border)", divideColor: "var(--border)" }}>
                  {flaggedSubmissions.map(sub => (
                    <div key={sub.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h4 className="font-bold text-sm" style={{ color: "var(--text)" }}>{sub.title}</h4>
                        <p className="text-xs mt-1 max-w-2xl" style={{ color: "var(--text-muted)" }}>{sub.abstract}</p>
                      </div>
                      <div className="flex gap-2.5">
                        <button onClick={() => overrideState(sub.id, "APPROVE_OVERRIDE")}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition">Approve</button>
                        <button onClick={() => overrideState(sub.id, "CONFIRM_DISQUALIFICATION")}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition">Disqualify</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Registry table */}
            <section className="panel rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-3 mb-4 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" style={{ color: "var(--sky)" }} />
                  <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text)" }}>Submissions Registry</h2>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {["All", "AI & Intelligent Agents", "Web3 & Decentralized Systems", "Cloud & Developer Platforms"].map(t => (
                    <button key={t} onClick={() => setSelectedTrack(t)}
                      className="px-3 py-1 rounded-lg text-[10px] font-bold border transition"
                      style={selectedTrack === t
                        ? { background: "rgba(59,130,246,0.08)", color: "#1d4ed8", border: "1.5px solid rgba(59,130,246,0.25)" }
                        : { background: "var(--bg-soft)", color: "var(--text-muted)", border: "1.5px solid var(--border)" }}>
                      {t === "All" ? "All Tracks" : t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid var(--border)" }}>
                      {["ID", "Project Title", "Abstract", "Track", "Tech Stack", "Status"].map(h => (
                        <th key={h} className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]" style={{ color: "var(--text-faint)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.length === 0 ? (
                      <tr><td colSpan={6} className="py-8 text-center italic" style={{ color: "var(--text-faint)" }}>No matching submissions.</td></tr>
                    ) : (
                      filteredSubmissions.map(sub => {
                        let badge = { bg: "var(--bg-soft)", color: "var(--text-muted)", border: "var(--border)" };
                        if (sub.state === "APPROVED") badge = { bg: "#f0fdf4", color: "#166534", border: "#86efac" };
                        else if (sub.state === "MATCHED") badge = { bg: "#eff6ff", color: "#1d4ed8", border: "#93c5fd" };
                        else if (sub.state === "PENDING_REVIEW") badge = { bg: "#fffbeb", color: "#b45309", border: "#fcd34d" };
                        return (
                          <tr key={sub.id} className="transition hover:bg-gray-50" style={{ borderBottom: "1px solid var(--border)" }}>
                            <td className="py-3 px-4 font-mono text-[10px]" style={{ color: "var(--text-faint)" }}>{sub.id}</td>
                            <td className="py-3 px-4 font-bold" style={{ color: "var(--text)" }}>{sub.title}</td>
                            <td className="py-3 px-4 max-w-xs truncate" style={{ color: "var(--text-muted)" }} title={sub.abstract}>{sub.abstract}</td>
                            <td className="py-3 px-4 font-semibold" style={{ color: "var(--sky)" }}>{sub.track}</td>
                            <td className="py-3 px-4 font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>{sub.tech_stack}</td>
                            <td className="py-3 px-4">
                              <span className="text-[9px] font-bold px-2.5 py-1 rounded-full border" style={{ background: badge.bg, color: badge.color, borderColor: badge.border }}>{sub.state}</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Ledger */}
            <section className="panel rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-sky-500" />
                  <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text)" }}>Blockchain Ledger Check</h2>
                </div>
                <button onClick={runLedgerVerification} disabled={isVerifyingLedger}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg disabled:opacity-50 transition"
                  style={{ background: "rgba(59,130,246,0.08)", color: "#1d4ed8", border: "1.5px solid rgba(59,130,246,0.2)" }}>
                  {isVerifyingLedger ? "Verifying..." : "Verify Audit Ledger"}
                </button>
              </div>
              {ledgerResult ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl" style={{ background: "var(--bg-soft)", border: "1.5px solid var(--border)" }}>
                    <p className="text-[10px] font-bold uppercase mb-2" style={{ color: "var(--text-faint)" }}>Chain Status</p>
                    <div className="flex items-center gap-2">
                      {ledgerResult.is_valid
                        ? <><CheckCircle2 className="w-5 h-5 text-emerald-600" /><span className="text-sm font-bold text-emerald-700">SECURE & VERIFIED</span></>
                        : <><XCircle className="w-5 h-5 text-rose-600" /><span className="text-sm font-bold text-rose-700">CORRUPT</span></>}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: "var(--bg-soft)", border: "1.5px solid var(--border)" }}>
                    <p className="text-[10px] font-bold uppercase mb-2" style={{ color: "var(--text-faint)" }}>Verified Blocks</p>
                    <p className="text-lg font-mono font-black" style={{ color: "var(--text)" }}>{ledgerResult.verified_blocks}</p>
                  </div>
                  <div className="p-4 rounded-xl md:col-span-3" style={{ background: "var(--bg-soft)", border: "1.5px solid var(--border)" }}>
                    <p className="text-[10px] font-bold uppercase mb-2" style={{ color: "var(--text-faint)" }}>Trace Output</p>
                    <div className="p-3 rounded-lg font-mono text-xs" style={{ background: "var(--night)", border: "1px solid #30363d" }}>
                      {ledgerResult.is_valid
                        ? <span className="text-emerald-400">✓ Chain verification successful. All blocks recursively linked.</span>
                        : ledgerResult.errors?.map((e, i) => <p key={i} className="text-rose-400">✗ {e}</p>)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs italic" style={{ color: "var(--text-faint)" }}>Run check to audit ledger integrity.</div>
              )}
            </section>
          </div>
        )}

        {/* ── ASSIGNMENTS TAB ── */}
        {activeTab === "assignments" && (
          <div className="space-y-6 tab-content-active">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="panel rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-violet-500" />
                    <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text)" }}>Reviewer Assignments</h2>
                  </div>
                  <button onClick={handleAssignReviewers} disabled={isAssigning}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg disabled:opacity-50 flex items-center gap-1.5 transition"
                    style={{ background: "rgba(139,92,246,0.08)", color: "#7c3aed", border: "1.5px solid rgba(139,92,246,0.2)" }}>
                    {isAssigning ? <><RefreshCw className="w-3 h-3 animate-spin" />Assigning...</> : <><Play className="w-3 h-3" />Optimize Match</>}
                  </button>
                </div>
                <div className="min-h-[250px] max-h-[400px] overflow-y-auto space-y-3">
                  {assignments.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-xs italic" style={{ color: "var(--text-faint)" }}>Click "Optimize Match" to run the Hungarian algorithm solver.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {assignments.map(a => (
                        <div key={a.id} className="p-3.5 rounded-xl space-y-2 transition" style={{ background: "var(--bg-soft)", border: "1.5px solid var(--border)" }}>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: "rgba(139,92,246,0.1)", color: "#7c3aed", border: "1px solid rgba(139,92,246,0.2)" }}>Reviewer {a.reviewer_id}</span>
                          <p className="text-sm font-bold" style={{ color: "var(--text)" }}>{a.reviewer_name}</p>
                          <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                            <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "var(--text-faint)" }}>Project</p>
                            <p className="text-sm font-semibold truncate" style={{ color: "var(--text-muted)" }}>{a.project_title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="panel rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text)" }}>Final Results Standings</h2>
                  </div>
                  <button onClick={handleGenerateResults} disabled={isGeneratingResults}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg disabled:opacity-50 flex items-center gap-1.5 transition"
                    style={{ background: "rgba(245,158,11,0.08)", color: "#b45309", border: "1.5px solid rgba(245,158,11,0.2)" }}>
                    {isGeneratingResults ? <><RefreshCw className="w-3 h-3 animate-spin" />Generating...</> : <><Award className="w-3 h-3" />Publish Results</>}
                  </button>
                </div>
                <div className="min-h-[250px] max-h-[400px] overflow-y-auto space-y-3">
                  {results.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-xs italic" style={{ color: "var(--text-faint)" }}>Click "Publish Results" after closing evaluations.</div>
                  ) : (
                    results.map(item => (
                      <div key={item.id} className="p-4 rounded-xl space-y-2 transition" style={{ background: "var(--bg-soft)", border: "1.5px solid var(--border)" }}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 flex items-center justify-center text-xs rounded-full border font-bold"
                              style={item.rank === 1 ? { background: "#fffbeb", color: "#b45309", borderColor: "#fcd34d" } : { background: "var(--bg-soft)", color: "var(--text-muted)", borderColor: "var(--border)" }}>
                              {item.rank}
                            </span>
                            <span className="font-bold text-sm" style={{ color: "var(--text)" }}>{item.project_title}</span>
                          </div>
                          <span className="font-black font-mono text-sm text-emerald-700">{item.final_score?.toFixed(1)}/100</span>
                        </div>
                        {item.feedback && (
                          <div className="p-3 rounded-lg text-xs italic leading-relaxed" style={{ background: "var(--surface)", border: "1.5px solid var(--border)", color: "var(--text-muted)" }}>
                            <span className="text-[10px] font-bold uppercase not-italic block mb-1 text-amber-600">AI Feedback:</span>
                            "{item.feedback}"
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ── BIAS TAB ── */}
        {activeTab === "bias" && (
          <div className="space-y-6 tab-content-active">
            <section className="panel rounded-2xl p-5">
              <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                  <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text)" }}>Live Bias Alert Panel</h2>
                </div>
                <Link href="/bias" className="text-[10px] font-bold uppercase tracking-wider transition" style={{ color: "var(--rose)" }}>Full Panel →</Link>
              </div>
              <BiasPanel alerts={biasAlerts} onResolve={resolveAlert} />
            </section>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === "analytics" && (
          <div className="tab-content-active">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text)" }}>Platform Analytics</h2>
              <Link href="/analytics" className="text-[10px] font-bold uppercase tracking-wider transition" style={{ color: "var(--sky)" }}>Full Analytics →</Link>
            </div>
            <AnalyticsCharts submissions={submissions} leaderboard={leaderboard} biasAlerts={biasAlerts} />
          </div>
        )}
      </div>

      {/* Winner Modal */}
      {isWinnerModalOpen && winnerCert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 relative animate-modal-open shadow-2xl"
            style={{ border: "1.5px solid var(--border)" }}>
            <button onClick={() => setIsWinnerModalOpen(false)} className="absolute top-4 right-4 text-2xl leading-none transition" style={{ color: "var(--text-muted)" }}>×</button>
            <div className="cert-glow-border">
              <div className="cert-inner text-center space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: "rgba(245,158,11,0.1)", border: "1.5px solid rgba(245,158,11,0.3)", color: "#b45309" }}>
                  🏆 DELL AI MERIT AWARD
                </div>
                <h4 className="text-2xl font-black uppercase" style={{ color: "#b45309" }}>Certificate of Excellence</h4>
                <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>Conferred to</p>
                <h2 className="text-3xl font-black" style={{ color: "var(--text)" }}>{winnerCert.recipient}</h2>
                <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>{winnerCert.reason}</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Score: <span className="text-emerald-700 font-black font-mono">{winnerCert.normalized_score}</span>
                </p>
                <div className="flex justify-between items-end pt-4 border-t text-[10px] font-mono" style={{ borderColor: "#fde68a", color: "var(--text-muted)" }}>
                  <div>
                    <p className="text-[9px] uppercase font-bold mb-0.5" style={{ color: "var(--text-faint)" }}>Hash</p>
                    <p className="truncate max-w-[180px] text-sky-700">{winnerCert.verification_hash}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-bold mb-0.5" style={{ color: "var(--text-faint)" }}>Issued by</p>
                    <p className="font-bold" style={{ color: "var(--text)" }}>Dell Agentic OS</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
