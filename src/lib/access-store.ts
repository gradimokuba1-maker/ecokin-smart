// Lightweight role-based access control for the demo platform.
// Persists in localStorage. Replace with Lovable Cloud Auth for production.
import { useEffect, useState } from "react";

export type Role = "citoyen" | "bourgmestre" | "gouverneur" | "admin";

const KEY = "ecokin_access_v1";

// Demo access codes — communicated to demo users.
export const ACCESS_CODES: Record<Exclude<Role, "citoyen">, string> = {
  bourgmestre: "BOURG2026",
  gouverneur: "GOUV2026",
  admin: "ECOKIN2026",
};

export const ROUTE_ROLES: Record<string, Role[]> = {
  "/gouverneur": ["gouverneur", "admin"],
  "/interventions": ["bourgmestre", "gouverneur", "admin"],
  "/autorites": ["bourgmestre", "gouverneur", "admin"],
  "/rapports": ["bourgmestre", "gouverneur", "admin"],
  "/situation": ["bourgmestre", "gouverneur", "admin"],
  "/predictif": ["bourgmestre", "gouverneur", "admin"],
  "/crise": ["gouverneur", "admin"],
  "/assistant-ia": ["bourgmestre", "gouverneur", "admin"],
  "/decisions": ["bourgmestre", "gouverneur", "admin"],
  "/admin": ["admin"],
};

type Session = { role: Role; name: string };
const DEFAULT: Session = { role: "citoyen", name: "Citoyen EcoKin" };

function read(): Session {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function useAccess() {
  const [session, setSession] = useState<Session>(DEFAULT);
  useEffect(() => setSession(read()), []);

  const login = (role: Exclude<Role, "citoyen">, code: string) => {
    if (ACCESS_CODES[role] !== code) return false;
    const next: Session = { role, name: role === "admin" ? "Administrateur" : role === "gouverneur" ? "Cabinet du Gouverneur" : "Bourgmestre" };
    localStorage.setItem(KEY, JSON.stringify(next));
    setSession(next);
    return true;
  };
  const logout = () => {
    localStorage.removeItem(KEY);
    setSession(DEFAULT);
  };
  const can = (path: string) => {
    const allowed = ROUTE_ROLES[path];
    if (!allowed) return true;
    return allowed.includes(session.role);
  };
  return { session, login, logout, can };
}
