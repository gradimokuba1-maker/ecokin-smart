import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ClientOnly } from "@/components/client-only";
import { EcoMap } from "@/components/eco-map";
import { COMMUNES, REPORTS, TRUCKS, type Commune, type Truck } from "@/lib/data";

export const Route = createFileRoute("/carte")({
  head: () => ({
    meta: [
      { title: "Carte SIG — EcoKin Smart" },
      {
        name: "description",
        content:
          "Cartographie interactive des signalements, points de collecte, centres de recyclage et zones à risque d'inondation à Matete, Lemba et Kisenso.",
      },
    ],
  }),
  component: CartePage,
});

function CartePage() {
  const [focus, setFocus] = useState<Commune["id"] | "all">("all");
  const [showCollection, setShowCollection] = useState(true);
  const [showFlood, setShowFlood] = useState(true);
  const [showWeather, setShowWeather] = useState(true);
  const [showTrucks, setShowTrucks] = useState(true);
  const [sev, setSev] = useState<"all" | "faible" | "modere" | "critique">("all");
  const [trucks, setTrucks] = useState<Truck[]>(TRUCKS);

  // Live GPS simulation
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
          };
        }),
      );
    }, 2500);
    return () => clearInterval(i);
  }, []);

  const filtered = useMemo(
    () =>
      REPORTS.filter((r) => (focus === "all" || r.commune === focus) && (sev === "all" || r.severity === sev)),
    [focus, sev],
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-eco">Module SIG</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
            Cartographie intelligente
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Visualisation en temps réel des signalements, des points de collecte, des centres de
            recyclage et des zones vulnérables aux inondations sur les communes pilotes.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-full bg-secondary p-1">
            {(["all", ...COMMUNES.map((c) => c.id)] as const).map((id) => (
              <button
                key={id}
                onClick={() => setFocus(id)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                  focus === id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {id === "all" ? "3 communes" : COMMUNES.find((c) => c.id === id)?.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-full bg-secondary p-1">
            {(["all", "critique", "modere", "faible"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSev(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  sev === s ? "bg-foreground text-background" : "text-muted-foreground"
                }`}
              >
                {s === "all" ? "Toute sévérité" : s}
              </button>
            ))}
          </div>
          <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-xs font-semibold">
            <input
              type="checkbox"
              checked={showCollection}
              onChange={(e) => setShowCollection(e.target.checked)}
              className="accent-eco"
            />
            Points de collecte
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold">
            <input
              type="checkbox"
              checked={showFlood}
              onChange={(e) => setShowFlood(e.target.checked)}
              className="accent-flood"
            />
            Zones inondation
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold">
            <input type="checkbox" checked={showWeather} onChange={(e) => setShowWeather(e.target.checked)} className="accent-kin" />
            Météo & alerte pluie
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold">
            <input type="checkbox" checked={showTrucks} onChange={(e) => setShowTrucks(e.target.checked)} className="accent-eco" />
            Camions GPS
          </label>
        </div>

        <ClientOnly
          fallback={
            <div className="grid h-[600px] place-items-center rounded-2xl border border-border bg-secondary text-sm text-muted-foreground">
              Chargement de la carte…
            </div>
          }
        >
          <EcoMap
            reports={filtered}
            height={620}
            focusCommune={focus}
            showCollection={showCollection}
            showFloodZones={showFlood}
            showWeather={showWeather}
            trucks={showTrucks ? trucks : []}
          />
        </ClientOnly>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Legend color="#ef4444" label="Sévérité critique" />
          <Legend color="#f59e0b" label="Sévérité modérée" />
          <Legend color="#10b981" label="Sévérité faible" />
          <Legend color="#0ea5e9" label="Point de collecte / recyclage" square />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Legend({ color, label, square }: { color: string; label: string; square?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <span
        className={`size-4 ${square ? "rounded-md" : "rounded-full"}`}
        style={{ background: color }}
      />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
