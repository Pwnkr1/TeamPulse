"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle,
  Filter,
  ChevronDown,
  User,
  Calendar,
  Loader2,
} from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/mockData";
import { api } from "@/lib/api";

const STATUS_CONFIG = {
  todo: { label: "To Do", color: "#9896B5", bg: "rgba(152,150,181,0.1)", border: "rgba(152,150,181,0.2)", icon: Circle },
  in_progress: { label: "In Progress", color: "#E9A020", bg: "rgba(233,160,32,0.1)", border: "rgba(233,160,32,0.25)", icon: Clock },
  done: { label: "Done", color: "#059669", bg: "rgba(5,150,105,0.1)", border: "rgba(5,150,105,0.25)", icon: CheckCircle2 },
  completed: { label: "Done", color: "#059669", bg: "rgba(5,150,105,0.1)", border: "rgba(5,150,105,0.25)", icon: CheckCircle2 },
};

const PRIORITY_CONFIG = {
  high: { color: "#DC2626", label: "High" },
  medium: { color: "#B45309", label: "Medium" },
  low: { color: "#059669", label: "Low" },
};

type StatusKey = "todo" | "in_progress" | "done";

interface ApiAction {
  id: string;
  title: string;
  description: string;
  assignee: { name: string; avatar: string };
  priority: string;
  status: string;
  dueDate: string;
  category: string;
  sourceRef?: string;
}

function ActionCard({ item, onStatusChange }: { item: ApiAction; onStatusChange: (id: string, status: StatusKey) => void }) {
  const [open, setOpen] = useState(false);
  const statusKey = (item.status === "completed" ? "done" : item.status) as keyof typeof STATUS_CONFIG;
  const st = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.todo;
  const pr = PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium;
  const Icon = st.icon;

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{ background: "#FFFFFF", border: `1px solid ${statusKey === "done" ? "rgba(5,150,105,0.2)" : "rgba(233,160,32,0.2)"}` }}
    >
      <div className="p-4 flex items-start gap-3">
        <div
          className="w-1.5 rounded-full shrink-0 mt-1"
          style={{ height: 40, background: pr.color, boxShadow: `0 0 8px ${pr.color}60` }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge" style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                <Icon size={9} className="inline mr-1" />
                {st.label}
              </span>
              <span className="badge badge-purple">{CATEGORY_LABELS[item.category] ?? item.category}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ color: pr.color, background: `${pr.color}12` }}>
                {pr.label} Priority
              </span>
            </div>
          </div>

          <p className="text-sm font-semibold mb-1" style={{ color: "#1E1B3A" }}>{item.title}</p>

          <div className="flex items-center gap-4 text-xs" style={{ color: "#9896B5" }}>
            <span className="flex items-center gap-1">
              <User size={11} /> {item.assignee.name}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              Due {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            {item.sourceRef && <span style={{ color: "#9896B5" }}>Source: {item.sourceRef}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {statusKey !== "done" && (
            <button
              onClick={() => onStatusChange(item.id, statusKey === "todo" ? "in_progress" : "done")}
              className="text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
              style={{
                background: statusKey === "todo" ? "rgba(233,160,32,0.10)" : "rgba(5,150,105,0.10)",
                color: statusKey === "todo" ? "#E9A020" : "#059669",
                border: `1px solid ${statusKey === "todo" ? "rgba(233,160,32,0.25)" : "rgba(5,150,105,0.25)"}`,
              }}
            >
              {statusKey === "todo" ? "Start" : "Complete"}
            </button>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: "#9896B5" }}
          >
            <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(124,107,196,0.12)" }}>
          <p className="text-xs leading-relaxed pt-3" style={{ color: "#5C5A7A" }}>{item.description}</p>
        </div>
      )}
    </div>
  );
}

export default function RetroActions() {
  const [items, setItems] = useState<ApiAction[]>([]);
  const [filter, setFilter] = useState<"all" | StatusKey>("all");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    api.get<{ actions: ApiAction[] }>("/api/actions")
      .then((d) => setItems(d.actions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(id: string, status: StatusKey) {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      await api.patch(`/api/actions/${id}`, { status });
    } catch {
      api.get<{ actions: ApiAction[] }>("/api/actions").then((d) => setItems(d.actions)).catch(() => {});
    }
  }

  const normalizeStatus = (s: string): StatusKey =>
    s === "completed" ? "done" : (s as StatusKey);

  const filtered = filter === "all"
    ? items
    : items.filter((a) => normalizeStatus(a.status) === filter);

  const todo = items.filter((a) => normalizeStatus(a.status) === "todo").length;
  const inProgress = items.filter((a) => normalizeStatus(a.status) === "in_progress").length;
  const done = items.filter((a) => normalizeStatus(a.status) === "done").length;

  if (!mounted) return null;

  return (
    <div className="animate-fade-in">
      <div className="mb-7">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "#1E1B3A" }}>
          <Zap size={22} style={{ color: "#E9A020" }} />
          Retrospective Actions
        </h1>
        <p className="text-sm mt-1" style={{ color: "#5C5A7A" }}>
          AI-generated action items from survey responses and problem patterns. Track them to sprint completion.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "To Do", count: todo, color: "#9896B5", bg: "rgba(152,150,181,0.08)", key: "todo" as StatusKey },
          { label: "In Progress", count: inProgress, color: "#E9A020", bg: "rgba(233,160,32,0.08)", key: "in_progress" as StatusKey },
          { label: "Done", count: done, color: "#059669", bg: "rgba(5,150,105,0.08)", key: "done" as StatusKey },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4 text-center cursor-pointer transition-all hover:scale-105"
            style={{ background: s.bg, border: `1px solid ${s.color}20` }}
            onClick={() => setFilter(s.key)}
          >
            <p className="text-2xl font-black mb-0.5" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs" style={{ color: "#9896B5" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-5">
        <Filter size={14} style={{ color: "#9896B5" }} />
        {(["all", "todo", "in_progress", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all font-medium capitalize"
            style={
              filter === f
                ? { background: "rgba(233,160,32,0.12)", color: "#E9A020", border: "1px solid rgba(233,160,32,0.3)" }
                : { background: "rgba(124,107,196,0.05)", color: "#9896B5", border: "1px solid rgba(124,107,196,0.12)" }
            }
          >
            {f.replace("_", " ")}
          </button>
        ))}
        <span className="ml-auto text-xs" style={{ color: "#9896B5" }}>{filtered.length} items</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin" style={{ color: "#E9A020" }} />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div
              className="rounded-xl p-10 text-center"
              style={{ background: "rgba(124,107,196,0.05)", border: "1px dashed rgba(124,107,196,0.25)" }}
            >
              <CheckCircle2 size={32} style={{ color: "#059669" }} className="mx-auto mb-3" />
              <p className="text-sm" style={{ color: "#9896B5" }}>No items in this category.</p>
            </div>
          )}
          {filtered.map((item) => (
            <ActionCard key={item.id} item={item} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      <div
        className="mt-8 rounded-xl p-4"
        style={{ background: "rgba(233,160,32,0.06)", border: "1px solid rgba(233,160,32,0.15)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#9896B5" }}>Priority Legend</p>
        <div className="flex gap-6">
          {(["high", "medium", "low"] as const).map((p) => (
            <div key={p} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ background: PRIORITY_CONFIG[p].color }} />
              <span className="capitalize" style={{ color: "#5C5A7A" }}>{p} — {p === "high" ? "Address this sprint" : p === "medium" ? "Address this month" : "Backlog ok"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
