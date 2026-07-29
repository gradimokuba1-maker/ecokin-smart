import type { DepthAcquisition } from "./depth-service";

export type DepthSource = "lidar" | "tof" | "arcore" | "arkit" | "ai";

// This is a placeholder for actual browser/device APIs.
// In a real implementation, you would check for things like:
// - navigator.xr?.requestSession({ requiredFeatures: ['depth-sensing'] })
// - window.ApplePaySession (as a proxy for Apple devices that might have ARKit)
// - Specific device models known to have ToF/LiDAR sensors.
async function detectDepthSensor(): Promise<DepthAcquisition> {
  const nav = typeof navigator !== "undefined" ? (navigator as any) : undefined;
  if (typeof window === "undefined" || !nav || !("xr" in nav)) {
    return { source: "ai", label: "IA (serveur/sans-XR)", supported: true };
  }

  // Use WebXR Device API to detect depth sensing capabilities
  try {
    if (await nav.xr.isSessionSupported("immersive-ar")) {
      // isSessionSupported is not enough, we need to check for the feature.
      // A real session request is more reliable.
      const session = await nav.xr.requestSession("immersive-ar", { requiredFeatures: ['depth-sensing'] }).catch(() => null);
      if (session) {
        // We must end the session immediately as we are only detecting capabilities.
        session.end();

        // Let's check if it's likely ARKit or ARCore
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        const source: DepthSource = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream ? "arkit" : "arcore";

        return {
          source,
          label: source === 'arkit' ? "ARKit Depth" : "ARCore Depth",
          supported: true,
          confidence: 0.85,
          resolution: { width: 256, height: 192 } // Typical low-res depth map
        };
      }
    }
  } catch (e) {
    console.warn("WebXR depth sensing detection failed, may not be supported.", e);
  }

  // Simulate ToF sensor detection as a fallback example (no standard web API exists)
  if (Math.random() > 0.8) { // Simulate 20% chance
    return {
      source: "tof",
      label: "Capteur ToF (simulé)",
      supported: true,
      confidence: 0.7,
      resolution: { width: 320, height: 240 }
    };
  }

  // Default to AI-based monocular depth estimation
  return {
    source: "ai",
    label: "IA monoculaire",
    supported: true,
    confidence: 0.6,
  };
}


export const getDepthAcquisition = async (): Promise<DepthAcquisition> => {
  try {
    const sensor = await detectDepthSensor();
    return sensor;
  } catch (error) {
    console.error("Erreur lors de la détection du capteur de profondeur:", error);
    return {
      source: "ai",
      label: "IA monoculaire (fallback)",
      supported: true,
      confidence: 0.5,
    };
  }
};
