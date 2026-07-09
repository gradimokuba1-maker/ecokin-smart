// EcoKin Smart — SmartWasteCamera : Capture intelligente avec analyse 3D intégrée
// Détection automatique des capacités du téléphone (LiDAR, ARCore, basique)
// Demande groupée des permissions : caméra, GPS (précise), profondeur

import { useRef, useState, useEffect, useCallback } from "react";
import { Camera, ImageIcon, Loader2, Smartphone, Tablet, AlertTriangle, CheckCircle2, RotateCcw, Layers, MapPin, Eye, Box, XCircle, Shield } from "lucide-react";
import { toast } from "sonner";
import { detectDeviceCapability, estimateVolumeFromImage, type DeviceCapability } from "@/lib/waste-ai/depth-analyzer";
import { requestGPSPosition, buildLocationInfo, type GPSState } from "@/lib/waste-ai/gps-location";
import type { CameraCapability, LocationInfo } from "@/lib/waste-ai/types";
import { usePermissions, type PermissionStatus } from "@/lib/waste-ai/use-permissions";

export type CaptureResult = {
  imageDataUrl: string;
  additionalImages: string[];
  cameraCapability: CameraCapability;
  location: LocationInfo | null;
  depthData?: string;
};

type Props = {
  onCapture: (result: CaptureResult) => void;
  disabled?: boolean;
};

export function SmartWasteCamera({ onCapture, disabled }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [deviceCap, setDeviceCap] = useState<DeviceCapability | null>(null);
  const [gpsState, setGpsState] = useState<GPSState>({ status: "idle" });
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);
  const [captureMode, setCaptureMode] = useState<"single" | "multi">("single");
  const [multiStep, setMultiStep] = useState(0);
  const [showLiveView, setShowLiveView] = useState(false);
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);
  const [showPermissionPanel, setShowPermissionPanel] = useState(false);

  // Hook de permissions groupées
  const {
    permissions,
    isRequesting: permissionsRequesting,
    allGranted,
    anyDenied,
    requestAll,
    resetPermissions,
  } = usePermissions();

  // Détection des capacités au montage
  useEffect(() => {
    (async () => {
      const cap = await detectDeviceCapability();
      setDeviceCap(cap);
      if (cap.cameraCapability === "lidar") {
        setCaptureMode("single");
      } else if (cap.cameraCapability === "arcore") {
        setCaptureMode("single");
      } else {
        setCaptureMode("multi");
      }
    })();
  }, []);

  // Demander le GPS automatiquement (en parallèle)
  useEffect(() => {
    (async () => {
      setGpsState({ status: "requesting" });
      const gps = await requestGPSPosition();
      setGpsState(gps);
      if (gps.status === "ok") {
        const loc = buildLocationInfo(gps.lat, gps.lng, gps.accuracy);
        setLocation(loc);
      }
    })();
  }, []);

  // Nettoyage du flux vidéo
  useEffect(() => {
    return () => {
      if (liveStream) {
        liveStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [liveStream]);

  /**
   * Action principale "Prendre une photo"
   * 1. Affiche le panneau des permissions
   * 2. Demande toutes les permissions en séquence
   * 3. Si tout est accordé, lance la caméra
   */
  const handleTakePhoto = useCallback(async () => {
    setShowPermissionPanel(true);

    // Lancer la demande groupée de permissions
    const result = await requestAll();

    if (result.camera) {
      // Caméra accordée → lancer le flux vidéo
      await startLiveView();
    } else {
      toast.error("Permission caméra refusée — impossible d'utiliser l'appareil photo");
    }

    if (!result.gps) {
      toast.warning("GPS non disponible — la localisation sera manuelle");
    }

    if (result.depth) {
      toast.success("Capteurs de profondeur disponibles — analyse 3D améliorée");
    }
  }, [requestAll]);

  const startLiveView = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setLiveStream(stream);
      setShowLiveView(true);
    } catch {
      toast.error("Impossible d'accéder à la caméra");
    }
  }, []);

  const stopLiveView = useCallback(() => {
    if (liveStream) {
      liveStream.getTracks().forEach((t) => t.stop());
      setLiveStream(null);
    }
    setShowLiveView(false);
  }, [liveStream]);

  const captureFromLiveView = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    handleImageCapture(dataUrl);
    stopLiveView();
  }, [stopLiveView]);

  const handleFile = useCallback(async (f: File | undefined) => {
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) {
      toast.error("Image trop volumineuse (max 4 Mo)");
      return;
    }
    const dataUrl = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(f);
    });
    handleImageCapture(dataUrl);
  }, []);

  const handleImageCapture = useCallback((dataUrl: string) => {
    if (captureMode === "single") {
      setPreview(dataUrl);
      setCapturing(true);
      // Pour single capture, envoyer immédiatement
      const cap = deviceCap?.cameraCapability ?? "basic";
      onCapture({
        imageDataUrl: dataUrl,
        additionalImages: [],
        cameraCapability: cap,
        location,
      });
      setCapturing(false);
      toast.success("Photo capturée · Analyse IA en cours");
    } else {
      // Mode multi: demander plusieurs photos
      const newPhotos = [...additionalPhotos, dataUrl];
      setAdditionalPhotos(newPhotos);
      setMultiStep(newPhotos.length);

      if (newPhotos.length >= 3) {
        // Assez de photos, envoyer pour analyse
        setPreview(newPhotos[0]);
        setCapturing(true);
        const cap = deviceCap?.cameraCapability ?? "basic";
        onCapture({
          imageDataUrl: newPhotos[0],
          additionalImages: newPhotos.slice(1),
          cameraCapability: cap,
          location,
        });
        setCapturing(false);
        setMultiStep(0);
        setAdditionalPhotos([]);
        toast.success("Photos capturées · Analyse IA multi-vues en cours");
      } else {
        toast.success(`Photo ${newPhotos.length}/3 prise. Prenez la vue suivante.`);
      }
    }
  }, [captureMode, deviceCap, location, additionalPhotos, onCapture]);

  const resetCapture = useCallback(() => {
    setPreview(null);
    setAdditionalPhotos([]);
    setMultiStep(0);
    setCapturing(false);
  }, []);

  const getDeviceBadge = () => {
    if (!deviceCap) return null;
    const cap = deviceCap.cameraCapability;
    if (cap === "lidar") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-purple-700">
          <Layers className="size-3" /> LiDAR
        </span>
      );
    }
    if (cap === "arcore") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-700">
          <Smartphone className="size-3" /> ARCore
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-700">
        <Tablet className="size-3" /> Standard
      </span>
    );
  };

  const getGPSBadge = () => {
    if (gpsState.status === "requesting") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-eco/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-eco">
          <Loader2 className="size-3 animate-spin" /> GPS…
        </span>
      );
    }
    if (gpsState.status === "ok") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
          <CheckCircle2 className="size-3" /> GPS ±{Math.round(gpsState.accuracy)}m
        </span>
      );
    }
    if (gpsState.status === "denied") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-700">
          <AlertTriangle className="size-3" /> GPS refusé
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-700">
        <AlertTriangle className="size-3" /> GPS indisponible
      </span>
    );
  };

  /**
   * Rendu d'une ligne de permission avec son icône et son état
   */
  const PermissionRow = ({
    icon,
    label,
    status,
  }: {
    icon: React.ReactNode;
    label: string;
    status: PermissionStatus;
  }) => {
    const statusConfig = {
      idle: { color: "text-muted-foreground", bg: "bg-secondary/50", icon: null },
      requesting: { color: "text-eco", bg: "bg-eco/10", icon: <Loader2 className="size-3 animate-spin" /> },
      granted: { color: "text-emerald-600", bg: "bg-emerald-500/10", icon: <CheckCircle2 className="size-3" /> },
      denied: { color: "text-red-600", bg: "bg-red-500/10", icon: <XCircle className="size-3" /> },
      unavailable: { color: "text-amber-600", bg: "bg-amber-500/10", icon: <AlertTriangle className="size-3" /> },
    };

    const cfg = statusConfig[status];
    const statusLabels: Record<PermissionStatus, string> = {
      idle: "En attente",
      requesting: "Demande en cours…",
      granted: "Autorisé",
      denied: "Refusé",
      unavailable: "Non disponible",
    };

    return (
      <div className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
        <span className="shrink-0">{icon}</span>
        <span className="flex-1">{label}</span>
        <span className="inline-flex items-center gap-1">
          {cfg.icon}
          {statusLabels[status]}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Badges d'information */}
      <div className="flex flex-wrap items-center gap-2">
        {getDeviceBadge()}
        {getGPSBadge()}
        {location && (
          <span className="text-[10px] font-mono text-muted-foreground">
            {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </span>
        )}
      </div>

      {/* Panneau des permissions */}
      {showPermissionPanel && (
        <div className="rounded-2xl border border-eco/20 bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-widest text-eco">
              <Shield className="mr-1 inline size-3" />
              Autorisations requises
            </h4>
            {!permissionsRequesting && (allGranted || anyDenied) && (
              <button
                onClick={() => setShowPermissionPanel(false)}
                className="text-[10px] font-semibold text-muted-foreground hover:text-foreground"
              >
                Masquer
              </button>
            )}
          </div>

          <div className="space-y-2">
            <PermissionRow
              icon={<Camera className="size-3.5" />}
              label="Accès à la caméra"
              status={permissions.camera}
            />
            <PermissionRow
              icon={<MapPin className="size-3.5" />}
              label="Localisation GPS (précise)"
              status={permissions.gps}
            />
            <PermissionRow
              icon={<Box className="size-3.5" />}
              label="Capteurs de profondeur (LiDAR/ARCore)"
              status={permissions.depth}
            />
          </div>

          {permissionsRequesting && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-eco/5 px-3 py-2 text-xs font-semibold text-eco">
              <Loader2 className="size-3 animate-spin" />
              Demande des autorisations en cours…
            </div>
          )}

          {!permissionsRequesting && anyDenied && (
            <div className="mt-3 rounded-xl border border-amber-300 bg-amber-500/10 p-3 text-xs text-amber-800">
              <p className="font-semibold">⚠ Certaines autorisations ont été refusées</p>
              <p className="mt-1">
                Vous pouvez toujours prendre une photo, mais certaines fonctionnalités
                (localisation automatique, analyse 3D) seront limitées.
              </p>
            </div>
          )}

          {!permissionsRequesting && allGranted && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="size-3" />
              Toutes les autorisations sont accordées
            </div>
          )}
        </div>
      )}

      {/* Message pour mode multi-photos */}
      {captureMode === "multi" && multiStep === 0 && !preview && (
        <div className="rounded-xl border border-amber-300 bg-amber-500/10 p-3 text-xs text-amber-800">
          <p className="font-semibold">📸 Améliorez la précision</p>
          <p className="mt-1">
            Pour une meilleure estimation 3D, prenez 3 photos sous différents angles autour du dépôt.
          </p>
        </div>
      )}

      {/* Indicateur de progression multi-photos */}
      {captureMode === "multi" && multiStep > 0 && multiStep < 3 && (
        <div className="flex items-center gap-2 rounded-xl bg-eco/5 px-3 py-2 text-xs font-semibold text-eco">
          <Loader2 className="size-3 animate-spin" />
          Photo {multiStep + 1}/3 — Prenez une vue différente du dépôt
        </div>
      )}

      {/* Zone de prévisualisation */}
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary/30">
        {showLiveView ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="size-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              <button
                onClick={captureFromLiveView}
                disabled={capturing || disabled}
                className="inline-flex items-center gap-2 rounded-full bg-eco px-5 py-2 text-sm font-bold text-white shadow-lg hover:bg-eco/90 disabled:opacity-50"
              >
                <Camera className="size-4" />
                Capturer
              </button>
              <button
                onClick={stopLiveView}
                className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2 text-sm font-bold text-white shadow-lg hover:bg-red-600"
              >
                Annuler
              </button>
            </div>
          </>
        ) : preview ? (
          <>
            <img src={preview} alt="Aperçu" className="size-full object-cover" />
            {capturing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-eco shadow-lg">
                  <Loader2 className="size-4 animate-spin" />
                  Analyse IA…
                </div>
              </div>
            )}
            {!capturing && (
              <button
                onClick={resetCapture}
                className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <RotateCcw className="size-4" />
              </button>
            )}
          </>
        ) : (
          <div className="px-4 text-center text-sm text-muted-foreground">
            <Camera className="mx-auto size-8 text-eco" />
            <p className="mt-2 font-semibold">
              {deviceCap?.cameraCapability === "lidar"
                ? "Capture LiDAR prête"
                : deviceCap?.cameraCapability === "arcore"
                ? "Capture ARCore prête"
                : "Capture intelligente prête"}
            </p>
            <p className="text-xs">
              {captureMode === "single"
                ? "Prenez une photo pour lancer l'analyse IA complète"
                : "Prenez 3 photos sous différents angles"}
            </p>
          </div>
        )}
      </div>

      {/* Boutons d'action */}
      {!showLiveView && !preview && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={handleTakePhoto}
            disabled={capturing || disabled || permissionsRequesting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-eco px-4 py-3 text-sm font-bold text-white hover:bg-eco/90 disabled:opacity-50"
          >
            {permissionsRequesting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Autorisations…
              </>
            ) : (
              <>
                <Camera className="size-4" />
                {captureMode === "multi" && multiStep > 0
                  ? `Prendre photo ${multiStep + 1}/3`
                  : "Prendre une photo"}
              </>
            )}
          </button>
          <button
            onClick={() => galleryRef.current?.click()}
            disabled={capturing || disabled}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-eco/40 bg-eco/5 px-4 py-3 text-sm font-bold text-eco hover:bg-eco/10 disabled:opacity-50"
          >
            <ImageIcon className="size-4" />
            Depuis la galerie
          </button>
        </div>
      )}

      {/* Inputs cachés */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Message d'information sur le mode de capture */}
      {deviceCap && !preview && !showLiveView && (
        <div className="rounded-lg bg-secondary/30 p-2 text-center text-[10px] text-muted-foreground">
          {deviceCap.cameraCapability === "lidar" && "📱 iPhone avec LiDAR détecté · Reconstruction 3D précise activée"}
          {deviceCap.cameraCapability === "arcore" && "📱 Android ARCore détecté · Analyse de profondeur activée"}
          {deviceCap.cameraCapability === "basic" && "📱 Mode standard · Estimation volumétrique par IA multi-vues"}
        </div>
      )}
    </div>
  );
}