"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";

export default function Root() {
  const router = useRouter();
  useEffect(() => {
    const user = getUser();
    if (!user) return void router.replace("/login");
    if (user.role === "manager") return void router.replace("/manager");
    router.replace("/developer");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#03060F" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <p className="text-slate-400 text-sm">Loading TeamPulse…</p>
      </div>
    </div>
  );
}
