import { createFileRoute } from "@tanstack/react-router";
import { useAccess } from "@/lib/access-store";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AccessGate } from "@/components/access-gate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, BarChart3, Building, CheckCircle2, FileDown, Percent } from "lucide-react";
import { useEffect, useMemo, useRef, useState, Fragment } from "react";
import { COLLECTION_POINTS, COMMUNES, URGENCY_META, useLiveReports } from "@/lib/eco-store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/bourgmestre")({
    head: () => ({
        meta: [
            { title: "Tableau de Bord Bourgmestre — EcoKin Smart" },
            {
                name: "description",
                content: "Tableau de bord décisionnel pour le bourgmestre : signalements, collecte, zones critiques et indicateurs de performance de la commune.",
            },
        ],
    }),
    component: () => (
        <AccessGate required={["bourgmestre"]} title="Tableau de Bord Bourgmestre">
            <BourgmestreDashboard />
        </AccessGate>
    ),
});

/**
 * Renders children only on the client-side.
 * @param {object} props
 * @param {React.ReactNode} props.children The children to render on the client.
 * @param {React.ReactNode} [props.fallback=null] The fallback to render on the server.
 */
function ClientOnly({ children, fallback = null }: { children: () => React.ReactNode; fallback?: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return fallback;
    return <>{children()}</>;
}

function KpiCard({ item }: { item: { title: string; value: string; icon: any; color: string } }) {
    const Icon = item.icon;
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                <Icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
        </Card>
    );
}

function BourgmestreMap({ commune, reports, collectionPoints }: any) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        if (!commune) return;
        let cancelled = false;
        (async () => {
            const L = (await import("leaflet")).default;
            await import("leaflet/dist/leaflet.css");
            if (cancelled || !containerRef.current) return;

            const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: true }).setView(commune.center, 14);
            const bounds = L.latLngBounds(commune.center).pad(0.1);
            map.setMaxBounds(bounds);

            L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
                attribution: "© OpenStreetMap · © CARTO · EcoKin Smart",
                maxZoom: 19,
            }).addTo(map);

            collectionPoints.forEach((cp: any) => {
                L.marker([cp.lat, cp.lng], {
                    icon: L.divIcon({
                        className: "",
                        html: `<div style="background:#0ea5e9;color:#fff;width:24px;height:24px;display:grid;place-items:center;border-radius:6px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.25);font:700 11px/1 Inter,sans-serif;">♻</div>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12],
                    }),
                })
                    .bindPopup(`<strong>${cp.name}</strong><br/>Type : ${cp.kind}`)
                    .addTo(map);
            });

            const reportsLayer = L.layerGroup().addTo(map);
            reports.forEach((report: any) => {
                if (!report.lat || !report.lng) return;
                const meta = URGENCY_META[report.urgency];
                const color = meta.color.replace("text-", "").replace("-700", "-500");
                L.circleMarker([report.lat, report.lng], {
                    radius: report.urgency === "critique" ? 9 : report.urgency === "eleve" ? 7 : 5,
                    color: "#fff",
                    weight: 1.5,
                    fillColor: color,
                    fillOpacity: 0.9,
                })
                    .bindPopup(
                        `
          <div style="min-width:180px;font-family:Inter,sans-serif">
            <div style="font-weight:700;font-size:12px;">${report.id}</div>
            <div style="font-size:11px;color:#475569;text-transform:capitalize;">${report.category}</div>
            <div style="margin-top:4px">
              <span style="background-color:${color};color:#fff;padding:2px 6px;border-radius:9999px;font-size:9px;font-weight:700;text-transform:uppercase;">
                Urgence ${report.urgency}
              </span>
            </div>
          </div>
        `,
                    )
                    .addTo(reportsLayer);
            });

            mapRef.current = map;
            setTimeout(() => map.invalidateSize(), 120);
        })();

        return () => {
            cancelled = true;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [commune, reports, collectionPoints]);

    if (!commune) return null;
    return <div ref={containerRef} className="h-[400px] w-full overflow-hidden rounded-lg border bg-secondary" />;
}

function EvolutionChart({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                />
                <Tooltip
                    cursor={{ fill: "hsl(var(--accent))" }}
                    contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                    }}
                />
                <Bar dataKey="créés" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="résolus" fill="hsl(var(--eco))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

function BourgmestreCharts({ reports }: { reports: ReturnType<typeof useLiveReports>["items"] }) {
    const dailyData = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayStr = d.toISOString().slice(0, 10);
            const name = i === 0 ? "Auj." : i === 1 ? "Hier" : d.toLocaleDateString("fr-FR", { weekday: "short" });
            return {
                name,
                créés: reports.filter((r) => r.createdAt.startsWith(dayStr)).length,
                résolus: reports.filter(
                    (r) => r.status === "terminee" && r.history.find((h) => h.label.startsWith("Statut →"))?.at.startsWith(dayStr),
                ).length,
            };
        }).reverse();
    }, [reports]);

    const monthlyData = useMemo(() => {
        return Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            const name = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
            return {
                name,
                créés: reports.filter((r) => r.createdAt.startsWith(monthStr)).length,
                résolus: reports.filter(
                    (r) => r.status === "terminee" && r.history.find((h) => h.label.startsWith("Statut →"))?.at.startsWith(monthStr),
                ).length,
            };
        }).reverse();
    }, [reports]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="size-5 text-eco" /> Évolution des performances
                </CardTitle>
                <CardDescription>Suivi des signalements créés et résolus sur différentes périodes.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="daily">
                    <TabsList>
                        <TabsTrigger value="daily">Quotidien (7j)</TabsTrigger>
                        <TabsTrigger value="monthly">Mensuel (6m)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="daily" className="pt-4">
                        <EvolutionChart data={dailyData} />
                    </TabsContent>
                    <TabsContent value="monthly" className="pt-4">
                        <EvolutionChart data={monthlyData} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

function RecentReportsTable({ reports }: { reports: ReturnType<typeof useLiveReports>["items"] }) {
    const recentReports = useMemo(() => {
        return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
    }, [reports]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Derniers signalements</CardTitle>
                <CardDescription>Suivi des 10 dernières interventions enregistrées dans la commune.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <tr className="border-b">
                                <th className="py-2">ID</th>
                                <th>Catégorie</th>
                                <th>Urgence</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentReports.map((report) => (
                                <tr key={report.id} className="border-b border-border/60">
                                    <td className="py-2 font-mono text-xs">{report.id}</td>
                                    <td className="capitalize">{report.category}</td>
                                    <td><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${URGENCY_META[report.urgency]?.bg} ${URGENCY_META[report.urgency]?.color}`}>{URGENCY_META[report.urgency]?.label}</span></td>
                                    <td><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${report.status === 'terminee' ? 'bg-eco/15 text-eco' : 'bg-slate-500/15 text-slate-600'}`}>{report.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

function BourgmestreDashboard() {
    const { session } = useAccess();
    const { items: liveReports } = useLiveReports();

    const commune = useMemo(() => COMMUNES.find((c) => c.id === session.commune), [session.commune]);
    const communeName = commune?.name ?? session.commune ?? "Commune";

    const communeReports = useMemo(
        () => (session.commune ? liveReports.filter((r) => r.commune === session.commune) : []),
        [liveReports, session.commune],
    );

    const communeCollectionPoints = useMemo(
        () => (session.commune ? COLLECTION_POINTS.filter((p) => p.commune === session.commune) : []),
        [session.commune],
    );

    const kpiData = useMemo(() => {
        const en_attente = communeReports.filter((r) => r.status === "en_attente").length;
        const resolus = communeReports.filter((r) => r.status === "terminee").length;
        const total = communeReports.length;
        const tauxCollecte = total > 0 ? Math.round((resolus / total) * 100) : 0;
        return [
            { title: "Signalements (commune)", value: String(total), icon: AlertTriangle, color: "text-yellow-500" },
            { title: "Signalements en attente", value: String(en_attente), icon: AlertTriangle, color: "text-orange-500" },
            { title: "Signalements résolus", value: String(resolus), icon: CheckCircle2, color: "text-green-500" },
            { title: "Taux de collecte", value: `${tauxCollecte}%`, icon: Percent, color: "text-indigo-500" },
        ];
    }, [communeReports]);

    return (
        <>
            <style>{`
            @media print { .no-print { display: none !important; } body { background: white !important; } .container { max-width: 100% !important; padding: 0 !important; } }
        `}</style>
            <div className="flex min-h-screen flex-col bg-background">
                <SiteNav />
                <main className="flex-1">
                    <div className="border-b bg-card">
                        <div className="container py-8">
                            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-eco">
                                <Building className="size-4" /> Espace Bourgmestre
                            </div>
                            <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h1 className="font-display text-4xl font-bold">Tableau de Bord · {communeName}</h1>
                                    <p className="mt-1 text-muted-foreground">Vue d'ensemble des opérations et de la propreté de votre commune.</p>
                                </div>
                                <Button onClick={() => window.print()} className="no-print">
                                    <FileDown className="mr-2 size-4" /> Télécharger le rapport
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="container py-8">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {kpiData.map((item) => (
                                <KpiCard key={item.title} item={item} />
                            ))}
                        </div>
                        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Carte Opérationnelle · {communeName}</CardTitle>
                                    <CardDescription>Visualisation des signalements et infrastructures de la commune.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ClientOnly fallback={<div className="h-[400px] animate-pulse rounded-lg bg-muted" />}>
                                        {() => (
                                            <BourgmestreMap
                                                commune={commune}
                                                reports={communeReports}
                                                collectionPoints={communeCollectionPoints}
                                            />
                                        )}
                                    </ClientOnly>
                                </CardContent>
                            </Card>
                            <BourgmestreCharts reports={communeReports} />
                            <RecentReportsTable reports={communeReports} />
                        </div>
                    </div>
                </main>
                <SiteFooter />
            </div>
        </>
    );
}
