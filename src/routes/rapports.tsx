import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { COMMUNES, COMMUNE_KPIS, IPK, IPK_KINSHASA, INTERVENTIONS, MONTHLY_TREND } from "@/lib/data";
import { Download, FileText, Map as MapIcon } from "lucide-react";

export const Route = createFileRoute("/rapports")({
  head: () => ({
    meta: [
      { title: "Rapports automatiques — EcoKin Smart" },
      { name: "description", content: "Rapports quotidiens, hebdomadaires et mensuels générés automatiquement pour le Gouverneur et les Bourgmestres." },
    ],
  }),
  component: RapportsPage,
});

const reports = [
  { id: "rep1", titre: "Rapport quotidien — 20 juin 2026", periode: "Quotidien", taille: "1.2 Mo", pages: 4 },
  { id: "rep2", titre: "Rapport hebdomadaire S25", periode: "Hebdomadaire", taille: "3.8 Mo", pages: 12 },
  { id: "rep3", titre: "Rapport mensuel — Mai 2026", periode: "Mensuel", taille: "8.6 Mo", pages: 28 },
  { id: "rep4", titre: "Carte PDF — Zones à risque Kisenso", periode: "Cartographie", taille: "2.1 Mo", pages: 1 },
  { id: "rep5", titre: "Statistiques Gouverneur — Trim. 2", periode: "Stratégique", taille: "5.4 Mo", pages: 18 },
];

function download(name: string) {
  const stats = COMMUNES.map((c) => {
    const k = COMMUNE_KPIS[c.id];
    const ipk = IPK[c.id];
    return `- ${c.name}: IPK ${ipk.score}/100, ${k.signalements} signalements, ${k.collecte_t}t collectées, ${k.recyclage}% recyclage, risque ${k.risque}%`;
  }).join("\n");
  const body = `EcoKin Smart — ${name}\nDate: ${new Date().toLocaleString("fr-FR")}\nIPK Kinshasa: ${IPK_KINSHASA}/100\n\n${stats}\n\nInterventions: ${INTERVENTIONS.length}\nTendance 6 mois: ${MONTHLY_TREND.map(m => `${m.mois}=${m.signalements}`).join(", ")}\n`;
  const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/\s+/g, "_")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function RapportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="border-b border-border bg-kin text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-eco">Reporting</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Rapports automatiques</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Génération automatique de rapports quotidiens, hebdomadaires, mensuels, et cartes PDF pour le
            Gouverneur et les Bourgmestres.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-3 sm:grid-cols-3">
          <Tile label="IPK Kinshasa" value={`${IPK_KINSHASA}/100`} />
          <Tile label="Interventions" value={String(INTERVENTIONS.length)} />
          <Tile label="Communes pilotes" value={String(COMMUNES.length)} />
        </section>

        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-xl font-bold">Bibliothèque des rapports</h2>
          <ul className="mt-4 divide-y divide-border">
            {reports.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-eco/10 text-eco">
                    {r.periode === "Cartographie" ? <MapIcon className="size-5" /> : <FileText className="size-5" />}
                  </span>
                  <div>
                    <div className="font-semibold">{r.titre}</div>
                    <div className="text-xs text-muted-foreground">{r.periode} · {r.pages} pages · {r.taille}</div>
                  </div>
                </div>
                <button
                  onClick={() => download(r.titre)}
                  className="inline-flex items-center gap-2 rounded-xl bg-kin px-4 py-2 text-xs font-bold text-white hover:bg-kin/90"
                >
                  <Download className="size-4" /> Télécharger
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    </div>
  );
}
