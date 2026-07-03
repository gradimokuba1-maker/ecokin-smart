import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AccessGate } from "@/components/access-gate";
import { useKinLabel, type KinLabelActivity } from "@/lib/kin-label-store";
import { KINSHASA_COMMUNES } from "@/lib/cities";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock, Download, FileSpreadsheet, MapPin, Plus, Target, Trash2, TrendingUp, Users } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const Route = createFileRoute("/suivi-evaluation")({
  head: () => ({
    meta: [
      { title: "Suivi & Évaluation Kin Label — EcoKin Smart" },
      { name: "description", content: "Module de suivi & évaluation des activités Kin Label : KPI, budgets, rapports terrain et alertes de retard." },
    ],
  }),
  component: () => (
    <AccessGate required={["bourgmestre", "gouverneur", "admin"]} title="Suivi & Évaluation Kin Label">
      <SuiviPage />
    </AccessGate>
  ),
});

const STATUS_STYLE: Record<string, string> = {
  planifiee: "bg-slate-500/15 text-slate-700",
  en_cours: "bg-amber-500/15 text-amber-700",
  terminee: "bg-emerald-500/15 text-emerald-700",
  en_retard: "bg-red-500/15 text-red-700",
};
const STATUS_LABEL: Record<string, string> = {
  planifiee: "Planifiée",
  en_cours: "En cours",
  terminee: "Terminée",
  en_retard: "En retard",
};

function SuiviPage() {
  const { items, create, update, addReport, remove } = useKinLabel();
  const [openNew, setOpenNew] = useState(false);
  const [openReport, setOpenReport] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = items.length;
    const done = items.filter((i) => i.status === "terminee").length;
    const late = items.filter((i) => i.status === "en_retard").length;
    const inProg = items.filter((i) => i.status === "en_cours").length;
    const avg = total ? Math.round(items.reduce((s, i) => s + i.progressPct, 0) / total) : 0;
    const budget = items.reduce((s, i) => s + i.budgetCdf, 0);
    const spent = items.reduce((s, i) => s + i.spentCdf, 0);
    return { total, done, late, inProg, avg, budget, spent };
  }, [items]);

  function exportPdf() {
    const doc = new jsPDF();
    doc.setFillColor(11, 31, 58);
    doc.rect(0, 0, 210, 26, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("EcoKin Smart — Suivi & Évaluation Kin Label", 14, 12);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleString("fr-FR"), 14, 20);
    doc.setTextColor(0, 0, 0);
    autoTable(doc, {
      startY: 34,
      head: [["ID", "Activité", "Commune", "Statut", "Avancement", "Budget CDF", "Dépensé CDF", "Échéance"]],
      body: items.map((a) => [a.id, a.title, a.commune, STATUS_LABEL[a.status], `${a.progressPct}%`, a.budgetCdf.toLocaleString(), a.spentCdf.toLocaleString(), a.endDate]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] },
    });
    doc.save(`kin-label-suivi-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  function exportCsv() {
    const rows = [
      ["ID", "Titre", "Commune", "Équipe", "Responsable", "Début", "Fin", "Statut", "Avancement %", "Budget CDF", "Dépensé CDF", "Objectif"],
      ...items.map((a) => [a.id, a.title, a.commune, a.team, a.responsable, a.startDate, a.endDate, STATUS_LABEL[a.status], a.progressPct, a.budgetCdf, a.spentCdf, a.objective]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kin-label-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="border-b border-border bg-kin text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-eco">Kin Label · Monitoring &amp; Évaluation</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Suivi &amp; Évaluation des activités</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Créez les activités, définissez les KPI, suivez le budget, enregistrez les rapports terrain
            et déclenchez des alertes en cas de retard.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Tile icon={<Target className="size-4" />} label="Activités" value={String(stats.total)} tone="eco" />
          <Tile icon={<TrendingUp className="size-4" />} label="Taux d'exécution" value={`${stats.avg}%`} tone="kin" />
          <Tile icon={<Clock className="size-4" />} label="En cours" value={String(stats.inProg)} tone="urban" />
          <Tile icon={<CheckCircle2 className="size-4" />} label="Terminées" value={String(stats.done)} tone="eco" />
          <Tile icon={<AlertTriangle className="size-4" />} label="En retard" value={String(stats.late)} tone="flood" />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Budget total</div>
            <div className="mt-1 font-display text-2xl font-bold">{(stats.budget / 1_000_000).toFixed(1)} M CDF</div>
          </Card>
          <Card>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Dépensé</div>
            <div className="mt-1 font-display text-2xl font-bold text-eco">{(stats.spent / 1_000_000).toFixed(1)} M CDF</div>
          </Card>
          <Card>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Consommation</div>
            <div className="mt-1 font-display text-2xl font-bold">
              {stats.budget ? Math.round((stats.spent / stats.budget) * 100) : 0}%
            </div>
          </Card>
          <Card>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Communes concernées</div>
            <div className="mt-1 font-display text-2xl font-bold">{new Set(items.map((i) => i.commune)).size}</div>
          </Card>
        </section>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold">Activités Kin Label</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setOpenNew(true)} className="inline-flex items-center gap-2 rounded-xl bg-eco px-3 py-2 text-xs font-bold text-white hover:bg-eco/90">
              <Plus className="size-4" /> Nouvelle activité
            </button>
            <button onClick={exportPdf} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold hover:bg-secondary">
              <Download className="size-4" /> Export PDF
            </button>
            <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold hover:bg-secondary">
              <FileSpreadsheet className="size-4" /> Export Excel (CSV)
            </button>
          </div>
        </div>

        {stats.late > 0 && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="mr-2 inline size-4" />
            <b>{stats.late}</b> activité(s) en retard. Une notification est envoyée automatiquement aux responsables.
          </div>
        )}

        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((a) => (
            <ActivityCard
              key={a.id}
              a={a}
              onUpdate={(patch) => update(a.id, patch)}
              onDelete={() => remove(a.id)}
              onReport={() => setOpenReport(a.id)}
            />
          ))}
        </div>
      </main>

      {openNew && <NewActivityDialog onClose={() => setOpenNew(false)} onCreate={create} />}
      {openReport && (
        <FieldReportDialog
          onClose={() => setOpenReport(null)}
          onSubmit={(r) => {
            addReport(openReport, r);
            setOpenReport(null);
          }}
        />
      )}

      <SiteFooter />
    </div>
  );
}

function Tile({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "eco" | "kin" | "urban" | "flood" }) {
  const bg = { eco: "bg-eco/10 text-eco", kin: "bg-kin/10 text-kin", urban: "bg-urban/10 text-urban", flood: "bg-flood/10 text-flood" }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className={`grid size-8 place-items-center rounded-lg ${bg}`}>{icon}</span>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      </div>
      <div className="mt-2 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}
function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card p-4">{children}</div>;
}

function ActivityCard({ a, onUpdate, onDelete, onReport }: { a: KinLabelActivity; onUpdate: (p: Partial<KinLabelActivity>) => void; onDelete: () => void; onReport: () => void }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{a.id}</div>
          <h3 className="font-display text-lg font-bold">{a.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
        </div>
        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_STYLE[a.status]}`}>
          {STATUS_LABEL[a.status]}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {a.commune}</span>
        <span className="inline-flex items-center gap-1"><Users className="size-3" /> {a.team}</span>
        <span className="inline-flex items-center gap-1"><CalendarDays className="size-3" /> {a.startDate} → {a.endDate}</span>
        <span className="inline-flex items-center gap-1"><Target className="size-3" /> {a.responsable}</span>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold">Avancement</span>
          <span className="font-bold">{a.progressPct}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-eco" style={{ width: `${a.progressPct}%` }} />
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={a.progressPct}
          onChange={(e) => onUpdate({ progressPct: Number(e.target.value) })}
          className="mt-1 w-full accent-eco"
        />
      </div>

      <div className="mt-3 space-y-1.5">
        {a.kpis.map((k) => {
          const pct = Math.min(100, Math.round((k.actual / (k.target || 1)) * 100));
          return (
            <div key={k.id}>
              <div className="flex items-center justify-between text-[11px]">
                <span>{k.label}</span>
                <span className="font-semibold">{k.actual}/{k.target} {k.unit}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-urban" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-border bg-background p-2">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Budget</div>
          <div className="font-semibold">{(a.budgetCdf / 1_000_000).toFixed(2)} M CDF</div>
        </div>
        <div className="rounded-lg border border-border bg-background p-2">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Dépensé</div>
          <div className="font-semibold">{(a.spentCdf / 1_000_000).toFixed(2)} M CDF</div>
        </div>
      </div>

      {a.reports.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-semibold text-eco">{a.reports.length} rapport(s) terrain</summary>
          <ul className="mt-2 space-y-2 text-xs">
            {a.reports.slice(0, 4).map((r) => (
              <li key={r.id} className="rounded-lg border border-border bg-background p-2">
                <div className="font-semibold">{r.agent}</div>
                <div className="text-muted-foreground">{new Date(r.at).toLocaleString("fr-FR")}</div>
                <div className="mt-1">{r.note}</div>
                {r.lat != null && <div className="mt-1 text-[10px] text-muted-foreground">📍 {r.lat.toFixed(4)}, {r.lng?.toFixed(4)}</div>}
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={onReport} className="inline-flex items-center gap-1 rounded-lg bg-eco px-3 py-1.5 text-xs font-bold text-white hover:bg-eco/90">
          <Plus className="size-3" /> Rapport terrain
        </button>
        <button onClick={onDelete} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-secondary">
          <Trash2 className="size-3" /> Supprimer
        </button>
      </div>
    </article>
  );
}

function NewActivityDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (a: any) => void }) {
  const [f, setF] = useState({
    title: "",
    description: "",
    commune: KINSHASA_COMMUNES[0].name,
    team: "",
    responsable: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    budgetCdf: 5_000_000,
    objective: "",
  });

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display text-lg font-bold">Nouvelle activité Kin Label</h3>
        <div className="mt-4 space-y-3 text-sm">
          <Field label="Titre"><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Description"><textarea className="input" rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Commune">
              <select className="input" value={f.commune} onChange={(e) => setF({ ...f, commune: e.target.value })}>
                {KINSHASA_COMMUNES.map((c) => <option key={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Équipe"><input className="input" value={f.team} onChange={(e) => setF({ ...f, team: e.target.value })} /></Field>
            <Field label="Responsable"><input className="input" value={f.responsable} onChange={(e) => setF({ ...f, responsable: e.target.value })} /></Field>
            <Field label="Budget (CDF)"><input type="number" className="input" value={f.budgetCdf} onChange={(e) => setF({ ...f, budgetCdf: Number(e.target.value) })} /></Field>
            <Field label="Début"><input type="date" className="input" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} /></Field>
            <Field label="Échéance"><input type="date" className="input" value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} /></Field>
          </div>
          <Field label="Objectif"><input className="input" value={f.objective} onChange={(e) => setF({ ...f, objective: e.target.value })} /></Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold">Annuler</button>
          <button
            onClick={() => {
              if (!f.title.trim()) return;
              onCreate({ ...f, kpis: [{ id: "k1", label: "Indicateur clé", target: 100, actual: 0, unit: "%" }] });
              onClose();
            }}
            className="rounded-lg bg-eco px-3 py-1.5 text-xs font-bold text-white hover:bg-eco/90"
          >
            Créer
          </button>
        </div>
      </div>
      <style>{`.input{width:100%;border:1px solid hsl(var(--border));background:hsl(var(--background));border-radius:8px;padding:6px 8px;font-size:12px}`}</style>
    </div>
  );
}

function FieldReportDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (r: { agent: string; note: string; lat?: number; lng?: number }) => void }) {
  const [f, setF] = useState({ agent: "", note: "", lat: undefined as number | undefined, lng: undefined as number | undefined });
  function locate() {
    navigator.geolocation?.getCurrentPosition(
      (p) => setF((s) => ({ ...s, lat: p.coords.latitude, lng: p.coords.longitude })),
      () => {},
    );
  }
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display text-lg font-bold">Rapport terrain</h3>
        <div className="mt-4 space-y-3 text-sm">
          <Field label="Agent"><input className="input" value={f.agent} onChange={(e) => setF({ ...f, agent: e.target.value })} /></Field>
          <Field label="Note"><textarea className="input" rows={3} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
          <button onClick={locate} className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold">
            <MapPin className="mr-1 inline size-3" /> {f.lat ? `${f.lat.toFixed(4)}, ${f.lng!.toFixed(4)}` : "Géolocaliser"}
          </button>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold">Annuler</button>
          <button
            onClick={() => f.agent && f.note && onSubmit(f)}
            className="rounded-lg bg-eco px-3 py-1.5 text-xs font-bold text-white hover:bg-eco/90"
          >
            Enregistrer
          </button>
        </div>
        <style>{`.input{width:100%;border:1px solid hsl(var(--border));background:hsl(var(--background));border-radius:8px;padding:6px 8px;font-size:12px}`}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}
