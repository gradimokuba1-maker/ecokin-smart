import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ClientOnly } from "@/components/client-only";
import { KinshasaMap, type MapReport } from "@/components/kinshasa-map";
import { REPORTS } from "@/lib/data";
import { DEFAULT_CITY } from "@/lib/cities";
import { useLiveReports } from "@/lib/live-reports";

export const Route = createFileRoute("/carte")({
  head: () => ({
    meta: [
      { title: "Carte SIG Kinshasa — EcoKin Smart" },
      {
        name: "description",
        content:
          "Cartographie SIG interactive des 24 communes de Kinshasa : signalements en temps réel, clustering, géolocalisation citoyenne et recherche de lieux.",
      },
    ],
  }),
  component: CartePage,
});

type Status = "all" | "nouveau" | "en_cours" | "collecte" | "resolu";

function CartePage() {
  const { items: live } = useLiveReports();
  const [status, setStatus] = useState<Status>("all");

  const all: MapReport[] = useMemo(() => {
    const seed: MapReport[] = REPORTS.map((r) => ({
      id: r.id,
      lat: r.lat,
      lng: r.lng,
      category: r.type,
      status: r.status === "nouveau" ? "nouveau" : r.status === "en_cours" ? "en_cours" : "resolu",
      createdAt: r.createdAt,
      description: r.description,
      commune: r.commune,
      priorityScore: undefined,
    }));
    const liveMapped: MapReport[] = live
      .filter((l) => l.lat != null && l.lng != null)
      .map((l) => ({
        id: l.id,
        lat: l.lat!,
        lng: l.lng!,
        category: l.category,
        status:
          l.status === "en_attente"
            ? "nouveau"
            : l.status === "assignee"
              ? "en_cours"
              : l.status === "en_cours"
                ? "en_cours"
                : "resolu",
        createdAt: l.createdAt,
        description: l.description,
        commune: l.commune,
        priorityScore: l.priorityScore,
      }));
    return [...liveMapped, ...seed];
  }, [live]);

  const filtered = useMemo(() => {
    if (status === "all") return all;
    return all.filter((r) => r.status === status);
  }, [all, status]);

  const counts = useMemo(() => {
    const c = { nouveau: 0, en_cours: 0, collecte: 0, resolu: 0 } as Record<string, number>;
    all.forEach((r) => {
      if (r.status && c[r.status] !== undefined) c[r.status]++;
    });
    return c;
  }, [all]);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-eco">Carte SIG · 24 communes</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
            Cartographie SIG de Kinshasa
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Tous les signalements de Kinshasa, en temps réel, avec clustering intelligent,
            géolocalisation live et recherche de commune, quartier ou avenue.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-1 rounded-full bg-secondary p-1">
            {(
              [
                ["all", `Tous (${all.length})`],
                ["nouveau", `Nouveaux (${counts.nouveau ?? 0})`],
                ["en_cours", `En cours (${counts.en_cours ?? 0})`],
                ["collecte", `Collectés (${counts.collecte ?? 0})`],
                ["resolu", `Résolus (${counts.resolu ?? 0})`],
              ] as [Status, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setStatus(id)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                  status === id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <ClientOnly
          fallback={
            <div className="grid h-[620px] place-items-center rounded-2xl border border-border bg-secondary text-sm text-muted-foreground">
              Chargement de la carte…
            </div>
          }
        >
          <KinshasaMap city={DEFAULT_CITY} reports={filtered} height={640} followUser />
        </ClientOnly>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Legend color="#ef4444" label="Nouveau signalement" />
          <Legend color="#f59e0b" label="En cours de traitement" />
          <Legend color="#0ea5e9" label="Collecté" />
          <Legend color="#10b981" label="Résolu" />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <span className="size-4 rounded-full ring-2 ring-white" style={{ background: color }} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
