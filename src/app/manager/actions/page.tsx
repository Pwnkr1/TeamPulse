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
} from "lucide-react";
import { ACTION_ITEMS, CATEGORY_LABELS, type ActionItem } from "@/lib/mockData";

const STATUS_CONFIG = {
  todo: { label: "To Do", color: "#94A3B8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)", icon: Circle },
  in_progress: { label: "In Progress", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)", icon: Clock },
  done: { label: "Done", color: "#10B981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", icon: CheckCircle2 },
};

const PRIORITY_CONFIG = {
  high: { color: "#EF4444", label: "High" },
  medium: { color: "#F59E0B", label: "Medium" },
  low: { color: "#10B981", label: "Low" },
};

function ActionCard({ item, onStatusChange }: { item: ActionItem; onStatusChange: (id: string, status: ActionItem["status"]) => void }) {
  const [open, setOpen] = useState(false);
  const st = STATUS_CONFIG[item.status];
  const pr = PRIORITY_CONFIG[item.priority];
  const Icon = st.icon;

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{ background: "rgba(8,6,28,0.85)", border: `1px solid ${item.status === "done" ? "rgba(16,185,129,0.15)" : "rgba(139,92,246,0.15)"}` }}
    >
      <div className="p-4 flex items-start gap-3">
        {/* Priority indicator */}
        <div
          className="w-1.5 rounded-full shrink-0 mt-1"
          style={{ height: 40, background: pr.color, boxShadow: `0 0 8px ${pr.color}60` }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="badge"
                style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
              >
                <Icon size={9} className="inline mr-1" />
                {st.label}
              </span>
              <span className="badge badge-purple">{CATEGORY_LABELS[item.category]}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ color: pr.color, background: `${pr.color}12` }}>
                {pr.label} Priority
              </span>
            </div>
          </div>

          <p className="text-sm font-semibold text-white mb-1">{item.title}</p>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <User size={11} /> {item.assignee}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              Due {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span className="text-slate-700">Source: {item.createdFrom}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {item.status !== "done" && (
            <button
              onClick={() => onStatusChange(item.id, item.status === "todo" ? "in_progress" : "done")}
              className="text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
              style={{
                background: item.status === "todo" ? "rgba(139,92,246,0.12)" : "rgba(16,185,129,0.12)",
                color: item.status === "todo" ? "#A78BFA" : "#34D399",
                border: `1px solid ${item.status === "todo" ? "rgba(139,92,246,0.25)" : "rgba(16,185,129,0.25)"}`,
              }}
            >
              {item.status === "todo" ? "Start" : "Complete"}
            </button>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/05 transition-all"
          >
            <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          <p className="text-xs text-slate-400 leading-relaxed pt-3">{item.description}</p>
        </div>
      )}
    </div>
  );
}

export default function RetroActions() {
  const [items, setItems] = useState(ACTION_ITEMS);
  const [filter, setFilter] = useState<"all" | ActionItem["status"]>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function handleStatusChange(id: string, status: ActionItem["status"]) {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  const filtered = filter === "all" ? items : items.filter((a) => a.status === filter);
  const todo = items.filter((a) => a.status === "todo").length;
  const inProgress = items.filter((a) => a.status === "in_progress").length;
  const done = items.filter((a) => a.status === "done").length;

  if (!mounted) return null;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap size={22} className="text-violet-400" />
          Retrospective Actions
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          AI-generated action items from survey responses and problem patterns. Track them to sprint completion.
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "To Do", count: todo, color: "#94A3B8", bg: "rgba(148,163,184,0.08)" },
          { label: "In Progress", count: inProgress, color: "#8B5CF6", bg: "rgba(139,92,246,0.08)" },
          { label: "Done", count: done, color: "#10B981", bg: "rgba(16,185,129,0.08)" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4 text-center cursor-pointer transition-all hover:scale-105"
            style={{ background: s.bg, border: `1px solid ${s.color}20` }}
            onClick={() => setFilter(s.label.toLowerCase().replace(" ", "_") as ActionItem["status"])}
          >
            <p className="text-2xl font-black mb-0.5" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5">
        <Filter size={14} className="text-slate-500" />
        {(["all", "todo", "in_progress", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all font-medium capitalize"
            style={
              filter === f
                ? { background: "rgba(139,92,246,0.15)", color: "#A78BFA", border: "1px solid rgba(139,92,246,0.3)" }
                : { background: "rgba(255,255,255,0.03)", color: "rgba(148,163,184,0.6)", border: "1px solid rgba(255,255,255,0.06)" }
            }
          >
            {f.replace("_", " ")}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-600">{filtered.length} items</span>
      </div>

      {/* Action items */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div
            className="rounded-xl p-10 text-center"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.06)" }}
          >
            <CheckCircle2 size={32} className="text-green-400 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No items in this category.</p>
          </div>
        )}
        {filtered.map((item) => (
          <ActionCard key={item.id} item={item} onStatusChange={handleStatusChange} />
        ))}
      </div>

      {/* Legend */}
      <div
        className="mt-8 rounded-xl p-4"
        style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.12)" }}
      >
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Priority Legend</p>
        <div className="flex gap-6">
          {(["high", "medium", "low"] as const).map((p) => (
            <div key={p} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ background: PRIORITY_CONFIG[p].color }} />
              <span className="text-slate-400 capitalize">{p} — {p === "high" ? "Address this sprint" : p === "medium" ? "Address this month" : "Backlog ok"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
