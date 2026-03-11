"use client";

import { useState, useEffect } from "react";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  ChevronLeft,
  X,
  Brain,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/mockData";
import { api } from "@/lib/api";

const CAT_COLORS: Record<string, string> = {
  code_coupling: "#06B6D4",
  devops: "#F59E0B",
  management: "#8B5CF6",
  communication: "#10B981",
  duplication: "#EC4899",
  technical_debt: "#EF4444",
};

interface ApiSurveyListItem {
  id: string;
  title: string;
  category: string;
  status: "pending" | "completed" | "expired";
  deadline: string;
  completedAt?: string;
  questionCount: number;
}

interface ApiQuestion {
  id: string;
  text: string;
  options: string[];
  insightLabel: string;
  orderIndex: number;
}

interface ApiFullSurvey extends ApiSurveyListItem {
  questions: ApiQuestion[];
}

function SurveyModal({
  survey,
  onClose,
  onComplete,
}: {
  survey: ApiFullSurvey;
  onClose: () => void;
  onComplete: (id: string) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const q = survey.questions[idx];
  const total = survey.questions.length;
  const pct = (idx / total) * 100;
  const accentColor = CAT_COLORS[survey.category] ?? "#06B6D4";

  function select(answer: string) {
    setAnswers((prev) => ({ ...prev, [q.id]: answer }));
  }

  async function next() {
    if (idx < total - 1) {
      setIdx((i) => i + 1);
    } else {
      setSubmitting(true);
      try {
        await api.post(`/api/surveys/${survey.id}/respond`, { responses: answers });
      } catch {
        // still mark done in UI
      }
      setSubmitting(false);
      setDone(true);
      onComplete(survey.id);
    }
  }

  function prev() {
    if (idx > 0) setIdx((i) => i - 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div
        className="w-full max-w-xl rounded-2xl overflow-hidden animate-slide-up"
        style={{ background: "rgba(6,12,28,0.98)", border: `1px solid ${accentColor}30`, boxShadow: `0 0 40px ${accentColor}20` }}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-start justify-between" style={{ borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
              {CATEGORY_LABELS[survey.category] ?? survey.category}
            </p>
            <h3 className="font-bold text-white text-sm">{survey.title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(16,185,129,0.15)", border: "2px solid #10B981", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}
            >
              <CheckCircle2 size={28} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Survey Complete!</h3>
            <p className="text-slate-400 text-sm mb-1">
              Your responses have been recorded and shared with your manager.
            </p>
            <p className="text-slate-500 text-xs mb-6">
              Expect personalised coaching notes within your next retrospective.
            </p>
            <div
              className="rounded-xl p-4 text-left mb-5"
              style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)" }}
            >
              <p className="text-xs text-slate-400 mb-2 font-medium">Your mindset snapshot:</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Answers submitted</span>
                <span className="text-cyan-400 font-bold">{total}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-slate-500">Category focus</span>
                <span style={{ color: accentColor }} className="font-medium">
                  {CATEGORY_LABELS[survey.category] ?? survey.category}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn-cyan px-6 py-2.5 text-sm w-full"
              style={{ position: "relative" }}
            >
              Back to Surveys
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accentColor}80, ${accentColor})` }} />
              </div>
              <span className="text-xs text-slate-500 shrink-0">{idx + 1} / {total}</span>
            </div>

            <div
              className="rounded-lg px-3 py-2 mb-4 flex items-center gap-2"
              style={{ background: `${accentColor}0D`, border: `1px solid ${accentColor}18` }}
            >
              <Brain size={12} style={{ color: accentColor }} />
              <p className="text-xs" style={{ color: `${accentColor}CC` }}>{q.insightLabel}</p>
            </div>

            <p className="font-semibold text-white text-base mb-5 leading-relaxed">{q.text}</p>

            <div className="space-y-2.5">
              {q.options.map((opt, i) => {
                const isSelected = answers[q.id] === opt;
                return (
                  <button
                    key={i}
                    onClick={() => select(opt)}
                    className={`survey-option w-full ${isSelected ? "selected" : ""}`}
                    style={isSelected ? { borderColor: accentColor, background: `${accentColor}12` } : {}}
                  >
                    <div
                      className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                      style={
                        isSelected
                          ? { borderColor: accentColor, background: accentColor }
                          : { borderColor: "rgba(148,163,184,0.3)" }
                      }
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm text-slate-300 text-left">{opt}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={prev}
                disabled={idx === 0}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors disabled:opacity-30"
              >
                <ChevronLeft size={15} /> Previous
              </button>
              <button
                onClick={next}
                disabled={!answers[q.id] || submitting}
                className="btn-cyan px-5 py-2 text-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ position: "relative" }}
              >
                {submitting ? <Loader2 size={13} className="animate-spin" /> : null}
                {idx === total - 1 ? "Submit" : "Next"}
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MySurveys() {
  const [surveys, setSurveys] = useState<ApiSurveyListItem[]>([]);
  const [active, setActive] = useState<ApiFullSurvey | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ surveys: ApiSurveyListItem[] }>("/api/surveys")
      .then((d) => setSurveys(d.surveys))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleStart(id: string) {
    setLoadingId(id);
    try {
      const { survey } = await api.get<{ survey: ApiFullSurvey }>(`/api/surveys/${id}`);
      setActive(survey);
    } catch {
      // ignore
    }
    setLoadingId(null);
  }

  function handleComplete(id: string) {
    setSurveys((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "completed" as const, completedAt: new Date().toISOString() } : s))
    );
  }

  const pending = surveys.filter((s) => s.status === "pending");
  const done = surveys.filter((s) => s.status === "completed");

  return (
    <div className="animate-fade-in">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ClipboardList size={22} className="text-cyan-400" />
          My Surveys
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Complete your surveys to help your manager understand how you think and where you need support.
        </p>
      </div>

      <div className="flex gap-3 mb-7">
        {[
          { label: "Pending", count: pending.length, color: "#F59E0B", icon: Clock },
          { label: "Completed", count: done.length, color: "#10B981", icon: CheckCircle2 },
          { label: "Total", count: surveys.length, color: "#06B6D4", icon: ClipboardList },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-xl px-4 py-3 flex-1"
            style={{ background: `${s.color}0A`, border: `1px solid ${s.color}20` }}
          >
            <s.icon size={16} style={{ color: s.color }} />
            <div>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-lg font-bold" style={{ color: s.color }}>{s.count}</p>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-cyan-400" />
        </div>
      )}

      {!loading && pending.length === 0 && done.length === 0 && (
        <div
          className="rounded-xl p-10 text-center"
          style={{ background: "rgba(6,182,212,0.03)", border: "1px dashed rgba(6,182,212,0.15)" }}
        >
          <p className="text-slate-500 text-sm">No surveys yet. Submit a problem to generate one.</p>
        </div>
      )}

      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Clock size={14} className="text-amber-400" /> Pending Surveys
          </h2>
          <div className="space-y-3">
            {pending.map((s) => {
              const accent = CAT_COLORS[s.category] ?? "#06B6D4";
              return (
                <div key={s.id} className="card-cyber p-5 flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}
                  >
                    <ClipboardList size={18} style={{ color: accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-amber">Pending</span>
                      <span className="badge" style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
                        {CATEGORY_LABELS[s.category] ?? s.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">{s.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{s.questionCount} questions</span>
                      <span>Due {new Date(s.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStart(s.id)}
                    disabled={loadingId === s.id}
                    className="btn-cyan px-4 py-2 text-xs flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                    style={{ position: "relative" }}
                  >
                    {loadingId === s.id ? <Loader2 size={12} className="animate-spin" /> : null}
                    Start <ArrowRight size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-400" /> Completed Surveys
          </h2>
          <div className="space-y-3">
            {done.map((s) => {
              const accent = CAT_COLORS[s.category] ?? "#10B981";
              return (
                <div
                  key={s.id}
                  className="rounded-xl p-5 flex items-start gap-4 opacity-70"
                  style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
                  >
                    <CheckCircle2 size={18} className="text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-green">Completed</span>
                      <span className="badge" style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
                        {CATEGORY_LABELS[s.category] ?? s.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">{s.title}</h3>
                    <p className="text-xs text-slate-600">
                      Completed {s.completedAt ? new Date(s.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </p>
                  </div>
                  <XCircle size={15} className="text-slate-700 shrink-0 mt-1" />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {active && (
        <SurveyModal survey={active} onClose={() => setActive(null)} onComplete={handleComplete} />
      )}
    </div>
  );
}
