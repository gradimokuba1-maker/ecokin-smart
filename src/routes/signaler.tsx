import { createFileRoute } from "@tanstack/react-router";
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
import { ClientOnly } from "@/components/client-only";
import { KinshasaMap } from "@/components/kinshasa-map";
import {
  Crosshair, Loader2, ShieldAlert, ShieldCheck, Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { CitizenGate } from "@/components/citizen-gate";
import { SmartWasteCamera, type CaptureResult } from "@/components/waste-ai/SmartWasteCamera";
import { WasteAnalysisResultCard } from "@/components/waste-ai/WasteAnalysisResult";
import { analyzeWasteCapture } from "@/lib/waste-ai/client-analysis";
import type { WasteAnalysisResult } from "@/lib/waste-ai/types";


export const Route = createFileRoute("/signaler")({
  head: () => ({
    meta: [
      { title: "Signaler un dépôt — EcoKin Smart" },
      {
        name: "description",
        content:
          "Signalez un dépôt depuis n'importe quelle commune de Kinshasa. GPS live, IA automatique, protection anti-fraude serveur.",
      },
    ],
  }),
  component: SignalerRoute,
});

function SignalerRoute() {
  return (
    <CitizenGate
      title="Signaler un dépôt"
      description="Créez votre compte citoyen pour envoyer vos signalements et cumuler vos Green Points. Vous les retrouverez à chaque connexion."
    >
      <SignalerPage />
    </CitizenGate>
  );
}

type GeoState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "ok"; lat: number; lng: number; accuracy: number }
  | { status: "denied" }
  | { status: "unavailable" };

type AnalysisResult = WasteAnalysisResult;

function severityFromAnalysis(result: AnalysisResult): Severity {
  if (result.interventionUrgent || result.floodRisk || result.priorityLevel === "critique") return "critique";
  if (result.priorityLevel === "eleve" || result.healthRisk === "eleve") return "modere";
  return "faible";
}

function SignalerPage() {
  const { user, addPoints } = useEcoUser();
  const validateHash = useServerFn(validateReportHash);
  const commitHash = useServerFn(commitReportHash);

  const [geo, setGeo] = useState<GeoState>({ status: "idle" });
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [commune, setCommune] = useState<string>("");
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [imgHash, setImgHash] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<{ similarity: number; at: string; source: "local" | "server" } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [capture, setCapture] = useState<CaptureResult | null>(null);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const analysisRequestRef = useRef(0);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeo({ status: "unavailable" });
      return;
    }
    setGeo({ status: "requesting" });
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const lat = p.coords.latitude;
        const lng = p.coords.longitude;
        setGeo({ status: "ok", lat, lng, accuracy: p.coords.accuracy });
        setPos({ lat, lng });
        setCommune(detectCityCommune(DEFAULT_CITY, lat, lng).id);
      },
      (err) => {
        const status = err.code === err.PERMISSION_DENIED ? "denied" : "unavailable";
        setGeo({ status });
        if (status === 'denied') toast.error("La géolocalisation a été refusée.");
        else toast.warning("Impossible d'obtenir la position GPS.");
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }, []);

  const handleSmartCapture = useCallback(async (captureResult: CaptureResult | null) => {
    const requestId = ++analysisRequestRef.current;
    if (!captureResult) {
      setImgPreview(null);
      setImgHash(null);
      setAnalysisResult(null);
      setCapture(null);
      setDuplicate(null);
      setAnalyzing(false);
      return;
    }
    const { imageDataUrl: dataUrl, location } = captureResult;
    if (!location) {
      toast.error("Position GPS obligatoire : reprenez la photo avec la localisation active.");
      return;
    }
    const effectivePosition = { lat: location.lat, lng: location.lng, accuracy: location.accuracy, altitudeM: location.altitudeM };
    const detectedCommune = detectCityCommune(DEFAULT_CITY, location.lat, location.lng).id;

    setCapture(captureResult);
    setImgPreview(dataUrl);
    setImgHash(null);
    setAnalysisResult(null);
    setSubmitted(false);
    setDuplicate(null);
    setAnalyzing(true);

    if (location) {
      setGeo({ status: "ok", lat: location.lat, lng: location.lng, accuracy: location.accuracy });
      setPos({ lat: location.lat, lng: location.lng });
      setCommune(detectedCommune);
    }

    try {
      const hash = await computePerceptualHash(dataUrl);
      if (requestId !== analysisRequestRef.current) return;
      setImgHash(hash);

      // La vérification locale est immédiate. La vérification serveur et la
      // seule analyse complète sont ensuite parallélisées pour réduire le délai.
      const localDup = findDuplicate(hash, 95);
      if (localDup) {
        setDuplicate({ similarity: localDup.similarity, at: localDup.match.at, source: "local" });
        toast.error("Photo déjà utilisée localement pour un signalement.");
        return;
      }

      const validationPromise = validateHash({
        data: {
          hash,
          lat: effectivePosition?.lat,
          lng: effectivePosition?.lng,
          category: "unknown",
        },
      }).catch((error) => {
        console.warn("validateHash failed", error);
        return null;
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
        toast.error("Photo déjà enregistrée sur EcoKin (vérification serveur).");
        return;
      }

      setAnalysisResult(smartAnalysis);
      setCommune(smartAnalysis.location.commune);
      toast.success("Analyse IA terminée");
    } catch (e) {
      console.error("AI analysis failed", e);
      toast.error("Erreur d'analyse IA");
    } finally {
      if (requestId === analysisRequestRef.current) setAnalyzing(false);
    }
  }, [validateHash]);

  async function submitReport() {
    if (!analysisResult || !imgHash || !pos || !commune || submitting || submitted || duplicate) return;
    setSubmitting(true);
    const severity = severityFromAnalysis(analysisResult);
    const earned = severity === "critique" ? 80 : severity === "modere" ? 50 : 25;
    const score = priorityScore({
      commune: commune as any,
      lat: pos.lat,
      lng: pos.lng,
      severity,
    });
    const urgency = urgencyFromSeverity(severity, analysisResult.floodRisk);
    const item = pushLiveReport({
      author: user.name,
      commune,
      category: analysisResult.mainCategory,
      urgency,
      description: description || undefined,
      lat: pos.lat,
      lng: pos.lng,
      volumeM3: analysisResult.dimensions.volumeM3,
      priorityScore: score,
      photoUrl: imgPreview ?? undefined,
      composition: analysisResult.composition,
      weightTons: analysisResult.weight.weightTons,
      dimensions: analysisResult.dimensions,
      priorityLevel: analysisResult.priorityLevel,
      healthRisk: analysisResult.healthRisk,
      cameraCapability: capture?.cameraCapability,
    });
    saveHash(imgHash, item.id);
    try {
      const commit = await commitHash({
        data: { hash: imgHash, lat: pos.lat, lng: pos.lng, reportId: item.id, category: analysisResult.mainCategory },
      });
      if ("duplicate" in commit && commit.duplicate) {
        toast.error("Rejeté au commit : cette photo vient d'être signalée par un autre utilisateur.");
        setDuplicate({ similarity: commit.similarity ?? 100, at: commit.matchedAt ?? new Date().toISOString(), source: "server" });
        setSubmitting(false);
        return;
      }
    } catch (e) {
      console.warn("commitHash failed", e);
    }
    addPoints(earned);
    setSubmitted(true);
    setSubmitting(false);
    toast.success(`Signalement enregistré · +${earned} Green Points · urgence ${urgency}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav minimal />
      <header className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-eco">Signalement citoyen · 24 communes</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Signaler un dépôt à Kinshasa</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Disponible dans toute la ville de Kinshasa. Position GPS en direct, analyse IA
            automatique, contrôle anti-fraude côté serveur.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
        <div className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
          {/* Étape 1 · Carte + GPS */}
          <section>
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold">1 · Position du dépôt</label>
              <GeoBadge geo={geo} />
            </div>
            {(geo.status === "denied" || geo.status === "unavailable") && (
              <div className="mt-3 rounded-xl border border-amber-300 bg-amber-500/10 p-3 text-xs text-amber-800">
                {geo.status === "denied"
                  ? "Localisation refusée : cliquez directement sur la carte pour placer le marqueur."
                  : "GPS indisponible : cliquez sur la carte pour placer le marqueur."}
              </div>
            )}
            <div className="mt-3">
              <ClientOnly fallback={<div className="grid h-[380px] place-items-center rounded-2xl bg-secondary text-sm text-muted-foreground">Chargement de la carte…</div>}>
                <KinshasaMap
                  city={DEFAULT_CITY}
                  reports={[]}
                  height={380}
                  followUser
                  onUserLocation={(lat, lng) => {
                    if (!pos) {
                      setPos({ lat, lng });
                      setCommune(detectCityCommune(DEFAULT_CITY, lat, lng).id);
                    }
                  }}
                />
              </ClientOnly>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
              {pos && (
                <span className="font-mono text-muted-foreground">
                  {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
                </span>
              )}
              <span className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold">
                Commune detectee : {DEFAULT_CITY.communes.find((c) => c.id === commune)?.name ?? "en attente GPS"}
              </span>
              {!pos && (
                <span className="text-muted-foreground">La commune sera detectee automatiquement avec la photo GPS.</span>
              )}
            </div>
          </section>

          {/* Étape 2 · Photo */}
          <section>
            <label className="text-sm font-bold">2 · Acquisition du dépôt</label>
            <div className="mt-3">
              <SmartWasteCamera onCapture={handleSmartCapture} disabled={analyzing || submitting} />
            </div>

            {analyzing && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-eco/5 px-3 py-2 text-sm font-semibold text-eco">
                <Loader2 className="size-4 animate-spin" /> Analyse du déchet en cours…
              </div>
            )}
            {imgHash && !duplicate && !analyzing && analysisResult && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="size-4" /> Empreinte validée (locale + serveur)
              </div>
            )}
            {duplicate && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-300 bg-red-500/10 p-3 text-sm text-red-800">
                <ShieldAlert className="mt-0.5 size-4" />
                <div>
                  <div className="font-bold">
                    Photo déjà utilisée · {duplicate.similarity}% similaire · vérification {duplicate.source === "server" ? "serveur" : "locale"}
                  </div>
                  <p className="text-xs">
                    Un signalement existe déjà avec cette image (le {new Date(duplicate.at).toLocaleString("fr-FR")}). Prenez une nouvelle photo du site.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Étape 3 · Description */}
          <section>
            <label className="text-sm font-bold">3 · Description (optionnelle)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={300} placeholder="Ex. caniveau bloqué, accumulation depuis 3 jours…" className="mt-3 w-full rounded-xl border border-border bg-background p-3 text-sm focus:border-eco focus:outline-none focus:ring-2 focus:ring-eco/30" />
          </section>

          <button onClick={submitReport} disabled={!analysisResult || submitted || !!duplicate || analyzing || submitting || !pos || !commune} className="w-full rounded-xl bg-foreground py-4 text-sm font-bold text-background transition-transform hover:-translate-y-0.5 disabled:opacity-50">
            {submitting ? "Envoi…" : submitted ? "✓ Signalement envoyé" : "Envoyer le signalement"}
          </button>
        </div>

        <div className="space-y-6">
          {analyzing ? (
            <div className="rounded-3xl border border-eco/30 bg-eco/5 p-6">
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Analyse du déchet en cours…
              </div>
            </div>
          ) : !analysisResult ? (
            <div className="rounded-3xl border border-eco/30 bg-eco/5 p-6">
              <p className="mt-3 text-sm text-muted-foreground">
                Prenez une photo ou choisissez-en une dans la galerie : la classification, le
                volume et les recommandations s'affichent automatiquement.
              </p>
            </div>
          ) : <WasteAnalysisResultCard result={analysisResult} />}

          <div className="rounded-3xl border border-border bg-kin p-6 text-white">
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-eco" />
              <h3 className="font-display text-lg font-bold">Votre profil</h3>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Stat l="Green Points" v={user.points.toLocaleString()} />
              <Stat l="Signalements" v={user.reports.toString()} />
              <Stat l="Badges" v={user.badges.length.toString()} />
            </div>
            <p className="mt-4 text-xs text-white/60">
              Connecté en tant que <b>{user.name}</b> · {user.commune}
            </p>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function GeoBadge({ geo }: { geo: GeoState }) {
  if (geo.status === "requesting")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-eco/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-eco">
        <Loader2 className="size-3 animate-spin" /> Localisation…
      </span>
    );
  if (geo.status === "ok")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
        <Crosshair className="size-3" /> GPS actif · ±{Math.round(geo.accuracy)} m
      </span>
    );
  if (geo.status === "denied")
    return <span className="rounded-full bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-700">Refusé</span>;
  if (geo.status === "unavailable")
    return <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-700">Indisponible</span>;
  return null;
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-[9px] font-bold uppercase tracking-widest text-white/50">{l}</div>
      <div className="mt-1 font-display text-xl font-bold">{v}</div>
    </div>
  );
}
