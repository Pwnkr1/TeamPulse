"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { CATEGORY_LABELS } from "@/lib/mockData";
import { Brain, ClipboardList, TrendingUp, Zap, ArrowRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const TIPS = [
  "Teams that run blameless post-mortems see 30% fewer repeat incidents.",
  "Writing down your blocker clarifies 60% of problems before you ask for help.",
  "The most common source of tight coupling is unclear ownership boundaries.",
  "Psychological safety is the #1 predictor of high-performing engineering teams.",
  "Engineers who own their deployments ship 4x more frequently.",
];

interface ApiProblem {
  id: string;
  category: string;
  description: string;
  status: string;
  createdAt: string;
  survey?: { id: string; status: string } | null;
}

interface ApiSurvey {
  id: string;
  status: string;
}

export default function DevDashboard() {
  const router = useRouter();
  const [name, setName] = useState("Developer");
  const [tipIdx, setTipIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [problems, setProblems] = useState<ApiProblem[]>([]);
  const [surveys, setSurveys] = useState<ApiSurvey[]>([]);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (u) setName(u.name.split(" ")[0]);
    const iv = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 5000);

    api.get<{ problems: ApiProblem[] }>("/api/problems").then((d) => setProblems(d.problems)).catch(() => {});
    api.get<{ surveys: ApiSurvey[] }>("/api/surveys").then((d) => setSurveys(d.surveys)).catch(() => {});

    return () => clearInterval(iv);
  }, []);

  const pending = surveys.filter((s) => s.status === "pending").length;
  const completed = surveys.filter((s) => s.status === "completed").length;

  if (!mounted) return null;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="pulse-dot" style={{ background: "#7C6BC4" }} />
          <span className="text-xs uppercase tracking-widest" style={{ color: "#9896B5" }}>Live Session</span>
        </div>
        <h1 className="text-3xl font-bold" style={{ color: "#1E1B3A" }}>
          Good morning, <span className="text-gradient-cyan">{name}</span> 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#5C5A7A" }}>
          Sprint Week 10 &nbsp;·&nbsp; {pending} survey{pending !== 1 ? "s" : ""} awaiting your response
        </p>
      </div>

      {/* Tip banner */}
      <div
        className="rounded-xl px-5 py-3.5 mb-7 flex items-start gap-3"
        style={{ background: "rgba(124,107,196,0.09)", border: "1px solid rgba(124,107,196,0.18)" }}
      >
        <span className="text-lg">💡</span>
        <p className="text-sm leading-relaxed transition-all duration-500" style={{ color: "#5C5A7A" }}>{TIPS[tipIdx]}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Problems Submitted",
            value: problems.length,
            icon: Brain,
            color: "#7C6BC4",
            sub: "This sprint",
          },
          {
            label: "Surveys Pending",
            value: pending,
            icon: Clock,
            color: "#B45309",
            sub: "Action required",
          },
          {
            label: "Surveys Completed",
            value: completed,
            icon: CheckCircle2,
            color: "#059669",
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
            <p className="text-sm font-medium" style={{ color: "#1E1B3A" }}>{s.label}</p>
            <p className="text-xs mt-0.5" style={{ color: "#9896B5" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => router.push("/developer/submit")}
          className="card-cyber p-5 text-left group transition-all"
          style={{ border: "1px solid rgba(124,107,196,0.18)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(124,107,196,0.12)", border: "1px solid rgba(124,107,196,0.25)" }}
            >
              <Brain size={20} style={{ color: "#7C6BC4" }} />
            </div>
            <ArrowRight size={16} style={{ color: "#9896B5" }} className="group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-semibold mb-1" style={{ color: "#1E1B3A" }}>Submit a Problem</h3>
          <p className="text-xs leading-relaxed" style={{ color: "#9896B5" }}>
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
          className="card-cyber p-5 text-left group transition-all"
          style={{ border: "1px solid rgba(124,107,196,0.18)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(180,83,9,0.12)", border: "1px solid rgba(180,83,9,0.25)" }}
            >
              <ClipboardList size={20} style={{ color: "#B45309" }} />
            </div>
            {pending > 0 && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(180,83,9,0.15)", color: "#B45309", border: "1px solid rgba(180,83,9,0.3)" }}
              >
                {pending} pending
              </span>
            )}
          </div>
          <h3 className="font-semibold mb-1" style={{ color: "#1E1B3A" }}>My Surveys</h3>
          <p className="text-xs leading-relaxed" style={{ color: "#9896B5" }}>
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
          <h2 className="font-semibold flex items-center gap-2" style={{ color: "#1E1B3A" }}>
            <TrendingUp size={16} style={{ color: "#7C6BC4" }} />
            Recent Problems
          </h2>
        </div>
        {problems.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: "rgba(124,107,196,0.05)", border: "1px dashed rgba(124,107,196,0.25)" }}
          >
            <p className="text-sm" style={{ color: "#9896B5" }}>No problems submitted yet. Use the &ldquo;Submit a Problem&rdquo; button above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {problems.map((p) => {
              const surveyDone = p.survey?.status === "completed";
              const surveyExists = !!p.survey;
              return (
                <div key={p.id} className="card-cyber p-4 flex items-start gap-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(124,107,196,0.1)", border: "1px solid rgba(124,107,196,0.2)" }}
                  >
                    <AlertCircle size={16} style={{ color: "#7C6BC4" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-cyan">{CATEGORY_LABELS[p.category] ?? p.category}</span>
                      <span className={`badge ${surveyDone ? "badge-green" : "badge-amber"}`}>
                        {surveyDone ? "Survey Done" : surveyExists ? "Survey Pending" : "Analyzing…"}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2" style={{ color: "#5C5A7A" }}>{p.description}</p>
                    <p className="text-xs mt-1.5" style={{ color: "#9896B5" }}>
                      {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
