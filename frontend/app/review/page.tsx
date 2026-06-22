"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "../lib/useStore";
import { Star, ArrowLeft, Send, ChevronDown } from "lucide-react";

const JUDGES = [
  { id: 1, name: "Dr. Hawk",  role: "AI/ML Specialist",     avatar: "H", color: "bg-blue-100 text-blue-700",   border: "border-blue-200"   },
  { id: 2, name: "Prof. Mod", role: "Web3 Specialist",       avatar: "M", color: "bg-violet-100 text-violet-700", border: "border-violet-200" },
  { id: 3, name: "Hon. Dove", role: "Lenient Generalist",    avatar: "D", color: "bg-rose-100 text-rose-700",   border: "border-rose-200"   },
];

const CRITERIA = [
  { key: "innovation",   label: "Innovation",   description: "Originality and creativity of the concept" },
  { key: "tech",         label: "Technical",    description: "Implementation depth and code quality" },
  { key: "feasibility",  label: "Feasibility",  description: "Real-world viability and scalability" },
  { key: "presentation", label: "Presentation", description: "Demo quality, docs, and pitch clarity" },
];

type Scores = Record<string, number>;

export default function ReviewPage() {
  const { submissions, refresh } = useStore();
  const [judgeId, setJudgeId] = useState(1);
  const [projId, setProjId] = useState("");
  const [scores, setScores] = useState<Scores>({ innovation: 8, tech: 8, feasibility: 8, presentation: 8 });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(true);

  const availableProjects = submissions.filter(s => s.state !== "FLAGGED_DUPLICATE");
  const rawScore = Object.values(scores).reduce((a, b) => a + b, 0) / 4;

  const handleScore = (key: string, val: number) => setScores(prev => ({ ...prev, [key]: Math.max(0, Math.min(10, val)) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projId) { setMsg("Please select a project."); setSuccess(false); return; }
    setLoading(true); setMsg("");
    try {
      const res = await fetch("http://localhost:8000/api/review/score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ judge_id: judgeId, project_id: parseInt(projId), innovation: scores.innovation, tech: scores.tech, feasibility: scores.feasibility, presentation: scores.presentation }) });
      const data = await res.json();
      if (res.ok) { setSuccess(true); setMsg(`Score recorded! Raw average: ${data.raw_score?.toFixed(2) ?? rawScore.toFixed(2)}. Z-score calibration queued.`); setScores({ innovation: 8, tech: 8, feasibility: 8, presentation: 8 }); setProjId(""); refresh(); }
      else { setSuccess(false); setMsg(data.detail || "Scoring failed."); }
    } catch (err: any) { setSuccess(false); setMsg(err.message || "Network error"); }
    finally { setLoading(false); }
  };

  const selectedJudge = JUDGES.find(j => j.id === judgeId)!;

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "var(--bg)" }}>
      <div className="max-w-3xl mx-auto space-y-6 animate-modal-open">

        <header className="pb-5 border-b space-y-2" style={{ borderColor: "var(--border)" }}>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition" style={{ color: "#b45309" }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2" style={{ color: "var(--text)" }}>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            Reviewer Scorecard
          </h1>
          <p className="text-sm pl-11" style={{ color: "var(--text-muted)" }}>Cast evaluation scores to trigger Z-score bias calibration.</p>
        </header>

        {/* Judge selector */}
        <div className="grid grid-cols-3 gap-3">
          {JUDGES.map(j => (
            <button key={j.id} onClick={() => setJudgeId(j.id)}
              className={`p-4 rounded-xl border text-left transition`}
              style={judgeId === j.id
                ? { background: "#fffbeb", border: "1.5px solid #fcd34d" }
                : { background: "var(--surface)", border: "1.5px solid var(--border)" }}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm mb-2 ${j.color}`}>
                {j.avatar}
              </div>
              <p className="font-bold text-sm" style={{ color: "var(--text)" }}>{j.name}</p>
              <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>{j.role}</p>
            </button>
          ))}
        </div>

        {/* Scorecard form */}
        <form onSubmit={handleSubmit} className="panel rounded-2xl p-6 md:p-8 space-y-6">

          {/* Project selector */}
          <div>
            <label className="block mb-1.5 uppercase">Assigned Project Submission</label>
            <div className="relative">
              <select value={projId} onChange={e => setProjId(e.target.value)} required
                className="w-full px-4 py-3 appearance-none"
                style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "var(--r-md)", color: "var(--text)", fontSize: "14px" }}>
                <option value="">-- Choose a Project --</option>
                {availableProjects.map(s => <option key={s.id} value={s.id}>ID {s.id}: {s.title} ({s.state})</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--text-faint)" }} />
            </div>
          </div>

          {/* Scoring criteria */}
          <div className="space-y-5">
            <p className="section-label">Scoring Criteria (0–10)</p>
            {CRITERIA.map(c => (
              <div key={c.key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold" style={{ color: "var(--text)" }}>{c.label}</span>
                    <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>{c.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => handleScore(c.key, scores[c.key] - 0.5)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold transition text-sm hover:bg-amber-50"
                      style={{ background: "var(--bg-soft)", border: "1.5px solid var(--border)", color: "var(--text-muted)" }}>−</button>
                    <span className="w-10 text-center font-mono font-black text-sm" style={{ color: "var(--text)" }}>{scores[c.key].toFixed(1)}</span>
                    <button type="button" onClick={() => handleScore(c.key, scores[c.key] + 0.5)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold transition text-sm hover:bg-amber-50"
                      style={{ background: "var(--bg-soft)", border: "1.5px solid var(--border)", color: "var(--text-muted)" }}>+</button>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-soft)", border: "1.5px solid var(--border)" }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(scores[c.key] / 10) * 100}%`, background: "linear-gradient(90deg, #f59e0b, #fbbf24)" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Score preview */}
          <div className="p-4 rounded-xl flex justify-between items-center" style={{ background: "#fffbeb", border: "1.5px solid #fde68a" }}>
            <div>
              <p className="section-label mb-1">Raw Average Score</p>
              <p className="text-2xl font-black font-mono text-amber-700">{rawScore.toFixed(2)} / 10</p>
            </div>
            <div className="text-right text-xs" style={{ color: "var(--text-faint)" }}>
              <p>Z-score calibration queued</p>
              <p>after submission</p>
            </div>
          </div>

          {msg && (
            <div className="p-3.5 rounded-xl text-xs leading-relaxed"
              style={success
                ? { background: "#f0fdf4", border: "1.5px solid #86efac", color: "#166534" }
                : { background: "#fef2f2", border: "1.5px solid #fca5a5", color: "#b91c1c" }}>
              {msg}
            </div>
          )}

          <button type="submit" disabled={loading || !projId}
            className="w-full py-3.5 font-black rounded-xl text-sm flex justify-center items-center gap-2 transition"
            style={{ background: (loading || !projId) ? "var(--border)" : "#f59e0b", color: "#0f172a", opacity: (loading || !projId) ? 0.6 : 1 }}>
            {loading ? "Recording Score..." : "Cast Evaluation Scores"} <Star className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
