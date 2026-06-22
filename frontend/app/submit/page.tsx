"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "../lib/useStore";
import { Send, ArrowLeft, AlertTriangle, Check, GitBranch, Globe, Tag, Users, FileText } from "lucide-react";

const TRACKS = ["AI & Intelligent Agents", "Web3 & Decentralized Systems", "Cloud & Developer Platforms"];

export default function SubmitPage() {
  const { submissions, refresh } = useStore();
  const [teamId, setTeamId] = useState("1");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [gitUrl, setGitUrl] = useState("https://github.com/myteam/project");
  const [demoUrl, setDemoUrl] = useState("https://project-demo.vercel.app");
  const [track, setTrack] = useState(TRACKS[0]);
  const [tags, setTags] = useState("FastAPI, Next.js, PyTorch");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(true);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) { setMsg("Project Title and Description are required."); setSuccess(false); return; }
    setLoading(true); setMsg(""); setLastResult(null);
    try {
      const res = await fetch("http://localhost:8000/api/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ team_id: parseInt(teamId), title, description: desc, github_url: gitUrl, demo_url: demoUrl, track, tags }) });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setMsg(`Submission ID #${data.submission_id} registered. Background embeddings and DBSCAN check queued.`);
        setTimeout(async () => { try { const subRes = await fetch(`http://localhost:8000/api/submissions/${data.submission_id}`); if (subRes.ok) setLastResult(await subRes.json()); } catch {} refresh(); }, 1500);
        setTitle(""); setDesc("");
      } else { setSuccess(false); setMsg(data.detail || "Submission failed."); }
    } catch (err: any) { setSuccess(false); setMsg(err.message || "Network error"); }
    finally { setLoading(false); }
  };

  const fieldStyle = { background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "var(--r-md)", color: "var(--text)", fontSize: "14px" };

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "var(--bg)" }}>
      <div className="max-w-3xl mx-auto space-y-6 animate-modal-open">

        <header className="pb-5 border-b space-y-2" style={{ borderColor: "var(--border)" }}>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition" style={{ color: "var(--primary-deep)" }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-2" style={{ color: "var(--text)" }}>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Send className="w-5 h-5 text-emerald-600" />
                </div>
                Project Submission
              </h1>
              <p className="text-sm mt-1 pl-11" style={{ color: "var(--text-muted)" }}>Submit your hackathon project to trigger vector plagiarism detection.</p>
            </div>
            <div className="text-right text-xs" style={{ color: "var(--text-muted)" }}>
              <p className="font-mono font-black text-emerald-700 text-lg">{submissions.filter(s => s.state !== "FLAGGED_DUPLICATE").length}</p>
              <p>Active Projects</p>
            </div>
          </div>
        </header>

        {/* Result banner */}
        {lastResult && (
          <div className={`p-4 rounded-2xl text-sm animate-modal-open`}
            style={lastResult.state === "FLAGGED_DUPLICATE"
              ? { background: "#fef2f2", border: "1.5px solid #fca5a5", color: "#b91c1c" }
              : { background: "#f0fdf4", border: "1.5px solid #86efac", color: "#166534" }}>
            <p className="font-bold flex items-center gap-2 mb-1">
              {lastResult.state === "FLAGGED_DUPLICATE"
                ? <><AlertTriangle className="w-4 h-4" />Vector Plagiarism Alert!</>
                : <><Check className="w-4 h-4" />Submission Verified: Unique Project</>}
            </p>
            <p className="text-xs">
              {lastResult.state === "FLAGGED_DUPLICATE"
                ? "DBSCAN computed cosine similarity > 0.85. Flagged for Human-in-the-Loop review."
                : "DBSCAN uniqueness validated. Enqueued for Hungarian bipartite judge matching."}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="panel rounded-2xl p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-1.5 uppercase"><Users className="w-3 h-3 inline mr-1" />Team ID</label>
              <input type="number" value={teamId} onChange={e => setTeamId(e.target.value)} className="w-full px-4 py-3" style={fieldStyle} required />
            </div>
            <div>
              <label className="block mb-1.5 uppercase"><FileText className="w-3 h-3 inline mr-1" />Project Title *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Swarm Robotics Planner" className="w-full px-4 py-3" style={fieldStyle} required />
            </div>
            <div>
              <label className="block mb-1.5 uppercase"><GitBranch className="w-3 h-3 inline mr-1" />GitHub URL *</label>
              <input type="url" value={gitUrl} onChange={e => setGitUrl(e.target.value)} placeholder="https://github.com/team/repo" className="w-full px-4 py-3" style={fieldStyle} required />
            </div>
            <div>
              <label className="block mb-1.5 uppercase"><Globe className="w-3 h-3 inline mr-1" />Live Demo URL</label>
              <input type="url" value={demoUrl} onChange={e => setDemoUrl(e.target.value)} placeholder="https://project.vercel.app" className="w-full px-4 py-3" style={fieldStyle} />
            </div>
            <div>
              <label className="block mb-1.5 uppercase">Track Stream</label>
              <select value={track} onChange={e => setTrack(e.target.value)} className="w-full px-4 py-3" style={fieldStyle}>
                {TRACKS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1.5 uppercase"><Tag className="w-3 h-3 inline mr-1" />Tech Stack Tags *</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="FastAPI, React, PyTorch" className="w-full px-4 py-3" style={fieldStyle} required />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1.5 uppercase">Project Abstract *</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Provide a detailed overview of the system architecture, features, and implementation details..." rows={5} className="w-full px-4 py-3 resize-none" style={fieldStyle} required />
              <p className="text-[11px] mt-1.5" style={{ color: "var(--text-faint)" }}>This text is embedded for DBSCAN vector similarity deduplication.</p>
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

          <button type="submit" disabled={loading}
            className="w-full py-3.5 font-black rounded-xl text-sm flex justify-center items-center gap-2 transition"
            style={{ background: loading ? "var(--border)" : "var(--primary)", color: "#0a2e1e", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Submitting..." : "Submit Hackathon Project"} <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
