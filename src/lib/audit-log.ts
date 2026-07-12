// EcoKin Smart — Journal d'audit (localStorage)
// Enregistre les événements clés : connexions, modifications, validations, interventions.
import { useEffect, useState } from "react";

export type AuditAction =
  | "login"
  | "logout"
  | "role_change"
  | "report_create"
  | "report_validate"
  | "report_reject"
  | "report_ack"
  | "report_assign"
  | "report_status"
  | "report_photo"
  | "intervention_start"
  | "intervention_close"
  | "ai_correction"
  | "settings_update";

export type AuditEntry = {
  id: string;
  at: string; // ISO
  user: string;
  role: string;
  action: AuditAction;
  target?: string;
  details?: string;
};

const KEY = "ecokin_audit_v1";
const MAX = 500;
const EVT = "ecokin:audit";

function read(): AuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(list: AuditEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  window.dispatchEvent(new Event(EVT));
}

export function logAudit(entry: Omit<AuditEntry, "id" | "at">) {
  const full: AuditEntry = {
    ...entry,
    id: "aud_" + Math.random().toString(36).slice(2, 9),
    at: new Date().toISOString(),
  };
  const list = [full, ...read()];
  write(list);
  return full;
}

export function clearAudit() {
  write([]);
}

export function useAuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  useEffect(() => {
    setEntries(read());
    const h = () => setEntries(read());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return { entries, clear: clearAudit };
}

export const ACTION_LABEL: Record<AuditAction, string> = {
  login: "Connexion",
  logout: "Déconnexion",
  role_change: "Changement de rôle",
  report_create: "Nouveau signalement",
  report_validate: "Validation signalement",
  report_reject: "Rejet signalement",
  report_ack: "Acquittement alerte",
  report_assign: "Assignation équipe",
  report_status: "Changement de statut",
  report_photo: "Photo d'intervention",
  intervention_start: "Démarrage intervention",
  intervention_close: "Clôture intervention",
  ai_correction: "Correction classification IA",
  settings_update: "Mise à jour paramètres",
};
