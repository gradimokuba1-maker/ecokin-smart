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
  | "mixte"
  | "inconnu";

export type Severity = "faible" | "modere" | "critique";

export type RiskLevel = "faible" | "modere" | "eleve";

export type CameraCapability = "lidar" | "arcore" | "basic";

export type CompositionEntry = {
  material: WasteMaterial;
  percentage: number; // 0-100
};

export type Dimensions3D = {
  lengthM: number;
  widthM: number;
  heightAvgM: number;
  surfaceM2: number;
  volumeM3: number;
  confidence: number; // 0-1
};

export type WeightEstimate = {
  weightKg: number;
  weightTons: number;
  confidence: number; // 0-1
  densityUsed: number; // kg/m³
};

export type LocationInfo = {
  lat: number;
  lng: number;
  accuracy: number;
  commune: string;
  quartier?: string;
  adresse?: string;
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
  wasteAreaPercent: number; // % de l'image occupée par les déchets
  environmentDetected: string[]; // route, sol, bâtiments, arbres, etc.

  // Dimensions 3D
  dimensions: Dimensions3D;

  // Poids
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
  obstructionRisk: RiskLevel;

  // Métadonnées
  cameraCapability: CameraCapability;
  analysisConfidence: number; // 0-1
  description: string;
  recommendations: string[];

  // Statut
  status: "en_attente" | "assigne" | "en_cours" | "resolu";
};

// Densités moyennes des matériaux (kg/m³)
export const MATERIAL_DENSITIES: Record<WasteMaterial, number> = {
  plastique: 50,    // déchets plastiques compressés ~50-100 kg/m³
  carton: 80,       // carton compressé ~80-120 kg/m³
  papier: 100,      // papier ~100-150 kg/m³
  verre: 400,       // verre brisé ~400-600 kg/m³
  metal: 300,       // métal léger ~300-500 kg/m³
  organique: 350,   // déchets organiques ~350-500 kg/m³
  dangereux: 200,   // déchets dangereux ~200-400 kg/m³
  meuble: 60,       // meubles/encombrants ~60-100 kg/m³
  electronique: 150, // DEEE ~150-250 kg/m³
  construction: 500, // gravats ~500-800 kg/m³
  mixte: 200,       // mélange ~200-300 kg/m³
  inconnu: 150,     // estimation par défaut
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

export function calculateWeightFromVolume(
  volumeM3: number,
  composition: CompositionEntry[]
): WeightEstimate {
  let weightedDensity = 0;
  for (const entry of composition) {
    const density = MATERIAL_DENSITIES[entry.material] ?? MATERIAL_DENSITIES.inconnu;
    weightedDensity += density * (entry.percentage / 100);
  }
  const weightKg = volumeM3 * weightedDensity;
  const weightTons = weightKg / 1000;
  const confidence = composition.length > 0 ? 0.85 : 0.5;
  return {
    weightKg: Math.round(weightKg * 10) / 10,
    weightTons: Math.round(weightTons * 100) / 100,
    confidence,
    densityUsed: Math.round(weightedDensity),
  };
}