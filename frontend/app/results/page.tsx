"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "../lib/useStore";
import Leaderboard from "../../components/Leaderboard";
import { Trophy, RefreshCw, Award, Sparkles, ChevronLeft } from "lucide-react";

export default function ResultsPage() {
  const { leaderboard, loading, refresh } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [winnerCert, setWinnerCert] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [fetchingWinner, setFetchingWinner] = useState(false);

  const handleRefresh = async () => { setIsRefreshing(true); await refresh(); setIsRefreshing(false); };
  const fetchWinner = async () => {
    setFetchingWinner(true);
    try {
      const res = await fetch("http://localhost:8000/api/analytics/winner");
      const data = await res.json();
      if (data.status === "SUCCESS") { setWinnerCert(data.certificate); setShowModal(true); }
      else alert(data.message || "Leaderboard is incomplete.");
    } catch { alert("Error fetching winner certificate."); }
    finally { setFetchingWinner(false); }
  };

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-sm" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="btn btn-ghost text-xs p-2">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-outfit font-black text-lg leading-none" style={{ color: "var(--text)" }}>Live Results</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Z-score normalised rankings</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRefresh} disabled={isRefreshing} className="btn btn-ghost text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={fetchWinner} disabled={fetchingWinner} className="btn text-xs font-bold"
            style={{ background: "#fffbeb", color: "#b45309", border: "1.5px solid #fde68a" }}>
            <Award className="w-3.5 h-3.5" /> Winner Cert
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* Podium */}
        {top3.length >= 3 && (
          <section className="animate-fade-up">
            <p className="section-label text-center mb-8">Top 3 Finalists</p>
            <div className="flex items-end justify-center gap-3">
              {/* 2nd */}
              <div className="flex-1 max-w-[200px] text-center space-y-3">
                <div className="card p-4 rounded-xl" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
                  <p className="text-2xl mb-2">🥈</p>
                  <p className="font-outfit font-bold text-sm leading-tight mb-1" style={{ color: "var(--text)" }}>{top3[1]?.title}</p>
                  <p className="font-mono font-bold text-base" style={{ color: "var(--text-muted)" }}>{top3[1]?.normalized_score}</p>
                  <div className="mt-2 text-[10px]" style={{ color: "var(--text-faint)" }}>{top3[1]?.eval_count} evaluations</div>
                </div>
                <div className="h-16 rounded-t-lg" style={{ background: "#e2e8f0" }} />
              </div>

              {/* 1st */}
              <div className="flex-1 max-w-[220px] text-center space-y-3 -translate-y-4">
                <div className="card p-5 rounded-xl" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
                  <p className="text-3xl mb-2">🏆</p>
                  <p className="font-outfit font-black text-base leading-tight mb-2" style={{ color: "var(--text)" }}>{top3[0]?.title}</p>
                  <p className="font-mono font-black text-xl text-amber-600">{top3[0]?.normalized_score}</p>
                  <div className="mt-2">
                    <span className="badge badge-amber text-[10px]">Champion</span>
                  </div>
                </div>
                <div className="h-24 rounded-t-lg" style={{ background: "#fde68a" }} />
              </div>

              {/* 3rd */}
              <div className="flex-1 max-w-[200px] text-center space-y-3">
                <div className="card p-4 rounded-xl" style={{ background: "#fff7ed", borderColor: "#fed7aa" }}>
                  <p className="text-2xl mb-2">🥉</p>
                  <p className="font-outfit font-bold text-sm leading-tight mb-1" style={{ color: "var(--text)" }}>{top3[2]?.title}</p>
                  <p className="font-mono font-bold text-base text-orange-600">{top3[2]?.normalized_score}</p>
                  <div className="mt-2 text-[10px]" style={{ color: "var(--text-faint)" }}>{top3[2]?.eval_count} evaluations</div>
                </div>
                <div className="h-10 rounded-t-lg" style={{ background: "#fed7aa" }} />
              </div>
            </div>
          </section>
        )}

        {/* Full Leaderboard */}
        <section className="panel rounded-2xl p-6 animate-fade-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-outfit font-black text-lg" style={{ color: "var(--text)" }}>Full Rankings</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {leaderboard.length} teams · sorted by Z-score normalised average
              </p>
            </div>
            <span className="badge badge-emerald"><Sparkles className="w-3 h-3" /> Live</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading results…
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Trophy className="w-10 h-10 mx-auto opacity-20" style={{ color: "var(--text-faint)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No results yet. Scores need to be submitted first.</p>
              <Link href="/review" className="btn btn-ghost text-xs">Go to Review →</Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {leaderboard.map((item, i) => {
                const pct = leaderboard[0]?.normalized_score > 0
                  ? Math.round((item.normalized_score / leaderboard[0].normalized_score) * 100) : 0;
                return (
                  <div key={item.project_id} className={`lb-row ${i === 0 ? "rank-1" : i === 1 ? "rank-2" : i === 2 ? "rank-3" : ""}`}>
                    <span className="font-mono text-xs w-8 text-center shrink-0 font-bold"
                      style={{ color: i < 3 ? "#b45309" : "var(--text-faint)" }}>
                      {i === 0 ? "1st" : i === 1 ? "2nd" : i === 2 ? "3rd" : `${i + 1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: "var(--text)" }}>{item.title}</p>
                      <div className="mt-1.5 h-1.5 rounded-full w-full max-w-[200px] overflow-hidden" style={{ background: "var(--bg-soft)" }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#fb923c" : "var(--primary)" }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono font-black text-sm" style={{ color: i < 3 ? "#b45309" : "var(--text)" }}>
                        {typeof item.normalized_score === "number" ? item.normalized_score.toFixed(2) : item.normalized_score}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-faint)" }}>
                        {item.eval_count} eval{item.eval_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Winner Modal */}
      {showModal && winnerCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="animate-scale-in max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="cert-border">
              <div className="cert-inner text-center space-y-5 relative">
                <button onClick={() => setShowModal(false)} className="absolute top-0 right-0 btn btn-ghost text-xs p-1.5">✕</button>
                <div>
                  <p className="section-label mb-1">Dell AI Merit Award</p>
                  <h3 className="font-outfit text-xl font-black text-amber-700">Certificate of Excellence</h3>
                </div>
                <hr style={{ borderColor: "#fde68a" }} />
                <div className="space-y-1">
                  <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>Conferred upon</p>
                  <p className="font-outfit text-3xl font-black" style={{ color: "var(--text)" }}>{winnerCert.recipient}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>for outstanding achievement in</p>
                  <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{winnerCert.reason}</p>
                </div>
                <span className="badge badge-amber font-mono">Score: {winnerCert.normalized_score}</span>
                <hr style={{ borderColor: "#fde68a" }} />
                <div className="flex justify-between text-[10px] font-mono" style={{ color: "var(--text-faint)" }}>
                  <div className="text-left">
                    <p className="section-label mb-0.5">Verification</p>
                    <p className="text-sky-600 truncate max-w-[160px]">{winnerCert.verification_hash}</p>
                  </div>
                  <div className="text-right">
                    <p className="section-label mb-0.5">Issued by</p>
                    <p style={{ color: "var(--text-muted)" }}>Dell Agentic OS</p>
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
