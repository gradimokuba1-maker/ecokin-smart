import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { LEADERBOARD, REPORTS, REWARDS, COMMUNES, WASTE_CATEGORIES } from "@/lib/data";
import { useLearning } from "@/lib/learning-store";
import {
  Activity,
  Brain,
  Database,
  Gift,
  Lock,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administration — EcoKin Smart" },
      { name: "description", content: "Espace administrateur de la plateforme EcoKin Smart." },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  { id: "overview", label: "Vue d'ensemble", icon: Activity },
  { id: "ia", label: "Validation IA", icon: Brain },
  { id: "users", label: "Citoyens", icon: Users },
  { id: "reports", label: "Signalements", icon: Database },
  { id: "rewards", label: "Récompenses", icon: Gift },
  { id: "settings", label: "Paramètres", icon: Settings },
] as const;

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const [code, setCode] = useState("");

  if (!authed) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24">
          <div className="grid size-16 place-items-center rounded-2xl bg-kin text-white">
            <Lock className="size-7" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold">Espace administrateur</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Accès réservé aux agents de la régie d'assainissement et aux autorités communales.
          </p>
          <div className="mt-8 w-full rounded-2xl border border-border bg-card p-6">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Code agent (démo : <span className="font-mono">ECOKIN2026</span>)
            </label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm font-mono focus:border-eco focus:outline-none focus:ring-2 focus:ring-eco/30"
              placeholder="••••••••••"
            />
            <button
              onClick={() => {
                if (code === "ECOKIN2026") setAuthed(true);
                else alert("Code invalide");
              }}
              className="mt-4 w-full rounded-xl bg-eco py-3 text-sm font-bold text-white"
            >
              Se connecter
            </button>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="border-b border-border bg-kin text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-eco">
            <ShieldCheck className="size-4" /> Console administrateur
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold">Centre de contrôle EcoKin</h1>
          <p className="mt-1 text-white/70">
            Gestion globale de la plateforme · 3 communes pilotes · {REPORTS.length} signalements
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? "bg-eco text-white"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <t.icon className="size-4" /> {t.label}
            </button>
          ))}
        </aside>

        <div className="space-y-6">
          {tab === "overview" && <Overview />}
          {tab === "ia" && <IATab />}
          {tab === "users" && <UsersTab />}
          {tab === "reports" && <ReportsTab />}
          {tab === "rewards" && <RewardsTab />}
          {tab === "settings" && <SettingsTab />}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function Overview() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { l: "Citoyens inscrits", v: "3 248", d: "+184 ce mois" },
          { l: "Signalements totaux", v: REPORTS.length.toString(), d: "+12% vs sem. dernière" },
          { l: "Green Points distribués", v: "1.2 M", d: "≈ 4.8 M CDF" },
          { l: "Récompenses échangées", v: "847", d: "+22% vs mois -1" },
          { l: "Taux de validation IA", v: "92.4%", d: "Stable" },
          { l: "Disponibilité plateforme", v: "99.97%", d: "30 derniers jours" },
        ].map((k) => (
          <div key={k.l} className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {k.l}
            </div>
            <div className="mt-2 font-display text-3xl font-bold">{k.v}</div>
            <div className="mt-1 text-xs text-eco">{k.d}</div>
          </div>
        ))}
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

function UsersTab() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-display text-lg font-bold">Top citoyens</h3>
      <table className="w-full text-sm">
        <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <tr className="border-b border-border">
            <th className="py-2">Rang</th>
            <th>Nom</th>
            <th>Commune</th>
            <th>Signalements</th>
            <th>Points</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {LEADERBOARD.map((l) => (
            <tr key={l.rank} className="border-b border-border/60">
              <td className="py-2 font-bold">#{l.rank}</td>
              <td>{l.name}</td>
              <td>{l.commune}</td>
              <td>{l.reports}</td>
              <td className="font-semibold text-eco">{l.points.toLocaleString()}</td>
              <td>
                <button className="rounded-md border border-border px-2 py-1 text-xs">Éditer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportsTab() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-display text-lg font-bold">Modération des signalements</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-2">ID</th>
              <th>Commune</th>
              <th>Type</th>
              <th>Sévérité</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {REPORTS.slice(0, 20).map((r) => (
              <tr key={r.id} className="border-b border-border/60">
                <td className="py-2 font-mono text-xs">{r.id}</td>
                <td className="capitalize">{r.commune}</td>
                <td className="capitalize">{r.type}</td>
                <td className="capitalize">{r.severity}</td>
                <td className="capitalize text-muted-foreground">{r.status.replace("_", " ")}</td>
                <td className="space-x-1">
                  <button className="rounded-md bg-eco/10 px-2 py-1 text-xs font-semibold text-eco">Valider</button>
                  <button className="rounded-md bg-flood/10 px-2 py-1 text-xs font-semibold text-flood">Rejeter</button>
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

function SettingsTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 font-display text-lg font-bold">Communes pilotes</h3>
        <ul className="divide-y divide-border">
          {COMMUNES.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="size-3 rounded-full" style={{ background: c.color }} />
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.population} hab.</div>
                </div>
              </div>
              <span className="rounded-full bg-eco/10 px-3 py-1 text-xs font-bold text-eco">
                Active
              </span>
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
