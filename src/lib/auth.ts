export type UserRole = "developer" | "manager";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  team?: string;
}

const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: "dev-1",
    name: "Alex Chen",
    email: "alex.chen@team.com",
    password: "Dev@123",
    role: "developer",
    avatar: "AC",
    team: "Platform",
  },
  {
    id: "dev-2",
    name: "Raj Kumar",
    email: "raj.kumar@team.com",
    password: "Dev@123",
    role: "developer",
    avatar: "RK",
    team: "Backend",
  },
  {
    id: "mgr-1",
    name: "Sarah Mitchell",
    email: "sarah.mgr@team.com",
    password: "Mgr@123",
    role: "manager",
    avatar: "SM",
    team: "Engineering",
  },
];

export function login(email: string, password: string): User | null {
  const found = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!found) return null;
  const { password: _pw, ...user } = found;
  if (typeof window !== "undefined") {
    localStorage.setItem("tp_user", JSON.stringify(user));
  }
  return user;
}

export function logout(): void {
  if (typeof window !== "undefined") localStorage.removeItem("tp_user");
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
