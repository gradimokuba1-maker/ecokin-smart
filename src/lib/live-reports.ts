// EcoKin Smart — Registre temps réel des signalements & alertes de crise.
// Persistance localStorage. Diffusion via CustomEvent pour maj instantanée
// des composants (bell, salle de crise, audit).
import { useEffect, useState } from "react";
import { logAudit } from "./audit-log";
import { pushNotification } from "./notification-store";
import { assignMission, updateMissionStatus } from "./agent-tracking-store";

export type Urgency = "faible" | "moyen" | "eleve" | "critique";
export type LiveStatus = "en_attente" | "assignee" | "en_cours" | "terminee" | "rejete";

export type LiveReport = {
  id: string;
  createdAt: string;
  author: string;
  commune: string;
  category: string;
  urgency: Urgency;
  description?: string;
  lat?: number;
  lng?: number;
  volumeM3?: number;
  priorityScore?: number;
  ack: boolean;
  ackBy?: string;
  ackAt?: string;
  team?: string;
  status: LiveStatus;
  history: { at: string; label: string }[];
  photoBefore?: string;
  photoAfter?: string;
  // Nouveaux champs analyse IA avancée
  composition?: { material: string; percentage: number }[];
  weightTons?: number;
  weightConfidence?: number;
  dimensions?: { lengthM: number; widthM: number; heightAvgM: number; surfaceM2: number; volumeM3: number; confidence: number };
  priorityLevel?: "faible" | "moyen" | "eleve" | "critique";
  analysisConfidence?: number;
  cameraCapability?: "lidar" | "arcore" | "basic";
  model3DAvailable?: boolean;
  healthRisk?: "faible" | "modere" | "eleve";
  floodRisk?: boolean;
  interventionUrgent?: boolean;
  photoUrl?: string;
  greenPointsAwarded?: number;
  assignedAgentId?: string;
  assignedAgentName?: string;
};

const KEY = "ecokin_live_reports_v1";
const EVT = "ecokin:live-reports";
const MAX = 200;

const TEAMS = [
  "Équipe RASKIN Matete-1",
  "Équipe RASKIN Lemba-2",
  "Équipe RASKIN Kisenso-3",
  "Cellule d'urgence Gouvernorat",
];

function read(): LiveReport[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(list: LiveReport[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  window.dispatchEvent(new Event(EVT));
}

function pickTeam(commune: string): string {
  const match = TEAMS.find((t) => t.toLowerCase().includes(commune.toLowerCase()));
  return match ?? TEAMS[3];
}

export function urgencyFromSeverity(sev: string, floodRisk?: boolean): Urgency {
  if (floodRisk || sev === "critique") return "critique";
  if (sev === "eleve") return "eleve";
  if (sev === "modere") return "moyen";
  return "faible";
}

export function pushLiveReport(input: Omit<LiveReport, "id" | "createdAt" | "ack" | "status" | "history">) {
  const item: LiveReport = {
    ...input,
    id: "SIG-" + Date.now().toString(36).toUpperCase(),
    createdAt: new Date().toISOString(),
    ack: false,
    status: "en_attente",
    history: [{ at: new Date().toISOString(), label: "Signalement reçu" }],
    photoBefore: undefined,
    photoAfter: undefined,
  };
  // Auto-assign for high urgency reports
  if (item.urgency === "critique" || item.urgency === "eleve") {
    item.team = pickTeam(item.commune);
    item.status = "assignee";
    item.history.push({ at: new Date().toISOString(), label: `Auto-assignation → ${item.team}` });
  }
  write([item, ...read()]);
  logAudit({
    user: input.author,
    role: "citoyen",
    action: "report_create",
    target: item.id,
    details: `${input.category} · ${input.commune} · urgence ${item.urgency}`,
  });
  pushNotification({
    kind: "report_created",
    title: "Signalement enregistré",
    message: `${item.category} · ${item.commune} · urgence ${item.urgency}`,
    targetId: item.id,
    meta: { greenPoints: item.greenPointsAwarded ?? 0 },
  });
  if (item.status === "assignee" && item.team) {
    pushNotification({
      kind: "agent_assigned",
      title: "Mission affectée",
      message: `${item.id} assigné à ${item.team}`,
      targetId: item.id,
    });
  }
  return item;
}

function update(id: string, patch: Partial<LiveReport>, logMsg?: string) {
  const list = read().map((r) =>
    r.id === id
      ? {
        ...r,
        ...patch,
        history: logMsg ? [...r.history, { at: new Date().toISOString(), label: logMsg }] : r.history,
      }
      : r,
  );
  write(list);
}

export function ackLiveReport(id: string, by: string) {
  update(id, { ack: true, ackBy: by, ackAt: new Date().toISOString() }, `Acquitté par ${by}`);
  logAudit({ user: by, role: "autorité", action: "report_ack", target: id });
}

export function assignLiveReport(id: string, team: string, by: string) {
  update(id, { team, status: "assignee" }, `Assigné à ${team}`);
  logAudit({ user: by, role: "autorité", action: "report_assign", target: id, details: team });
  pushNotification({
    kind: "agent_assigned",
    title: "Agent affecté",
    message: `${id} assigné à ${team}`,
    targetId: id,
  });
}

export function assignLiveReportToAgent(
  id: string,
  agentId: string,
  agentName: string,
  team: string,
  by: string,
) {
  const report = read().find((r) => r.id === id);
  update(
    id,
    { team, status: "assignee", assignedAgentId: agentId, assignedAgentName: agentName },
    `Assigné à ${agentName} (${team})`,
  );
  logAudit({ user: by, role: "autorité", action: "report_assign", target: id, details: `${agentName} · ${team}` });
  if (report) {
    assignMission({
      reportId: id,
      agentId,
      agentName,
      commune: report.commune,
      category: report.category,
      team,
    });
  }
  pushNotification({
    kind: "mission_assigned",
    title: "Mission assignée",
    message: `${agentName} a reçu la mission ${id}`,
    targetId: id,
    meta: { agent: agentName },
  });
}

export function setLiveStatus(id: string, status: LiveStatus, by: string) {
  update(id, { status }, `Statut → ${status}`);
  logAudit({ user: by, role: "autorité", action: "report_status", target: id, details: status });
  const statusLabels: Record<LiveStatus, string> = {
    en_attente: "En attente",
    assignee: "Assignée",
    en_cours: "En cours",
    terminee: "Terminée",
    rejete: "Rejeté",
  };
  pushNotification({
    kind: status === "terminee" ? "intervention_completed" : "status_changed",
    title: status === "terminee" ? "Intervention terminée" : "Statut mis à jour",
    message: `${id} → ${statusLabels[status]}`,
    targetId: id,
  });
  if (status === "en_cours") updateMissionStatus(id, "en_cours");
  if (status === "terminee") updateMissionStatus(id, "terminee");
}

export function setReportPhoto(id: string, type: 'before' | 'after', photoDataUrl: string, by: string) {
  const patch = type === 'before' ? { photoBefore: photoDataUrl } : { photoAfter: photoDataUrl };
  update(id, { ...patch }, `Photo ${type === 'before' ? 'avant' : 'après'} ajoutée par ${by}`);
  logAudit({ user: by, role: "agent", action: "report_photo", target: id, details: `photo_${type}` });
}

export function useLiveReports() {
  const [items, setItems] = useState<LiveReport[]>([]);
  useEffect(() => {
    setItems(read());
    const h = () => setItems(read());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return {
    items,
    ack: ackLiveReport,
    assign: assignLiveReport,
    assignToAgent: assignLiveReportToAgent,
    setStatus: setLiveStatus,
    setPhoto: setReportPhoto,
  };
}

export const TEAMS_LIST = TEAMS;

export const URGENCY_META: Record<Urgency, { label: string; color: string; bg: string }> = {
  faible: { label: "Faible", color: "text-emerald-700", bg: "bg-emerald-500/10" },
  moyen: { label: "Moyen", color: "text-amber-700", bg: "bg-amber-500/10" },
  eleve: { label: "Élevé", color: "text-orange-700", bg: "bg-orange-500/10" },
  critique: { label: "Critique", color: "text-red-700", bg: "bg-red-500/10" },
};

export const STATUS_META: Record<LiveStatus, { label: string; color: string }> = {
  en_attente: { label: "En attente", color: "bg-slate-500/15 text-slate-700" },
  assignee: { label: "Assignée", color: "bg-blue-500/15 text-blue-700" },
  en_cours: { label: "En cours", color: "bg-amber-500/15 text-amber-700" },
  terminee: { label: "Terminée", color: "bg-emerald-500/15 text-emerald-700" },
  rejete: { label: "Rejeté", color: "bg-red-500/15 text-red-700" },
};
