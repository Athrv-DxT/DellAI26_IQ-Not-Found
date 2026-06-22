"use client";

import Link from "next/link";
import {
  ArrowRight, Terminal, Users, Send, Star,
  Trophy, ShieldAlert, BarChart2, Cpu, Zap, Shield, Activity,
} from "lucide-react";

const modules = [
  { href: "/dashboard",  icon: Terminal,    label: "Organizer",    title: "Control Center",      desc: "Live agent logs, reviewer matrix, ledger verification and event management.", accent: "indigo"  },
  { href: "/register",   icon: Users,       label: "Registration", title: "Join the Hackathon",  desc: "Multi-step onboarding with DBSCAN vector deduplication and spaCy NER.", accent: "emerald" },
  { href: "/submit",     icon: Send,        label: "Submission",   title: "Submit a Project",    desc: "Submit your build and trigger cosine similarity plagiarism detection.", accent: "sky"     },
  { href: "/review",     icon: Star,        label: "Evaluation",   title: "Judge Scorecard",     desc: "Score on four criteria. Z-score bias calibration fires automatically.", accent: "amber"   },
  { href: "/results",    icon: Trophy,      label: "Results",      title: "Live Leaderboard",    desc: "Animated podium with Z-score normalized rankings and winner certificates.", accent: "amber"   },
  { href: "/bias",       icon: ShieldAlert, label: "Fairness",     title: "Bias Monitor",        desc: "Real-time WebSocket stream of scoring anomalies with fairness flags.", accent: "rose"    },
  { href: "/analytics",  icon: BarChart2,   label: "Analytics",    title: "Platform Insights",   desc: "Registration timeline, track distribution and evaluation completion.", accent: "violet"  },
];

const accentStyles: Record<string, { iconBg: string; iconColor: string; labelColor: string; borderHover: string }> = {
  indigo:  { iconBg: "bg-indigo-50",  iconColor: "text-indigo-600",  labelColor: "text-indigo-600",  borderHover: "hover:border-indigo-200"  },
  emerald: { iconBg: "bg-emerald-50", iconColor: "text-emerald-600", labelColor: "text-emerald-600", borderHover: "hover:border-emerald-200" },
  sky:     { iconBg: "bg-sky-50",     iconColor: "text-sky-600",     labelColor: "text-sky-600",     borderHover: "hover:border-sky-200"     },
  amber:   { iconBg: "bg-amber-50",   iconColor: "text-amber-600",   labelColor: "text-amber-600",   borderHover: "hover:border-amber-200"   },
  rose:    { iconBg: "bg-rose-50",    iconColor: "text-rose-600",    labelColor: "text-rose-600",    borderHover: "hover:border-rose-200"    },
  violet:  { iconBg: "bg-violet-50",  iconColor: "text-violet-600",  labelColor: "text-violet-600",  borderHover: "hover:border-violet-200"  },
};

const techStack = ["FastAPI", "Next.js 14", "SQLModel", "ChromaDB", "LangGraph", "SciPy", "spaCy", "WebSockets", "PostgreSQL"];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-200">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-outfit font-bold text-sm" style={{ color: "var(--text)" }}>HackOS</span>
            <span className="badge badge-muted text-[10px]">Dell 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="btn btn-ghost text-xs px-4 py-2">Dashboard</Link>
            <Link href="/register" className="btn btn-primary text-xs px-4 py-2">
              Register Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 badge badge-emerald mb-6 text-xs px-4 py-1.5">
            <span className="live-dot">Live</span>
          </div>

          <h1 className="font-outfit text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-[1.05]" style={{ color: "var(--text)" }}>
            The Hackathon Platform<br />
            that <span className="text-shimmer">runs itself.</span>
          </h1>

          <p className="max-w-xl mx-auto text-base leading-relaxed mb-10" style={{ color: "var(--text-muted)" }}>
            Autonomous agents handle registration deduplication, judge matching, bias detection,
            and ranking — so you can focus on building, not administrating.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
            <Link href="/register" className="btn btn-primary px-7 py-3 text-sm shadow-lg shadow-emerald-100">
              Register as Participant <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/dashboard" className="btn btn-ghost px-7 py-3 text-sm">
              Open Organizer Dashboard
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {[
              { value: "18", label: "Projects" },
              { value: "3",  label: "Judges"   },
              { value: "<2m",label: "Results"  },
            ].map(({ value, label }) => (
              <div key={label} className="card py-5 animate-fade-up text-center">
                <p className="font-outfit text-2xl font-black tracking-tight" style={{ color: "var(--text)" }}>{value}</p>
                <p className="section-label mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pipeline ── */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <p className="section-label text-center mb-8">How it works</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Cpu,    title: "DBSCAN Deduplication", desc: "Cosine similarity on sentence embeddings catches plagiarism before it reaches judges.", bg: "bg-sky-50",     ic: "text-sky-600",     border: "border-sky-100"     },
            { icon: Zap,    title: "Hungarian Matching",    desc: "Optimal bipartite assignment pairs judges to projects, minimising conflict-of-interest.", bg: "bg-amber-50",   ic: "text-amber-600",   border: "border-amber-100"   },
            { icon: Shield, title: "Z-Score Calibration",   desc: "Per-judge score distributions are normalised, eliminating lenient and harsh outliers.", bg: "bg-emerald-50", ic: "text-emerald-600", border: "border-emerald-100" },
          ].map(({ icon: Icon, title, desc, bg, ic, border }) => (
            <div key={title} className="card p-6 animate-fade-up">
              <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${ic}`} />
              </div>
              <h3 className="font-outfit text-base font-bold mb-2" style={{ color: "var(--text)" }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Modules Grid ── */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <p className="section-label text-center mb-8">Platform modules</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(({ href, icon: Icon, label, title, desc, accent }) => {
            const s = accentStyles[accent];
            return (
              <Link key={href} href={href}
                className={`card card-lift p-5 group flex flex-col gap-4 cursor-pointer animate-fade-up ${s.borderHover}`}>
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center border border-transparent`}>
                    <Icon className={`w-5 h-5 ${s.iconColor}`} />
                  </div>
                  <span className={`section-label ${s.labelColor} opacity-70`}>{label}</span>
                </div>
                <div>
                  <h3 className="font-outfit font-bold text-base mb-1.5 group-hover:text-emerald-700 transition" style={{ color: "var(--text)" }}>
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-semibold mt-auto ${s.labelColor}`}>
                  Open module
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="card p-6">
          <p className="section-label mb-4">Built with</p>
          <div className="flex flex-wrap gap-2">
            {techStack.map(tech => (
              <span key={tech} className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold"
                style={{ background: "var(--bg-soft)", color: "var(--text-muted)", border: "1.5px solid var(--border)" }}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t text-center py-8 px-6" style={{ borderColor: "var(--border)", color: "var(--text-faint)" }}>
        <p className="text-xs font-mono">HackOS · Dell Future Minds AI Hackathon 2026 · PS1 Submission</p>
      </footer>
    </div>
  );
}
