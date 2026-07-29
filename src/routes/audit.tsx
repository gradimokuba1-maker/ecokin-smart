import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AccessGate } from "@/components/access-gate";
import { ACTION_LABEL, useAuditLog, type AuditAction } from "@/lib/audit-log";
import { ScrollText, Download, Trash2, Filter } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Journal d'audit — EcoKin Smart" },
      {
        name: "description",
        content:
          "Traçabilité complète : connexions, validations, interventions et changements de rôle.",
      },
    ],
  }),
  component: () => (
    <AccessGate required={["admin", "gouverneur"]} title="Journal d'audit">
      <Page />
    </AccessGate>
  ),
});

function Page() {
  const { entries, clear } = useAuditLog();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<AuditAction | "all">("all");

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filter !== "all" && e.action !== filter) return false;
      if (q && !JSON.stringify(e).toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [entries, q, filter]);

  function exportCSV() {
    const header = "date,utilisateur,role,action,cible,details\n";
    const rows = filtered
      .map((e) =>
        [
          e.at,
          e.user,
          e.role,
          ACTION_LABEL[e.action],
          e.target ?? "",
          (e.details ?? "").replace(/,/g, ";"),
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-ecokin-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="border-b border-border bg-kin text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-eco">
            <ScrollText className="size-4" /> Traçabilité & conformité
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold">Journal d'audit</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Toutes les actions sensibles sont horodatées et conservées : connexions, validations,
            interventions, changements de rôle et corrections IA.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm">
            <Filter className="size-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
            >
              <option value="all">Toutes les actions</option>
              {Object.entries(ACTION_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher (utilisateur, ID, détails)…"
            className="flex-1 min-w-[180px] rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          />
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1 rounded-lg bg-eco px-3 py-1.5 text-xs font-bold text-white hover:bg-eco/90"
          >
            <Download className="size-3.5" /> Export CSV
          </button>
          <button
            onClick={() => confirm("Vider le journal ?") && clear()}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
          >
            <Trash2 className="size-3.5" /> Vider
          </button>
          <div className="ml-auto text-xs text-muted-foreground">
            {filtered.length} / {entries.length} entrées
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Date & heure</th>
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Cible</th>
                  <th className="px-4 py-3">Détails</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-muted-foreground"
                    >
                      Aucune entrée pour l'instant. Les actions sont enregistrées automatiquement.
                    </td>
                  </tr>
                )}
                {filtered.map((e) => (
                  <tr key={e.id} className="border-t border-border/60 hover:bg-secondary/30">
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                      {new Date(e.at).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-2 font-semibold">{e.user}</td>
                    <td className="px-4 py-2 text-xs capitalize text-muted-foreground">{e.role}</td>
                    <td className="px-4 py-2 text-xs">
                      <span className="rounded-full bg-eco/10 px-2 py-0.5 font-bold text-eco">
                        {ACTION_LABEL[e.action]}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">{e.target ?? "—"}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{e.details ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
