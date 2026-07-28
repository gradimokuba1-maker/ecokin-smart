import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Camera,
  Images,
  Layers3,
  Loader2,
  MapPin,
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
const MAX_VIDEO_SECONDS = 12;
const MULTI_PHOTO_COUNT = 3;
const MAX_ANALYSIS_IMAGE_EDGE = 1600;
const JPEG_QUALITY = 0.88;
const REAR_CAMERA_LABEL = /back|rear|environment|arrière|arriere|world/i;


type Props = {
  onCapture: (result: CaptureResult) => void;
  onClose: () => void;
  disabled?: boolean;
};

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
    return "Autorisation de la caméra refusée. Activez-la dans les paramètres du navigateur.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "Aucune caméra utilisable n’a été détectée sur cet appareil.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "La caméra est actuellement utilisée par une autre application.";
  }
  return "Impossible d’ouvrir la caméra. Vérifiez les autorisations et réessayez.";
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
async function requestPreferredCameraStream(): Promise<MediaStream> {
    const mediaDevices = typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
    if (!mediaDevices?.getUserMedia) throw new DOMException("Camera API unavailable", "NotSupportedError");
    const attempts: MediaStreamConstraints[] = [ { audio: false, video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 }, }, }, { audio: false, video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 }, }, }, { audio: false, video: true }, ];
    let stream: MediaStream | null = null;
    let lastError: unknown;
    for (const constraints of attempts) { try { stream = await mediaDevices.getUserMedia(constraints); break; } catch (error) { lastError = error; if (getPermissionStatus(error) === "denied") throw error; } }
    const devices = await mediaDevices.enumerateDevices() .then((entries) => entries.filter((entry) => entry.kind === "videoinput")) .catch(() => [] as MediaDeviceInfo[]) ?? [];
    const rearDevices = devices.filter((device) => REAR_CAMERA_LABEL.test(device.label));
    if (!stream) { const candidates = rearDevices.length > 0 ? [...rearDevices, ...devices.filter((device) => !rearDevices.includes(device))] : devices; if (candidates.length > 0) { async function requestDeviceStream(mediaDevices: MediaDevices, devices: MediaDeviceInfo[]) { let lastError: unknown; for (const device of devices) { try { return await mediaDevices.getUserMedia({ audio: false, video: { deviceId: { exact: device.deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 }, }, }); } catch (error) { lastError = error; if (getPermissionStatus(error) === "denied") throw error; } } throw lastError ?? new DOMException("No camera stream", "NotFoundError"); } return requestDeviceStream(mediaDevices, candidates); } throw lastError ?? new DOMException("No camera device", "NotFoundError"); }
    const track = stream.getVideoTracks()[0];
    function isRearCamera(track: MediaStreamTrack, devices: MediaDeviceInfo[]) { const settings = track.getSettings(); if (settings.facingMode === "environment") return true; return devices.some((device) => device.deviceId === settings.deviceId && REAR_CAMERA_LABEL.test(device.label)); }
    if (!track || rearDevices.length === 0 || isRearCamera(track, devices)) return stream;
    stopStream(stream);
    try {
        async function requestDeviceStream(mediaDevices: MediaDevices, devices: MediaDeviceInfo[]) { let lastError: unknown; for (const device of devices) { try { return await mediaDevices.getUserMedia({ audio: false, video: { deviceId: { exact: device.deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 }, }, }); } catch (error) { lastError = error; if (getPermissionStatus(error) === "denied") throw error; } } throw lastError ?? new DOMException("No camera stream", "NotFoundError"); }
        return await requestDeviceStream(mediaDevices, rearDevices);
    } catch (error) { try { return await mediaDevices.getUserMedia({ audio: false, video: true }); } catch { throw error; } }
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


export function SmartWasteCamera({ onCapture, onClose, disabled }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recorderChunksRef = useRef<Blob[]>([]);
  const recordingFramesRef = useRef<string[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingClockRef = useRef<number | null>(null);
  const recordingSecondsRef = useRef(0);
  const videoUrlRef = useRef<string | null>(null);
  const nativeDepthRef = useRef<DepthAcquisition | null>(null);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [captureMode, setCaptureMode] = useState<CaptureMode>("single");
  const [permissions, setPermissions] = useState({
    camera: "idle" as PermissionStatus,
    gps: "idle" as PermissionStatus,
    depth: "idle" as PermissionStatus,
  });
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const handleClose = useCallback(() => {
    if (mediaStream) {
      stopStream(mediaStream);
    }
    onClose();
  }, [mediaStream, onClose]);

  useEffect(() => {
    const start = async () => {
      if (disabled) return;

      setPermissions({ camera: "requesting", depth: "requesting", gps: "requesting" });
      try {
        const stream = await requestPreferredCameraStream();
        setMediaStream(stream);
        setPermissions((current) => ({ ...current, camera: "granted" }));

        requestGPSPosition().then((position) => {
          setPermissions((current) => ({
            ...current,
            gps: position.status === "ok" ? "granted" : position.status === "denied" ? "denied" : "unavailable",
          }));
        });
        acquireNativeDepth().then((nativeDepth) => {
          nativeDepthRef.current = nativeDepth;
          setPermissions((current) => ({
            ...current,
            depth: nativeDepth.source === "lidar" ? "granted" : "unavailable",
          }));
          if (nativeDepth.source === "lidar") toast.success("Capteur de profondeur natif activé.");
        });

      } catch (error) {
        const status = getPermissionStatus(error);
        setPermissions((current) => ({ ...current, camera: status }));
        toast.error(cameraErrorMessage(error));
      }
    };
    start();
  }, [disabled]);

  useEffect(() => {
    if (mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(err => console.error("Video play failed", err));
    }
    return () => {
      if (mediaStream) {
        stopStream(mediaStream);
      }
    };
  }, [mediaStream]);


  const deliverCapture = useCallback(
    async (
      imageDataUrl: string,
      additionalImages: string[],
      mode: CaptureMode,
      quality: ImageQuality,
      options?: { videoDurationSeconds?: number; videoBlob?: Blob; videoPreviewUrl?: string },
    ) => {
      setPermissions((current) => ({ ...current, gps: "requesting" }));
      const gpsPosition = await requestGPSPosition({ maximumAge: 0, timeout: 15000 });
      if (gpsPosition.status !== "ok") {
        setPermissions((current) => ({ ...current, gps: gpsPosition.status === "denied" ? "denied" : "unavailable" }));
        toast.error("Position GPS obligatoire : activez la localisation puis reprenez la photo.");
        setIsProcessing(false);
        return;
      }
      const nextLocation = buildLocationInfo(gpsPosition.lat, gpsPosition.lng, gpsPosition.accuracy, gpsPosition.altitudeM);
      const now = new Date().toISOString();
      const depthResult = nativeDepthRef.current ?? { source: "ai" as const, label: "Analyse IA", detail: "Profondeur estimée par l'IA", confidence: 0.55 };

      onCapture({
        imageDataUrl,
        additionalImages,
        cameraCapability: depthResult.source === "lidar" ? "lidar" : "basic",
        depthSource: depthResult.source,
        depthData: depthResult.depthData,
        location: nextLocation,
        captureMode: mode,
        capturedAt: now,
        videoDurationSeconds: options?.videoDurationSeconds,
        videoBlob: options?.videoBlob,
        videoPreviewUrl: options?.videoPreviewUrl,
        imageQuality: quality,
      });
    },
    [onCapture],
  );

  const captureStill = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing || !isCameraReady) return;
    
    const video = videoRef.current;
    const frame = dataUrlFromCanvas(video, canvasRef.current);
    if (!frame) return toast.error("Impossible de capturer l'image.");

    setIsProcessing(true);
    toast("Capture en cours...", { id: "capture-toast" });
    const nextQuality = qualityFromDimensions(video.videoWidth, video.videoHeight);

    if (captureMode === "multi") {
      const nextPhotos = [...additionalPhotos, frame];
      setAdditionalPhotos(nextPhotos);
      if (nextPhotos.length < MULTI_PHOTO_COUNT) {
        toast.success(`Vue \${nextPhotos.length}/\${MULTI_PHOTO_COUNT} enregistrée. Changez d'angle.`);
        setIsProcessing(false);
        return;
      }
      await deliverCapture(nextPhotos[0], nextPhotos.slice(1), "multi", nextQuality);
      return;
    }
    await deliverCapture(frame, [], "single", nextQuality);
  }, [additionalPhotos, captureMode, deliverCapture, isCameraReady, isProcessing]);

  const clearRecordingTimers = useCallback(() => { if (recordingTimerRef.current != null) window.clearInterval(recordingTimerRef.current); if (recordingClockRef.current != null) window.clearInterval(recordingClockRef.current); recordingTimerRef.current = null; recordingClockRef.current = null; }, []);
  const finishVideo = useCallback(async () => { clearRecordingTimers(); const video = videoRef.current; const canvas = canvasRef.current; const recorder = recorderRef.current; recorderRef.current = null; setRecording(false); if (!video || !canvas) return; const firstFrame = dataUrlFromCanvas(video, canvas) ?? recordingFramesRef.current[0]; const frames = recordingFramesRef.current; recordingFramesRef.current = []; if (!firstFrame) { toast.error("La vidéo ne contient aucune image exploitable."); return; } const chunks = recorderChunksRef.current; const blob = chunks.length > 0 ? new Blob(chunks, { type: recorder?.mimeType || "video/webm" }) : undefined; if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current); const url = blob ? URL.createObjectURL(blob) : undefined; videoUrlRef.current = url ?? null; const duration = Math.max(1, recordingSecondsRef.current); recorderChunksRef.current = []; const nextQuality = qualityFromDimensions(video.videoWidth, video.videoHeight); await deliverCapture(firstFrame, frames.slice(0, 5), "video", nextQuality, { videoDurationSeconds: duration, videoBlob: blob, videoPreviewUrl: url, }); }, [clearRecordingTimers, deliverCapture]);
  const startVideoRecording = useCallback(() => { const stream = mediaStream; const video = videoRef.current; const canvas = canvasRef.current; if (!stream || !video || !canvas || typeof MediaRecorder === "undefined") { toast.error("L'enregistrement vidéo n'est pas disponible."); return; } const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((type) => MediaRecorder.isTypeSupported(type), ); const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined); recorderChunksRef.current = []; recorder.ondataavailable = (event) => { if (event.data.size > 0) recorderChunksRef.current.push(event.data); }; recorder.onstop = () => void finishVideo(); recorderRef.current = recorder; recordingFramesRef.current = []; setRecordingSeconds(0); recordingSecondsRef.current = 0; setRecording(true); recorder.start(500); recordingTimerRef.current = window.setInterval(() => { const frame = dataUrlFromCanvas(video, canvas); if (frame && recordingFramesRef.current.length < 6) recordingFramesRef.current.push(frame); }, 1600); let elapsed = 0; recordingClockRef.current = window.setInterval(() => { elapsed += 1; recordingSecondsRef.current = elapsed; setRecordingSeconds(elapsed); if (elapsed >= MAX_VIDEO_SECONDS && recorder.state === "recording") recorder.stop(); }, 1000); }, [finishVideo, mediaStream]);
  const stopVideoRecording = useCallback(() => { if (recorderRef.current?.state === "recording") recorderRef.current.stop(); }, []);
  const handleCaptureAction = useCallback(() => { if (captureMode === "video") { if (recording) stopVideoRecording(); else startVideoRecording(); return; } void captureStill(); }, [captureMode, captureStill, recording, startVideoRecording, stopVideoRecording]);


  if (permissions.camera === 'idle' || permissions.camera === 'requesting') {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 text-white backdrop-blur-sm">
        <div className="text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-eco" />
          <p className="mt-4 font-medium">Démarrage de la caméra...</p>
        </div>
      </div>
    );
  }

  if (permissions.camera === 'denied' || permissions.camera === 'unavailable') {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 text-white backdrop-blur-sm">
        <div className="text-center">
          <AlertTriangle className="mx-auto size-8 text-red-500" />
          <p className="mt-4 font-medium">Accès caméra impossible</p>
          <p className="mt-1 max-w-sm text-sm text-white/70 mb-4">
            {cameraErrorMessage({ name: permissions.camera === "denied" ? "NotAllowedError" : "NotFoundError" })}
          </p>
          <button type="button" onClick={handleClose} className="rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold">
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black text-white" role="dialog" aria-modal="true" aria-label="Caméra intelligente">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onCanPlay={() => setIsCameraReady(true)}
        className="size-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70 pointer-events-none" />

      <div className="absolute inset-0 flex flex-col justify-between p-4 pt-safe-top pb-safe-bottom">
        <header className="flex items-center justify-between">
          <button type="button" onClick={handleClose} className="pointer-events-auto rounded-full bg-black/50 p-2.5 backdrop-blur-sm" aria-label="Fermer la caméra">
            <X className="size-5" />
          </button>
          <div className="flex items-center gap-4 rounded-full bg-black/50 px-4 py-2.5 text-xs backdrop-blur-sm">
            <StatusIndicator status={permissions.gps} icon={<MapPin className="size-4" />} />
            <StatusIndicator status={permissions.depth} grantedIcon={<Layers3 className="size-4" />} unavailableIcon={<Sparkles className="size-4" />} />
          </div>
        </header>

        <footer className="flex flex-col items-center">
          <div className="flex items-center gap-2 rounded-full bg-black/50 p-1.5 backdrop-blur-sm mb-5">
            <ModeButton active={captureMode === "single"} icon={<Camera className="size-5" />} label="Photo" onClick={() => setCaptureMode("single")} />
            <ModeButton active={captureMode === "multi"} icon={<Images className="size-5" />} label="3 Vues" onClick={() => setCaptureMode("multi")} />
            <ModeButton active={captureMode === "video"} icon={<Video className="size-5" />} label="Vidéo" onClick={() => setCaptureMode("video")} />
          </div>
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              onClick={handleCaptureAction}
              disabled={isProcessing || disabled || !isCameraReady}
              className={`pointer-events-auto size-16 rounded-full border-4 border-white ring-offset-black transition-transform active:scale-90 disabled:opacity-50 \${recording ? "bg-red-500" : "bg-white/30"}`}
              aria-label={recording ? "Arrêter l'enregistrement" : "Prendre une photo"}
            />
            {isProcessing && <Loader2 className="absolute size-20 animate-spin text-eco" />}
            {recording && <div className="absolute size-16 rounded-full border-4 border-red-500 animate-pulse" />}
          </div>
        </footer>
      </div>
    </div>
  );
}

function StatusIndicator({ status, icon, grantedIcon, unavailableIcon }: { status: PermissionStatus; icon?: ReactNode, grantedIcon?: ReactNode, unavailableIcon?: ReactNode }) {
    const color: Record<PermissionStatus, string> = {
        idle: "text-white/50",
        requesting: "text-eco animate-pulse",
        granted: "text-emerald-400",
        denied: "text-red-400",
        unavailable: "text-amber-400",
    };
    const currentIcon = status === 'granted' ? grantedIcon ?? icon : status === 'unavailable' ? unavailableIcon ?? icon : icon;
    return <div className={color[status]}>{currentIcon}</div>;
}

function ModeButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pointer-events-auto inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors \${
        active ? "bg-white text-black" : "bg-transparent text-white/80 hover:text-white"
      }`}
    >
      {icon} {label}
    </button>
  );
}
