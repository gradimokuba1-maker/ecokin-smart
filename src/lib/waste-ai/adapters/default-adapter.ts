import { detectWasteObjects, type DetectionResult } from "../detection";
import { segmentWasteAreas, type SegmentationResult } from "../segmentation";
import { estimateWasteVolume, type DepthEstimate } from "../volume-estimator";
import type { ModelAdapter } from "./types";

export const defaultWasteAIAdapter: ModelAdapter = {
    detect: async (imageDataUrl, options) =>
        detectWasteObjects(imageDataUrl, {
            minConfidence: options?.minConfidence,
            modelType: options?.modelType ?? "yolo11",
            onProgress: options?.onProgress,
        }),

    segment: async (imageDataUrl, detections, options) =>
        segmentWasteAreas(imageDataUrl, detections, options?.onProgress),

    estimateVolume: async (imageDataUrl, segments, options) =>
        estimateWasteVolume(imageDataUrl, segments, {
            focalLength: options?.focalLength,
            sensorWidth: options?.sensorWidth,
            sensorHeight: options?.sensorHeight,
            knownDistance: options?.knownDistance,
            depthData: options?.depthData,
        }),
};
