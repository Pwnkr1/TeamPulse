"use client";

import { useEffect, useState } from "react";
import { Users, Brain, ClipboardList, TrendingUp, Loader2 } from "lucide-react";
import { SENTIMENT_CONFIG, CATEGORY_LABELS } from "@/lib/mockData";
import { api } from "@/lib/api";

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  team: string;
  problemsCount: number;
  surveysDone: number;
  surveysTotal: number;
  sentiment: string;
  categories: string[];
  score: number;
}

export default function TeamMembers() {
  const [mounted, setMounted] = useState(false);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    api.get<{ team: TeamMember[] }>("/api/manager/team")
      .then((d) => setTeam(d.team))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!mounted) return null;

  const avgScore = team.length > 0 ? Math.round(team.reduce((a, m) => a + m.score, 0) / team.length) : 0;
  const totalProblems = team.reduce((a, m) => a + m.problemsCount, 0);
  const totalDone = team.reduce((a, m) => a + m.surveysDone, 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-7">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "#1E1B3A" }}>
          <Users size={22} style={{ color: "#E9A020" }} />
          Team Members
        </h1>
        <p className="text-sm mt-1" style={{ color: "#5C5A7A" }}>
          Full roster of your engineering team with mindset scores, problem patterns, and survey progress.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin" style={{ color: "#E9A020" }} />
        </div>
      ) : (
        <>
          <div className="card-purple overflow-hidden">
            <div
              className="grid px-5 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", borderBottom: "1px solid rgba(124,107,196,0.12)", color: "#9896B5" }}
            >
              <span>Engineer</span>
              <span className="text-center">Mindset</span>
              <span className="text-center">Problems</span>
              <span className="text-center">Surveys</span>
              <span className="text-center">Score</span>
            </div>

            {team.map((m, i) => {
              const sentiment = SENTIMENT_CONFIG[m.sentiment as keyof typeof SENTIMENT_CONFIG] ?? SENTIMENT_CONFIG.neutral;
              const pct = m.surveysTotal > 0 ? Math.round((m.surveysDone / m.surveysTotal) * 100) : 0;
              const scoreColor = m.score >= 75 ? "#059669" : m.score >= 50 ? "#B45309" : "#DC2626";

              return (
                <div
                  key={m.id}
                  className="grid px-5 py-4 items-center transition-colors"
                  style={{
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                    borderBottom: i < team.length - 1 ? "1px solid rgba(124,107,196,0.08)" : "none",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: "rgba(233,160,32,0.15)", border: "1px solid rgba(233,160,32,0.3)", color: "#E9A020" }}
                    >
                      {m.avatar ?? m.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#1E1B3A" }}>{m.name}</p>
                      <p className="text-xs" style={{ color: "#9896B5" }}>{m.role} · {m.team}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {m.categories.map((c) => (
                          <span key={c} className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(124,107,196,0.08)", color: "#7C6BC4", fontSize: 10 }}>
                            {CATEGORY_LABELS[c] ?? c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <span className="badge" style={{ background: sentiment.bg, color: sentiment.color, border: `1px solid ${sentiment.color}30` }}>
                      {sentiment.label}
                    </span>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Brain size={13} style={{ color: "#7C6BC4" }} />
                      <span className="text-sm font-semibold" style={{ color: "#1E1B3A" }}>{m.problemsCount}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center gap-1.5 text-xs">
                      <ClipboardList size={12} style={{ color: pct === 100 ? "#059669" : "#B45309" }} />
                      <span style={{ color: pct === 100 ? "#059669" : "#B45309" }}>
                        {m.surveysDone}/{m.surveysTotal}
                      </span>
                    </div>
                    <div className="w-20 progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${pct}%`,
                          background: pct === 100
                            ? "linear-gradient(90deg, #059669, #10B981)"
                            : "linear-gradient(90deg, #D97706, #F59E0B)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
                      style={{ background: `${scoreColor}12`, border: `2px solid ${scoreColor}40`, color: scoreColor, boxShadow: `0 0 10px ${scoreColor}20` }}
                    >
                      {m.score}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-4">
            {[
              { label: "Avg Mindset Score", value: avgScore, color: "#E9A020", icon: TrendingUp },
              { label: "Total Problems Logged", value: totalProblems, color: "#7C6BC4", icon: Brain },
              { label: "Surveys Completed", value: totalDone, color: "#059669", icon: ClipboardList },
            ].map((s) => (
              <div key={s.label} className="card-purple p-4 flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}
                >
                  <s.icon size={17} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs" style={{ color: "#9896B5" }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
