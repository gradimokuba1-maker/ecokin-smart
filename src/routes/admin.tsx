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
  Brain,
  Building,
  Database,
  Gift,
  Settings,
  Home,
  ShieldCheck,
  TrendingUp,
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
  const totalUsers = households.length + Object.keys(AUTH_USERS).length;
  const totalBudget = Object.values(COMMUNE_BUDGET).reduce((s, b) => s + b.mensuel, 0);
  const kpis = { totalUsers, totalReports: reports.length, totalBudget, totalHouseholds: households.length, totalTaxPaid: totalPaid };

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
          {tab === "overview" && <Overview reports={reports} kpis={kpis} />}
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
  const { households, registerHousehold, updateHousehold, removeHousehold } = useHouseholds();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState<any | null>(null);

  const allUsers = useMemo(() => {
    const authorities = Object.entries(AUTH_USERS).map(([role, user]) => ({
      id: role,
      role: role as keyof typeof AUTH_USERS,
      name: user.name,
      status: "Actif",
      isAuthority: true,
    }));
    const citizens = households.map((h) => ({ ...h, id: h.id, role: "citoyen", status: "Actif", isAuthority: false }));
    return [...authorities, ...citizens];
  }, [households]);

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
      updateHousehold(editingUser.id, data);
      toast.success("Utilisateur mis à jour.");
    } else {
      registerHousehold(data);
      toast.success("Utilisateur créé.");
    }
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (deletingUser) {
      removeHousehold(deletingUser.id);
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
    return reports.filter(r => {
      if (filters.commune !== 'all' && r.commune !== filters.commune) return false;
      if (filters.status !== 'all' && r.status !== filters.status) return false;
      if (filters.urgency !== 'all' && r.urgency !== filters.urgency) return false;
      if (filters.q && !`${r.id} ${r.description}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
      return true;
    });
  }, [reports, filters]);

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
  const { resetAllEcoKinData } = useLiveReports();
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
        <TaxSettings />
        <RewardsSettings />
        <h3 className="mb-1 mt-6 font-display text-lg font-bold text-red-700">Zone dangereuse : Réinitialisation</h3>
        <p className="text-sm text-muted-foreground">
          Supprime tous les signalements, statistiques, ménages enregistrés, GPS flotte,
          notifications, journaux d'audit et sessions autorités. Les compteurs repartent à 0.
          Les données réelles collectées durant la phase de test alimenteront ensuite tableaux
          de bord, cartes et indicateurs.
        </p>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
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
                setDone(true);
                setTimeout(() => window.location.reload(), 800);
              }}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white"
            >
              Confirmer la réinitialisation
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-xl border border-border px-3 py-2 text-sm font-semibold"
            >
              Annuler
            </button>
            {done && <span className="text-xs font-semibold text-eco">✓ Données remises à zéro…</span>}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 font-display text-lg font-bold">Communes couvertes ({COMMUNES.length})</h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {COMMUNES.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="flex items-center gap-2 text-sm">
                <span className="size-2.5 rounded-full" style={{ background: c.color }} />
                {c.name}
              </span>
              <span className="rounded-full bg-eco/10 px-2 py-0.5 text-[10px] font-bold text-eco">Active</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-2 font-display text-lg font-bold">Modèle IA</h3>
        <p className="text-sm text-muted-foreground">
          Détection des déchets et risque d'inondation propulsée par <b>Lovable AI Gateway</b>.
          Modèle actif : <span className="font-mono">google/gemini-3-flash-preview</span>.
        </p>
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
