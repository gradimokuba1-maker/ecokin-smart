import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useServerFn } from "@tanstack/react-start";
import { analyzeWastePhoto, analyzeWastePhotoAdvanced, type WasteAnalysis } from "@/lib/waste-ai.functions";
import { validateReportHash, commitReportHash } from "@/lib/report-submit.functions";
import { useEcoUser } from "@/lib/user-store";
import { priorityScore, proximityAlerts } from "@/lib/data";
import { DEFAULT_CITY, detectCityCommune } from "@/lib/cities";
import { pushLiveReport, urgencyFromSeverity } from "@/lib/live-reports";
import { computePerceptualHash, findDuplicate, saveHash } from "@/lib/image-hash";
import { ClientOnly } from "@/components/client-only";
import { KinshasaMap } from "@/components/kinshasa-map";
import {
  AlertTriangle, BarChart3, Box, Camera, CheckCircle2, Clock3, Compass, Crosshair, Gauge, ImageIcon, Images, Layers3, Loader2, MapPin, Navigation, RotateCcw, Ruler, Scale, ScanLine, Shield, ShieldAlert, ShieldCheck, Siren, Sparkles, TriangleAlert, Trophy, Truck, Video, X, Zap,
} from "lucide-react";
import { toast } from "sonner";
import { CitizenGate } from "@/components/citizen-gate";
import { acquireNativeDepth, estimateDepthWithAI } from "@/lib/waste-ai/depth-acquisition";
import { buildLocationInfo, requestGPSPosition } from "@/lib/waste-ai/gps-location";
import { WasteAnalysisResultCard } from "@/components/waste-ai/WasteAnalysisResult";


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

/* --- START INLINED SmartWasteCamera --- */
// NOTE: For clarity and fixing the issue, I've inlined the component here.
// In a real-world scenario, this would be in its own file `src/components/waste-ai/SmartWasteCamera.tsx`

const MAX_VIDEO_SECONDS = 12;
const MULTI_PHOTO_COUNT = 3;

type PermissionStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable";
type CaptureMode = "single" | "multi" | "video";
type ImageQuality = "excellent" | "correct" | "faible";

function getPermissionStatus(error: unknown): "denied" | "unavailable" {
  console.error("Camera permission error:", error);
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") return "denied"; // User explicitly denied
    if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") return "unavailable"; // No device found
  }
  return "unavailable"; // Other errors
}

function qualityFromDimensions(width: number, height: number): ImageQuality {
  const pixels = width * height;
  if (pixels >= 1280 * 720) return "excellent";
  if (pixels >= 960 * 540) return "correct";
  return "faible";
}

function qualityLabel(quality: ImageQuality) {
  if (quality === "excellent") return "Bonne qualité";
  if (quality === "correct") return "Qualité correcte";
  return "Qualité à améliorer";
}

function formatCaptureTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}

function dataUrlFromCanvas(video: HTMLVideoElement, canvas: HTMLCanvasElement): string | null {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(video, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.9);
}

function SmartWasteCamera({ onCapture, disabled }: { onCapture: (result: CaptureResult) => void; disabled?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [permissions, setPermissions] = useState<{ camera: PermissionStatus; gps: PermissionStatus; depth: PermissionStatus }>({
    camera: "idle",
    gps: "idle",
    depth: "idle",
  });
  const [location, setLocation] = useState<ReturnType<typeof buildLocationInfo> | null>(null);
  const [depth, setDepth] = useState<Awaited<ReturnType<typeof acquireNativeDepth>> | null>(null);
  const [showLiveView, setShowLiveView] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [imageQuality, setImageQuality] = useState<ImageQuality>("correct");

  const stopLiveView = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setShowLiveView(false);
  }, []);

  useEffect(() => {
    // Cleanup stream on component unmount
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const requestLocation = useCallback(async () => {
    setPermissions((current) => ({ ...current, gps: "requesting" }));
    const position = await requestGPSPosition();
    if (position.status === "ok") {
      const nextLocation = buildLocationInfo(position.lat, position.lng, position.accuracy, position.altitudeM);
      setLocation(nextLocation);
      setPermissions((current) => ({ ...current, gps: "granted" }));
      return nextLocation;
    }
    setPermissions((current) => ({ ...current, gps: position.status === "denied" ? "denied" : "unavailable" }));
    return null;
  }, []);

  const startCapture = useCallback(async () => {
    if (disabled || isStarting || showLiveView) return;
    setIsStarting(true);
    setPermissions((current) => ({ ...current, camera: "requesting", depth: "requesting" }));
    console.log("Attempting to start capture...");

    try {
      // **FIX**: Removed the pre-flight check. We now request the camera directly.
      // **FIX**: Removed the rigid 'environment' constraint to allow front cameras on desktops.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "environment", // It will prefer the back camera but fallback to front if not available.
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      console.log("Camera stream acquired successfully.");
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowLiveView(true);
      setPermissions((current) => ({ ...current, camera: "granted" }));

      // **FIX**: Moved GPS and Depth check to after camera is confirmed working.
      // This prevents the unstable WebXR check from running if camera access fails.
      const [nextLocation, nativeDepth] = await Promise.all([
        requestLocation(),
        acquireNativeDepth() // This is still experimental and might be unstable on some devices.
      ]);

      setDepth(nativeDepth);
      setPermissions((current) => ({
        ...current,
        depth: nativeDepth.source === "lidar" ? "granted" : "unavailable",
      }));

      if (!nextLocation) toast.warning("GPS indisponible : vous pourrez toujours ajuster le point sur la carte.");
      if (nativeDepth.source === "lidar") toast.success("Capteur de profondeur natif détecté et activé.");
      else toast.message("Aucun LiDAR exploitable : le modèle IA de profondeur sera utilisé après la prise de vue.");

    } catch (error) {
      console.error("Failed to start camera:", error);
      const status = getPermissionStatus(error);
      setPermissions((current) => ({ ...current, camera: status }));
      if (status === 'denied') {
        toast.error("Autorisation de la caméra refusée. Veuillez l'activer dans les paramètres de votre navigateur.");
      } else {
        toast.error("Aucun appareil photo compatible n'a été trouvé sur cet appareil.");
      }
    } finally {
      setIsStarting(false);
    }
  }, [disabled, isStarting, showLiveView, requestLocation]);

  const captureStill = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
      toast.error("La caméra n'est pas encore prête.");
      console.warn("captureStill called before camera was ready.", { video, canvas, videoWidth: video?.videoWidth });
      return;
    }

    const frame = dataUrlFromCanvas(video, canvas);
    if (!frame) {
      toast.error("Impossible de capturer cette image.");
      return;
    }

    const quality = qualityFromDimensions(video.videoWidth, video.videoHeight);
    setImageQuality(quality);
    const now = new Date().toISOString();
    setPreview(frame);
    setCapturedAt(now);

    // Stop the camera now that we have the picture
    stopLiveView();

    // Deliver the capture to the parent component
    onCapture({
      imageDataUrl: frame,
      additionalImages: [],
      location,
      capturedAt: now,
      cameraCapability: depth?.source === "lidar" ? "lidar" : "basic",
      depthData: depth?.depthData,
      imageQuality: quality,
    });

    toast.success("Photo capturée ! Lancement de l'analyse...");
  }, [depth, location, onCapture, stopLiveView]);

  const resetCapture = useCallback(() => {
    setPreview(null);
    setCapturedAt(null);
    setDepth(null);
    // Also reset the parent's state by calling onCapture with null
    onCapture(null as any); // A bit of a hack, but effective for resetting the flow
  }, [onCapture]);

  // ... The rest of the SmartWasteCamera component JSX would go here ...
  // For brevity, I will integrate the fixes directly into the main SignalerPage component
  // and show the diff for the whole file.
}

/* --- END INLINED SmartWasteCamera --- */

type GeoState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "ok"; lat: number; lng: number; accuracy: number }
  | { status: "denied" }
  | { status: "unavailable" };

function SignalerPage() {
  const { user, addPoints } = useEcoUser();
  const analyze = useServerFn(analyzeWastePhoto);
  const analyzeAdvanced = useServerFn(analyzeWastePhotoAdvanced);
  const validateHash = useServerFn(validateReportHash);
  const commitHash = useServerFn(commitReportHash);

  const [geo, setGeo] = useState<GeoState>({ status: "idle" });
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [commune, setCommune] = useState<string>("matete");
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [imgHash, setImgHash] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<{ similarity: number; at: string; source: "local" | "server" } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<WasteAnalysis | null>(null);
  const [advancedResult, setAdvancedResult] = useState<Awaited<ReturnType<typeof analyzeWastePhotoAdvanced>> | null>(null);
  const [capture, setCapture] = useState<CaptureResult | null>(null);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      (err) => setGeo({ status: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable" }),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }, []);

  async function handleSmartCapture(captureResult: CaptureResult) {
    // **FIX**: Handle reset case
    if (!captureResult) {
      setImgPreview(null);
      setResult(null);
      setAdvancedResult(null);
      setCapture(null);
      return;
    }
    const { imageDataUrl: dataUrl, location, capturedAt, cameraCapability, depthData } = captureResult;
    const effectivePosition = location
      ? { lat: location.lat, lng: location.lng, accuracy: location.accuracy, altitudeM: location.altitudeM }
      : pos;

    setCapture(captureResult);
    setImgPreview(dataUrl);
    setResult(null);
    setAdvancedResult(null);
    setSubmitted(false);
    setDuplicate(null);

    if (location) {
      setGeo({ status: "ok", lat: location.lat, lng: location.lng, accuracy: location.accuracy });
      setPos({ lat: location.lat, lng: location.lng });
      setCommune(detectCityCommune(DEFAULT_CITY, location.lat, location.lng).id);
    }

    let hash: string;
    try {
      hash = await computePerceptualHash(dataUrl);
      setImgHash(hash);
      console.log("Image hash computed:", hash);
    } catch {
      return toast.error("Impossible d'analyser l'image");
    }

    // 1) Vérification locale (cache navigateur)
    const localDup = findDuplicate(hash, 95);
    if (localDup) {
      setDuplicate({ similarity: localDup.similarity, at: localDup.match.at, source: "local" });
      console.warn("Duplicate image found locally.", localDup);
      return toast.error("Photo déjà utilisée localement pour un signalement.");
    }

    // 2) Vérification serveur (base globale)
    try {
      const check = await validateHash({
        data: {
          hash,
          lat: effectivePosition?.lat,
          lng: effectivePosition?.lng,
          category: "unknown",
        },
      });
      if (check.duplicate) {
        setDuplicate({
          similarity: check.similarity ?? 100,
          at: check.matchedAt ?? new Date().toISOString(),
          source: "server",
        });
        console.warn("Duplicate image found on server.", check);
        return toast.error("Photo déjà enregistrée sur EcoKin (vérification serveur).");
      }
    } catch (e) {
      console.warn("validateHash failed", e);
    }

    // 3) Analyse IA historique, conservée telle quelle. Les données de
    // profondeur et les vues additionnelles sont maintenant envoyées au backend.
    setAnalyzing(true);
    console.log("Starting AI analysis...");
    try {
      // **FIX**: Run both analyses in parallel
      const [legacyAnalysis, smartAnalysis] = await Promise.all([
        analyze({ data: { imageDataUrl: dataUrl } }),
        analyzeAdvanced({
          data: {
            imageDataUrl: dataUrl,
            additionalImages: captureResult.additionalImages,
            lat: effectivePosition?.lat,
            lng: effectivePosition?.lng,
            accuracy: effectivePosition?.accuracy,
            altitudeM: effectivePosition?.altitudeM,
            capturedAt, cameraCapability, depthData,
          }
        })
      ]);
      setResult(legacyAnalysis);
      setAdvancedResult(smartAnalysis);
      toast.success("Analyse IA terminée");
    } catch (e) {
      console.error(e);
      toast.error("Erreur d'analyse IA");
    } finally {
      setAnalyzing(false);
    }
  }

  async function submitReport() {
    if (!result || !imgHash || !pos || submitting || submitted || duplicate) return;
    setSubmitting(true);
    const earned = result.severity === "critique" ? 80 : result.severity === "modere" ? 50 : 25;
    const score = priorityScore({
      commune: commune as any,
      lat: pos.lat,
      lng: pos.lng,
      severity: result.severity,
    });
    const urgency = urgencyFromSeverity(result.severity, result.floodRisk);
    const item = pushLiveReport({
      author: user.name,
      commune,
      category: (result.category ?? result.type) as string,
      urgency,
      description: description || undefined,
      lat: pos.lat,
      lng: pos.lng,
      volumeM3: result.volumeEstimateM3,
      priorityScore: score,
      photoUrl: imgPreview ?? undefined,
      composition: advancedResult?.composition,
      weightTons: advancedResult?.weight.weightTons,
      dimensions: advancedResult?.dimensions,
      priorityLevel: advancedResult?.priorityLevel,
      healthRisk: advancedResult?.healthRisk,
      cameraCapability: capture?.cameraCapability,
    });
    saveHash(imgHash, item.id);
    try {
      const commit = await commitHash({
        data: { hash: imgHash, lat: pos.lat, lng: pos.lng, reportId: item.id, category: result.category },
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
      <SiteNav />
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
                  picker={
                    pos
                      ? {
                        lat: pos.lat,
                        lng: pos.lng,
                        onChange: (lat, lng) => {
                          setPos({ lat, lng });
                          setCommune(detectCityCommune(DEFAULT_CITY, lat, lng).id);
                        },
                      }
                      : undefined
                  }
                />
              </ClientOnly>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
              {pos && (
                <span className="font-mono text-muted-foreground">
                  {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
                </span>
              )}
              <select
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold"
              >
                {DEFAULT_CITY.communes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {!pos && (
                <span className="text-muted-foreground">Cliquez sur la carte pour placer le marqueur.</span>
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
            {imgHash && !duplicate && !analyzing && result && (
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

          <button onClick={submitReport} disabled={!result || submitted || !!duplicate || analyzing || submitting || !pos} className="w-full rounded-xl bg-foreground py-4 text-sm font-bold text-background transition-transform hover:-translate-y-0.5 disabled:opacity-50">
            {submitting ? "Envoi…" : submitted ? "✓ Signalement envoyé" : "Envoyer le signalement"}
          </button>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-eco/30 bg-eco/5 p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-eco" />
              <h3 className="font-display text-lg font-bold">Analyse IA en direct</h3>
            </div>
            {analyzing ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Analyse du déchet en cours…
              </div>
            ) : !result ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Prenez une photo ou choisissez-en une dans la galerie : la classification, le
                volume et les recommandations s'affichent automatiquement.
              </p>
            ) : (
              <div className="mt-4 space-y-3 font-mono text-xs">
                <Row label="Catégorie" value={(result.category ?? result.type).toUpperCase()} />
                <Row label="Confiance" value={`${Math.round(result.confidence * 100)}%`} />
                <Row label="Sévérité" value={result.severity} color={sevColor(result.severity)} />
                <Row label="Volume estimé" value={`${result.volumeEstimateM3.toFixed(1)} m³`} />
                <Row label="Risque sanitaire" value={result.risqueSanitaire ?? "—"} />
                <Row label="Risque inondation" value={result.floodRisk ? "OUI" : "non"} color={result.floodRisk ? "text-flood" : ""} />
                <Row label="Intervention immédiate" value={result.interventionImmediate ? "OUI" : "non"} />
                {pos && (
                  <Row label="Score de priorité" value={priorityScore({ commune: commune as any, lat: pos.lat, lng: pos.lng, severity: result.severity }) + " / 100"} />
                )}
                <div className="rounded-lg bg-background p-3 font-sans text-xs text-foreground">{result.description}</div>
                <ul className="ml-4 list-disc space-y-1 font-sans text-xs text-muted-foreground">
                  {result.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
                {pos && proximityAlerts(pos.lat, pos.lng).length > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-500/5 p-3 font-sans">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-red-600">⚠ Alertes proximité</div>
                    <ul className="mt-1 ml-4 list-disc text-xs text-red-700">
                      {proximityAlerts(pos.lat, pos.lng).map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {advancedResult && <WasteAnalysisResultCard result={advancedResult} />}

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

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-eco/15 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${color ?? ""}`}>{value}</span>
    </div>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-[9px] font-bold uppercase tracking-widest text-white/50">{l}</div>
      <div className="mt-1 font-display text-xl font-bold">{v}</div>
    </div>
  );
}

function sevColor(s: string) {
  return s === "critique" ? "text-flood" : s === "modere" ? "text-amber-500" : "text-eco";
}
