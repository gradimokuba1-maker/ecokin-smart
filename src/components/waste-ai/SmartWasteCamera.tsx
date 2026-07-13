// Capture intelligente : permissions explicites, GPS, profondeur native/WebXR
// et estimation de profondeur IA pour les appareils sans capteur exploitable.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock3,
  Compass,
  Crosshair,
  ImageIcon,
  Images,
  Layers3,
  Loader2,
  MapPin,
  Navigation,
  RotateCcw,
  Ruler,
  ScanLine,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  acquireNativeDepth,
  estimateDepthWithAI,
  type DepthAcquisition,
  type DepthSource,
} from "@/lib/waste-ai/depth-acquisition";
import { buildLocationInfo, requestGPSPosition, type GPSState } from "@/lib/waste-ai/gps-location";
import type { CameraCapability, LocationInfo } from "@/lib/waste-ai/types";

export type CaptureResult = {
  imageDataUrl: string;
  additionalImages: string[];
  cameraCapability: CameraCapability;
  depthSource: DepthSource;
  depthData?: string;
  location: LocationInfo | null;
  captureMode: "single" | "multi" | "video";
  capturedAt: string;
  videoDurationSeconds?: number;
  videoBlob?: Blob;
  videoPreviewUrl?: string;
  imageQuality: "excellent" | "correct" | "faible";
};

type CaptureMode = CaptureResult["captureMode"];
type PermissionStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable";
type ImageQuality = CaptureResult["imageQuality"];

type Props = {
  onCapture: (result: CaptureResult | null) => void;
  disabled?: boolean;
};

const MAX_VIDEO_SECONDS = 12;
const MULTI_PHOTO_COUNT = 3;

function getPermissionStatus(error: unknown): PermissionStatus {
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

function dataUrlFromCanvas(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(video, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export function SmartWasteCamera({ onCapture, disabled }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recorderChunksRef = useRef<Blob[]>([]);
  const recordingFramesRef = useRef<string[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingClockRef = useRef<number | null>(null);
  const recordingSecondsRef = useRef(0);
  const videoUrlRef = useRef<string | null>(null);
  const nativeDepthRef = useRef<DepthAcquisition | null>(null);

  const [captureMode, setCaptureMode] = useState<CaptureMode>("single");
  const [permissions, setPermissions] = useState({
    camera: "idle" as PermissionStatus,
    gps: "idle" as PermissionStatus,
    depth: "idle" as PermissionStatus,
  });
  const [gpsState, setGpsState] = useState<GPSState>({ status: "idle" });
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [depth, setDepth] = useState<DepthAcquisition | null>(null);
  const [showLiveView, setShowLiveView] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [imageQuality, setImageQuality] = useState<ImageQuality>("correct");
  const [capturedAt, setCapturedAt] = useState<string | null>(null);

  const stopLiveView = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setShowLiveView(false);
  }, []);

  const clearRecordingTimers = useCallback(() => {
    if (recordingTimerRef.current != null) window.clearInterval(recordingTimerRef.current);
    if (recordingClockRef.current != null) window.clearInterval(recordingClockRef.current);
    recordingTimerRef.current = null;
    recordingClockRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      clearRecordingTimers();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    };
  }, [clearRecordingTimers]);

  const requestLocation = useCallback(async () => {
    setPermissions((current) => ({ ...current, gps: "requesting" }));
    setGpsState({ status: "requesting" });
    const position = await requestGPSPosition();
    setGpsState(position);

    if (position.status === "ok") {
      const nextLocation = buildLocationInfo(
        position.lat,
        position.lng,
        position.accuracy,
        position.altitudeM,
      );
      setLocation(nextLocation);
      setPermissions((current) => ({ ...current, gps: "granted" }));
      return nextLocation;
    }

    setPermissions((current) => ({
      ...current,
      gps: position.status === "denied" ? "denied" : "unavailable",
    }));
    return null;
  }, []);

  const openLiveCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setShowLiveView(true);
      return true;
    } catch (error) {
      const status = getPermissionStatus(error);
      setPermissions((current) => ({ ...current, camera: status }));
      if (status === 'denied') {
        toast.error("Autorisation de la caméra refusée. Veuillez l'activer dans les paramètres de votre navigateur.");
      }
      toast.error("Impossible d'ouvrir la caméra. Vérifiez les autorisations du navigateur.");
      return false;
    }
  }, []);

  const startCapture = useCallback(async () => {
    if (disabled || isStarting || isProcessing) return;
    if (showLiveView) return;

    setIsStarting(true);
    setPermissions((current) => ({ ...current, camera: "requesting", depth: "requesting" }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "environment", // It will prefer the back camera but fallback to front if not available.
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setShowLiveView(true);
      setPermissions((current) => ({ ...current, camera: "granted" }));
    } catch (error) {
      const status = getPermissionStatus(error);
      setPermissions((current) => ({ ...current, camera: status }));
      if (status === 'denied') {
        toast.error("Autorisation de la caméra refusée. Veuillez l'activer dans les paramètres de votre navigateur.");
      } else {
        toast.error("Aucun appareil photo compatible n'a été trouvé sur cet appareil.");
      }
      setIsStarting(false);
      return;
    }

    const [nextLocation, nativeDepth] = await Promise.all([requestLocation(), acquireNativeDepth()]);
    nativeDepthRef.current = nativeDepth;
    setDepth(nativeDepth);
    setPermissions((current) => ({
      ...current,
      depth: nativeDepth.source === "lidar" ? "granted" : "unavailable",
    }));

    if (!nextLocation) {
      toast.warning("GPS indisponible : vous pourrez toujours ajuster le point sur la carte.");
    }

    if (nativeDepth.source === "lidar") {
      toast.success("Capteur de profondeur natif détecté et activé.");
    } else {
      toast.message("Aucun LiDAR exploitable : le modèle IA de profondeur sera utilisé après la prise de vue.");
    }

    setIsStarting(false);
  }, [disabled, isProcessing, isStarting, openLiveCamera, requestLocation, showLiveView]);

  const deliverCapture = useCallback(async (
    imageDataUrl: string,
    additionalImages: string[],
    mode: CaptureMode,
    options?: { videoDurationSeconds?: number; videoBlob?: Blob; videoPreviewUrl?: string },
  ) => {
    const now = new Date().toISOString();
    setPreview(imageDataUrl);
    setCapturedAt(now);
    setIsProcessing(true);

    let depthResult = nativeDepthRef.current;
    if (depthResult?.source !== "lidar" || !depthResult.depthData) {
      setProcessingMessage("Estimation IA de la profondeur…");
      depthResult = await estimateDepthWithAI(imageDataUrl, setProcessingMessage);
      setDepth(depthResult);
    }

    setProcessingMessage("");
    onCapture({
      imageDataUrl,
      additionalImages,
      cameraCapability: depthResult.source === "lidar" ? "lidar" : "basic",
      depthSource: depthResult.source,
      depthData: depthResult.depthData,
      location,
      captureMode: mode,
      capturedAt: now,
      videoDurationSeconds: options?.videoDurationSeconds,
      videoBlob: options?.videoBlob,
      videoPreviewUrl: options?.videoPreviewUrl,
      imageQuality,
    });
    setIsProcessing(false);

    if (depthResult.source === "unavailable") {
      toast.warning("Photo acquise, mais l'estimation de profondeur n'a pas pu être chargée.");
    } else {
      toast.success("Capture intelligente prête pour l'analyse.");
    }
  }, [imageQuality, location, onCapture]);

  const captureStill = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
      toast.error("La caméra n'est pas encore prête.");
      console.warn("captureStill called before camera was ready.", { video, canvas, videoWidth: video?.videoWidth });
      return;
    }

    const frame = dataUrlFromCanvas(video, canvas);
    if (!frame) return toast.error("Impossible de capturer cette image.");
    setImageQuality(qualityFromDimensions(video.videoWidth, video.videoHeight));

    if (captureMode === "multi") {
      const nextPhotos = [...additionalPhotos, frame];
      setAdditionalPhotos(nextPhotos);
      if (nextPhotos.length < MULTI_PHOTO_COUNT) {
        toast.success(`Vue ${nextPhotos.length}/${MULTI_PHOTO_COUNT} enregistrée. Déplacez-vous pour le prochain angle.`);
        return;
      }

      stopLiveView();
      await deliverCapture(nextPhotos[0], nextPhotos.slice(1), "multi");
      setAdditionalPhotos([]);
      return;
    }

    stopLiveView();
    await deliverCapture(frame, [], "single");
  }, [additionalPhotos, captureMode, deliverCapture, stopLiveView]);

  const finishVideo = useCallback(async () => {
    clearRecordingTimers();
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const recorder = recorderRef.current;
    recorderRef.current = null;
    setRecording(false);

    if (!video || !canvas) return;
    const firstFrame = dataUrlFromCanvas(video, canvas) ?? recordingFramesRef.current[0];
    const frames = recordingFramesRef.current;
    recordingFramesRef.current = [];
    if (!firstFrame) {
      toast.error("La vidéo ne contient aucune image exploitable.");
      return;
    }

    const chunks = recorderChunksRef.current;
    const blob = chunks.length > 0 ? new Blob(chunks, { type: recorder?.mimeType || "video/webm" }) : undefined;
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    const url = blob ? URL.createObjectURL(blob) : undefined;
    videoUrlRef.current = url ?? null;
    setVideoPreviewUrl(url ?? null);
    const duration = Math.max(1, recordingSecondsRef.current);
    recorderChunksRef.current = [];
    stopLiveView();
    await deliverCapture(firstFrame, frames.slice(0, 5), "video", {
      videoDurationSeconds: duration,
      videoBlob: blob,
      videoPreviewUrl: url,
    });
  }, [clearRecordingTimers, deliverCapture, recordingSeconds, stopLiveView]);

  const startVideoRecording = useCallback(() => {
    const stream = streamRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!stream || !video || !canvas || typeof MediaRecorder === "undefined") {
      toast.error("L'enregistrement vidéo n'est pas disponible dans ce navigateur.");
      return;
    }

    const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((type) =>
      MediaRecorder.isTypeSupported(type),
    );
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderChunksRef.current = []; // Reset chunks
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) recorderChunksRef.current.push(event.data);
    };
    recorder.onstop = () => void finishVideo();
    recorderRef.current = recorder;
    recordingFramesRef.current = [];
    setRecordingSeconds(0);
    recordingSecondsRef.current = 0;
    setRecording(true);
    recorder.start(500);

    recordingTimerRef.current = window.setInterval(() => {
      const frame = dataUrlFromCanvas(video, canvas);
      if (frame && recordingFramesRef.current.length < 6) recordingFramesRef.current.push(frame);
    }, 1600);

    let elapsed = 0;
    recordingClockRef.current = window.setInterval(() => {
      elapsed += 1;
      recordingSecondsRef.current = elapsed;
      setRecordingSeconds(elapsed);
      if (elapsed >= MAX_VIDEO_SECONDS && recorder.state === "recording") recorder.stop();
    }, 1000);
  }, [finishVideo]);

  const stopVideoRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  const handleCaptureAction = useCallback(() => {
    if (captureMode === "video") {
      if (recording) stopVideoRecording();
      else startVideoRecording();
      return;
    }
    void captureStill();
  }, [captureMode, captureStill, recording, startVideoRecording, stopVideoRecording]);

  const handleGallery = useCallback(async (file?: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image trop volumineuse (max 10 Mo).");
      return;
    }
    const imageDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    nativeDepthRef.current = null;
    setDepth(null);
    setImageQuality("correct");
    await deliverCapture(imageDataUrl, [], "single");
  }, [deliverCapture]);

  const resetCapture = useCallback(() => {
    setPreview(null);
    setVideoPreviewUrl(null);
    setAdditionalPhotos([]);
    setCapturedAt(null);
    setDepth(null);
    nativeDepthRef.current = null;
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    videoUrlRef.current = null;
    onCapture(null);
  }, []);

  const locationText = location
    ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)} · alt. ${location.altitudeM ?? "—"} m`
    : "Position GPS en attente";
  const captureProgress = captureMode === "multi" ? additionalPhotos.length : preview ? 1 : 0;

  return (
    <div className="space-y-4 rounded-3xl border border-eco/20 bg-gradient-to-br from-eco/5 via-card to-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-eco">
            <Sparkles className="size-4" /> Acquisition intelligente
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Caméra, GPS, date, heure et profondeur sont acquis automatiquement.
          </p>
        </div>
        <DepthBadge depth={depth} />
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <StatusRow icon={<Camera className="size-4" />} label="Caméra" status={permissions.camera} />
        <StatusRow icon={<MapPin className="size-4" />} label="GPS haute précision" status={permissions.gps} />
        <StatusRow icon={<Layers3 className="size-4" />} label="Profondeur" status={permissions.depth} unavailableLabel="IA active" />
      </div>

      <div className="grid gap-3 rounded-2xl border border-border/70 bg-background/80 p-3 text-xs sm:grid-cols-3">
        <CaptureTip icon={<Ruler className="size-4" />} title="Distance idéale" text="Placez-vous à 2–4 m du dépôt." />
        <CaptureTip icon={<Compass className="size-4" />} title="Angle conseillé" text="Cadrez le sol et le haut du tas, sans contre-jour." />
        <CaptureTip icon={<ScanLine className="size-4" />} title="Qualité" text={showLiveView ? qualityLabel(imageQuality) : "La qualité sera vérifiée à la capture."} />
      </div>

      {!preview && !showLiveView && (
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-secondary/45 p-1">
          <ModeButton active={captureMode === "single"} icon={<Camera className="size-4" />} label="1 photo" onClick={() => setCaptureMode("single")} />
          <ModeButton active={captureMode === "multi"} icon={<Images className="size-4" />} label="3 angles" onClick={() => setCaptureMode("multi")} />
          <ModeButton active={captureMode === "video"} icon={<Video className="size-4" />} label="Vidéo 12 s" onClick={() => setCaptureMode("video")} />
        </div>
      )}

      <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-slate-950">
        {showLiveView ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={(event) => {
                setImageQuality(qualityFromDimensions(event.currentTarget.videoWidth, event.currentTarget.videoHeight));
              }}
              className="size-full object-cover"
            />
            <div className="pointer-events-none absolute inset-4 rounded-xl border border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.12)]" />
            <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
              <Navigation className="mr-1 inline size-3" /> Gardez le dépôt dans le cadre
            </div>
            {recording && (
              <div className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold text-white">
                <span className="mr-1 inline-block size-2 animate-pulse rounded-full bg-white" /> REC {recordingSeconds}s / {MAX_VIDEO_SECONDS}s
              </div>
            )}
          </>
        ) : preview ? (
          <>
            <img src={preview} alt="Aperçu de la capture du dépôt" className="size-full object-cover" />
            {videoPreviewUrl && <video src={videoPreviewUrl} controls className="absolute bottom-3 left-3 h-20 max-w-[45%] rounded-lg border border-white/40 bg-black" />}
            {isProcessing && (
              <div className="absolute inset-0 grid place-items-center bg-black/55 p-4 text-center text-white backdrop-blur-sm">
                <div>
                  <Loader2 className="mx-auto size-7 animate-spin text-eco" />
                  <p className="mt-2 text-sm font-bold">{processingMessage || "Préparation de la capture…"}</p>
                </div>
              </div>
            )}
            {!isProcessing && (
              <button type="button" onClick={resetCapture} className="absolute right-3 top-3 rounded-full bg-black/65 p-2 text-white hover:bg-black/80" aria-label="Reprendre une capture">
                <RotateCcw className="size-4" />
              </button>
            )}
          </>
        ) : (
          <div className="grid size-full place-items-center p-6 text-center text-slate-200">
            <div>
              <Camera className="mx-auto size-10 text-emerald-300" />
              <p className="mt-3 text-sm font-bold">Prêt pour une capture guidée</p>
              <p className="mt-1 max-w-sm text-xs text-slate-300">Choisissez une photo, trois angles ou une courte vidéo autour du dépôt.</p>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {captureMode === "multi" && !preview && (
        <div className="rounded-2xl border border-eco/20 bg-eco/5 p-3">
          <div className="flex items-center justify-between text-xs font-bold text-eco">
            <span>Progression des vues</span>
            <span>{captureProgress}/{MULTI_PHOTO_COUNT}</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {Array.from({ length: MULTI_PHOTO_COUNT }).map((_, index) => (
              <div key={index} className={`h-2 rounded-full ${index < captureProgress ? "bg-eco" : "bg-eco/15"}`} />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Vue 1 de face, puis décalez-vous vers la gauche et la droite.</p>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        {showLiveView ? (
          <>
            <button
              type="button"
              onClick={handleCaptureAction}
              disabled={isProcessing || disabled}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white ${recording ? "bg-red-600 hover:bg-red-700" : "bg-eco hover:bg-eco/90"} disabled:opacity-50`}
            >
              {captureMode === "video" ? <Video className="size-4" /> : <Camera className="size-4" />}
              {captureMode === "video"
                ? recording
                  ? "Arrêter la vidéo"
                  : "Démarrer la vidéo"
                : captureMode === "multi"
                  ? `Prendre la vue ${Math.min(additionalPhotos.length + 1, MULTI_PHOTO_COUNT)}/${MULTI_PHOTO_COUNT}`
                  : "Prendre une photo"}
            </button>
            <button type="button" onClick={stopLiveView} disabled={recording} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/5 px-4 py-3 text-sm font-bold text-foreground hover:bg-secondary disabled:opacity-50">
              <X className="size-4" /> Annuler
            </button>
          </>
        ) : !preview ? (
          <>
            <button type="button" onClick={() => void startCapture()} disabled={isStarting || isProcessing || disabled} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-eco px-4 py-3 text-sm font-bold text-white hover:bg-eco/90 disabled:opacity-50">
              {isStarting ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
              {isStarting ? "Autorisations et capteurs…" : "Prendre une photo"}
            </button>
            <button type="button" onClick={() => galleryRef.current?.click()} disabled={isStarting || isProcessing || disabled} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-eco/35 bg-eco/5 px-4 py-3 text-sm font-bold text-eco hover:bg-eco/10 disabled:opacity-50">
              <ImageIcon className="size-4" /> Depuis la galerie
            </button>
          </>
        ) : null}
      </div>

      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={(event) => void handleGallery(event.target.files?.[0])} />

      <div className="grid gap-2 rounded-2xl border border-border/70 bg-background/70 p-3 text-xs text-muted-foreground sm:grid-cols-2">
        <div className="flex items-center gap-2"><Crosshair className="size-4 shrink-0 text-eco" /><span className="font-mono">{locationText}</span></div>
        <div className="flex items-center gap-2"><Clock3 className="size-4 shrink-0 text-eco" /><span>{capturedAt ? formatCaptureTime(capturedAt) : "Date et heure ajoutées à la prise de vue"}</span></div>
      </div>
    </div>
  );
}

function ModeButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold transition-colors ${active ? "bg-card text-eco shadow-sm" : "text-muted-foreground hover:bg-card/70"}`}>
      {icon} {label}
    </button>
  );
}

function StatusRow({ icon, label, status, unavailableLabel = "Indisponible" }: { icon: ReactNode; label: string; status: PermissionStatus; unavailableLabel?: string }) {
  const styles: Record<PermissionStatus, string> = {
    idle: "bg-secondary/50 text-muted-foreground",
    requesting: "bg-eco/10 text-eco",
    granted: "bg-emerald-500/10 text-emerald-700",
    denied: "bg-red-500/10 text-red-700",
    unavailable: "bg-amber-500/10 text-amber-700",
  };
  const labels: Record<PermissionStatus, string> = {
    idle: "En attente",
    requesting: "Vérification…",
    granted: "Autorisé",
    denied: "Refusé",
    unavailable: unavailableLabel,
  };
  return <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${styles[status]}`}>{status === "requesting" ? <Loader2 className="size-4 animate-spin" /> : status === "granted" ? <CheckCircle2 className="size-4" /> : status === "denied" ? <AlertTriangle className="size-4" /> : icon}<span className="flex-1">{label}</span><span>{labels[status]}</span></div>;
}

function CaptureTip({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="flex gap-2"><span className="mt-0.5 text-eco">{icon}</span><div><p className="font-bold text-foreground">{title}</p><p className="mt-0.5 text-muted-foreground">{text}</p></div></div>;
}

function DepthBadge({ depth }: { depth: DepthAcquisition | null }) {
  if (!depth) return <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Profondeur à vérifier</span>;
  const isNative = depth.source === "lidar";
  return <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${isNative ? "bg-purple-500/10 text-purple-700" : "bg-blue-500/10 text-blue-700"}`}>{isNative ? <Layers3 className="size-3" /> : <Sparkles className="size-3" />}{depth.label}</span>;
}
