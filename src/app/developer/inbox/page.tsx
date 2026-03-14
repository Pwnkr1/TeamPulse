"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Inbox,
  Mail,
  MailOpen,
  CheckCheck,
  ChevronLeft,
  Clock,
  RefreshCw,
} from "lucide-react";

interface InboxMessage {
  id: string;
  subject: string;
  body: string;
  fromName: string;
  fromEmail: string;
  isRead: boolean;
  type: "general" | "retro" | "system" | "approval";
  createdAt: string;
}

const TYPE_CONFIG = {
  retro: { label: "Retro", color: "#7C6BC4", bg: "rgba(124,107,196,0.1)", border: "rgba(124,107,196,0.25)" },
  approval: { label: "Approval", color: "#059669", bg: "rgba(5,150,105,0.1)", border: "rgba(5,150,105,0.25)" },
  system: { label: "System", color: "#E9A020", bg: "rgba(233,160,32,0.1)", border: "rgba(233,160,32,0.25)" },
  general: { label: "General", color: "#5C5A7A", bg: "rgba(92,90,122,0.08)", border: "rgba(92,90,122,0.2)" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function InboxPage() {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [selected, setSelected] = useState<InboxMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ messages: InboxMessage[]; unreadCount: number }>("/api/inbox");
      setMessages(data.messages);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  async function openMessage(msg: InboxMessage) {
    setSelected(msg);
    if (!msg.isRead) {
      try {
        await api.patch(`/api/inbox/${msg.id}/read`, {});
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, isRead: true } : m));
      } catch { /* ignore */ }
    }
  }

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await api.post("/api/inbox/mark-all-read", {});
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
    } catch { /* ignore */ }
    setMarkingAll(false);
  }

  const unreadCount = messages.filter((m) => !m.isRead).length;

  // --- Message detail view ---
  if (selected) {
    const cfg = TYPE_CONFIG[selected.type] ?? TYPE_CONFIG.general;
    return (
      <div className="space-y-4 max-w-3xl">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "#5C5A7A" }}
        >
          <ChevronLeft size={16} />
          Back to Inbox
        </button>

        <div className="rounded-xl p-6 space-y-4" style={{ background: "rgba(124,107,196,0.05)", border: "1px solid rgba(124,107,196,0.12)" }}>
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                >
                  {cfg.label}
                </span>
              </div>
              <h2 className="text-lg font-semibold" style={{ color: "#1E1B3A" }}>{selected.subject}</h2>
              <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: "#9896B5" }}>
                <span>From: <span style={{ color: "#5C5A7A" }}>{selected.fromName}</span> &lt;{selected.fromEmail}&gt;</span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {new Date(selected.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>

          <hr style={{ borderColor: "rgba(124,107,196,0.12)" }} />

          {/* Body */}
          <div
            className="text-sm leading-relaxed"
            style={{ color: "#5C5A7A" }}
            dangerouslySetInnerHTML={{ __html: selected.body }}
          />
        </div>
      </div>
    );
  }

  // --- Inbox list view ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold" style={{ color: "#1E1B3A" }}>Inbox</h1>
            {unreadCount > 0 && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: "rgba(124,107,196,0.15)", border: "1px solid rgba(124,107,196,0.35)", color: "#7C6BC4" }}
              >
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-sm mt-0.5" style={{ color: "#5C5A7A" }}>Your messages and weekly retro updates</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
              style={{ background: "rgba(124,107,196,0.08)", border: "1px solid rgba(124,107,196,0.2)", color: "#7C6BC4" }}
            >
              {markingAll ? <div className="w-3 h-3 rounded-full border border-[#7C6BC4] border-t-transparent animate-spin" /> : <CheckCheck size={13} />}
              Mark all read
            </button>
          )}
          <button
            onClick={fetchMessages}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ background: "rgba(124,107,196,0.05)", border: "1px solid rgba(124,107,196,0.12)", color: "#5C5A7A" }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-[#7C6BC4] border-t-transparent animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-xl py-16 text-center" style={{ background: "rgba(124,107,196,0.05)", border: "1px solid rgba(124,107,196,0.12)" }}>
          <Inbox size={36} className="mx-auto mb-3" style={{ color: "#9896B5" }} />
          <p className="font-medium" style={{ color: "#5C5A7A" }}>Your inbox is empty</p>
          <p className="text-sm mt-1" style={{ color: "#9896B5" }}>Weekly retro emails and system notifications will appear here</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {messages.map((msg) => {
            const cfg = TYPE_CONFIG[msg.type] ?? TYPE_CONFIG.general;
            return (
              <button
                key={msg.id}
                onClick={() => openMessage(msg)}
                className="w-full text-left rounded-xl px-4 py-3.5 flex items-start gap-3.5 transition-all hover:scale-[1.002]"
                style={
                  !msg.isRead
                    ? { background: "rgba(124,107,196,0.07)", border: "1px solid rgba(124,107,196,0.18)" }
                    : { background: "rgba(124,107,196,0.03)", border: "1px solid rgba(124,107,196,0.08)" }
                }
              >
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                >
                  {msg.isRead ? (
                    <MailOpen size={16} style={{ color: cfg.color }} />
                  ) : (
                    <Mail size={16} style={{ color: cfg.color }} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {!msg.isRead && (
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#7C6BC4" }} />
                      )}
                      <p className="text-sm truncate" style={{ color: msg.isRead ? "#5C5A7A" : "#1E1B3A", fontWeight: msg.isRead ? 400 : 500 }}>
                        {msg.subject}
                      </p>
                    </div>
                    <span className="text-xs flex-shrink-0 flex items-center gap-1" style={{ color: "#9896B5" }}>
                      <Clock size={10} />
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs truncate" style={{ color: "#9896B5" }}>{msg.fromName}</span>
                    <span
                      className="text-xs px-1.5 py-0 rounded font-medium flex-shrink-0"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
