import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ClientOnly } from "@/components/client-only";
import { EcoMap } from "@/components/eco-map";
import { useEffect, useState } from "react";
import { INTERVENTIONS, TRUCKS, type Intervention, type Truck } from "@/lib/data";
import { Camera, MapPin, Users } from "lucide-react";

export const Route = createFileRoute("/interventions")({
  head: () => ({
    meta: [
      { title: "Gestion des interventions — EcoKin Smart" },
      { name: "description", content: "Affectation des équipes, suivi GPS des camions et validation par photo avant/après." },
    ],
  }),
  component: InterventionsPage,
});

const typeLabel: Record<Intervention["type"], string> = {
  collecte: "Collecte",
  curage: "Curage",
  sensibilisation: "Sensibilisation",
  urgence: "Urgence",
};

function InterventionsPage() {
  const [trucks, setTrucks] = useState<Truck[]>(TRUCKS);
  const [items, setItems] = useState<Intervention[]>(INTERVENTIONS);

  useEffect(() => {
    const i = setInterval(() => {
      setTrucks((prev) =>
        prev.map((t) =>
          t.status === "pause" || t.status === "depot"
            ? t
            : { ...t, lat: t.lat + (Math.random() - 0.5) * 0.0008, lng: t.lng + (Math.random() - 0.5) * 0.0008 },
        ),
      );
    }, 2500);
    return () => clearInterval(i);
  }, []);

  function advance(id: string) {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              status: it.status === "planifiee" ? "en_cours" : it.status === "en_cours" ? "terminee" : "terminee",
              beforePhoto: it.beforePhoto ?? "x",
              afterPhoto: it.status === "en_cours" ? "x" : it.afterPhoto,
            }
          : it,
      ),
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="border-b border-border bg-kin text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-eco">Opérations</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Gestion des interventions</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Affectation des équipes, suivi GPS de la flotte et validation par photo avant/après.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-border bg-card lg:col-span-2">
          <div className="border-b border-border px-5 py-4">
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Carte temps réel</div>
            <h2 className="font-display text-xl font-bold">Suivi GPS de la flotte</h2>
          </div>
          <ClientOnly fallback={<div className="h-[480px] animate-pulse bg-muted" />}>
            <EcoMap trucks={trucks} showRoads showRivers showCollection height={480} />
          </ClientOnly>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-bold">Camions actifs</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {trucks.map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2">
                <span className="font-semibold">{t.id} <span className="text-xs text-muted-foreground">· {t.driver}</span></span>
                <span className="text-xs">{t.status} · {t.loadPct}%</span>
              </li>
            ))}
          </ul>
        </div>

        <section className="rounded-3xl border border-border bg-card p-5 lg:col-span-3">
          <h2 className="font-display text-xl font-bold">Interventions planifiées & en cours</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {items.map((it) => (
              <article key={it.id} className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-base font-bold">{it.id}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                    it.status === "terminee" ? "bg-emerald-500/15 text-emerald-700"
                    : it.status === "en_cours" ? "bg-amber-500/15 text-amber-700"
                    : "bg-slate-500/15 text-slate-700"
                  }`}>{it.status}</span>
                </div>
                <div className="mt-1 text-sm">
                  <span className="font-semibold">{typeLabel[it.type]}</span> · {it.commune}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{it.notes}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Users className="size-3" /> {it.team}</span>
                  {it.truckId && <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {it.truckId}</span>}
                  <span>{it.scheduledAt}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className={`flex h-12 flex-1 items-center justify-center rounded-lg border border-dashed text-[11px] ${it.beforePhoto ? "border-eco/40 bg-eco/5 text-eco" : "border-border text-muted-foreground"}`}>
                    <Camera className="mr-1 size-3" /> {it.beforePhoto ? "Avant ✓" : "Photo avant"}
                  </div>
                  <div className={`flex h-12 flex-1 items-center justify-center rounded-lg border border-dashed text-[11px] ${it.afterPhoto ? "border-eco/40 bg-eco/5 text-eco" : "border-border text-muted-foreground"}`}>
                    <Camera className="mr-1 size-3" /> {it.afterPhoto ? "Après ✓" : "Photo après"}
                  </div>
                </div>
                {it.status !== "terminee" && (
                  <button
                    onClick={() => advance(it.id)}
                    className="mt-3 w-full rounded-xl bg-eco px-3 py-2 text-xs font-bold text-white hover:bg-eco/90"
                  >
                    {it.status === "planifiee" ? "Démarrer l'intervention" : "Valider & clôturer"}
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
