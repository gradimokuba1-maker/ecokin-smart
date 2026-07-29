// PDF report generation using jsPDF + autotable.
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  COMMUNES,
  COMMUNE_KPIS,
  COMMUNE_BUDGET,
  IPK,
  IPK_KINSHASA,
  INTERVENTIONS,
  WEATHER_FORECAST,
  PRIORITY_ALERTS,
  AI_RECOMMENDATIONS,
  MONTHLY_TREND,
} from "./data";

function header(doc: jsPDF, title: string, subtitle: string) {
  doc.setFillColor(11, 31, 58);
  doc.rect(0, 0, 210, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("EcoKin Smart", 14, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Ville de Kinshasa · RDC", 14, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title, 14, 28);
  doc.setTextColor(120, 120, 120);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(subtitle, 196, 14, { align: "right" });
  doc.setTextColor(0, 0, 0);
}

function footer(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `EcoKin Smart · Document confidentiel · ${new Date().toLocaleDateString("fr-FR")}`,
      14,
      290,
    );
    doc.text(`Page ${i}/${pages}`, 196, 290, { align: "right" });
  }
}

export function generateReport(
  kind: "quotidien" | "hebdomadaire" | "mensuel" | "strategique" | "carte",
): jsPDF {
  const doc = new jsPDF();
  const label = {
    quotidien: "Rapport quotidien",
    hebdomadaire: "Rapport hebdomadaire",
    mensuel: "Rapport mensuel",
    strategique: "Rapport stratégique du Gouverneur",
    carte: "Synthèse cartographique",
  }[kind];

  header(doc, label, new Date().toLocaleString("fr-FR"));

  // IPK summary
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Indice de Propreté de Kinshasa (IPK) : ${IPK_KINSHASA}/100`, 14, 42);

  autoTable(doc, {
    startY: 48,
    head: [["Commune", "IPK", "Tendance", "Signalements", "Collecte (t)", "Recyclage", "Risque"]],
    body: COMMUNES.map((c) => {
      const k = COMMUNE_KPIS[c.id];
      const i = IPK[c.id];
      return [
        c.name,
        `${i.score}/100`,
        `${i.trend >= 0 ? "+" : ""}${i.trend}`,
        k.signalements,
        `${k.collecte_t} t`,
        `${k.recyclage} %`,
        `${k.risque} %`,
      ];
    }),
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129] },
  });

  // Alertes prioritaires
  let y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Alertes prioritaires", 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [["Niveau", "Commune", "Message"]],
    body: PRIORITY_ALERTS.map((a) => [a.level, a.commune, a.msg]),
    headStyles: { fillColor: [239, 68, 68] },
  });

  // Météo / risque pluie
  y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text("Prévision météo — 7 jours", 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [["Jour", "Température", "Pluie", "Risque inondation"]],
    body: WEATHER_FORECAST.map((d) => [d.day, `${d.tempC} °C`, `${d.rainMm} mm`, d.floodRisk]),
    headStyles: { fillColor: [14, 165, 233] },
  });

  // Recommandations IA
  y = (doc as any).lastAutoTable.finalY + 10;
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  doc.setFont("helvetica", "bold");
  doc.text("Plan d'action recommandé (IA)", 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [["#", "Commune", "Action", "Camions", "Équipes", "Délai"]],
    body: AI_RECOMMENDATIONS.map((r) => [
      r.priorite,
      r.commune,
      r.titre,
      r.camions,
      r.equipes,
      r.eta,
    ]),
    headStyles: { fillColor: [99, 102, 241] },
  });

  if (kind === "mensuel" || kind === "strategique") {
    doc.addPage();
    header(doc, label, "Annexes");
    doc.setFont("helvetica", "bold");
    doc.text("Tendance mensuelle", 14, 42);
    autoTable(doc, {
      startY: 46,
      head: [["Mois", "Signalements", "Collecte (t)"]],
      body: MONTHLY_TREND.map((m) => [m.mois, m.signalements, m.collecte]),
    });

    const y2 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.text("Budget opérationnel par commune", 14, y2);
    autoTable(doc, {
      startY: y2 + 4,
      head: [["Commune", "Hebdo (CDF)", "Mensuel (CDF)", "Coût / tonne"]],
      body: COMMUNES.map((c) => {
        const b = COMMUNE_BUDGET[c.id];
        return [
          c.name,
          b.hebdo.toLocaleString("fr-FR"),
          b.mensuel.toLocaleString("fr-FR"),
          b.cout_tonne.toLocaleString("fr-FR"),
        ];
      }),
    });

    const y3 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.text("Interventions enregistrées", 14, y3);
    autoTable(doc, {
      startY: y3 + 4,
      head: [["ID", "Commune", "Type", "Équipe", "Statut", "Planifié"]],
      body: INTERVENTIONS.map((i) => [i.id, i.commune, i.type, i.team, i.status, i.scheduledAt]),
    });
  }

  footer(doc);
  return doc;
}

export function downloadReport(kind: Parameters<typeof generateReport>[0], filename?: string) {
  const doc = generateReport(kind);
  doc.save(filename ?? `ecokin-${kind}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
