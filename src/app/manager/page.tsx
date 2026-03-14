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
  Cell,
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
import { SENTIMENT_CONFIG, CATEGORY_LABELS } from "@/lib/mockData";
import { api } from "@/lib/api";

interface Stats { totalProblems: number; completionRate: number; avgScore: number; blockedCount: number; }
interface TeamMember { id: string; name: string; avatar: string; role: string; team: string; problemsCount: number; surveysDone: number; surveysTotal: number; sentiment: string; categories: string[]; score: number; }
interface ChartItem { name: string; value: number; fill: string; }
interface RadarItem { subject: string; A: number; fullMark: number; }
interface ActionItem { id: string; title: string; assignee: { name: string; avatar: string }; priority: string; status: string; dueDate: string; }

export default function ManagerDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<Stats>({ totalProblems: 0, completionRate: 0, avgScore: 0, blockedCount: 0 });
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [categoryData, setCategoryData] = useState<ChartItem[]>([]);
  const [radarData, setRadarData] = useState<RadarItem[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);

  useEffect(() => {
    setMounted(true);
    api.get<Stats>("/api/manager/stats").then(setStats).catch(() => {});
    api.get<{ team: TeamMember[] }>("/api/manager/team").then((d) => setTeam(d.team)).catch(() => {});
    api.get<{ data: ChartItem[] }>("/api/manager/chart/categories").then((d) => setCategoryData(d.data)).catch(() => {});
    api.get<{ data: RadarItem[] }>("/api/manager/chart/radar").then((d) => setRadarData(d.data)).catch(() => {});
    api.get<{ actions: ActionItem[] }>("/api/actions").then((d) => setActions(d.actions)).catch(() => {});
  }, []);

  if (!mounted) return null;

  const pColors: Record<string, string> = { high: "#DC2626", medium: "#B45309", low: "#059669" };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="pulse-dot" style={{ background: "#E9A020" }} />
          <span className="text-xs uppercase tracking-widest" style={{ color: "#9896B5" }}>Manager Portal · Live</span>
        </div>
        <h1 className="text-3xl font-bold" style={{ color: "#1E1B3A" }}>
          Team <span className="text-gradient-purple">Overview</span>
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#5C5A7A" }}>Sprint Week 10 · {team.length} engineers</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Problems", value: stats.totalProblems, icon: Brain, color: "#7C6BC4", sub: "This sprint" },
          { label: "Survey Completion", value: `${stats.completionRate}%`, icon: ClipboardList, color: "#E9A020", sub: "Overall" },
          { label: "Avg Mindset Score", value: stats.avgScore, icon: TrendingUp, color: "#059669", sub: "Out of 100" },
          { label: "Blocked Engineers", value: stats.blockedCount, icon: AlertTriangle, color: "#DC2626", sub: "Needs attention" },
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
            <p className="text-sm font-medium" style={{ color: "#1E1B3A" }}>{s.label}</p>
            <p className="text-xs mt-0.5" style={{ color: "#9896B5" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-5 mb-8">
        <div className="card-purple p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={15} style={{ color: "#E9A020" }} />
            <p className="text-sm font-semibold" style={{ color: "#1E1B3A" }}>Problems by Category</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 36 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,107,196,0.12)" />
              <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" tick={{ fill: "#9896B5", fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#9896B5", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "#FFFFFF", border: "1px solid rgba(233,160,32,0.3)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#1E1B3A" }}
                itemStyle={{ color: "#1E1B3A" }}
                cursor={{ fill: "rgba(233,160,32,0.06)" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {categoryData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-purple p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} style={{ color: "#E9A020" }} />
            <p className="text-sm font-semibold" style={{ color: "#1E1B3A" }}>Team Mindset Radar</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(124,107,196,0.12)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#9896B5", fontSize: 10 }} />
              <Radar name="Team" dataKey="A" stroke="#7C6BC4" fill="#7C6BC4" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip
                contentStyle={{ background: "#FFFFFF", border: "1px solid rgba(233,160,32,0.3)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#1E1B3A" }}
                itemStyle={{ color: "#1E1B3A" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2" style={{ color: "#1E1B3A" }}>
            <Users size={16} style={{ color: "#E9A020" }} /> Team Members
          </h2>
          <button
            onClick={() => router.push("/manager/insights")}
            className="text-xs flex items-center gap-1 transition-colors"
            style={{ color: "#E9A020" }}
          >
            View full insights <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {team.map((m) => {
            const sentiment = SENTIMENT_CONFIG[m.sentiment as keyof typeof SENTIMENT_CONFIG] ?? SENTIMENT_CONFIG.neutral;
            const pct = m.surveysTotal > 0 ? Math.round((m.surveysDone / m.surveysTotal) * 100) : 0;
            return (
              <div key={m.id} className="card-purple p-4 cursor-pointer" onClick={() => router.push("/manager/insights")}>
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: "rgba(233,160,32,0.15)", border: "1px solid rgba(233,160,32,0.3)", color: "#E9A020" }}
                  >
                    {m.avatar ?? m.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#1E1B3A" }}>{m.name}</p>
                    <p className="text-xs" style={{ color: "#9896B5" }}>{m.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="badge text-xs"
                    style={{ background: sentiment.bg, color: sentiment.color, border: `1px solid ${sentiment.color}30` }}
                  >
                    {sentiment.label}
                  </span>
                  <span className="text-xs" style={{ color: "#9896B5" }}>{m.team}</span>
                </div>
                <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: "#9896B5" }}>
                  <span>Surveys</span>
                  <span style={{ color: pct === 100 ? "#059669" : "#B45309" }}>
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
                  <span style={{ color: "#9896B5" }}>{m.problemsCount} problems</span>
                  <span style={{ color: m.score >= 75 ? "#059669" : m.score >= 50 ? "#B45309" : "#DC2626" }}>
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
          <h2 className="font-semibold flex items-center gap-2" style={{ color: "#1E1B3A" }}>
            <Zap size={16} style={{ color: "#E9A020" }} /> Top Action Items
          </h2>
          <button
            onClick={() => router.push("/manager/actions")}
            className="text-xs flex items-center gap-1 transition-colors"
            style={{ color: "#E9A020" }}
          >
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="space-y-2">
          {actions.filter((a) => a.status !== "done").slice(0, 3).map((a) => (
            <div key={a.id} className="card-purple p-4 flex items-center gap-4">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: pColors[a.priority] ?? "#9896B5", boxShadow: `0 0 6px ${pColors[a.priority] ?? "#9896B5"}80` }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "#1E1B3A" }}>{a.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "#9896B5" }}>→ {a.assignee.name} · Due {new Date(a.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
              </div>
              <span
                className="badge capitalize shrink-0"
                style={
                  a.status === "in_progress"
                    ? { background: "rgba(233,160,32,0.15)", color: "#E9A020", border: "1px solid rgba(233,160,32,0.3)" }
                    : { background: "rgba(92,90,122,0.08)", color: "#5C5A7A", border: "1px solid rgba(92,90,122,0.15)" }
                }
              >
                {a.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
