import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InteractiveMap } from "@/components/interactive-map";
import { useLearning } from "@/lib/learning-store";
import { updateLiveReport } from "@/lib/live-reports";
import { calculateWeightFromVolume } from "@/lib/waste-ai/types";
import {
  AlertTriangle,
  BadgePercent,
  Calendar,
  Home,
  Info,
  Layers,
  MapPin,
  Scale,
  TrendingUp,
} from "lucide-react";

export function ReportDetailsDialog({
  report,
  isOpen,
  onClose,
  canProvideFeedback = false,
}: {
  report: import("@/lib/live-reports").LiveReport;
  isOpen: boolean;
  onClose: () => void;
  canProvideFeedback?: boolean;
}) {
  const { validate, correct } = useLearning();
  const [feedbackConfirmed, setFeedbackConfirmed] = useState<boolean | null>(null);
  const [correctedCategory, setCorrectedCategory] = useState(report?.category || "");
  const [correctedObjects, setCorrectedObjects] = useState(
    report?.detectedObjects?.map((item) => item.label).join(", ") || "",
  );
  const [feedbackNotes, setFeedbackNotes] = useState(report?.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!report) return;
    setCorrectedCategory(report.category || "");
    setCorrectedObjects(report.detectedObjects?.map((item) => item.label).join(", ") || "");
    setFeedbackNotes(report.description || "");
    setFeedbackConfirmed(null);
    setSavedMessage(null);
  }, [report]);

  if (!report) return null;

  const analysis = report.aiAnalysis as
    | {
      description?: string;
      detectedObjects?: Array<{ label: string; count?: number; confidence?: number }>;
      mainCategory?: string;
      secondaryCategory?: string;
      composition?: Array<{ material: string; percentage: number }>;
      priorityScore?: number;
      analysisConfidence?: number;
    }
    | undefined;
  const volume = report.volumeM3 ?? report.dimensions?.volumeM3;
  const weightEstimate =
    (report as any).weight?.weightKg ??
    (report as any).weightKg ??
    (analysis as any)?.weight?.weightKg ??
    (volume && (analysis?.composition || report.composition)
      ? calculateWeightFromVolume(volume, (analysis?.composition || report.composition) as any)
        .weightKg
      : undefined);
  const feedbackHistory = report.analysisFeedback ?? [];

  const DetailItem = ({
    icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex-shrink-0">
        {React.createElement(icon, { className: "size-4 text-muted-foreground" })}
      </div>
      <div>
        <div className="text-xs font-bold text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );

  const handleSaveFeedback = () => {
    setIsSaving(true);
    const confirmed = feedbackConfirmed !== false;
    const corrected = correctedCategory.trim() || report.category || analysis?.mainCategory || "";
    const corrections = correctedObjects
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const feedback = {
      confirmed,
      correctedCategory: corrected,
      correctedObjects: corrections,
      notes: feedbackNotes.trim() || undefined,
      by: "citoyen" as const,
      at: new Date().toISOString(),
    };
    const nextFeedback = [...feedbackHistory, feedback];
    const patch: Partial<typeof report> = {
      analysisFeedback: nextFeedback,
    };
    if (corrected && corrected !== report.category) {
      patch.category = corrected;
    }
    updateLiveReport(report.id, patch, "Retour citoyen IA enregistré");
    if (confirmed) {
      validate();
    } else {
      correct({
        reportId: report.id,
        predicted: report.category || analysis?.mainCategory || "inconnu",
        corrected,
        by: "citoyen",
        at: feedback.at,
      });
    }
    setIsSaving(false);
    setSavedMessage("Votre retour a bien été enregistré.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Détails du Signalement: {report.id}</DialogTitle>
          <DialogDescription>
            Informations complètes du signalement et synthèse IA.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            {(report.photoUrl || report.photoBefore) && (
              <div className="overflow-hidden rounded-xl border-2 border-border bg-black/5">
                <img
                  src={report.photoUrl || report.photoBefore}
                  alt="Aperçu du signalement"
                  className="w-full rounded-xl object-contain max-h-[420px]"
                />
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem
                icon={MapPin}
                label="Coordonnées GPS"
                value={`${report.lat?.toFixed(5) ?? "N/A"}, ${report.lng?.toFixed(5) ?? "N/A"}`}
              />
              <DetailItem
                icon={Home}
                label="Localisation"
                value={`${report.commune}${report.quartier ? `, ${report.quartier}` : ""}`}
              />
              <DetailItem
                icon={Calendar}
                label="Date et heure"
                value={new Date(report.createdAt).toLocaleString("fr-FR")}
              />
              <DetailItem
                icon={Info}
                label="Green Points reçus"
                value={`${report.greenPointsAwarded ?? 0} GP`}
              />
            </div>
            <div className="rounded-3xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Carte du dépôt
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Localisation exacte du signalement.
                  </p>
                </div>
              </div>
              <InteractiveMap reports={[report]} heightClassName="h-[260px]" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold">Analyse IA</h3>
                <span className="rounded-full bg-eco/10 px-3 py-1 text-xs font-semibold text-eco">
                  {report.priorityLevel ? report.priorityLevel.toUpperCase() : "N/A"}
                </span>
              </div>
              <div className="space-y-3">
                <DetailItem
                  icon={Scale}
                  label="Volume estimé"
                  value={volume ? `${volume.toFixed(2)} m³` : "Non calculé"}
                />
                <DetailItem
                  icon={Scale}
                  label="Poids estimé"
                  value={weightEstimate ? `${Math.round(weightEstimate)} kg` : "Non calculé"}
                />
                <DetailItem
                  icon={Layers}
                  label="Composition détectée"
                  value={
                    report.composition?.map((c) => `${c.material} (${c.percentage}%)`).join(", ") ||
                    analysis?.composition
                      ?.map((c) => `${c.material} (${c.percentage}%)`)
                      .join(", ") ||
                    "Non analysé"
                  }
                />
                <DetailItem
                  icon={Layers}
                  label="Types détectés"
                  value={
                    analysis?.detectedObjects?.length
                      ? analysis.detectedObjects
                        .map(
                          (object) =>
                            `${object.label}${object.count ? ` × ${object.count}` : ""}`,
                        )
                        .join(", ")
                      : report.detectedObjects?.map((object) => object.label).join(", ") || "Aucun"
                  }
                />
                <DetailItem
                  icon={BadgePercent}
                  label="Confiance IA"
                  value={
                    (report.analysisConfidence ?? analysis?.analysisConfidence) != null
                      ? `${Math.round((report.analysisConfidence ?? analysis?.analysisConfidence ?? 0) * 100)}%`
                      : "Non évalué"
                  }
                />
                <DetailItem
                  icon={TrendingUp}
                  label="Score de priorité"
                  value={report.priorityScore ?? analysis?.priorityScore ?? "N/A"}
                />
                <DetailItem
                  icon={AlertTriangle}
                  label="Risques identifiés"
                  value={
                    [
                      report.healthRisk && `Santé: ${report.healthRisk}`,
                      report.floodRisk && "Inondation",
                    ]
                      .filter(Boolean)
                      .join(", ") || "Aucun risque majeur détecté"
                  }
                />
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-4">
              <h3 className="text-base font-semibold">Observations</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {analysis?.description || report.description || "Aucune observation reçue."}
              </p>
            </div>

            {canProvideFeedback && (
              <div className="rounded-3xl border border-emerald-300/20 bg-emerald-50/60 p-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-eco/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-eco">
                    Retour IA citoyen
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Confirmez ou corrigez l'analyse et contribuez à améliorer le modèle.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-2 text-sm">
                      <span className="font-semibold">Analyse correcte ?</span>
                      <select
                        value={feedbackConfirmed === null ? "" : feedbackConfirmed ? "yes" : "no"}
                        onChange={(e) =>
                          setFeedbackConfirmed(
                            e.target.value === "" ? null : e.target.value === "yes",
                          )
                        }
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Choisir</option>
                        <option value="yes">Oui, c’est correct</option>
                        <option value="no">Non, corriger</option>
                      </select>
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="font-semibold">Catégorie corrigée</span>
                      <input
                        value={correctedCategory}
                        onChange={(e) => setCorrectedCategory(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold">Types de déchets détectés</span>
                    <input
                      value={correctedObjects}
                      onChange={(e) => setCorrectedObjects(e.target.value)}
                      placeholder="plastiques, cartons, verre..."
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold">Ajouter une remarque</span>
                    <textarea
                      value={feedbackNotes}
                      onChange={(e) => setFeedbackNotes(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-muted-foreground">
                      Vos retours sont stockés localement pour contribuer aux futures phases
                      d'entraînement.
                    </div>
                    <Button
                      onClick={handleSaveFeedback}
                      disabled={isSaving || feedbackConfirmed === null}
                    >
                      {isSaving ? "Enregistrement..." : "Enregistrer mon retour"}
                    </Button>
                  </div>
                  {savedMessage && (
                    <p className="text-sm font-semibold text-emerald-700">{savedMessage}</p>
                  )}
                </div>
              </div>
            )}

            {feedbackHistory.length > 0 && (
              <div className="rounded-3xl border border-border bg-background p-4">
                <h3 className="text-base font-semibold">Historique des retours</h3>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  {feedbackHistory.map((entry, index) => (
                    <div
                      key={`${entry.at}-${index}`}
                      className="rounded-2xl border border-border/60 bg-card p-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="font-semibold text-foreground">
                            {entry.confirmed ? "Confirmation" : "Correction"}
                          </div>
                          <div>{new Date(entry.at).toLocaleString("fr-FR")}</div>
                        </div>
                        <div className="text-xs uppercase tracking-widest text-muted-foreground">
                          {entry.by}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Catégorie : {entry.correctedCategory ?? report.category}
                      </div>
                      {entry.correctedObjects?.length ? (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Déchets : {entry.correctedObjects.join(", ")}
                        </div>
                      ) : null}
                      {entry.notes ? (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Remarque : {entry.notes}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.history && report.history.length > 0 && (
              <div className="rounded-3xl border border-border bg-card p-4">
                <h3 className="text-base font-semibold">Historique du signalement</h3>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {report.history.map((h, idx) => (
                    <div key={`${h.at}-${idx}`} className="rounded-2xl border border-border/60 bg-background/60 p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{h.label}</div>
                        <div className="text-xs text-muted-foreground">{new Date(h.at).toLocaleString("fr-FR")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
