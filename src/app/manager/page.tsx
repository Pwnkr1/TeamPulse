"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Brain,
  Zap,
  BarChart2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import {
  TEAM_MEMBERS,
  PROBLEM_CATEGORY_DATA,
  MINDSET_RADAR,
  SENTIMENT_CONFIG,
  CATEGORY_LABELS,
  ACTION_ITEMS,
} from "@/lib/mockData";

export default function ManagerDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const totalProblems = TEAM_MEMBERS.reduce((a, m) => a + m.problemsCount, 0);
  const totalSurveys = TEAM_MEMBERS.reduce((a, m) => a + m.surveysTotal, 0);
  const totalDone = TEAM_MEMBERS.reduce((a, m) => a + m.surveysDone, 0);
  const completionRate = Math.round((totalDone / totalSurveys) * 100);
  const avgScore = Math.round(TEAM_MEMBERS.reduce((a, m) => a + m.score, 0) / TEAM_MEMBERS.length);
  const blocked = TEAM_MEMBERS.filter((m) => m.sentiment === "blocked").length;

  if (!mounted) return null;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="pulse-dot" style={{ background: "#8B5CF6" }} />
          <span className="text-xs text-slate-500 uppercase tracking-widest">Manager Portal · Live</span>
        </div>
        <h1 className="text-3xl font-bold text-white">
          Team <span className="text-gradient-purple">Overview</span>
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Sprint Week 10 · {TEAM_MEMBERS.length} engineers · Platform, Backend, Growth, Infra</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Problems", value: totalProblems, icon: Brain, color: "#06B6D4", sub: "This sprint" },
          { label: "Survey Completion", value: `${completionRate}%`, icon: ClipboardList, color: "#8B5CF6", sub: `${totalDone}/${totalSurveys} done` },
          { label: "Avg Mindset Score", value: avgScore, icon: TrendingUp, color: "#10B981", sub: "Out of 100" },
          { label: "Blocked Engineers", value: blocked, icon: AlertTriangle, color: "#EF4444", sub: "Needs attention" },
        ].map((s) => (
          <div key={s.label} className="card-purple p-5">
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${s.color}18`, border: `1px solid ${s.color}25` }}
              >
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <span className="text-3xl font-black" style={{ color: s.color }}>{s.value}</span>
            </div>
            <p className="text-sm font-medium text-white">{s.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-5 mb-8">
        {/* Problems by category */}
        <div className="card-purple p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={15} className="text-violet-400" />
            <p className="text-sm font-semibold text-white">Problems by Category</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PROBLEM_CATEGORY_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "rgba(6,12,28,0.95)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#E2E8F0" }}
                cursor={{ fill: "rgba(139,92,246,0.06)" }}
              />
              <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                {PROBLEM_CATEGORY_DATA.map((entry, idx) => (
                  <rect key={idx} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mindset radar */}
        <div className="card-purple p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-violet-400" />
            <p className="text-sm font-semibold text-white">Team Mindset Radar</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={MINDSET_RADAR}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748B", fontSize: 10 }} />
              <Radar name="Team" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip
                contentStyle={{ background: "rgba(6,12,28,0.95)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#E2E8F0" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Users size={16} className="text-violet-400" /> Team Members
          </h2>
          <button
            onClick={() => router.push("/manager/insights")}
            className="text-xs flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors"
          >
            View full insights <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {TEAM_MEMBERS.map((m) => {
            const sentiment = SENTIMENT_CONFIG[m.sentiment];
            const pct = Math.round((m.surveysDone / m.surveysTotal) * 100);
            return (
              <div key={m.id} className="card-purple p-4 cursor-pointer" onClick={() => router.push("/manager/insights")}>
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: "rgba(139,92,246,0.15)",
                      border: "1px solid rgba(139,92,246,0.3)",
                      color: "#A78BFA",
                    }}
                  >
                    {m.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="badge text-xs"
                    style={{ background: sentiment.bg, color: sentiment.color, border: `1px solid ${sentiment.color}30` }}
                  >
                    {sentiment.label}
                  </span>
                  <span className="text-xs text-slate-600">{m.team}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>Surveys</span>
                  <span style={{ color: pct === 100 ? "#10B981" : "#F59E0B" }}>
                    {m.surveysDone}/{m.surveysTotal}
                  </span>
                </div>
                <div className="progress-bar">
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
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-slate-600">{m.problemsCount} problems</span>
                  <span style={{ color: m.score >= 75 ? "#10B981" : m.score >= 50 ? "#F59E0B" : "#EF4444" }}>
                    Score: {m.score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Action Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Zap size={16} className="text-violet-400" /> Top Action Items
          </h2>
          <button
            onClick={() => router.push("/manager/actions")}
            className="text-xs flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="space-y-2">
          {ACTION_ITEMS.filter((a) => a.status !== "done")
            .slice(0, 3)
            .map((a) => {
              const pColors = { high: "#EF4444", medium: "#F59E0B", low: "#10B981" };
              return (
                <div key={a.id} className="card-purple p-4 flex items-center gap-4">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: pColors[a.priority], boxShadow: `0 0 6px ${pColors[a.priority]}80` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{a.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">→ {a.assignee} · Due {new Date(a.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  </div>
                  <span
                    className="badge capitalize shrink-0"
                    style={
                      a.status === "in_progress"
                        ? { background: "rgba(139,92,246,0.15)", color: "#A78BFA", border: "1px solid rgba(139,92,246,0.3)" }
                        : { background: "rgba(148,163,184,0.08)", color: "#64748B", border: "1px solid rgba(148,163,184,0.12)" }
                    }
                  >
                    {a.status.replace("_", " ")}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
