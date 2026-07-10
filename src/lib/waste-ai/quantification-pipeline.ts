// EcoKin Smart — Pipeline de quantification intelligent
// Orchestre la détection YOLO, la segmentation SAM 2, l'estimation de volume
// et le calcul de poids via les coefficients de densité
//
// Retourne: catégories de déchets, volume estimé, poids estimé, score de confiance

import type { WasteMaterial, CompositionEntry, Dimensions3D, WeightEstimate } from "./types";
import { MATERIAL_DENSITIES, calculateWeightFromVolume } from "./types";
import { detectWasteObjects, calculateCompositionFromDetections, type DetectionResult } from "./detection";
import { segmentWasteAreas, type SegmentationResult, type SegmentMask } from "./segmentation";
import { estimateWasteVolume, type DepthEstimate } from "./volume-estimator";

export type QuantificationResult = {
  // Catégories détectées
  categories: {
    main: WasteMaterial;
    secondary?: WasteMaterial;
    composition: CompositionEntry[];
  };

  // Volume estimé
  volume: {
    m3: number;
    confidence: number;
    method: "lidar" | "depth-api" | "perspective" | "reference" | "estimation";
    dimensions: Dimensions3D;
  };

  // Poids estimé
  weight: WeightEstimate;

  // Scores de confiance
  confidence: {
    detection: number;     // confiance de la détection YOLO
    segmentation: number;  // confiance de la segmentation SAM 2
    volume: number;        // confiance de l'estimation de volume
    overall: number;       // confiance globale combinée
  };

  // Métadonnées
  metadata: {
    totalObjectsDetected: number;
    totalSegments: number;
    wasteAreaPercent: number;
    processingTimeMs: number;
    modelsUsed: {
      detection: DetectionResult["modelUsed"];
      segmentation: SegmentationResult["modelUsed"];
      volume: DepthEstimate["method"];
    };
  };
};

export type QuantificationOptions = {
  // Options de détection
  detectionMinConfidence?: number;
  detectionModelType?: "yolov8" | "yolo11";

  // Options de profondeur
  focalLength?: number;
  sensorWidth?: number;
  sensorHeight?: number;
  knownDistance?: number;
  depthData?: string; // JSON stringified depth data

  // Options de densité
  densityOverrides?: Partial<Record<WasteMaterial, number>>;
};

/**
 * Pipeline principal de quantification intelligent
 * Exécute séquentiellement: Détection → Segmentation → Volume → Poids
 */
export async function quantifyWaste(
  imageDataUrl: string,
  options?: QuantificationOptions
): Promise<QuantificationResult> {
  const startTime = performance.now();

  // Étape 1: DÉTECTION YOLOv8/YOLO11
  const detectionResult = await detectWasteObjects(imageDataUrl, {
    minConfidence: options?.detectionMinConfidence ?? 0.35,
    modelType: options?.detectionModelType ?? "yolo11",
  });

  // Calculer la composition à partir des détections
  const compositionFromDetections = calculateCompositionFromDetections(detectionResult.objects);

  // Étape 2: SEGMENTATION SAM 2
  const detectionHints = detectionResult.objects.map(obj => ({
    bbox: obj.bbox,
    label: obj.label,
    confidence: obj.confidence,
  }));

  const segmentationResult = await segmentWasteAreas(imageDataUrl, detectionHints);

  // Étape 3: ESTIMATION DE VOLUME
  const volumeResult = await estimateWasteVolume(imageDataUrl, segmentationResult.segments, {
    focalLength: options?.focalLength,
    sensorWidth: options?.sensorWidth,
    sensorHeight: options?.sensorHeight,
    knownDistance: options?.knownDistance,
    depthData: options?.depthData,
  });

  // Étape 4: CALCUL DU POIDS
  // Fusionner la composition des détections et des segmentations
  const mergedComposition = mergeComposition(
    compositionFromDetections,
    segmentationResult.segments
  );

  // Appliquer les surcharges de densité si fournies
  if (options?.densityOverrides) {
    applyDensityOverrides(options.densityOverrides);
  }

  const weight = calculateWeightFromVolume(volumeResult.dimensions.volumeM3, mergedComposition);

  // Déterminer la catégorie principale et secondaire
  const sortedComposition = [...mergedComposition].sort((a, b) => b.percentage - a.percentage);
  const mainCategory = sortedComposition[0]?.material ?? "inconnu";
  const secondaryCategory = sortedComposition.length > 1 ? sortedComposition[1].material : undefined;

  // Calculer les scores de confiance
  const detectionConfidence = detectionResult.confidence;
  const segmentationConfidence = segmentationResult.confidence;
  const volumeConfidence = volumeResult.confidence;

  // Confiance globale: moyenne pondérée
  const overallConfidence =
    detectionConfidence * 0.25 +
    segmentationConfidence * 0.25 +
    volumeConfidence * 0.3 +
    weight.confidence * 0.2;

  const processingTimeMs = Math.round(performance.now() - startTime);

  return {
    categories: {
      main: mainCategory,
      secondary: secondaryCategory,
      composition: sortedComposition,
    },
    volume: {
      m3: volumeResult.dimensions.volumeM3,
      confidence: volumeConfidence,
      method: volumeResult.method,
      dimensions: volumeResult.dimensions,
    },
    weight,
    confidence: {
      detection: Math.round(detectionConfidence * 100) / 100,
      segmentation: Math.round(segmentationConfidence * 100) / 100,
      volume: Math.round(volumeConfidence * 100) / 100,
      overall: Math.round(overallConfidence * 100) / 100,
    },
    metadata: {
      totalObjectsDetected: detectionResult.totalObjects,
      totalSegments: segmentationResult.totalSegments,
      wasteAreaPercent: Math.round(segmentationResult.wasteAreaRatio * 100),
      processingTimeMs,
      modelsUsed: {
        detection: detectionResult.modelUsed,
        segmentation: segmentationResult.modelUsed,
        volume: volumeResult.method,
      },
    },
  };
}

/**
 * Fusionne la composition provenant de la détection et de la segmentation
 * pour obtenir une estimation plus robuste
 */
function mergeComposition(
  detectionComposition: CompositionEntry[],
  segments: SegmentMask[]
): CompositionEntry[] {
  if (segments.length === 0) return detectionComposition;
  if (detectionComposition.length === 0) {
    // Créer une composition à partir des segments
    const materialAreas = new Map<WasteMaterial, number>();
    let totalArea = 0;

    for (const seg of segments) {
      const current = materialAreas.get(seg.label) ?? 0;
      materialAreas.set(seg.label, current + seg.areaRatio);
      totalArea += seg.areaRatio;
    }

    if (totalArea === 0) return [{ material: "inconnu", percentage: 100 }];

    return Array.from(materialAreas.entries())
      .map(([material, area]) => ({
        material,
        percentage: Math.round((area / totalArea) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }

  // Fusion pondérée: 60% détection, 40% segmentation
  const segComposition = segmentsToComposition(segments);

  const mergedMap = new Map<WasteMaterial, number>();

  for (const entry of detectionComposition) {
    mergedMap.set(entry.material, entry.percentage * 0.6);
  }

  for (const entry of segComposition) {
    const existing = mergedMap.get(entry.material) ?? 0;
    mergedMap.set(entry.material, existing + entry.percentage * 0.4);
  }

  // Normaliser à 100%
  const total = Array.from(mergedMap.values()).reduce((sum, v) => sum + v, 0);
  if (total === 0) return [{ material: "inconnu", percentage: 100 }];

  const merged = Array.from(mergedMap.entries())
    .map(([material, value]) => ({
      material,
      percentage: Math.round((value / total) * 100),
    }))
    .filter(e => e.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  // Ajuster à 100%
  const totalPct = merged.reduce((sum, e) => sum + e.percentage, 0);
  if (totalPct !== 100 && merged.length > 0) {
    merged[0].percentage += 100 - totalPct;
  }

  return merged;
}

/**
 * Convertit les segments en composition
 */
function segmentsToComposition(segments: SegmentMask[]): CompositionEntry[] {
  const materialAreas = new Map<WasteMaterial, number>();
  let totalArea = 0;

  for (const seg of segments) {
    const current = materialAreas.get(seg.label) ?? 0;
    const weightedArea = seg.areaRatio * seg.confidence;
    materialAreas.set(seg.label, current + weightedArea);
    totalArea += weightedArea;
  }

  if (totalArea === 0) return [];

  return Array.from(materialAreas.entries())
    .map(([material, area]) => ({
      material,
      percentage: Math.round((area / totalArea) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

/**
 * Applique des surcharges de densité
 */
function applyDensityOverrides(overrides: Partial<Record<WasteMaterial, number>>): void {
  for (const [material, density] of Object.entries(overrides)) {
    if (density !== undefined && density > 0) {
      (MATERIAL_DENSITIES as Record<string, number>)[material] = density;
    }
  }
}

/**
 * Version simplifiée pour une quantification rapide
 * (sans segmentation complète, juste détection + estimation)
 */
export async function quickQuantify(
  imageDataUrl: string,
  options?: QuantificationOptions
): Promise<QuantificationResult> {
  const startTime = performance.now();

  // Détection rapide
  const detectionResult = await detectWasteObjects(imageDataUrl, {
    minConfidence: options?.detectionMinConfidence ?? 0.4,
    modelType: "yolo11",
  });

  const composition = calculateCompositionFromDetections(detectionResult.objects);

  // Estimation de volume simplifiée
  const img = await loadImage(imageDataUrl);
  const focalLength = options?.focalLength ?? 4.5;
  const sensorWidth = options?.sensorWidth ?? 6.17;
  const sensorHeight = options?.sensorHeight ?? 4.55;

  // Distance estimée basée sur la taille des objets détectés
  const distanceM = options?.knownDistance ?? estimateQuickDistance(detectionResult, focalLength, img.width, img.height);

  // Dimensions estimées
  const fovHorizontal = 2 * Math.atan(sensorWidth / (2 * focalLength));
  const fovVertical = 2 * Math.atan(sensorHeight / (2 * focalLength));

  const widthAtDistance = 2 * distanceM * Math.tan(fovHorizontal / 2);
  const heightAtDistance = 2 * distanceM * Math.tan(fovVertical / 2);

  // Ratio de l'image occupé par les déchets
  const wasteRatio = detectionResult.objects.length > 0
    ? Math.min(1, detectionResult.objects.reduce((sum, o) => sum + o.area, 0))
    : 0.5;

  const wasteWidth = widthAtDistance * Math.sqrt(wasteRatio);
  const wasteHeight = heightAtDistance * Math.sqrt(wasteRatio);
  const heightAvg = wasteHeight * 0.3;

  const surfaceM2 = Math.round(wasteWidth * wasteHeight * 10) / 10;
  const volumeM3 = Math.round(surfaceM2 * heightAvg * 100) / 100;

  const dimensions: Dimensions3D = {
    lengthM: Math.round(wasteWidth * 10) / 10,
    widthM: Math.round(wasteHeight * 10) / 10,
    heightAvgM: Math.round(heightAvg * 10) / 10,
    surfaceM2,
    volumeM3,
    confidence: 0.3 + detectionResult.confidence * 0.3,
  };

  const weight = calculateWeightFromVolume(volumeM3, composition);

  const sortedComposition = [...composition].sort((a, b) => b.percentage - a.percentage);
  const mainCategory = sortedComposition[0]?.material ?? "inconnu";
  const secondaryCategory = sortedComposition.length > 1 ? sortedComposition[1].material : undefined;

  const overallConfidence =
    detectionResult.confidence * 0.4 +
    dimensions.confidence * 0.3 +
    weight.confidence * 0.3;

  return {
    categories: {
      main: mainCategory,
      secondary: secondaryCategory,
      composition: sortedComposition,
    },
    volume: {
      m3: volumeM3,
      confidence: dimensions.confidence,
      method: "estimation",
      dimensions,
    },
    weight,
    confidence: {
      detection: Math.round(detectionResult.confidence * 100) / 100,
      segmentation: 0,
      volume: Math.round(dimensions.confidence * 100) / 100,
      overall: Math.round(overallConfidence * 100) / 100,
    },
    metadata: {
      totalObjectsDetected: detectionResult.totalObjects,
      totalSegments: 0,
      wasteAreaPercent: Math.round(wasteRatio * 100),
      processingTimeMs: Math.round(performance.now() - startTime),
      modelsUsed: {
        detection: detectionResult.modelUsed,
        segmentation: "fallback",
        volume: "estimation",
      },
    },
  };
}

/**
 * Estimation rapide de la distance basée sur les détections
 */
function estimateQuickDistance(
  detection: DetectionResult,
  focalLength: number,
  imageWidth: number,
  imageHeight: number
): number {
  if (detection.objects.length === 0) return 3;

  // Prendre l'objet le plus grand et le plus confiant
  const bestObj = detection.objects.reduce((best, obj) =>
    obj.area > best.area ? obj : best
  );

  // Taille typique basée sur la catégorie
  const typicalSizes: Record<string, number> = {
    plastique: 0.5,
    carton: 0.4,
    papier: 0.3,
    verre: 0.3,
    metal: 0.3,
    organique: 0.4,
    dangereux: 0.3,
    meuble: 0.8,
    electronique: 0.4,
    construction: 0.5,
    mixte: 0.7,
    inconnu: 0.5,
  };

  const realSize = typicalSizes[bestObj.label] ?? 0.5;
  const pixelHeight = bestObj.bbox.height * imageHeight;

  if (pixelHeight <= 0) return 3;

  // distance = (taille réelle * focale) / taille en pixels
  return Math.max(0.5, Math.min(50, (realSize * focalLength) / pixelHeight));
}

/**
 * Charge une image à partir d'une data URL
 */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}