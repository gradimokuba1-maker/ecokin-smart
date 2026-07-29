import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ALERTS, TIPS } from "@/lib/data";
import { AlertTriangle, BookOpen, Megaphone, Sprout } from "lucide-react";

export const Route = createFileRoute("/sensibilisation")({
  head: () => ({
    meta: [
      { title: "Sensibilisation environnementale — EcoKin Smart" },
      {
        name: "description",
        content:
          "Conseils, alertes et campagnes pour réduire les déchets et prévenir les inondations à Kinshasa.",
      },
    ],
  }),
  component: SensibilisationPage,
});

const ARTICLES = [
  {
    title: "Pourquoi nos caniveaux débordent à chaque pluie",
    excerpt:
      "Comprendre le lien direct entre l'accumulation de plastique et les inondations dans les quartiers bas de Kinshasa.",
    tag: "Dossier",
  },
  {
    title: "Le tri à la maison en 5 étapes simples",
    excerpt:
      "Séparer plastiques, organiques et métaux avant la collecte, sans matériel spécialisé.",
    tag: "Guide",
  },
  {
    title: "Comment l'IA d'EcoKin valide vos signalements",
    excerpt:
      "Un aperçu transparent de notre modèle de classification et de la chaîne de validation.",
    tag: "Tech",
  },
];

function SensibilisationPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-eco">Engagement citoyen</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
            Sensibilisation & alertes
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Comprendre, prévenir, agir. Conseils environnementaux et notifications en temps réel
            pour protéger nos communes.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-5 flex items-center gap-2 font-display text-2xl font-bold">
          <Megaphone className="size-5 text-eco" /> Alertes en cours
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {ALERTS.map((a) => (
            <article
              key={a.id}
              className={`rounded-2xl border p-5 ${
                a.level === "critique" ? "border-flood/30 bg-flood/5" : "border-border bg-card"
              }`}
            >
              <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className={a.level === "critique" ? "text-flood" : "text-urban"}>
                  {a.level === "critique" ? (
                    <span className="inline-flex items-center gap-1">
                      <AlertTriangle className="size-3" /> Alerte critique
                    </span>
                  ) : (
                    "Information"
                  )}
                </span>
                <span className="text-muted-foreground">{a.date}</span>
              </div>
              <h3 className="font-display text-lg font-bold">{a.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-5 flex items-center gap-2 font-display text-2xl font-bold">
          <BookOpen className="size-5 text-eco" /> Guides & dossiers
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {ARTICLES.map((a) => (
            <article
              key={a.title}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-xl"
            >
              <span className="self-start rounded-full bg-eco/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-eco">
                {a.tag}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold leading-tight">{a.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{a.excerpt}</p>
              <span className="mt-4 text-sm font-bold text-eco group-hover:underline">
                Lire l'article →
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-eco/5 to-urban/5 p-8">
          <div className="mb-6 flex items-center gap-2">
            <Sprout className="size-5 text-eco" />
            <h2 className="font-display text-2xl font-bold">Le saviez-vous ?</h2>
          </div>
          <ul className="grid gap-4 md:grid-cols-2">
            {TIPS.map((t, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm"
              >
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-eco/10 font-bold text-eco">
                  {i + 1}
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
