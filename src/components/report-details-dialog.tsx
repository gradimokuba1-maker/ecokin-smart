import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
}: {
  report: import("@/lib/live-reports").LiveReport;
  isOpen: boolean;
  onClose: () => void;
}) {
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
        <icon className="size-4 text-muted-foreground" />
      </div>
      <div>
        <div className="text-xs font-bold text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Détails du Signalement: {report.id}</DialogTitle>
          <DialogDescription>
            Informations complètes du signalement, y compris l'analyse par IA.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 md:grid-cols-2">
          <div className="space-y-4">
            {report.photoUrl && (
              <img
                src={report.photoUrl}
                alt="Aperçu du signalement"
                className="w-full rounded-xl border-2 border-border object-cover aspect-[4/3]"
              />
            )}
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
              label="Catégorie du déchet"
              value={report.category || "Non renseignée"}
            />
            <DetailItem
              icon={Layers}
              label="Type de déchet identifié"
              value={analysis?.mainCategory || report.category || "Non analysé"}
            />
            <DetailItem
              icon={TrendingUp}
              label="Historique du traitement"
              value={
                report.history?.length
                  ? report.history.map((entry) => `${entry.label} (${new Date(entry.at).toLocaleString("fr-FR")})`).join(" · ")
                  : "Aucun historique"
              }
            />
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-eco">Analyse IA</h4>
            <DetailItem
              icon={Scale}
              label="Volume estimé"
              value={volume ? `${volume} m³` : "Non calculé"}
            />
            <DetailItem
              icon={Layers}
              label="Composition détectée"
              value={
                report.composition
                  ?.map((c) => `${c.material} (${c.percentage}%)`)
                  .join(", ") || analysis?.composition?.map((c) => `${c.material} (${c.percentage}%)`).join(", ") || "Non analysé"
              }
            />
            <DetailItem
              icon={TrendingUp}
              label="Niveau de priorité"
              value={
                report.priorityLevel || analysis?.mainCategory
                  ? `${report.priorityLevel ?? "N/A"} (Score: ${report.priorityScore ?? analysis?.priorityScore ?? "N/A"})`
                  : "Non évalué"
              }
            />
            <DetailItem
              icon={BadgePercent}
              label="Niveau de confiance IA"
              value={
                report.analysisConfidence ?? analysis?.analysisConfidence
                  ? `${((report.analysisConfidence ?? analysis?.analysisConfidence ?? 0) * 100).toFixed(0)}%`
                  : "Non évalué"
              }
            />
            <DetailItem
              icon={Info}
              label="Observations et recommandations"
              value={analysis?.description || report.description || "Aucune"}
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
            {analysis?.detectedObjects?.length ? (
              <DetailItem
                icon={Layers}
                label="Objets détectés"
                value={analysis.detectedObjects
                  .map((object) => `${object.label}${object.count ? ` × ${object.count}` : ""} (${Math.round((object.confidence ?? 0) * 100)}%)`)
                  .join(", ")}
              />
            ) : null}
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
