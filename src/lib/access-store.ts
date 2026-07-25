// Controle d'acces base sur les comptes persistants ecokin-db.
import { useEffect, useState } from "react";
import { logAudit } from "./audit-log";
import { DB_EVT, findUserByCredentials, readDb } from "./ecokin-db";
import type { EcokinUserRecord } from "./ecokin-db";

export type Role = "citoyen" | "agent" | "bourgmestre" | "gouverneur" | "admin";
export type AuthorityRole = Exclude<Role, "citoyen">;

const KEY = "ecokin_access_v1";

export const ACCESS_CODES: Record<AuthorityRole, string> = {
  agent: "AGENT2026",
  bourgmestre: "BOURG2026",
  gouverneur: "GOUV2026",
  admin: "ADMIN2026",
};

export const AUTH_USERS: Record<AuthorityRole, { identifier: string; password: string; label: string }> = {
  agent: { identifier: "ECOKIN-AGENT", password: "AGENT2026", label: "Agent terrain" },
  bourgmestre: { identifier: "ECOKIN-BOURG", password: "BOURG2026", label: "Bourgmestre" },
  gouverneur: { identifier: "ECOKIN-GOUV", password: "GOUV2026", label: "Cabinet du Gouverneur" },
  admin: { identifier: "ECOKIN-ADMIN", password: "ADMIN2026", label: "Administrateur communal" },
};

export function getAuthorityDashboardPath(role: Role) {
  switch (role) {
    case "gouverneur":
      return "/gouverneur";
    case "bourgmestre":
      return "/bourgmestre";
    case "admin":
      return "/admin";
    case "agent":
      return "/agent";
    default:
      return "/autorite";
  }
}

export const ROUTE_ROLES: Record<string, Role[]> = {
  "/gouverneur": ["gouverneur"],
  "/situation": ["agent", "bourgmestre", "gouverneur", "admin"],
  "/predictif": ["bourgmestre", "gouverneur", "admin"],
  "/observatoire": ["citoyen", "agent", "bourgmestre", "gouverneur", "admin"],
  "/crise": ["gouverneur"],
  "/assistant-ia": ["bourgmestre", "gouverneur", "admin"],
  "/decisions": ["bourgmestre", "gouverneur", "admin"],
  "/interventions": ["agent", "bourgmestre", "gouverneur", "admin"],
  "/itineraires": ["agent", "bourgmestre", "gouverneur", "admin"],
  "/gps-flotte": ["agent", "bourgmestre", "gouverneur", "admin"],
  "/autorites": ["bourgmestre", "gouverneur", "admin"],
  "/rapports": ["bourgmestre", "gouverneur", "admin"],
  "/audit": ["admin", "gouverneur"],
  "/admin": ["admin"],
};

export type Permission =
  | "signaler"
  | "export_data"
  | "manage_alerts"
  | "manage_activities"
  | "manage_fleet"
  | "moderate_reports"
  | "reset_data";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  citoyen: ["signaler"],
  agent: ["signaler", "manage_fleet", "manage_activities"],
  bourgmestre: ["signaler", "export_data", "manage_alerts", "manage_activities", "manage_fleet", "moderate_reports"],
  gouverneur: ["signaler", "export_data", "manage_alerts", "manage_activities", "manage_fleet", "moderate_reports"],
  admin: ["signaler", "export_data", "manage_alerts", "manage_activities", "manage_fleet", "moderate_reports", "reset_data"],
};

export type Session = {
  userId?: string;
  role: Role;
  name: string;
  province?: string;
  city?: string;
  commune?: string;
  quartier?: string;
  zone?: string;
  permissions: Permission[];
};

const DEFAULT: Session = { role: "citoyen", name: "Citoyen EcoKin", permissions: ROLE_PERMISSIONS.citoyen };

function toSession(record: EcokinUserRecord, commune?: string): Session {
  return {
    userId: record.id,
    role: record.role,
    name: record.name,
    province: record.province,
    city: record.city,
    commune: commune || record.commune,
    quartier: record.quartier,
    zone: record.zone,
    permissions: (record.permissions as Permission[]) ?? ROLE_PERMISSIONS[record.role],
  };
}

function read(): Session {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function write(session: Session) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(DB_EVT));
}

function findAuthority(role: AuthorityRole, identifier: string, password: string) {
  const direct = findUserByCredentials(role, identifier, password);
  if (direct) return direct;

  // Compatibilite avec les anciens formulaires de demonstration.
  if (identifier.trim().toUpperCase() !== "ECOKIN2026" || ACCESS_CODES[role] !== password.trim()) return undefined;
  return readDb().users.find((user) => user.role === role && user.password === ACCESS_CODES[role]);
}

function roleRequiresCommune(role: Role) {
  return role === "agent" || role === "bourgmestre" || role === "admin";
}

export function useAccess() {
  const [session, setSession] = useState<Session>(DEFAULT);

  useEffect(() => {
    const refresh = () => setSession(read());
    refresh();
    window.addEventListener(DB_EVT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(DB_EVT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const login = (role: AuthorityRole, identifier: string, password?: string, commune?: string) => {
    const normalizedCommune = commune?.trim();
    const record = findAuthority(role, identifier, password ?? "");
    if (!record) return false;
    if (roleRequiresCommune(role) && !(normalizedCommune || record.commune)) return false;

    const next = toSession(record, normalizedCommune);
    write(next);
    setSession(next);
    logAudit({ user: next.name, role, action: "login" });
    return true;
  };

  const logout = () => {
    const prev = read();
    if (typeof window !== "undefined") {
      localStorage.removeItem(KEY);
      window.dispatchEvent(new Event(DB_EVT));
    }
    setSession(DEFAULT);
    if (prev.role !== "citoyen") logAudit({ user: prev.name, role: prev.role, action: "logout" });
  };

  const loginAdmin = (identifier: string, password?: string, commune?: string) => login("admin", identifier, password, commune);
  const can = (path: string) => {
    const allowed = ROUTE_ROLES[path];
    if (!allowed) return true;
    return allowed.includes(session.role);
  };
  const hasPermission = (perm: Permission) => session.permissions.includes(perm);

  return { session, login, loginAdmin, logout, can, hasPermission };
}
