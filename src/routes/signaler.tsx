import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useServerFn } from "@tanstack/react-start";
import { validateReportHash, commitReportHash } from "@/lib/report-submit.functions";
import { useEcoUser } from "@/lib/user-store";
import { priorityScore, type Severity } from "@/lib/data";
import { DEFAULT_CITY, detectCityCommune } from "@/lib/cities";
import { pushLiveReport, urgencyFromSeverity } from "@/lib/live-reports";
import { computePerceptualHash, findDuplicate, saveHash } from "@/lib/image-hash";
import { ReportSuccessDialog } from "@/components/report-success-dialog";
import { Loader2, ShieldAlert, ShieldCheck, Trophy } from "lucide-react";
import { toast } from "sonner";
import { SmartWasteCamera, type CaptureResult } from "@/components/waste-ai/SmartWasteCamera";
import { WasteAnalysisResultCard } from "@/components/waste-ai/WasteAnalysisResult";
import { analyzeWasteCapture } from "@/lib/waste-ai/client-analysis";
import type { LiveReport } from "@/lib/live-reports";
import type { WasteAnalysisResult } from "@/lib/waste-ai/types";
import { CitizenGate } from "@/components/citizen-gate";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/signaler")({
  component: SignalerRoute,
});

function SignalerRoute() {
  return <SignalerPage />;
}

type AnalysisResult = WasteAnalysisResult;
type PageStep = "camera" | "analyzing" | "form" | "authenticating" | "submitted";

function severityFromAnalysis(result: AnalysisResult): Severity {
  if (result.interventionUrgent || result.floodRisk || result.priorityLevel === "critique") return "critique";
  if (result.priorityLevel === "eleve" || result.healthRisk === "eleve") return "modere";
  return "faible";
}

function SignalerPage() {
  const { user, addPoints } = useEcoUser();
  const navigate = useNavigate({ from: "/signaler" });
  const validateHash = useServerFn(validateReportHash);
  const commitHash = useServerFn(commitReportHash);

  const [step, setStep] = useState<PageStep>("camera");
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [commune, setCommune] = useState<string>("");
  const [imgHash, setImgHash] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<{ similarity: number; at: string; source: "local" | "server" } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [capture, setCapture] = useState<CaptureResult | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<LiveReport | null>(null);
  const [earnedGreenPoints, setEarnedGreenPoints] = useState(0);

  const analysisRequestRef = useRef(0);

  const handleSmartCapture = useCallback(
    async (captureResult: CaptureResult | null) => {
      if (!captureResult) {
        setStep("camera");
        return;
      }

      setStep("analyzing");
      const requestId = ++analysisRequestRef.current;
      const { imageDataUrl: dataUrl, location } = captureResult;

      if (!location) {
        toast.error("Position GPS obligatoire.");
        setStep("camera");
        return;
      }
      const detectedCommune = detectCityCommune(DEFAULT_CITY, location.lat, location.lng).id;

      setCapture(captureResult);
      setAnalysisResult(null);
      setDuplicate(null);
      setImgHash(null);

      if (location) {
        setPos({ lat: location.lat, lng: location.lng });
        setCommune(detectedCommune);
      }

      try {
        const hash = await computePerceptualHash(dataUrl);
        if (requestId !== analysisRequestRef.current) return;
        setImgHash(hash);

        const localDup = findDuplicate(hash, 95);
        if (localDup) {
          setDuplicate({ similarity: localDup.similarity, at: localDup.match.at, source: "local" });
          toast.error("Photo déjà utilisée pour un signalement local.");
          setStep("form");
          return;
        }

        const validationPromise = validateHash({
          data: { hash, lat: location.lat, lng: location.lng, category: "unknown" },
        });
        const analysisPromise = analyzeWasteCapture(captureResult);

        const [check, smartAnalysis] = await Promise.all([validationPromise, analysisPromise]);
        if (requestId !== analysisRequestRef.current) return;
        if (check?.duplicate) {
          setDuplicate({
            similarity: check.similarity ?? 100,
            at: check.matchedAt ?? new Date().toISOString(),
            source: "server",
          });
          toast.error("Photo déjà enregistrée sur EcoKin.");
          setAnalysisResult(smartAnalysis); // Show analysis even if duplicate
          setStep("form");
          return;
        }

        setAnalysisResult(smartAnalysis);
        setCommune(smartAnalysis.location.commune);
        toast.success("Analyse IA terminée");
        setStep("form");
      } catch (e) {
        console.error("AI analysis failed", e);
        toast.error("Erreur d'analyse IA");
        setStep("camera");
      }
    },
    [validateHash],
  );

  async function submitReport() {
    if (!analysisResult || !imgHash || !pos || !commune || submitting || duplicate) return;
    setSubmitting(true);

    try {
      const severity = severityFromAnalysis(analysisResult);
      const earned = user ? (severity === "critique" ? 80 : severity === "modere" ? 50 : 25) : 0;
      const score = priorityScore({
        commune: commune as any,
        lat: pos.lat,
        lng: pos.lng,
        severity,
      });
      const urgency = urgencyFromSeverity(severity, analysisResult.floodRisk);

      const item = pushLiveReport({
        author: user?.name ?? "Citoyen Anonyme",
        authorId: user?.id ?? "anonyme",
        authorRole: user ? "citoyen" : "anonyme",
        province: "Kinshasa",
        city: "Kinshasa",
        commune,
        category: analysisResult.mainCategory,
        urgency,
        description: description || undefined,
        lat: pos.lat,
        lng: pos.lng,
        volumeM3: analysisResult.dimensions.volumeM3,
        priorityScore: score,
        photoUrl: capture?.imageDataUrl ?? undefined,
        composition: analysisResult.composition,
        weightTons: analysisResult.weight.weightTons,
        dimensions: analysisResult.dimensions,
        priorityLevel: analysisResult.priorityLevel,
        healthRisk: analysisResult.healthRisk,
        cameraCapability: capture?.cameraCapability,
        greenPointsAwarded: earned,
        aiAnalysis: analysisResult,
      });

      saveHash(imgHash, item.id);

      commitHash({
        data: { hash: imgHash, lat: pos.lat, lng: pos.lng, reportId: item.id, category: analysisResult.mainCategory },
      }).catch((e) => console.warn("commitHash failed", e));

      if (user) {
        addPoints(earned);
        setEarnedGreenPoints(earned);
      }

      setSubmittedReport(item);
      setStep("submitted");
      toast.success(`Signalement enregistré · urgence ${urgency}`);
    } catch (error) {
      console.error("Erreur lors de la soumission du signalement :", error);
      toast.error("Une erreur est survenue. Le signalement n'a pas pu être enregistré.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "camera") {
    return <SmartWasteCamera onCapture={handleSmartCapture} onClose={() => navigate({ to: "/" })} />;
  }

  if (step === "analyzing") {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-background text-foreground">
        <div className="text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-eco" />
          <p className="mt-4 font-bold text-lg">Analyse intelligente en cours...</p>
          <p className="mt-1 text-muted-foreground">Classification, volume, poids...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav minimal />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {step === "submitted" ? (
          <div className="text-center">
            <ShieldCheck className="mx-auto size-12 text-emerald-500" />
            <h1 className="mt-4 font-display text-3xl font-bold">Signalement enregistré !</h1>
            <p className="mt-2 text-muted-foreground">Merci pour votre contribution à un Kinshasa plus propre.</p>
            {!user && (
              <div className="mt-8 rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2">
                  <Trophy className="size-5 text-eco" />
                  <h3 className="font-display text-lg font-bold">Gagnez des Green Points !</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Créez un compte ou connectez-vous pour gagner des points pour ce signalement et tous les suivants.
                </p>
                <Button onClick={() => setStep("authenticating")} className="mt-4 w-full">
                  Créer un compte / Connexion
                </Button>
              </div>
            )}
            <Button onClick={() => navigate({ to: "/" })} variant="ghost" className="mt-6">
              Retour à l'accueil
            </Button>
          </div>
        ) : step === "authenticating" ? (
          <CitizenGate
            title="Rejoignez EcoKin"
            description="Créez votre compte citoyen pour cumuler vos Green Points et suivre l'impact de vos actions."
          />
        ) : (
          <div className="space-y-6">
            <header>
              <p className="text-xs font-bold uppercase tracking-widest text-eco">Étape 2/2</p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Vérifier et soumettre</h1>
              <p className="mt-2 text-muted-foreground">
                L'analyse est terminée. Ajoutez une description si nécessaire, puis envoyez.
              </p>
            </header>

            {analysisResult ? <WasteAnalysisResultCard result={analysisResult} /> : null}

            {duplicate && (
              <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-500/10 p-4 text-sm text-red-800">
                <ShieldAlert className="mt-0.5 size-4 flex-shrink-0" />
                <div>
                  <p className="font-bold">
                    Photo déjà utilisée ({duplicate.similarity}% similaire)
                  </p>
                  <p className="text-xs">
                    Un signalement semble exister pour cette image. Pour éviter les doublons, vous ne pouvez pas
                    le soumettre à nouveau.
                  </p>
                </div>
              </div>
            )}

            <section>
              <label className="text-sm font-bold text-foreground">Description (optionnelle)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={300}
                placeholder="Ex. caniveau bloqué, accumulation depuis 3 jours…"
                className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm focus:border-eco focus:outline-none focus:ring-2 focus:ring-eco/30"
              />
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setStep("camera")}
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                Reprendre la photo
              </Button>
              <Button
                onClick={submitReport}
                disabled={!analysisResult || !!duplicate || submitting}
                className="w-full"
              >
                {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {submitting ? "Envoi en cours..." : "Envoyer le signalement"}
              </Button>
            </div>
          </div>
        )}
      </main>
      <ReportSuccessDialog
        open={submittedReport !== null && user !== null}
        onClose={() => setSubmittedReport(null)}
        report={submittedReport}
        greenPoints={earnedGreenPoints}
        communeLabel={DEFAULT_CITY.communes.find((c) => c.id === submittedReport?.commune)?.name ?? submittedReport?.commune ?? "Kinshasa"}
      />
    </div>
  );
}
