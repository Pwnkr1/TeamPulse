"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, type User } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import AnimatedBg from "@/components/AnimatedBg";

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) return void router.replace("/login");
    if (u.role !== "developer") return void router.replace("/manager");
    setUser(u);
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#03060F" }}>
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#03060F" }}>
      <AnimatedBg variant="cyan" />
      <Sidebar user={user} />
      <main className="ml-60 min-h-screen relative z-10">
        <div className="p-6 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
