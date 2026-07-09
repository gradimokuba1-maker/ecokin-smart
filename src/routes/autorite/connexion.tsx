import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Lock, User } from "lucide-react";
import { useAccess, AUTH_USERS, getAuthorityDashboardPath } from "@/lib/access-store";

export const Route = createFileRoute("/autorite/connexion")({
    validateSearch: (search: Record<string, unknown>): { role: "gouverneur" | "bourgmestre" | "admin" | "agent" } => {
        return {
            role: (search.role as any) || "agent",
        };
    },
    head: ({ search }) => ({
        meta: [
            { title: `Connexion ${search.role} — EcoKin Smart` },
            { name: "description", content: `Connexion sécurisée au tableau de bord ${search.role}.` },
            { name: "robots", content: "noindex" },
        ],
    }),
    component: AuthorityLoginPage,
});

const ROLE_DETAILS = {
    gouverneur: { title: "Gouverneur", icon: ShieldCheck },
    bourgmestre: { title: "Bourgmestre", icon: ShieldCheck },
    admin: { title: "Administrateur", icon: ShieldCheck },
    agent: { title: "Agent de terrain", icon: ShieldCheck },
};

function AuthorityLoginPage() {
    const navigate = useNavigate();
    const { role } = Route.useSearch();
    const { session, login } = useAccess();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);

    const details = ROLE_DETAILS[role];
    const userDetails = AUTH_USERS[role];

    useEffect(() => {
        if (session.role === role) {
            navigate({ to: getAuthorityDashboardPath(role), replace: true });
        }
    }, [session.role, role, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(role, identifier, password)) {
            setErr(null);
            navigate({ to: getAuthorityDashboardPath(role), replace: true });
        } else {
            setErr("Identifiant ou mot de passe incorrect.");
        }
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

                <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Identifiant
                        </label>
                        <div className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                            <User className="size-4 text-muted-foreground" />
                            <input
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                type="text"
                                placeholder="Identifiant"
                                autoComplete="username"
                                className="w-full bg-transparent text-sm outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Mot de passe
                        </label>
                        <div className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                            <Lock className="size-4 text-muted-foreground" />
                            <input
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className="w-full bg-transparent text-sm outline-none"
                            />
                        </div>
                    </div>
                    {err && <p className="text-xs font-semibold text-red-600">{err}</p>}
                    <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-eco px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-eco/30">
                        <ShieldCheck className="size-4" /> Se connecter
                    </button>
                    <details className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
                        <summary className="cursor-pointer font-semibold">Identifiants de démo ({role})</summary>
                        <ul className="mt-2 space-y-0.5 font-mono">
                            <li>Identifiant: {userDetails.identifier}</li>
                            <li>Mot de passe: {userDetails.password}</li>
                        </ul>
                    </details>
                    <Link to="/autorite" className="block text-center text-xs text-muted-foreground hover:underline">
                        ← Retour aux profils
                    </Link>
                </form>
            </div>
        </div>
    );
}