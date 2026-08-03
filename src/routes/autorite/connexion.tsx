import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { useAccess, getAuthorityDashboardPath, type AuthorityRole } from "@/lib/access-store";
import { LoginForm } from "@/components/login-form";

export const Route = createFileRoute("/autorite/connexion")({
  validateSearch: (search: Record<string, unknown>): { role: AuthorityRole } => {
    const role = search.role;
    const validRoles: AuthorityRole[] = ["gouverneur", "bourgmestre", "admin", "agent", "superadmin"];
    return {
      role: validRoles.includes(role as AuthorityRole) ? (role as AuthorityRole) : "agent",
    };
  },
  head: () => ({
    meta: [
      { title: "Connexion autorité — EcoKin Smart" },
      { name: "description", content: "Connexion sécurisée aux tableaux de bord EcoKin Smart." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthorityLoginPage,
});

const ROLE_DETAILS = {
  gouverneur: { title: "Gouverneur", icon: ShieldCheck },
  bourgmestre: { title: "Bourgmestre", icon: ShieldCheck },
  admin: { title: "Administrateur communal", icon: ShieldCheck },
  agent: { title: "Agent de terrain", icon: ShieldCheck },
  superadmin: { title: "Administrateur technique global", icon: ShieldCheck },
};

function AuthorityLoginPage() {
  const navigate = useNavigate();
  const { role } = Route.useSearch();
  const { session, login } = useAccess();

  const details = ROLE_DETAILS[role];
  const isSearchRoleValid = Boolean(details);

  useEffect(() => {
    if (!isSearchRoleValid) {
      navigate({ to: "/autorite", replace: true });
      return;
    }

    if (session.role === role && (role === "admin" || role === "gouverneur" || session.commune)) {
      navigate({ to: getAuthorityDashboardPath(role), replace: true });
    }
  }, [isSearchRoleValid, session.role, session.commune, role, navigate]);

  if (!isSearchRoleValid) {
    return null;
  }

  const handleLogin = (identifier: string, password: string, commune?: string) => {
    if (login(role, identifier, password, commune)) {
      navigate({ to: getAuthorityDashboardPath(role), replace: true });
      return true;
    }
    return false;
  };

  return (
    <div className="mx-auto grid max-w-md place-items-center px-4 py-16">
      <div className="w-full rounded-3xl border border-border bg-card p-7 shadow-xl shadow-black/5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-kin text-white">
            <details.icon className="size-5" />
          </span>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Accès réservé
            </div>
            <h1 className="font-display text-xl font-bold capitalize">Connexion {details.title}</h1>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Authentifiez-vous pour accéder à votre tableau de bord.
        </p>

        <LoginForm role={role} title={details.title} onSubmit={handleLogin} />
        <Link
          to="/autorite"
          className="mt-3 block text-center text-xs text-muted-foreground hover:underline"
        >
          ← Retour aux profils
        </Link>
      </div>
    </div>
  );
}
