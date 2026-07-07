import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AccessGate } from "@/components/access-gate";
import { DECISIONS } from "@/lib/data";
import { ScrollText } from "lucide-react";

export const Route = createFileRoute("/decisions")({
  head: () => ({
    meta: [
      { title: "Mur des Décisions — EcoKin Smart" },
      { name: "description", content: "Suivi public et transparent des décisions de gouvernance environnementale." },
    ],
  }),
  component: () => (
    <AccessGate required={["bourgmestre", "gouverneur"]} title="Mur des Décisions">
      <Page />
    </AccessGate>
  ),
});

const etatColor = (e: string) =>
  e === "terminee" ? "bg-emerald-500" :
  e === "en_cours" ? "bg-sky-500" :
  e === "planifiee" ? "bg-amber-500" : "bg-red-500";

function Page() {
  const total = DECISIONS.reduce((s, d) => s + d.budget, 0);
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-eco">
            <ScrollText className="size-4" /> Module 9 · Redevabilité
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold">Mur des Décisions</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Chaque décision suivie publiquement : responsable, budget, avancement et résultats mesurés.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { l: "Décisions actives", v: DECISIONS.length.toString() },
            { l: "En cours", v: DECISIONS.filter((d) => d.etat === "en_cours").length + "" },
            { l: "Terminées", v: DECISIONS.filter((d) => d.etat === "terminee").length + "" },
            { l: "Budget total", v: (total / 1_000_000).toFixed(1) + " M CDF" },
          ].map((k) => (
            <div key={k.l} className="rounded-2xl border border-border bg-card p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{k.l}</div>
              <div className="mt-1 font-display text-2xl font-bold">{k.v}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {DECISIONS.map((d) => (
            <article key={d.id} className="rounded-3xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{d.id}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white ${etatColor(d.etat)}`}>
                      {d.etat.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-xl font-bold">{d.titre}</h3>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Responsable : <b>{d.responsable}</b> · Lancée le {d.dateLancement} · Commune : <span className="capitalize">{d.commune}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Budget</div>
                  <div className="font-display text-lg font-bold">{(d.budget / 1_000_000).toFixed(1)} M CDF</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Avancement</span>
                  <span className="font-bold text-foreground">{d.avancementPct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-eco" style={{ width: d.avancementPct + "%" }} />
                </div>
              </div>

              <p className="mt-4 text-sm">{d.resultats}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {d.kpis.map((k, i) => (
                  <span key={i} className="rounded-full bg-secondary px-3 py-1 text-xs">
                    <b>{k.label} :</b> {k.value}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
