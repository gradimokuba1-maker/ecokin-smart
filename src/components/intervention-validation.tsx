import { Button } from "@/components/ui/button";
import { type LiveReport } from "@/lib/eco-store";
import { Camera, Check, Play } from "lucide-react";

type Props = {
  report: LiveReport;
  onStart: () => void;
  onCaptureBefore: () => void;
  onCaptureAfter: () => void;
  onComplete: () => void;
};

export function InterventionValidation({ report, onStart, onCaptureBefore, onCaptureAfter, onComplete }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {report.status === "assignee" && (
        <Button size="sm" onClick={onStart}>
          <Play className="mr-1 size-3" /> Démarrer
        </Button>
      )}
      {report.status === "en_cours" && (
        <>
          <Button size="sm" variant="outline" onClick={onCaptureBefore}>
            <Camera className="mr-1 size-3" /> Avant {report.photoBefore ? "✓" : ""}
          </Button>
          <Button size="sm" variant="outline" onClick={onCaptureAfter}>
            <Camera className="mr-1 size-3" /> Après {report.photoAfter ? "✓" : ""}
          </Button>
          <Button size="sm" onClick={onComplete} className="bg-eco text-white hover:bg-eco/90" disabled={!report.photoBefore || !report.photoAfter}>
            <Check className="mr-1 size-3" /> Valider
          </Button>
        </>
      )}
      <div className="flex gap-2">
        {report.photoBefore && <img src={report.photoBefore} alt="Avant intervention" className="h-8 w-8 rounded-md object-cover" />}
        {report.photoAfter && <img src={report.photoAfter} alt="Après intervention" className="h-8 w-8 rounded-md object-cover" />}
      </div>
    </div>
  );
}
