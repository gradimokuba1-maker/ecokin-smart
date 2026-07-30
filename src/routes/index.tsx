import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { Leaf, Recycle, ShieldCheck, Trash2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EcoKin Smart — Plateforme Smart City de Kinshasa" },
      {
        name: "description",
        content:
          "Deux modules citoyens pour gérer les déchets à Kinshasa : ménagers et dépôts sauvages.",
      },
    ],
  }),
  component: Home,
});

type ModuleTile = {
  to: string;
  icon: typeof Recycle;
  title: string;
  desc: string;
  accent: string;
};

const MODULES: ModuleTile[] = [
  {
    to: "/signaler",
    icon: Trash2,
    title: "Dépôt sauvage et tas de déchets",
    desc: "Signalez rapidement un dépôt sauvage et contribuez à la propreté de votre quartier.",
    accent: "from-sky-500 to-emerald-500",
  },
  {
    to: "/menagers",
    icon: Recycle,
    title: "Gestion des déchets ménagers",
    desc: "Accédez à la collecte régulière, aux services ménagers et au suivi de votre compte.",
    accent: "from-eco to-emerald-600",
  },
];

function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(2, 6, 23, 0.82) 0%, rgba(3, 24, 20, 0.62) 42%, rgba(2, 6, 23, 0.88) 100%), url('/images/photo.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.16),transparent_55%)]" />
      <SiteNav />
      <main className="relative z-10 flex min-h-screen flex-col">
        <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-8 flex items-center gap-3 rounded-full border border-eco/20 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
            <div className="grid size-10 place-items-center rounded-full bg-eco text-white shadow-lg shadow-eco/20">
              <Leaf className="size-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              EcoKin <span className="text-eco">Smart</span>
            </span>
          </div>

          <div className="max-w-3xl rounded-[2rem] border border-white/15 bg-slate-950/20 px-6 py-5 text-center shadow-[0_20px_70px_rgba(2,6,23,0.35)] backdrop-blur-sm sm:px-8 sm:py-6">
            <h1 className="text-balance font-display text-4xl font-bold tracking-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.75)] sm:text-5xl lg:text-6xl">
              Bienvenue sur <span className="text-emerald-300">EcoKin Smart</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/95 drop-shadow-[0_1px_10px_rgba(0,0,0,0.55)] sm:text-xl">
              Choisissez votre module pour accéder au service correspondant à votre profil.
            </p>
          </div>

          <div className="mt-10 flex w-full max-w-3xl flex-col items-center gap-5">
            {MODULES.map(({ to, icon: Icon, title, desc, accent }) => (
              <Link
                key={to}
                to={to}
                className="group relative flex w-full min-h-[150px] items-center overflow-hidden rounded-3xl border border-border/70 bg-card/95 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(16,185,129,0.35)]"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
                />
                <div className="relative flex w-full items-center gap-4">
                  <div
                    className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg sm:size-16`}
                  >
                    <Icon className="size-7 sm:size-8" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{desc}</p>
                  </div>
                  <span className="ml-2 inline-flex items-center gap-2 text-sm font-semibold text-eco">
                    Accéder
                  </span>
                </div>
              </Link>
            ))}

            <Link
              to="/autorite"
              className="inline-flex items-center gap-2 self-center rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70 shadow-sm backdrop-blur transition-colors hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-100"
            >
              <ShieldCheck className="size-3.5" />
              Accès réservé aux autorités
            </Link>
          </div>
        </section>

        <footer className="border-t border-border/60 bg-background/80 px-4 py-6 text-center backdrop-blur">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-1 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">EcoKin Smart</span>
            <span>Pour une ville propre, durable et intelligente.</span>
            <span>© EcoKin Smart – Tous droits réservés.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
