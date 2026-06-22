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
import { Siren, Truck, MapPin, Users } from "lucide-react";

export const Route = createFileRoute("/crise")({
  head: () => ({
    meta: [
      { title: "Salle de Crise Environnementale — EcoKin Smart" },
      { name: "description", content: "Activation automatique en cas d'urgence : zones prioritaires, ressources, itinéraires." },
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
  const active = w.floodRisk === "critique" || w.floodRisk === "eleve";
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className={`border-b ${active ? "bg-red-600 text-white" : "bg-secondary/40"}`}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${active ? "text-white" : "text-eco"}`}>
            <Siren className="size-4 animate-pulse" /> Module 7 · Salle de crise
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold">
            {active ? "🚨 CRISE ACTIVÉE" : "Veille environnementale"}
          </h1>
          <p className={`mt-1 max-w-2xl ${active ? "text-white/80" : "text-muted-foreground"}`}>
            {active
              ? `Pluies ${w.rainMm} mm prévues — risque d'inondation ${w.floodRisk} sur Kinshasa. Plan d'urgence activé automatiquement.`
              : "Aucun déclencheur critique. La salle s'active automatiquement en cas de fortes pluies, inondations ou décharges majeures."}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-bold">
              <MapPin className="size-4 text-red-500" /> Zones prioritaires
            </div>
            <ul className="mt-3 space-y-2 text-xs">
              {HOTSPOTS.filter((h) => h.predictedRiskNext7d === "critique" || h.predictedRiskNext7d === "eleve").map((h) => (
                <li key={h.id} className="rounded-lg bg-secondary/40 p-2">
                  <div className="font-semibold">{h.name}</div>
                  <div className="capitalize text-muted-foreground">{h.commune} · {h.predictedRiskNext7d}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Truck className="size-4 text-eco" /> Ressources mobilisables
            </div>
            <ul className="mt-3 space-y-2 text-xs">
              <li className="flex justify-between"><span>Camions disponibles</span><b>{TRUCKS.length}</b></li>
              <li className="flex justify-between"><span>Camions en collecte</span><b>{TRUCKS.filter(t=>t.status==="collecte").length}</b></li>
              <li className="flex justify-between"><span>Équipes d'urgence</span><b>4</b></li>
              <li className="flex justify-between"><span>Stock pompes mobiles</span><b>6</b></li>
              <li className="flex justify-between"><span>Sacs anti-inondation</span><b>1 200</b></li>
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Users className="size-4 text-kin" /> Cellules activées
            </div>
            <ul className="mt-3 space-y-1.5 text-xs">
              <li>✅ Cabinet du Gouverneur</li>
              <li>✅ Bourgmestre Kisenso</li>
              <li>✅ Bourgmestre Lemba</li>
              <li>✅ Bourgmestre Matete</li>
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
              <div key={r.id} className="flex items-center gap-4 rounded-2xl border border-border bg-secondary/30 p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-500 font-display text-lg font-bold text-white">
                  {r.priorite}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{r.titre}</div>
                  <div className="text-xs text-muted-foreground">{r.motif}</div>
                </div>
                <div className="text-right text-xs">
                  <div>🚛 {r.camions} · 👷 {r.equipes}</div>
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
                <div className="text-[10px] font-bold uppercase tracking-widest text-eco">{a.level}</div>
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
