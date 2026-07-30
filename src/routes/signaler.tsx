import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useState } from "react";
import { useEcoUser } from "@/lib/user-store";
import { computePerceptualHash } from "@/lib/image-hash";
import { DEFAULT_CITY, detectCityCommune } from "@/lib/cities";
import { pushLiveReport } from "@/lib/live-reports";
import { submitCitizenReport } from "@/lib/report-submit.functions";
import { Loader2, ShieldCheck, Trophy } from "lucide-react";
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
  const { user } = useEcoUser();
  const [step, setStep] = useState<PageStep>("camera");

  const [capture, setCapture] = useState<CaptureResult | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [description, setDescription] = useState("");

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
    setStep("camera");
  };

  const saveLocalReport = useCallback(
    (captureResult: CaptureResult, reportHash: string) => {
      const location = captureResult.location;
      const commune = location
        ? detectCityCommune(DEFAULT_CITY, location.lat, location.lng).id
        : DEFAULT_CITY.communes[0]?.id || "kinshasa";

      return pushLiveReport({
        author: user.registered ? user.name : "Citoyen Anonyme",
        authorId: user.registered ? user.id : "anonyme",
        authorRole: user.registered ? "citoyen" : "anonyme",
        province: "Kinshasa",
        city: "Kinshasa",
        commune,
        category: "mixte",
        urgency: "moyen",
        description: description.trim() || "Signalement citoyen rapide.",
        lat: location?.lat,
        lng: location?.lng,
        photoUrl: captureResult.imageDataUrl,
        photoBefore: captureResult.imageDataUrl,
        cameraCapability:
          captureResult.cameraCapability === "lidar" || captureResult.cameraCapability === "arcore"
            ? captureResult.cameraCapability
            : "basic",
        priorityScore: 62,
        priorityLevel: "moyen",
        analysisConfidence: 0.72,
        healthRisk: "modere",
        floodRisk: false,
        interventionUrgent: false,
        greenPointsAwarded: user.registered ? 25 : 10,
        aiAnalysis: {
          hash: reportHash,
          mode: captureResult.captureMode,
          imageQuality: captureResult.imageQuality,
        },
      });
    },
    [description, user.id, user.name, user.registered],
  );

  const submitReport = async () => {
    console.log("[CLIENT] Début de submitReport()");
    if (!capture || !hash) {
      console.error("[CLIENT] Abandon : capture ou hash manquant.");
      toast.error("Une erreur est survenue, données de capture manquantes.");
      return;
    }

    console.log("[CLIENT] Passage à l'étape 'submitting'");
    setStep("submitting");

    const payload = { capture, description, hash };
    console.log("[CLIENT] Données envoyées au serveur (extrait):", {
      description,
      hash,
      capture: {
        ...capture,
        imageDataUrl: capture.imageDataUrl.substring(0, 50) + "...",
        additionalImages: capture.additionalImages.map((img) => img.substring(0, 50) + "..."),
      },
    });

    const reportPromise = submitCitizenReport({ data: payload });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout: La requête a pris trop de temps.")), 30000),
    );

    try {
      console.log("[CLIENT] Juste avant l'appel serveur avec timeout.");
      await Promise.race([reportPromise, timeoutPromise]);

      console.log("[CLIENT] Appel serveur réussi.");
      toast.success("Votre signalement a été envoyé avec succès !");
      setStep("submitted");
    } catch (error) {
      console.error("[CLIENT] Erreur lors de la soumission du rapport :", error);
      const errorMessage =
        error instanceof Error && error.message.includes("Timeout")
          ? "L'envoi a échoué (timeout). Vérifiez votre connexion et réessayez."
          : "L'envoi a échoué. Veuillez réessayer.";

      toast.error(errorMessage);
      // Retour à l'écran de confirmation pour permettre une nouvelle tentative
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
        <main className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6 lg:px-8">
          <ShieldCheck className="mx-auto size-14 text-emerald-500" />
          <h1 className="mt-4 font-display text-3xl font-bold">Signalement enregistré !</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Merci de contribuer à un environnement plus propre.
          </p>

          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-6">
            <div className="flex items-center justify-center gap-3">
              <Trophy className="size-6 text-amber-400" />
              <h3 className="font-display text-xl font-bold">Gagnez des Green Points !</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Créez un compte gratuit pour suivre vos signalements, recevoir des notifications et
              accumuler des points pour chaque action positive.
            </p>
            <Button
              onClick={() => navigate({ to: "/rejoindre" })}
              size="lg"
              className="mt-5 w-full max-w-xs"
            >
              Créer un compte citoyen
            </Button>
          </div>
          <Button onClick={() => navigate({ to: "/" })} variant="ghost" className="mt-8">
            Continuer anonymement
          </Button>
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
            <img
              src={capture.imageDataUrl}
              alt="Aperçu du signalement"
              className="w-full rounded-xl border-2 border-border object-cover aspect-[4/3]"
            />
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

          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
            <Button variant="outline" onClick={handleRetry} className="w-full sm:w-auto">
              Reprendre la photo
            </Button>
            <Button
              onClick={() => {
                console.log("[CLIENT] Clic sur 'Envoyer le signalement'");
                submitReport();
              }}
              className="w-full"
            >
              Envoyer le signalement
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
