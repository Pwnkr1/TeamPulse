"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, getUser } from "@/lib/auth";
import AnimatedBg from "@/components/AnimatedBg";
import { Eye, EyeOff, Cpu, Users, AlertCircle } from "lucide-react";

type Role = "developer" | "manager";

const DEMO_CREDS = {
  developer: { email: "alex.chen@team.com", password: "Dev@123" },
  manager: { email: "sarah.mgr@team.com", password: "Mgr@123" },
};

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("developer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
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
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const user = login(email, password);
    setLoading(false);
    if (!user) return setError("Invalid credentials. Use the demo button to autofill.");
    if (user.role !== role) return setError(`This account is a ${user.role} account, not ${role}.`);
    router.push(user.role === "manager" ? "/manager" : "/developer");
  }

  if (!mounted) return null;

  const isDev = role === "developer";
  const accent = isDev ? "#06B6D4" : "#8B5CF6";
  const accentLight = isDev ? "#22D3EE" : "#A78BFA";

  return (
    <div className="min-h-screen flex" style={{ background: "#03060F" }}>
      <AnimatedBg variant={role === "developer" ? "cyan" : "purple"} />

      {/* Left — Branding panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[42%] relative overflow-hidden px-12 py-12"
        style={{
          borderRight: `1px solid ${accent}18`,
        }}
      >
        {/* Glow circle */}
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)` }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accentLight})`,
                boxShadow: `0 0 20px ${accent}50`,
              }}
            >
              TP
            </div>
            <span className="text-xl font-bold text-white">TeamPulse</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            AI-driven retrospective coaching that transforms team problems into personalised growth plans.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-6">
          {[
            {
              icon: "🧠",
              title: "Problem Intelligence",
              desc: "AI classifies your blockers and matches them to solutions from 500+ engineering teams.",
            },
            {
              icon: "📊",
              title: "Mindset Surveys",
              desc: "Targeted questions that shift perspective from problem-state to growth-state.",
            },
            {
              icon: "⚡",
              title: "Manager Insights",
              desc: "Real-time view of team sentiment, risk areas, and personalised action items.",
            },
          ].map((f) => (
            <div key={f.title} className="flex gap-4">
              <span className="text-2xl mt-0.5">{f.icon}</span>
              <div>
                <p className="text-white font-semibold text-sm">{f.title}</p>
                <p className="text-slate-500 text-xs leading-relaxed mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom quote */}
        <div
          className="relative z-10 rounded-xl p-4"
          style={{ background: `${accent}0D`, border: `1px solid ${accent}1A` }}
        >
          <p className="text-slate-300 text-sm italic leading-relaxed">
            &ldquo;The retrospective is not a blame session — it is an engineering system for continuous improvement.&rdquo;
          </p>
          <p className="text-xs mt-2" style={{ color: accent }}>
            — Inspired by Google SRE Handbook
          </p>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative z-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to your TeamPulse portal</p>
          </div>

          {/* Role selector */}
          <div
            className="flex rounded-xl p-1 mb-6 gap-1"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {(["developer", "manager"] as Role[]).map((r) => {
              const active = role === r;
              const col = r === "developer" ? "#06B6D4" : "#8B5CF6";
              return (
                <button
                  key={r}
                  onClick={() => { setRole(r); setError(""); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                  style={
                    active
                      ? { background: `${col}18`, color: col, border: `1px solid ${col}40`, boxShadow: `0 0 14px ${col}25` }
                      : { color: "rgba(148,163,184,0.7)", border: "1px solid transparent" }
                  }
                >
                  {r === "developer" ? <Cpu size={15} /> : <Users size={15} />}
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`e.g. ${DEMO_CREDS[role].email}`}
                className={`input-${isDev ? "cyber" : "purple"} px-4 py-2.5 text-sm`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`input-${isDev ? "cyber" : "purple"} px-4 py-2.5 pr-11 text-sm`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-xs text-red-300" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`btn-${isDev ? "cyan" : "purple"} w-full py-2.5 text-sm flex items-center justify-center gap-2`}
              style={{ position: "relative" }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Authenticating…
                </>
              ) : (
                `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div
            className="mt-5 rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Demo Credentials</p>
              <button
                type="button"
                onClick={fillDemo}
                className="text-xs px-3 py-1 rounded-md font-medium transition-all"
                style={{ color: accent, background: `${accent}12`, border: `1px solid ${accent}25` }}
              >
                Auto Fill
              </button>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Email</span>
                <span className="text-slate-300 font-mono">{DEMO_CREDS[role].email}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Password</span>
                <span className="text-slate-300 font-mono">{DEMO_CREDS[role].password}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
