import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AccessGate } from "@/components/access-gate";
import { useAccess } from "@/lib/access-store";
import { useLiveReports } from "@/lib/live-reports";
import { useNotifications } from "@/lib/notification-store";
import { useEcokinDb } from "@/lib/ecokin-db";
import {
    Activity,
    AlertTriangle,
    Bell,
    Building2,
    CheckCircle2,
    CircleAlert,
    Database,
    MapPin,
    RefreshCcw,
    ShieldCheck,
    Trash2,
    TrendingUp,
    Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { EcoMap } from "@/components/eco-map";
import { ReportDetailsDialog } from "@/components/report-details-dialog";
import { useAgentTracking } from "@/lib/agent-tracking-store";
import { useCollectionOperations } from "@/lib/collection-operations-store";
import { useFleet } from "@/lib/fleet-store";
import { DEFAULT_CITY } from "@/lib/cities";
import { useAuditLog } from "@/lib/audit-log";
import { deleteUser, restoreUser, updateUser, upsertUser, ROLE_PERMISSIONS_DB } from "@/lib/ecokin-db";

export const Route = createFileRoute("/superadmin")({
    head: () => ({
        meta: [
            { title: "Administration technique globale — EcoKin Smart" },
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
    const { vehicles } = useFleet();
    const { agents, missions: missionsTracked } = useAgentTracking();
    const { pmes, collectors, missions: collectionMissions } = useCollectionOperations();
    const { entries: auditEntries } = useAuditLog();

    const kpis = useMemo(() => {
        const total = reports.length;
        const pending = reports.filter((r) => ["en_attente", "assignee", "en_cours"].includes(r.status)).length;
        const resolved = reports.filter((r) => r.status === "terminee").length;
        const inProgress = reports.filter((r) => r.status === "en_cours").length;
        const communalAdmins = db.users.filter((u) => u.role === "admin").length;
        const authorityCount = db.users.filter((u) => ["gouverneur", "bourgmestre", "admin", "superadmin"].includes(u.role)).length;
        const totalUsers = db.users.length;
        const communesTotal = DEFAULT_CITY.communes.length;
        const quartierCount = new Set(reports.map((r) => r.quartier ?? r.zone ?? "").filter(Boolean)).size;
        const vehicleCount = vehicles.length;
        const activeMissions = missionsTracked.filter((m) => m.status !== "terminee").length;
        const completedCollections = collectionMissions.filter((m) => m.status === "completed").length;
        const partnerCount = pmes.length;
        const byStatus = [
            { name: "En attente", value: reports.filter((r) => r.status === "en_attente").length },
            { name: "En cours", value: inProgress },
            { name: "Résolus", value: resolved },
        ];
        const byCommune = Object.entries(
            reports.reduce<Record<string, number>>((acc, report) => {
                acc[report.commune] = (acc[report.commune] ?? 0) + 1;
                return acc;
            }, {}),
        ).map(([name, value]) => ({ name, value }));

        const totalDuplicateConfirmations = reports.reduce((s, r) => s + (r.duplicateConfirmationCount ?? 0), 0);
        const confirmationsByCommune = Object.entries(
            reports.reduce<Record<string, number>>((acc, r) => {
                if ((r.duplicateConfirmationCount ?? 0) > 0) {
                    acc[r.commune] = (acc[r.commune] ?? 0) + (r.duplicateConfirmationCount ?? 0);
                }
                return acc;
            }, {}),
        ).map(([name, value]) => ({ name, value }));

        const now = Date.now();
        const days = 14;
        const dayBuckets: Record<string, number> = {};
        for (let i = 0; i < days; i++) {
            const d = new Date(now - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().slice(0, 10);
            dayBuckets[key] = 0;
        }
        reports.forEach((r) => {
            (r.duplicateConfirmationHistory || []).forEach((h: any) => {
                try {
                    const k = new Date(h.at).toISOString().slice(0, 10);
                    if (k in dayBuckets) dayBuckets[k] = (dayBuckets[k] ?? 0) + 1;
                } catch {
                    // ignore malformed entries
                }
            });
        });
        const confirmationsTimeline = Object.entries(dayBuckets)
            .map(([date, value]) => ({ date, value }))
            .sort((a, b) => a.date.localeCompare(b.date));

        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        const newReports24h = reports.filter((r) => new Date(r.createdAt).getTime() >= cutoff).length;

        return {
            total,
            pending,
            resolved,
            inProgress,
            communalAdmins,
            authorityCount,
            totalUsers,
            communesTotal,
            quartierCount,
            vehicleCount,
            activeMissions,
            completedCollections,
            partnerCount,
            byStatus,
            byCommune,
            newReports24h,
            notifications: notifications.length,
            totalDuplicateConfirmations,
            confirmationsByCommune,
            confirmationsTimeline,
            activeAgents: agents.length,
            activeCollectors: collectors.length,
            recentAlerts: Math.max(0, pending + notifications.length - 2),
        };
    }, [reports, notifications, db.users, vehicles, agents, missionsTracked, pmes, collectors, collectionMissions]);

    const recentActivity = useMemo(() => {
        const entries = [...auditEntries].slice(0, 8);
        return entries.map((entry) => ({
            id: entry.id,
            title: `${entry.user} · ${entry.action}`,
            detail: entry.details ?? entry.target ?? "Aucune description",
            at: new Date(entry.at).toLocaleString("fr-FR"),
        }));
    }, [auditEntries]);

    const [query, setQuery] = useState("");
    const [filterCommune, setFilterCommune] = useState<string | "all">("all");
    const [filterStatus, setFilterStatus] = useState<string | "all">("all");
    const [filterUser, setFilterUser] = useState<string | "all">("all");
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<import("@/lib/live-reports").LiveReport | null>(null);

    const filteredReports = useMemo(() => {
        return reports.filter((r) => {
            if (filterCommune !== "all" && r.commune !== filterCommune) return false;
            if (filterStatus !== "all" && r.status !== filterStatus) return false;
            if (filterUser !== "all" && (r.authorId ?? r.author) !== filterUser) return false;
            if (startDate) {
                const s = new Date(startDate).getTime();
                if (new Date(r.createdAt).getTime() < s) return false;
            }
            if (endDate) {
                const e = new Date(endDate).getTime();
                if (new Date(r.createdAt).getTime() > e) return false;
            }
            if (query) {
                const q = query.toLowerCase();
                const iaText = (r.analysis?.summary || r.iaAnalysis?.text || r.ai?.description || r.ia?.text) ?? "";
                if (!(`${r.id} ${r.description ?? ""} ${r.author ?? ""} ${r.commune} ${iaText}`.toLowerCase().includes(q))) return false;
            }
            return true;
        });
    }, [reports, filterCommune, filterStatus, filterUser, startDate, endDate, query]);

    function setPresetRange(days: number | null) {
        if (days === null) {
            setStartDate(null);
            setEndDate(null);
            return;
        }
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days + 1);
        setStartDate(start.toISOString().slice(0, 10));
        setEndDate(end.toISOString().slice(0, 10));
    }

    function exportCsv() {
        const rows = filteredReports.map((r) => ({
            id: r.id,
            createdAt: r.createdAt,
            status: r.status,
            commune: r.commune,
            quartier: r.quartier ?? r.zone ?? "",
            author: r.author ?? r.authorId ?? "",
            description: r.description ?? "",
            ia: (r.analysis?.summary || r.iaAnalysis?.text || r.ai?.description || ""),
        }));
        const header = Object.keys(rows[0] ?? {}).join(",") + "\n";
        const body = rows.map((row) => Object.values(row).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
        const csv = header + body;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `eco_reports_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

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
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">Signalements total</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.total}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">En attente</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.pending}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">En cours</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.inProgress}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">Résolus</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.resolved}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">Utilisateurs</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.totalUsers}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">Autorités</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.authorityCount}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">Administrateurs</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.communalAdmins}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">Communes</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.communesTotal}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">Quartiers</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.quartierCount}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">Véhicules</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.vehicleCount}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">Missions actives</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.activeMissions}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">Collectes réalisées</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.completedCollections}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">Entreprises partenaires</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.partnerCount}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">Nouveaux signalements (24h)</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.newReports24h}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">Alerte système</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.recentAlerts}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="text-sm text-muted-foreground">Notifications</div>
                        <div className="mt-2 text-3xl font-bold">{kpis.notifications}</div>
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
                        <div className="mb-3 flex items-center gap-2 font-semibold"><AlertTriangle className="size-4 text-eco" /> Confirmations de doublons par commune</div>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={kpis.confirmationsByCommune} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={30}>
                                        {kpis.confirmationsByCommune.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={["#22c55e", "#06b6d4", "#f59e0b", "#ef4444"][index % 4]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="mb-3 flex items-center gap-2 font-semibold"><TrendingUp className="size-4 text-eco" /> Timeline confirmations (14j)</div>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={kpis.confirmationsTimeline} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 font-semibold"><MapPin className="size-4 text-eco" /> Carte globale des signalements</div>
                            <div className="flex items-center gap-2">
                                <input placeholder="Rechercher (id, auteur, texte...)" value={query} onChange={(e) => setQuery(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
                                <select value={filterCommune} onChange={(e) => setFilterCommune(e.target.value as any)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                                    <option value="all">Toutes les communes</option>
                                    {[...new Set(reports.map((r) => r.commune))].map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                                    <option value="all">Tous statuts</option>
                                    <option value="en_attente">En attente</option>
                                    <option value="assignee">Assigné</option>
                                    <option value="en_cours">En cours</option>
                                    <option value="terminee">Terminé</option>
                                    <option value="rejete">Rejeté</option>
                                </select>
                                <input list="users" placeholder="Filtrer par utilisateur" value={filterUser === "all" ? "" : filterUser} onChange={(e) => setFilterUser(e.target.value || "all")} className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
                                <datalist id="users">
                                    <option value="all">Tous utilisateurs</option>
                                    {db.users.map((u) => (
                                        <option key={u.id || u.name} value={u.id || u.name}>{u.name || u.id}</option>
                                    ))}
                                </datalist>
                                <input type="date" value={startDate ?? ""} onChange={(e) => setStartDate(e.target.value || null)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
                                <input type="date" value={endDate ?? ""} onChange={(e) => setEndDate(e.target.value || null)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setPresetRange(1)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">24h</button>
                                    <button onClick={() => setPresetRange(7)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">7j</button>
                                    <button onClick={() => setPresetRange(30)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">30j</button>
                                    <button onClick={() => setPresetRange(null)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">Tous</button>
                                </div>
                                <button onClick={exportCsv} className="ml-2 rounded-xl border border-border bg-eco/10 px-3 py-2 text-sm font-semibold text-eco">Exporter CSV</button>
                            </div>
                        </div>
                        <div className="h-[520px]"><EcoMap reports={filteredReports as any} showCollection={false} showPois={false} showDumps={false} onSelectReport={(r: any) => setSelectedReport(r)} /></div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="mb-3 flex items-center gap-2 font-semibold">
                            <Database className="size-4 text-eco" /> Derniers signalements
                        </div>
                        <div className="space-y-2">
                            {filteredReports.slice(0, 12).map((report) => (
                                <div key={report.id} onClick={() => setSelectedReport(report)} className="cursor-pointer rounded-xl border border-border/70 bg-background/70 p-3 text-sm hover:shadow-lg">
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

                <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="mb-3 flex items-center gap-2 font-semibold">
                            <Activity className="size-4 text-eco" /> Activité récente
                        </div>
                        <div className="space-y-2">
                            {recentActivity.map((item) => (
                                <div key={item.id} className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm">
                                    <div className="font-semibold">{item.title}</div>
                                    <div className="text-muted-foreground">{item.detail}</div>
                                    <div className="mt-1 text-[11px] text-muted-foreground">{item.at}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                        <div className="mb-3 flex items-center gap-2 font-semibold">
                            <CircleAlert className="size-4 text-eco" /> État des services et alertes
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-border bg-background/60 p-3 text-sm">
                                <div className="font-semibold">Services IA</div>
                                <div className="text-muted-foreground">Stable · 99.2%</div>
                            </div>
                            <div className="rounded-xl border border-border bg-background/60 p-3 text-sm">
                                <div className="font-semibold">API plateforme</div>
                                <div className="text-muted-foreground">Operational · 98.8%</div>
                            </div>
                            <div className="rounded-xl border border-border bg-background/60 p-3 text-sm">
                                <div className="font-semibold">Serveurs</div>
                                <div className="text-muted-foreground">Bonne disponibilité</div>
                            </div>
                            <div className="rounded-xl border border-border bg-background/60 p-3 text-sm">
                                <div className="font-semibold">Alertes remontées</div>
                                <div className="text-muted-foreground">{kpis.recentAlerts} éléments à surveiller</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="mb-3 flex items-center gap-2 font-semibold">
                        <Users className="size-4 text-eco" /> Gestion centrale des utilisateurs
                    </div>
                    <UserManagementPanel />
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="mb-3 flex items-center gap-2 font-semibold">
                        <ShieldCheck className="size-4 text-eco" /> Gestion des rôles et permissions
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { role: "administrateur", count: db.users.filter((u) => u.role === "admin").length, permissions: ROLE_PERMISSIONS_DB.admin.length },
                            { role: "autorité", count: db.users.filter((u) => ["gouverneur", "bourgmestre", "superadmin"].includes(u.role)).length, permissions: ROLE_PERMISSIONS_DB.gouverneur.length },
                            { role: "communes", count: DEFAULT_CITY.communes.length, permissions: "locale" },
                            { role: "opérateurs", count: db.users.filter((u) => u.role === "agent").length, permissions: ROLE_PERMISSIONS_DB.agent.length },
                            { role: "citoyens", count: db.users.filter((u) => u.role === "citoyen").length, permissions: ROLE_PERMISSIONS_DB.citoyen.length },
                        ].map((item) => (
                            <div key={item.role} className="rounded-xl border border-border bg-background/60 p-3 text-sm">
                                <div className="font-semibold capitalize">{item.role}</div>
                                <div className="text-muted-foreground">{item.count} comptes · {item.permissions} permissions</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="mb-3 flex items-center gap-2 font-semibold">
                        <Building2 className="size-4 text-eco" /> Suivi des communes et autorités
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2">
                        <div className="rounded-xl border border-border bg-background/60 p-3 text-sm">
                            <div className="font-semibold">Communes enregistrées</div>
                            <div className="text-muted-foreground">{DEFAULT_CITY.communes.map((item) => item.name).slice(0, 6).join(", ")}…</div>
                        </div>
                        <div className="rounded-xl border border-border bg-background/60 p-3 text-sm">
                            <div className="font-semibold">Autorités actives</div>
                            <div className="text-muted-foreground">{db.users.filter((u) => ["gouverneur", "bourgmestre", "admin", "superadmin"].includes(u.role)).map((u) => u.name).join(", ")}</div>
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
            <ReportDetailsDialog report={selectedReport as any} isOpen={Boolean(selectedReport)} onClose={() => setSelectedReport(null)} canProvideFeedback={true} />
        </div>
    );
}

function UserManagementPanel() {
    const db = useEcokinDb();
    const [draft, setDraft] = useState({
        name: "",
        role: "admin",
        identifier: "",
        password: "",
        commune: DEFAULT_CITY.communes[0]?.id ?? "",
        active: true,
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    const resetDraft = () => {
        setDraft({
            name: "",
            role: "admin",
            identifier: "",
            password: "",
            commune: DEFAULT_CITY.communes[0]?.id ?? "",
            active: true,
        });
        setEditingId(null);
    };

    const startEdit = (user: any) => {
        setEditingId(user.id);
        setDraft({
            name: user.name,
            role: user.role,
            identifier: user.identifier,
            password: user.password,
            commune: user.commune ?? DEFAULT_CITY.communes[0]?.id ?? "",
            active: user.active,
        });
    };

    const saveUser = () => {
        const payload = {
            role: draft.role,
            name: draft.name,
            identifier: draft.identifier,
            password: draft.password || "0000",
            commune: draft.commune,
            active: draft.active,
            permissions: ROLE_PERMISSIONS_DB[draft.role as keyof typeof ROLE_PERMISSIONS_DB],
        } as any;

        if (editingId) {
            updateUser(editingId, payload);
        } else {
            upsertUser(payload);
        }
        resetDraft();
    };

    const toggleActive = (user: any) => {
        updateUser(user.id, { active: !user.active });
    };

    const resetPassword = (user: any) => {
        updateUser(user.id, { password: user.identifier || "0000" });
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-2 rounded-xl border border-border bg-background/60 p-3">
                    <div className="text-sm font-semibold">Créer / modifier un utilisateur</div>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <input value={draft.name} onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))} placeholder="Nom complet" className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
                        <input value={draft.identifier} onChange={(e) => setDraft((prev) => ({ ...prev, identifier: e.target.value }))} placeholder="Identifiant" className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
                        <input value={draft.password} onChange={(e) => setDraft((prev) => ({ ...prev, password: e.target.value }))} placeholder="Mot de passe" className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
                        <select value={draft.role} onChange={(e) => setDraft((prev) => ({ ...prev, role: e.target.value as any }))} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                            <option value="admin">Administrateur</option>
                            <option value="bourgmestre">Bourgmestre</option>
                            <option value="gouverneur">Gouverneur</option>
                            <option value="superadmin">Superadmin</option>
                            <option value="agent">Agent</option>
                            <option value="citoyen">Citoyen</option>
                        </select>
                        <select value={draft.commune} onChange={(e) => setDraft((prev) => ({ ...prev, commune: e.target.value }))} className="rounded-xl border border-border bg-background px-3 py-2 text-sm sm:col-span-2">
                            {DEFAULT_CITY.communes.map((commune) => (
                                <option key={commune.id} value={commune.id}>{commune.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={saveUser} className="rounded-xl bg-eco px-3 py-2 text-sm font-bold text-white">{editingId ? "Enregistrer" : "Créer"}</button>
                        <button onClick={resetDraft} className="rounded-xl border border-border px-3 py-2 text-sm">Réinitialiser</button>
                    </div>
                </div>
                <div className="space-y-2 rounded-xl border border-border bg-background/60 p-3">
                    <div className="text-sm font-semibold">Vue d’ensemble</div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <div>Comptes actifs : {db.users.filter((u) => u.active).length}</div>
                        <div>Comptes inactifs : {db.users.filter((u) => !u.active).length}</div>
                        <div>Rôles disponibles : admin, bourgmestre, gouverneur, superadmin, agent, citoyen</div>
                        <div>Permissions centralisées : {Object.keys(ROLE_PERMISSIONS_DB).length} profils</div>
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                {db.users.slice(0, 12).map((user) => (
                    <div key={user.id} className="flex flex-col gap-2 rounded-xl border border-border bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.role} · {user.identifier} · {user.active ? "Actif" : "Inactif"}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => startEdit(user)} className="rounded-xl border border-border px-2 py-1 text-xs">Modifier</button>
                            <button onClick={() => toggleActive(user)} className="rounded-xl border border-border px-2 py-1 text-xs">{user.active ? "Désactiver" : "Réactiver"}</button>
                            <button onClick={() => resetPassword(user)} className="rounded-xl border border-border px-2 py-1 text-xs"><RefreshCcw className="mr-1 inline size-3" />Réinit.</button>
                            <button onClick={() => { if (user.active) deleteUser(user.id); else restoreUser(user.id); }} className="rounded-xl border border-border px-2 py-1 text-xs text-red-600"><Trash2 className="mr-1 inline size-3" />{user.active ? "Supprimer" : "Restaurer"}</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
