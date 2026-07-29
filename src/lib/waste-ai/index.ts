// EcoKin Smart — Waste AI Quantification System
// Point d'entrée unifié pour le système de quantification intelligent
//
// Modules:
// - detection.ts      → YOLOv8/YOLO11 detection (bounding boxes, classes, confidence)
// - segmentation.ts   → SAM 2 segmentation (masks, contours, zones)
// - volume-estimator.ts → Depth estimation & volume calculation
// - types.ts          → Types, densities, weight calculation
// - quantification-pipeline.ts → Pipeline orchestrator
// - analysis.functions.ts → Server functions (existing integration)

export { detectWasteObjects, calculateCompositionFromDetections } from "./detection";
export type { BoundingBox, DetectedObject, DetectionResult } from "./detection";

export { segmentWasteAreas } from "./segmentation";
export type { SegmentMask, SegmentationResult } from "./segmentation";

export { estimateWasteVolume, findReferenceObjects } from "./volume-estimator";
export type { DepthEstimate } from "./volume-estimator";

export { quantifyWaste, quickQuantify } from "./quantification-pipeline";
export type { QuantificationResult, QuantificationOptions } from "./quantification-pipeline";

export {
  MATERIAL_DENSITIES,
  calculateWeightFromVolume,
  calculatePriorityLevel,
  PRIORITY_THRESHOLDS,
} from "./types";
export type {
  WasteMaterial,
  Severity,
  RiskLevel,
  CameraCapability,
  CompositionEntry,
  Dimensions3D,
  WeightEstimate,
  LocationInfo,
  WasteAnalysisResult,
} from "./types";

export { analyzeWastePhotoAdvanced } from "./analysis.functions";
export {
  detectDeviceCapability,
  requestCameraPermission,
  requestGPSPermission,
  estimateVolumeFromImage,
} from "./depth-analyzer";
export type { DeviceCapability } from "./depth-analyzer";
export { requestGPSPosition, buildLocationInfo, haversineDistance } from "./gps-location";
export type { GPSState } from "./gps-location";
