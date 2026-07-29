// EcoKin Smart - registre persistant des signalements et alertes de crise.
// Les donnees sont stockees dans la base applicative locale ecokin-db et
// diffusees par evenements pour synchroniser immediatement les tableaux de bord.
import { useEffect, useState } from "react";
import { logAudit } from "./audit-log";
import { assignMission, updateMissionStatus } from "./agent-tracking-store";
import { DB_EVT, insertReport, readDb, updateReport } from "./ecokin-db";
import { pushNotification } from "./notification-store";
import type { EcokinRole } from "./ecokin-db";

export type Urgency = "faible" | "moyen" | "eleve" | "critique";
export type LiveStatus = "en_attente" | "assignee" | "en_cours" | "terminee" | "rejete";

export type LiveReport = {
  id: string;
  createdAt: string;
  author: string;
  authorId?: string;
  authorRole?: EcokinRole | "anonyme";
  province?: string;
  city?: string;
  commune: string;
  quartier?: string;
  zone?: string;
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
  composition?: { material: string; percentage: number }[];
  weightTons?: number;
  weightConfidence?: number;
  dimensions?: {
    lengthM: number;
    widthM: number;
    heightAvgM: number;
    surfaceM2: number;
    volumeM3: number;
    confidence: number;
  };
  priorityLevel?: "faible" | "moyen" | "eleve" | "critique";
  analysisConfidence?: number;
  cameraCapability?: "lidar" | "arcore" | "basic";
  model3DAvailable?: boolean;
  healthRisk?: "faible" | "modere" | "eleve";
  floodRisk?: boolean;
  interventionUrgent?: boolean;
  photoUrl?: string;
  aiAnalysis?: unknown;
  greenPointsAwarded?: number;
  assignedAgentId?: string;
  assignedAgentName?: string;
};

const EVT = "ecokin:live-reports";

const TEAMS = [
  "Equipe RASKIN Matete-1",
  "Equipe RASKIN Lemba-2",
  "Equipe RASKIN Kisenso-3",
  "Cellule d'urgence Gouvernorat",
];

function read(): LiveReport[] {
  return readDb().reports;
}

function broadcast() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVT));
}

function pickTeam(commune: string): string {
  const match = TEAMS.find((team) => team.toLowerCase().includes(commune.toLowerCase()));
  return match ?? TEAMS[3];
}

export function urgencyFromSeverity(severity: string, floodRisk?: boolean): Urgency {
  if (floodRisk || severity === "critique") return "critique";
  if (severity === "eleve") return "eleve";
  if (severity === "modere") return "moyen";
  return "faible";
}

export function pushLiveReport(
  input: Omit<LiveReport, "id" | "createdAt" | "ack" | "status" | "history">,
) {
  const item = insertReport(input);

  if (item.urgency === "critique" || item.urgency === "eleve") {
    const team = pickTeam(item.commune);
    const history = [
      ...item.history,
      { at: new Date().toISOString(), label: `Auto-assignation -> ${team}` },
    ];
    Object.assign(item, { team, status: "assignee" as const, history });
    updateReport(item.id, { team, status: "assignee", history });
  }

  broadcast();
  logAudit({
    user: input.author,
    role: input.authorRole ?? "citoyen",
    action: "report_create",
    target: item.id,
    details: `${input.category} - ${input.commune} - urgence ${item.urgency}`,
  });
  pushNotification({
    kind: "report_created",
    title: "Signalement enregistre",
    message: `${item.category} - ${item.commune} - urgence ${item.urgency}`,
    targetId: item.id,
    meta: { greenPoints: item.greenPointsAwarded ?? 0 },
  });
  if (item.status === "assignee" && item.team) {
    pushNotification({
      kind: "agent_assigned",
      title: "Mission affectee",
      message: `${item.id} assigne a ${item.team}`,
      targetId: item.id,
    });
  }
  return item;
}

function update(id: string, patch: Partial<LiveReport>, logMsg?: string) {
  updateReport(id, patch, logMsg);
  broadcast();
}

export function ackLiveReport(id: string, by: string) {
  update(id, { ack: true, ackBy: by, ackAt: new Date().toISOString() }, `Acquitte par ${by}`);
  logAudit({ user: by, role: "autorité", action: "report_ack", target: id });
}

export function assignLiveReport(id: string, team: string, by: string) {
  update(id, { team, status: "assignee" }, `Assigne a ${team}`);
  logAudit({ user: by, role: "autorité", action: "report_assign", target: id, details: team });
  pushNotification({
    kind: "agent_assigned",
    title: "Agent affecte",
    message: `${id} assigne a ${team}`,
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
  const report = read().find((item) => item.id === id);
  update(
    id,
    { team, status: "assignee", assignedAgentId: agentId, assignedAgentName: agentName },
    `Assigne a ${agentName} (${team})`,
  );
  logAudit({
    user: by,
    role: "autorité",
    action: "report_assign",
    target: id,
    details: `${agentName} - ${team}`,
  });
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
    title: "Mission assignee",
    message: `${agentName} a recu la mission ${id}`,
    targetId: id,
    meta: { agent: agentName },
  });
}

export function setLiveStatus(id: string, status: LiveStatus, by: string) {
  update(id, { status }, `Statut -> ${status}`);
  logAudit({ user: by, role: "autorité", action: "report_status", target: id, details: status });
  const statusLabels: Record<LiveStatus, string> = {
    en_attente: "En attente",
    assignee: "Assignee",
    en_cours: "En cours",
    terminee: "Terminee",
    rejete: "Rejete",
  };
  pushNotification({
    kind: status === "terminee" ? "intervention_completed" : "status_changed",
    title: status === "terminee" ? "Intervention terminee" : "Statut mis a jour",
    message: `${id} -> ${statusLabels[status]}`,
    targetId: id,
  });
  if (status === "en_cours") updateMissionStatus(id, "en_cours");
  if (status === "terminee") updateMissionStatus(id, "terminee");
}

export function setReportPhoto(
  id: string,
  type: "before" | "after",
  photoDataUrl: string,
  by: string,
) {
  const patch = type === "before" ? { photoBefore: photoDataUrl } : { photoAfter: photoDataUrl };
  update(id, { ...patch }, `Photo ${type === "before" ? "avant" : "apres"} ajoutee par ${by}`);
  logAudit({
    user: by,
    role: "agent",
    action: "report_photo",
    target: id,
    details: `photo_${type}`,
  });
}

export function useLiveReports() {
  const [items, setItems] = useState<LiveReport[]>([]);
  useEffect(() => {
    const refresh = () => setItems(read());
    refresh();
    window.addEventListener(EVT, refresh);
    window.addEventListener(DB_EVT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVT, refresh);
      window.removeEventListener(DB_EVT, refresh);
      window.removeEventListener("storage", refresh);
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
  eleve: { label: "Eleve", color: "text-orange-700", bg: "bg-orange-500/10" },
  critique: { label: "Critique", color: "text-red-700", bg: "bg-red-500/10" },
};

export const STATUS_META: Record<LiveStatus, { label: string; color: string }> = {
  en_attente: { label: "En attente", color: "bg-slate-500/15 text-slate-700" },
  assignee: { label: "Assignee", color: "bg-blue-500/15 text-blue-700" },
  en_cours: { label: "En cours", color: "bg-amber-500/15 text-amber-700" },
  terminee: { label: "Terminee", color: "bg-emerald-500/15 text-emerald-700" },
  rejete: { label: "Rejete", color: "bg-red-500/15 text-red-700" },
};
