import { createFileRoute } from "@tanstack/react-router";
import { useAccess } from "@/lib/access-store";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AccessGate } from "@/components/access-gate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Assurez-vous que ce chemin est correct
import { AlertTriangle, BarChart3, Building, CheckCircle2, FileDown, Percent } from "lucide-react";
import { useMemo, useState } from "react";
import { COLLECTION_POINTS, COMMUNES, URGENCY_META, useLiveReports } from "@/lib/eco-store";
import { useAuthorityLocalStore } from "@/lib/authority-local-store";
import { ClientOnly } from "@/components/client-only";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { InteractiveMap } from "@/components/interactive-map";
import { WasteReports } from "@/components/waste-reports";

function KpiCard({
  item,
}: {
  item: { title: string; value: string; icon: typeof AlertTriangle; color: string };
}) {
  const Icon = item.icon;
  return (
    <Card>
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
        <Icon className={item.color + " size-5"} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{item.value}</div>
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute("/bourgmestre")({
  head: () => ({
    meta: [
      { title: "Tableau de Bord Bourgmestre — EcoKin Smart" },
      {
        name: "description",
        content:
          "Tableau de bord décisionnel pour le bourgmestre : signalements, collecte, zones critiques et indicateurs de performance de la commune.",
      },
    ],
  }),
  component: () => (
    <AccessGate required={["bourgmestre"]} title="Tableau de Bord Bourgmestre">
      <BourgmestreDashboard />
    </AccessGate>
  ),
});

function EvolutionChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
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
      const name =
        i === 0 ? "Auj." : i === 1 ? "Hier" : d.toLocaleDateString("fr-FR", { weekday: "short" });
      return {
        name,
        créés: reports.filter((r) => r.createdAt.startsWith(dayStr)).length,
        résolus: reports.filter(
          (r) =>
            r.status === "terminee" &&
            r.history.find((h) => h.label.startsWith("Statut →"))?.at?.startsWith(dayStr),
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
          (r) =>
            r.status === "terminee" &&
            r.history.find((h) => h.label.startsWith("Statut →"))?.at?.startsWith(monthStr),
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
        <CardDescription>
          Suivi des signalements créés et résolus sur différentes périodes.
        </CardDescription>
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
    return reports
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [reports]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Derniers signalements</CardTitle>
        <CardDescription>
          Suivi des 10 dernières interventions enregistrées dans la commune.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <WasteReports reports={recentReports} />
        </div>
      </CardContent>
    </Card>
  );
}

function LocalManagement({ commune }: { commune: string }) {
  const store = useAuthorityLocalStore();
  const [pme, setPme] = useState({ name: "", manager: "", phone: "" });
  const [team, setTeam] = useState({ name: "", pmeId: "" });
  const [agent, setAgent] = useState({ name: "", phone: "", teamId: "" });
  const [activity, setActivity] = useState({
    label: "",
    teamId: "",
    agentId: "",
    status: "planifiee" as const,
  });

  const pmes = store.pmes.filter((item) => item.commune === commune);
  const teams = store.teams.filter((item) => item.commune === commune);
  const agents = store.agents.filter((item) => item.commune === commune);
  const activities = store.activities.filter((item) => item.commune === commune);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Gestion locale</CardTitle>
          <CardDescription>
            PME, équipes et agents actifs uniquement dans votre commune.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form
            className="grid gap-2 sm:grid-cols-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!pme.name.trim()) return;
              store.addPme({ ...pme, commune });
              setPme({ name: "", manager: "", phone: "" });
            }}
          >
            <input
              className="rounded-lg border bg-background px-3 py-2 text-sm sm:col-span-2"
              placeholder="PME de collecte"
              value={pme.name}
              onChange={(e) => setPme({ ...pme, name: e.target.value })}
            />
            <input
              className="rounded-lg border bg-background px-3 py-2 text-sm"
              placeholder="Responsable"
              value={pme.manager}
              onChange={(e) => setPme({ ...pme, manager: e.target.value })}
            />
            <button className="rounded-lg bg-eco px-3 py-2 text-sm font-bold text-white">
              Enregistrer PME
            </button>
          </form>
          <form
            className="grid gap-2 sm:grid-cols-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!team.name.trim()) return;
              store.addTeam({ ...team, commune, pmeId: team.pmeId || undefined });
              setTeam({ name: "", pmeId: "" });
            }}
          >
            <input
              className="rounded-lg border bg-background px-3 py-2 text-sm sm:col-span-2"
              placeholder="Équipe de collecte"
              value={team.name}
              onChange={(e) => setTeam({ ...team, name: e.target.value })}
            />
            <select
              className="rounded-lg border bg-background px-3 py-2 text-sm"
              value={team.pmeId}
              onChange={(e) => setTeam({ ...team, pmeId: e.target.value })}
            >
              <option value="">PME</option>
              {pmes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <button className="rounded-lg bg-eco px-3 py-2 text-sm font-bold text-white">
              Créer équipe
            </button>
          </form>
          <form
            className="grid gap-2 sm:grid-cols-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!agent.name.trim()) return;
              store.addAgent({ ...agent, commune, teamId: agent.teamId || undefined });
              setAgent({ name: "", phone: "", teamId: "" });
            }}
          >
            <input
              className="rounded-lg border bg-background px-3 py-2 text-sm"
              placeholder="Nom agent"
              value={agent.name}
              onChange={(e) => setAgent({ ...agent, name: e.target.value })}
            />
            <input
              className="rounded-lg border bg-background px-3 py-2 text-sm"
              placeholder="Téléphone"
              value={agent.phone}
              onChange={(e) => setAgent({ ...agent, phone: e.target.value })}
            />
            <select
              className="rounded-lg border bg-background px-3 py-2 text-sm"
              value={agent.teamId}
              onChange={(e) => setAgent({ ...agent, teamId: e.target.value })}
            >
              <option value="">Équipe</option>
              {teams.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <button className="rounded-lg bg-eco px-3 py-2 text-sm font-bold text-white">
              Ajouter agent
            </button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Activités et effectifs</CardTitle>
          <CardDescription>Suivi des activités réalisées par équipe et par agent.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="grid gap-2 sm:grid-cols-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!activity.label.trim()) return;
              store.addActivity({
                ...activity,
                commune,
                teamId: activity.teamId || undefined,
                agentId: activity.agentId || undefined,
              });
              setActivity({ label: "", teamId: "", agentId: "", status: "planifiee" });
            }}
          >
            <input
              className="rounded-lg border bg-background px-3 py-2 text-sm sm:col-span-2"
              placeholder="Activité"
              value={activity.label}
              onChange={(e) => setActivity({ ...activity, label: e.target.value })}
            />
            <select
              className="rounded-lg border bg-background px-3 py-2 text-sm"
              value={activity.teamId}
              onChange={(e) => setActivity({ ...activity, teamId: e.target.value })}
            >
              <option value="">Équipe</option>
              {teams.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <button className="rounded-lg bg-eco px-3 py-2 text-sm font-bold text-white">
              Ajouter activité
            </button>
          </form>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">PME</div>
              <div className="text-2xl font-bold">{pmes.length}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Équipes</div>
              <div className="text-2xl font-bold">{teams.length}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Agents</div>
              <div className="text-2xl font-bold">{agents.length}</div>
            </div>
          </div>
          <div className="max-h-64 overflow-auto rounded-xl border">
            <table className="w-full text-sm">
              <tbody>
                {agents.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-3 py-2 font-semibold">{item.name}</td>
                    <td className="px-3 py-2 font-mono text-xs">{item.uniqueNumber}</td>
                  </tr>
                ))}
                {activities.map((item) => (
                  <tr key={item.id} className="border-b bg-muted/30">
                    <td className="px-3 py-2">{item.label}</td>
                    <td className="px-3 py-2 text-xs capitalize">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BourgmestreDashboard() {
  const { session } = useAccess();
  const { items: liveReports } = useLiveReports();
  const localStore = useAuthorityLocalStore();

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
    const volume = communeReports.reduce((sum, report) => sum + (report.volumeM3 ?? 0), 0);
    const poidsTotal = communeReports.reduce((sum, report) => sum + (report.weightTons ?? 0), 0);
    const critiques = communeReports.filter(
      (r) => r.priorityLevel === "critique" || r.urgency === "critique",
    ).length;
    const pmes = localStore.pmes.filter((item) => item.commune === session.commune).length;
    const teams = localStore.teams.filter((item) => item.commune === session.commune).length;
    const agents = localStore.agents.filter((item) => item.commune === session.commune).length;
    const activities = localStore.activities.filter(
      (item) => item.commune === session.commune,
    ).length;
    const tauxCollecte = total > 0 ? Math.round((resolus / total) * 100) : 0;
    return [
      {
        title: "Volume total",
        value: `${Math.round(volume)} m³`,
        icon: CheckCircle2,
        color: "text-green-500",
      },
      {
        title: "Poids estimé",
        value: `${poidsTotal.toFixed(1)} t`,
        icon: AlertTriangle,
        color: "text-yellow-500",
      },
      {
        title: "Signalements critiques",
        value: String(critiques),
        icon: AlertTriangle,
        color: "text-red-500",
      },
      { title: "Équipes actives", value: String(teams), icon: Building, color: "text-blue-500" },
      { title: "PME partenaires", value: String(pmes), icon: Building, color: "text-eco" },
      {
        title: "Agents actifs",
        value: String(agents),
        icon: CheckCircle2,
        color: "text-indigo-500",
      },
      {
        title: "Signalements en attente",
        value: String(en_attente),
        icon: AlertTriangle,
        color: "text-orange-500",
      },
      {
        title: "Taux de collecte",
        value: `${tauxCollecte}%`,
        icon: Percent,
        color: "text-indigo-500",
      },
    ];
  }, [communeReports, communeCollectionPoints, localStore, session.commune]);

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
                  <h1 className="font-display text-4xl font-bold">
                    Tableau de Bord · {communeName}
                  </h1>
                  <p className="mt-1 text-muted-foreground">
                    Vue d'ensemble des opérations et de la propreté de votre commune.
                  </p>
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
                  <CardDescription>
                    Visualisation des signalements et infrastructures de la commune.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ClientOnly
                    fallback={<div className="h-[400px] animate-pulse rounded-lg bg-muted" />}
                  >
                    <InteractiveMap commune={session.commune} reports={communeReports} />
                  </ClientOnly>
                </CardContent>
              </Card>
              <BourgmestreCharts reports={communeReports} />
              <RecentReportsTable reports={communeReports} />
            </div>
            {session.commune && (
              <div className="mt-8">
                <LocalManagement commune={session.commune} />
              </div>
            )}
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
