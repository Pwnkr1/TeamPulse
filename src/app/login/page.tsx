"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, getUser } from "@/lib/auth";
import { api } from "@/lib/api";
import AnimatedBg from "@/components/AnimatedBg";
import { Eye, EyeOff, Cpu, Users, AlertCircle, CheckCircle2, UserPlus, LogIn } from "lucide-react";

type Role = "developer" | "manager";
type Mode = "login" | "register";

const DEMO_CREDS = {
  developer: { email: "alex.chen@team.com", password: "Dev@123" },
  manager: { email: "sarah.mgr@team.com", password: "Mgr@123" },
};

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("developer");
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = getUser();
    if (user) router.replace(user.role === "manager" ? "/manager" : "/developer");
  }, [router]);

  function fillDemo() {
    const c = DEMO_CREDS[role];
    setEmail(c.email);
    setPassword(c.password);
    setError("");
    setSuccess("");
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError("");
    setSuccess("");
    setEmail("");
    setPassword("");
    setName("");
    setTeam("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const user = await login(email, password);
    setLoading(false);
    if (!user) {
      // Check for specific error from backend
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (data.error === "pending") {
          setError("⏳ Your account is pending manager approval. Please wait.");
        } else if (data.error === "rejected") {
          setError("❌ Your account request was denied by the manager. Contact them for details.");
        } else {
          setError("Invalid credentials. Use the demo button to autofill.");
        }
      } catch {
        setError("Invalid credentials.");
      }
      return;
    }
    if (user.role !== role) {
      setError(`This account is a ${user.role} account, not ${role}.`);
      return;
    }
    router.push(user.role === "manager" ? "/manager" : "/developer");
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name.trim()) { setError("Full name is required."); return; }
    setLoading(true);
    try {
      await api.post("/api/auth/register", { name: name.trim(), email, password, team: team.trim() || undefined });
      setSuccess("✅ Registration request submitted! Your manager will review it shortly.");
      setEmail(""); setPassword(""); setName(""); setTeam("");
    } catch (err: unknown) {
      setError((err as Error).message ?? "Registration failed.");
    }
    setLoading(false);
  }

  if (!mounted) return null;

  const isDev = role === "developer";
  const accent = isDev ? "#7C6BC4" : "#E9A020";
  const accentLight = isDev ? "#A99DD6" : "#FBBF24";

  return (
    <div className="min-h-screen flex" style={{ background: "transparent" }}>
      <AnimatedBg variant={role === "developer" ? "cyan" : "purple"} />

      {/* Left — Branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[42%] relative overflow-hidden px-12 py-12"
        style={{ borderRight: `1px solid ${accent}18` }}
      >
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)` }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black"
              style={{ color: "#FFFFFF", background: `linear-gradient(135deg, ${accent}, ${accentLight})`, boxShadow: `0 0 20px ${accent}50` }}
            >TP</div>
            <span className="text-xl font-bold" style={{ color: "#1E1B3A" }}>TeamPulse</span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: "#5C5A7A" }}>
            AI-driven retrospective coaching that transforms team problems into personalised growth plans.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          {[
            { icon: "🧠", title: "Problem Intelligence", desc: "AI classifies your blockers and matches them to solutions from 500+ engineering teams." },
            { icon: "📊", title: "Mindset Surveys", desc: "Targeted questions that shift perspective from problem-state to growth-state." },
            { icon: "⚡", title: "Manager Insights", desc: "Real-time view of team sentiment, risk areas, and personalised action items." },
          ].map((f) => (
            <div key={f.title} className="flex gap-4">
              <span className="text-2xl mt-0.5">{f.icon}</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: "#1E1B3A" }}>{f.title}</p>
                <p className="text-xs leading-relaxed mt-0.5" style={{ color: "#5C5A7A" }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 rounded-xl p-4" style={{ background: `${accent}0D`, border: `1px solid ${accent}1A` }}>
          <p className="text-sm italic leading-relaxed" style={{ color: "#5C5A7A" }}>
            &ldquo;The retrospective is not a blame session — it is an engineering system for continuous improvement.&rdquo;
          </p>
          <p className="text-xs mt-2" style={{ color: accent }}>— Inspired by Google SRE Handbook</p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative z-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1" style={{ color: "#1E1B3A" }}>
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-sm" style={{ color: "#5C5A7A" }}>
              {mode === "login" ? "Sign in to your TeamPulse portal" : "Request access to TeamPulse"}
            </p>
          </div>

          {/* Mode toggle */}
          <div
            className="flex rounded-xl p-1 mb-6 gap-1"
            style={{ background: "rgba(124,107,196,0.06)", border: "1px solid rgba(124,107,196,0.12)" }}
          >
            {([["login", "Sign In", LogIn], ["register", "Create Account", UserPlus]] as const).map(([m, label, Icon]) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={
                  mode === m
                    ? { background: `${accent}18`, color: accent, border: `1px solid ${accent}40`, boxShadow: `0 0 14px ${accent}25` }
                    : { color: "#9896B5", border: "1px solid transparent" }
                }
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* Role selector (login only) */}
          {mode === "login" && (
            <div
              className="flex rounded-xl p-1 mb-6 gap-1"
              style={{ background: "rgba(124,107,196,0.06)", border: "1px solid rgba(124,107,196,0.12)" }}
            >
              {(["developer", "manager"] as Role[]).map((r) => {
                const active = role === r;
                const col = r === "developer" ? "#7C6BC4" : "#E9A020";
                return (
                  <button
                    key={r}
                    onClick={() => { setRole(r); setError(""); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                    style={active
                      ? { background: `${col}18`, color: col, border: `1px solid ${col}40`, boxShadow: `0 0 14px ${col}25` }
                      : { color: "#9896B5", border: "1px solid transparent" }
                    }
                  >
                    {r === "developer" ? <Cpu size={15} /> : <Users size={15} />}
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#5C5A7A" }}>Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder={`e.g. ${DEMO_CREDS[role].email}`}
                  className={`input-${isDev ? "cyber" : "purple"} px-4 py-2.5 text-sm`} required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#5C5A7A" }}>Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`input-${isDev ? "cyber" : "purple"} px-4 py-2.5 pr-11 text-sm`} required />
                  <button type="button" onClick={() => setShowPw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "#9896B5" }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-xs" style={{ color: "#DC2626", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}>
                  <AlertCircle size={14} className="mt-0.5 shrink-0" style={{ color: "#DC2626" }} />{error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className={`btn-${isDev ? "cyan" : "purple"} w-full py-2.5 text-sm flex items-center justify-center gap-2`}
                style={{ position: "relative" }}>
                {loading ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Authenticating…</> : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#5C5A7A" }}>Full Name <span className="text-red-400">*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="input-cyber px-4 py-2.5 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#5C5A7A" }}>Email Address <span className="text-red-400">*</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@company.com"
                  className="input-cyber px-4 py-2.5 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#5C5A7A" }}>Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="input-cyber px-4 py-2.5 pr-11 text-sm" required minLength={6} />
                  <button type="button" onClick={() => setShowPw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "#9896B5" }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#5C5A7A" }}>Team <span style={{ color: "#9896B5" }}>(optional)</span></label>
                <input type="text" value={team} onChange={(e) => setTeam(e.target.value)}
                  placeholder="e.g. Platform, Backend, Infra"
                  className="input-cyber px-4 py-2.5 text-sm" />
              </div>

              <div className="rounded-lg px-3 py-2.5 text-xs" style={{ color: "#7C6BC4", background: "rgba(124,107,196,0.07)", border: "1px solid rgba(124,107,196,0.18)" }}>
                <span className="font-medium">ℹ️ Note:</span> Accounts require manager approval. You will receive an inbox notification once approved.
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-xs" style={{ color: "#DC2626", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}>
                  <AlertCircle size={14} className="mt-0.5 shrink-0" style={{ color: "#DC2626" }} />{error}
                </div>
              )}
              {success && (
                <div className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-xs" style={{ color: "#059669", background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)" }}>
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: "#059669" }} />{success}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="btn-cyan w-full py-2.5 text-sm flex items-center justify-center gap-2"
                style={{ position: "relative" }}>
                {loading ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Submitting…</> : <><UserPlus size={15} />Request Account</>}
              </button>
            </form>
          )}

          {/* Demo credentials (login only) */}
          {mode === "login" && (
            <div className="mt-5 rounded-xl p-4" style={{ background: "rgba(124,107,196,0.05)", border: "1px solid rgba(124,107,196,0.15)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9896B5" }}>Demo Credentials</p>
                <button type="button" onClick={fillDemo}
                  className="text-xs px-3 py-1 rounded-md font-medium transition-all"
                  style={{ color: accent, background: `${accent}12`, border: `1px solid ${accent}25` }}>
                  Auto Fill
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span style={{ color: "#9896B5" }}>Email</span>
                  <span className="font-mono" style={{ color: "#5C5A7A" }}>{DEMO_CREDS[role].email}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: "#9896B5" }}>Password</span>
                  <span className="font-mono" style={{ color: "#5C5A7A" }}>{DEMO_CREDS[role].password}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
