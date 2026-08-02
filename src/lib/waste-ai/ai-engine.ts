import type { CaptureResult } from "@/components/waste-ai/SmartWasteCamera";
import { quantifyWaste } from "./quantification-pipeline";
import {
  type WasteAnalysisResult,
  type Dimensions3D,
  type WasteMaterial,
  type CameraCapability,
} from "./types";

export type AIModelKind = "detection" | "segmentation" | "depth" | "classification";

export type SensorSnapshot = {
  camera: boolean;
  gps: boolean;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  date?: string;
  time?: string;
  orientation?: string;
  accelerometer: boolean;
  gyroscope: boolean;
  depthApi: boolean;
  lidar: boolean;
  offlineMode: boolean;
};

export type AIDetectedObject = {
  category: string;
  material: WasteMaterial;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
  segmentationMask: string;
  dimensions: Dimensions3D;
  surface: number;
  volume: number;
};

export type AIEngineEnvelope = {
  reportId: string;
  sensors: SensorSnapshot;
  objects: AIDetectedObject[];
  summary: {
    mainCategory: WasteMaterial;
    confidence: number;
    wasteAreaPercent: number;
    methods: {
      detection: string;
      segmentation: string;
      depth: string;
      classification: string;
    };
  };
  createdAt: string;
};

type SecureAIStore = {
  [reportId: string]: AIEngineEnvelope;
};

type GlobalWithAIStore = typeof globalThis & {
  __ecokin_ai_store__?: SecureAIStore;
};

function getAIStore(): SecureAIStore {
  const globalObject = globalThis as GlobalWithAIStore;
  if (!globalObject.__ecokin_ai_store__) {
    globalObject.__ecokin_ai_store__ = {};
  }
  return globalObject.__ecokin_ai_store__;
}

function normalizeMaterial(material: WasteMaterial | string): WasteMaterial {
  if (
    material === "plastique" ||
    material === "carton" ||
    material === "papier" ||
    material === "verre" ||
    material === "metal" ||
    material === "organique" ||
    material === "dangereux" ||
    material === "meuble" ||
    material === "electronique" ||
    material === "construction" ||
    material === "textile" ||
    material === "pneu" ||
    material === "menager" ||
    material === "mixte" ||
    material === "inconnu"
  ) {
    return material as WasteMaterial;
  }
  return "inconnu";
}

export function buildSensorSnapshot(capture: CaptureResult | null): SensorSnapshot {
  const now = new Date();
  const q = typeof navigator !== "undefined" ? navigator : undefined;
  const cameraEnabled = Boolean(capture?.imageDataUrl || q?.mediaDevices);

  const gpsEnabled = Boolean(capture?.location?.lat != null && capture?.location?.lng != null);
  const depthApiEnabled = Boolean(
    typeof window !== "undefined" && "depth" in window && typeof window.depth !== "undefined",
  );
  const lidarEnabled = capture?.cameraCapability === "lidar";

  return {
    camera: cameraEnabled,
    gps: gpsEnabled,
    latitude: capture?.location?.lat,
    longitude: capture?.location?.lng,
    altitude: capture?.location?.altitudeM,
    date: now.toISOString().slice(0, 10),
    time: now.toISOString().slice(11, 19),
    orientation: capture?.cameraCapability === "arcore" ? "AR Core" : "camera",
    accelerometer: false,
    gyroscope: false,
    depthApi: depthApiEnabled,
    lidar: lidarEnabled,
    offlineMode: typeof navigator !== "undefined" && !navigator.onLine,
  };
}

export async function runServerWasteAIEngine(
  reportId: string,
  capture: CaptureResult,
  analysisResult?: WasteAnalysisResult,
): Promise<AIEngineEnvelope> {
  const sensors = buildSensorSnapshot(capture);
  const quantification = await quantifyWaste(capture.imageDataUrl, {
    depthData: capture.depthData,
    detectionModelType: "yolo11",
    onProgress: () => undefined,
  }).catch(() => {
    return null;
  });

  const objectList: AIDetectedObject[] = [];
  if (quantification) {
    objectList.push(
      ...quantification.objects.map((object, index) => ({
        category: object.displayLabel ?? object.label,
        material: normalizeMaterial(
          quantification.categories.composition[index]?.material ?? quantification.categories.main,
        ),
        confidence: object.confidence,
        boundingBox: {
          x: object.bbox[0],
          y: object.bbox[1],
          width: object.bbox[2] - object.bbox[0],
          height: object.bbox[3] - object.bbox[1],
        },
        segmentationMask: `mask-${reportId}-${index}`,
        dimensions: quantification.volume.dimensions,
        surface: quantification.volume.dimensions.surfaceM2,
        volume: quantification.volume.dimensions.volumeM3,
      })),
    );
  }

  const fallbackObjects: AIDetectedObject[] = analysisResult
    ? [
        {
          category: analysisResult.mainCategory,
          material: normalizeMaterial(analysisResult.mainCategory),
          confidence: analysisResult.analysisConfidence,
          boundingBox: { x: 0, y: 0, width: 1, height: 1 },
          segmentationMask: `mask-${reportId}-fallback`,
          dimensions: analysisResult.dimensions,
          surface: analysisResult.dimensions.surfaceM2,
          volume: analysisResult.dimensions.volumeM3,
        },
      ]
    : [];

  const envelope: AIEngineEnvelope = {
    reportId,
    sensors,
    objects: objectList.length > 0 ? objectList : fallbackObjects,
    summary: {
      mainCategory: analysisResult?.mainCategory ?? "mixte",
      confidence: analysisResult?.analysisConfidence ?? quantification?.confidence.overall ?? 0.4,
      wasteAreaPercent:
        analysisResult?.wasteAreaPercent ?? quantification?.metadata.wasteAreaPercent ?? 0,
      methods: {
        detection: quantification?.metadata.modelsUsed.detection ?? "yolo11",
        segmentation: quantification?.metadata.modelsUsed.segmentation ?? "sam2",
        depth: quantification?.metadata.modelsUsed.volume ?? "depth-api",
        classification: analysisResult?.mainCategory ? "classification" : "fallback",
      },
    },
    createdAt: new Date().toISOString(),
  };

  getAIStore()[reportId] = envelope;
  return envelope;
}

export function getServerAIAnalysis(reportId: string): AIEngineEnvelope | undefined {
  return getAIStore()[reportId];
}

export type ModelVersionRecord = {
  id: string;
  kind: AIModelKind;
  version: string;
  status: "draft" | "ready";
  createdAt: string;
  datasetSize: number;
};

const MODEL_VERSION_STORE_KEY = "__ecokin_model_versions__";

type GlobalWithModelVersions = typeof globalThis & {
  [MODEL_VERSION_STORE_KEY]?: ModelVersionRecord[];
};

function getModelVersionStore(): ModelVersionRecord[] {
  const globalObject = globalThis as GlobalWithModelVersions;
  if (!globalObject[MODEL_VERSION_STORE_KEY]) {
    globalObject[MODEL_VERSION_STORE_KEY] = [];
  }
  return globalObject[MODEL_VERSION_STORE_KEY]!;
}

export function registerModelVersion(
  kind: AIModelKind,
  version: string,
  datasetSize: number,
): ModelVersionRecord {
  const record: ModelVersionRecord = {
    id: `model-${kind}-${Date.now().toString(36)}`,
    kind,
    version,
    status: "ready",
    createdAt: new Date().toISOString(),
    datasetSize,
  };
  getModelVersionStore().push(record);
  return record;
}

export function listModelVersions(): ModelVersionRecord[] {
  return getModelVersionStore();
}
