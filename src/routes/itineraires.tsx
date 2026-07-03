import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AccessGate } from "@/components/access-gate";
import { ClientOnly } from "@/components/client-only";
import { FleetMap } from "@/components/fleet-map";
import { useFleet, optimizeRoute, routeDistanceKm } from "@/lib/fleet-gps";
import { COLLECTION_POINTS } from "@/lib/data";
import { Fuel, MapPin, Route as RouteIcon, Sparkles, Timer, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/itineraires")({
  head: () => ({
    meta: [
      { title: "Cartographie intelligente des itinéraires — EcoKin Smart" },
      { name: "description", content: "Planification et optimisation IA des tournées de collecte : itinéraires, points de collecte, distances et coûts de carburant." },
    ],
  }),
  component: () => (
    <AccessGate required={["bourgmestre", "gouverneur", "admin"]} title="Itinéraires intelligents">
      <ItinerairesPage />
    </AccessGate>
  ),
});

function ItinerairesPage() {
  const { vehicles, setRoute } = useFleet(6000);
  const [selected, setSelected] = useState<string | undefined>(vehicles[0]?.id);
  const active = vehicles.find((v) => v.id === selected) ?? vehicles[0];

  const stats = useMemo(() => {
    const totalKm = vehicles.reduce((s, v) => s + routeDistanceKm(v.route), 0);
    const optKm = vehicles.reduce((s, v) => s + routeDistanceKm(optimizeRoute(v.route, v.route[0])), 0);
    const saved = Math.max(0, totalKm - optKm);
    const fuelSaved = saved * 0.35; // L/km approx
    return { totalKm, optKm, saved, fuelSaved };
  }, [vehicles]);

  function optimize(id: string) {
    const v = vehicles.find((x) => x.id === id);
    if (!v) return;
    setRoute(id, optimizeRoute(v.route, [v.current.lat, v.current.lng]));
  }

  function addCollectionPoint(id: string, lat: number, lng: number) {
    const v = vehicles.find((x) => x.id === id);
    if (!v) return;
    setRoute(id, [...v.route, [lat, lng]]);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="border-b border-border bg-kin text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-eco">SIG · Planification</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Cartographie intelligente des itinéraires</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Planifiez les tournées, ajoutez des arrêts et optimisez automatiquement les parcours grâce à l'IA
            pour réduire le temps de déplacement et le coût de carburant.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-4">
          <Tile icon={<RouteIcon className="size-4" />} label="Distance totale" value={`${stats.totalKm.toFixed(1)} km`} />
          <Tile icon={<Sparkles className="size-4" />} label="Après optimisation IA" value={`${stats.optKm.toFixed(1)} km`} />
          <Tile icon={<TrendingDown className="size-4" />} label="Économie" value={`${stats.saved.toFixed(1)} km`} />
          <Tile icon={<Fuel className="size-4" />} label="Carburant économisé" value={`${stats.fuelSaved.toFixed(1)} L`} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="border-b border-border px-5 py-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vue SIG</div>
              <h2 className="font-display text-lg font-bold">Itinéraires planifiés &amp; tournées en cours</h2>
            </div>
            <ClientOnly fallback={<div className="h-[520px] animate-pulse bg-muted" />}>
              <FleetMap vehicles={vehicles} selectedId={selected} onSelect={setSelected} height={520} />
            </ClientOnly>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5">
              <h3 className="font-display text-lg font-bold">Véhicules</h3>
              <ul className="mt-3 space-y-2">
                {vehicles.map((v) => (
                  <li key={v.id}>
                    <button
                      onClick={() => setSelected(v.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${
                        selected === v.id ? "border-eco bg-eco/5" : "border-border bg-background hover:bg-secondary"
                      }`}
                    >
                      <span>
                        <span className="font-bold">{v.id}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{v.commune} · {v.driver}</span>
                      </span>
                      <span className="text-xs font-semibold">{routeDistanceKm(v.route).toFixed(1)} km</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {active && (
              <div className="rounded-3xl border border-border bg-card p-5">
                <h3 className="font-display text-lg font-bold">{active.id} — itinéraire</h3>
                <div className="mt-2 text-xs text-muted-foreground">
                  {active.route.length} arrêt(s) · {routeDistanceKm(active.route).toFixed(1)} km
                </div>
                <ol className="mt-3 space-y-1 text-xs">
                  {active.route.map((p, i) => (
                    <li key={i} className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5">
                      <span className="grid size-5 place-items-center rounded-full bg-eco text-[10px] font-bold text-white">{i + 1}</span>
                      <span>{p[0].toFixed(4)}, {p[1].toFixed(4)}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => optimize(active.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-eco px-3 py-1.5 text-xs font-bold text-white hover:bg-eco/90"
                  >
                    <Sparkles className="size-3" /> Optimiser par IA
                  </button>
                </div>

                <div className="mt-4 border-t border-border pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ajouter un point de collecte</div>
                  <ul className="mt-2 max-h-40 space-y-1 overflow-auto text-xs">
                    {COLLECTION_POINTS.map((cp) => (
                      <li key={cp.id}>
                        <button
                          onClick={() => addCollectionPoint(active.id, cp.lat, cp.lng)}
                          className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-2 py-1.5 hover:bg-secondary"
                        >
                          <span><MapPin className="mr-1 inline size-3 text-eco" />{cp.name}</span>
                          <span className="text-[10px] uppercase text-muted-foreground">{cp.kind}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-bold">Statistiques de tournées</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2">Véhicule</th>
                  <th>Commune</th>
                  <th>Arrêts</th>
                  <th>Distance planifiée</th>
                  <th>Distance optimisée</th>
                  <th>Économie</th>
                  <th>Vitesse moy.</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => {
                  const p = routeDistanceKm(v.route);
                  const o = routeDistanceKm(optimizeRoute(v.route, v.route[0]));
                  const avg = v.track.length ? v.track.reduce((s, f) => s + f.speedKmh, 0) / v.track.length : v.current.speedKmh;
                  return (
                    <tr key={v.id} className="border-t border-border">
                      <td className="py-2 font-semibold">{v.id}</td>
                      <td>{v.commune}</td>
                      <td>{v.route.length}</td>
                      <td>{p.toFixed(2)} km</td>
                      <td>{o.toFixed(2)} km</td>
                      <td className="text-eco font-semibold">{Math.max(0, p - o).toFixed(2)} km</td>
                      <td><Timer className="mr-1 inline size-3" />{Math.round(avg)} km/h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Tile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-eco/10 text-eco">{icon}</span>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      </div>
      <div className="mt-2 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}
