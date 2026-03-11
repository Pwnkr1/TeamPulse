"use client";

import { useState } from "react";
import {
  Brain,
  Send,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Sparkles,
  FileSearch,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import { SIMILAR_CASES, CATEGORY_LABELS, type ProblemCategory } from "@/lib/mockData";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

const CATEGORIES: { value: ProblemCategory; label: string; icon: string; desc: string }[] = [
  { value: "code_coupling", label: "Code Coupling", icon: "🔗", desc: "Tightly coupled modules, cascading changes" },
  { value: "duplication", label: "Duplicate Work", icon: "📋", desc: "Same work done multiple times across teams" },
  { value: "devops", label: "DevOps / Deployment", icon: "🚀", desc: "CI/CD pipeline, infrastructure, release issues" },
  { value: "management", label: "Process & Management", icon: "📌", desc: "Unclear priorities, planning, retrospectives" },
  { value: "communication", label: "Communication", icon: "💬", desc: "Team alignment, async, decision-making" },
  { value: "technical_debt", label: "Technical Debt", icon: "🏚️", desc: "Legacy code, slow velocity, maintenance burden" },
];

type Stage = "idle" | "classifying" | "researching" | "generating" | "done";

const STAGE_MESSAGES: Record<Stage, string> = {
  idle: "",
  classifying: "Classifying your problem with AI…",
  researching: "Searching for similar cases across 500+ engineering teams…",
  generating: "Generating your personalised mindset survey…",
  done: "Analysis complete!",
};

export default function SubmitProblem() {
  const router = useRouter();
  const [category, setCategory] = useState<ProblemCategory>("code_coupling");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");
  const [stage, setStage] = useState<Stage>("idle");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [analysisVisible, setAnalysisVisible] = useState(false);

  const selectedCat = CATEGORIES.find((c) => c.value === category)!;
  const cases = SIMILAR_CASES[category] ?? [];

  async function handleAnalyze() {
    if (!description.trim()) return;
    setStage("classifying");
    setAnalysisVisible(false);
    try {
      // Submit to backend — pipeline runs async
      await api.post("/api/problems", { category, urgency, description });
    } catch {
      // Continue with UX animation even if API fails
    }
    await new Promise((r) => setTimeout(r, 1400));
    setStage("researching");
    await new Promise((r) => setTimeout(r, 1600));
    setStage("generating");
    await new Promise((r) => setTimeout(r, 1200));
    setStage("done");
    setAnalysisVisible(true);
  }

  const isRunning = stage === "classifying" || stage === "researching" || stage === "generating";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain size={22} className="text-cyan-400" />
          Submit a Problem
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Describe your blocker honestly. The AI agent will find solutions and build a survey to help shift your mindset.
        </p>
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* ── Left: Form ── */}
        <div className="col-span-2 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Problem Category</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="input-cyber px-4 py-2.5 text-sm text-left flex items-center justify-between w-full"
              >
                <span className="flex items-center gap-2">
                  <span>{selectedCat.icon}</span>
                  <span className="text-white">{selectedCat.label}</span>
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
                  style={{ background: "rgba(6,12,28,0.98)", border: "1px solid rgba(6,182,212,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
                >
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => { setCategory(cat.value); setDropdownOpen(false); setStage("idle"); setAnalysisVisible(false); }}
                      className="w-full text-left px-4 py-3 hover:bg-cyan-400/08 transition-colors flex items-start gap-3"
                      style={category === cat.value ? { background: "rgba(6,182,212,0.1)" } : {}}
                    >
                      <span className="text-lg mt-0.5">{cat.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{cat.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{cat.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Urgency Level</label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((u) => {
                const colors = { low: "#10B981", medium: "#F59E0B", high: "#EF4444" };
                const active = urgency === u;
                return (
                  <button
                    key={u}
                    onClick={() => setUrgency(u)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all"
                    style={
                      active
                        ? { background: `${colors[u]}20`, color: colors[u], border: `1px solid ${colors[u]}50` }
                        : { background: "rgba(255,255,255,0.03)", color: "rgba(148,163,184,0.6)", border: "1px solid rgba(255,255,255,0.06)" }
                    }
                  >
                    {u}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Describe your problem <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={7}
              placeholder="Be specific — explain what you tried, what broke, how long you've been blocked, and what the impact is…"
              className="input-cyber px-4 py-3 text-sm resize-none"
            />
            <p className="text-xs text-slate-600 mt-1 text-right">{description.length} chars</p>
          </div>

          {/* Submit */}
          <button
            onClick={handleAnalyze}
            disabled={!description.trim() || isRunning}
            className="btn-cyan w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ position: "relative" }}
          >
            {isRunning ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                {STAGE_MESSAGES[stage]}
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Analyze with AI Agent
              </>
            )}
          </button>

          {/* Progress stages */}
          {stage !== "idle" && (
            <div className="space-y-2 pt-1">
              {(["classifying", "researching", "generating"] as const).map((s, i) => {
                const stageOrder: Stage[] = ["classifying", "researching", "generating", "done"];
                const current = stageOrder.indexOf(stage);
                const thisIdx = stageOrder.indexOf(s);
                const isDone = current > thisIdx || stage === "done";
                const isActive = stage === s;
                return (
                  <div key={s} className="flex items-center gap-2.5 text-xs">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={
                        isDone
                          ? { background: "rgba(16,185,129,0.2)", border: "1px solid #10B981" }
                          : isActive
                          ? { background: "rgba(6,182,212,0.2)", border: "1px solid #06B6D4" }
                          : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
                      }
                    >
                      {isDone ? (
                        <CheckCircle2 size={11} style={{ color: "#10B981" }} />
                      ) : isActive ? (
                        <Loader2 size={11} className="animate-spin" style={{ color: "#06B6D4" }} />
                      ) : (
                        <span style={{ color: "rgba(148,163,184,0.3)" }}>·</span>
                      )}
                    </div>
                    <span style={{ color: isDone ? "#10B981" : isActive ? "#06B6D4" : "rgba(148,163,184,0.4)" }}>
                      {["Classify problem", "Retrieve similar cases", "Generate survey"][i]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right: AI Analysis ── */}
        <div className="col-span-3">
          {!analysisVisible && stage === "idle" && (
            <div
              className="h-full min-h-[300px] rounded-xl flex flex-col items-center justify-center gap-3 text-center px-8"
              style={{ background: "rgba(6,182,212,0.03)", border: "1px dashed rgba(6,182,212,0.15)" }}
            >
              <Brain size={36} className="text-cyan-900" />
              <p className="text-slate-600 text-sm">
                Submit your problem description on the left to see AI analysis, industry case studies, and your generated survey here.
              </p>
            </div>
          )}

          {isRunning && (
            <div
              className="rounded-xl p-6 space-y-4 min-h-[300px] flex flex-col justify-center"
              style={{ background: "rgba(6,12,28,0.6)", border: "1px solid rgba(6,182,212,0.15)" }}
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="skeleton h-3 rounded" style={{ width: `${60 + i * 12}%` }} />
                  <div className="skeleton h-3 rounded" style={{ width: `${40 + i * 8}%` }} />
                </div>
              ))}
              <p className="text-xs text-cyan-400/60 animate-pulse text-center mt-4">{STAGE_MESSAGES[stage]}</p>
            </div>
          )}

          {analysisVisible && (
            <div className="space-y-4 animate-slide-up">
              {/* Classification */}
              <div className="card-cyber p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileSearch size={15} className="text-cyan-400" />
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Problem Classification</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{selectedCat.icon}</span>
                  <div>
                    <p className="font-semibold text-white">{selectedCat.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedCat.desc}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <AlertTriangle size={13} style={{ color: urgency === "high" ? "#EF4444" : urgency === "medium" ? "#F59E0B" : "#10B981" }} />
                    <span
                      className="text-xs font-medium capitalize"
                      style={{ color: urgency === "high" ? "#EF4444" : urgency === "medium" ? "#F59E0B" : "#10B981" }}
                    >
                      {urgency} urgency
                    </span>
                  </div>
                </div>
                <div
                  className="rounded-lg px-3 py-2 text-xs text-slate-400"
                  style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.1)" }}
                >
                  AI confidence: <span className="text-cyan-400 font-semibold">94%</span> — this problem pattern is common in mid-size engineering teams (30–150 engineers).
                </div>
              </div>

              {/* Similar Cases */}
              <div className="card-cyber p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ExternalLink size={15} className="text-cyan-400" />
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Industry Cases Found ({cases.length})
                  </span>
                </div>
                <div className="space-y-3">
                  {cases.map((c, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-4"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white">{c.company}</span>
                        <span className="badge badge-cyan">Case Study</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        <span className="text-slate-400 font-medium">Problem:</span> {c.problem}
                      </p>
                      <p className="text-xs text-slate-500 mb-2">
                        <span className="text-slate-400 font-medium">Solution:</span> {c.solution}
                      </p>
                      <div
                        className="rounded-lg px-3 py-1.5 text-xs"
                        style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}
                      >
                        <span className="text-green-400 font-medium">Outcome: </span>
                        <span className="text-slate-400">{c.outcome}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Survey generated */}
              <div
                className="rounded-xl p-5"
                style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-white mb-0.5">Survey Generated!</p>
                    <p className="text-xs text-slate-400">
                      A personalised mindset survey has been added to your{" "}
                      <span className="text-cyan-400">My Surveys</span> page. Complete it to help your manager understand
                      your perspective and receive targeted coaching.
                    </p>
                    <button
                      onClick={() => router.push("/developer/surveys")}
                      className="mt-3 btn-cyan px-4 py-1.5 text-xs flex items-center gap-1.5 w-fit"
                      style={{ position: "relative" }}
                    >
                      <ClipboardList size={12} /> Go to My Surveys
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
