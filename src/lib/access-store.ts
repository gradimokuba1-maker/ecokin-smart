// Lightweight role-based access control for the demo platform.
// Persists in localStorage. Replace with Lovable Cloud Auth for production.
import { useEffect, useState } from "react";
import { logAudit } from "./audit-log";

export type Role = "citoyen" | "agent" | "bourgmestre" | "gouverneur" | "admin";

const KEY = "ecokin_access_v1";

export type AuthorityRole = Exclude<Role, "citoyen">;

// Demo access codes — communicated to demo users.
export const ACCESS_CODES: Record<Exclude<Role, "citoyen">, string> = {
  agent: "AGENT2026",
  bourgmestre: "BOURG2026",
  gouverneur: "GOUV2026",
  admin: "ADMIN2026",
};

export const AUTH_USERS: Record<AuthorityRole, { identifier: string; password: string; label: string }> = {
  agent: { identifier: "ECOKIN2026", password: "AGENT2026", label: "Agent" },
  bourgmestre: { identifier: "ECOKIN2026", password: "BOURG2026", label: "Bourgmestre" },
  gouverneur: { identifier: "ECOKIN2026", password: "GOUV2026", label: "Gouverneur" },
  admin: { identifier: "ECOKIN2026", password: "ADMIN2026", label: "Administrateur" },
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

// Permissions granulaires par rôle.
// Un rôle absent de la liste ⇒ accès refusé.
export const ROUTE_ROLES: Record<string, Role[]> = {
  // Consultation opérationnelle
  "/gouverneur": ["gouverneur", "admin"],
  "/situation": ["agent", "bourgmestre", "gouverneur", "admin"],
  "/predictif": ["bourgmestre", "gouverneur", "admin"],
  "/observatoire": ["citoyen", "agent", "bourgmestre", "gouverneur", "admin"],
  "/crise": ["gouverneur", "admin"],
  "/assistant-ia": ["bourgmestre", "gouverneur", "admin"],
  "/decisions": ["bourgmestre", "gouverneur", "admin"],
  // Interventions & équipes terrain
  "/interventions": ["agent", "bourgmestre", "gouverneur", "admin"],
  "/itineraires": ["agent", "bourgmestre", "gouverneur", "admin"],
  "/gps-flotte": ["agent", "bourgmestre", "gouverneur", "admin"],

  "/autorites": ["bourgmestre", "gouverneur", "admin"],
  "/rapports": ["bourgmestre", "gouverneur", "admin"],
  // Journal d'audit & administration
  "/audit": ["admin", "gouverneur"],
  "/admin": ["admin"],
};

// Permissions fonctionnelles (formulaires, exports, alertes).
export type Permission =
  | "signaler"          // créer un signalement citoyen
  | "export_data"       // exporter PDF/CSV
  | "manage_alerts"     // émettre/acquitter alertes
  | "manage_activities" // gérer activités opérationnelles
  | "manage_fleet"      // gérer flotte GPS et itinéraires
  | "moderate_reports"  // valider/rejeter signalements
  | "reset_data";       // réinitialiser la plateforme

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  citoyen: ["signaler"],
  agent: ["signaler", "manage_fleet", "manage_activities"],
  bourgmestre: ["signaler", "export_data", "manage_alerts", "manage_activities", "manage_fleet", "moderate_reports"],
  gouverneur: ["signaler", "export_data", "manage_alerts", "manage_activities", "manage_fleet", "moderate_reports"],
  admin: ["signaler", "export_data", "manage_alerts", "manage_activities", "manage_fleet", "moderate_reports", "reset_data"],
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

  const login = (role: Exclude<Role, "citoyen">, identifier: string, password?: string) => {
    const normalizedIdentifier = identifier.trim().toLowerCase();
    const normalizedPassword = password?.trim() ?? "";

    if (password !== undefined) {
      const authUser = AUTH_USERS[role as AuthorityRole];
      const expectedIdentifier = authUser?.identifier.trim().toLowerCase();
      if (!authUser || normalizedIdentifier !== expectedIdentifier || normalizedPassword !== authUser.password.trim()) {
        return false;
      }
    } else if (ACCESS_CODES[role] !== identifier.trim()) {
      return false;
    }

    const label =
      role === "admin" ? "Administrateur" :
        role === "gouverneur" ? "Cabinet du Gouverneur" :
          role === "bourgmestre" ? "Bourgmestre" :
            "Agent terrain";
    const next: Session = { role, name: label };
    localStorage.setItem(KEY, JSON.stringify(next));
    setSession(next);
    logAudit({ user: next.name, role, action: "login" });
    return true;
  };
  const logout = () => {
    const prev = read();
    localStorage.removeItem(KEY);
    setSession(DEFAULT);
    if (prev.role !== "citoyen") logAudit({ user: prev.name, role: prev.role, action: "logout" });
  };
  const loginAdmin = (identifier: string, password?: string) => login("admin", identifier, password);
  const can = (path: string) => {
    const allowed = ROUTE_ROLES[path];
    if (!allowed) return true;
    return allowed.includes(session.role);
  };
  const hasPermission = (perm: Permission) => (ROLE_PERMISSIONS[session.role] ?? []).includes(perm);
  return { session, login, loginAdmin, logout, can, hasPermission };
}
