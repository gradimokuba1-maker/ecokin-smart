/**
 * Orchestrateur client de l'analyse de quantification.
 *
 * Les modèles visuels s'exécutent localement, ce qui évite d'envoyer la photo
 * à un service tiers pour YOLO11, SAM 2 et Depth Anything. Seules les données
 * nécessaires à la création du signalement sont retournées à l'interface.
 */

import { quantifyWaste } from "./quantification-pipeline";
import { estimateDepthWithAI } from "./depth-acquisition";
import { mergeMultiViewCompositions } from "./multi-view";
import {
  calculatePriorityLevel,
  type CameraCapability,
  type CameraMetadata,
  type CompositionEntry,
  type LocationInfo,
  type RiskLevel,
  type WasteAnalysisResult,
  type WasteMaterial,
  type WasteObjectType,
} from "./types";

export type WasteCaptureForAnalysis = {
  imageDataUrl: string;
  additionalImages: string[];
  location: LocationInfo | null;
  cameraCapability: CameraCapability;
  depthData?: string;
  capturedAt: string;
  cameraMetadata?: CameraMetadata;
  captureMode: "single" | "multi" | "video";
};

const DISPLAY_LABELS: Record<WasteObjectType, string> = {
  plastiques: "Plastiques",
  bouteilles_pet: "Bouteilles PET",
  sacs_plastiques: "Sacs plastiques",
  cartons: "Cartons",
  papiers: "Papiers",
  canettes: "Canettes",
  metaux: "Métaux",
  verre: "Verre",
  organiques: "Déchets organiques",
  pneus: "Pneus",
  textiles: "Textiles",
  electroniques: "Déchets électroniques",
  gravats: "Gravats",
  menagers: "Déchets ménagers",
  autres: "Autres déchets",
};

function level(score: number): RiskLevel {
  if (score >= 0.68) return "eleve";
  if (score >= 0.36) return "modere";
  return "faible";
}

function locationFromCapture(capture: WasteCaptureForAnalysis): LocationInfo {
  if (capture.location) return capture.location;
  throw new Error("GPS location is required for waste analysis");
}

function recommendationFor(risks: { health: RiskLevel; environmental: RiskLevel; pollution: RiskLevel; fire: RiskLevel; flood: boolean }) {
  const recommendations = ["Transmettre le signalement à l’équipe de collecte compétente."];
  if (risks.health === "eleve") recommendations.unshift("Prévoir des EPI et isoler la zone avant la collecte.");
  if (risks.pollution === "eleve") recommendations.unshift("Éviter tout écoulement vers les caniveaux et sécuriser les déchets dangereux.");
  if (risks.fire === "eleve") recommendations.unshift("Éloigner les sources de chaleur et demander une vérification incendie.");
  if (risks.flood) recommendations.push("Dégager le caniveau ou l’accès hydraulique en priorité.");
  return recommendations.slice(0, 4);
}

/** Calcule les risques métier à partir de la composition, du volume et de la zone. */
function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function labelForMaterial(material: WasteMaterial) {
  if (material === "plastique") return "Plastiques";
  if (material === "carton") return "Cartons";
  if (material === "papier") return "Papiers";
  if (material === "metal") return "Metaux";
  if (material === "organique") return "Dechets organiques";
  if (material === "construction") return "Gravats";
  if (material === "electronique") return "Dechets electroniques";
  if (material === "textile") return "Textiles";
  if (material === "pneu") return "Pneus";
  if (material === "menager") return "Dechets menagers";
  if (material === "verre") return "Verre";
  return "Dechets mixtes";
}

function assessRisks(composition: { material: string; percentage: number }[], volumeM3: number, wasteAreaPercent: number) {
  const share = (material: string) => (composition.find((entry) => entry.material === material)?.percentage ?? 0) / 100;
  const hazardous = share("dangereux") + share("electronique");
  const plastic = share("plastique");
  const organic = share("organique") + share("menager");
  const construction = share("construction");
  const health = level(organic * 0.8 + hazardous + Math.min(0.35, volumeM3 / 30));
  const environmental = level(plastic * 0.55 + hazardous + construction * 0.25 + Math.min(0.25, wasteAreaPercent / 300));
  const pollution = level(hazardous + plastic * 0.45 + Math.min(0.25, volumeM3 / 40));
  const fire = level(hazardous * 0.8 + plastic * 0.25 + share("textile") * 0.2 + share("pneu") * 0.35);
  const obstruction = level(Math.min(1, wasteAreaPercent / 100) * 0.65 + Math.min(0.35, volumeM3 / 20));
  const floodRisk = obstruction === "eleve" || (wasteAreaPercent > 55 && volumeM3 > 2);
  return { health, environmental, pollution, fire, obstruction, floodRisk };
}

/**
 * Exécute YOLO11, SAM 2, Depth Anything/LiDAR, le calcul volumétrique et les
 * règles de risque pour produire un résultat directement affichable.
 */
export async function analyzeWasteCapture(
  capture: WasteCaptureForAnalysis,
  onProgress?: (message: string) => void,
): Promise<WasteAnalysisResult> {
  let depthData = capture.depthData;
  if (!depthData) {
    const depth = await estimateDepthWithAI(capture.imageDataUrl, onProgress);
    depthData = depth.depthData;
  }

  let quantified = await quantifyWaste(capture.imageDataUrl, {
    depthData,
    detectionModelType: "yolo11",
    focalLength: capture.cameraMetadata?.focalLengthMm,
    sensorWidth: capture.cameraMetadata?.sensorWidthMm,
    sensorHeight: capture.cameraMetadata?.sensorHeightMm,
    onProgress,
  });

  // Agrégation multi-vues : on analyse chaque image supplémentaire et on
  // combine les volumes par catégorie pour lisser les erreurs de perspective.
  let multiViews = 1;
  if (capture.additionalImages.length > 0) {
    const extraResults = await Promise.all(
      capture.additionalImages.map((extra) =>
        quantifyWaste(extra, {
          depthData,
          detectionModelType: "yolo11",
          focalLength: capture.cameraMetadata?.focalLengthMm,
          sensorWidth: capture.cameraMetadata?.sensorWidthMm,
          sensorHeight: capture.cameraMetadata?.sensorHeightMm,
          onProgress,
        }).catch(() => null),
      ),
    );
    const valid = extraResults.filter((r): r is NonNullable<typeof r> => r !== null);
    if (valid.length > 0) {
      multiViews = 1 + valid.length;
      const combined = [...valid, quantified];
      const totalVolume = combined.reduce((sum, r) => sum + r.volume.m3, 0);
      const avgVolume = totalVolume / combined.length;
      const avgConfidence = combined.reduce((sum, r) => sum + r.confidence.overall, 0) / combined.length;
      const avgWeight = combined.reduce((sum, r) => sum + r.weight.weightKg, 0) / combined.length;
      const avgDensity = combined.reduce((sum, r) => sum + r.weight.densityKgM3, 0) / combined.length;
      const avgArea = combined.reduce((sum, r) => sum + r.metadata.wasteAreaPercent, 0) / combined.length;
      const mergedComposition = mergeMultiViewCompositions(combined.map((r) => r.categories.composition));
      const sorted = [...mergedComposition].sort((a, b) => b.percentage - a.percentage);
      const mainCategory = sorted[0]?.material ?? quantified.categories.main;
      const secondaryCategory = sorted.length > 1 ? sorted[1].material : undefined;
      quantified = {
        ...quantified,
        categories: { main: mainCategory, secondary: secondaryCategory, composition: sorted },
        volume: { ...quantified.volume, m3: avgVolume, confidence: avgConfidence, dimensions: { ...quantified.volume.dimensions, volumeM3: avgVolume } },
        weight: { ...quantified.weight, weightKg: avgWeight, weightTons: avgWeight / 1000, densityKgM3: avgDensity },
        metadata: { ...quantified.metadata, wasteAreaPercent: Math.round(avgArea), modelsUsed: { ...quantified.metadata.modelsUsed } },
        confidence: { ...quantified.confidence, overall: avgConfidence },
      };
    }
  }
  const objectsByType = new Map<WasteObjectType, { score: number; confidence: number; count: number }>();
  for (const object of quantified.objects) {
    const current = objectsByType.get(object.displayLabel) ?? { score: 0, confidence: 0, count: 0 };
    current.count += 1;
    current.score += object.area * object.confidence;
    current.confidence += object.confidence;
    objectsByType.set(object.displayLabel, current);
  }
  const detectedObjects = Array.from(objectsByType, ([type, value]) => ({
    label: DISPLAY_LABELS[type],
    score: value.score,
    confidence: Math.round((value.confidence / value.count) * 100) / 100,
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ label, confidence }) => ({ label, confidence }));
  if (detectedObjects.length === 0) {
    for (const entry of quantified.categories.composition.slice(0, 3)) {
      if (entry.material === "inconnu") continue;
      detectedObjects.push({
        label: labelForMaterial(entry.material),
        confidence: round(Math.max(0.25, quantified.confidence.detection || quantified.confidence.overall * 0.75), 2),
      });
    }
  }
  const composition: CompositionEntry[] = quantified.categories.composition.map((entry) => {
    const ratio = entry.percentage / 100;
    const volumeM3 = round(quantified.volume.m3 * ratio, 3);
    const surfaceM2 = round(quantified.volume.dimensions.surfaceM2 * ratio, 2);
    return {
      ...entry,
      surfaceM2,
      volumeM3,
      confidence: round(Math.max(0.15, quantified.confidence.overall * (0.75 + ratio * 0.25)), 2),
    };
  });
  const risks = assessRisks(quantified.categories.composition, quantified.volume.m3, quantified.metadata.wasteAreaPercent);
  const priorityScore = Math.min(100, Math.round(
    (risks.health === "eleve" ? 25 : risks.health === "modere" ? 13 : 4) +
    (risks.environmental === "eleve" ? 20 : risks.environmental === "modere" ? 10 : 3) +
    (risks.pollution === "eleve" ? 18 : risks.pollution === "modere" ? 8 : 2) +
    (risks.fire === "eleve" ? 15 : risks.fire === "modere" ? 7 : 0) +
    (risks.floodRisk ? 17 : 0) +
    (quantified.volume.m3 > 10 ? 12 : quantified.volume.m3 > 3 ? 7 : 2),
  ));
  const location = locationFromCapture(capture);
  const mainLabel = DISPLAY_LABELS[quantified.objects[0]?.displayLabel ?? "autres"];

  return {
    id: `ECO-${Date.now().toString(36).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    photoUrl: capture.imageDataUrl,
    model3DAvailable: quantified.metadata.totalSegments > 0,
    composition,
    mainCategory: quantified.categories.main,
    secondaryCategory: quantified.categories.secondary,
    detectedObjects,
    wasteAreaPercent: quantified.metadata.wasteAreaPercent,
    environmentDetected: ["sol", "zone urbaine"],
    dimensions: quantified.volume.dimensions,
    location,
    priorityScore,
    priorityLevel: calculatePriorityLevel(priorityScore),
    interventionUrgent: priorityScore >= 80,
    floodRisk: risks.floodRisk,
    healthRisk: risks.health,
    environmentalRisk: risks.environmental,
    pollutionRisk: risks.pollution,
    fireRisk: risks.fire,
    obstructionRisk: risks.obstruction,
    cameraCapability: capture.cameraCapability,
    cameraMetadata: capture.cameraMetadata,
    methods: {
      detection: quantified.metadata.modelsUsed.detection,
      segmentation: quantified.metadata.modelsUsed.segmentation,
      volume: quantified.metadata.modelsUsed.volume,
      captureMode: capture.captureMode,
      viewsAnalyzed: multiViews,
    },
    analysisConfidence: quantified.confidence.overall,
    description: `${mainLabel} détectés sur environ ${quantified.metadata.wasteAreaPercent}% de l’image. Volume estimé : ${quantified.volume.m3} m³ via ${quantified.metadata.modelsUsed.volume}.`,
    recommendations: recommendationFor(risks),
    weight: quantified.weight,
    status: "en_attente",
  };
}
