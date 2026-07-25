// EcoKin Smart — Statistiques partagées pour les tableaux de bord.
import type { LiveReport } from "./live-reports";

export type DashboardStats = {
  totalSignalements: number;
  enAttente: number;
  assignees: number;
  enCours: number;
  terminees: number;
  rejetees: number;
  greenPointsDistribues: number;
  volumeTotalM3: number;
  poidsTotalTons: number;
  tauxTraitement: number;
  interventionsUrgentes: number;
};

export function computeDashboardStats(reports: LiveReport[]): DashboardStats {
  const total = reports.length;
  const enAttente = reports.filter((r) => r.status === "en_attente").length;
  const assignees = reports.filter((r) => r.status === "assignee").length;
  const enCours = reports.filter((r) => r.status === "en_cours").length;
  const terminees = reports.filter((r) => r.status === "terminee").length;
  const rejetees = reports.filter((r) => r.status === "rejete").length;
  const greenPointsDistribues = reports.reduce((s, r) => s + (r.greenPointsAwarded ?? 0), 0);
  const volumeTotalM3 = reports.reduce((s, r) => s + (r.volumeM3 ?? 0), 0);
  const poidsTotalTons = reports.reduce((s, r) => s + (r.weightTons ?? 0), 0);
  const tauxTraitement = total > 0 ? Math.round((terminees / total) * 100) : 0;
  const interventionsUrgentes = reports.filter(
    (r) => r.interventionUrgent || r.urgency === "critique" || r.urgency === "eleve",
  ).length;

  return {
    totalSignalements: total,
    enAttente,
    assignees,
    enCours,
    terminees,
    rejetees,
    greenPointsDistribues,
    volumeTotalM3,
    poidsTotalTons,
    tauxTraitement,
    interventionsUrgentes,
  };
}
