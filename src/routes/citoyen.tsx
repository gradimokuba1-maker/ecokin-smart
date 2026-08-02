import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useEcoUser } from "@/lib/user-store";
import { useLiveReports } from "@/lib/live-reports";
import { formatNumber } from "@/lib/utils";
import { ArrowRight, Heart, Trophy } from "lucide-react";

export const Route = createFileRoute("/citoyen")({
    head: () => ({
        meta: [
            { title: "Espace citoyen — EcoKin Smart" },
            {
                name: "description",
                content:
                    "Suivez vos signalements, consultez vos Green Points et votre historique citoyen EcoKin.",
            },
        ],
    }),
    component: CitizenDashboard,
});

function CitizenDashboard() {
    const { user } = useEcoUser();
    const { items: reports } = useLiveReports();

    const userReports = reports.filter((report) => report.authorId === user.id);
    const points = formatNumber(user.points);
    const reportCount = userReports.length;

    return (
        <div className="min-h-screen bg-background">
            <SiteNav />
            <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-eco">
                                    Profil citoyen
                                </p>
                                <h1 className="mt-3 text-2xl font-bold tracking-tight">{user.name}</h1>
                                <p className="mt-2 text-sm text-muted-foreground">{user.commune || "Kinshasa"}</p>
                            </div>
                            <div className="rounded-3xl bg-emerald-500/10 p-3 text-emerald-700">
                                <Trophy className="size-7" />
                            </div>
                        </div>

                        <div className="mt-8 grid gap-4">
                            <div className="rounded-3xl border border-border bg-background p-4">
                                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                                    Green Points
                                </p>
                                <p className="mt-3 text-4xl font-bold text-eco">{points}</p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Solde disponible pour vos futures récompenses.
                                </p>
                            </div>
                            <div className="rounded-3xl border border-border bg-background p-4">
                                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                                    Signalements réalisés
                                </p>
                                <p className="mt-3 text-4xl font-bold">{reportCount}</p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Signalements envoyés depuis votre compte.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <Heart className="size-5 text-eco" />
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-eco">
                                        Espace citoyen
                                    </p>
                                    <h2 className="text-lg font-bold">Votre engagement compte</h2>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Vous pouvez désormais suivre votre historique, vos points et préparer vos
                                échanges Green Points.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        Derniers signalements
                                    </p>
                                    <h3 className="mt-2 text-xl font-bold">Historique</h3>
                                </div>
                                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    {reportCount} signalement(s)
                                </div>
                            </div>

                            {userReports.length === 0 ? (
                                <div className="mt-6 rounded-3xl bg-secondary/50 p-6 text-sm text-muted-foreground">
                                    Aucun signalement n’est encore lié à votre compte.
                                </div>
                            ) : (
                                <div className="mt-6 space-y-4">
                                    {userReports.slice(0, 5).map((report) => (
                                        <article
                                            key={report.id}
                                            className="rounded-3xl border border-border bg-background p-4"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-semibold">{report.category}</p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {report.commune} · {report.status}
                                                    </p>
                                                </div>
                                                <span className="rounded-full bg-eco/10 px-3 py-1 text-xs font-bold text-eco">
                                                    {report.urgency}
                                                </span>
                                            </div>
                                            <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                                                {report.description ?? "Aucun commentaire ajouté."}
                                            </p>
                                            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                                <span className="inline-flex items-center gap-1">
                                                    <ArrowRight className="size-3" />
                                                    {report.lat?.toFixed(4)}, {report.lng?.toFixed(4)}
                                                </span>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
