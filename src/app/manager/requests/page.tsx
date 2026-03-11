"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Users,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface RegistrationRequest {
  id: string;
  name: string;
  email: string;
  team?: string;
  status: "pending" | "approved" | "rejected";
  reviewNote?: string;
  createdAt: string;
}

type Filter = "all" | "pending" | "approved" | "rejected";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", Icon: Clock },
  approved: { label: "Approved", color: "#10B981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", Icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "#EF4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", Icon: XCircle },
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ requests: RegistrationRequest[] }>("/api/manager/requests");
      setRequests(data.requests);
    } catch {
      showToast("Failed to load requests.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleApprove(id: string) {
    setActionLoading(id + "_approve");
    try {
      await api.post(`/api/manager/requests/${id}/approve`, {});
      showToast("Account approved — developer can now log in.", "success");
      fetchRequests();
    } catch {
      showToast("Approval failed. Try again.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: string) {
    setActionLoading(id + "_reject");
    try {
      await api.post(`/api/manager/requests/${id}/reject`, { note: rejectNote[id] ?? "" });
      showToast("Request rejected.", "success");
      setRejectNote((prev) => { const n = { ...prev }; delete n[id]; return n; });
      setExpanded(null);
      fetchRequests();
    } catch {
      showToast("Rejection failed. Try again.", "error");
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = requests.filter((r) => filter === "all" || r.status === filter);
  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-xl"
          style={
            toast.type === "success"
              ? { background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34D399" }
              : { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#F87171" }
          }
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Registration Requests</h1>
          <p className="text-slate-400 text-sm mt-0.5">Review and approve developer account requests</p>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {(["all", "pending", "approved", "rejected"] as Filter[]).map((f) => {
          const isActive = filter === f;
          const cfg = f === "all" ? null : STATUS_CONFIG[f];
          const color = cfg?.color ?? "#8B5CF6";
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-xl p-3 text-left transition-all"
              style={
                isActive
                  ? { background: `${color}15`, border: `1px solid ${color}40` }
                  : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
              }
            >
              <p className="text-2xl font-bold" style={{ color: isActive ? color : "white" }}>{counts[f]}</p>
              <p className="text-xs capitalize mt-0.5" style={{ color: isActive ? color : "rgba(148,163,184,0.7)" }}>{f}</p>
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl py-16 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <UserPlus size={36} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 font-medium">No {filter === "all" ? "" : filter} requests</p>
          <p className="text-slate-600 text-sm mt-1">New registration requests will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const cfg = STATUS_CONFIG[req.status];
            const StatusIcon = cfg.Icon;
            const isExpanded = expanded === req.id;
            const isActioning = actionLoading?.startsWith(req.id);

            return (
              <div
                key={req.id}
                className="rounded-xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#A78BFA" }}
                    >
                      {req.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-white">{req.name}</p>
                        <span
                          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                        >
                          <StatusIcon size={11} />
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1"><Mail size={11} />{req.email}</span>
                        {req.team && <span className="flex items-center gap-1"><Users size={11} />{req.team}</span>}
                        <span>{new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      {req.reviewNote && (
                        <p className="text-xs text-slate-500 mt-1 italic">Note: {req.reviewNote}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {req.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={!!isActioning}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                            style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#34D399" }}
                          >
                            {actionLoading === req.id + "_approve" ? (
                              <div className="w-3 h-3 rounded-full border border-green-400 border-t-transparent animate-spin" />
                            ) : (
                              <CheckCircle2 size={13} />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => setExpanded(isExpanded ? null : req.id)}
                            disabled={!!isActioning}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#F87171" }}
                          >
                            <XCircle size={13} />
                            Reject
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reject note panel */}
                {isExpanded && req.status === "pending" && (
                  <div className="px-4 pb-4 pt-0" style={{ borderTop: "1px solid rgba(239,68,68,0.12)" }}>
                    <div className="pt-3">
                      <label className="block text-xs text-slate-400 mb-1.5">Rejection note <span className="text-slate-600">(optional — shown to applicant)</span></label>
                      <textarea
                        value={rejectNote[req.id] ?? ""}
                        onChange={(e) => setRejectNote((prev) => ({ ...prev, [req.id]: e.target.value }))}
                        placeholder="e.g. Team quota reached, please apply again next quarter."
                        rows={2}
                        className="w-full bg-transparent rounded-lg px-3 py-2 text-sm text-white resize-none placeholder:text-slate-600 focus:outline-none"
                        style={{ border: "1px solid rgba(239,68,68,0.25)" }}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setExpanded(null)}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          disabled={!!isActioning}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                          style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", color: "#F87171" }}
                        >
                          {actionLoading === req.id + "_reject" ? (
                            <div className="w-3 h-3 rounded-full border border-red-400 border-t-transparent animate-spin" />
                          ) : (
                            <XCircle size={13} />
                          )}
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
