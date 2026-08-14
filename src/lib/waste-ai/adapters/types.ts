import type { BoundingBox } from "../detection";
import type { WasteMaterial, WasteObjectType } from "../types";
import type { SegmentationResult, SegmentMask } from "../segmentation";
import type { DetectionResult } from "../detection";
import type { DepthEstimate } from "../volume-estimator";

export type AdapterDetectionHint = {
  bbox: BoundingBox;
  label: WasteMaterial;
  displayLabel?: WasteObjectType;
  confidence: number;
};

export type ModelAdapter = {
  detect: (
    imageDataUrl: string,
    options?: {
      minConfidence?: number;
      modelType?: "yolov8" | "yolo11";
      onProgress?: (message: string) => void;
      signal?: AbortSignal;
    },
  ) => Promise<DetectionResult>;
  segment: (
    imageDataUrl: string,
    detections: AdapterDetectionHint[],
    options?: {
      onProgress?: (message: string) => void;
      signal?: AbortSignal;
    },
  ) => Promise<SegmentationResult>;
  estimateVolume: (
    imageDataUrl: string,
    segments: SegmentMask[],
    options?: {
      focalLength?: number;
      sensorWidth?: number;
      sensorHeight?: number;
      knownDistance?: number;
      depthData?: string;
      signal?: AbortSignal;
    },
  ) => Promise<DepthEstimate>;
};
