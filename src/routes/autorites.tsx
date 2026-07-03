import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ClientOnly } from "@/components/client-only";
import { EcoMap } from "@/components/eco-map";
import { AccessGate } from "@/components/access-gate";
import {
  COMMUNES,
  COMMUNE_KPIS,
  MONTHLY_TREND,
  REPORTS,
} from "@/lib/data";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Download, Truck } from "lucide-react";

export const Route = createFileRoute("/autorites")({
  head: () => ({
    meta: [
      { title: "Console Autorités — EcoKin Smart" },
      {
        name: "description",
        content:
          "Tableau de bord décisionnel pour les autorités : signalements, collecte, zones critiques et indicateurs de performance.",
      },
    ],
  }),
  component: () => (
    <AccessGate required={["bourgmestre", "gouverneur", "admin"]} title="Espace Autorités">
      <AutoritesPage />
    </AccessGate>
  ),
});

function AutoritesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="border-b border-border bg-kin text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-eco">Portail autorités</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-display text-4xl font-bold tracking-tight">
              Tableau de bord décisionnel
            </h1>
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-bold hover:bg-white/10">
              <Download className="size-4" /> Rapport mensuel PDF
            </button>
          </div>
          <p className="mt-3 max-w-2xl text-white/70">
            Visualisation en temps réel des signalements, indicateurs par commune et planification
            des interventions prioritaires.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { l: "Signalements actifs", v: "482", d: "+12% vs hier", c: "text-flood" },
            { l: "Tonnes collectées (mois)", v: "124.8", d: "+8% objectif", c: "text-eco" },
            { l: "Taux de recyclage", v: "38.4%", d: "+3.2 pts", c: "text-urban" },
            { l: "Risque inondation", v: "Modéré", d: "Zones basses élevé", c: "text-amber-500" },
          ].map((k) => (
            <div key={k.l} className="rounded-2xl border border-border bg-card p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {k.l}
              </div>
              <div className="mt-2 font-display text-3xl font-bold">{k.v}</div>
              <div className={`mt-1 text-xs font-semibold ${k.c}`}>{k.d}</div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Carte opérationnelle — 3 communes</h2>
              <span className="text-xs font-bold uppercase tracking-widest text-eco">Live</span>
            </div>
            <ClientOnly
              fallback={<div className="h-[420px] rounded-xl bg-secondary" />}
            >
              <EcoMap reports={REPORTS} height={420} />
            </ClientOnly>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
                <Truck className="size-5 text-urban" /> Équipes de collecte
              </h3>
              <ul className="space-y-3 text-sm">
                {[
                  { team: "RASKIN-A1", commune: "Matete", status: "En tournée", color: "bg-eco" },
                  { team: "RASKIN-B2", commune: "Lemba", status: "Disponible", color: "bg-urban" },
                  { team: "RASKIN-C3", commune: "Kisenso", status: "Intervention prio", color: "bg-flood" },
                  { team: "RASKIN-D4", commune: "Matete", status: "Pause", color: "bg-amber-500" },
                ].map((t) => (
                  <li
                    key={t.team}
                    className="flex items-center justify-between rounded-xl border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`size-2.5 rounded-full ${t.color}`} />
                      <div>
                        <div className="font-semibold">{t.team}</div>
                        <div className="text-xs text-muted-foreground">{t.commune}</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold">{t.status}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-flood/30 bg-flood/5 p-5">
              <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-flood">
                <AlertTriangle className="size-5" /> Alerte prioritaire IA
              </h3>
              <p className="text-sm text-foreground/80">
                <b>Kisenso · Av. Mokali</b> — Accumulation critique de plastique sur 320 m. Risque
                d'inondation prédit à 78 %. Intervention recommandée sous 24 h.
              </p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 font-display text-lg font-bold">Évolution mensuelle</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MONTHLY_TREND}>
                  <CartesianGrid stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />
                  <XAxis dataKey="mois" stroke="currentColor" fontSize={12} />
                  <YAxis stroke="currentColor" fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="signalements"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="collecte"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex gap-4 text-xs">
              <Dot color="#10b981" label="Signalements" />
              <Dot color="#0ea5e9" label="Collecte (t)" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 font-display text-lg font-bold">Performance par commune</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={COMMUNES.map((c) => ({
                    name: c.name,
                    Recyclage: COMMUNE_KPIS[c.id].recyclage,
                    Risque: COMMUNE_KPIS[c.id].risque,
                  }))}
                >
                  <CartesianGrid stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="currentColor" fontSize={12} />
                  <YAxis stroke="currentColor" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="Recyclage" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Risque" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent reports table */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 font-display text-lg font-bold">Derniers signalements</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2">ID</th>
                  <th>Commune</th>
                  <th>Type</th>
                  <th>Sévérité</th>
                  <th>Volume</th>
                  <th>Statut</th>
                  <th>Citoyen</th>
                </tr>
              </thead>
              <tbody>
                {REPORTS.slice(0, 12).map((r) => (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="py-2 font-mono text-xs">{r.id}</td>
                    <td className="capitalize">{r.commune}</td>
                    <td className="capitalize">{r.type}</td>
                    <td>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                          r.severity === "critique"
                            ? "bg-flood/15 text-flood"
                            : r.severity === "modere"
                              ? "bg-amber-500/15 text-amber-700"
                              : "bg-eco/15 text-eco"
                        }`}
                      >
                        {r.severity}
                      </span>
                    </td>
                    <td>{r.volumeM3} m³</td>
                    <td className="capitalize text-muted-foreground">{r.status.replace("_", " ")}</td>
                    <td>{r.author}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Dot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-2 rounded-full" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}
