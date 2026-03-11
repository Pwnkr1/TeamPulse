export type UserRole = "developer" | "manager";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  team?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function login(email: string, password: string): Promise<User | null> {
  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    const { token, user } = await res.json();
    if (typeof window !== "undefined") {
      localStorage.setItem("tp_token", token);
      localStorage.setItem("tp_user", JSON.stringify(user));
    }
    return user as User;
  } catch {
    return null;
  }
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("tp_token");
    localStorage.removeItem("tp_user");
  }
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("tp_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tp_token");
}
