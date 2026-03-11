"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout, type User, getToken } from "@/lib/auth";
import {
  LayoutDashboard,
  Brain,
  ClipboardList,
  LineChart,
  Zap,
  LogOut,
  ChevronRight,
  Users,
  Inbox,
  UserPlus,
} from "lucide-react";

const DEV_NAV = [
  { label: "Dashboard", href: "/developer", icon: LayoutDashboard },
  { label: "Submit Problem", href: "/developer/submit", icon: Brain },
  { label: "My Surveys", href: "/developer/surveys", icon: ClipboardList },
  { label: "Inbox", href: "/developer/inbox", icon: Inbox, badgeKey: "inbox" as const },
];

const MGR_NAV = [
  { label: "Overview", href: "/manager", icon: LayoutDashboard },
  { label: "Team Insights", href: "/manager/insights", icon: LineChart },
  { label: "Retro Actions", href: "/manager/actions", icon: Zap },
  { label: "Team Members", href: "/manager/team", icon: Users },
  { label: "Requests", href: "/manager/requests", icon: UserPlus, badgeKey: "requests" as const },
];

type BadgeKey = "inbox" | "requests";

async function fetchBadge(key: BadgeKey, token: string | null): Promise<number> {
  if (!token) return 0;
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const headers = { Authorization: `Bearer ${token}` };
  try {
    if (key === "inbox") {
      const res = await fetch(`${base}/api/inbox`, { headers });
      if (!res.ok) return 0;
      const data = await res.json();
      return data.unreadCount ?? 0;
    }
    if (key === "requests") {
      const res = await fetch(`${base}/api/manager/requests`, { headers });
      if (!res.ok) return 0;
      const data: { requests: { status: string }[] } = await res.json();
      return data.requests.filter((r) => r.status === "pending").length;
    }
  } catch { /* ignore */ }
  return 0;
}

export default function Sidebar({ user }: { user: User }) {
  const router = useRouter();
  const pathname = usePathname();
  const isDev = user.role === "developer";
  const nav = isDev ? DEV_NAV : MGR_NAV;
  const accent = isDev ? "#06B6D4" : "#8B5CF6";
  const accentGlow = isDev ? "rgba(6,182,212,0.3)" : "rgba(139,92,246,0.3)";
  const badgeColor = isDev ? "#06B6D4" : "#8B5CF6";

  const [badges, setBadges] = useState<Partial<Record<BadgeKey, number>>>({});

  useEffect(() => {
    const token = getToken();
    const keys: BadgeKey[] = nav
      .filter((n) => "badgeKey" in n)
      .map((n) => (n as { badgeKey: BadgeKey }).badgeKey);

    Promise.all(keys.map(async (k) => [k, await fetchBadge(k, token)] as [BadgeKey, number]))
      .then((results) => {
        const map: Partial<Record<BadgeKey, number>> = {};
        results.forEach(([k, v]) => { map[k] = v; });
        setBadges(map);
      })
      .catch(() => {});

    const interval = setInterval(() => {
      Promise.all(keys.map(async (k) => [k, await fetchBadge(k, token)] as [BadgeKey, number]))
        .then((results) => {
          const map: Partial<Record<BadgeKey, number>> = {};
          results.forEach(([k, v]) => { map[k] = v; });
          setBadges(map);
        })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDev]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-60 flex flex-col z-40"
      style={{
        background: "rgba(4,8,20,0.96)",
        borderRight: `1px solid ${isDev ? "rgba(6,182,212,0.12)" : "rgba(139,92,246,0.12)"}`,
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: isDev ? "rgba(6,182,212,0.08)" : "rgba(139,92,246,0.08)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${isDev ? "#22D3EE" : "#A78BFA"})`,
              boxShadow: `0 0 14px ${accentGlow}`,
            }}
          >
            TP
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-none">TeamPulse</p>
            <p className="text-xs mt-0.5" style={{ color: accent }}>
              {isDev ? "Developer" : "Manager"} Portal
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const { label, href, icon: Icon } = item;
          const badgeKey = "badgeKey" in item ? item.badgeKey : undefined;
          const badgeCount = badgeKey ? (badges[badgeKey] ?? 0) : 0;
          const isActive = pathname === href;
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={`sidebar-item w-full text-left ${isDev ? (isActive ? "active" : "") : `sidebar-item-mgr ${isActive ? "active" : ""}`}`}
              style={isActive ? { borderLeftColor: accent } : {}}
            >
              <Icon size={16} style={{ color: isActive ? accent : "inherit", flexShrink: 0 }} />
              <span className="flex-1">{label}</span>
              {badgeCount > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-bold leading-none"
                  style={{ background: `${badgeColor}20`, color: badgeColor, border: `1px solid ${badgeColor}40` }}
                >
                  {badgeCount}
                </span>
              )}
              {isActive && badgeCount === 0 && <ChevronRight size={13} style={{ color: accent }} />}
            </button>
          );
        })}
      </nav>

      {/* User block */}
      <div className="px-3 py-4 border-t" style={{ borderColor: isDev ? "rgba(6,182,212,0.08)" : "rgba(139,92,246,0.08)" }}>
        <div className="flex items-center gap-3 px-2 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${accent}40, ${accent}20)`, border: `1px solid ${accent}50`, color: accent }}
          >
            {user.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
