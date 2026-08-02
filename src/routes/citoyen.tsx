import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useEcoUser } from "@/lib/user-store";
import { useLiveReports, STATUS_META, URGENCY_META } from "@/lib/live-reports";
import { formatNumber } from "@/lib/utils";
import { ArrowRight, Heart, Trophy } from "lucide-react";
import { ReportDetailsDialog } from "@/components/report-details-dialog";

export const Route = createFileRoute("/citoyen")({
  head: () => ({
    meta: [
      { title: "Espace citoyen — EcoKin Smart" },
      {
        name: "description",
        content:
          "Suivez vos signalements, consultez vos Green Points et votre historique citoyen EcoKin.",
      },
    ],
  }),
  component: CitizenDashboard,
});

function CitizenDashboard() {
  const { user } = useEcoUser();
  const { items: reports } = useLiveReports();
  const [selectedReport, setSelectedReport] = useState<(typeof reports)[number] | null>(null);

  const userReports = useMemo(
    () =>
      reports
        .filter((report) => report.authorId === user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reports, user.id],
  );
  const points = formatNumber(user.points);
  const reportCount = userReports.length;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-eco">
                  Profil citoyen
                </p>
                <h1 className="mt-3 text-2xl font-bold tracking-tight">{user.name}</h1>
                <p className="mt-2 text-sm text-muted-foreground">{user.commune || "Kinshasa"}</p>
              </div>
              <div className="rounded-3xl bg-emerald-500/10 p-3 text-emerald-700">
                <Trophy className="size-7" />
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              <div className="rounded-3xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Green Points
                </p>
                <p className="mt-3 text-4xl font-bold text-eco">{points}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Solde disponible pour vos futures récompenses.
                </p>
              </div>
              <div className="rounded-3xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Signalements réalisés
                </p>
                <p className="mt-3 text-4xl font-bold">{reportCount}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Signalements envoyés depuis votre compte.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Heart className="size-5 text-eco" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-eco">
                    Espace citoyen
                  </p>
                  <h2 className="text-lg font-bold">Votre engagement compte</h2>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Vous pouvez désormais suivre votre historique, vos points et préparer vos échanges
                Green Points.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Historique
                  </p>
                  <h3 className="mt-2 text-xl font-bold">Signalements récents</h3>
                </div>
                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {reportCount} signalement(s)
                </div>
              </div>

              {userReports.length === 0 ? (
                <div className="mt-6 rounded-3xl bg-secondary/50 p-6 text-sm text-muted-foreground">
                  Aucun signalement n’est encore lié à votre compte.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {userReports.map((report) => (
                    <article
                      key={report.id}
                      className="rounded-3xl border border-border bg-background p-4 shadow-sm"
                    >
                      <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                        <div className="overflow-hidden rounded-3xl bg-slate-950/10">
                          <img
                            src={report.photoUrl || report.photoBefore || ""}
                            alt={`Signalement ${report.id}`}
                            className="h-28 w-full object-cover"
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold">{report.category || "Signalement"}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(report.createdAt).toLocaleString("fr-FR")}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${URGENCY_META[report.urgency].bg} ${URGENCY_META[report.urgency].color}`}
                              >
                                {URGENCY_META[report.urgency].label}
                              </span>
                              <span className="rounded-full bg-eco/10 px-3 py-1 text-[11px] font-semibold text-eco">
                                {report.greenPointsAwarded ?? 0} GP
                              </span>
                            </div>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
                            <div>Commune: {report.commune}</div>
                            <div>
                              Coordonnées: {report.lat?.toFixed(4) ?? "N/A"},{" "}
                              {report.lng?.toFixed(4) ?? "N/A"}
                            </div>
                            <div>
                              Status:{" "}
                              <span
                                className={`rounded-full px-2 py-1 ${STATUS_META[report.status]?.color}`}
                              >
                                {STATUS_META[report.status]?.label}
                              </span>
                            </div>
                            <div>Priorité: {report.priorityLevel ?? "N/A"}</div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedReport(report)}
                              className="rounded-full bg-eco px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                            >
                              Voir le signalement
                            </button>
                            <span className="text-xs text-muted-foreground">
                              {report.description ?? "Aucune observation"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />

      {selectedReport && (
        <ReportDetailsDialog
          report={selectedReport}
          isOpen={true}
          onClose={() => setSelectedReport(null)}
          canProvideFeedback={true}
        />
      )}
    </div>
  );
}
