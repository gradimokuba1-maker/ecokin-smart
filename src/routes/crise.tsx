import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AccessGate } from "@/components/access-gate";
import {
  WEATHER_FORECAST,
  AI_RECOMMENDATIONS,
  HOTSPOTS,
  TRUCKS,
  PRIORITY_ALERTS,
} from "@/lib/data";
import {
  useLiveReports,
  URGENCY_META,
  STATUS_META,
  TEAMS_LIST,
  type LiveStatus,
} from "@/lib/live-reports";
import { useAccess } from "@/lib/access-store";
import { Siren, Truck, MapPin, Users, CheckCircle2 } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/crise")({
  head: () => ({
    meta: [
      { title: "Salle de Crise Environnementale — EcoKin Smart" },
      {
        name: "description",
        content:
          "Activation automatique en cas d'urgence : zones prioritaires, ressources, itinéraires.",
      },
    ],
  }),
  component: () => (
    <AccessGate required={["gouverneur"]} title="Salle de Crise Environnementale">
      <Page />
    </AccessGate>
  ),
});

function Page() {
  const w = WEATHER_FORECAST[0];
  const active = !!w && (w.floodRisk === "critique" || w.floodRisk === "eleve");
  const { items, ack, assign, setStatus } = useLiveReports();
  const { session } = useAccess();

  const stats = useMemo(() => {
    const byUrg = { faible: 0, moyen: 0, eleve: 0, critique: 0 };
    let unack = 0;
    for (const it of items) {
      byUrg[it.urgency]++;
      if (!it.ack) unack++;
    }
    return { byUrg, unack, total: items.length };
  }, [items]);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className={`border-b ${active ? "bg-red-600 text-white" : "bg-secondary/40"}`}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${active ? "text-white" : "text-eco"}`}
          >
            <Siren className="size-4 animate-pulse" /> Module 7 · Salle de crise
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold">
            {active ? "🚨 CRISE ACTIVÉE" : "Veille environnementale"}
          </h1>
          <p
            className={`mt-1 max-w-2xl text-sm ${active ? "text-white/80" : "text-muted-foreground"}`}
          >
            {active
              ? `Pluies ${w.rainMm} mm prévues — risque d'inondation ${w.floodRisk} sur Kinshasa. Plan d'urgence activé automatiquement.`
              : "Aucun déclencheur critique. La salle s'active automatiquement en cas de fortes pluies, inondations ou décharges majeures."}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        {/* Flux temps réel + acquittement */}
        <section className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/40 px-5 py-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-eco">
                Flux temps réel
              </div>
              <h2 className="font-display text-lg font-bold">Signalements citoyens & alertes</h2>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <Badge label="Total" v={stats.total} />
              <Badge label="Non acquittés" v={stats.unack} tone="red" />
              <Badge label="Critique" v={stats.byUrg.critique} tone="red" />
              <Badge label="Élevé" v={stats.byUrg.eleve} tone="orange" />
              <Badge label="Moyen" v={stats.byUrg.moyen} tone="amber" />
              <Badge label="Faible" v={stats.byUrg.faible} tone="green" />
            </div>
          </div>
          <div className="max-h-[520px] divide-y divide-border overflow-y-auto">
            {items.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Aucun signalement en direct. Les nouveaux signalements citoyens apparaîtront ici
                instantanément.
              </div>
            )}
            {items.map((r) => {
              const u = URGENCY_META[r.urgency];
              const s = STATUS_META[r.status];
              return (
                <article
                  key={r.id}
                  className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-start"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${u.bg} ${u.color}`}
                      >
                        {u.label}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${s.color}`}
                      >
                        {s.label}
                      </span>
                      {r.ack && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                          <CheckCircle2 className="size-3" /> Acquitté
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-muted-foreground">{r.id}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-semibold capitalize">
                      {r.category} · {r.commune}
                      {r.priorityScore !== undefined && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          Score {r.priorityScore}/100
                        </span>
                      )}
                    </div>
                    {r.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{r.description}</p>
                    )}
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Par <b>{r.author}</b>
                      {r.lat !== undefined && (
                        <>
                          {" "}
                          ·{" "}
                          <span className="font-mono">
                            {r.lat.toFixed(4)}, {r.lng!.toFixed(4)}
                          </span>
                        </>
                      )}
                      {r.team && (
                        <>
                          {" "}
                          · Équipe : <b>{r.team}</b>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:min-w-[220px]">
                    {!r.ack && (
                      <button
                        onClick={() => ack(r.id, session.name)}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700"
                      >
                        ✓ Acquitter l'alerte
                      </button>
                    )}
                    <select
                      value={r.team ?? ""}
                      onChange={(e) => e.target.value && assign(r.id, e.target.value, session.name)}
                      className="rounded-lg border border-border bg-background px-2 py-1.5 text-[11px]"
                    >
                      <option value="">Assigner une équipe…</option>
                      {TEAMS_LIST.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <select
                      value={r.status}
                      onChange={(e) => setStatus(r.id, e.target.value as LiveStatus, session.name)}
                      className="rounded-lg border border-border bg-background px-2 py-1.5 text-[11px]"
                    >
                      {Object.entries(STATUS_META).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-bold">
              <MapPin className="size-4 text-red-500" /> Zones prioritaires
            </div>
            <ul className="mt-3 space-y-2 text-xs">
              {HOTSPOTS.filter(
                (h) => h.predictedRiskNext7d === "critique" || h.predictedRiskNext7d === "eleve",
              ).map((h) => (
                <li key={h.id} className="rounded-lg bg-secondary/40 p-2">
                  <div className="font-semibold">{h.name}</div>
                  <div className="capitalize text-muted-foreground">
                    {h.commune} · {h.predictedRiskNext7d}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Truck className="size-4 text-eco" /> Ressources mobilisables
            </div>
            <ul className="mt-3 space-y-2 text-xs">
              <li className="flex justify-between">
                <span>Camions disponibles</span>
                <b>{TRUCKS.length}</b>
              </li>
              <li className="flex justify-between">
                <span>Camions en collecte</span>
                <b>{TRUCKS.filter((t) => t.status === "collecte").length}</b>
              </li>
              <li className="flex justify-between">
                <span>Équipes d'urgence</span>
                <b>4</b>
              </li>
              <li className="flex justify-between">
                <span>Stock pompes mobiles</span>
                <b>6</b>
              </li>
              <li className="flex justify-between">
                <span>Sacs anti-inondation</span>
                <b>1 200</b>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Users className="size-4 text-kin" /> Cellules activées
            </div>
            <ul className="mt-3 space-y-1.5 text-xs">
              <li>✅ Cabinet du Gouverneur</li>
              <li>✅ Bourgmestres des 24 communes</li>
              <li>✅ Direction Urbanisme</li>
              <li>✅ Croix-Rouge RDC</li>
              <li>⌛ Protection civile (à confirmer)</li>
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-bold">Plan d'action recommandé par l'IA</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Itinéraires d'intervention optimisés selon la gravité et la proximité des hotspots.
          </p>
          <div className="mt-4 space-y-3">
            {AI_RECOMMENDATIONS.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-secondary/30 p-4"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-500 font-display text-lg font-bold text-white">
                  {r.priorite}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{r.titre}</div>
                  <div className="text-xs text-muted-foreground">{r.motif}</div>
                </div>
                <div className="text-right text-xs">
                  <div>
                    🚛 {r.camions} · 👷 {r.equipes}
                  </div>
                  <div className="font-bold text-eco">{r.eta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-kin p-6 text-white">
          <h3 className="font-display text-lg font-bold">Alertes prioritaires diffusées</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {PRIORITY_ALERTS.map((a) => (
              <li key={a.id} className="rounded-xl bg-white/5 p-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-eco">
                  {a.level}
                </div>
                <div className="mt-1">{a.msg}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function Badge({
  label,
  v,
  tone,
}: {
  label: string;
  v: number;
  tone?: "red" | "orange" | "amber" | "green";
}) {
  const cls =
    tone === "red"
      ? "bg-red-500/15 text-red-700"
      : tone === "orange"
        ? "bg-orange-500/15 text-orange-700"
        : tone === "amber"
          ? "bg-amber-500/15 text-amber-700"
          : tone === "green"
            ? "bg-emerald-500/15 text-emerald-700"
            : "bg-muted text-foreground";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold ${cls}`}>
      {label} <b className="font-mono">{v}</b>
    </span>
  );
}
