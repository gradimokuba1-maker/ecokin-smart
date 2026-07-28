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

function stopStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => track.stop());
}

async function requestPreferredCameraStream(): Promise<MediaStream> {
  const mediaDevices = typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
  if (!mediaDevices?.getUserMedia) {
    throw new DOMException("L'API caméra n'est pas supportée sur ce navigateur.", "NotSupportedError");
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
    // Fallback for devices that don't support high resolutions or facingMode
    try {
      return await mediaDevices.getUserMedia({ audio: false, video: true });
    } catch (fallbackError) {
      console.error("Fallback camera request also failed", fallbackError);
      throw fallbackError;
    }
  }
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
  const nativeDepthRef = useRef<DepthAcquisition | null>(null);

  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>("idle");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [captureMode, setCaptureMode] = useState<CaptureMode>("single");
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);
  
  const [recording, setRecording] = useState(false);


  const handleClose = useCallback(() => {
    stopStream(mediaStreamRef.current);
    mediaStreamRef.current = null;
    onClose();
  }, [onClose]);

  useEffect(() => {
    let isCancelled = false;
    
    async function startCamera() {
      if (mediaStreamRef.current || cameraPermission === 'denied' || cameraPermission === 'unavailable') {
        return;
      }
      
      setCameraPermission("requesting");
      
      try {
        const streamPromise = requestPreferredCameraStream();
        const gpsPromise = requestGPSPosition();
        const depthPromise = acquireNativeDepth();
        
        const stream = await streamPromise;

        if (isCancelled) {
          stopStream(stream);
          return;
        }

        mediaStreamRef.current = stream;
        nativeDepthRef.current = await depthPromise;
        await gpsPromise;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraPermission("granted");
        
      } catch (error) {
        if (isCancelled) return;
        console.error("Camera startup failed:", error);
        const name = error instanceof Error ? error.name : "";
        const status = (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") ? "denied" : "unavailable";
        setCameraPermission(status);
      }
    }

    startCamera();

    return () => {
      isCancelled = true;
      stopStream(mediaStreamRef.current);
      mediaStreamRef.current = null;
    };
  }, []);


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

        const location = buildLocationInfo(gpsPosition.lat, gpsPosition.lng, gpsPosition.accuracy, gpsPosition.altitudeM);
        const now = new Date().toISOString();
        const depthResult = nativeDepthRef.current ?? { source: "ai" as const, label: "Analyse IA" };

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
      } catch(e) {
        toast.error(e instanceof Error ? e.message : "Erreur de capture.");
        setIsProcessing(false);
      }
    },
    [onCapture],
  );

  const captureStill = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing || !isCameraReady) return;
    
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
      if (nextPhotos.length < MULTI_PHOTO_COUNT) {
        toast.success(`Vue ${nextPhotos.length}/${MULTI_PHOTO_COUNT} enregistrée. Changez d'angle.`);
        setIsProcessing(false);
        return;
      }
      await deliverCapture(nextPhotos[0], nextPhotos.slice(1), "multi", quality);
      return;
    }
    await deliverCapture(frame, [], "single", quality);
  }, [additionalPhotos, captureMode, deliverCapture, isCameraReady, isProcessing]);
  
  const handleCaptureAction = useCallback(() => {
    void captureStill();
  }, [captureStill]);

  if (cameraPermission === 'denied' || cameraPermission === 'unavailable') {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-background p-4 text-foreground">
        <div className="text-center">
          <AlertTriangle className="mx-auto size-8 text-red-500" />
          <p className="mt-4 font-display text-xl font-bold">Accès caméra impossible</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground mb-6">
            {cameraErrorMessage({ name: cameraPermission === "denied" ? "NotAllowedError" : "NotFoundError" })}
          </p>
          <Button onClick={handleClose}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  if (cameraPermission !== 'granted') {
    return (
       <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-sm">
          <div className="text-center text-white">
              <Loader2 className="mx-auto size-8 animate-spin text-eco" />
              <p className="mt-4 font-medium">Ouverture de la caméra...</p>
          </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black text-white" role="dialog" aria-modal="true" aria-label="Caméra de signalement">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onCanPlay={() => setIsCameraReady(true)}
        onPlay={() => setIsCameraReady(true)}
        className="size-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {(!isCameraReady || isProcessing) && (
        <div className="absolute inset-0 grid place-items-center bg-black/80 backdrop-blur-sm">
            <div className="text-center text-white">
                <Loader2 className="mx-auto size-8 animate-spin text-eco" />
                <p className="mt-4 font-medium">{isProcessing ? 'Traitement...' : 'Chargement du flux vidéo...'}</p>
            </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70 pointer-events-none" />

      <div className="absolute inset-0 flex flex-col justify-between p-4 pt-safe-top pb-safe-bottom">
        <header className="flex items-center justify-start">
          <button type="button" onClick={handleClose} className="pointer-events-auto rounded-full bg-black/50 p-2.5 backdrop-blur-sm" aria-label="Fermer">
            <X className="size-5" />
          </button>
        </header>

        <footer className="flex flex-col items-center">
          <div className="flex items-center gap-2 rounded-full bg-black/50 p-1.5 backdrop-blur-sm mb-5">
            <ModeButton active={captureMode === "single"} icon={<Camera className="size-5" />} label="Photo" onClick={() => setCaptureMode("single")} />
            <ModeButton active={captureMode === "multi"} icon={<Images className="size-5" />} label="3 Vues" onClick={() => setCaptureMode("multi")} />
          </div>
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              onClick={handleCaptureAction}
              disabled={isProcessing || !isCameraReady}
              className={`pointer-events-auto size-16 rounded-full border-4 border-white ring-offset-black transition-transform active:scale-90 disabled:opacity-50 ${recording ? "bg-red-500" : "bg-white/30"}`}
              aria-label={captureMode === 'multi' ? `Prendre la photo ${additionalPhotos.length + 1}/${MULTI_PHOTO_COUNT}` : "Prendre une photo"}
            />
            {isProcessing && <Loader2 className="absolute size-20 animate-spin text-eco" />}
          </div>
           <div className="h-10 text-center mt-2">
            {captureMode === 'multi' && additionalPhotos.length > 0 && (
                <p className="text-xs font-medium text-white/90">
                    {additionalPhotos.length} / {MULTI_PHOTO_COUNT} vues capturées.
                </p>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";

function ModeButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
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
