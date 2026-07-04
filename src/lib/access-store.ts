// Lightweight role-based access control for the demo platform.
// Persists in localStorage. Replace with Lovable Cloud Auth for production.
import { useEffect, useState } from "react";
import { logAudit } from "./audit-log";

export type Role = "citoyen" | "agent" | "bourgmestre" | "gouverneur" | "admin";

const KEY = "ecokin_access_v1";

// Demo access codes — communicated to demo users.
export const ACCESS_CODES: Record<Exclude<Role, "citoyen">, string> = {
  agent: "AGENT2026",
  bourgmestre: "BOURG2026",
  gouverneur: "GOUV2026",
  admin: "ECOKIN2026",
};

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
  "/suivi-evaluation": ["agent", "bourgmestre", "gouverneur", "admin"],
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
  | "manage_activities" // créer/éditer activités Kin Label
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

  const login = (role: Exclude<Role, "citoyen">, code: string) => {
    if (ACCESS_CODES[role] !== code) return false;
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
  const can = (path: string) => {
    const allowed = ROUTE_ROLES[path];
    if (!allowed) return true;
    return allowed.includes(session.role);
  };
  const hasPermission = (perm: Permission) => (ROLE_PERMISSIONS[session.role] ?? []).includes(perm);
  return { session, login, logout, can, hasPermission };
}
