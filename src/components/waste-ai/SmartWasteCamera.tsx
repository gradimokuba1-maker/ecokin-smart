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
  type DepthAcquisition,
  type DepthSource,
} from "@/lib/waste-ai/depth-acquisition";
import { buildLocationInfo, requestGPSPosition } from "@/lib/waste-ai/gps-location";
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
const MAX_ANALYSIS_IMAGE_EDGE = 1600;
const JPEG_QUALITY = 0.88;
const REAR_CAMERA_LABEL = /back|rear|environment|arrière|arriere|world/i;

function stopStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => track.stop());
}

function errorName(error: unknown) {
  return error instanceof Error ? error.name : "";
}

function getPermissionStatus(error: unknown): PermissionStatus {
  const name = errorName(error);
  if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") return "denied";
  return "unavailable";
}

function cameraErrorMessage(error: unknown) {
  const name = errorName(error);
  if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") {
    return "Autorisation de la caméra refusée. Activez-la dans les paramètres du navigateur, puis réessayez.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "Aucune caméra utilisable n’a été détectée. Vous pouvez néanmoins choisir une photo depuis la galerie.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "La caméra est actuellement utilisée par une autre application. Fermez-la puis réessayez.";
  }
  return "Impossible d’ouvrir la caméra. Réessayez ou choisissez une photo depuis la galerie.";
}

function analysisDimensions(width: number, height: number) {
  const longestEdge = Math.max(width, height);
  if (longestEdge <= MAX_ANALYSIS_IMAGE_EDGE) return { width, height };
  const scale = MAX_ANALYSIS_IMAGE_EDGE / longestEdge;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function imageDataUrlFromSource(
  source: CanvasImageSource,
  width: number,
  height: number,
  canvas: HTMLCanvasElement,
) {
  const dimensions = analysisDimensions(width, height);
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return null;
  context.drawImage(source, 0, 0, dimensions.width, dimensions.height);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

function readImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image unreadable"));
    };
    image.src = objectUrl;
  });
}

async function prepareGalleryImage(file: File): Promise<{ imageDataUrl: string; quality: ImageQuality }> {
  const image = await readImageFile(file);
  const imageDataUrl = imageDataUrlFromSource(
    image,
    image.naturalWidth || image.width,
    image.naturalHeight || image.height,
    document.createElement("canvas"),
  );
  if (!imageDataUrl) throw new Error("Image encoding failed");
  return {
    imageDataUrl,
    quality: qualityFromDimensions(image.naturalWidth || image.width, image.naturalHeight || image.height),
  };
}

function isRearCamera(track: MediaStreamTrack, devices: MediaDeviceInfo[]) {
  const settings = track.getSettings();
  if (settings.facingMode === "environment") return true;
  return devices.some((device) => device.deviceId === settings.deviceId && REAR_CAMERA_LABEL.test(device.label));
}

async function requestDeviceStream(mediaDevices: MediaDevices, devices: MediaDeviceInfo[]) {
  let lastError: unknown;
  for (const device of devices) {
    try {
      return await mediaDevices.getUserMedia({
        audio: false,
        video: {
          deviceId: { exact: device.deviceId },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
    } catch (error) {
      lastError = error;
      if (getPermissionStatus(error) === "denied") throw error;
    }
  }
  throw lastError ?? new DOMException("No camera stream", "NotFoundError");
}

/**
 * Ouvre d'abord la caméra arrière avec des contraintes souples, puis explore
 * les autres périphériques vidéo si le navigateur ne peut pas la satisfaire.
 * Les contraintes `ideal` évitent de rejeter les Android dont les capacités
 * déclarées sont incomplètes.
 */
async function requestPreferredCameraStream(): Promise<MediaStream> {
  const mediaDevices = typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
  if (!mediaDevices?.getUserMedia) throw new DOMException("Camera API unavailable", "NotSupportedError");

  const attempts: MediaStreamConstraints[] = [
    {
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    },
    {
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    },
    { audio: false, video: true },
  ];

  let stream: MediaStream | null = null;
  let lastError: unknown;
  for (const constraints of attempts) {
    try {
      stream = await mediaDevices.getUserMedia(constraints);
      break;
    } catch (error) {
      lastError = error;
      if (getPermissionStatus(error) === "denied") throw error;
    }
  }

  const devices = await mediaDevices.enumerateDevices()
    .then((entries) => entries.filter((entry) => entry.kind === "videoinput"))
    .catch(() => [] as MediaDeviceInfo[]) ?? [];
  const rearDevices = devices.filter((device) => REAR_CAMERA_LABEL.test(device.label));

  if (!stream) {
    const candidates = rearDevices.length > 0 ? [...rearDevices, ...devices.filter((device) => !rearDevices.includes(device))] : devices;
    if (candidates.length > 0) return requestDeviceStream(mediaDevices, candidates);
    throw lastError ?? new DOMException("No camera device", "NotFoundError");
  }

  const track = stream.getVideoTracks()[0];
  if (!track || rearDevices.length === 0 || isRearCamera(track, devices)) return stream;

  // Certains Android ignorent facingMode. Une fois l'autorisation obtenue,
  // les libellés sont disponibles : on bascule alors explicitement sur l'arrière.
  stopStream(stream);
  try {
    return await requestDeviceStream(mediaDevices, rearDevices);
  } catch (error) {
    try {
      return await mediaDevices.getUserMedia({ audio: false, video: true });
    } catch {
      throw error;
    }
  }
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
  return imageDataUrlFromSource(video, video.videoWidth, video.videoHeight, canvas);
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
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [depth, setDepth] = useState<DepthAcquisition | null>(null);
  const [showLiveView, setShowLiveView] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [imageQuality, setImageQuality] = useState<ImageQuality>("correct");
  const [capturedAt, setCapturedAt] = useState<string | null>(null);

  const stopLiveView = useCallback(() => {
    stopStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraReady(false);
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
      stopStream(streamRef.current);
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    };
  }, [clearRecordingTimers]);

  useEffect(() => {
    if (!showLiveView || !videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    video.srcObject = streamRef.current;
    void video.play().catch(() => undefined);
  }, [showLiveView]);

  const requestLocation = useCallback(async () => {
    setPermissions((current) => ({ ...current, gps: "requesting" }));
    const position = await requestGPSPosition();

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

  const startCapture = useCallback(async () => {
    if (disabled || isStarting || isProcessing) return;
    if (showLiveView) return;

    setIsStarting(true);
    setPermissions((current) => ({ ...current, camera: "requesting", depth: "requesting", gps: "requesting" }));
    setIsCameraReady(false);

    try {
      const stream = await requestPreferredCameraStream();
      streamRef.current = stream;
      setShowLiveView(true);
      setPermissions((current) => ({ ...current, camera: "granted" }));

      // La caméra ne dépend jamais du GPS ou du LiDAR : ce sont des
      // enrichissements asynchrones qui ne bloquent pas la prise de vue.
      void requestLocation().then((nextLocation) => {
        if (!nextLocation) toast.warning("GPS indisponible : vous pourrez toujours ajuster le point sur la carte.");
      }).catch(() => {
        setPermissions((current) => ({ ...current, gps: "unavailable" }));
      });

      void acquireNativeDepth().then((nativeDepth) => {
        nativeDepthRef.current = nativeDepth;
        setDepth(nativeDepth);
        setPermissions((current) => ({
          ...current,
          depth: nativeDepth.source === "lidar" ? "granted" : "unavailable",
        }));
        if (nativeDepth.source === "lidar") {
          toast.success("Capteur de profondeur natif activé.");
        }
      }).catch(() => {
        setPermissions((current) => ({ ...current, depth: "unavailable" }));
      });
    } catch (error) {
      const status = getPermissionStatus(error);
      setPermissions((current) => ({ ...current, camera: status }));
      toast.error(cameraErrorMessage(error));
    } finally {
      setIsStarting(false);
    }
  }, [disabled, isProcessing, isStarting, requestLocation, showLiveView]);

  const deliverCapture = useCallback(async (
    imageDataUrl: string,
    additionalImages: string[],
    mode: CaptureMode,
    quality: ImageQuality,
    options?: { videoDurationSeconds?: number; videoBlob?: Blob; videoPreviewUrl?: string },
  ) => {
    const now = new Date().toISOString();
    setPreview(imageDataUrl);
    setCapturedAt(now);
    // Un modèle de profondeur local n'est jamais sur le chemin critique. La
    // carte WebXR native est conservée quand elle existe ; sinon l'analyse IA
    // complète estime profondeur, volume et composition côté serveur.
    const depthResult = nativeDepthRef.current ?? {
      source: "ai" as const,
      label: "Analyse de profondeur côté IA",
      detail: "La profondeur est estimée pendant l'analyse complète.",
      confidence: 0.55,
    };
    if (!depth) setDepth(depthResult);
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
      imageQuality: quality,
    });
    toast.success("Photo prête pour l'analyse.");
  }, [depth, location, onCapture]);

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
    const nextQuality = qualityFromDimensions(video.videoWidth, video.videoHeight);
    setImageQuality(nextQuality);
    setIsProcessing(true);

    if (captureMode === "multi") {
      const nextPhotos = [...additionalPhotos, frame];
      setAdditionalPhotos(nextPhotos);
      if (nextPhotos.length < MULTI_PHOTO_COUNT) {
        toast.success(`Vue ${nextPhotos.length}/${MULTI_PHOTO_COUNT} enregistrée. Déplacez-vous pour le prochain angle.`);
        setIsProcessing(false);
        return;
      }

      stopLiveView();
      await deliverCapture(nextPhotos[0], nextPhotos.slice(1), "multi", nextQuality);
      setAdditionalPhotos([]);
      setIsProcessing(false);
      return;
    }

    stopLiveView();
    await deliverCapture(frame, [], "single", nextQuality);
    setIsProcessing(false);
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
    const nextQuality = qualityFromDimensions(video.videoWidth, video.videoHeight);
    setImageQuality(nextQuality);
    setIsProcessing(true);
    await deliverCapture(firstFrame, frames.slice(0, 5), "video", nextQuality, {
      videoDurationSeconds: duration,
      videoBlob: blob,
      videoPreviewUrl: url,
    });
    setIsProcessing(false);
  }, [clearRecordingTimers, deliverCapture, stopLiveView]);

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
    setIsProcessing(true);
    try {
      const { imageDataUrl, quality } = await prepareGalleryImage(file);
      nativeDepthRef.current = null;
      setDepth(null);
      setImageQuality(quality);
      await deliverCapture(imageDataUrl, [], "single", quality);
    } catch {
      toast.error("Impossible de préparer cette image.");
    } finally {
      setIsProcessing(false);
    }
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
  }, [onCapture]);

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
                setIsCameraReady(event.currentTarget.videoWidth > 0 && event.currentTarget.videoHeight > 0);
              }}
              onCanPlay={() => setIsCameraReady(true)}
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
                  <p className="mt-2 text-sm font-bold">Préparation de la capture…</p>
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
              disabled={isProcessing || disabled || !isCameraReady}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white ${recording ? "bg-red-600 hover:bg-red-700" : "bg-eco hover:bg-eco/90"} disabled:opacity-50`}
            >
              {captureMode === "video" ? <Video className="size-4" /> : <Camera className="size-4" />}
              {captureMode === "video"
                ? recording
                  ? "Arrêter la vidéo"
                  : "Démarrer la vidéo"
                : captureMode === "multi"
                  ? `Prendre la vue ${Math.min(additionalPhotos.length + 1, MULTI_PHOTO_COUNT)}/${MULTI_PHOTO_COUNT}`
                  : isCameraReady ? "Prendre une photo" : "Préparation de la caméra…"}
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
