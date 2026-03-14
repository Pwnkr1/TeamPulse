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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #EDE8FF 0%, #FFF8E6 100%)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(124,107,196,0.3)", borderTopColor: "#7C6BC4" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnimatedBg variant="cyan" />
      <Sidebar user={user} />
      <main className="ml-60 min-h-screen relative z-10">
        <div className="p-6 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
