import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Camera, Images, Loader2, Video, X } from "lucide-react";
import { toast } from "sonner";
import { getDepthAcquisition, type DepthSource } from "@/lib/waste-ai/depth-acquisition";
import { type DepthAcquisition } from "@/lib/waste-ai/depth-service";
import { buildLocationInfo, requestGPSPosition } from "@/lib/waste-ai/gps-location";
import type { CameraCapability, LocationInfo } from "@/lib/waste-ai/types";
import { Button } from "@/components/ui/button";

export type CaptureResult = {
  imageDataUrl: string;
  additionalImages: string[];
  cameraCapability: DepthSource;
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
const MAX_VIDEO_SECONDS = 12;
const MULTI_PHOTO_COUNT = 3;
const MAX_ANALYSIS_IMAGE_EDGE = 1600;
const JPEG_QUALITY = 0.88;
const CAMERA_START_TIMEOUT_MS = 12000;

function stopStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => track.stop());
}

async function requestPreferredCameraStream(): Promise<MediaStream> {
  const mediaDevices = typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
  if (!mediaDevices?.getUserMedia) {
    throw new DOMException(
      "L'API caméra n'est pas supportée sur ce navigateur.",
      "NotSupportedError",
    );
  }

  const constraints: MediaStreamConstraints = {
    audio: false,
    video: {
      facingMode: "environment",
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
  };

  try {
    return await mediaDevices.getUserMedia(constraints);
  } catch (e) {
    console.error("Failed to get ideal camera, trying fallback", e);
    try {
      return await mediaDevices.getUserMedia({ audio: false, video: true });
    } catch (fallbackError) {
      console.error("Fallback camera request also failed", fallbackError);
      throw fallbackError;
    }
  }
}

function withCameraTimeout(promise: Promise<MediaStream>): Promise<MediaStream> {
  return Promise.race([
    promise,
    new Promise<MediaStream>((_, reject) => {
      window.setTimeout(
        () => reject(new DOMException("La camera ne repond pas.", "TimeoutError")),
        CAMERA_START_TIMEOUT_MS,
      );
    }),
  ]);
}

function cameraErrorMessage(error: unknown) {
  const name = error instanceof Error ? error.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") {
    return "Autorisation de la caméra refusée. Activez-la dans les paramètres du navigateur pour continuer.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "Aucune caméra utilisable n’a été détectée sur cet appareil.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "La caméra est actuellement utilisée par une autre application ou un autre onglet.";
  }
  return "Impossible d’accéder à la caméra. Vérifiez les autorisations et l'état de votre appareil, puis réessayez.";
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

function qualityFromDimensions(width: number, height: number): ImageQuality {
  const pixels = width * height;
  if (pixels >= 1280 * 720) return "excellent";
  if (pixels >= 960 * 540) return "correct";
  return "faible";
}

function dataUrlFromCanvas(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
  return imageDataUrlFromSource(video, video.videoWidth, video.videoHeight, canvas);
}

type Props = {
  onCapture: (result: CaptureResult) => void;
  onClose: () => void;
};

export function SmartWasteCamera({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [depthSensor, setDepthSensor] = useState<DepthAcquisition | null>(null);

  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>("idle");
  const [isProcessing, setIsProcessing] = useState(false);
  const [diag, setDiag] = useState<Record<string, any>>({});
  useEffect(() => {
    if (depthSensor) {
      setDiag((d) => ({
        ...d,
        depthSensor: {
          label: depthSensor.label,
          supported: depthSensor.supported,
          source: depthSensor.source,
          resolution: depthSensor.resolution,
          confidence: depthSensor.confidence,
        },
      }));
    }
  }, [depthSensor]);

  const [captureMode, setCaptureMode] = useState<CaptureMode>("multi"); // Default to "3 vues"
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);

  // Video recording state
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recorderChunksRef = useRef<Blob[]>([]);
  const recordingFramesRef = useRef<string[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingClockRef = useRef<number | null>(null);
  const recordingSecondsRef = useRef(0);
  const videoUrlRef = useRef<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const handleClose = useCallback(() => {
    stopStream(mediaStreamRef.current);
    mediaStreamRef.current = null;
    onClose();
  }, [onClose]);

  // Effect 1: Request permissions and get the stream
  useEffect(() => {
    let isCancelled = false;

    async function startCamera() {
      if (mediaStreamRef.current) return;

      setCameraPermission("requesting");
      setDiag({ status: "Requesting permissions..." });

      try {
        const stream = await withCameraTimeout(requestPreferredCameraStream());
        if (isCancelled) {
          stopStream(stream);
          return;
        }
        mediaStreamRef.current = stream;

        setDiag((d) => ({
          ...d,
          getUserMedia: "OK",
          stream: "OUI",
          videoTracks: stream.getVideoTracks().length,
        }));

        // Fire and forget, not critical for camera start
        getDepthAcquisition().then((depth) => {
          if (!isCancelled) setDepthSensor(depth);
        });
        requestGPSPosition();

        setCameraPermission("granted");
      } catch (error) {
        if (isCancelled) return;
        const err = error instanceof Error ? error : new Error(String(error));
        console.error("Camera startup failed:", err);
        const name = err.name;
        const status =
          name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError"
            ? "denied"
            : "unavailable";
        setCameraPermission(status);
        setDiag((d) => ({
          ...d,
          getUserMedia: "ERREUR",
          error: { name: err.name, message: err.message },
        }));
      }
    }

    startCamera();

    return () => {
      isCancelled = true;
      stopStream(mediaStreamRef.current);
      mediaStreamRef.current = null;
    };
  }, []); // <-- Empty dependency array ensures this runs only once.

  // Effect 2: Connect stream to video element when permission is granted
  useEffect(() => {
    const videoEl = videoRef.current;
    const stream = mediaStreamRef.current;

    if (cameraPermission !== "granted" || !stream || !videoEl) {
      return;
    }

    const playVideo = async () => {
      try {
        await videoEl.play();
        setDiag((d) => ({ ...d, isPlaying: !videoEl.paused, playAttempt: "success" }));
      } catch (error) {
        console.error("Video play failed:", error);
        const err = error instanceof Error ? error : new Error(String(error));
        setDiag((d) => ({
          ...d,
          playError: { name: err.name, message: err.message },
          isPlaying: false,
        }));
      }
    };

    setDiag((d) => ({
      ...d,
      stream: {
        active: stream.active,
        tracks: stream.getVideoTracks().map((t) => ({
          id: t.id,
          enabled: t.enabled,
          muted: t.muted,
          readyState: t.readyState,
          kind: t.kind,
        })),
      },
    }));

    const onLoadedMetadata = () => {
      setDiag((d) => ({
        ...d,
        videoWidth: videoEl.videoWidth,
        videoHeight: videoEl.videoHeight,
        readyState: videoEl.readyState,
        event: "loadedmetadata",
      }));
    };

    const onCanPlay = () => {
      setDiag((d) => ({ ...d, event: "canplay" }));
      playVideo();
    };

    const onPlaying = () => setDiag((d) => ({ ...d, event: "playing", paused: videoEl.paused }));
    const onPause = () => setDiag((d) => ({ ...d, event: "pause" }));
    const onStalled = () => setDiag((d) => ({ ...d, event: "stalled" }));
    const onSuspend = () => setDiag((d) => ({ ...d, event: "suspend" }));
    const onWaiting = () => setDiag((d) => ({ ...d, event: "waiting" }));
    const onError = (e: Event) => {
      const error = videoEl.error;
      setDiag((d) => ({
        ...d,
        event: "error",
        videoError: { code: error?.code, message: error?.message },
      }));
    };

    if (videoEl.srcObject !== stream) {
      videoEl.srcObject = stream;
    }

    videoEl.addEventListener("loadedmetadata", onLoadedMetadata);
    videoEl.addEventListener("canplay", onCanPlay);
    videoEl.addEventListener("playing", onPlaying);
    videoEl.addEventListener("pause", onPause);
    videoEl.addEventListener("stalled", onStalled);
    videoEl.addEventListener("suspend", onSuspend);
    videoEl.addEventListener("waiting", onWaiting);
    videoEl.addEventListener("error", onError);

    // If video is already able to play, trigger play manually.
    if (videoEl.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      playVideo();
    }

    return () => {
      videoEl.removeEventListener("loadedmetadata", onLoadedMetadata);
      videoEl.removeEventListener("canplay", onCanPlay);
      videoEl.removeEventListener("playing", onPlaying);
      videoEl.removeEventListener("pause", onPause);
      videoEl.removeEventListener("stalled", onStalled);
      videoEl.removeEventListener("suspend", onSuspend);
      videoEl.removeEventListener("waiting", onWaiting);
      videoEl.removeEventListener("error", onError);
    };
  }, [cameraPermission]);

  const deliverCapture = useCallback(
    async (
      imageDataUrl: string,
      additionalImages: string[],
      mode: CaptureMode,
      quality: ImageQuality,
      options?: { videoDurationSeconds?: number; videoBlob?: Blob; videoPreviewUrl?: string },
    ) => {
      setIsProcessing(true);
      try {
        const gpsPosition = await requestGPSPosition({ maximumAge: 0, timeout: 15000 });
        if (gpsPosition.status !== "ok") {
          toast.error("Position GPS obligatoire. Activez la localisation et réessayez.");
          setIsProcessing(false);
          return;
        }

        const location = buildLocationInfo(
          gpsPosition.lat,
          gpsPosition.lng,
          gpsPosition.accuracy,
          gpsPosition.altitudeM,
        );
        const now = new Date().toISOString();
        const fallbackDepth: DepthAcquisition = {
          source: "ai",
          label: "Analyse IA",
          supported: false,
          depthData: undefined,
          confidence: 0.55,
        };
        const depthResult = depthSensor ?? fallbackDepth;

        onCapture({
          imageDataUrl,
          additionalImages,
          cameraCapability: depthResult.source,
          depthData: depthResult.depthData as any, // TODO: Handle depth data properly
          location,
          captureMode: mode,
          capturedAt: now,
          videoDurationSeconds: options?.videoDurationSeconds,
          videoBlob: options?.videoBlob,
          videoPreviewUrl: options?.videoPreviewUrl,
          imageQuality: quality,
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erreur de capture.");
        setIsProcessing(false);
      }
    },
    [onCapture],
  );

  const captureStill = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing || cameraPermission !== "granted")
      return;

    const video = videoRef.current;
    const frame = dataUrlFromCanvas(video, canvasRef.current);
    if (!frame) {
      toast.error("Impossible de capturer l'image.");
      return;
    }

    setIsProcessing(true);
    const quality = qualityFromDimensions(video.videoWidth, video.videoHeight);

    if (captureMode === "multi") {
      const nextPhotos = [...additionalPhotos, frame];
      setAdditionalPhotos(nextPhotos);

      if (nextPhotos.length === 1) {
        toast.info("Vue 1/3: OK. Déplacez-vous légèrement vers la gauche.", { duration: 4000 });
      } else if (nextPhotos.length === 2) {
        toast.info("Vue 2/3: OK. Déplacez-vous légèrement vers la droite.", { duration: 4000 });
      }

      if (nextPhotos.length < MULTI_PHOTO_COUNT) {
        setIsProcessing(false);
        return;
      }

      await deliverCapture(nextPhotos[0], nextPhotos.slice(1), "multi", quality);
      return;
    }
    await deliverCapture(frame, [], "single", quality);
  }, [additionalPhotos, captureMode, deliverCapture, isProcessing, cameraPermission]);

  const clearRecordingTimers = useCallback(() => {
    if (recordingTimerRef.current != null) window.clearInterval(recordingTimerRef.current);
    if (recordingClockRef.current != null) window.clearInterval(recordingClockRef.current);
    recordingTimerRef.current = null;
    recordingClockRef.current = null;
  }, []);
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
    const blob =
      chunks.length > 0
        ? new Blob(chunks, { type: recorder?.mimeType || "video/webm" })
        : undefined;
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    const url = blob ? URL.createObjectURL(blob) : undefined;
    videoUrlRef.current = url ?? null;
    const duration = Math.max(1, recordingSecondsRef.current);
    recorderChunksRef.current = [];
    const quality = qualityFromDimensions(video.videoWidth, video.videoHeight);
    await deliverCapture(firstFrame, frames.slice(0, 5), "video", quality, {
      videoDurationSeconds: duration,
      videoBlob: blob,
      videoPreviewUrl: url,
    });
  }, [clearRecordingTimers, deliverCapture]);
  const startVideoRecording = useCallback(() => {
    const stream = mediaStreamRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!stream || !video || !canvas || typeof MediaRecorder === "undefined") {
      toast.error("L'enregistrement vidéo n'est pas disponible.");
      return;
    }
    const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((type) =>
      MediaRecorder.isTypeSupported(type),
    );
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderChunksRef.current = [];
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

  if (cameraPermission === "denied" || cameraPermission === "unavailable") {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-background p-4 text-foreground">
        <div className="text-center">
          <AlertTriangle className="mx-auto size-8 text-red-500" />
          <p className="mt-4 font-display text-xl font-bold">Accès caméra impossible</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground mb-6">
            {cameraErrorMessage({
              name: cameraPermission === "denied" ? "NotAllowedError" : "NotFoundError",
            })}
          </p>
          <Button onClick={handleClose}>Retour à l'accueil</Button>
        </div>
      </div>
    );
  }

  if (cameraPermission !== "granted") {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-sm">
        <div className="text-center text-white">
          <Loader2 className="mx-auto size-8 animate-spin text-eco" />
          <p className="mt-4 font-medium">Ouverture de la caméra...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Caméra de signalement"
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* --- START DIAGNOSTIC --- */}
      <div className="pointer-events-none absolute right-4 top-24 z-[99] max-w-sm rounded-lg bg-black/60 p-2 text-xs text-white backdrop-blur-sm">
        <p className="font-bold">Capteur détecté :</p>
        {depthSensor ? (
          <div className="mt-1 font-mono text-xs whitespace-pre-wrap">
            <p>{depthSensor.label}</p>
            {depthSensor.resolution && (
              <p>
                Résolution: {depthSensor.resolution.width}x{depthSensor.resolution.height}
              </p>
            )}
            {depthSensor.confidence && (
              <p>Confiance: {Math.round(depthSensor.confidence * 100)}%</p>
            )}
            <p>Supporté: {depthSensor.supported ? "Oui" : "Non"}</p>
          </div>
        ) : (
          <p className="mt-1 font-mono text-xs">Détection...</p>
        )}
      </div>
      {/* --- END DIAGNOSTIC --- */}

      {isProcessing && (
        <div className="absolute inset-0 grid place-items-center bg-black/80 backdrop-blur-sm">
          <div className="text-center text-white">
            <Loader2 className="mx-auto size-8 animate-spin text-eco" />
            <p className="mt-4 font-medium">Traitement...</p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70 pointer-events-none" />

      <div className="absolute inset-0 flex flex-col justify-between p-4 pt-safe-top pb-safe-bottom">
        <header className="flex items-center justify-start">
          <button
            type="button"
            onClick={handleClose}
            className="pointer-events-auto rounded-full bg-black/50 p-2.5 backdrop-blur-sm"
            aria-label="Fermer"
          >
            <X className="size-5" />
          </button>
        </header>

        <footer className="flex flex-col items-center">
          <div className="flex items-center gap-2 rounded-full bg-black/50 p-1.5 backdrop-blur-sm mb-5">
            <ModeButton
              active={captureMode === "single"}
              icon={<Camera className="size-5" />}
              label="Photo"
              onClick={() => setCaptureMode("single")}
            />
            <ModeButton
              active={captureMode === "multi"}
              icon={<Images className="size-5" />}
              label="3 Vues"
              onClick={() => setCaptureMode("multi")}
            />
            <ModeButton
              active={captureMode === "video"}
              icon={<Video className="size-5" />}
              label="Vidéo"
              onClick={() => setCaptureMode("video")}
            />
          </div>
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              onClick={handleCaptureAction}
              disabled={isProcessing || cameraPermission !== "granted"}
              className={`pointer-events-auto size-16 rounded-full border-4 border-white ring-offset-black transition-transform active:scale-90 disabled:opacity-50 ${recording ? "bg-red-500" : "bg-white/30"}`}
              aria-label={
                captureMode === "video"
                  ? recording
                    ? "Arrêter l'enregistrement"
                    : "Démarrer l'enregistrement"
                  : captureMode === "multi"
                    ? `Prendre la photo ${additionalPhotos.length + 1}/${MULTI_PHOTO_COUNT}`
                    : "Prendre une photo"
              }
            />
            {recording && (
              <div className="absolute size-16 rounded-full border-4 border-red-500 animate-pulse" />
            )}
          </div>
          <div className="h-10 text-center mt-2">
            {captureMode === "multi" && additionalPhotos.length > 0 && (
              <p className="text-xs font-medium text-white/90">
                {additionalPhotos.length} / {MULTI_PHOTO_COUNT} vues capturées.
              </p>
            )}
            {recording && (
              <p className="text-xs font-medium text-red-400 animate-pulse mt-2">
                {`Enregistrement ${recordingSeconds}s / ${MAX_VIDEO_SECONDS}s`}
              </p>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pointer-events-auto inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
        active ? "bg-white text-black" : "bg-transparent text-white/80 hover:text-white"
      }`}
    >
      {icon} {label}
    </button>
  );
}
