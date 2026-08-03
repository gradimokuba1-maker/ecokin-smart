import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AccessGate } from "@/components/access-gate";
import { useAccess } from "@/lib/access-store";
import { useLiveReports } from "@/lib/live-reports";
import { useNotifications } from "@/lib/notification-store";
import { useEcokinDb } from "@/lib/ecokin-db";
import {
    AlertTriangle,
    Bell,
    Building2,
    Database,
    MapPin,
    ShieldCheck,
    TrendingUp,
    Users,
} from "lucide-react";
import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/superadmin")({
    head: () => ({
        meta: [
            { title: "Administrateur technique global — EcoKin Smart" },
            { name: "description", content: "Supervision centralisée de toute la plateforme EcoKin Smart." },
        ],
    }),
    component: () => (
        <AccessGate required={["superadmin"]} title="Administration technique globale">
            <SuperAdminPage />
        </AccessGate>
    ),
});

function SuperAdminPage() {
    const { session } = useAccess();
    const { items: reports } = useLiveReports();
    const { items: notifications } = useNotifications();
    const db = useEcokinDb();

    const kpis = useMemo(() => {
        const total = reports.length;
        const pending = reports.filter((r) => ["en_attente", "assignee", "en_cours"].includes(r.status)).length;
        const resolved = reports.filter((r) => r.status === "terminee").length;
        const communalAdmins = db.users.filter((u) => u.role === "admin").length;
        const byStatus = [
            { name: "En attente", value: reports.filter((r) => r.status === "en_attente").length },
            { name: "En cours", value: reports.filter((r) => r.status === "en_cours").length },
            { name: "Résolus", value: resolved },
        ];
        const byCommune = Object.entries(
            reports.reduce<Record<string, number>>((acc, report) => {
                acc[report.commune] = (acc[report.commune] ?? 0) + 1;
                return acc;
            }, {}),
        ).map(([name, value]) => ({ name, value }));

        return { total, pending, resolved, communalAdmins, byStatus, byCommune, notifications: notifications.length };
    }, [reports, notifications, db.users]);

    return (
        <div className="min-h-screen bg-background">
            <SiteNav />
            <div className="border-b bg-card">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-eco">
                        <ShieldCheck className="size-4" /> Administration technique globale
                    </div>
                    <h1 className="mt-2 font-display text-4xl font-bold">Tableau de bord centralisé</h1>
                    <p className="mt-2 text-muted-foreground">
                        Vue globale temps réel de tous les signalements, analyses IA, notifications et interventions sur l’ensemble de la plateforme.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">Signalements total</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.total}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">En attente / en cours</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.pending}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">Résolus</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.resolved}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">Administrateurs communaux</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.communalAdmins}</div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="mb-3 flex items-center gap-2 font-semibold">
                            <TrendingUp className="size-4 text-eco" /> Statistiques générales
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={kpis.byStatus}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="mb-3 flex items-center gap-2 font-semibold">
                            <Bell className="size-4 text-eco" /> Notifications récentes
                        </div>
                        <div className="space-y-2">
                            {notifications.slice(0, 6).map((item) => (
                                <div key={item.id} className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm">
                                    <div className="font-semibold">{item.title}</div>
                                    <div className="text-muted-foreground">{item.message}</div>
                                </div>
                            ))}
                            {!notifications.length && <div className="text-sm text-muted-foreground">Aucune notification récente.</div>}
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="mb-3 flex items-center gap-2 font-semibold">
                            <MapPin className="size-4 text-eco" /> Carte globale des signalements
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {kpis.byCommune.map((item) => (
                                <div key={item.name} className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm">
                                    <div className="font-semibold">{item.name}</div>
                                    <div className="text-muted-foreground">{item.value} signalement(s)</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="mb-3 flex items-center gap-2 font-semibold">
                            <Database className="size-4 text-eco" /> Derniers signalements
                        </div>
                        <div className="space-y-2">
                            {reports.slice(0, 8).map((report) => (
                                <div key={report.id} className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-semibold">{report.id}</span>
                                        <span className="rounded-full bg-eco/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-eco">{report.status}</span>
                                    </div>
                                    <div className="mt-1 text-muted-foreground">{report.category} · {report.commune} · {report.quartier ?? report.zone ?? "—"}</div>
                                    <div className="mt-1 text-xs text-muted-foreground">Priorité {report.priorityLevel ?? report.urgency} · {report.author}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="mb-3 flex items-center gap-2 font-semibold">
                        <Users className="size-4 text-eco" /> Accès et supervision
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Connecté en tant que {session.name} · rôle {session.role}. L’espace technique global voit l’ensemble des signalements et des notifications temps réel, tandis que l’espace communal reste limité à sa commune.
                    </p>
                </div>
            </div>

            <SiteFooter />
        </div>
    );
}
