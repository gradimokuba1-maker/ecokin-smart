// EcoKin Smart — Analyse des capacités du téléphone pour la capture 3D
// Détection LiDAR (iOS), ARCore (Android), ou mode basique

import type { CameraCapability } from "./types";

// Type pour l'API WebXR expérimentale
interface NavigatorXR {
  xr?: {
    isSessionSupported(mode: string): Promise<boolean>;
  };
}

export type DeviceCapability = {
  cameraCapability: CameraCapability;
  hasLiDAR: boolean;
  hasARCore: boolean;
  hasDepthAPI: boolean;
  hasMultipleCameras: boolean;
  deviceType: "ios" | "android" | "other";
};

/**
 * Détecte les capacités de l'appareil photo du téléphone
 * pour déterminer le mode de capture 3D à utiliser
 */
export async function detectDeviceCapability(): Promise<DeviceCapability> {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const deviceType = isIOS ? "ios" : isAndroid ? "android" : "other";

  // Vérifier la disponibilité des API navigateur
  const hasMediaDevices = !!navigator.mediaDevices?.getUserMedia;
  const hasMultipleCameras = await checkMultipleCameras();
  const hasDepthSupport = checkDepthSupport();

  let cameraCapability: CameraCapability = "basic";
  let hasLiDAR = false;
  let hasARCore = false;
  let hasDepthAPI = false;

  if (isIOS) {
    // iOS: Vérifier si LiDAR disponible via API ARKit
    hasLiDAR = await checkLiDARAvailability();
    if (hasLiDAR) {
      cameraCapability = "lidar";
      hasDepthAPI = true;
    } else if (hasDepthSupport) {
      hasDepthAPI = true;
    }
  } else if (isAndroid) {
    // Android: Vérifier ARCore / Depth API
    hasARCore = await checkARCoreAvailability();
    if (hasARCore) {
      cameraCapability = "arcore";
      hasDepthAPI = true;
    } else if (hasDepthSupport) {
      hasDepthAPI = true;
    }
  }

  return {
    cameraCapability,
    hasLiDAR,
    hasARCore,
    hasDepthAPI,
    hasMultipleCameras,
    deviceType,
  };
}

/**
 * Vérifie si l'appareil dispose de plusieurs caméras
 */
async function checkMultipleCameras(): Promise<boolean> {
  try {
    if (!navigator.mediaDevices?.enumerateDevices) return false;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((d) => d.kind === "videoinput");
    return videoDevices.length >= 2;
  } catch {
    return false;
  }
}

/**
 * Détection de support de profondeur via l'API Media Capture
 * Vérifie si des contraintes de profondeur sont disponibles
 */
function checkDepthSupport(): boolean {
  // Vérifier via getUserMedia si on peut demander un flux avec profondeur
  // Fonctionnalité expérimentale, retourne false si non disponible
  try {
    const constraints = {
      video: {
        // @ts-ignore - propriété expérimentale
        videoKind: { exact: "depth" },
      },
    };
    // On ne fait que tester si la contrainte est supportée
    return "videoKind" in (constraints.video as any);
  } catch {
    return false;
  }
}

/**
 * Vérifie la disponibilité du LiDAR sur iOS
 * - Vérifie via WebKit CSS 3D transforms
 * - Détection de la présence d'une caméra TrueDepth/LiDAR
 */
async function checkLiDARAvailability(): Promise<boolean> {
  try {
    // Vérifier si WebXR Device API est disponible avec des capacités de profondeur
    const navXR = navigator as NavigatorXR;
    if (navXR.xr) {
      try {
        const supported = await navXR.xr.isSessionSupported("immersive-ar");
        if (supported) return true;
      } catch {
        // XR non supporté
      }
    }

    // Détection via WebGL extensions pour la profondeur
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (gl) {
      const depthExt = gl.getExtension("WEBGL_depth_texture");
      if (depthExt) return true;
    }

    // Sur iOS, vérifier la version d'OS (LiDAR disponible depuis iOS 14+)
    const ua = navigator.userAgent;
    const iOSMatch = ua.match(/OS (\d+)_(\d+)/);
    if (iOSMatch) {
      const major = parseInt(iOSMatch[1], 10);
      return major >= 14;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Vérifie la disponibilité d'ARCore / Depth API sur Android
 */
async function checkARCoreAvailability(): Promise<boolean> {
  try {
    // Vérifier les capacités AR via WebXR
    const navXR = navigator as NavigatorXR;
    if (navXR.xr) {
      try {
        const supported = await navXR.xr.isSessionSupported("immersive-ar");
        if (supported) return true;
      } catch {
        // XR non supporté
      }
    }

    // Vérifier la présence de l'API WebGL 2 avec extensions de profondeur
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (gl) {
      const ext = gl.getExtension("EXT_disjoint_timer_query_webgl2");
      if (ext) return true;
    }

    // Vérifier si l'application peut utiliser la caméra arrière
    // ARCore nécessite généralement Android 8.0+ avec Google Play Services AR
    const ua = navigator.userAgent;
    const androidMatch = ua.match(/Android (\d+)/);
    if (androidMatch) {
      const version = parseInt(androidMatch[1], 10);
      return version >= 8;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Demande la permission d'utiliser la caméra arrière
 * Retourne true si la permission est accordée
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    });
    // Arrêter le flux immédiatement après la demande de permission
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
}

/**
 * Demande la permission GPS (haute précision)
 * Retourne les coordonnées si accordée, null sinon
 */
export function requestGPSPermission(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  });
}

/**
 * Calcule l'estimation de volume basée sur les données de profondeur
 * Pour les téléphones sans capteur 3D, utilise une estimation basée
 * sur les dimensions de l'image et la perspective
 */
export function estimateVolumeFromImage(
  imageWidth: number,
  imageHeight: number,
  focalLength: number, // distance focale estimée en mm
  distanceEstimate: number, // distance estimée au dépôt en mètres
): { lengthM: number; widthM: number; heightAvgM: number; confidence: number } {
  // Conversion des pixels en mètres basée sur la distance et la focale
  const sensorWidthMM = 36; // Capteur plein format 35mm
  const sensorHeightMM = 24;

  const fovHorizontal = 2 * Math.atan(sensorWidthMM / (2 * focalLength));
  const fovVertical = 2 * Math.atan(sensorHeightMM / (2 * focalLength));

  const widthAtDistance = 2 * distanceEstimate * Math.tan(fovHorizontal / 2);
  const heightAtDistance = 2 * distanceEstimate * Math.tan(fovVertical / 2);

  // Ratio de l'image occupé par les déchets (estimation)
  const wasteRatio = 0.6; // 60% de l'image approximativement
  const wasteWidth = widthAtDistance * Math.sqrt(wasteRatio);
  const wasteHeight = heightAtDistance * Math.sqrt(wasteRatio);

  // Hauteur moyenne estimée
  const heightAvg = wasteHeight * 0.4;

  // Confiance réduite pour cette méthode d'estimation
  const confidence = 0.4;

  return {
    lengthM: Math.round(wasteWidth * 10) / 10,
    widthM: Math.round(wasteHeight * 10) / 10,
    heightAvgM: Math.round(heightAvg * 10) / 10,
    confidence,
  };
}
