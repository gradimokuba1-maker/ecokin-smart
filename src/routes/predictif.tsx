import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AccessGate } from "@/components/access-gate";
import { HOTSPOTS, WEATHER_FORECAST, BLOCKED_DRAINS, MONTHLY_TREND } from "@/lib/data";
import { Brain, TrendingUp, CloudRain } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/predictif")({
  head: () => ({
    meta: [
      { title: "Analyse Prédictive — EcoKin Smart" },
      { name: "description", content: "Prévision des points critiques, déchets et inondations." },
    ],
  }),
  component: () => (
    <AccessGate required={["bourgmestre", "gouverneur"]} title="Analyse prédictive">
      <Page />
    </AccessGate>
  ),
});

function Page() {
  const drainRisks = BLOCKED_DRAINS.map((d) => ({
    name: d.name,
    risque: d.blockedPct,
    futurInondation: Math.min(100, d.blockedPct + (WEATHER_FORECAST[0].rainMm > 30 ? 12 : 4)),
  }));
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-eco">
            <Brain className="size-4" /> Module 4 · Analyse prédictive
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold">Anticiper plutôt que réagir</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            L'IA croise hotspots récurrents, météo et obstruction des caniveaux pour anticiper les
            zones critiques des 7 prochains jours.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { l: "Hotspots actifs", v: HOTSPOTS.length.toString(), d: "Kinshasa" },
            {
              l: "Caniveaux à risque",
              v: BLOCKED_DRAINS.filter((d) => d.blockedPct > 75).length + "",
              d: "obstruction > 75%",
            },
            {
              l: "Pluies 7j",
              v: WEATHER_FORECAST.reduce((s, d) => s + d.rainMm, 0) + " mm",
              d: "cumul prévu",
            },
          ].map((k) => (
            <div key={k.l} className="rounded-2xl border border-border bg-card p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {k.l}
              </div>
              <div className="mt-2 font-display text-3xl font-bold">{k.v}</div>
              <div className="mt-1 text-xs text-muted-foreground">{k.d}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold">
              <TrendingUp className="size-4 text-eco" /> Tendance signalements / collecte
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={MONTHLY_TREND}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="signalements" stroke="#10b981" fill="url(#g1)" />
                  <Area type="monotone" dataKey="collecte" stroke="#0ea5e9" fill="#0ea5e933" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold">
              <CloudRain className="size-4 text-kin" /> Risque d'inondation par caniveau (J+0 → J+7)
            </div>
            <ul className="space-y-2 text-xs">
              {drainRisks.map((d) => (
                <li key={d.name} className="rounded-xl border border-border bg-secondary/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{d.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {d.risque}% → {d.futurInondation}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-600"
                      style={{ width: d.futurInondation + "%" }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-bold">Zones récurrentes de dépôts sauvages</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Recommandation IA : prioriser ces zones lors des prochaines tournées et campagnes IEC.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {HOTSPOTS.map((h) => (
              <div key={h.id} className="rounded-2xl border border-border bg-secondary/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{h.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white ${
                      h.predictedRiskNext7d === "critique"
                        ? "bg-red-500"
                        : h.predictedRiskNext7d === "eleve"
                          ? "bg-orange-500"
                          : h.predictedRiskNext7d === "modere"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                    }`}
                  >
                    {h.predictedRiskNext7d}
                  </span>
                </div>
                <div className="mt-1 text-xs capitalize text-muted-foreground">
                  {h.commune} · {h.recurrence} sig./mois · tendance {h.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
