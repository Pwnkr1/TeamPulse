"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SENTIMENT_CONFIG, CATEGORY_LABELS } from "@/lib/mockData";
import { api } from "@/lib/api";
import { LineChart as LineIcon, ChevronDown, ChevronUp, Brain, ClipboardList, Users, Loader2 } from "lucide-react";

const SCORE_INSIGHTS: Record<string, string> = {
  proactive: "This engineer actively solves problems and communicates blockers early. They are a multiplier — pair them with blocked teammates.",
  reactive: "Responds to problems after they escalate. Would benefit from structured check-ins and clearer priority signals.",
  blocked: "Showing signs of disengagement or learned helplessness. Recommend 1:1 coaching focused on psychological safety.",
  neutral: "Consistent but not fully engaged. May need more ownership opportunities or clearer growth path.",
};

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

interface TrendItem { week: string; sent: number; completed: number; }

function MemberCard({ m }: { m: TeamMember }) {
  const [open, setOpen] = useState(false);
  const sentiment = SENTIMENT_CONFIG[m.sentiment as keyof typeof SENTIMENT_CONFIG] ?? SENTIMENT_CONFIG.neutral;
  const pct = m.surveysTotal > 0 ? Math.round((m.surveysDone / m.surveysTotal) * 100) : 0;

  return (
    <div className="card-purple overflow-hidden">
      <button
        className="w-full p-5 text-left flex items-center gap-4"
        onClick={() => setOpen((o) => !o)}
      >
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: "rgba(233,160,32,0.15)", border: "1px solid rgba(233,160,32,0.3)", color: "#E9A020" }}
        >
          {m.avatar ?? m.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-semibold text-sm" style={{ color: "#1E1B3A" }}>{m.name}</p>
            <span
              className="badge"
              style={{ background: sentiment.bg, color: sentiment.color, border: `1px solid ${sentiment.color}30` }}
            >
              {sentiment.label}
            </span>
          </div>
          <p className="text-xs" style={{ color: "#9896B5" }}>{m.role} · {m.team}</p>
        </div>
        <div className="flex items-center gap-5 shrink-0">
          <div className="text-center">
            <p
              className="text-xl font-black"
              style={{ color: m.score >= 75 ? "#059669" : m.score >= 50 ? "#B45309" : "#DC2626" }}
            >
              {m.score}
            </p>
            <p className="text-xs" style={{ color: "#9896B5" }}>score</p>
          </div>
          {open ? <ChevronUp size={16} style={{ color: "#9896B5" }} /> : <ChevronDown size={16} style={{ color: "#9896B5" }} />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t" style={{ borderColor: "rgba(124,107,196,0.12)" }}>
          <div className="pt-4 grid grid-cols-3 gap-4 mb-4">
            <div className="rounded-xl p-3 text-center" style={{ background: "rgba(124,107,196,0.06)", border: "1px solid rgba(124,107,196,0.12)" }}>
              <Brain size={14} style={{ color: "#7C6BC4" }} className="mx-auto mb-1" />
              <p className="text-lg font-bold" style={{ color: "#1E1B3A" }}>{m.problemsCount}</p>
              <p className="text-xs" style={{ color: "#9896B5" }}>Problems</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "rgba(233,160,32,0.06)", border: "1px solid rgba(233,160,32,0.12)" }}>
              <ClipboardList size={14} style={{ color: "#E9A020" }} className="mx-auto mb-1" />
              <p className="text-lg font-bold" style={{ color: "#1E1B3A" }}>{m.surveysDone}/{m.surveysTotal}</p>
              <p className="text-xs" style={{ color: "#9896B5" }}>Surveys</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: `${sentiment.color}0A`, border: `1px solid ${sentiment.color}20` }}>
              <div className="w-2 h-2 rounded-full mx-auto mb-2" style={{ background: sentiment.color }} />
              <p className="text-lg font-bold" style={{ color: sentiment.color }}>{pct}%</p>
              <p className="text-xs" style={{ color: "#9896B5" }}>Completion</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs mb-2 font-medium" style={{ color: "#9896B5" }}>Problem Areas</p>
            <div className="flex flex-wrap gap-2">
              {m.categories.length > 0
                ? m.categories.map((cat) => (
                    <span key={cat} className="badge badge-purple">{CATEGORY_LABELS[cat] ?? cat}</span>
                  ))
                : <span className="text-xs" style={{ color: "#9896B5" }}>None yet</span>
              }
            </div>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ background: `${sentiment.color}08`, border: `1px solid ${sentiment.color}18` }}
          >
            <p className="text-xs mb-1 font-medium uppercase tracking-wider" style={{ color: "#9896B5" }}>AI Coaching Recommendation</p>
            <p className="text-sm leading-relaxed" style={{ color: "#5C5A7A" }}>{SCORE_INSIGHTS[m.sentiment] ?? SCORE_INSIGHTS.neutral}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamInsights() {
  const [mounted, setMounted] = useState(false);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [trend, setTrend] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    Promise.all([
      api.get<{ team: TeamMember[] }>("/api/manager/team"),
      api.get<{ data: TrendItem[] }>("/api/manager/chart/trend"),
    ]).then(([teamData, trendData]) => {
      setTeam(teamData.team);
      setTrend(trendData.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (!mounted) return null;

  const byScore = [...team].sort((a, b) => b.score - a.score);

  return (
    <div className="animate-fade-in">
      <div className="mb-7">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "#1E1B3A" }}>
          <LineIcon size={22} style={{ color: "#E9A020" }} />
          Team Insights
        </h1>
        <p className="text-sm mt-1" style={{ color: "#5C5A7A" }}>
          Deep-dive into individual engineer mindset scores, problem patterns, and AI coaching recommendations.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin" style={{ color: "#E9A020" }} />
        </div>
      ) : (
        <>
          {/* Survey completion trend */}
          <div className="card-purple p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <LineIcon size={15} style={{ color: "#E9A020" }} />
              <p className="text-sm font-semibold" style={{ color: "#1E1B3A" }}>Survey Completion Trend</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trend} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,107,196,0.12)" />
                <XAxis dataKey="week" tick={{ fill: "#9896B5", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9896B5", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#FFFFFF", border: "1px solid rgba(233,160,32,0.3)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#1E1B3A" }}
                  itemStyle={{ color: "#1E1B3A" }}
                />
                <Line type="monotone" dataKey="sent" stroke="rgba(124,107,196,0.5)" strokeWidth={2} dot={false} name="Sent" />
                <Line type="monotone" dataKey="completed" stroke="#E9A020" strokeWidth={2.5} dot={{ fill: "#E9A020", strokeWidth: 0, r: 4 }} name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sentiment distribution */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {(["proactive", "reactive", "blocked", "neutral"] as const).map((s) => {
              const cfg = SENTIMENT_CONFIG[s];
              const count = team.filter((m) => m.sentiment === s).length;
              return (
                <div key={s} className="card-purple p-4 text-center">
                  <div
                    className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}
                  >
                    <Users size={16} style={{ color: cfg.color }} />
                  </div>
                  <p className="text-xl font-black" style={{ color: cfg.color }}>{count}</p>
                  <p className="text-xs capitalize" style={{ color: "#9896B5" }}>{cfg.label}</p>
                </div>
              );
            })}
          </div>

          {/* Score leaderboard */}
          <div className="card-purple p-5 mb-6">
            <p className="text-sm font-semibold mb-4" style={{ color: "#1E1B3A" }}>Mindset Score Ranking</p>
            <div className="space-y-3">
              {byScore.map((m, i) => {
                const col = m.score >= 75 ? "#059669" : m.score >= 50 ? "#B45309" : "#DC2626";
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <span className="text-xs w-4 text-right shrink-0" style={{ color: "#9896B5" }}>{i + 1}</span>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: "rgba(233,160,32,0.12)", color: "#E9A020" }}
                    >
                      {m.avatar ?? m.name.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-sm flex-1 truncate" style={{ color: "#1E1B3A" }}>{m.name}</p>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-24 progress-bar">
                        <div className="progress-fill" style={{ width: `${m.score}%`, background: `linear-gradient(90deg, ${col}80, ${col})` }} />
                      </div>
                      <span className="text-sm font-bold w-8 text-right" style={{ color: col }}>{m.score}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Individual cards */}
          <div>
            <p className="text-sm font-semibold mb-4" style={{ color: "#1E1B3A" }}>Individual Profiles</p>
            <div className="space-y-3">
              {team.map((m) => <MemberCard key={m.id} m={m} />)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
