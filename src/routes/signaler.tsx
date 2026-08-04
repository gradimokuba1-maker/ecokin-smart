import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useState } from "react";
import { useEcoUser, queuePendingReportId } from "@/lib/user-store";
import { computePerceptualHash } from "@/lib/image-hash";
import { DEFAULT_CITY, detectCityCommune } from "@/lib/cities";
import { updateLiveReport, pushLiveReport, confirmDuplicateReport } from "@/lib/live-reports";
import { submitCitizenReport } from "@/lib/report-submit.functions";
import { readDb } from "@/lib/ecokin-db";
import { evaluateDuplicateReport, type DuplicateCandidate } from "@/lib/duplicate-detection";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { CaptureResult } from "@/components/waste-ai/SmartWasteCamera";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/signaler")({
  component: SignalerPage,
});

type PageStep = "camera" | "confirmation" | "submitting" | "submitted";

const SmartWasteCamera = lazy(() =>
  import("@/components/waste-ai/SmartWasteCamera").then((module) => ({
    default: module.SmartWasteCamera,
  })),
);

function SignalementLoader({ label }: { label: string }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background text-foreground">
      <div className="text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-eco" />
        <p className="mt-4 font-medium">{label}</p>
      </div>
    </div>
  );
}

function SignalerPage() {
  const navigate = useNavigate({ from: "/signaler" });
  const { user, login } = useEcoUser();
  const [step, setStep] = useState<PageStep>("camera");

  const [capture, setCapture] = useState<CaptureResult | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [duplicateCandidate, setDuplicateCandidate] = useState<DuplicateCandidate | null>(null);
  const [submissionMode, setSubmissionMode] = useState<"new" | "duplicate-confirmed">("new");

  const createThumbnail = (
    base64: string,
    maxWidth: number,
    maxHeight: number,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Could not get canvas context");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7)); // Compress to JPEG
      };
      img.onerror = (err) => reject(err);
    });
  };

  const handleCapture = useCallback(async (captureResult: CaptureResult) => {
    if (!captureResult.imageDataUrl) {
      toast.error("La capture a échoué. Veuillez réessayer.");
      return;
    }
    setCapture(captureResult);
    try {
      const pHash = await computePerceptualHash(captureResult.imageDataUrl);
      setHash(pHash);
      setStep("confirmation");
    } catch (error) {
      console.error("Perceptual hash computation failed", error);
      toast.error("Erreur lors de la préparation de l'image.");
    }
  }, []);

  const handleRetry = () => {
    setCapture(null);
    setHash(null);
    setDescription("");
    setDuplicateCandidate(null);
    setSubmissionMode("new");
    setStep("camera");
  };

  const buildCapturePayload = (captureResult: CaptureResult) => ({
    imageDataUrl: captureResult.imageDataUrl,
    additionalImages: captureResult.additionalImages.filter(Boolean),
    cameraCapability: captureResult.cameraCapability,
    location: captureResult.location,
    captureMode: captureResult.captureMode,
    capturedAt: captureResult.capturedAt,
    videoDurationSeconds: captureResult.videoDurationSeconds,
    imageQuality: captureResult.imageQuality,
    videoPreviewUrl:
      typeof captureResult.videoPreviewUrl === "string" ? captureResult.videoPreviewUrl : undefined,
    depthData: typeof captureResult.depthData === "string" ? captureResult.depthData : undefined,
  });

  const submitReport = async (forceCreateNew = false) => {
    console.log("[CLIENT] Début de submitReport()");
    if (!capture || !hash) {
      console.error("[CLIENT] Abandon : capture ou hash manquant.");
      toast.error("Une erreur est survenue, données de capture manquantes.");
      return;
    }

    if (!capture.location) {
      console.error("[CLIENT] Abandon : localisation manquante.");
      toast.error("Localisation GPS introuvable. Activez la localisation et réessayez.");
      setStep("confirmation");
      return;
    }

    const duplicateCheck = evaluateDuplicateReport({
      reports: readDb().reports,
      lat: capture.location.lat,
      lng: capture.location.lng,
      hash: hash ?? undefined,
    });

    if (duplicateCheck && !forceCreateNew) {
      setDuplicateCandidate(duplicateCheck.candidate);
      setSubmissionMode("new");
      toast.message("Un dépôt similaire est déjà actif à proximité. Confirmez s’il s’agit du même dépôt.");
      setStep("confirmation");
      return;
    }

    setDuplicateCandidate(null);
    console.log("[CLIENT] Passage à l'étape 'submitting'");
    setStep("submitting");

    // Create a thumbnail for the optimistic update to avoid blocking the main thread
    let thumbnailUrl = capture.imageDataUrl; // Fallback to full image
    try {
      thumbnailUrl = await createThumbnail(capture.imageDataUrl, 400, 400);
    } catch (e) {
      console.warn("Could not create thumbnail for optimistic update, using full image.", e);
    }

    const capturePayload = buildCapturePayload(capture);
    const payload = {
      capture: capturePayload,
      description,
      hash,
      ...(user.registered
        ? { author: user.name, authorId: user.id, authorRole: user.role as const }
        : {}),
    };
    console.log("[CLIENT] Données envoyées au serveur (extrait):", {
      description,
      hash,
      capture: {
        ...capturePayload,
        imageDataUrl: capture.imageDataUrl.substring(0, 50) + "...",
        additionalImages: capture.additionalImages.map((img) => img.substring(0, 50) + "..."),
      },
    });

    try {
      console.log("[CLIENT] Création locale du signalement pour visibilité immédiate.");
      const preliminaryReport = {
        author: user.registered ? user.name : "Citoyen Anonyme",
        authorId: user.registered ? user.id : "anonyme",
        authorRole: (user.role as any) || "anonyme",
        province: "Kinshasa",
        city: "Kinshasa",
        commune: detectCityCommune(DEFAULT_CITY, capture.location.lat, capture.location.lng).id,
        category: "mixte" as const,
        urgency: "moyen" as const,
        description: description || "Signalement citoyen rapide.",
        lat: capture.location.lat,
        lng: capture.location.lng,
        photoUrl: thumbnailUrl, // Use the smaller thumbnail for local storage
        imageHash: hash,
        cameraCapability:
          capture.cameraCapability === "lidar" || capture.cameraCapability === "arcore"
            ? capture.cameraCapability
            : "basic",
      } as const;

      const item = pushLiveReport(preliminaryReport as any);

      // Start server processing in background; do not block UI (handles analysis, hashing, etc.)
      submitCitizenReport({ data: { ...payload, reportId: item.id } })
        .then((result) => {
          if (result && result.success && result.reportId && result.analysisPatch) {
            console.log("[CLIENT] Patch IA reçu, application locale.");
            // Update the report with full analysis, which might include the final image URL from object storage later
            updateLiveReport(result.reportId, result.analysisPatch, "Analyse IA terminée");
          }
        })
        .catch((e) => console.error("Background submit failed:", e));

      // Queue pending if anonymous
      if (!user.registered) queuePendingReportId(item.id);

      toast.success("Votre signalement a été envoyé avec succès !");
      login({
        ...user,
        points: user.points + (user.registered ? 25 : 10),
        reports: user.reports + 1,
      });
      setStep("submitted");
    } catch (error) {
      console.error("[CLIENT] Erreur lors de la création locale du rapport :", error);
      toast.error("L'envoi a échoué. Veuillez réessayer.");
      setStep("confirmation");
    }
  };

  if (step === "camera") {
    return (
      <Suspense fallback={<SignalementLoader label="Ouverture de la camera..." />}>
        <SmartWasteCamera onCapture={handleCapture} onClose={() => navigate({ to: "/" })} />
      </Suspense>
    );
  }

  if (step === "submitting") {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-background text-foreground">
        <div className="text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-eco" />
          <p className="mt-4 font-bold text-lg">Envoi de votre signalement...</p>
          <p className="mt-1 text-muted-foreground">Merci de patienter.</p>
        </div>
      </div>
    );
  }

  if (step === "submitted") {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav minimal />
        <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="relative mx-auto grid size-32 place-items-center rounded-full bg-emerald-500/10 ring-8 ring-emerald-500/5 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/25 animate-ping [animation-duration:2s]" />
            <div className="absolute inset-2 rounded-full border-2 border-emerald-400/40 animate-pulse" />
            <div className="relative grid size-20 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 animate-[bounce_0.9s_ease-out_1]">
              <Check className="size-10 stroke-[3]" />
            </div>
          </div>

          <h1 className="mt-6 font-display text-3xl font-bold text-emerald-700 dark:text-emerald-400 sm:text-4xl">
            {submissionMode === "duplicate-confirmed"
              ? "Dépôt confirmé avec succès !"
              : "Signalement envoyé avec succès !"}
          </h1>
          <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
            {submissionMode === "duplicate-confirmed"
              ? "Votre confirmation a bien été prise en compte. Merci pour votre vigilance et votre contribution à la protection de l’environnement."
              : "Votre signalement a été transmis avec succès. Merci pour votre contribution à la protection de l’environnement."}
          </p>

          <div className="mt-8 w-full rounded-3xl border border-emerald-300/30 bg-emerald-500/[0.06] p-5 text-left shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-emerald-500/10">
                <ShieldCheck className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  Envoi validé
                </p>
                <p className="text-xs text-muted-foreground">
                  Votre contribution a bien été enregistrée sur la plateforme.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex w-full flex-col items-center gap-3">
            <Button
              onClick={() => navigate({ to: "/rejoindre" })}
              size="lg"
              className="w-full max-w-xs"
            >
              Créer un compte citoyen
            </Button>
            <Button onClick={() => navigate({ to: "/" })} variant="ghost" className="w-full max-w-xs">
              Continuer anonymement
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav minimal />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <header>
            <p className="text-xs font-bold uppercase tracking-widest text-eco">Confirmation</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
              Vérifier et soumettre
            </h1>
            <p className="mt-2 text-muted-foreground">
              Votre photo est prête. Ajoutez un commentaire si vous le souhaitez, puis envoyez.
            </p>
          </header>

          {capture?.imageDataUrl && (
            <div className="overflow-hidden rounded-xl border-2 border-border bg-black/5">
              <img
                src={capture.imageDataUrl}
                alt="Aperçu du signalement"
                className="w-full rounded-xl object-contain max-h-[420px]"
              />
            </div>
          )}

          <section>
            <label htmlFor="description" className="text-sm font-bold text-foreground">
              Ajouter un commentaire (optionnel)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Ex. Devant l'école, accumulation depuis plusieurs jours…"
              className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm focus:border-eco focus:outline-none focus:ring-2 focus:ring-eco/30"
            />
          </section>

          {duplicateCandidate && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-950 dark:text-amber-200">
              <p className="font-semibold">Un dépôt similaire est déjà actif à proximité.</p>
              <p className="mt-1 text-amber-800/90 dark:text-amber-300/90">
                Distance estimée : {duplicateCandidate.distanceMeters} m. Confirmez s’il s’agit du même dépôt.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => {
                    const reporterName = user.registered ? user.name : "Citoyen Anonyme";
                    confirmDuplicateReport(duplicateCandidate.id, reporterName);
                    setSubmissionMode("duplicate-confirmed");
                    setDuplicateCandidate(null);
                    setStep("submitted");
                    toast.success("Le dépôt existant a été confirmé.");
                  }}
                  className="w-full sm:w-auto"
                >
                  Oui, c’est le même dépôt
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log("[CLIENT] Création d’un nouveau signalement malgré le doublon probable");
                    void submitReport(true);
                  }}
                  className="w-full sm:w-auto"
                >
                  Créer un nouveau signalement
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
            <Button variant="outline" onClick={handleRetry} className="w-full sm:w-auto">
              Reprendre la photo
            </Button>
            <Button
              onClick={() => {
                console.log("[CLIENT] Clic sur 'Envoyer le signalement'");
                void submitReport();
              }}
              className="w-full"
              disabled={Boolean(duplicateCandidate)}
            >
              {duplicateCandidate ? "En attente de confirmation" : "Envoyer le signalement"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
