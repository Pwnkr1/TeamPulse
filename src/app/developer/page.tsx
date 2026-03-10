"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { MOCK_SURVEYS, MOCK_PROBLEMS, CATEGORY_LABELS } from "@/lib/mockData";
import { Brain, ClipboardList, TrendingUp, Zap, ArrowRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const TIPS = [
  "Teams that run blameless post-mortems see 30% fewer repeat incidents.",
  "Writing down your blocker clarifies 60% of problems before you ask for help.",
  "The most common source of tight coupling is unclear ownership boundaries.",
  "Psychological safety is the #1 predictor of high-performing engineering teams.",
  "Engineers who own their deployments ship 4x more frequently.",
];

export default function DevDashboard() {
  const router = useRouter();
  const [name, setName] = useState("Developer");
  const [tipIdx, setTipIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (u) setName(u.name.split(" ")[0]);
    const iv = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 5000);
    return () => clearInterval(iv);
  }, []);

  const pending = MOCK_SURVEYS.filter((s) => s.status === "pending").length;
  const completed = MOCK_SURVEYS.filter((s) => s.status === "completed").length;
  const myProblems = MOCK_PROBLEMS.length;

  if (!mounted) return null;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="pulse-dot" style={{ background: "#06B6D4" }} />
          <span className="text-xs text-slate-500 uppercase tracking-widest">Live Session</span>
        </div>
        <h1 className="text-3xl font-bold text-white">
          Good morning, <span className="text-gradient-cyan">{name}</span> 👋
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Sprint Week 10 &nbsp;·&nbsp; 2 surveys awaiting your response
        </p>
      </div>

      {/* Tip banner */}
      <div
        className="rounded-xl px-5 py-3.5 mb-7 flex items-start gap-3"
        style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)" }}
      >
        <span className="text-lg">💡</span>
        <p className="text-sm text-slate-300 leading-relaxed transition-all duration-500">{TIPS[tipIdx]}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Problems Submitted",
            value: myProblems,
            icon: Brain,
            color: "#06B6D4",
            sub: "This sprint",
          },
          {
            label: "Surveys Pending",
            value: pending,
            icon: Clock,
            color: "#F59E0B",
            sub: "Action required",
          },
          {
            label: "Surveys Completed",
            value: completed,
            icon: CheckCircle2,
            color: "#10B981",
            sub: "Great work!",
          },
        ].map((s) => (
          <div key={s.label} className="card-cyber p-5">
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${s.color}18`, border: `1px solid ${s.color}25` }}
              >
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <span className="text-3xl font-black" style={{ color: s.color }}>
                {s.value}
              </span>
            </div>
            <p className="text-sm font-medium text-white">{s.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => router.push("/developer/submit")}
          className="card-cyber p-5 text-left hover:border-cyan-400/50 group transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)" }}
            >
              <Brain size={20} style={{ color: "#06B6D4" }} />
            </div>
            <ArrowRight size={16} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-semibold text-white mb-1">Submit a Problem</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Describe your blocker and our AI agent will classify it, find industry solutions, and generate a personalised survey.
          </p>
          <div className="mt-4">
            <span className="btn-cyan px-3 py-1.5 text-xs inline-flex items-center gap-1.5" style={{ position: "relative" }}>
              <Zap size={12} /> Start Analysis
            </span>
          </div>
        </button>

        <button
          onClick={() => router.push("/developer/surveys")}
          className="card-cyber p-5 text-left hover:border-cyan-400/50 group transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              <ClipboardList size={20} style={{ color: "#F59E0B" }} />
            </div>
            {pending > 0 && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(245,158,11,0.2)", color: "#FCD34D", border: "1px solid rgba(245,158,11,0.3)" }}
              >
                {pending} pending
              </span>
            )}
          </div>
          <h3 className="font-semibold text-white mb-1">My Surveys</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Complete mindset-shifting surveys generated from your problems. Your responses help your manager coach you better.
          </p>
          <div className="mt-4">
            <span className="btn-outline-cyan px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
              <ClipboardList size={12} /> View Surveys
            </span>
          </div>
        </button>
      </div>

      {/* Recent Problems */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-cyan-400" />
            Recent Problems
          </h2>
        </div>
        <div className="space-y-3">
          {MOCK_PROBLEMS.map((p) => (
            <div key={p.id} className="card-cyber p-4 flex items-start gap-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}
              >
                <AlertCircle size={16} style={{ color: "#06B6D4" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-cyan">{CATEGORY_LABELS[p.category]}</span>
                  <span className={`badge ${p.status === "completed" ? "badge-green" : "badge-amber"}`}>
                    {p.status === "completed" ? "Survey Done" : "Survey Pending"}
                  </span>
                </div>
                <p className="text-sm text-slate-300 line-clamp-2">{p.description}</p>
                <p className="text-xs text-slate-600 mt-1.5">
                  {new Date(p.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
