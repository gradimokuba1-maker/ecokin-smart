import { COMMUNES } from "./data";
import type { AgentMission } from "./agent-tracking-store";
import type { Session } from "./access-store";
import type { EcokinUserRecord } from "./ecokin-db";
import type { LiveReport, LiveStatus } from "./live-reports";
import type { WasteAnalysisResult, Severity } from "./waste-ai/types"; // <-- New import

export type ReportScope = {
  commune?: string;
  quartier?: string;
  zone?: string;
  agentId?: string;
};

// New functions added to resolve build errors
export function severityFromAnalysis(result: WasteAnalysisResult): Severity {
  if (result.interventionUrgent || result.floodRisk || result.priorityLevel === "critique") return "critique";
  if (result.priorityLevel === "eleve" || result.healthRisk === "eleve") return "modere";
  return "faible";
}

export function priorityScoreFromAnalysis(analysisResult: WasteAnalysisResult, commune: string): number {
  // The AI analysis result already contains a priorityScore, which is more accurate.
  // We'll use that directly instead of re-calculating from basic severity.
  return analysisResult.priorityScore;
}
// End new functions


export function filterReportsByScope(reports: LiveReport[], session: Pick<Session, "role" | "commune" | "quartier" | "zone" | "userId">) {
  if (session.role === "gouverneur") return reports;
  if (session.role === "agent") {
    return reports.filter(
      (report) =>
        report.assignedAgentId === session.userId ||
        report.authorId === session.userId ||
        (!report.assignedAgentId && report.commune === session.commune && (report.status === "assignee" || report.status === "en_cours")),
    );
  }
  if (session.role === "bourgmestre" || session.role === "admin") {
    return reports.filter((report) => {
      if (session.commune && report.commune !== session.commune) return false;
      if (session.quartier && report.quartier !== session.quartier) return false;
      if (session.zone && report.zone !== session.zone) return false;
      return true;
    });
  }
  return reports.filter((report) => report.authorId === session.userId);
}

export function groupBy<T>(items: T[], getKey: (item: T) => string | undefined) {
  return items.reduce(
    (acc, item) => {
      const key = getKey(item) || "non_defini";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

export function statusDate(report: LiveReport, status: LiveStatus) {
  return report.history.find((entry) => entry.label.includes(status))?.at;
}

export function reportVolume(reports: LiveReport[]) {
  return reports.reduce((sum, report) => sum + (report.volumeM3 ?? report.dimensions?.volumeM3 ?? 0), 0);
}

export function reportWeight(reports: LiveReport[]) {
  return reports.reduce((sum, report) => sum + (report.weightTons ?? 0), 0);
}

export function collectedReports(reports: LiveReport[]) {
  return reports.filter((report) => report.status === "terminee");
}

export function pendingReports(reports: LiveReport[]) {
  return reports.filter((report) => report.status === "en_attente" || report.status === "assignee" || report.status === "en_cours");
}

export function recycledVolume(reports: LiveReport[]) {
  return collectedReports(reports).reduce((sum, report) => {
    const recyclablePct =
      report.composition?.reduce((pct, item) => {
        const material = item.material.toLowerCase();
        if (["plastique", "metal", "verre", "papier", "carton"].some((key) => material.includes(key))) {
          return pct + item.percentage;
        }
        return pct;
      }, 0) ?? 0;
    return sum + (report.volumeM3 ?? 0) * (recyclablePct / 100);
  }, 0);
}

export function illegalDumpCount(reports: LiveReport[]) {
  return reports.filter((report) => {
    const text = `${report.category} ${report.description ?? ""}`.toLowerCase();
    return text.includes("depot") || text.includes("dépôt") || text.includes("sauvage") || report.category === "mixte";
  }).length;
}

export function environmentalIndicators(reports: LiveReport[]) {
  const total = reports.length;
  const resolved = collectedReports(reports).length;
  const critical = reports.filter((report) => report.urgency === "critique").length;
  const floodRisk = reports.filter((report) => report.floodRisk).length;
  const treatmentRate = total ? Math.round((resolved / total) * 100) : 0;
  const cleanlinessScore = Math.max(0, Math.min(100, 100 - critical * 8 - pendingReports(reports).length * 2 + treatmentRate / 2));
  return {
    treatmentRate,
    cleanlinessScore: Math.round(cleanlinessScore),
    floodRisk,
    urgent: reports.filter((report) => report.urgency === "critique" || report.urgency === "eleve").length,
  };
}

export function dailySeries(reports: LiveReport[], days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const key = date.toISOString().slice(0, 10);
    return {
      name: index === 0 ? "Auj." : date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
      Signalements: reports.filter((report) => report.createdAt.startsWith(key)).length,
      Collectes: reports.filter((report) => report.status === "terminee" && statusDate(report, "terminee")?.startsWith(key)).length,
    };
  }).reverse();
}

export function monthlySeries(reports: LiveReport[], months: number) {
  return Array.from({ length: months }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - index);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return {
      name: date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      Signalements: reports.filter((report) => report.createdAt.startsWith(key)).length,
      Collectes: reports.filter((report) => report.status === "terminee" && statusDate(report, "terminee")?.startsWith(key)).length,
    };
  }).reverse();
}

export function reportsByCommune(reports: LiveReport[]) {
  const counts = groupBy(reports, (report) => report.commune);
  return Object.entries(counts)
    .map(([id, count]) => ({
      id,
      name: COMMUNES.find((commune) => commune.id === id)?.name ?? id,
      Signalements: count,
      Collectes: collectedReports(reports.filter((report) => report.commune === id)).length,
    }))
    .sort((a, b) => b.Signalements - a.Signalements);
}

export function reportsByQuarter(reports: LiveReport[]) {
  return Object.entries(groupBy(reports, (report) => report.quartier ?? report.zone ?? "Non renseigne"))
    .map(([name, value]) => ({ name, Signalements: value }))
    .sort((a, b) => b.Signalements - a.Signalements);
}

export function agentPerformance(reports: LiveReport[], missions: AgentMission[], users: EcokinUserRecord[]) {
  const agentUsers = users.filter((user) => user.role === "agent");
  return agentUsers
    .map((agent) => {
      const assigned = reports.filter((report) => report.assignedAgentId === agent.id);
      const missionRows = missions.filter((mission) => mission.agentId === agent.id);
      const completed = assigned.filter((report) => report.status === "terminee").length;
      const active = assigned.filter((report) => report.status === "assignee" || report.status === "en_cours").length;
      return {
        id: agent.id,
        name: agent.name,
        commune: agent.commune ?? "Kinshasa",
        assignes: assigned.length || missionRows.length,
        termines: completed || missionRows.filter((mission) => mission.status === "terminee").length,
        actifs: active || missionRows.filter((mission) => mission.status !== "terminee").length,
        taux: assigned.length ? Math.round((completed / assigned.length) * 100) : 0,
      };
    })
    .filter((row) => row.assignes > 0 || row.actifs > 0 || row.termines > 0);
}

export function authorityPerformance(reports: LiveReport[], users: EcokinUserRecord[], role: "admin" | "bourgmestre") {
  return users
    .filter((user) => user.role === role)
    .map((user) => {
      const scoped = user.commune ? reports.filter((report) => report.commune === user.commune) : reports;
      const resolved = scoped.filter((report) => report.status === "terminee").length;
      return {
        id: user.id,
        name: user.name,
        commune: user.commune ?? "Kinshasa",
        signalements: scoped.length,
        resolus: resolved,
        taux: scoped.length ? Math.round((resolved / scoped.length) * 100) : 0,
      };
    });
}