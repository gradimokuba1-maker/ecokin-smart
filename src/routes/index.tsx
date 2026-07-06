import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useAccess } from "@/lib/access-store";
import {
  ArrowRight,
  Home as HomeIcon,
  ShieldCheck,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EcoKin Smart — Plateforme Smart City de Kinshasa" },
      {
        name: "description",
        content:
          "Trois modules pour gérer les déchets à Kinshasa : ménagers, dépôts sauvages et espace autorité.",
      },
    ],
  }),
  component: Home,
});

type ModuleTile = {
  to: string;
  icon: typeof HomeIcon;
  title: string;
  desc: string;
  bullets: string[];
  accent: string;
  glow: string;
  authorityOnly?: boolean;
};

const MODULES: ModuleTile[] = [
  {
    to: "/menagers",
    icon: HomeIcon,
    title: "Gestion des déchets ménagers",
    desc: "Espace citoyen pour vos collectes régulières, la taxe déchets et vos reçus numériques.",
    bullets: [
      "Compte ménage / PME & calendrier",
      "Collecte exceptionnelle & bacs endommagés",
      "Taxe déchets, paiement & historique",
      "Notifications, conseils & Green Points",
    ],
    accent: "bg-urban text-white shadow-urban/30",
    glow: "bg-urban/10",
  },
  {
    to: "/signaler",
    icon: Trash2,
    title: "Dépôts sauvages & état des déchets",
    desc: "Signalez un dépôt sauvage, suivez le traitement et gagnez des Green Points.",
    bullets: [
      "Signalement photo + géolocalisation",
      "Carte SIG & suivi du traitement",
      "Historique & statistiques personnelles",
      "Classement citoyens & récompenses",
    ],
    accent: "bg-eco text-white shadow-eco/30",
    glow: "bg-eco/10",
  },
  {
    to: "/autorite",
    icon: ShieldCheck,
    title: "Espace Autorité & Suivi",
    desc: "Console professionnelle réservée aux autorités, administrateurs et gestionnaires.",
    bullets: [
      "Situation, observatoire & prédictif",
      "Itinéraires, GPS flotte & interventions",
      "Assistant IA, crise, audit & rapports",
      "Administration & paramètres",
    ],
    accent: "bg-foreground text-background shadow-foreground/20",
    glow: "bg-foreground/5",
    authorityOnly: true,
  },
];

function Home() {
  const { session } = useAccess();
  const isAuthority = session.role !== "citoyen";
  const visible = MODULES.filter((m) => !m.authorityOnly || isAuthority);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.eco/15),transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-16 text-center sm:px-6 lg:pt-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-eco/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-eco">
            Plateforme modulaire · 24 communes de Kinshasa
          </div>
          <h1 className="mt-6 text-balance font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Bienvenue sur <span className="text-eco">EcoKin Smart</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
            Choisissez votre module pour accéder aux services correspondant à votre profil.
            {!isAuthority && " L'espace Autorité est réservé aux administrateurs et gestionnaires."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div
          className={`grid gap-6 ${
            visible.length === 3 ? "lg:grid-cols-3" : "md:grid-cols-2"
          }`}
        >
          {visible.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`absolute right-0 top-0 -mr-16 -mt-16 size-48 rounded-full blur-2xl ${m.glow}`} />
              <div className="relative flex flex-1 flex-col">
                <span className={`grid size-14 place-items-center rounded-2xl shadow-lg ${m.accent}`}>
                  <m.icon className="size-7" />
                </span>
                <h2 className="mt-6 font-display text-2xl font-bold">{m.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{m.desc}</p>
                <ul className="mt-5 space-y-1.5 text-sm">
                  {m.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-muted-foreground">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-eco" /> {b}
                    </li>
                  ))}
                </ul>
                <span className="mt-8 inline-flex items-center gap-2 self-start rounded-full bg-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-background transition-transform group-hover:translate-x-1">
                  Accéder <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {!isAuthority && (
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-dashed border-border bg-secondary/40 p-5 text-center text-sm text-muted-foreground">
            Vous êtes une autorité ?{" "}
            <Link to="/admin" className="font-semibold text-eco hover:underline">
              Connectez-vous à l'espace autorité →
            </Link>
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
