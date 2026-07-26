import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AccessGate } from "@/components/access-gate";
import { REWARDS, WASTE_CATEGORIES } from "@/lib/data";
import { useLearning } from "@/lib/learning-store";
import { useLiveReports, useHouseholds, COMMUNE_BUDGET, COMMUNES, URGENCY_META, STATUS_META, LiveStatus, useWasteTax } from "@/lib/eco-store";
import { AUTH_USERS, useAccess } from "@/lib/access-store";
import {
  Activity,
  AlertTriangle,
  Bell,
  Brain,
  Building,
  Database,
  Gift,
  Map,
  Settings,
  Home,
  ShieldCheck,
  TrendingUp,
  Trash2,
  User,
  Users,
  UserCog,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from "recharts";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { resetAllEcoKinData } from "@/lib/utils";
import { deleteUser, updateUser, upsertUser, useEcokinDb } from "@/lib/ecokin-db";
import { filterReportsByScope } from "@/lib/dashboard-analytics";
import {
  useAdminSettings,
  LANGUAGES,
  TIMEZONES,
  MAP_PROVIDERS,
  BACKUP_FREQUENCIES,
  SMS_PROVIDERS,
  AI_MODELS,
} from "@/lib/admin-settings-store";
import type {
  AdminProfile,
  PlatformConfig,
  NotificationSettings,
  SecuritySettings,
  WasteCollectionSettings,
  GisSettings,
  AiSettings,
  BackupSettings,
} from "@/lib/admin-settings-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administration — EcoKin Smart" },
      { name: "description", content: "Espace administrateur de la plateforme EcoKin Smart." },
    ],
  }),
  component: () => (
    <AccessGate required={["admin"]} title="Administration EcoKin">
      <AdminPage />
    </AccessGate>
  ),
});

const TABS = [
  { id: "overview", label: "Vue d'ensemble", icon: Activity },
  { id: "ia", label: "Validation IA", icon: Brain },
  { id: "users", label: "Utilisateurs & Rôles", icon: UserCog },
  { id: "households", label: "Ménages", icon: Home },
  { id: "reports", label: "Signalements", icon: Database },
  { id: "rewards", label: "Récompenses", icon: Gift },
  { id: "settings", label: "Paramètres", icon: Settings },
] as const;

function AdminPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const { items: reports } = useLiveReports();
  const { households } = useHouseholds();
  const { totalPaid } = useWasteTax();
  const { session } = useAccess();
  const db = useEcokinDb();
  const scopedReports = useMemo(() => filterReportsByScope(reports, session), [reports, session]);
  const scopedUsers = useMemo(
    () => db.users.filter((user) => !session.commune || user.role === "gouverneur" || user.commune === session.commune),
    [db.users, session.commune],
  );
  const totalUsers = scopedUsers.length;
  const totalBudget = Object.values(COMMUNE_BUDGET).reduce((s, b) => s + b.mensuel, 0);
  const kpis = { totalUsers, totalReports: scopedReports.length, totalBudget, totalHouseholds: households.length, totalTaxPaid: totalPaid };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-eco">
            <UserCog className="size-4" />
            Espace Administrateur
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold">Centre de Contrôle Principal</h1>
          <p className="mt-1 text-muted-foreground">
            Gestion et supervision de l'ensemble des modules, utilisateurs et paramètres de la plateforme EcoKin Smart.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${tab === t.id
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50"
                }`}
            >
              <t.icon className="size-4" /> {t.label}
            </button>
          ))}
        </aside>

        <div className="space-y-6">
          {tab === "overview" && <Overview reports={scopedReports} kpis={kpis} />}
          {tab === "ia" && <IATab />}
          {tab === "users" && <UsersTab />}
          {tab === "households" && <HouseholdsTab />}
          {tab === "reports" && <ReportsTab />}
          {tab === "rewards" && <RewardsTab />}
          {tab === "settings" && <SettingsTab />}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function ReportsByCommuneChart({ data }: { data: { name: string, Signalements: number }[] }) {
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
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: "hsl(var(--accent))" }}
          contentStyle={{
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="Signalements" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const STATUS_CHART_COLORS: Record<LiveStatus, string> = {
  en_attente: "#f59e0b", // amber
  assignee: "#3b82f6", // blue
  en_cours: "#8b5cf6", // violet
  terminee: "#10b981", // green
  rejete: "#ef4444", // red
};

function ReportsByStatusChart({ data }: { data: { name: string, value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          labelLine={false}
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
            const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
            return <text x={x} y={y} fill="currentColor" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs">{`${(percent * 100).toFixed(0)}%`}</text>;
          }}
        >
          {data.map((entry) => (
            <Cell key={`cell-${entry.name}`} fill={STATUS_CHART_COLORS[entry.name as LiveStatus] ?? '#8884d8'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function Overview({ kpis, reports }: { kpis: { totalUsers: number; totalReports: number; totalBudget: number; totalHouseholds: number; totalTaxPaid: number }, reports: ReturnType<typeof useLiveReports>['items'] }) {
  const reportsByCommune = useMemo(() => {
    const counts = reports.reduce((acc, r) => { acc[r.commune] = (acc[r.commune] || 0) + 1; return acc; }, {} as Record<string, number>);
    return Object.entries(counts).map(([id, count]) => ({ name: COMMUNES.find(c => c.id === id)?.name || id, Signalements: count })).sort((a, b) => b.Signalements - a.Signalements);
  }, [reports]);

  const reportsByStatus = useMemo(() => {
    const counts = reports.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {} as Record<LiveStatus, number>);
    return Object.entries(counts).map(([status, count]) => ({ name: STATUS_META[status as LiveStatus]?.label ?? status, value: count }));
  }, [reports]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Utilisateurs", v: kpis.totalUsers.toLocaleString("fr-FR"), d: "Tous rôles confondus" },
          { l: "Ménages & PME", v: kpis.totalHouseholds.toLocaleString("fr-FR"), d: "Comptes enregistrés" },
          { l: "Signalements totaux", v: kpis.totalReports.toLocaleString("fr-FR"), d: "Depuis le lancement" },
          { l: "Recettes taxe (CDF)", v: `${(kpis.totalTaxPaid / 1e6).toFixed(2)} M`, d: "Total perçu" },
        ].map((k, i) => (
          <div key={k.l} className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {k.l}
            </div>
            <div className="mt-2 font-display text-2xl font-bold">{k.v}</div>
            <div className="mt-1 text-xs text-muted-foreground">{k.d}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-display text-lg font-bold">Répartition par commune</h3>
          <ReportsByCommuneChart data={reportsByCommune} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-display text-lg font-bold">Répartition par statut</h3>
          <ReportsByStatusChart data={reportsByStatus} />
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 font-display text-lg font-bold">Journal système</h3>
        <ul className="space-y-2 font-mono text-xs">
          {[
            "[06:42] IA · 142 photos analysées (lot batch_2026_06_19)",
            "[06:30] Notification push envoyée à 1 284 citoyens · Kisenso",
            "[05:58] Backup base de données : OK (124 Mo)",
            "[05:15] Synchro SIG cadastrale Kinshasa : 3 communes à jour",
            "[03:00] Tâche cron rapport mensuel : généré",
          ].map((l, i) => (
            <li key={i} className="border-b border-border/60 py-1.5 text-muted-foreground">
              {l}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function HouseholdsByKindChart({ data }: { data: { name: string, value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
          <Cell fill="hsl(var(--eco))" />
          <Cell fill="hsl(var(--primary))" />
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function HouseholdsTab() {
  const { households } = useHouseholds();
  const [filters, setFilters] = useState({ q: "", commune: "all", kind: "all" });

  const filteredHouseholds = useMemo(() => {
    return households.filter(h => {
      if (filters.commune !== 'all' && h.commune !== filters.commune) return false;
      if (filters.kind !== 'all' && h.kind !== filters.kind) return false;
      if (filters.q && !`${h.name} ${h.address} ${h.phone}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
      return true;
    });
  }, [households, filters]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const byKind = useMemo(() => {
    const menages = households.filter(h => h.kind === 'menage').length;
    const pme = households.filter(h => h.kind === 'pme').length;
    return [{ name: 'Ménages', value: menages }, { name: 'PME', value: pme }];
  }, [households]);

  const byCommune = useMemo(() => {
    const counts = households.reduce((acc, h) => { acc[h.commune] = (acc[h.commune] || 0) + 1; return acc; }, {} as Record<string, number>);
    return Object.entries(counts).map(([id, count]) => ({ name: COMMUNES.find(c => c.id === id)?.name || id, Signalements: count })).sort((a, b) => b.Signalements - a.Signalements);
  }, [households]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-display text-lg font-bold">Répartition par type</h3>
          <HouseholdsByKindChart data={byKind} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-display text-lg font-bold">Répartition par commune</h3>
          <ReportsByCommuneChart data={byCommune} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 font-display text-lg font-bold">Gestion des ménages ({filteredHouseholds.length} / {households.length})</h3>
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Input placeholder="Rechercher nom, adresse, tél..." value={filters.q} onChange={e => handleFilterChange('q', e.target.value)} />
          <Select value={filters.commune} onValueChange={v => handleFilterChange('commune', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les communes</SelectItem>
              {COMMUNES.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.kind} onValueChange={v => handleFilterChange('kind', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="menage">Ménage</SelectItem>
              <SelectItem value="pme">PME</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2">Nom</th>
                <th>Type</th>
                <th>Commune</th>
                <th>Bac</th>
                <th>Téléphone</th>
              </tr>
            </thead>
            <tbody>
              {filteredHouseholds.slice(0, 100).map((h) => (
                <tr key={h.id} className="border-b border-border/60">
                  <td className="py-2 font-semibold">{h.name}</td>
                  <td className="capitalize">{h.kind}</td>
                  <td>{h.commune}</td>
                  <td>{h.binType}</td>
                  <td className="font-mono text-xs">{h.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const db = useEcokinDb();
  const { session } = useAccess();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState<any | null>(null);

  const allUsers = useMemo(() => {
    return db.users
      .filter((user) => !session.commune || user.role === "gouverneur" || user.commune === session.commune)
      .map((user) => ({
        ...user,
        status: user.active ? "Actif" : "Inactif",
        isAuthority: user.role !== "citoyen",
      }));
  }, [db.users, session.commune]);

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleSave = (data: any) => {
    if (editingUser) {
      updateUser(editingUser.id, data);
      toast.success("Utilisateur mis à jour.");
    } else {
      upsertUser({
        role: data.role ?? "citoyen",
        name: data.name,
        identifier: data.phone || data.identifier,
        password: data.pin || data.password || "0000",
        phone: data.phone,
        commune: data.commune,
      });
      toast.success("Utilisateur créé.");
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (deletingUser) {
      deleteUser(deletingUser.id);
      toast.success("Utilisateur supprimé.");
      setDeletingUser(null);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold">
          Gestion des utilisateurs et des rôles ({allUsers.length})
        </h3>
        <button onClick={handleCreate} className="rounded-md bg-eco px-3 py-1.5 text-xs font-bold text-white">
          Créer un utilisateur
        </button>
      </div>
      <table className="w-full text-sm">
        <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <tr className="border-b border-border">
            <th className="py-2">Rôle</th>
            <th>Nom</th>
            <th>Statut</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {allUsers.map((l) => (
            <tr key={l.id} className="border-b border-border/60">
              <td className="py-2 font-semibold capitalize">{l.role}</td>
              <td>{l.name}</td>
              <td>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${l.status === "Actif" ? "bg-eco/15 text-eco" : "bg-slate-500/15 text-slate-600"
                    }`}
                >
                  {l.status}
                </span>
              </td>
              {!l.isAuthority ? (
                <td className="space-x-1">
                  <button onClick={() => handleEdit(l)} className="rounded-md border border-border px-2 py-1 text-xs">Modifier</button>
                  <button onClick={() => setDeletingUser(l)} className="rounded-md border border-border px-2 py-1 text-xs text-red-600">Supprimer</button>
                </td>
              ) : <td className="text-xs text-muted-foreground">Non modifiable</td>}
            </tr>
          ))}
        </tbody>
      </table>

      <UserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        user={editingUser}
      />

      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur "{deletingUser?.name}" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function UserForm({ isOpen, onClose, onSave, user }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void; user: any | null }) {
  const [formData, setFormData] = useState({ name: "", commune: "", phone: "" });

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, commune: user.commune, phone: user.phone });
    } else {
      setFormData({ name: "", commune: "gombe", phone: "" });
    }
  }, [user, isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave({ ...user, ...formData, kind: user?.kind || 'menage', occupants: user?.occupants || 1, binType: user?.binType || '120L' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? "Modifier l'utilisateur" : "Créer un utilisateur"}</DialogTitle>
          <DialogDescription>
            Gérer les informations d'un compte citoyen.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commune">Commune</Label>
            <Select value={formData.commune} onValueChange={(v) => handleChange("commune", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMUNES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReportsTab() {
  const { items: reports, setStatus } = useLiveReports();
  const { session } = useAccess();
  const [filters, setFilters] = useState({ q: "", commune: "all", status: "all", urgency: "all" });

  const filteredReports = useMemo(() => {
    const scopedReports = filterReportsByScope(reports, session);
    return scopedReports.filter(r => {
      if (filters.commune !== 'all' && r.commune !== filters.commune) return false;
      if (filters.status !== 'all' && r.status !== filters.status) return false;
      if (filters.urgency !== 'all' && r.urgency !== filters.urgency) return false;
      if (filters.q && !`${r.id} ${r.description}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
      return true;
    });
  }, [reports, filters, session]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-display text-lg font-bold">Modération des signalements ({filteredReports.length} / {reports.length})</h3>
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <Input placeholder="Rechercher ID, description..." value={filters.q} onChange={e => handleFilterChange('q', e.target.value)} />
        <Select value={filters.commune} onValueChange={v => handleFilterChange('commune', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les communes</SelectItem>
            {COMMUNES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.status} onValueChange={v => handleFilterChange('status', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(STATUS_META).map(([key, meta]) => <SelectItem key={key} value={key}>{meta.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.urgency} onValueChange={v => handleFilterChange('urgency', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les urgences</SelectItem>
            {Object.entries(URGENCY_META).map(([key, meta]) => <SelectItem key={key} value={key}>{meta.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-2">ID</th>
              <th>Commune</th>
              <th>Urgence</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.slice(0, 50).map((r) => (
              <tr key={r.id} className="border-b border-border/60">
                <td className="py-2 font-mono text-xs">{r.id}</td>
                <td className="capitalize">{r.commune}</td>
                <td><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${URGENCY_META[r.urgency]?.bg} ${URGENCY_META[r.urgency]?.color}`}>{URGENCY_META[r.urgency]?.label}</span></td>
                <td><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_META[r.status]?.color}`}>{STATUS_META[r.status]?.label}</span></td>
                <td className="space-x-1">
                  <button onClick={() => setStatus(r.id, 'terminee', session.name)} className="rounded-md bg-eco/10 px-2 py-1 text-xs font-semibold text-eco">Valider</button>
                  <button onClick={() => setStatus(r.id, 'rejete', session.name)} className="rounded-md bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-600">Rejeter</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RewardsTab() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-display text-lg font-bold">Catalogue partenaires</h3>
      <ul className="divide-y divide-border">
        {REWARDS.map((r) => (
          <li key={r.id} className="flex items-center justify-between py-3">
            <div>
              <div className="font-semibold">{r.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{r.kind}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-eco">{r.cost} GP</span>
              <button className="rounded-md border border-border px-2 py-1 text-xs">Éditer</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TaxSettings() {
  const { rates, updateRates } = useWasteTax();
  const [currentRates, setCurrentRates] = useState(rates);

  useEffect(() => {
    setCurrentRates(rates);
  }, [rates]);

  const handleSave = () => {
    updateRates(currentRates);
    toast.success("Tarifs de la taxe déchets mis à jour.");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-display text-lg font-bold">Gestion des tarifs de la taxe déchets</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rate-120L">Tarif Bac 120L (CDF/mois)</Label>
            <Input
              id="rate-120L"
              type="number"
              value={currentRates.bin["120L"]}
              onChange={(e) => setCurrentRates(prev => ({ ...prev, bin: { ...prev.bin, "120L": Number(e.target.value) } }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate-240L">Tarif Bac 240L (CDF/mois)</Label>
            <Input
              id="rate-240L"
              type="number"
              value={currentRates.bin["240L"]}
              onChange={(e) => setCurrentRates(prev => ({ ...prev, bin: { ...prev.bin, "240L": Number(e.target.value) } }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate-660L">Tarif Bac 660L (CDF/mois)</Label>
            <Input
              id="rate-660L"
              type="number"
              value={currentRates.bin["660L"]}
              onChange={(e) => setCurrentRates(prev => ({ ...prev, bin: { ...prev.bin, "660L": Number(e.target.value) } }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate-pme">Coefficient PME</Label>
            <Input id="rate-pme" type="number" step="0.1" value={currentRates.pmeMultiplier} onChange={(e) => setCurrentRates(prev => ({ ...prev, pmeMultiplier: Number(e.target.value) }))} />
          </div>
        </div>
        <Button onClick={handleSave}>Enregistrer les tarifs</Button>
      </div>
    </div>
  );
}

function RewardForm({ isOpen, onClose, onSave, reward }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void; reward: any | null }) {
  const [formData, setFormData] = useState({ name: "", kind: "Crédit", cost: 1000 });

  useEffect(() => {
    if (reward) {
      setFormData({ name: reward.name, kind: reward.kind, cost: reward.cost });
    } else {
      setFormData({ name: "", kind: "Crédit", cost: 1000 });
    }
  }, [reward, isOpen]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave({ ...reward, ...formData });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{reward ? "Modifier la récompense" : "Créer une récompense"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la récompense</Label>
            <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kind">Catégorie</Label>
            <Input id="kind" value={formData.kind} onChange={(e) => handleChange("kind", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost">Coût (Green Points)</Label>
            <Input id="cost" type="number" value={formData.cost} onChange={(e) => handleChange("cost", Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RewardsSettings() {
  // Note: In a real app, this would come from a global store like useRewards()
  const [rewards, setRewards] = useState(REWARDS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<any | null>(null);

  const handleSave = (data: any) => {
    if (editingReward) {
      setRewards(rewards.map(r => r.id === data.id ? data : r));
      toast.success("Récompense mise à jour.");
    } else {
      setRewards([...rewards, { ...data, id: `rew_${Date.now()}` }]);
      toast.success("Récompense ajoutée.");
    }
    setIsFormOpen(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">Gestion des récompenses Green Points</h3>
        <Button size="sm" onClick={() => { setEditingReward(null); setIsFormOpen(true); }}>Ajouter</Button>
      </div>
      <ul className="mt-4 divide-y divide-border">
        {rewards.map((r) => (
          <li key={r.id} className="flex items-center justify-between py-3">
            <div>
              <div className="font-semibold">{r.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{r.kind} · {r.cost} GP</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditingReward(r); setIsFormOpen(true); }}>Modifier</Button>
            </div>
          </li>
        ))}
      </ul>
      <RewardForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSave} reward={editingReward} />
    </div>
  );
}

function SettingsTab() {
  const { settings, updateSection, resetSettings, exportSettings, importSettings } = useAdminSettings();
  const [settingsTab, setSettingsTab] = useState<string>("profile");
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);

  const SETTINGS_TABS = [
    { id: "profile", label: "Profil administrateur", icon: User },
    { id: "platform", label: "Configuration générale", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Sécurité", icon: ShieldCheck },
    { id: "waste", label: "Collecte des déchets", icon: Trash2 },
    { id: "gis", label: "Cartographie / SIG", icon: Map },
    { id: "ai", label: "Intelligence Artificielle", icon: Brain },
    { id: "backup", label: "Sauvegarde & données", icon: Database },
    { id: "danger", label: "Zone dangereuse", icon: AlertTriangle },
  ] as const;

  const handleImport = () => {
    if (!importJson.trim()) return;
    const success = importSettings(importJson);
    if (success) {
      setImportSuccess(true);
      setImportError("");
      setTimeout(() => setImportSuccess(false), 3000);
    } else {
      setImportError("JSON invalide. Vérifiez le format.");
    }
  };

  const handleExport = () => {
    const json = exportSettings();
    navigator.clipboard.writeText(json).then(() => {
      setExportCopied(true);
      setTimeout(() => setExportCopied(false), 3000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Sous-navigation des paramètres */}
      <div className="flex flex-wrap gap-1 rounded-2xl border border-border bg-card p-2">
        {SETTINGS_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSettingsTab(t.id)}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
              settingsTab === t.id
                ? "bg-eco text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <t.icon className="size-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenu des paramètres */}
      {settingsTab === "profile" && <ProfileSettings profile={settings.profile} onUpdate={(v) => updateSection("profile", v)} />}
      {settingsTab === "platform" && <PlatformSettings platform={settings.platform} onUpdate={(v) => updateSection("platform", v)} />}
      {settingsTab === "notifications" && <NotificationSettingsSection notifications={settings.notifications} onUpdate={(v) => updateSection("notifications", v)} />}
      {settingsTab === "security" && <SecuritySettingsSection security={settings.security} onUpdate={(v) => updateSection("security", v)} />}
      {settingsTab === "waste" && <WasteCollectionSettingsSection waste={settings.wasteCollection} onUpdate={(v) => updateSection("wasteCollection", v)} />}
      {settingsTab === "gis" && <GisSettingsSection gis={settings.gis} onUpdate={(v) => updateSection("gis", v)} />}
      {settingsTab === "ai" && <AiSettingsSection ai={settings.ai} onUpdate={(v) => updateSection("ai", v)} />}
      {settingsTab === "backup" && <BackupSettingsSection backup={settings.backup} onUpdate={(v) => updateSection("backup", v)} />}
      {settingsTab === "danger" && (
        <div className="space-y-6">
          {/* Zone dangereuse */}
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
            <h3 className="mb-1 font-display text-lg font-bold text-red-700">Réinitialisation complète de la plateforme</h3>
            <p className="text-sm text-muted-foreground">
              Supprime tous les signalements, statistiques, ménages enregistrés, GPS flotte,
              notifications, journaux d'audit et sessions autorités. Les compteurs repartent à 0.
            </p>
            {!confirmingReset ? (
              <button
                onClick={() => setConfirmingReset(true)}
                className="mt-4 rounded-xl border border-red-500/40 bg-white px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-500/10"
              >
                Réinitialiser toutes les données
              </button>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-red-700">Cette action est irréversible.</span>
                <button
                  onClick={async () => {
                    resetAllEcoKinData();
                    setResetDone(true);
                    setTimeout(() => window.location.reload(), 800);
                  }}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white"
                >
                  Confirmer la réinitialisation
                </button>
                <button
                  onClick={() => setConfirmingReset(false)}
                  className="rounded-xl border border-border px-3 py-2 text-sm font-semibold"
                >
                  Annuler
                </button>
                {resetDone && <span className="text-xs font-semibold text-eco">✓ Données remises à zéro…</span>}
              </div>
            )}
          </div>

          {/* Réinitialisation des paramètres */}
          <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-6">
            <h3 className="mb-1 font-display text-lg font-bold text-orange-700">Réinitialiser les paramètres</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Remet tous les paramètres de la plateforme à leurs valeurs par défaut.
            </p>
            <button
              onClick={() => {
                resetSettings();
                toast.success("Paramètres réinitialisés aux valeurs par défaut.");
              }}
              className="rounded-xl border border-orange-500/40 bg-white px-4 py-2 text-sm font-bold text-orange-700 hover:bg-orange-500/10"
            >
              Réinitialiser les paramètres
            </button>
          </div>

          {/* Export / Import des paramètres */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-1 font-display text-lg font-bold">Export / Import des paramètres</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Exportez la configuration pour la sauvegarder ou importez une configuration existante.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExport}
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted/50"
              >
                {exportCopied ? "✓ Copié dans le presse-papier" : "Exporter la configuration"}
              </button>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="import-json">Importer une configuration (JSON)</Label>
              <textarea
                id="import-json"
                value={importJson}
                onChange={(e) => { setImportJson(e.target.value); setImportError(""); setImportSuccess(false); }}
                rows={4}
                className="w-full rounded-xl border border-border bg-background p-3 text-xs font-mono focus:border-eco focus:outline-none focus:ring-2 focus:ring-eco/30"
                placeholder="Collez le JSON de configuration ici..."
              />
              {importError && <p className="text-xs font-semibold text-red-600">{importError}</p>}
              {importSuccess && <p className="text-xs font-semibold text-eco">✓ Configuration importée avec succès.</p>}
              <Button onClick={handleImport} disabled={!importJson.trim()}>Importer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Composants de paramètres
// ============================================================

function ProfileSettings({ profile, onUpdate }: { profile: AdminProfile; onUpdate: (v: Partial<AdminProfile>) => void }) {
  const [form, setForm] = useState(profile);
  useEffect(() => setForm(profile), [profile]);

  const handleSave = () => {
    onUpdate(form);
    toast.success("Profil administrateur mis à jour.");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-display text-lg font-bold">Profil administrateur</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="admin-name">Nom complet</Label>
          <Input id="admin-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-title">Titre / Fonction</Label>
          <Input id="admin-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-email">Email</Label>
          <Input id="admin-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-phone">Téléphone</Label>
          <Input id="admin-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
      </div>
      <Button className="mt-4" onClick={handleSave}>Enregistrer le profil</Button>
    </div>
  );
}

function PlatformSettings({ platform, onUpdate }: { platform: PlatformConfig; onUpdate: (v: Partial<PlatformConfig>) => void }) {
  const [form, setForm] = useState(platform);
  useEffect(() => setForm(platform), [platform]);

  const handleSave = () => {
    onUpdate(form);
    toast.success("Configuration générale mise à jour.");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-display text-lg font-bold">Configuration générale de la plateforme</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="platform-name">Nom de la plateforme</Label>
          <Input id="platform-name" value={form.platformName} onChange={(e) => setForm({ ...form, platformName: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="platform-website">Site web</Label>
          <Input id="platform-website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="platform-desc">Description</Label>
          <textarea
            id="platform-desc"
            value={form.platformDescription}
            onChange={(e) => setForm({ ...form, platformDescription: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-border bg-background p-3 text-sm focus:border-eco focus:outline-none focus:ring-2 focus:ring-eco/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="platform-email">Email de contact</Label>
          <Input id="platform-email" type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="platform-phone">Téléphone de contact</Label>
          <Input id="platform-phone" type="tel" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="platform-address">Adresse</Label>
          <Input id="platform-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="platform-lang">Langue par défaut</Label>
          <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v as any })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="platform-tz">Fuseau horaire</Label>
          <Select value={form.timezone} onValueChange={(v) => setForm({ ...form, timezone: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="platform-currency">Devise</Label>
          <Input id="platform-currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch
            id="maintenance-mode"
            checked={form.maintenanceMode}
            onCheckedChange={(v) => setForm({ ...form, maintenanceMode: v })}
          />
          <Label htmlFor="maintenance-mode" className="font-semibold text-red-600">Mode maintenance</Label>
        </div>
        {form.maintenanceMode && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="maintenance-msg">Message de maintenance</Label>
            <Input id="maintenance-msg" value={form.maintenanceMessage} onChange={(e) => setForm({ ...form, maintenanceMessage: e.target.value })} />
          </div>
        )}
      </div>
      <Button className="mt-4" onClick={handleSave}>Enregistrer la configuration</Button>
    </div>
  );
}

function NotificationSettingsSection({ notifications, onUpdate }: { notifications: NotificationSettings; onUpdate: (v: Partial<NotificationSettings>) => void }) {
  const [form, setForm] = useState(notifications);
  useEffect(() => setForm(notifications), [notifications]);

  const handleSave = () => {
    onUpdate(form);
    toast.success("Paramètres de notification mis à jour.");
  };

  const ToggleRow = ({ id, label, checked }: { id: string; label: string; checked: boolean }) => (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={(v) => setForm({ ...form, [id]: v })} />
    </div>
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-display text-lg font-bold">Paramètres des notifications</h3>

      <div className="mb-6 space-y-3">
        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Canaux de notification</h4>
        <ToggleRow id="emailNotifications" label="Notifications par email" checked={form.emailNotifications} />
        <ToggleRow id="smsNotifications" label="Notifications par SMS" checked={form.smsNotifications} />
        <ToggleRow id="pushNotifications" label="Notifications push" checked={form.pushNotifications} />
      </div>

      <div className="mb-6 space-y-3">
        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Événements</h4>
        <ToggleRow id="reportCreated" label="Nouveau signalement créé" checked={form.reportCreated} />
        <ToggleRow id="reportStatusChanged" label="Changement de statut d'un signalement" checked={form.reportStatusChanged} />
        <ToggleRow id="crisisAlert" label="Alerte de crise / urgence" checked={form.crisisAlert} />
        <ToggleRow id="systemAlerts" label="Alertes système" checked={form.systemAlerts} />
        <ToggleRow id="weeklyDigest" label="Digest hebdomadaire" checked={form.weeklyDigest} />
        <ToggleRow id="monthlyReport" label="Rapport mensuel" checked={form.monthlyReport} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email-from">Email expéditeur</Label>
          <Input id="email-from" type="email" value={form.emailFrom} onChange={(e) => setForm({ ...form, emailFrom: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sms-provider">Fournisseur SMS</Label>
          <Select value={form.smsProvider} onValueChange={(v) => setForm({ ...form, smsProvider: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SMS_PROVIDERS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button className="mt-4" onClick={handleSave}>Enregistrer les notifications</Button>
    </div>
  );
}

function SecuritySettingsSection({ security, onUpdate }: { security: SecuritySettings; onUpdate: (v: Partial<SecuritySettings>) => void }) {
  const [form, setForm] = useState(security);
  useEffect(() => setForm(security), [security]);
  const [newIp, setNewIp] = useState("");

  const handleSave = () => {
    onUpdate(form);
    toast.success("Paramètres de sécurité mis à jour.");
  };

  const addIp = () => {
    if (newIp && !form.ipWhitelist.includes(newIp)) {
      setForm({ ...form, ipWhitelist: [...form.ipWhitelist, newIp] });
      setNewIp("");
    }
  };

  const removeIp = (ip: string) => {
    setForm({ ...form, ipWhitelist: form.ipWhitelist.filter((i) => i !== ip) });
  };

  const ToggleRow = ({ id, label, checked }: { id: string; label: string; checked: boolean }) => (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={(v) => setForm({ ...form, [id]: v })} />
    </div>
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-display text-lg font-bold">Paramètres de sécurité</h3>

      <div className="mb-6 space-y-3">
        <ToggleRow id="twoFactorEnabled" label="Authentification à deux facteurs (2FA)" checked={form.twoFactorEnabled} />
        <ToggleRow id="autoLogoutEnabled" label="Déconnexion automatique" checked={form.autoLogoutEnabled} />
        <ToggleRow id="ipWhitelistEnabled" label="Liste blanche d'IP" checked={form.ipWhitelistEnabled} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="session-timeout">Expiration de session (minutes)</Label>
          <Input id="session-timeout" type="number" value={form.sessionTimeout} onChange={(e) => setForm({ ...form, sessionTimeout: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="auto-logout">Déconnexion automatique après (minutes)</Label>
          <Input id="auto-logout" type="number" value={form.autoLogoutMinutes} onChange={(e) => setForm({ ...form, autoLogoutMinutes: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-login">Tentatives de connexion max</Label>
          <Input id="max-login" type="number" value={form.maxLoginAttempts} onChange={(e) => setForm({ ...form, maxLoginAttempts: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pwd-min">Longueur minimale du mot de passe</Label>
          <Input id="pwd-min" type="number" value={form.passwordMinLength} onChange={(e) => setForm({ ...form, passwordMinLength: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="audit-retention">Rétention des logs d'audit (jours)</Label>
          <Input id="audit-retention" type="number" value={form.auditLogRetention} onChange={(e) => setForm({ ...form, auditLogRetention: Number(e.target.value) })} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-6">
        <ToggleRow id="requireSpecialChars" label="Caractères spéciaux requis" checked={form.requireSpecialChars} />
        <ToggleRow id="requireNumbers" label="Chiffres requis" checked={form.requireNumbers} />
      </div>

      {form.ipWhitelistEnabled && (
        <div className="mt-4 space-y-2">
          <Label>Liste blanche d'IP</Label>
          <div className="flex gap-2">
            <Input value={newIp} onChange={(e) => setNewIp(e.target.value)} placeholder="192.168.1.1" />
            <Button onClick={addIp} variant="outline" size="sm">Ajouter</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.ipWhitelist.map((ip) => (
              <span key={ip} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-mono">
                {ip}
                <button onClick={() => removeIp(ip)} className="text-red-500 hover:text-red-700">&times;</button>
              </span>
            ))}
          </div>
        </div>
      )}

      <Button className="mt-4" onClick={handleSave}>Enregistrer la sécurité</Button>
    </div>
  );
}

function WasteCollectionSettingsSection({ waste, onUpdate }: { waste: WasteCollectionSettings; onUpdate: (v: Partial<WasteCollectionSettings>) => void }) {
  const [form, setForm] = useState(waste);
  useEffect(() => setForm(waste), [waste]);

  const handleSave = () => {
    onUpdate(form);
    toast.success("Paramètres de collecte mis à jour.");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-display text-lg font-bold">Paramètres de collecte des déchets</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="collection-hours">Horaires de collecte</Label>
          <Input id="collection-hours" value={form.collectionHours} onChange={(e) => setForm({ ...form, collectionHours: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pme-multiplier">Coefficient PME</Label>
          <Input id="pme-multiplier" type="number" step="0.1" value={form.pmeMultiplier} onChange={(e) => setForm({ ...form, pmeMultiplier: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="late-penalty">Pénalité de retard (%)</Label>
          <Input id="late-penalty" type="number" value={form.latePaymentPenalty} onChange={(e) => setForm({ ...form, latePaymentPenalty: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grace-period">Délai de grâce (jours)</Label>
          <Input id="grace-period" type="number" value={form.gracePeriodDays} onChange={(e) => setForm({ ...form, gracePeriodDays: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="min-emergency">Volume minimum pour collecte d'urgence (m³)</Label>
          <Input id="min-emergency" type="number" value={form.minimumVolumeForEmergency} onChange={(e) => setForm({ ...form, minimumVolumeForEmergency: Number(e.target.value) })} />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch id="emergency-enabled" checked={form.emergencyCollectionEnabled} onCheckedChange={(v) => setForm({ ...form, emergencyCollectionEnabled: v })} />
          <Label htmlFor="emergency-enabled" className="font-semibold">Collecte d'urgence activée</Label>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Types de bacs par défaut</h4>
        <div className="flex flex-wrap gap-2">
          {form.defaultBinTypes.map((bt) => (
            <span key={bt} className="inline-flex items-center gap-1 rounded-full bg-eco/10 px-3 py-1 text-xs font-semibold text-eco">
              {bt} ({form.binCapacities[bt] ?? "?"}L)
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Fréquence de collecte par commune</h4>
        <p className="mb-2 text-xs text-muted-foreground">Définissez le nombre de collectes par semaine pour chaque commune.</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {COMMUNES.map((c) => (
            <div key={c.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <span className="size-2 rounded-full" style={{ background: c.color }} />
              <span className="flex-1 text-sm">{c.name}</span>
              <select
                value={form.collectionFrequency[c.id] ?? 2}
                onChange={(e) => setForm({ ...form, collectionFrequency: { ...form.collectionFrequency, [c.id]: Number(e.target.value) } })}
                className="rounded-lg border bg-background px-2 py-1 text-xs"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}x/sem</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <Button className="mt-4" onClick={handleSave}>Enregistrer la collecte</Button>
    </div>
  );
}

function GisSettingsSection({ gis, onUpdate }: { gis: GisSettings; onUpdate: (v: Partial<GisSettings>) => void }) {
  const [form, setForm] = useState(gis);
  useEffect(() => setForm(gis), [gis]);

  const handleSave = () => {
    onUpdate(form);
    toast.success("Paramètres cartographiques mis à jour.");
  };

  const ToggleRow = ({ id, label, checked }: { id: string; label: string; checked: boolean }) => (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={(v) => setForm({ ...form, [id]: v })} />
    </div>
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-display text-lg font-bold">Paramètres de cartographie / SIG</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="map-provider">Fournisseur de carte</Label>
          <Select value={form.mapProvider} onValueChange={(v) => setForm({ ...form, mapProvider: v as any })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {MAP_PROVIDERS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="map-zoom">Zoom par défaut</Label>
          <Input id="map-zoom" type="number" min={1} max={19} value={form.defaultZoom} onChange={(e) => setForm({ ...form, defaultZoom: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="map-lat">Latitude du centre</Label>
          <Input id="map-lat" type="number" step="0.0001" value={form.defaultMapCenter[0]} onChange={(e) => setForm({ ...form, defaultMapCenter: [Number(e.target.value), form.defaultMapCenter[1]] })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="map-lng">Longitude du centre</Label>
          <Input id="map-lng" type="number" step="0.0001" value={form.defaultMapCenter[1]} onChange={(e) => setForm({ ...form, defaultMapCenter: [form.defaultMapCenter[0], Number(e.target.value)] })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="refresh-interval">Intervalle de rafraîchissement (secondes)</Label>
          <Input id="refresh-interval" type="number" value={form.refreshInterval} onChange={(e) => setForm({ ...form, refreshInterval: Number(e.target.value) })} />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Calques affichés</h4>
        <ToggleRow id="showCollectionPoints" label="Points de collecte" checked={form.showCollectionPoints} />
        <ToggleRow id="showRecyclingCenters" label="Centres de recyclage" checked={form.showRecyclingCenters} />
        <ToggleRow id="showFloodZones" label="Zones inondables" checked={form.showFloodZones} />
        <ToggleRow id="showTruckTracking" label="Suivi des camions" checked={form.showTruckTracking} />
        <ToggleRow id="clusterMarkers" label="Regrouper les marqueurs" checked={form.clusterMarkers} />
        <ToggleRow id="heatmapEnabled" label="Carte de chaleur" checked={form.heatmapEnabled} />
      </div>

      <Button className="mt-4" onClick={handleSave}>Enregistrer la cartographie</Button>
    </div>
  );
}

function AiSettingsSection({ ai, onUpdate }: { ai: AiSettings; onUpdate: (v: Partial<AiSettings>) => void }) {
  const [form, setForm] = useState(ai);
  useEffect(() => setForm(ai), [ai]);

  const handleSave = () => {
    onUpdate(form);
    toast.success("Paramètres IA mis à jour.");
  };

  const ToggleRow = ({ id, label, checked }: { id: string; label: string; checked: boolean }) => (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={(v) => setForm({ ...form, [id]: v })} />
    </div>
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-display text-lg font-bold">Paramètres de l'Intelligence Artificielle</h3>

      <div className="mb-6 flex items-center gap-3 rounded-xl border border-eco/30 bg-eco/5 p-4">
        <Switch id="ai-enabled" checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
        <div>
          <Label htmlFor="ai-enabled" className="font-bold text-eco">IA activée</Label>
          <p className="text-xs text-muted-foreground">Désactiver pour utiliser le mode dégradé (fallback)</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ai-model">Modèle IA</Label>
          <Select value={form.model} onValueChange={(v) => setForm({ ...form, model: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {AI_MODELS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ai-apikey">Clé API (Lovable AI Gateway)</Label>
          <Input id="ai-apikey" type="password" value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} placeholder="sk-..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ai-confidence">Seuil de confiance (%)</Label>
          <Input id="ai-confidence" type="number" min={0} max={100} value={form.confidenceThreshold} onChange={(e) => setForm({ ...form, confidenceThreshold: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ai-max-calls">Appels API max / jour</Label>
          <Input id="ai-max-calls" type="number" value={form.maxDailyApiCalls} onChange={(e) => setForm({ ...form, maxDailyApiCalls: Number(e.target.value) })} />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Fonctionnalités IA</h4>
        <ToggleRow id="autoClassification" label="Classification automatique des déchets" checked={form.autoClassification} />
        <ToggleRow id="autoUrgencyDetection" label="Détection automatique de l'urgence" checked={form.autoUrgencyDetection} />
        <ToggleRow id="autoAssignment" label="Assignation automatique aux équipes" checked={form.autoAssignment} />
        <ToggleRow id="floodRiskDetection" label="Détection des risques d'inondation" checked={form.floodRiskDetection} />
        <ToggleRow id="volumeEstimation" label="Estimation du volume" checked={form.volumeEstimation} />
        <ToggleRow id="compositionAnalysis" label="Analyse de la composition" checked={form.compositionAnalysis} />
        <ToggleRow id="learningEnabled" label="Apprentissage continu (corrections)" checked={form.learningEnabled} />
        <ToggleRow id="fallbackOnError" label="Mode dégradé en cas d'erreur" checked={form.fallbackOnError} />
      </div>

      <Button className="mt-4" onClick={handleSave}>Enregistrer les paramètres IA</Button>
    </div>
  );
}

function BackupSettingsSection({ backup, onUpdate }: { backup: BackupSettings; onUpdate: (v: Partial<BackupSettings>) => void }) {
  const [form, setForm] = useState(backup);
  useEffect(() => setForm(backup), [backup]);

  const handleSave = () => {
    onUpdate(form);
    toast.success("Paramètres de sauvegarde mis à jour.");
  };

  const handleBackupNow = () => {
    const now = new Date().toISOString();
    onUpdate({
      lastBackup: now,
      backupSize: `${(Math.random() * 50 + 10).toFixed(1)} Mo`,
    });
    toast.success("Sauvegarde manuelle effectuée avec succès.");
  };

  const ToggleRow = ({ id, label, checked }: { id: string; label: string; checked: boolean }) => (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={(v) => setForm({ ...form, [id]: v })} />
    </div>
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-display text-lg font-bold">Sauvegarde et données</h3>

      {backup.lastBackup && (
        <div className="mb-6 rounded-xl border border-eco/30 bg-eco/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-eco">Dernière sauvegarde</p>
              <p className="text-xs text-muted-foreground">
                {new Date(backup.lastBackup).toLocaleString("fr-FR")} · {backup.backupSize ?? "N/A"}
              </p>
            </div>
            <Database className="size-6 text-eco" />
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center gap-3">
        <Switch id="autoBackup" checked={form.autoBackup} onCheckedChange={(v) => setForm({ ...form, autoBackup: v })} />
        <Label htmlFor="autoBackup" className="font-semibold">Sauvegarde automatique</Label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="backup-freq">Fréquence</Label>
          <Select value={form.backupFrequency} onValueChange={(v) => setForm({ ...form, backupFrequency: v as any })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {BACKUP_FREQUENCIES.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="backup-time">Heure de la sauvegarde</Label>
          <Input id="backup-time" type="time" value={form.backupTime} onChange={(e) => setForm({ ...form, backupTime: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="retention-days">Rétention (jours)</Label>
          <Input id="retention-days" type="number" value={form.retentionDays} onChange={(e) => setForm({ ...form, retentionDays: Number(e.target.value) })} />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Contenu de la sauvegarde</h4>
        <ToggleRow id="includeAuditLogs" label="Journaux d'audit" checked={form.includeAuditLogs} />
        <ToggleRow id="includeReports" label="Signalements" checked={form.includeReports} />
        <ToggleRow id="includeHouseholds" label="Ménages et utilisateurs" checked={form.includeHouseholds} />
        <ToggleRow id="includeSettings" label="Paramètres de la plateforme" checked={form.includeSettings} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={handleSave}>Enregistrer les sauvegardes</Button>
        <Button variant="outline" onClick={handleBackupNow}>
          <Database className="mr-2 size-4" /> Effectuer une sauvegarde maintenant
        </Button>
      </div>
    </div>
  );
}

function IATab() {
  const { store, validate, correct, precisionPct } = useLearning();
  const { items: reports, setStatus } = useLiveReports();
  const { session } = useAccess();
  const [validatedIds, setValidatedIds] = useState<Set<string>>(new Set());

  const pendingReports = useMemo(() => {
    return reports.filter(r => r.status === 'en_attente' && !validatedIds.has(r.id)).slice(0, 20);
  }, [reports, validatedIds]);

  const handleValidate = (reportId: string) => {
    // Validate the report: update status to "assignee" and record the validation
    setStatus(reportId, 'assignee', session.name);
    validate();
    setValidatedIds(prev => new Set(prev).add(reportId));
    toast.success(`Signalement ${reportId} validé et assigné.`);
  };

  const handleCorrect = (reportId: string, correctedValue: string) => {
    if (!correctedValue) return;
    // Apply correction and update report status
    setStatus(reportId, 'assignee', session.name);
    correct({
      reportId,
      predicted: reports.find(r => r.id === reportId)?.category || 'inconnu',
      corrected: correctedValue,
      by: session.name,
      at: new Date().toISOString(),
    });
    setValidatedIds(prev => new Set(prev).add(reportId));
    toast.success(`Signalement ${reportId} corrigé en "${correctedValue}" et assigné.`);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-eco/30 bg-eco/5 p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-eco">Précision IA (apprentissage continu)</div>
          <div className="mt-1 font-display text-4xl font-bold">{precisionPct}%</div>
          <div className="mt-1 text-xs text-muted-foreground">{store.validations} validations · {store.corrections.length} corrections</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Modèle</div>
          <div className="mt-1 font-mono text-sm">google/gemini-3-flash-preview</div>
          <div className="mt-1 text-xs text-muted-foreground">via Lovable AI Gateway</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Catégories</div>
          <div className="mt-1 font-display text-2xl font-bold">{WASTE_CATEGORIES.length}</div>
          <div className="mt-1 text-xs text-muted-foreground">Plastique, organique, médical, …</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-1 font-display text-lg font-bold">Validation des signalements en attente ({pendingReports.length})</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Validez la classification automatique ou corrigez-la. Chaque correction améliore le modèle.
        </p>
        {pendingReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-eco/10 p-4 mb-4">
              <ShieldCheck className="size-8 text-eco" />
            </div>
            <p className="text-lg font-semibold text-muted-foreground">Aucun signalement en attente de validation</p>
            <p className="text-sm text-muted-foreground mt-1">Tous les signalements ont été traités.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2">ID</th>
                  <th>Date</th>
                  <th>Commune</th>
                  <th>Classification IA</th>
                  <th>Urgence IA</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingReports.map((r) => (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="py-2 font-mono text-xs">{r.id}</td>
                    <td className="whitespace-nowrap text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="capitalize">{COMMUNES.find(c => c.id === r.commune)?.name || r.commune}</td>
                    <td className="capitalize font-semibold">{r.category}</td>
                    <td><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${URGENCY_META[r.urgency]?.bg} ${URGENCY_META[r.urgency]?.color}`}>{URGENCY_META[r.urgency]?.label}</span></td>
                    <td className="max-w-xs truncate text-xs text-muted-foreground">{r.description || '–'}</td>
                    <td className="space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleValidate(r.id)}
                        className="rounded-md bg-eco/10 px-2 py-1 text-xs font-semibold text-eco hover:bg-eco/20 transition-colors"
                      >
                        ✓ Valider
                      </button>
                      <select
                        onChange={(e) => {
                          handleCorrect(r.id, e.target.value);
                          e.currentTarget.selectedIndex = 0;
                        }}
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                      >
                        <option value="">Corriger…</option>
                        {WASTE_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {store.corrections.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-3 font-display text-lg font-bold">Historique des corrections</h3>
          <ul className="space-y-1.5 font-mono text-xs">
            {store.corrections.slice(0, 10).map((c, i) => (
              <li key={i} className="text-muted-foreground">
                [{new Date(c.at).toLocaleString()}] {c.reportId} · <span className="text-red-500">{c.predicted}</span> → <span className="text-eco">{c.corrected}</span> ({c.by})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
