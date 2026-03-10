"use client";

import { useRouter, usePathname } from "next/navigation";
import { logout, type User } from "@/lib/auth";
import {
  LayoutDashboard,
  Brain,
  ClipboardList,
  LineChart,
  Zap,
  LogOut,
  ChevronRight,
  Users,
} from "lucide-react";

const DEV_NAV = [
  { label: "Dashboard", href: "/developer", icon: LayoutDashboard },
  { label: "Submit Problem", href: "/developer/submit", icon: Brain },
  { label: "My Surveys", href: "/developer/surveys", icon: ClipboardList },
];

const MGR_NAV = [
  { label: "Overview", href: "/manager", icon: LayoutDashboard },
  { label: "Team Insights", href: "/manager/insights", icon: LineChart },
  { label: "Retro Actions", href: "/manager/actions", icon: Zap },
  { label: "Team Members", href: "/manager/team", icon: Users },
];

export default function Sidebar({ user }: { user: User }) {
  const router = useRouter();
  const pathname = usePathname();
  const isDev = user.role === "developer";
  const nav = isDev ? DEV_NAV : MGR_NAV;
  const accent = isDev ? "#06B6D4" : "#8B5CF6";
  const accentGlow = isDev ? "rgba(6,182,212,0.3)" : "rgba(139,92,246,0.3)";

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
        {nav.map(({ label, href, icon: Icon }) => {
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
              {isActive && <ChevronRight size={13} style={{ color: accent }} />}
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
