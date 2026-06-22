"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, Cpu, Shield, Zap } from "lucide-react";

const steps = ["Personal Info", "Skills & Bio", "Confirm"];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState("");
  const [skills, setSkills] = useState("React, Tailwind, Node.js");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) { setMsg("Name, email, and password are required."); setSuccess(false); return; }
    setLoading(true); setMsg("");
    try {
      const res = await fetch("http://localhost:8000/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password, bio, skills_text: skills, institution }) });
      const data = await res.json();
      if (res.ok) { setSuccess(true); setMsg(`Registration successful! Participant ID: ${data.user_id}`); setStep(3); }
      else { setSuccess(false); setMsg(data.detail || "Registration failed."); }
    } catch (err: any) { setSuccess(false); setMsg(err.message || "Network error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-2xl w-full space-y-8 animate-modal-open">

        {/* Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1 transition" style={{ color: "var(--primary-deep)" }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider badge badge-emerald">
            <span className="live-dot">Participant Registration</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--text)" }}>
            Join the <span className="text-shimmer">Hackathon</span>
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Register to trigger background vector deduplication & skill extraction.
          </p>
        </div>

        {/* Success state */}
        {step === 3 ? (
          <div className="panel rounded-2xl p-8 space-y-6 text-center animate-modal-open">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(62,207,142,0.1)", border: "1.5px solid rgba(62,207,142,0.3)" }}>
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black" style={{ color: "var(--text)" }}>You're Registered!</h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{msg}</p>
            </div>
            <div className="p-4 rounded-xl space-y-2 text-left" style={{ background: "var(--night)", border: "1.5px solid #30363d" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pipeline enqueued:</p>
              {["✓ Profile embedding generated", "✓ DBSCAN duplicate check running", "✓ spaCy NER skill extraction active", "✓ Organizer dashboard notified"].map((item, i) => (
                <p key={i} className="text-xs font-mono text-emerald-400">{item}</p>
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/submit" className="btn btn-primary px-6 py-2.5 text-sm">Submit a Project →</Link>
              <Link href="/dashboard" className="btn btn-ghost px-6 py-2.5 text-sm">Organizer Dashboard</Link>
            </div>
          </div>
        ) : (
          <div className="panel rounded-2xl p-6 md:p-8 space-y-6">

            {/* Stepper */}
            <div className="flex items-center gap-2">
              {steps.map((s, i) => (
                <React.Fragment key={i}>
                  <div className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full transition ${
                    i === step ? "border" : i < step ? "" : ""
                  }`}
                    style={i === step
                      ? { background: "rgba(62,207,142,0.1)", color: "var(--primary-deep)", borderColor: "rgba(62,207,142,0.3)" }
                      : i < step
                      ? { color: "var(--primary-deep)" }
                      : { color: "var(--text-faint)" }}>
                    {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-5 h-5 flex items-center justify-center rounded-full border border-current text-[9px]">{i + 1}</span>}
                    {s}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex-1 h-px" style={{ background: i < step ? "rgba(62,207,142,0.4)" : "var(--border)" }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Step 0 */}
              {step === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-modal-open">
                  {[
                    { label: "Full Name *", type: "text", value: name, onChange: (e: any) => setName(e.target.value), placeholder: "Jane Doe", required: true },
                    { label: "Email *", type: "email", value: email, onChange: (e: any) => setEmail(e.target.value), placeholder: "jane@university.edu", required: true },
                    { label: "Password *", type: "password", value: password, onChange: (e: any) => setPassword(e.target.value), placeholder: "••••••••", required: true },
                    { label: "Institution", type: "text", value: institution, onChange: (e: any) => setInstitution(e.target.value), placeholder: "Stanford University", required: false },
                  ].map(({ label, type, value, onChange, placeholder, required }) => (
                    <div key={label}>
                      <label className="block mb-1.5 uppercase">{label}</label>
                      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} className="w-full px-4 py-3" style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "var(--r-md)", color: "var(--text)", fontSize: "14px" }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-4 animate-modal-open">
                  <div>
                    <label className="block mb-1.5 uppercase">Skills (comma separated)</label>
                    <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, FastAPI, PyTorch, Postgres" className="w-full px-4 py-3" style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "var(--r-md)", color: "var(--text)", fontSize: "14px" }} />
                    <p className="text-[11px] mt-1.5" style={{ color: "var(--text-faint)" }}>spaCy NER will extract and categorize these automatically.</p>
                  </div>
                  <div>
                    <label className="block mb-1.5 uppercase">Developer Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="I'm a backend engineer specializing in distributed systems and AI pipelines..." rows={4} className="w-full px-4 py-3 resize-none" style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "var(--r-md)", color: "var(--text)", fontSize: "14px" }} />
                    <p className="text-[11px] mt-1.5" style={{ color: "var(--text-faint)" }}>Profile embedding generated for vector similarity deduplication.</p>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-4 animate-modal-open">
                  <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid var(--border)" }}>
                    {[
                      { label: "Name", value: name },
                      { label: "Email", value: email },
                      { label: "Institution", value: institution || "Not specified" },
                      { label: "Skills", value: skills },
                    ].map(({ label, value }, i) => (
                      <div key={label} className="flex justify-between items-center px-4 py-3 text-sm" style={{ background: i % 2 === 0 ? "var(--surface)" : "var(--bg-soft)", borderBottom: "1px solid var(--border)" }}>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{label}</span>
                        <span className="font-semibold text-xs text-right max-w-[60%] truncate" style={{ color: "var(--text)" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: <Cpu className="w-4 h-4" />, label: "DBSCAN Dedup", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-100" },
                      { icon: <Shield className="w-4 h-4" />, label: "NER Extraction", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                      { icon: <Zap className="w-4 h-4" />, label: "Async Pipeline", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
                    ].map(({ icon, label, color, bg, border }) => (
                      <div key={label} className={`flex items-center gap-2 p-3 rounded-xl border ${bg} ${border} ${color} text-xs font-semibold`}>{icon}{label}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {msg && !success && (
                <div className="p-3 rounded-xl flex items-center gap-2 text-xs" style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", color: "#b91c1c" }}>
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {msg}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                {step > 0 && (
                  <button type="button" onClick={() => setStep(s => s - 1)} className="btn btn-ghost px-5 py-3">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                {step < steps.length - 1 ? (
                  <button type="button" onClick={() => setStep(s => s + 1)}
                    disabled={step === 0 && (!name.trim() || !email.trim() || !password.trim())}
                    className="flex-1 py-3 font-bold rounded-xl text-sm flex justify-center items-center gap-2 transition"
                    style={{ background: "var(--primary)", color: "#0a2e1e", opacity: (step === 0 && (!name.trim() || !email.trim() || !password.trim())) ? 0.5 : 1 }}>
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="submit" disabled={loading}
                    className="flex-1 py-3 font-bold rounded-xl text-sm flex justify-center items-center gap-2 transition"
                    style={{ background: loading ? "var(--border)" : "var(--primary)", color: "#0a2e1e" }}>
                    {loading ? "Registering..." : "Complete Registration"} <User className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
