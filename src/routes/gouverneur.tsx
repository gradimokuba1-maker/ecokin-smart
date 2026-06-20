import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ClientOnly } from "@/components/client-only";
import { EcoMap } from "@/components/eco-map";
import { useEffect, useState } from "react";
import {
  AI_RECOMMENDATIONS,
  COMMUNES,
  COMMUNE_BUDGET,
  COMMUNE_KPIS,
  IPK,
  IPK_KINSHASA,
  INTERVENTIONS,
  PRIORITY_ALERTS,
  REPORTS,
  TRUCKS,
  WEATHER_FORECAST,
  type Truck,
} from "@/lib/data";
import {
  AlertTriangle,
  CloudRain,
  Cloud,
  CloudLightning,
  Sun,
  Truck as TruckIcon,
  Activity,
  Gauge,
  Banknote,
  Brain,
  ShieldAlert,
} from "lucide-react";

export const Route = createFileRoute("/gouverneur")({
  head: () => ({
    meta: [
      { title: "Centre de Commandement du Gouverneur — EcoKin Smart" },
      {
        name: "description",
        content:
          "Tableau de bord stratégique de la Ville de Kinshasa : propreté, risque d'inondation, IPK, flotte GPS, alertes et budget des opérations.",
      },
    ],
  }),
  component: GouverneurPage,
});

const ICONS = { sun: Sun, cloud: Cloud, rain: CloudRain, storm: CloudLightning };
const riskColor = (lvl: string) =>
  lvl === "critique" ? "bg-red-500" : lvl === "eleve" ? "bg-orange-500" : lvl === "modere" ? "bg-amber-500" : "bg-emerald-500";

function GouverneurPage() {
  const [trucks, setTrucks] = useState<Truck[]>(TRUCKS);

  // Simulate live GPS
  useEffect(() => {
    const i = setInterval(() => {
      setTrucks((prev) =>
        prev.map((t) => {
          if (t.status === "pause" || t.status === "depot") return t;
          const j = 0.0006;
          return {
            ...t,
            lat: t.lat + (Math.random() - 0.5) * j,
            lng: t.lng + (Math.random() - 0.5) * j,
            speedKmh: Math.max(0, Math.round(t.speedKmh + (Math.random() - 0.5) * 6)),
            loadPct: Math.min(100, t.loadPct + (t.status === "collecte" ? 1 : 0)),
          };
        }),
      );
    }, 2500);
    return () => clearInterval(i);
  }, []);

  const totalInter = INTERVENTIONS.length;
  const inCours = INTERVENTIONS.filter((i) => i.status === "en_cours").length;
  const totalBudget = Object.values(COMMUNE_BUDGET).reduce((s, b) => s + b.mensuel, 0);
  const trucksActive = trucks.filter((t) => t.status !== "pause").length;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <header className="border-b border-border bg-gradient-to-br from-[#0b1f3a] via-[#0e2a4d] to-[#0f3b2a] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-eco">
            Hôtel de Ville · République Démocratique du Congo
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Centre de Commandement du Gouverneur
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/70">
                Pilotage opérationnel de la propreté, des risques d'inondation et des interventions
                sur l'ensemble des communes pilotes de Kinshasa.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-right">
                <div className="text-[10px] uppercase tracking-widest text-white/60">IPK Kinshasa</div>
                <div className="font-display text-3xl font-bold text-eco">{IPK_KINSHASA}<span className="text-sm text-white/50">/100</span></div>
              </div>
            </div>
          </div>

          {/* Priority alerts strip */}
          <div className="mt-6 flex flex-wrap gap-2">
            {PRIORITY_ALERTS.map((a) => (
              <span
                key={a.id}
                className={`inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold ${
                  a.level === "critique"
                    ? "bg-red-500/20 text-red-200"
                    : a.level === "eleve"
                    ? "bg-orange-500/20 text-orange-200"
                    : "bg-amber-500/20 text-amber-200"
                }`}
              >
                <ShieldAlert className="size-3.5" />
                {a.msg}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* Strategic KPIs */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={<Gauge />} label="État propreté" value={`${IPK_KINSHASA}/100`} sub="Indice moyen" tone="eco" />
          <KpiCard icon={<Activity />} label="Interventions" value={String(totalInter)} sub={`${inCours} en cours`} tone="kin" />
          <KpiCard icon={<TruckIcon />} label="Camions actifs" value={`${trucksActive}/${trucks.length}`} sub="Flotte GPS" tone="kin" />
          <KpiCard icon={<Banknote />} label="Budget mensuel" value={`${(totalBudget / 1_000_000).toFixed(1)} M CDF`} sub="3 communes" tone="eco" />
        </section>

        {/* Map + AI engine */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="overflow-hidden rounded-3xl border border-border bg-card lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Carte SIG temps réel
                </div>
                <h2 className="font-display text-xl font-bold">Déchets, caniveaux, flotte & équipements</h2>
              </div>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-2 animate-pulse rounded-full bg-eco" /> Live
              </span>
            </div>
            <ClientOnly fallback={<div className="h-[480px] animate-pulse bg-muted" />}>
              <EcoMap
                reports={REPORTS}
                trucks={trucks}
                showPois
                showDumps
                showDrains
                showRoads
                showRivers
                showFloodZones
                showCollection
                height={480}
              />
            </ClientOnly>
            <div className="flex flex-wrap gap-3 border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
              <Legend color="#ef4444" label="Critique" />
              <Legend color="#b45309" label="Décharge sauvage" />
              <Legend color="#f97316" label="Caniveau obstrué" />
              <Legend color="#0ea5e9" label="Rivière / collecte" />
              <Legend color="#6366f1" label="École" />
              <Legend color="#ef4444" label="Hôpital" />
              <Legend color="#a855f7" label="Marché" />
              <Legend color="#10b981" label="Camion en collecte" />
            </div>
          </div>

          {/* AI decision engine */}
          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-eco/10 text-eco"><Brain className="size-5" /></span>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Moteur d'aide à la décision</div>
                <h3 className="font-display text-lg font-bold">Plan d'action recommandé</h3>
              </div>
            </div>
            <ul className="mt-4 space-y-3">
              {AI_RECOMMENDATIONS.map((r) => (
                <li key={r.id} className="rounded-2xl border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-eco/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-eco">
                      Priorité {r.priorite}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{r.commune}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold">{r.titre}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{r.motif}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    <span className="rounded-full bg-muted px-2 py-0.5">🚛 {r.camions} camions</span>
                    <span className="rounded-full bg-muted px-2 py-0.5">👥 {r.equipes} équipes</span>
                    <span className="rounded-full bg-muted px-2 py-0.5">⏱ {r.eta}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Weather + IPK */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Météo & alerte pluie</div>
                <h3 className="font-display text-lg font-bold">Prévision 7 jours · risque d'inondation</h3>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-600">
                <AlertTriangle className="size-3.5" /> Alerte pluie 48 h
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-7">
              {WEATHER_FORECAST.map((d) => {
                const Icon = ICONS[d.icon];
                return (
                  <div key={d.day} className="rounded-2xl border border-border bg-background p-3 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{d.day}</div>
                    <Icon className="mx-auto mt-2 size-6 text-kin" />
                    <div className="mt-1 text-sm font-bold">{d.tempC}°C</div>
                    <div className="text-[11px] text-muted-foreground">{d.rainMm} mm</div>
                    <span className={`mt-2 inline-block h-1.5 w-8 rounded-full ${riskColor(d.floodRisk)}`} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Indice de Propreté de Kinshasa</div>
            <h3 className="font-display text-lg font-bold">IPK par commune</h3>
            <ul className="mt-4 space-y-3">
              {COMMUNES.map((c) => {
                const ipk = IPK[c.id];
                const tone = ipk.score >= 70 ? "bg-emerald-500" : ipk.score >= 55 ? "bg-amber-500" : "bg-red-500";
                return (
                  <li key={c.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">{c.name}</span>
                      <span className="font-bold">
                        {ipk.score}<span className="text-xs text-muted-foreground">/100</span>{" "}
                        <span className={ipk.trend >= 0 ? "text-emerald-600" : "text-red-600"}>
                          {ipk.trend >= 0 ? "▲" : "▼"} {Math.abs(ipk.trend)}
                        </span>
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full ${tone}`} style={{ width: `${ipk.score}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Commune performance + budget */}
        <section className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Performance & budget</div>
              <h3 className="font-display text-lg font-bold">Indice par commune & coûts opérationnels</h3>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="py-2">Commune</th>
                  <th>IPK</th>
                  <th>Signalements</th>
                  <th>Collecte (t)</th>
                  <th>Recyclage</th>
                  <th>Risque</th>
                  <th>Budget hebdo</th>
                  <th>Coût/t</th>
                </tr>
              </thead>
              <tbody>
                {COMMUNES.map((c) => {
                  const k = COMMUNE_KPIS[c.id];
                  const b = COMMUNE_BUDGET[c.id];
                  const ipk = IPK[c.id];
                  return (
                    <tr key={c.id} className="border-t border-border">
                      <td className="py-3 font-semibold">{c.name}</td>
                      <td className="font-bold">{ipk.score}/100</td>
                      <td>{k.signalements}</td>
                      <td>{k.collecte_t}</td>
                      <td>{k.recyclage}%</td>
                      <td>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold text-white ${k.risque >= 50 ? "bg-red-500" : k.risque >= 30 ? "bg-amber-500" : "bg-emerald-500"}`}>
                          {k.risque}%
                        </span>
                      </td>
                      <td>{(b.hebdo / 1_000_000).toFixed(1)} M CDF</td>
                      <td>{(b.cout_tonne / 1000).toFixed(0)}k CDF</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Truck fleet */}
        <section className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Flotte GPS</div>
              <h3 className="font-display text-lg font-bold">Suivi temps réel des camions</h3>
            </div>
            <span className="text-xs text-muted-foreground">Mise à jour 2,5 s</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trucks.map((t) => (
              <div key={t.id} className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-base font-bold">{t.id}</span>
                  <StatusPill status={t.status} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{t.plate} · {t.driver}</div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span>Charge</span><span className="font-bold">{t.loadPct}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${t.loadPct > 85 ? "bg-red-500" : "bg-eco"}`} style={{ width: `${t.loadPct}%` }} />
                </div>
                <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
                  <span>{t.speedKmh} km/h</span>
                  <span>{t.lat.toFixed(4)}, {t.lng.toFixed(4)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function KpiCard({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub: string; tone: "eco" | "kin" }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className={`grid size-10 place-items-center rounded-2xl ${tone === "eco" ? "bg-eco/10 text-eco" : "bg-kin/10 text-kin"}`}>{icon}</span>
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      </div>
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-2.5 rounded-full" style={{ background: color }} /> {label}
    </span>
  );
}

function StatusPill({ status }: { status: Truck["status"] }) {
  const map: Record<Truck["status"], string> = {
    collecte: "bg-emerald-500/15 text-emerald-700",
    en_route: "bg-sky-500/15 text-sky-700",
    depot: "bg-indigo-500/15 text-indigo-700",
    pause: "bg-slate-500/15 text-slate-700",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${map[status]}`}>{status}</span>;
}
