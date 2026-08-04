import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ShieldCheck, Building2, UserCog } from "lucide-react";
import { useAccess } from "@/lib/access-store";

export const Route = createFileRoute("/autorite/administration")({
    head: () => ({
        meta: [
            { title: "Choix administrateur — EcoKin Smart" },
            { name: "description", content: "Choix entre administration communale et administration technique globale." },
        ],
    }),
    component: AdminSelectionPage,
});

function AdminSelectionPage() {
    const navigate = useNavigate();
    const { session } = useAccess();

    useEffect(() => {
        if (session.role === "superadmin") {
            navigate({ to: "/superadmin", replace: true });
            return;
        }
        if (session.role === "admin") {
            navigate({ to: "/admin", replace: true });
        }
    }, [session.role, navigate]);

    return (
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] border border-border bg-card p-8 shadow-xl shadow-black/5">
                <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-2xl bg-kin text-white">
                        <ShieldCheck className="size-5" />
                    </span>
                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Accès réservé</div>
                        <h1 className="font-display text-2xl font-bold">Sélectionner votre espace d’administration</h1>
                    </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                    Choisissez le niveau d’administration adapté à votre périmètre : communal ou technique global.
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/autorite/connexion?role=admin" })}
                        className="rounded-2xl border border-border bg-background/80 p-6 text-left transition-all hover:border-eco/40 hover:bg-eco/5"
                    >
                        <div className="flex items-center gap-3">
                            <span className="grid size-10 place-items-center rounded-xl bg-eco/10 text-eco">
                                <Building2 className="size-5" />
                            </span>
                            <div>
                                <div className="font-display text-lg font-semibold">Administration communale</div>
                                <div className="text-sm text-muted-foreground">Accès aux données de sa commune</div>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Espace déjà existant, renforcé avec la sélection de la commune et un accès strictement limité au périmètre communal.
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate({ to: "/autorite/connexion?role=superadmin" })}
                        className="rounded-2xl border border-border bg-background/80 p-6 text-left transition-all hover:border-eco/40 hover:bg-eco/5"
                    >
                        <div className="flex items-center gap-3">
                            <span className="grid size-10 place-items-center rounded-xl bg-eco/10 text-eco">
                                <UserCog className="size-5" />
                            </span>
                            <div>
                                <div className="font-display text-lg font-semibold">Administration technique globale</div>
                                <div className="text-sm text-muted-foreground">Vue globale de la plateforme</div>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Tableau de bord centralisé avec tous les signalements, notifications temps réel et analyses IA de l’ensemble des communes.
                        </p>
                    </button>
                </div>
            </div>
        </div>
    );
}
