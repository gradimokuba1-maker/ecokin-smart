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
              value={`${report.lat?.toFixed(5)}, ${report.lng?.toFixed(5)}`}
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
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-eco">Analyse IA</h4>
            <DetailItem
              icon={Scale}
              label="Volume estimé"
              value={report.volumeM3 ? `${report.volumeM3} m³` : "Non calculé"}
            />
            <DetailItem
              icon={Layers}
              label="Types de déchets"
              value={
                report.composition
                  ?.map((c) => `${c.material} (${c.percentage}%)`)
                  .join(", ") || "Non analysé"
              }
            />
            <DetailItem
              icon={TrendingUp}
              label="Niveau de priorité"
              value={
                `${report.priorityLevel} (Score: ${report.priorityScore})` || "Non évalué"
              }
            />
            <DetailItem
              icon={BadgePercent}
              label="Niveau de confiance IA"
              value={
                report.analysisConfidence
                  ? `${(report.analysisConfidence * 100).toFixed(0)}%`
                  : "Non évalué"
              }
            />
            <DetailItem
              icon={Info}
              label="Observations et recommandations"
              value={report.aiAnalysis?.description || report.description || "Aucune"}
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
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
