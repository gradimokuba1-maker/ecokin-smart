import { CheckCircle2, MapPin, Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { STATUS_META, URGENCY_META, type LiveReport } from "@/lib/live-reports";

type Props = {
  open: boolean;
  onClose: () => void;
  report: LiveReport | null;
  greenPoints: number;
  communeLabel: string;
};

export function ReportSuccessDialog({ open, onClose, report, greenPoints, communeLabel }: Props) {
  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 grid size-16 place-items-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <DialogTitle className="text-center font-display text-xl">
            Signalement enregistré avec succès
          </DialogTitle>
          <DialogDescription className="text-center">
            Votre signalement a été transmis aux autorités compétentes. Merci pour votre contribution à la propreté de Kinshasa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-xl border bg-muted/40 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Référence</span>
            <span className="font-mono font-semibold">{report.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Commune</span>
            <span className="flex items-center gap-1 font-semibold capitalize">
              <MapPin className="size-3.5 text-eco" /> {communeLabel}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Catégorie</span>
            <span className="capitalize font-semibold">{report.category}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Urgence</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${URGENCY_META[report.urgency].bg} ${URGENCY_META[report.urgency].color}`}>
              {URGENCY_META[report.urgency].label}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Statut</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_META[report.status].color}`}>
              {STATUS_META[report.status].label}
            </span>
          </div>
        </div>

        {greenPoints > 0 && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-eco/30 bg-eco/10 px-4 py-3">
            <Trophy className="size-5 text-eco" />
            <span className="font-display text-lg font-bold text-eco">+{greenPoints} Green Points</span>
          </div>
        )}

        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Continuer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
