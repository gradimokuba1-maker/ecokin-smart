import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AccessGate } from "@/components/access-gate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Filter,
  Percent,
  Recycle,
  ShieldCheck,
  Trash2,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_CITY } from "@/lib/cities";
import {
  COLLECTION_POINTS,
  COMMUNES,
  URGENCY_META,
  useLiveReports,
  WASTE_CATEGORIES,
} from "@/lib/eco-store";
import { useAuthorityLocalStore } from "@/lib/authority-local-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAgentTracking } from "@/lib/agent-tracking-store";
import { useEcokinDb } from "@/lib/ecokin-db";
import {
  agentPerformance,
  authorityPerformance,
  environmentalIndicators,
  illegalDumpCount,
  pendingReports,
  recycledVolume,
  reportVolume,
  reportsByQuarter,
} from "@/lib/dashboard-analytics";

export const Route = createFileRoute("/gouverneur")({
  head: () => ({
    meta: [
      { title: "Centre de Commandement du Gouverneur — EcoKin Smart" },
      {
        name: "description",
        content:
          "Tableau de bord stratégique de la Ville de Kinshasa : propreté, risque d'inondation, IPK, flotte GPS, alertes et budget des opérations.",
      },
    ],
  }),
  component: () => (
    <AccessGate required={["gouverneur"]} title="Centre de Commandement du Gouverneur">
      <GovernorDashboard />
    </AccessGate>
  ),
});

const periodOptions = [
  { value: "all", label: "Toute période" },
  { value: "24h", label: "Dernières 24h" },
  { value: "7d", label: "7 derniers jours" },
  { value: "30d", label: "30 derniers jours" },
];

const urgencyOptions = [
  { value: "all", label: "Toute priorité" },
  ...Object.entries(URGENCY_META).map(([value, { label }]) => ({
    value,
    label: `Priorité ${label}`,
  })),
];

const categoryOptions = [
  { value: "all", label: "Tout type de déchet" },
  ...WASTE_CATEGORIES.map((c) => ({ value: c.id, label: c.label })),
];

/**
 * Renders children only on the client-side.
 * @param {object} props
 * @param {React.ReactNode} props.children The children to render on the client.
 * @param {React.ReactNode} [props.fallback=null] The fallback to render on the server.
 */
function ClientOnly({
  children,
  fallback = null,
}: {
  children: () => React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return fallback;
  return <>{children()}</>;
}

function KpiCard({ item }: { item: ReturnType<typeof useKpiData>[number] }) {
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

// Map urgency levels to actual hex colors for Leaflet
const URGENCY_HEX_COLORS: Record<string, string> = {
  faible: "#10b981",
  moyen: "#f59e0b",
  eleve: "#f97316",
  critique: "#ef4444",
};

// Map waste categories to distinct icons/emojis
const CATEGORY_ICONS: Record<string, string> = {
  plastique: "🧴",
  organique: "🍃",
  menager: "🗑",
  electronique: "🔌",
  medical: "⚕",
  construction: "🧱",
  metal: "⚙",
  verre: "🍾",
  mixte: "♻",
};

function GovernorMap({ reports }: { reports: ReturnType<typeof useLiveReports>["items"] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const reportsLayerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: true }).setView(
        DEFAULT_CITY.center,
        DEFAULT_CITY.defaultZoom,
      );
      map.setMaxBounds(L.latLngBounds(DEFAULT_CITY.bounds[0], DEFAULT_CITY.bounds[1]).pad(0.16));
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap · © CARTO · EcoKin Smart",
        maxZoom: 19,
      }).addTo(map);

      COMMUNES.forEach((c) => {
        L.circle(c.center, {
          radius: 1700,
          color: "#10b981",
          weight: 1.5,
          opacity: 0.4,
          fillOpacity: 0.06,
          dashArray: "5 5",
        })
          .bindTooltip(`Commune de ${c.name}`, { direction: "top" })
          .addTo(map);
      });

      COLLECTION_POINTS.forEach((cp) => {
        const kindColors: Record<string, string> = {
          regroupement: "#0ea5e9",
          collecte: "#10b981",
          transfert: "#8b5cf6",
          valorisation: "#f59e0b",
          traitement: "#ef4444",
          tri: "#6366f1",
          recyclage: "#14b8a6",
        };
        const bgColor = kindColors[cp.kind] || "#0ea5e9";
        L.marker([cp.lat, cp.lng], {
          icon: L.divIcon({
            className: "",
            html: `<div style="background:${bgColor};color:#fff;width:28px;height:28px;display:grid;place-items:center;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);font:bold 13px/1 Inter,sans-serif;">♻</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          }),
        })
          .bindPopup(
            `<div style="min-width:200px;font-family:Inter,sans-serif">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${cp.name}</div>
              <div style="font-size:12px;color:#475569;text-transform:capitalize;">Type : ${cp.kind}</div>
              <div style="font-size:12px;color:#475569;">Commune : ${COMMUNES.find((c) => c.id === cp.commune)?.name || cp.commune}</div>
            </div>`,
          )
          .addTo(map);
      });

      reportsLayerRef.current = L.layerGroup().addTo(map);
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
  }, []);

  useEffect(() => {
    if (!reportsLayerRef.current || !mapRef.current) return;
    (async () => {
      const L = (await import("leaflet")).default;
      reportsLayerRef.current.clearLayers();
      reports.forEach((report) => {
        if (!report.lat || !report.lng) return;
        const urgencyColor = URGENCY_HEX_COLORS[report.urgency] || "#6b7280";
        const categoryIcon = CATEGORY_ICONS[report.category] || "📦";
        const communeName = COMMUNES.find((c) => c.id === report.commune)?.name || report.commune;
        const statusLabel =
          report.status === "terminee"
            ? "Terminée"
            : report.status === "en_cours"
              ? "En cours"
              : report.status === "assignee"
                ? "Assignée"
                : "En attente";
        const volume = report.volumeM3 ? `${report.volumeM3} m³` : "N/A";
        const description = report.description
          ? report.description.substring(0, 100)
          : "Aucune description";

        // Different icon per urgency level
        const radius =
          report.urgency === "critique"
            ? 12
            : report.urgency === "eleve"
              ? 10
              : report.urgency === "moyen"
                ? 8
                : 6;
        const borderWidth = report.urgency === "critique" ? 3 : 2;

        // Use circle markers with urgency-based styling
        L.circleMarker([report.lat, report.lng], {
          radius,
          color: urgencyColor,
          weight: borderWidth,
          fillColor: urgencyColor,
          fillOpacity: 0.85,
        })
          .bindPopup(
            `
            <div style="min-width:220px;font-family:Inter,sans-serif">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                <span style="font-size:18px;">${categoryIcon}</span>
                <span style="font-weight:700;font-size:13px;">${report.id}</span>
              </div>
              <div style="font-size:11px;color:#475569;margin-bottom:4px;">
                <strong>Catégorie :</strong> ${report.category} · <strong>Commune :</strong> ${communeName}
              </div>
              <div style="font-size:11px;color:#475569;margin-bottom:4px;">
                <strong>Volume :</strong> ${volume} · <strong>Statut :</strong> ${statusLabel}
              </div>
              <div style="font-size:11px;color:#475569;margin-bottom:6px;">
                <strong>Description :</strong> ${description}
              </div>
              <div style="font-size:11px;color:#475569;margin-bottom:6px;">
                <strong>Date :</strong> ${new Date(report.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
              <div style="margin-top:4px">
                <span style="background-color:${urgencyColor};color:#fff;padding:3px 8px;border-radius:9999px;font-size:10px;font-weight:700;text-transform:uppercase;">
                  Urgence ${report.urgency}
                </span>
              </div>
            </div>
          `,
            { maxWidth: 300, minWidth: 220 },
          )
          .addTo(reportsLayerRef.current);
      });
    })();
  }, [reports]);

  return (
    <div
      ref={containerRef}
      className="h-[500px] w-full overflow-hidden rounded-lg border bg-secondary"
    />
  );
}

function PerformanceByCommuneChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
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
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        <Bar dataKey="Signalements" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Résolus" fill="hsl(var(--eco))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ReportsEvolutionChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <defs>
          <linearGradient id="colorSignalements" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            fontSize: "12px",
          }}
        />
        <Area
          type="monotone"
          dataKey="Signalements"
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill="url(#colorSignalements)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function GovernorCharts({ reports }: { reports: ReturnType<typeof useLiveReports>["items"] }) {
  const performanceByCommune = useMemo(() => {
    const data = COMMUNES.map((commune) => {
      const communeReports = reports.filter((r) => r.commune === commune.id);
      return {
        name: commune.name,
        Signalements: communeReports.length,
        Résolus: communeReports.filter((r) => r.status === "terminee").length,
      };
    });
    return data.filter((d) => d.Signalements > 0).sort((a, b) => b.Signalements - a.Signalements);
  }, [reports]);

  const evolutionData = useMemo(() => {
    const data = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().slice(0, 10);
      const name = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
      const signalements = reports.filter((r) => r.createdAt.startsWith(dayStr)).length;
      return { name, Signalements: signalements };
    }).reverse();
    return data;
  }, [reports]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyse des Performances</CardTitle>
        <CardDescription>
          Visualisation des tendances et répartition des signalements.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2 pr-4">
        <Tabs defaultValue="performance">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="performance">Performance / Commune</TabsTrigger>
            <TabsTrigger value="evolution">Évolution (30j)</TabsTrigger>
          </TabsList>
          <TabsContent value="performance" className="pt-4">
            <PerformanceByCommuneChart data={performanceByCommune} />
          </TabsContent>
          <TabsContent value="evolution" className="pt-4">
            <ReportsEvolutionChart data={evolutionData} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ResolutionTimeChart({ data }: { data: { name: string; "Temps moyen (h)": number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis
          type="number"
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--accent))" }}
          contentStyle={{
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="Temps moyen (h)" fill="hsl(var(--eco))" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const CATEGORY_COLORS = [
  "#10b981",
  "#0ea5e9",
  "#6366f1",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

function ReportsByCategoryChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function GovernorStatsTab({ reports }: { reports: ReturnType<typeof useLiveReports>["items"] }) {
  const localStore = useAuthorityLocalStore();
  const db = useEcokinDb();
  const tracking = useAgentTracking();
  const quarterRows = useMemo(() => reportsByQuarter(reports).slice(0, 10), [reports]);
  const agentRows = useMemo(
    () => agentPerformance(reports, tracking.missions, db.users).slice(0, 10),
    [reports, tracking.missions, db.users],
  );
  const adminRows = useMemo(
    () => authorityPerformance(reports, db.users, "admin"),
    [reports, db.users],
  );
  const bourgmestreRows = useMemo(
    () => authorityPerformance(reports, db.users, "bourgmestre"),
    [reports, db.users],
  );
  const reportsByCategory = useMemo(() => {
    const counts = reports.reduce(
      (acc, r) => {
        const category = r.category || "inconnu";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [reports]);

  const resolutionTimeData = useMemo(() => {
    const resolutionTimesByCommune: Record<string, number[]> = {};

    reports.forEach((report) => {
      if (report.status === "terminee") {
        const resolutionEntry = report.history.find((h) => h.label.includes("terminee"));
        if (resolutionEntry) {
          const creationDate = new Date(report.createdAt);
          const resolutionDate = new Date(resolutionEntry.at);
          const durationHours =
            (resolutionDate.getTime() - creationDate.getTime()) / (1000 * 60 * 60);

          if (!resolutionTimesByCommune[report.commune]) {
            resolutionTimesByCommune[report.commune] = [];
          }
          resolutionTimesByCommune[report.commune].push(durationHours);
        }
      }
    });

    return Object.entries(resolutionTimesByCommune)
      .map(([commune, durations]) => ({
        name: commune,
        "Temps moyen (h)": Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length),
      }))
      .sort((a, b) => a["Temps moyen (h)"] - b["Temps moyen (h)"]);
  }, [reports]);

  const communeRows = useMemo(() => {
    return COMMUNES.map((commune) => {
      const communeReports = reports.filter((report) => report.commune === commune.id);
      const resolved = communeReports.filter((report) => report.status === "terminee").length;
      const performance =
        communeReports.length > 0 ? Math.round((resolved / communeReports.length) * 100) : 0;
      return {
        commune,
        volume: Math.round(communeReports.reduce((sum, report) => sum + (report.volumeM3 ?? 0), 0)),
        agents: localStore.agents.filter((item) => item.commune === commune.id).length,
        pmes: localStore.pmes.filter((item) => item.commune === commune.id).length,
        teams: localStore.teams.filter((item) => item.commune === commune.id).length,
        activities: localStore.activities.filter(
          (item) => item.commune === commune.id && item.status !== "terminee",
        ).length,
        performance,
      };
    });
  }, [reports, localStore]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Indicateurs comparatifs par commune</CardTitle>
          <CardDescription>Vision globale du Gouverneur sur les 24 communes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2">Commune</th>
                  <th>Déchets collectés</th>
                  <th>Agents</th>
                  <th>PME</th>
                  <th>Équipes</th>
                  <th>Activités</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {communeRows.map((row) => (
                  <tr key={row.commune.id} className="border-b border-border/60">
                    <td className="py-2 font-semibold">{row.commune.name}</td>
                    <td>{row.volume} m³</td>
                    <td>{row.agents}</td>
                    <td>{row.pmes}</td>
                    <td>{row.teams}</td>
                    <td>{row.activities}</td>
                    <td>
                      <span className="rounded-full bg-eco/10 px-2 py-0.5 text-xs font-bold text-eco">
                        {row.performance}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Répartition par Catégorie de Déchet</CardTitle>
          <CardDescription>
            Distribution des signalements selon le type de déchet identifié.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportsByCategoryChart data={reportsByCategory} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Performances de Résolution</CardTitle>
          <CardDescription>
            Temps moyen de résolution par commune et par type d'urgence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResolutionTimeChart data={resolutionTimeData} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Signalements par quartier / zone</CardTitle>
          <CardDescription>
            Classement calcule depuis les localisations enregistrees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PerformanceByCommuneChart data={quarterRows} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Performances des agents</CardTitle>
          <CardDescription>Missions assignees, actives et terminees.</CardDescription>
        </CardHeader>
        <CardContent>
          <PerformanceTable
            rows={agentRows}
            columns={["name", "commune", "assignes", "termines", "taux"]}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Performances des administrateurs</CardTitle>
          <CardDescription>Suivi par entite administrative.</CardDescription>
        </CardHeader>
        <CardContent>
          <PerformanceTable
            rows={adminRows}
            columns={["name", "commune", "signalements", "resolus", "taux"]}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Performances des bourgmestres</CardTitle>
          <CardDescription>Resultats consolides par commune.</CardDescription>
        </CardHeader>
        <CardContent>
          <PerformanceTable
            rows={bourgmestreRows}
            columns={["name", "commune", "signalements", "resolus", "taux"]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function PerformanceTable({
  rows,
  columns,
}: {
  rows: Record<string, unknown>[];
  columns: string[];
}) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Aucune donnee enregistree pour le moment.</p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <tr className="border-b">
            {columns.map((column) => (
              <th key={column} className="py-2 capitalize">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)} className="border-b border-border/60">
              {columns.map((column) => (
                <td key={column} className="py-2">
                  {String(row[column] ?? "-")}
                  {column === "taux" ? "%" : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function useKpiData(filteredReports: ReturnType<typeof useLiveReports>["items"]) {
  return useMemo(() => {
    const total = filteredReports.length;
    const resolus = filteredReports.filter((r) => r.status === "terminee").length;
    const volume = reportVolume(filteredReports);
    const tauxCollecte = total > 0 ? Math.round((resolus / total) * 100) : 0;
    const alertes = filteredReports.filter(
      (r) => r.urgency === "critique" || r.urgency === "eleve",
    ).length;
    const interventionUrgent = filteredReports.filter((r) => r.interventionUrgent).length;
    const env = environmentalIndicators(filteredReports);

    const communeCounts = filteredReports.reduce(
      (acc, r) => {
        acc[r.commune] = (acc[r.commune] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const topCommune = Object.entries(communeCounts).sort((a, b) => b[1] - a[1])[0];

    return [
      {
        title: "Signalements affichés",
        value: total.toLocaleString("fr-FR"),
        icon: AlertTriangle,
        color: "text-yellow-500",
      },
      {
        title: "Signalements résolus",
        value: resolus.toLocaleString("fr-FR"),
        icon: CheckCircle2,
        color: "text-green-500",
      },
      {
        title: "Volume estimé (m³)",
        value: volume.toLocaleString("fr-FR", { maximumFractionDigits: 0 }),
        icon: Trash2,
        color: "text-blue-500",
      },
      {
        title: "Dechets en attente",
        value: String(pendingReports(filteredReports).length),
        icon: Trash2,
        color: "text-amber-500",
      },
      {
        title: "Dechets recyclables",
        value: `${Math.round(recycledVolume(filteredReports))} m3`,
        icon: Recycle,
        color: "text-eco",
      },
      {
        title: "Depots sauvages",
        value: String(illegalDumpCount(filteredReports)),
        icon: AlertTriangle,
        color: "text-red-500",
      },
      {
        title: "Indice environnemental",
        value: `${env.cleanlinessScore}/100`,
        icon: ShieldCheck,
        color: "text-emerald-600",
      },
      {
        title: "Taux de collecte",
        value: `${tauxCollecte}%`,
        icon: Percent,
        color: "text-indigo-500",
      },
      {
        title: "Interventions urgentes",
        value: String(interventionUrgent),
        icon: AlertTriangle,
        color: "text-red-500",
      },
      {
        title: "Commune la + active",
        value: topCommune ? topCommune[0] : "N/A",
        icon: Trophy,
        color: "text-amber-500",
      },
      {
        title: "Alertes prioritaires",
        value: alertes.toLocaleString("fr-FR"),
        icon: AlertTriangle,
        color: "text-red-500",
      },
    ];
  }, [filteredReports]);
}

function GovernorDashboard() {
  const { items: liveReports } = useLiveReports();
  const [filters, setFilters] = useState({
    commune: "all",
    period: "all",
    category: "all",
    urgency: "all",
  });

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredReports = useMemo(() => {
    return liveReports.filter((report) => {
      if (filters.commune !== "all" && report.commune !== filters.commune) return false;
      if (filters.category !== "all" && report.category !== filters.category) return false;
      if (filters.urgency !== "all" && report.urgency !== filters.urgency) return false;
      if (filters.period !== "all") {
        const reportDate = new Date(report.createdAt);
        const now = new Date();
        let days = 0;
        if (filters.period === "24h") days = 1;
        else if (filters.period === "7d") days = 7;
        else if (filters.period === "30d") days = 30;
        if (days > 0) {
          const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
          if (reportDate < periodStart) return false;
        }
      }
      return true;
    });
  }, [liveReports, filters]);

  const kpiData = useKpiData(filteredReports);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="flex-1">
        <div className="border-b bg-card">
          <div className="container py-8">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-eco">
              <ShieldCheck className="size-4" /> Espace Gouverneur
            </div>
            <h1 className="mt-2 font-display text-4xl font-bold">
              Centre de Commandement Stratégique
            </h1>
            <p className="mt-1 text-muted-foreground">
              Vue d'ensemble en temps réel de la propreté et des opérations dans la ville de
              Kinshasa.
            </p>
          </div>
        </div>

        <div className="container py-8">
          <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border bg-card p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground lg:col-span-1">
              <Filter className="size-4 text-eco" />
              Filtrer les données
            </div>
            <Select value={filters.commune} onValueChange={(v) => handleFilterChange("commune", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les communes</SelectItem>
                {COMMUNES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.period} onValueChange={(v) => handleFilterChange("period", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.category}
              onValueChange={(v) => handleFilterChange("category", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.urgency} onValueChange={(v) => handleFilterChange("urgency", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {urgencyOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((item) => (
              <KpiCard key={item.title} item={item} />
            ))}
          </div>

          <Tabs defaultValue="overview" className="mt-8 w-full">
            <TabsList>
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="stats">Statistiques Détaillées</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Carte Opérationnelle de la Ville</CardTitle>
                    <CardDescription>
                      Visualisation des signalements, des infrastructures et des unités mobiles.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ClientOnly
                      fallback={<div className="h-[500px] animate-pulse rounded-lg bg-muted" />}
                    >
                      {() => <GovernorMap reports={filteredReports} />}
                    </ClientOnly>
                  </CardContent>
                </Card>
                <GovernorCharts reports={filteredReports} />
              </div>
            </TabsContent>
            <TabsContent value="stats" className="mt-4">
              <GovernorStatsTab reports={filteredReports} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
