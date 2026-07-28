import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitCitizenReport } from "@/lib/report-submit.functions";
import { useEcoUser } from "@/lib/user-store";
import { computePerceptualHash } from "@/lib/image-hash";
import { Loader2, ShieldCheck, Trophy } from "lucide-react";
import { toast } from "sonner";
import {
  SmartWasteCamera,
  type CaptureResult,
} from "@/components/waste-ai/SmartWasteCamera";
import { CitizenGate } from "@/components/citizen-gate";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/signaler")({
  component: SignalerPage,
});

type PageStep =
  | "camera"
  | "confirmation"
  | "submitting"
  | "submitted"
  | "registering";

function SignalerPage() {
  const navigate = useNavigate({ from: "/signaler" });
  const { user } = useEcoUser();
  const [step, setStep] = useState<PageStep>("camera");

  const [capture, setCapture] = useState<CaptureResult | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const submitReportFn = useServerFn(submitCitizenReport);

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

  const submitReport = async () => {
    console.log("[CLIENT] Début de submitReport()");
    if (!capture || !hash) {
      console.log("[CLIENT] Abandon : capture ou hash manquant.");
      return;
    }

    console.log("[CLIENT] Passage à l'étape 'submitting'");
    setStep("submitting");

    const payload = { capture, description, hash };
    console.log("[CLIENT] Données envoyées au serveur :", payload);

    try {
      console.log("[CLIENT] Juste avant l'appel serveur");
      const result = await submitReportFn({ data: payload });
      console.log("Réponse serveur reçue :", result);
      toast.success("Votre signalement a été envoyé avec succès !");
      setStep("submitted");
    } catch (error) {
      console.error("Erreur serveur :", error);
      toast.error("L'envoi a échoué. Veuillez réessayer.");
      setStep("confirmation"); // Go back to confirmation screen on error
    }
  };

  if (step === "camera") {
    return (
      <SmartWasteCamera
        onCapture={handleCapture}
        onClose={() => navigate({ to: "/" })}
      />
    );
  }

  if (step === "submitting") {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-background text-foreground">
        <div className="text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-eco" />
          <p className="mt-4 font-bold text-lg">
            Envoi de votre signalement...
          </p>
          <p className="mt-1 text-muted-foreground">Merci de patienter.</p>
        </div>
      </div>
    );
  }

  if (step === "submitted" || step === "registering") {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav minimal />
        <main className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6 lg:px-8">
          {step === "submitted" ? (
            <>
              <ShieldCheck className="mx-auto size-14 text-emerald-500" />
              <h1 className="mt-4 font-display text-3xl font-bold">
                Signalement enregistré !
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Merci de contribuer à un environnement plus propre.
              </p>

              <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-6">
                <div className="flex items-center justify-center gap-3">
                  <Trophy className="size-6 text-amber-400" />
                  <h3 className="font-display text-xl font-bold">
                    Gagnez des Green Points !
                  </h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Créez un compte gratuit pour suivre vos signalements, recevoir
                  des notifications et accumuler des points pour chaque action
                  positive.
                </p>
                <Button
                  onClick={() => setStep("registering")}
                  size="lg"
                  className="mt-5 w-full max-w-xs"
                >
                  Créer un compte citoyen
                </Button>
              </div>
              <Button
                onClick={() => navigate({ to: "/" })}
                variant="ghost"
                className="mt-8"
              >
                Continuer anonymement
              </Button>
            </>
          ) : (
            <CitizenGate
              title="Rejoignez EcoKin"
              description="Créez votre compte citoyen pour cumuler vos Green Points et suivre l'impact de vos actions."
            />
          )}
        </main>
      </div>
    );
  }

  // Fallback for confirmation step
  return (
    <div className="min-h-screen bg-background">
      <SiteNav minimal />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <header>
            <p className="text-xs font-bold uppercase tracking-widest text-eco">
              Confirmation
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
              Vérifier et soumettre
            </h1>
            <p className="mt-2 text-muted-foreground">
              Votre photo est prête. Ajoutez un commentaire si vous le
              souhaitez, puis envoyez.
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
            <label
              htmlFor="description"
              className="text-sm font-bold text-foreground"
            >
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
            <Button
              variant="outline"
              onClick={handleRetry}
              className="w-full sm:w-auto"
            >
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
