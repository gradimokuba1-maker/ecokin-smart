import { Check, MapPin, ShieldCheck, Trophy } from "lucide-react";
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <div className="relative mx-auto mb-3 grid size-24 place-items-center rounded-full bg-emerald-500/10 ring-8 ring-emerald-500/5">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30 animate-ping [animation-duration:1.8s]" />
            <div className="absolute inset-2 rounded-full border-2 border-emerald-400/40 animate-pulse" />
            <div className="relative grid size-16 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 animate-[bounce_0.9s_ease-out_1]">
              <Check className="size-8 stroke-[3]" />
            </div>
          </div>
          <DialogTitle className="text-center font-display text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            Signalement envoyé avec succès !
          </DialogTitle>
          <DialogDescription className="text-center text-base leading-7 text-muted-foreground">
            Votre signalement a été transmis avec succès. Merci pour votre contribution à la
            protection de l’environnement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-2xl border border-emerald-200/60 bg-emerald-500/[0.05] p-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Référence</span>
            <span className="font-mono font-semibold">{report.id}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Commune</span>
            <span className="flex items-center gap-1 font-semibold capitalize">
              <MapPin className="size-3.5 text-eco" /> {communeLabel}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Catégorie</span>
            <span className="capitalize font-semibold">{report.category}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Urgence</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${URGENCY_META[report.urgency].bg} ${URGENCY_META[report.urgency].color}`}
            >
              {URGENCY_META[report.urgency].label}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Statut</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_META[report.status].color}`}
            >
              {STATUS_META[report.status].label}
            </span>
          </div>
        </div>

        {greenPoints > 0 && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-eco/30 bg-eco/10 px-4 py-3">
            <Trophy className="size-5 text-eco" />
            <span className="font-display text-lg font-bold text-eco">
              +{greenPoints} Green Points
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200/60 bg-emerald-500/[0.05] px-3 py-3 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
          <span>Votre contribution a bien été prise en compte et envoyée à la plateforme.</span>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Continuer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
