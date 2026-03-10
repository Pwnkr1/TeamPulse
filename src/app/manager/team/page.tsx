"use client";

import { useEffect, useState } from "react";
import { Users, Brain, ClipboardList, TrendingUp } from "lucide-react";
import { TEAM_MEMBERS, SENTIMENT_CONFIG, CATEGORY_LABELS } from "@/lib/mockData";

export default function TeamMembers() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="animate-fade-in">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users size={22} className="text-violet-400" />
          Team Members
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Full roster of your engineering team with mindset scores, problem patterns, and survey progress.
        </p>
      </div>

      {/* Table-style list */}
      <div className="card-purple overflow-hidden">
        {/* Header */}
        <div
          className="grid px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider"
          style={{
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span>Engineer</span>
          <span className="text-center">Mindset</span>
          <span className="text-center">Problems</span>
          <span className="text-center">Surveys</span>
          <span className="text-center">Score</span>
        </div>

        {TEAM_MEMBERS.map((m, i) => {
          const sentiment = SENTIMENT_CONFIG[m.sentiment];
          const pct = Math.round((m.surveysDone / m.surveysTotal) * 100);
          const scoreColor = m.score >= 75 ? "#10B981" : m.score >= 50 ? "#F59E0B" : "#EF4444";

          return (
            <div
              key={m.id}
              className="grid px-5 py-4 items-center transition-colors hover:bg-white/[0.02]"
              style={{
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                borderBottom: i < TEAM_MEMBERS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}
            >
              {/* Name */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#A78BFA" }}
                >
                  {m.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.role} · {m.team}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {m.categories.map((c) => (
                      <span key={c} className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(6,182,212,0.08)", color: "#22D3EE", fontSize: 10 }}>
                        {CATEGORY_LABELS[c]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sentiment */}
              <div className="flex justify-center">
                <span
                  className="badge"
                  style={{ background: sentiment.bg, color: sentiment.color, border: `1px solid ${sentiment.color}30` }}
                >
                  {sentiment.label}
                </span>
              </div>

              {/* Problems */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Brain size={13} className="text-cyan-400" />
                  <span className="text-sm font-semibold text-white">{m.problemsCount}</span>
                </div>
              </div>

              {/* Surveys progress */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-1.5 text-xs">
                  <ClipboardList size={12} style={{ color: pct === 100 ? "#10B981" : "#F59E0B" }} />
                  <span style={{ color: pct === 100 ? "#10B981" : "#F59E0B" }}>
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

              {/* Score */}
              <div className="flex justify-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
                  style={{
                    background: `${scoreColor}12`,
                    border: `2px solid ${scoreColor}40`,
                    color: scoreColor,
                    boxShadow: `0 0 10px ${scoreColor}25`,
                  }}
                >
                  {m.score}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team avg */}
      <div className="mt-5 grid grid-cols-3 gap-4">
        {[
          {
            label: "Avg Mindset Score",
            value: Math.round(TEAM_MEMBERS.reduce((a, m) => a + m.score, 0) / TEAM_MEMBERS.length),
            color: "#8B5CF6",
            icon: TrendingUp,
          },
          {
            label: "Total Problems Logged",
            value: TEAM_MEMBERS.reduce((a, m) => a + m.problemsCount, 0),
            color: "#06B6D4",
            icon: Brain,
          },
          {
            label: "Surveys Completed",
            value: TEAM_MEMBERS.reduce((a, m) => a + m.surveysDone, 0),
            color: "#10B981",
            icon: ClipboardList,
          },
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
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
