import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Lock } from "lucide-react";
import { RoleSelector } from "@/components/role-selector";

export const Route = createFileRoute("/autorite")({
  head: () => ({
    meta: [
      { title: "Espace Autorité — EcoKin Smart" },
      {
        name: "description",
        content:
          "Accès réservé aux gouverneurs, bourgmestres, administrateurs et agents de la plateforme EcoKin Smart.",
      },
    ],
  }),
  component: AuthorityLayout,
});

function AuthorityLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isIndex = pathname === "/autorite";

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      {isIndex ? <AuthorityIndex /> : <Outlet />}
      <SiteFooter />
    </div>
  );
}

function AuthorityIndex() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-6xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-emerald-900/30 bg-[linear-gradient(135deg,#071523_0%,#0f2d3d_45%,#0e3a2c_100%)] p-6 text-white shadow-[0_20px_80px_-30px_rgba(16,185,129,0.45)] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-3 text-center sm:text-left">
          <div className="inline-flex items-center justify-center gap-2 self-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 sm:self-start">
            <Lock className="size-4" /> Portail sécurisé · Accès réservé
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Espace Autorité
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-slate-300 sm:mx-0 sm:text-base">
            Sélectionnez votre profil pour continuer vers la page de connexion sécurisée de votre
            service.
          </p>
        </div>
        <RoleSelector />
        <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-50">
          Après votre sélection, vous serez redirigé vers une page de connexion sécurisée avec les
          champs Identifiant et Mot de passe.
        </div>
      </div>
    </main>
  );
}
