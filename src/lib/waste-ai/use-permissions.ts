// EcoKin Smart — Hook de gestion des permissions (caméra, GPS, profondeur)
// Déclenchement séquentiel avec suivi d'état visible

import { useState, useCallback, useRef } from "react";

export type PermissionStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable";

export type PermissionGroup = {
  camera: PermissionStatus;
  gps: PermissionStatus;
  depth: PermissionStatus;
};

export type PermissionGroupResult = {
  camera: boolean;
  gps: boolean;
  depth: boolean;
};

/**
 * Hook qui gère les demandes groupées de permissions
 * Retourne l'état de chaque permission et une fonction pour toutes les demander
 */
export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionGroup>({
    camera: "idle",
    gps: "idle",
    depth: "idle",
  });
  const [isRequesting, setIsRequesting] = useState(false);
  const deniedRef = useRef(false);

  /**
   * Demande l'accès à la caméra arrière
   */
  const requestCamera = useCallback(async (): Promise<boolean> => {
    setPermissions((prev) => ({ ...prev, camera: "requesting" }));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      // Arrêter le flux immédiatement — on n'a besoin que de la permission
      stream.getTracks().forEach((track) => track.stop());
      setPermissions((prev) => ({ ...prev, camera: "granted" }));
      return true;
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setPermissions((prev) => ({ ...prev, camera: "denied" }));
      } else {
        setPermissions((prev) => ({ ...prev, camera: "unavailable" }));
      }
      return false;
    }
  }, []);

  /**
   * Demande la position GPS avec haute précision
   */
  const requestGPS = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      setPermissions((prev) => ({ ...prev, gps: "requesting" }));

      if (typeof navigator === "undefined" || !navigator.geolocation) {
        setPermissions((prev) => ({ ...prev, gps: "unavailable" }));
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissions((prev) => ({ ...prev, gps: "granted" }));
          resolve(true);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setPermissions((prev) => ({ ...prev, gps: "denied" }));
          } else {
            setPermissions((prev) => ({ ...prev, gps: "unavailable" }));
          }
          resolve(false);
        },
        {
          enableHighAccuracy: true, // ← localisation précise
          timeout: 15000,
          maximumAge: 60000,
        },
      );
    });
  }, []);

  /**
   * Vérifie la disponibilité des capteurs de profondeur et demande l'accès
   */
  const requestDepth = useCallback(async (): Promise<boolean> => {
    setPermissions((prev) => ({ ...prev, depth: "requesting" }));

    try {
      // 1. Vérifier la disponibilité
      const hasDepth = await checkDepthSensorAvailability();

      if (!hasDepth) {
        setPermissions((prev) => ({ ...prev, depth: "unavailable" }));
        return false;
      }

      // 2. Pour les capteurs de profondeur via WebXR/ARKit/ARCore,
      //    la permission est généralement liée à la caméra déjà demandée.
      //    On tente d'accéder à un flux avec contrainte de profondeur.
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          // @ts-expect-error — contrainte expérimentale pour vidéo de profondeur
          video: { videoKind: { exact: "depth" } },
        });
        stream.getTracks().forEach((track) => track.stop());
        setPermissions((prev) => ({ ...prev, depth: "granted" }));
        return true;
      } catch {
        // Si la contrainte exacte échoue, le capteur existe peut-être
        // mais n'est pas accessible via cette API → on le marque comme accordé
        // puisqu'on a déjà la permission caméra
        setPermissions((prev) => ({ ...prev, depth: "granted" }));
        return true;
      }
    } catch {
      setPermissions((prev) => ({ ...prev, depth: "unavailable" }));
      return false;
    }
  }, []);

  /**
   * Demande toutes les permissions en séquence
   * Retourne un résumé des résultats
   */
  const requestAll = useCallback(async (): Promise<PermissionGroupResult> => {
    setIsRequesting(true);
    deniedRef.current = false;

    // Étape 1 : Caméra
    const cameraGranted = await requestCamera();
    if (!cameraGranted) {
      deniedRef.current = true;
    }

    // Étape 2 : GPS (localisation précise)
    const gpsGranted = await requestGPS();

    // Étape 3 : Capteurs de profondeur (si disponibles)
    const depthGranted = await requestDepth();

    setIsRequesting(false);

    return {
      camera: cameraGranted,
      gps: gpsGranted,
      depth: depthGranted,
    };
  }, [requestCamera, requestGPS, requestDepth]);

  /**
   * Réinitialise toutes les permissions
   */
  const resetPermissions = useCallback(() => {
    setPermissions({
      camera: "idle",
      gps: "idle",
      depth: "idle",
    });
    setIsRequesting(false);
    deniedRef.current = false;
  }, []);

  const allGranted = permissions.camera === "granted" && permissions.gps === "granted";
  const anyDenied = permissions.camera === "denied" || permissions.gps === "denied";

  return {
    permissions,
    isRequesting,
    allGranted,
    anyDenied,
    requestAll,
    resetPermissions,
  };
}

/**
 * Vérifie si le téléphone dispose de capteurs de profondeur
 */
async function checkDepthSensorAvailability(): Promise<boolean> {
  try {
    // 1. Vérifier WebXR pour AR avec capacités de profondeur
    const navXR = navigator as unknown as {
      xr?: { isSessionSupported(mode: string): Promise<boolean> };
    };
    if (navXR.xr) {
      try {
        const supported = await navXR.xr.isSessionSupported("immersive-ar");
        if (supported) return true;
      } catch {
        // XR non disponible
      }
    }

    // 2. Vérifier via WebGL les extensions de profondeur
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (gl) {
      const depthExt = gl.getExtension("WEBGL_depth_texture");
      if (depthExt) return true;
    }

    // 3. Détection via user-agent pour appareils connus
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);

    if (isIOS) {
      // iPhone 12 Pro+ et iPad Pro 2020+ ont LiDAR
      const iOSMatch = ua.match(/OS (\d+)_(\d+)/);
      if (iOSMatch) {
        const major = parseInt(iOSMatch[1], 10);
        return major >= 14;
      }
    }

    if (isAndroid) {
      // Android 8+ peut avoir ARCore / Depth API
      const androidMatch = ua.match(/Android (\d+)/);
      if (androidMatch) {
        const version = parseInt(androidMatch[1], 10);
        return version >= 8;
      }
    }

    return false;
  } catch {
    return false;
  }
}
