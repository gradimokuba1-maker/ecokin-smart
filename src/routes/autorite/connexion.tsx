import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useAccess, getAuthorityDashboardPath } from "@/lib/access-store";
import { Building2, Lock, ShieldCheck, UserCog } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/autorite/connexion")({
    validateSearch: (search: Record<string, unknown>) => ({
        role: typeof search.role === "string" ? search.role : undefined,
    }),
    head: () => ({
        meta: [
            { title: "Connexion Autorité — EcoKin Smart" },
            {
                name: "description",
                content: "Connexion sécurisée pour les profils gouverneur, bourgmestre et administrateur.",
            },
        ],
    }),
    component: AuthorityLoginPage,
});

type AuthorityRole = "gouverneur" | "bourgmestre" | "admin";

type AuthorityOption = {
    role: AuthorityRole;
    title: string;
    icon: typeof ShieldCheck;
};

const OPTIONS: AuthorityOption[] = [
    { role: "gouverneur", title: "Gouverneur", icon: ShieldCheck },
    { role: "bourgmestre", title: "Bourgmestre", icon: Building2 },
    { role: "admin", title: "Administrateur", icon: UserCog },
];

function AuthorityLoginPage() {
    const navigate = useNavigate();
    const { login } = useAccess();
    const search = Route.useSearch();
    const [role, setRole] = useState<AuthorityRole>(
        search.role === "gouverneur" || search.role === "bourgmestre" || search.role === "admin"
            ? search.role
            : "gouverneur",
    );
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);

    const selectedOption = OPTIONS.find((item) => item.role === role) ?? OPTIONS[0];
    const SelectedIcon = selectedOption.icon;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (login(role, identifier, password)) {
            setErr(null);
            const target = getAuthorityDashboardPath(role);
            navigate({ to: target, replace: true });
        } else {
            setErr("Identifiant ou mot de passe incorrect.");
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <SiteNav />
            <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full overflow-hidden rounded-[2rem] border border-emerald-900/30 bg-[linear-gradient(135deg,#071523_0%,#0f2d3d_45%,#0e3a2c_100%)] p-6 text-white shadow-[0_20px_80px_-30px_rgba(16,185,129,0.45)] sm:p-8 lg:p-10">
                    <div className="flex flex-col gap-3 text-center sm:text-left">
                        <div className="inline-flex items-center justify-center gap-2 self-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 sm:self-start">
                            <Lock className="size-4" /> Connexion sécurisée · Accès réservé
                        </div>
                        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Connexion Autorité</h1>
                        <p className="mx-auto max-w-2xl text-sm text-slate-300 sm:mx-0 sm:text-base">
                            Saisissez vos identifiants institutionnels pour ouvrir le tableau de bord correspondant à votre profil.
                        </p>
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 backdrop-blur">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="size-5 text-emerald-300" />
                                <h2 className="font-display text-xl font-semibold">Profil sélectionné</h2>
                            </div>
                            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                                <div className="flex items-center gap-3">
                                    <span className="grid size-11 place-items-center rounded-xl bg-emerald-400/15 text-emerald-200">
                                        <SelectedIcon className="size-5" />
                                    </span>
                                    <div>
                                        <div className="font-semibold text-white">{selectedOption.title}</div>
                                        <p className="text-sm text-emerald-50/80">Accès réservé aux autorités habilitées.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2 text-sm text-slate-300">
                                {OPTIONS.map((item) => (
                                    <button
                                        key={item.role}
                                        type="button"
                                        onClick={() => setRole(item.role)}
                                        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${role === item.role ? "border-emerald-400/40 bg-emerald-400/10 text-white" : "border-white/10 bg-white/10 hover:border-emerald-400/30 hover:bg-white/15"}`}
                                    >
                                        <span>{item.title}</span>
                                        <span className="text-xs uppercase tracking-widest text-emerald-200">Sélectionner</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 shadow-sm backdrop-blur">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="size-5 text-emerald-300" />
                                <h2 className="font-display text-xl font-semibold">Vos identifiants</h2>
                            </div>
                            <div className="mt-5 space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-300">Rôle</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value as AuthorityRole)}
                                        className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-white"
                                    >
                                        {OPTIONS.map((item) => (
                                            <option key={item.role} value={item.role}>
                                                {item.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
                    </div>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
