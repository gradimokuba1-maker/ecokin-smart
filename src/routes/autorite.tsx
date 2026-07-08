import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useAccess } from "@/lib/access-store";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Building2, Lock, ShieldCheck, UserCog, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

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

type AuthorityCard = {
  role: "gouverneur" | "bourgmestre" | "admin" | "agent";
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
  {
    role: "agent",
    title: "Agent",
    subtitle: "Interventions terrain",
    description: "Accès opérationnel au suivi terrain, aux interventions et aux itinéraires.",
    icon: UserRound,
  },
];

function AuthorityLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { session, login } = useAccess();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(session.role !== "citoyen");

  useEffect(() => {
    setAuthorized(session.role !== "citoyen");
  }, [session.role]);

  if (pathname !== "/autorite") {
    return <Outlet />;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const matchedRole = (["gouverneur", "bourgmestre", "admin", "agent"] as const).find((role) =>
      login(role, identifier, password),
    );

    if (matchedRole) {
      setErr(null);
      setAuthorized(true);
    } else {
      setErr("Identifiant ou mot de passe incorrect.");
    }
  };

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
              {authorized
                ? "Sélectionnez votre profil pour continuer vers la page de connexion sécurisée de votre service."
                : "Authentifiez-vous d’abord avec les identifiants de l’espace autorités pour accéder aux profils institutionnels."}
            </p>
          </div>

          {authorized ? (
            <>
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
            </>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5 shadow-sm backdrop-blur sm:p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-emerald-300" />
                <h2 className="font-display text-xl font-semibold">Authentification de l’espace autorités</h2>
              </div>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-300">Identifiant</label>
                  <input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    type="text"
                    placeholder="ECOKIN2026"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-300">Mot de passe</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="••••••••"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-white"
                  />
                </div>
                {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-500/30"
                >
                  <ShieldCheck className="size-4" /> Se connecter
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
