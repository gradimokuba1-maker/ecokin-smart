import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ClientOnly } from "@/components/client-only";
import { EcoMap } from "@/components/eco-map";
import { AccessGate } from "@/components/access-gate";
import {
  REPORTS,
  COMMUNES,
  HOTSPOTS,
  PRIORITY_ALERTS,
  INTERVENTION_HISTORY,
  COMMUNE_PERFORMANCE,
} from "@/lib/data";
import { Radar, Activity, AlertTriangle, History } from "lucide-react";

export const Route = createFileRoute("/situation")({
  head: () => ({
    meta: [
      { title: "Centre de Situation Urbaine — EcoKin Smart" },
      { name: "description", content: "Centre de situation urbaine en temps réel : incidents, hotspots, urgences." },
    ],
  }),
  component: SituationPage,
});

function SituationPage() {
  return (
    <AccessGate required={["bourgmestre", "gouverneur"]} title="Centre de Situation Urbaine">
      <Content />
    </AccessGate>
  );
}

function Content() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="border-b border-border bg-kin text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-eco">
            <Radar className="size-4" /> Module 1 · Situation temps réel
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold">Centre de Situation Urbaine</h1>
          <p className="mt-1 text-white/70">
            Visualisation en direct des incidents environnementaux et points critiques d'accumulation.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {COMMUNES.map((c) => {
            const perf = COMMUNE_PERFORMANCE[c.id];
            const reports = REPORTS.filter((r) => r.commune === c.id);
            const critiques = reports.filter((r) => r.severity === "critique").length;
            const level = critiques > 4 ? "critique" : critiques > 2 ? "eleve" : "modere";
            const lvlColor = level === "critique" ? "bg-red-500" : level === "eleve" ? "bg-orange-500" : "bg-amber-500";
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Commune
                    </div>
                    <div className="font-display text-xl font-bold">{c.name}</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase text-white ${lvlColor}`}>
                    {level}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <Mini label="Signalements" value={reports.length.toString()} />
                  <Mini label="Critiques" value={critiques.toString()} />
                  <Mini label="IPK" value={perf ? perf.ipk + "" : "—"} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-border bg-card p-2">
            <div className="px-3 pt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Carte temps réel · incidents, dépôts sauvages, caniveaux, hotspots
            </div>
            <div className="mt-2">
              <ClientOnly>
                <EcoMap
                  reports={REPORTS}
                  height={520}
                  showCollection={false}
                  showFloodZones
                  showDumps
                  showDrains
                  showPois
                />
              </ClientOnly>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-red-200 bg-red-500/5 p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-red-600">
                <AlertTriangle className="size-4" /> Alertes prioritaires
              </div>
              <ul className="mt-3 space-y-2">
                {PRIORITY_ALERTS.map((a) => (
                  <li key={a.id} className="rounded-xl bg-card p-3 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-red-600">{a.level}</div>
                    <div className="mt-1 font-semibold">{a.msg}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Activity className="size-4 text-eco" /> Hotspots récurrents
              </div>
              <ul className="mt-3 space-y-2 text-xs">
                {HOTSPOTS.map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-2 border-b border-border/60 pb-1.5">
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{h.name}</div>
                      <div className="capitalize text-muted-foreground">{h.commune} · {h.recurrence}/mois · {h.trend}</div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white ${
                      h.predictedRiskNext7d === "critique" ? "bg-red-500" :
                      h.predictedRiskNext7d === "eleve" ? "bg-orange-500" :
                      h.predictedRiskNext7d === "modere" ? "bg-amber-500" : "bg-emerald-500"
                    }`}>{h.predictedRiskNext7d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-bold">
            <History className="size-4 text-eco" /> Historique des interventions
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2">Date</th>
                  <th>Commune</th>
                  <th>Type</th>
                  <th>Équipe</th>
                  <th>Durée</th>
                  <th>Volume</th>
                </tr>
              </thead>
              <tbody>
                {INTERVENTION_HISTORY.map((i, k) => (
                  <tr key={k} className="border-b border-border/60">
                    <td className="py-2 font-mono text-xs">{i.date}</td>
                    <td className="capitalize">{i.commune}</td>
                    <td className="capitalize">{i.type}</td>
                    <td>{i.equipe}</td>
                    <td>{i.duree_h} h</td>
                    <td>{i.volume_m3} m³</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/40 px-2 py-1.5">
      <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-base font-bold">{value}</div>
    </div>
  );
}
