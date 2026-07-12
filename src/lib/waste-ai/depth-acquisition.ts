// Acquisition de profondeur pour la capture intelligente.
// Le Web n'expose pas l'identifiant commercial d'un capteur : un mode "lidar"
// signifie donc qu'un capteur de profondeur natif a été réellement exposé via WebXR.

export type DepthSource = "lidar" | "ai" | "unavailable";

export type DepthAcquisition = {
  source: DepthSource;
  label: string;
  detail: string;
  depthData?: string;
  confidence: number;
};

type XRDepthInformationLike = {
  width: number;
  height: number;
  getDepthInMeters?: (x: number, y: number) => number;
};

type XRFrameLike = {
  getViewerPose: (referenceSpace: unknown) => { views: unknown[] } | null;
  getDepthInformation?: (view: unknown) => XRDepthInformationLike | null;
};

type XRSessionLike = {
  depthUsage?: string;
  requestReferenceSpace: (type: "local") => Promise<unknown>;
  requestAnimationFrame: (callback: (time: number, frame: XRFrameLike) => void) => number;
  end: () => Promise<void>;
};

type XRSystemLike = {
  isSessionSupported: (mode: "immersive-ar") => Promise<boolean>;
  requestSession: (
    mode: "immersive-ar",
    options: {
      requiredFeatures: string[];
      depthSensing: {
        usagePreference: string[];
        dataFormatPreference: string[];
        depthTypeRequest: string[];
        matchDepthView: boolean;
      };
    },
  ) => Promise<XRSessionLike>;
};

function asXRSystem(): XRSystemLike | null {
  if (typeof navigator === "undefined") return null;
  return ((navigator as Navigator & { xr?: XRSystemLike }).xr ?? null);
}

function compactNativeDepth(depth: XRDepthInformationLike): string | undefined {
  if (!depth.getDepthInMeters || depth.width < 1 || depth.height < 1) return undefined;

  const targetWidth = Math.min(64, depth.width);
  const targetHeight = Math.min(48, depth.height);
  const map: number[][] = [];
  let validValues = 0;

  for (let y = 0; y < targetHeight; y += 1) {
    const sourceY = Math.min(depth.height - 1, Math.floor((y / targetHeight) * depth.height));
    const row: number[] = [];
    for (let x = 0; x < targetWidth; x += 1) {
      const sourceX = Math.min(depth.width - 1, Math.floor((x / targetWidth) * depth.width));
      const meters = depth.getDepthInMeters(sourceX, sourceY);
      const value = Number.isFinite(meters) && meters > 0 ? Math.round(meters * 100) / 100 : 0;
      if (value > 0) validValues += 1;
      row.push(value);
    }
    map.push(row);
  }

  if (validValues < (targetWidth * targetHeight) / 10) return undefined;

  return JSON.stringify({
    source: "native-lidar",
    metric: true,
    width: targetWidth,
    height: targetHeight,
    depthMap: map,
    capturedAt: new Date().toISOString(),
  });
}

/**
 * Vérifie réellement la disponibilité d'une profondeur native WebXR et lit un
 * court échantillon CPU si le navigateur le permet. Aucun user-agent n'est
 * utilisé : iOS/Android ne suffisent pas à prouver la présence d'un LiDAR.
 */
export async function acquireNativeDepth(): Promise<DepthAcquisition> {
  const xr = asXRSystem();
  if (!xr) {
    return {
      source: "ai",
      label: "Modèle IA de profondeur",
      detail: "Aucun capteur de profondeur natif exposé par ce navigateur.",
      confidence: 0.55,
    };
  }

  try {
    if (!(await xr.isSessionSupported("immersive-ar"))) {
      return {
        source: "ai",
        label: "Modèle IA de profondeur",
        detail: "La réalité augmentée n'est pas disponible sur cet appareil.",
        confidence: 0.55,
      };
    }

    const session = await xr.requestSession("immersive-ar", {
      requiredFeatures: ["depth-sensing"],
      depthSensing: {
        usagePreference: ["cpu-optimized", "gpu-optimized"],
        dataFormatPreference: ["luminance-alpha", "float32", "unsigned-short"],
        depthTypeRequest: ["raw", "smooth"],
        matchDepthView: true,
      },
    });

    const referenceSpace = await session.requestReferenceSpace("local");
    const depthData = await new Promise<string | undefined>((resolve) => {
      let settled = false;
      const finish = (value?: string) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        void session.end().catch(() => undefined);
        resolve(value);
      };
      const timeout = window.setTimeout(() => finish(), 1800);

      session.requestAnimationFrame((_time, frame) => {
        try {
          const view = frame.getViewerPose(referenceSpace)?.views[0];
          const depth = view ? frame.getDepthInformation?.(view) : null;
          finish(depth ? compactNativeDepth(depth) : undefined);
        } catch {
          finish();
        }
      });
    });

    return {
      source: depthData ? "lidar" : "ai",
      label: depthData ? "Capteur de profondeur natif" : "Modèle IA de profondeur",
      detail: depthData
        ? "Carte métrique native acquise (LiDAR ou capteur équivalent)."
        : "Capteur natif détecté, mais aucune carte de profondeur CPU exploitable n'a été fournie.",
      depthData,
      confidence: depthData ? 0.9 : 0.55,
    };
  } catch {
    return {
      source: "ai",
      label: "Modèle IA de profondeur",
      detail: "Capteur de profondeur natif indisponible ou refusé.",
      confidence: 0.55,
    };
  }
}

type DepthEstimator = (image: string) => Promise<{
  predicted_depth: { data: Float32Array | number[]; dims: number[] };
}>;

let estimatorPromise: Promise<DepthEstimator> | null = null;

function getEstimator(onProgress?: (message: string) => void): Promise<DepthEstimator> {
  if (!estimatorPromise) {
    estimatorPromise = import("@huggingface/transformers").then(async ({ pipeline }) => {
      onProgress?.("Téléchargement du modèle IA de profondeur…");
      return (await pipeline("depth-estimation", "onnx-community/depth-anything-v2-small", {
        dtype: "q8",
        progress_callback: (progress: { status?: string; file?: string }) => {
          if (progress.status === "progress" || progress.status === "done") {
            onProgress?.("Préparation du modèle IA de profondeur…");
          }
        },
      })) as unknown as DepthEstimator;
    });
  }
  return estimatorPromise;
}

function compactRelativeDepth(values: Float32Array | number[], dims: number[]): string | undefined {
  const height = dims.at(-2) ?? 0;
  const width = dims.at(-1) ?? 0;
  if (width < 1 || height < 1 || values.length < width * height) return undefined;

  const targetWidth = Math.min(64, width);
  const targetHeight = Math.min(48, height);
  const map: number[][] = [];
  let validValues = 0;

  for (let y = 0; y < targetHeight; y += 1) {
    const sourceY = Math.min(height - 1, Math.floor((y / targetHeight) * height));
    const row: number[] = [];
    for (let x = 0; x < targetWidth; x += 1) {
      const sourceX = Math.min(width - 1, Math.floor((x / targetWidth) * width));
      const value = Number(values[sourceY * width + sourceX]);
      const depth = Number.isFinite(value) && value > 0 ? Math.round(value * 1000) / 1000 : 0;
      if (depth > 0) validValues += 1;
      row.push(depth);
    }
    map.push(row);
  }

  if (validValues === 0) return undefined;
  return JSON.stringify({
    source: "ai-monocular-depth-anything-v2-small",
    metric: false,
    width: targetWidth,
    height: targetHeight,
    depthMap: map,
    capturedAt: new Date().toISOString(),
  });
}

/**
 * Estimation monoculaire de profondeur pour les appareils sans carte native.
 * La sortie est relative (et non métrique) : elle sera calibrée par le module
 * de quantification dans l'étape suivante du projet.
 */
export async function estimateDepthWithAI(
  imageDataUrl: string,
  onProgress?: (message: string) => void,
): Promise<DepthAcquisition> {
  try {
    const estimator = await getEstimator(onProgress);
    onProgress?.("Estimation IA de la profondeur…");
    const output = await estimator(imageDataUrl);
    const depthData = compactRelativeDepth(output.predicted_depth.data, output.predicted_depth.dims);
    if (!depthData) throw new Error("Carte de profondeur vide");
    return {
      source: "ai",
      label: "Modèle IA de profondeur",
      detail: "Carte de profondeur relative estimée par Depth Anything V2.",
      depthData,
      confidence: 0.65,
    };
  } catch (error) {
    console.warn("Depth AI unavailable", error);
    return {
      source: "unavailable",
      label: "Profondeur non disponible",
      detail: "Le modèle IA n'a pas pu être chargé. La photo est conservée pour l'analyse standard.",
      confidence: 0,
    };
  }
}
