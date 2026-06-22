"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useStore } from "../lib/useStore";
import BiasPanel from "../../components/BiasPanel";
import { ShieldAlert, RefreshCw, ArrowLeft, AlertOctagon, CheckCircle2 } from "lucide-react";

export default function BiasPage() {
  const { biasAlerts, loading, refresh, resolveAlert } = useStore();

  useEffect(() => { refresh(); }, []);

  const pendingCount = biasAlerts.length;

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "var(--bg)" }}>
      <div className="max-w-4xl mx-auto space-y-6 animate-modal-open">

        {/* Header */}
        <header className="pb-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ borderColor: "var(--border)" }}>
          <div className="space-y-1">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition" style={{ color: "#b91c1c" }}>
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2" style={{ color: "var(--text)" }}>
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />
              </div>
              Live Bias Alert Panel
            </h1>
            <p className="text-sm pl-11" style={{ color: "var(--text-muted)" }}>Real-time Z-score anomaly detection via WebSocket stream.</p>
          </div>

          <div className="flex gap-3 shrink-0">
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
              style={pendingCount > 0
                ? { background: "#fef2f2", border: "1.5px solid #fca5a5", color: "#b91c1c" }
                : { background: "#f0fdf4", border: "1.5px solid #86efac", color: "#166534" }}>
              {pendingCount > 0
                ? <><AlertOctagon className="w-3.5 h-3.5" /> {pendingCount} Active Flag{pendingCount !== 1 ? "s" : ""}</>
                : <><CheckCircle2 className="w-3.5 h-3.5" /> All Clear</>}
            </span>
            <button onClick={refresh} className="btn btn-ghost flex items-center gap-1.5 text-xs">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Flags",    value: pendingCount,                                                                  bg: "#fef2f2", border: "#fca5a5", color: "#b91c1c" },
            { label: "Gender Bias",     value: biasAlerts.filter(a => a.details.toLowerCase().includes("gender")).length,     bg: "#fdf4ff", border: "#d8b4fe", color: "#7c3aed" },
            { label: "Geographic Bias", value: biasAlerts.filter(a => a.details.toLowerCase().includes("geographic")).length, bg: "#fffbeb", border: "#fcd34d", color: "#b45309" },
            { label: "Tech Stack Bias", value: biasAlerts.filter(a => a.details.toLowerCase().includes("tech")).length,       bg: "#f0fdf4", border: "#86efac", color: "#166534" },
          ].map(({ label, value, bg, border, color }) => (
            <div key={label} className="panel p-4 rounded-2xl" style={{ background: bg, border: `1.5px solid ${border}` }}>
              <p className="section-label mb-1">{label}</p>
              <p className="text-2xl font-black font-mono" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Main Panel */}
        <div className="panel rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text)" }}>Active Bias Flags</h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono"
              style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", color: "#b91c1c" }}>
              WebSocket Stream
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-xs" style={{ color: "var(--text-faint)" }}>
              <RefreshCw className="w-4 h-4 animate-spin" /> Connecting to bias detection stream...
            </div>
          ) : (
            <BiasPanel alerts={biasAlerts} onResolve={resolveAlert} />
          )}
        </div>

        {/* Algorithm explanation */}
        <div className="panel rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text)" }}>Detection Algorithm</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
            {[
              { step: "1", title: "Score Collection", desc: "Judge scores are collected per submission across all criteria." },
              { step: "2", title: "Z-Score Analysis",  desc: "A reviewer's mean is subtracted and divided by std deviation per criterion." },
              { step: "3", title: "Anomaly Threshold", desc: "Z-score > ±2.0 triggers an automatic bias flag visible here in real-time." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full text-rose-700 text-[10px] font-black flex items-center justify-center"
                    style={{ background: "#fef2f2", border: "1.5px solid #fca5a5" }}>{step}</span>
                  <span className="font-bold" style={{ color: "var(--text)" }}>{title}</span>
                </div>
                <p className="leading-relaxed pl-8">{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
