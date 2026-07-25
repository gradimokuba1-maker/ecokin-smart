/**
 * Détection des déchets.
 *
 * Le premier passage utilise YOLO11 ONNX dans le navigateur. Un second passage
 * de détection à vocabulaire ouvert complète les classes COCO de YOLO11 pour
 * les catégories métier (sacs, cartons, textiles, gravats, etc.). Les poids
 * ne sont téléchargés qu'au premier signalement et sont mis en cache par le
 * navigateur et par les promesses de ce module.
 */

import type { WasteMaterial, WasteObjectType } from "./types";
import { analyzeImageContent } from "./image-metrics";

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DetectedObject = {
  classId: number;
  /** Famille utilisée pour la composition et la densité. */
  label: WasteMaterial;
  /** Libellé métier affiché à l’utilisateur. */
  displayLabel: WasteObjectType;
  confidence: number;
  bbox: BoundingBox;
  area: number;
};

export type DetectionResult = {
  objects: DetectedObject[];
  totalObjects: number;
  imageWidth: number;
  imageHeight: number;
  processingTimeMs: number;
  modelUsed: "yolo11" | "zero-shot" | "ai-gateway" | "fallback";
  confidence: number;
};

type RawModelDetection = {
  label: string;
  score: number;
  box: { xmin: number; ymin: number; xmax: number; ymax: number };
};

type ObjectDetector = (
  image: string,
  options?: { threshold?: number },
) => Promise<RawModelDetection[]>;

type ZeroShotDetector = (
  image: string,
  labels: string[],
  options?: { threshold?: number },
) => Promise<RawModelDetection[]>;

type WasteClass = {
  displayLabel: WasteObjectType;
  material: WasteMaterial;
  aliases: string[];
};

const WASTE_CLASSES: WasteClass[] = [
  { displayLabel: "bouteilles_pet", material: "plastique", aliases: ["bottle", "plastic bottle", "PET bottle"] },
  { displayLabel: "sacs_plastiques", material: "plastique", aliases: ["plastic bag", "bag", "garbage bag"] },
  { displayLabel: "plastiques", material: "plastique", aliases: ["plastic", "cup", "packaging"] },
  { displayLabel: "cartons", material: "carton", aliases: ["cardboard", "box", "carton"] },
  { displayLabel: "papiers", material: "papier", aliases: ["paper", "book", "newspaper"] },
  { displayLabel: "canettes", material: "metal", aliases: ["can", "tin can", "aluminum can"] },
  { displayLabel: "metaux", material: "metal", aliases: ["metal", "scrap metal", "metal waste"] },
  { displayLabel: "verre", material: "verre", aliases: ["glass", "wine glass", "glass bottle"] },
  { displayLabel: "organiques", material: "organique", aliases: ["organic waste", "food waste", "vegetation"] },
  { displayLabel: "pneus", material: "pneu", aliases: ["tire", "tyre"] },
  { displayLabel: "textiles", material: "textile", aliases: ["textile", "clothes", "fabric"] },
  { displayLabel: "electroniques", material: "electronique", aliases: ["electronic waste", "cell phone", "laptop", "tv"] },
  { displayLabel: "gravats", material: "construction", aliases: ["rubble", "construction waste", "brick"] },
  { displayLabel: "menagers", material: "menager", aliases: ["household waste", "garbage", "trash"] },
  { displayLabel: "autres", material: "mixte", aliases: ["waste", "mixed waste"] },
];

let yoloPromise: Promise<ObjectDetector> | null = null;
let zeroShotPromise: Promise<ZeroShotDetector> | null = null;

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[_-]/g, " ");
}

function classFromLabel(value: string): WasteClass {
  const normalized = normalize(value);
  return WASTE_CLASSES.find((entry) => entry.aliases.some((alias) => normalized.includes(normalize(alias))))
    ?? WASTE_CLASSES[WASTE_CLASSES.length - 1];
}

function classIdFor(type: WasteObjectType) {
  return Math.max(0, WASTE_CLASSES.findIndex((entry) => entry.displayLabel === type));
}

function displayLabelForMaterial(material: WasteMaterial): WasteObjectType {
  const wasteClass = WASTE_CLASSES.find((entry) => entry.material === material);
  return wasteClass?.displayLabel ?? "autres";
}

function loadImageSize(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.width, height: image.height });
    image.onerror = reject;
    image.src = dataUrl;
  });
}

function toObject(raw: RawModelDetection, imageWidth: number, imageHeight: number): DetectedObject | null {
  const mapped = classFromLabel(raw.label);
  const score = Math.max(0, Math.min(1, Number(raw.score)));
  const xmin = Math.max(0, Math.min(imageWidth, Number(raw.box.xmin)));
  const ymin = Math.max(0, Math.min(imageHeight, Number(raw.box.ymin)));
  const xmax = Math.max(xmin, Math.min(imageWidth, Number(raw.box.xmax)));
  const ymax = Math.max(ymin, Math.min(imageHeight, Number(raw.box.ymax)));
  const width = (xmax - xmin) / imageWidth;
  const height = (ymax - ymin) / imageHeight;
  if (!Number.isFinite(score) || width <= 0 || height <= 0) return null;

  return {
    classId: classIdFor(mapped.displayLabel),
    label: mapped.material,
    displayLabel: mapped.displayLabel,
    confidence: score,
    bbox: {
      x: xmin / imageWidth + width / 2,
      y: ymin / imageHeight + height / 2,
      width,
      height,
    },
    area: width * height,
  };
}

function iou(a: BoundingBox, b: BoundingBox) {
  const ax1 = a.x - a.width / 2;
  const ay1 = a.y - a.height / 2;
  const ax2 = a.x + a.width / 2;
  const ay2 = a.y + a.height / 2;
  const bx1 = b.x - b.width / 2;
  const by1 = b.y - b.height / 2;
  const bx2 = b.x + b.width / 2;
  const by2 = b.y + b.height / 2;
  const intersection = Math.max(0, Math.min(ax2, bx2) - Math.max(ax1, bx1)) * Math.max(0, Math.min(ay2, by2) - Math.max(ay1, by1));
  const union = a.width * a.height + b.width * b.height - intersection;
  return union > 0 ? intersection / union : 0;
}

/** Fusionne les boîtes équivalentes issues de YOLO11 et du détecteur ouvert. */
function deduplicate(objects: DetectedObject[]) {
  const kept: DetectedObject[] = [];
  for (const candidate of [...objects].sort((a, b) => b.confidence - a.confidence)) {
    const equivalent = kept.find((item) => item.displayLabel === candidate.displayLabel && iou(item.bbox, candidate.bbox) > 0.45);
    if (!equivalent) kept.push(candidate);
  }
  return kept;
}

async function getYolo11(onProgress?: (message: string) => void) {
  if (!yoloPromise) {
    yoloPromise = import("@huggingface/transformers").then(async ({ pipeline }) => {
      onProgress?.("Chargement de YOLO11…");
      return (await pipeline("object-detection", "webnn/yolo11n", {
        dtype: "q8",
        progress_callback: () => onProgress?.("Préparation de YOLO11…"),
      })) as unknown as ObjectDetector;
    });
  }
  return yoloPromise;
}

async function getZeroShot(onProgress?: (message: string) => void) {
  if (!zeroShotPromise) {
    zeroShotPromise = import("@huggingface/transformers").then(async ({ pipeline }) => {
      onProgress?.("Chargement du classifieur de déchets…");
      return (await pipeline("zero-shot-object-detection", "Xenova/owlvit-base-patch32", {
        dtype: "q8",
        progress_callback: () => onProgress?.("Identification des catégories de déchets…"),
      })) as unknown as ZeroShotDetector;
    });
  }
  return zeroShotPromise;
}

async function detectWithModels(
  imageDataUrl: string,
  minimumConfidence: number,
  onProgress?: (message: string) => void,
): Promise<{ objects: DetectedObject[]; modelUsed: DetectionResult["modelUsed"]; imageWidth: number; imageHeight: number }> {
  const { width, height } = await loadImageSize(imageDataUrl);
  const yolo = await getYolo11(onProgress);
  onProgress?.("Détection YOLO11 des objets…");
  const yoloObjects = (await yolo(imageDataUrl, { threshold: minimumConfidence }))
    .map((item) => toObject(item, width, height))
    .filter((item): item is DetectedObject => item !== null);

  // YOLO11 fournit la localisation rapide; OWL-ViT ajoute les catégories
  // spécifiques aux déchets qui n'existent pas toutes dans COCO.
  const zeroShot = await getZeroShot(onProgress);
  const candidateLabels = Array.from(new Set(WASTE_CLASSES.flatMap((entry) => entry.aliases.slice(0, 2))));
  const semanticObjects = (await zeroShot(imageDataUrl, candidateLabels, { threshold: minimumConfidence }))
    .map((item) => toObject(item, width, height))
    .filter((item): item is DetectedObject => item !== null);

  return {
    objects: deduplicate([...yoloObjects, ...semanticObjects]),
    modelUsed: semanticObjects.length > 0 ? "zero-shot" : "yolo11",
    imageWidth: width,
    imageHeight: height,
  };
}

/** Fallback local sans réseau/modèle, conservé pour les usages hors ligne. */
async function detectFallback(imageDataUrl: string): Promise<DetectionResult> {
  const metrics = await analyzeImageContent(imageDataUrl);
  const baseBox = metrics.wasteBoundingBox;
  const visibleShare = Math.max(0, Math.min(0.95, metrics.wastePixelRatio));
  if (visibleShare < 0.015 || baseBox.width <= 0 || baseBox.height <= 0) {
    return {
      objects: [],
      totalObjects: 0,
      imageWidth: metrics.imageWidth,
      imageHeight: metrics.imageHeight,
      processingTimeMs: 0,
      modelUsed: "fallback",
      confidence: 0,
    };
  }
  const composition = metrics.colorComposition.filter((entry) => entry.material !== "inconnu").slice(0, 6);
  const usableComposition = composition.length > 0 ? composition : [{ material: "mixte" as WasteMaterial, percentage: 100 }];

  const objects = usableComposition.map((entry, index): DetectedObject => {
    const share = Math.max(0.04, entry.percentage / 100);
    const label = displayLabelForMaterial(entry.material);
    const columns = Math.ceil(Math.sqrt(usableComposition.length));
    const rows = Math.ceil(usableComposition.length / columns);
    const col = index % columns;
    const row = Math.floor(index / columns);
    const cellWidth = baseBox.width / columns;
    const cellHeight = baseBox.height / rows;
    const width = Math.max(0.04, Math.min(baseBox.width, cellWidth * (0.65 + share * 0.6)));
    const height = Math.max(0.04, Math.min(baseBox.height, cellHeight * (0.65 + share * 0.6)));
    const x = baseBox.x - baseBox.width / 2 + cellWidth * (col + 0.5);
    const y = baseBox.y - baseBox.height / 2 + cellHeight * (row + 0.5);
    const confidence = Math.max(0.32, Math.min(0.72, 0.3 + metrics.quality.score * 0.28 + share * 0.22 + visibleShare * 0.12));
    return {
      classId: classIdFor(label),
      label: entry.material,
      displayLabel: label,
      confidence: Math.round(confidence * 100) / 100,
      bbox: {
        x: Math.max(0.02, Math.min(0.98, x)),
        y: Math.max(0.02, Math.min(0.98, y)),
        width,
        height,
      },
      area: Math.min(0.95, baseBox.width * baseBox.height * share),
    };
  });

  const confidence = objects.length
    ? objects.reduce((sum, object) => sum + object.confidence, 0) / objects.length
    : 0;
  return {
    objects: visibleShare > 0.02 ? objects : [],
    totalObjects: visibleShare > 0.02 ? objects.length : 0,
    imageWidth: metrics.imageWidth,
    imageHeight: metrics.imageHeight,
    processingTimeMs: 0,
    modelUsed: "fallback",
    confidence: visibleShare > 0.02 ? Math.round(confidence * 100) / 100 : 0,
  };
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

/**
 * Détecte les objets visibles avec YOLO11 et enrichit les libellés de déchets
 * par un détecteur à vocabulaire ouvert. En cas d'échec, le signalement reste
 * utilisable grâce au fallback local.
 */
export async function detectWasteObjects(
  imageDataUrl: string,
  options?: { modelType?: "yolov8" | "yolo11"; minConfidence?: number; onProgress?: (message: string) => void },
): Promise<DetectionResult> {
  const startedAt = performance.now();
  const minimumConfidence = options?.minConfidence ?? 0.35;
  try {
    const result = await detectWithModels(imageDataUrl, minimumConfidence, options?.onProgress);
    const confidence = result.objects.length
      ? result.objects.reduce((sum, item) => sum + item.confidence, 0) / result.objects.length
      : 0;
    return {
      ...result,
      totalObjects: result.objects.length,
      confidence: Math.round(confidence * 100) / 100,
      processingTimeMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    console.warn("YOLO11 detection unavailable; using offline fallback", error);
    const fallback = await detectFallback(imageDataUrl);
    return { ...fallback, processingTimeMs: Math.round(performance.now() - startedAt) };
  }
}

/** Calcule la composition pondérée par aire et par confiance. */
export function calculateCompositionFromDetections(objects: DetectedObject[]) {
  if (objects.length === 0) return [{ material: "inconnu" as WasteMaterial, percentage: 100 }];
  const totals = new Map<WasteMaterial, number>();
  let total = 0;
  for (const object of objects) {
    const weightedArea = object.area * object.confidence;
    totals.set(object.label, (totals.get(object.label) ?? 0) + weightedArea);
    total += weightedArea;
  }
  if (total === 0) return [{ material: "inconnu" as WasteMaterial, percentage: 100 }];
  const composition = Array.from(totals, ([material, area]) => ({ material, percentage: Math.round((area / total) * 100) }))
    .sort((a, b) => b.percentage - a.percentage);
  const correction = 100 - composition.reduce((sum, item) => sum + item.percentage, 0);
  if (composition[0]) composition[0].percentage += correction;
  return composition;
}
