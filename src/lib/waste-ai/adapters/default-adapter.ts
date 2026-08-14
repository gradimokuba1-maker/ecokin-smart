import { detectWasteObjects, type DetectionResult } from "../detection";
import { segmentWasteAreas, type SegmentationResult } from "../segmentation";
import { estimateWasteVolume, type DepthEstimate } from "../volume-estimator";
import type { ModelAdapter } from "./types";
import { serverWasteAIAdapter } from "./server-adapter";

// Default adapter: in browser use the local adapter (YOLO + zero-shot). On server,
// prefer the server adapter when an API key is configured.
export const defaultWasteAIAdapter: ModelAdapter = {
  detect: async (imageDataUrl, options) => {
    const runningOnServer = typeof window === "undefined";
    const hasServerKey = typeof process !== "undefined" && Boolean(process.env.LOVABLE_API_KEY);
    if (runningOnServer && hasServerKey) return serverWasteAIAdapter.detect(imageDataUrl, options);
    return detectWasteObjects(imageDataUrl, {
      minConfidence: options?.minConfidence,
      modelType: options?.modelType ?? "yolo11",
      onProgress: options?.onProgress,
    });
  },

  segment: async (imageDataUrl, detections, options) => {
    const runningOnServer = typeof window === "undefined";
    const hasServerKey = typeof process !== "undefined" && Boolean(process.env.LOVABLE_API_KEY);
    if (runningOnServer && hasServerKey)
      return serverWasteAIAdapter.segment(imageDataUrl, detections, options);
    return segmentWasteAreas(imageDataUrl, detections, options?.onProgress);
  },

  estimateVolume: async (imageDataUrl, segments, options) => {
    const runningOnServer = typeof window === "undefined";
    const hasServerKey = typeof process !== "undefined" && Boolean(process.env.LOVABLE_API_KEY);
    if (runningOnServer && hasServerKey)
      return serverWasteAIAdapter.estimateVolume(imageDataUrl, segments, options);
    return estimateWasteVolume(imageDataUrl, segments, {
      focalLength: options?.focalLength,
      sensorWidth: options?.sensorWidth,
      sensorHeight: options?.sensorHeight,
      knownDistance: options?.knownDistance,
      depthData: options?.depthData,
    });
  },
};
