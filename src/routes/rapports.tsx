import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AccessGate } from "@/components/access-gate";
import { COMMUNES, IPK_KINSHASA, INTERVENTIONS } from "@/lib/data";
import { downloadReport } from "@/lib/pdf-reports";
import { Download, FileText, Map as MapIcon } from "lucide-react";

export const Route = createFileRoute("/rapports")({
  head: () => ({
    meta: [
      { title: "Rapports automatiques — EcoKin Smart" },
      {
        name: "description",
        content:
          "Rapports PDF quotidiens, hebdomadaires et mensuels générés automatiquement pour le Gouverneur et les Bourgmestres.",
      },
    ],
  }),
  component: () => (
    <AccessGate required={["bourgmestre", "gouverneur", "admin"]} title="Rapports & exports PDF">
      <RapportsPage />
    </AccessGate>
  ),
});

type ReportKind = Parameters<typeof downloadReport>[0];
const reports: {
  id: string;
  titre: string;
  periode: string;
  taille: string;
  pages: number;
  kind: ReportKind;
}[] = [
  {
    id: "rep1",
    titre: "Rapport quotidien",
    periode: "Quotidien",
    taille: "≈ 60 Ko",
    pages: 2,
    kind: "quotidien",
  },
  {
    id: "rep2",
    titre: "Rapport hebdomadaire",
    periode: "Hebdomadaire",
    taille: "≈ 90 Ko",
    pages: 3,
    kind: "hebdomadaire",
  },
  {
    id: "rep3",
    titre: "Rapport mensuel",
    periode: "Mensuel",
    taille: "≈ 140 Ko",
    pages: 5,
    kind: "mensuel",
  },
  {
    id: "rep4",
    titre: "Synthèse cartographique",
    periode: "Cartographie",
    taille: "≈ 90 Ko",
    pages: 3,
    kind: "carte",
  },
  {
    id: "rep5",
    titre: "Rapport stratégique Gouverneur",
    periode: "Stratégique",
    taille: "≈ 160 Ko",
    pages: 6,
    kind: "strategique",
  },
];

function RapportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="border-b border-border bg-kin text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-eco">Reporting</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
            Rapports automatiques
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Génération automatique de rapports quotidiens, hebdomadaires, mensuels, et cartes PDF
            pour le Gouverneur et les Bourgmestres.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-3 sm:grid-cols-3">
          <Tile label="IPK Kinshasa" value={`${IPK_KINSHASA}/100`} />
          <Tile label="Interventions" value={String(INTERVENTIONS.length)} />
          <Tile label="Communes couvertes" value="24" />
        </section>

        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-xl font-bold">Bibliothèque des rapports</h2>
          <ul className="mt-4 divide-y divide-border">
            {reports.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-eco/10 text-eco">
                    {r.periode === "Cartographie" ? (
                      <MapIcon className="size-5" />
                    ) : (
                      <FileText className="size-5" />
                    )}
                  </span>
                  <div>
                    <div className="font-semibold">{r.titre}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.periode} · {r.pages} pages · {r.taille}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => downloadReport(r.kind)}
                  className="inline-flex items-center gap-2 rounded-xl bg-kin px-4 py-2 text-xs font-bold text-white hover:bg-kin/90"
                >
                  <Download className="size-4" /> Télécharger PDF
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
      <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    </div>
  );
}
