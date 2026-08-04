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
        },
    ) => Promise<DepthEstimate>;
};
