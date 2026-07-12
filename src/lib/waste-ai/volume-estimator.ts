// EcoKin Smart — Estimation de volume 3D par analyse de profondeur
// Calcule le volume des déchets à partir de:
// - Données LiDAR/Depth API (quand disponibles)
// - Analyse de perspective et dimensions dérivées des segmentations
// - Références visuelles dans l'image (objets de taille connue)

import type { Dimensions3D } from "./types";
import type { SegmentMask } from "./segmentation";
import type { BoundingBox } from "./detection";

export type DepthEstimate = {
  method: "lidar" | "depth-api" | "perspective" | "reference" | "estimation";
  distanceM: number;         // distance estimée à la caméra
  fieldOfViewDeg: number;    // champ de vision estimé
  dimensions: Dimensions3D;
  confidence: number;        // 0-1
};

// Références visuelles communes (hauteur en mètres)
const COMMON_REFERENCES = [
  { name: "bouteille plastique 1.5L", heightM: 0.32, widthM: 0.08 },
  { name: "sac poubelle 50L", heightM: 0.7, widthM: 0.5 },
  { name: "sac poubelle 100L", heightM: 0.9, widthM: 0.6 },
  { name: "bidon 20L", heightM: 0.4, widthM: 0.3 },
  { name: "pneu voiture", diameterM: 0.6 },
  { name: "carton déménagement", heightM: 0.5, widthM: 0.4, depthM: 0.3 },
  { name: "palette euro", widthM: 1.2, depthM: 0.8, heightM: 0.15 },
  { name: "matelas simple", heightM: 0.2, widthM: 0.9, lengthM: 1.9 },
  { name: "matelas double", heightM: 0.25, widthM: 1.4, lengthM: 1.9 },
  { name: "baril 200L", heightM: 0.9, diameterM: 0.6 },
];

// Constantes de caméra par défaut (appareil photo smartphone typique)
const DEFAULT_SENSOR_WIDTH_MM = 6.17;  // Capteur 1/2.3"
const DEFAULT_SENSOR_HEIGHT_MM = 4.55;
const DEFAULT_FOCAL_LENGTH_MM = 4.5;   // Équivalent 26mm plein format

/**
 * Estime le volume des déchets à partir des segmentations et des données de profondeur
 */
export async function estimateWasteVolume(
  imageDataUrl: string,
  segments: SegmentMask[],
  options?: {
    focalLength?: number;       // distance focale en mm
    sensorWidth?: number;       // largeur du capteur en mm
    sensorHeight?: number;      // hauteur du capteur en mm
    knownDistance?: number;     // distance connue à l'objet en m
    depthData?: string;         // données de profondeur JSON (LiDAR/Depth API)
  }
): Promise<DepthEstimate> {
  // Stratégie 1: Utiliser les données de profondeur si disponibles
  if (options?.depthData) {
    try {
      const depthResult = calculateFromDepthData(options.depthData, segments);
      if (depthResult.confidence > 0.3) return depthResult;
    } catch {
      // Fallback
    }
  }

  // Stratégie 2: Estimer la distance et le volume par perspective
  const img = await loadImage(imageDataUrl);
  const focalLength = options?.focalLength ?? DEFAULT_FOCAL_LENGTH_MM;
  const sensorWidth = options?.sensorWidth ?? DEFAULT_SENSOR_WIDTH_MM;
  const sensorHeight = options?.sensorHeight ?? DEFAULT_SENSOR_HEIGHT_MM;

  // Estimer la distance à partir de la scène
  const distanceM = options?.knownDistance ?? estimateDistanceFromScene(segments, focalLength, sensorWidth, sensorHeight, img.width, img.height);

  // Calculer les dimensions réelles à partir des segmentations et de la distance
  const dims = calculateDimensionsFromSegments(segments, distanceM, focalLength, sensorWidth, sensorHeight, img.width, img.height);

  const fov = 2 * Math.atan(sensorWidth / (2 * focalLength));
  const fovDeg = Math.round(fov * 180 / Math.PI);

  return {
    method: options?.depthData ? "depth-api" : "perspective",
    distanceM: Math.round(distanceM * 100) / 100,
    fieldOfViewDeg: fovDeg,
    dimensions: dims,
    confidence: dims.confidence,
  };
}

/**
 * Calcule le volume à partir de données de profondeur (LiDAR ou Depth API)
 */
function calculateFromDepthData(
  depthDataJson: string,
  segments: SegmentMask[]
): DepthEstimate {
  const depthData = JSON.parse(depthDataJson);

  // Format attendu: { depthMap: number[][], width: number, height: number, focalLength: number }
  const { depthMap, width, height, focalLength } = depthData;

  if (!depthMap || !width || !height) {
    throw new Error("Invalid depth data format");
  }

  // Analyser les zones de profondeur correspondant aux segments
  let totalVolume = 0;
  let totalConfidence = 0;
  let minDistance = Infinity;
  let maxDistance = 0;

  for (const seg of segments) {
    // Convertir les coordonnées normalisées en pixels
    const cx = seg.bbox.x * width;
    const cy = seg.bbox.y * height;
    const bw = seg.bbox.width * width;
    const bh = seg.bbox.height * height;

    // Échantillonner les pixels de profondeur dans la zone
    const depths: number[] = [];

    for (let y = Math.max(0, Math.floor(cy - bh / 2)); y < Math.min(height, Math.ceil(cy + bh / 2)); y++) {
      for (let x = Math.max(0, Math.floor(cx - bw / 2)); x < Math.min(width, Math.ceil(cx + bw / 2)); x++) {
        if (y < depthMap.length && x < depthMap[y].length) {
          const d = depthMap[y][x];
          if (d > 0 && isFinite(d)) {
            depths.push(d);
          }
        }
      }
    }

    if (depths.length < 10) continue;

    // Calculer la profondeur moyenne et l'étendue
    depths.sort((a, b) => a - b);

    // Ignorer les extrêmes (top 10% et bottom 10%)
    const trimStart = Math.floor(depths.length * 0.1);
    const trimEnd = Math.floor(depths.length * 0.9);
    const trimmed = depths.slice(trimStart, trimEnd);

    if (trimmed.length === 0) continue;

    const avgDepth = trimmed.reduce((s, d) => s + d, 0) / trimmed.length;
    const depthSpan = trimmed[trimmed.length - 1] - trimmed[0];

    // La hauteur du tas = étendue de profondeur dans la zone
    const heightM = Math.max(0.05, depthSpan);

    // Les dimensions horizontales dérivées de la bbox et de la profondeur
    // Conversion pixels -> mètres à la distance avgDepth
    const pixelToMeterRatio = 2 * avgDepth * Math.tan((60 * Math.PI) / 180 / 2) / Math.max(width, height);

    const lengthM = Math.max(0.1, bw * pixelToMeterRatio);
    const widthM = Math.max(0.1, bh * pixelToMeterRatio);
    const surfaceM2 = lengthM * widthM;
    const volumeM3 = surfaceM2 * heightM;

    minDistance = Math.min(minDistance, avgDepth);
    maxDistance = Math.max(maxDistance, avgDepth);
    totalVolume += volumeM3;
    totalConfidence += seg.confidence;
  }

  if (totalConfidence === 0) throw new Error("No valid depth data for segments");

  const avgConfidence = totalConfidence / segments.length;
  const combinedConfidence = avgConfidence * 0.9; // Depth data gives high confidence

  // Dimensions globales estimées
  const overallLength = Math.cbrt(totalVolume) * 1.5;
  const overallWidth = Math.cbrt(totalVolume) * 1.2;
  const overallHeight = Math.max(0.1, totalVolume / (overallLength * overallWidth));

  return {
    method: "lidar",
    distanceM: Math.round((minDistance + maxDistance) / 2 * 100) / 100,
    fieldOfViewDeg: 60,
    dimensions: {
      lengthM: Math.round(overallLength * 10) / 10,
      widthM: Math.round(overallWidth * 10) / 10,
      heightAvgM: Math.round(overallHeight * 10) / 10,
      surfaceM2: Math.round(overallLength * overallWidth * 10) / 10,
      volumeM3: Math.round(totalVolume * 100) / 100,
      confidence: combinedConfidence,
      uncertaintyPercent: Math.round((1 - combinedConfidence) * 100),
    },
    confidence: combinedConfidence,
  };
}

/**
 * Estime la distance à la scène à partir des segmentations
 */
function estimateDistanceFromScene(
  segments: SegmentMask[],
  focalLength: number,
  sensorWidth: number,
  sensorHeight: number,
  imageWidth: number,
  imageHeight: number
): number {
  if (segments.length === 0) return 3; // distance par défaut

  // Utiliser la hauteur angulaire du plus grand segment
  const largestSegment = segments.reduce((max, s) => s.areaRatio > max.areaRatio ? s : max, segments[0]);

  // Taille angulaire = taille dans l'image / focale
  const angularHeight = (largestSegment.bbox.height * imageHeight) / focalLength;

  // Estimer la taille réelle basée sur le type de déchet
  const realHeightM = getTypicalSize(largestSegment.label);

  // distance = (taille réelle * focale) / taille image
  const distance = angularHeight > 0 ? (realHeightM * focalLength) / (largestSegment.bbox.height * imageHeight) : 3;

  // Contrainte entre 0.5m et 50m
  return Math.max(0.5, Math.min(50, distance));
}

/**
 * Taille typique d'un objet basé sur sa catégorie
 */
function getTypicalSize(material: string): number {
  const sizes: Record<string, number> = {
    plastique: 0.5,       // sac poubelle moyen
    carton: 0.4,          // boîte en carton
    papier: 0.3,          // tas de papiers
    verre: 0.3,           // bouteille ou débris
    metal: 0.3,           // canette ou pièce
    organique: 0.4,       // tas organique
    dangereux: 0.3,       // bidon
    meuble: 0.8,          // meuble
    electronique: 0.4,    // appareil
    construction: 0.5,    // gravats
    mixte: 0.7,           // tas mélangé
    inconnu: 0.5,         // estimation par défaut
  };
  return sizes[material] ?? 0.5;
}

/**
 * Calcule les dimensions 3D à partir des segmentations et de la distance estimée
 */
function calculateDimensionsFromSegments(
  segments: SegmentMask[],
  distanceM: number,
  focalLength: number,
  sensorWidth: number,
  sensorHeight: number,
  imageWidth: number,
  imageHeight: number
): Dimensions3D {
  if (segments.length === 0) {
    return {
      lengthM: 1.5,
      widthM: 1.0,
      heightAvgM: 0.5,
      surfaceM2: 1.5,
      volumeM3: 0.75,
      confidence: 0.2,
      uncertaintyPercent: 80,
    };
  }

  // Calculer les dimensions de la zone totale de déchets
  // 1. Trouver la bounding box englobante de tous les segments
  let minX = 1, minY = 1, maxX = 0, maxY = 0;

  for (const seg of segments) {
    minX = Math.min(minX, seg.bbox.x - seg.bbox.width / 2);
    minY = Math.min(minY, seg.bbox.y - seg.bbox.height / 2);
    maxX = Math.max(maxX, seg.bbox.x + seg.bbox.width / 2);
    maxY = Math.max(maxY, seg.bbox.y + seg.bbox.height / 2);
  }

  // Taille angulaire de la zone de déchets
  const angularWidth = (maxX - minX) * imageWidth / focalLength;
  const angularHeight = (maxY - minY) * imageHeight / focalLength;

  // Conversion taille angulaire -> taille réelle à la distance estimée
  const realWidth = angularWidth * distanceM;
  const realHeight = angularHeight * distanceM;

  // Estimation de la hauteur moyenne du tas
  // Utilise le wasteAreaRatio comme proxy: plus c'est dense, plus c'est haut
  const totalAreaRatio = segments.reduce((sum, s) => sum + s.areaRatio, 0);
  const densityFactor = Math.min(1, totalAreaRatio * 3); // 0-1
  const heightM = Math.max(0.1, distanceM * 0.05 + densityFactor * 0.5);

  // Volume = surface au sol × hauteur moyenne
  // Ajustement: les déchets n'occupent pas tout le rectangle
  const fillFactor = Math.min(1, segments.reduce((sum, s) => sum + s.areaRatio, 0) * 5);
  const effectiveWidth = realWidth * Math.max(0.3, fillFactor);
  const effectiveLength = realHeight * Math.max(0.3, fillFactor);

  const surfaceM2 = effectiveWidth * effectiveLength;
  const volumeM3 = surfaceM2 * heightM;

  // Confiance basée sur la qualité des segmentations et la méthode
  const segConfidence = segments.length > 0
    ? segments.reduce((sum, s) => sum + s.confidence, 0) / segments.length
    : 0.3;

  const distanceConfidence = Math.max(0.1, 1 - distanceM / 50); // Moins de confiance si loin
  const confidence = segConfidence * 0.6 + distanceConfidence * 0.4;

  return {
    lengthM: Math.round(effectiveLength * 10) / 10,
    widthM: Math.round(effectiveWidth * 10) / 10,
    heightAvgM: Math.round(heightM * 10) / 10,
    surfaceM2: Math.round(surfaceM2 * 10) / 10,
    volumeM3: Math.round(volumeM3 * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    uncertaintyPercent: Math.round((1 - confidence) * 100),
  };
}

/**
 * Identifie des objets de référence dans l'image pour calibrer l'échelle
 * (version simplifiée utilisant les segmentations)
 */
export function findReferenceObjects(
  segments: SegmentMask[],
  imageWidth: number,
  imageHeight: number
): Array<{ name: string; heightPixels: number; widthPixels: number; realHeightM: number; realWidthM: number; confidence: number }> {
  const references: Array<{ name: string; heightPixels: number; widthPixels: number; realHeightM: number; realWidthM: number; confidence: number }> = [];

  for (const seg of segments) {
    const pxHeight = seg.bbox.height * imageHeight;
    const pxWidth = seg.bbox.width * imageWidth;

    // Chercher une référence correspondante
    for (const ref of COMMON_REFERENCES) {
      const refAspectRatio = (ref.widthM ?? ref.diameterM ?? 0.5) / (ref.heightM ?? ref.diameterM ?? 0.5);
      const segAspectRatio = seg.bbox.width / seg.bbox.height;

      // Vérifier si les proportions correspondent
      if (Math.abs(refAspectRatio - segAspectRatio) > 0.5) continue;

      // Vérifier la taille relative
      const estimatedDistanceBasedOnRef = ref.heightM
        ? (ref.heightM * imageHeight) / pxHeight
        : 0;

      if (estimatedDistanceBasedOnRef > 0.5 && estimatedDistanceBasedOnRef < 20) {
        references.push({
          name: ref.name,
          heightPixels: Math.round(pxHeight),
          widthPixels: Math.round(pxWidth),
          realHeightM: ref.heightM ?? ref.diameterM ?? 0.5,
          realWidthM: ref.widthM ?? ref.diameterM ?? 0.5,
          confidence: seg.confidence,
        });
      }
    }
  }

  return references;
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
