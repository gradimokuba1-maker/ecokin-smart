// EcoKin Smart — Types pour l'analyse IA avancée des dépôts sauvages
// Composition, quantification 3D, poids, priorité

export type WasteMaterial =
  | "plastique"
  | "carton"
  | "papier"
  | "verre"
  | "metal"
  | "organique"
  | "dangereux"
  | "meuble"
  | "electronique"
  | "construction"
  | "textile"
  | "pneu"
  | "menager"
  | "mixte"
  | "inconnu";

/** Catégories visibles, plus précises que la famille de matériau. */
export type WasteObjectType =
  | "plastiques"
  | "bouteilles_pet"
  | "sacs_plastiques"
  | "cartons"
  | "papiers"
  | "canettes"
  | "metaux"
  | "verre"
  | "organiques"
  | "pneus"
  | "textiles"
  | "electroniques"
  | "gravats"
  | "menagers"
  | "autres";

export type Severity = "faible" | "modere" | "critique";

export type RiskLevel = "faible" | "modere" | "eleve";

export type CameraCapability = "lidar" | "arcore" | "basic";

export type CameraMetadata = {
  widthPx: number;
  heightPx: number;
  facingMode?: string;
  deviceId?: string;
  focalLengthMm?: number;
  sensorWidthMm?: number;
  sensorHeightMm?: number;
};

export type CompositionEntry = {
  material: WasteMaterial;
  percentage: number; // 0-100
  surfaceM2?: number;
  volumeM3?: number;
  confidence?: number; // 0-1
};

export type Dimensions3D = {
  lengthM: number;
  widthM: number;
  heightAvgM: number;
  surfaceM2: number;
  volumeM3: number;
  confidence: number; // 0-1
  uncertaintyPercent: number;
};

export type LocationInfo = {
  lat: number;
  lng: number;
  accuracy: number;
  commune: string;
  altitudeM?: number;
  capturedAt?: string;
  quartier?: string;
  adresse?: string;
};

export type DetectedWasteObject = {
  label: string;
  confidence: number;
  count?: number;
};

export type WeightEstimate = {
  weightKg: number;
  weightTons: number;
  /** Densité apparente pondérée du dépôt, et non densité du matériau massif. */
  densityKgM3: number;
  minWeightKg: number;
  maxWeightKg: number;
  confidence: number;
  uncertaintyPercent: number;
};

export type AnalysisMethodMetadata = {
  detection: "yolo11" | "yolo11+zero-shot" | "unavailable";
  segmentation: "sam2" | "bounding-box" | "unavailable";
  volume: "lidar" | "ai-depth" | "depth-api" | "perspective" | "reference" | "estimation";
  captureMode: "single" | "multi" | "video";
  viewsAnalyzed: number;
};

export type WasteAnalysisResult = {
  // Identification
  id: string;
  timestamp: string;

  // Photo & 3D
  photoUrl: string;
  model3DAvailable: boolean;

  // Composition
  composition: CompositionEntry[];
  mainCategory: WasteMaterial;
  secondaryCategory?: WasteMaterial;

  // Segmentation
  detectedObjects: DetectedWasteObject[];
  wasteAreaPercent: number; // % de l'image occupée par les déchets
  environmentDetected: string[]; // route, sol, bâtiments, arbres, etc.

  // Dimensions 3D
  dimensions: Dimensions3D;

  // Masse estimée à partir du volume et des densités apparentes par matériau
  weight: WeightEstimate;

  // Localisation
  location: LocationInfo;

  // Priorité
  priorityScore: number; // 0-100
  priorityLevel: "faible" | "moyen" | "eleve" | "critique";
  interventionUrgent: boolean;

  // Risques
  floodRisk: boolean;
  healthRisk: RiskLevel;
  environmentalRisk: RiskLevel;
  pollutionRisk: RiskLevel;
  fireRisk: RiskLevel;
  obstructionRisk: RiskLevel;

  // Métadonnées
  cameraCapability: CameraCapability;
  cameraMetadata?: CameraMetadata;
  methods: AnalysisMethodMetadata;
  analysisConfidence: number; // 0-1
  description: string;
  recommendations: string[];

  // Statut
  status: "en_attente" | "assigne" | "en_cours" | "resolu";
};

// Seuils de priorité
export const PRIORITY_THRESHOLDS = {
  critique: 80,
  eleve: 60,
  moyen: 40,
  faible: 0,
};

export function calculatePriorityLevel(score: number): WasteAnalysisResult["priorityLevel"] {
  if (score >= 80) return "critique";
  if (score >= 60) return "eleve";
  if (score >= 40) return "moyen";
  return "faible";
}
