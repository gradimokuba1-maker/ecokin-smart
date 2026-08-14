import type { DepthAcquisition } from "./depth-service";

export type DepthSource = DepthAcquisition["source"];

// This is a placeholder for actual browser/device APIs.
// In a real implementation, you would check for things like:
// - navigator.xr?.requestSession({ requiredFeatures: ['depth-sensing'] })
// - window.ApplePaySession (as a proxy for Apple devices that might have ARKit)
// - Specific device models known to have ToF/LiDAR sensors.
async function detectDepthSensor(): Promise<DepthAcquisition> {
  const nav = typeof navigator !== "undefined" ? (navigator as any) : undefined;
  if (typeof window === "undefined" || !nav || !("xr" in nav)) {
    return {
      source: "ai",
      label: "Estimation visuelle sans capteur de profondeur",
      supported: false,
      confidence: 0.35,
    };
  }

  // Use WebXR Device API to detect depth sensing capabilities
  try {
    if (await nav.xr.isSessionSupported("immersive-ar")) {
      // isSessionSupported is not enough, we need to check for the feature.
      // A real session request is more reliable.
      const session = await nav.xr
        .requestSession("immersive-ar", { requiredFeatures: ["depth-sensing"] })
        .catch(() => null);
      if (session) {
        // We must end the session immediately as we are only detecting capabilities.
        session.end();

        // Let's check if it's likely ARKit or ARCore
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        const source: DepthSource =
          /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream ? "lidar" : "arcore";

        return {
          source,
          label: source === "lidar" ? "LiDAR / ARKit Depth" : "ARCore Depth",
          supported: true,
          confidence: 0.85,
          resolution: { width: 256, height: 192 },
        };
      }
    }
  } catch (e) {
    console.warn("WebXR depth sensing detection failed, may not be supported.", e);
  }

  return {
    source: "ai",
    label: "Estimation visuelle sans capteur de profondeur",
    supported: false,
    confidence: 0.35,
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
      label: "Estimation visuelle sans capteur de profondeur",
      supported: false,
      confidence: 0.3,
    };
  }
};
