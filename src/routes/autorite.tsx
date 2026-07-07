import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Building2, Lock, ShieldCheck, UserCog } from "lucide-react";

export const Route = createFileRoute("/autorite")({
  head: () => ({
    meta: [
      { title: "Espace Autorité — EcoKin Smart" },
      {
        name: "description",
        content:
          "Accès réservé aux gouverneurs, bourgmestres et administrateurs de la plateforme EcoKin Smart.",
      },
    ],
  }),
  component: AuthorityLayout,
});

type AuthorityCard = {
  role: "gouverneur" | "bourgmestre" | "admin";
  title: string;
  subtitle: string;
  description: string;
  icon: typeof ShieldCheck;
};

const ACCESS_TYPES: AuthorityCard[] = [
  {
    role: "gouverneur",
    title: "Gouverneur",
    subtitle: "Supervision globale",
    description: "Vue stratégique de toute la ville, suivi des performances et des alertes prioritaires.",
    icon: ShieldCheck,
  },
  {
    role: "bourgmestre",
    title: "Bourgmestre",
    subtitle: "Pilotage communal",
    description: "Suivi des signalements, interventions et indicateurs de sa commune.",
    icon: Building2,
  },
  {
    role: "admin",
    title: "Administrateur",
    subtitle: "Gestion technique",
    description: "Administration complète de la plateforme, des paramètres et des données.",
    icon: UserCog,
  },
];

function AuthorityLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (pathname !== "/autorite") {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-6xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-emerald-900/30 bg-[linear-gradient(135deg,#071523_0%,#0f2d3d_45%,#0e3a2c_100%)] p-6 text-white shadow-[0_20px_80px_-30px_rgba(16,185,129,0.45)] sm:p-8 lg:p-10">
          <div className="flex flex-col gap-3 text-center sm:text-left">
            <div className="inline-flex items-center justify-center gap-2 self-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 sm:self-start">
              <Lock className="size-4" /> Portail sécurisé · Accès réservé
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Espace Autorité</h1>
            <p className="mx-auto max-w-2xl text-sm text-slate-300 sm:mx-0 sm:text-base">
              Sélectionnez votre profil pour ouvrir la page de connexion sécurisée et accéder à votre tableau de bord.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {ACCESS_TYPES.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.role}
                  to="/autorite/connexion"
                  search={{ role: item.role }}
                  className="block w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-left transition-all hover:border-emerald-400/30 hover:bg-white/15"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-10 place-items-center rounded-xl bg-emerald-400/15 text-emerald-200">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <div className="font-semibold text-white">{item.title}</div>
                      <div className="text-sm font-medium text-emerald-200">{item.subtitle}</div>
                      <p className="mt-1 text-sm text-slate-300">{item.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-50">
            Après votre sélection, vous serez redirigé vers une page de connexion sécurisée avec les champs Identifiant et Mot de passe.
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
