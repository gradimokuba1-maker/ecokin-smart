/**
 * Métriques extraites directement des pixels de l'image.
 * Utilisées pour compléter ou remplacer les modèles ML lorsque nécessaire,
 * et pour garantir que chaque estimation dépend du contenu réel de la photo.
 */

import type { CompositionEntry, WasteMaterial } from "./types";
import type { BoundingBox } from "./detection";

export type ImageQualityMetrics = {
  sharpness: number;
  brightness: number;
  contrast: number;
  score: number;
};

export type ImageContentMetrics = {
  imageWidth: number;
  imageHeight: number;
  wastePixelRatio: number;
  wasteBoundingBox: BoundingBox;
  quality: ImageQualityMetrics;
  colorComposition: CompositionEntry[];
  dominantColors: Array<{ r: number; g: number; b: number; ratio: number }>;
};

const SAMPLE_SIZE = 128;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** Conversion pixels → mètres à une distance donnée (modèle sténopé). */
export function metersPerPixel(
  distanceM: number,
  focalLengthMm: number,
  sensorSizeMm: number,
  imageSizePx: number,
): number {
  if (distanceM <= 0 || focalLengthMm <= 0 || imageSizePx <= 0) return 0;
  return (distanceM * sensorSizeMm) / (focalLengthMm * imageSizePx);
}

/** Taille réelle (m) d'une dimension normalisée [0–1] dans l'image. */
export function normalizedSpanToMeters(
  normalizedSpan: number,
  distanceM: number,
  focalLengthMm: number,
  sensorSizeMm: number,
  imageSizePx: number,
): number {
  return normalizedSpan * imageSizePx * metersPerPixel(distanceM, focalLengthMm, sensorSizeMm, imageSizePx);
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function samplePixels(image: HTMLImageElement): {
  width: number;
  height: number;
  data: Uint8ClampedArray;
} {
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, SAMPLE_SIZE / Math.max(image.width, image.height));
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D unavailable");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return { width: canvas.width, height: canvas.height, data: ctx.getImageData(0, 0, canvas.width, canvas.height).data };
}

function isWasteLikePixel(r: number, g: number, b: number): boolean {
  const lum = (r + g + b) / 3;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  const isGreenFoliage = g > r * 1.15 && g > b * 1.05 && lum > 40 && lum < 200;
  const isSky = b > r * 1.2 && b > g * 1.05 && lum > 120;
  const isAsphalt = lum > 25 && lum < 90 && sat < 0.12;
  if (isGreenFoliage || isSky) return false;
  if (isAsphalt && sat < 0.08) return false;
  const isDarkObject = lum < 145 && sat < 0.55;
  const isColorfulPackaging = sat > 0.28 && lum > 35 && lum < 230;
  const isEarthTone = r > g * 0.85 && g > b * 0.7 && lum > 45 && lum < 190 && sat < 0.45;
  return isDarkObject || isColorfulPackaging || isEarthTone;
}

function classifyPixelMaterial(r: number, g: number, b: number): WasteMaterial {
  const lum = (r + g + b) / 3;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;

  if (lum > 200 && sat < 0.15) return "papier";
  if (sat > 0.35 && b > r && b > g) return "plastique";
  if (sat > 0.3 && (r > 180 || g > 160)) return "plastique";
  if (r > 140 && g > 100 && b < 90 && sat < 0.5) return "carton";
  if (lum < 80 && sat < 0.2) return "construction";
  if (g > r * 1.05 && lum > 50 && lum < 160) return "organique";
  if (sat < 0.15 && lum > 90 && lum < 180) return "metal";
  if (r > 120 && g > 80 && b < 70) return "organique";
  return "mixte";
}

function computeSharpness(data: Uint8ClampedArray, width: number, height: number): number {
  let sum = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const i = (y * width + x) * 4;
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const right = (data[i + 4] + data[i + 5] + data[i + 6]) / 3;
      const downIndex = ((y + 1) * width + x) * 4;
      const down = (data[downIndex] + data[downIndex + 1] + data[downIndex + 2]) / 3;
      sum += Math.abs(lum - right) + Math.abs(lum - down);
      count += 1;
    }
  }
  return count > 0 ? clamp(sum / count / 80, 0, 1) : 0;
}

function normalizeComposition(entries: CompositionEntry[]): CompositionEntry[] {
  if (entries.length === 0) return [{ material: "inconnu", percentage: 100 }];
  const total = entries.reduce((sum, entry) => sum + entry.percentage, 0);
  if (total <= 0) return [{ material: "inconnu", percentage: 100 }];
  const normalized = entries
    .map((entry) => ({ material: entry.material, percentage: Math.round((entry.percentage / total) * 100) }))
    .filter((entry) => entry.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);
  const pctTotal = normalized.reduce((sum, entry) => sum + entry.percentage, 0);
  if (pctTotal !== 100 && normalized[0]) normalized[0].percentage += 100 - pctTotal;
  return normalized;
}

/**
 * Analyse le contenu pixel de l'image : zone de déchets, couleurs dominantes,
 * composition approximative et qualité (netteté, luminosité, contraste).
 */
export async function analyzeImageContent(imageDataUrl: string): Promise<ImageContentMetrics> {
  const image = await loadImage(imageDataUrl);
  const { width, height, data } = samplePixels(image);

  let wastePixels = 0;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let lumSum = 0;
  let lumSqSum = 0;
  const materialCounts = new Map<WasteMaterial, number>();
  const colorBuckets = new Map<string, number>();

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (r + g + b) / 3;
      lumSum += lum;
      lumSqSum += lum * lum;

      if (!isWasteLikePixel(r, g, b)) continue;
      wastePixels += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);

      const material = classifyPixelMaterial(r, g, b);
      materialCounts.set(material, (materialCounts.get(material) ?? 0) + 1);

      const bucket = `${Math.round(r / 32)}-${Math.round(g / 32)}-${Math.round(b / 32)}`;
      colorBuckets.set(bucket, (colorBuckets.get(bucket) ?? 0) + 1);
    }
  }

  const totalPixels = width * height;
  const wastePixelRatio = wastePixels / totalPixels;
  const pixelCount = wastePixels || 1;

  const colorComposition = normalizeComposition(
    Array.from(materialCounts, ([material, count]) => ({
      material,
      percentage: Math.round((count / pixelCount) * 100),
    })),
  );

  const dominantColors = Array.from(colorBuckets, ([key, count]) => {
    const [rs, gs, bs] = key.split("-").map(Number);
    return { r: rs * 32, g: gs * 32, b: bs * 32, ratio: count / pixelCount };
  })
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 5);

  const meanLum = lumSum / totalPixels;
  const variance = lumSqSum / totalPixels - meanLum * meanLum;
  const contrast = clamp(Math.sqrt(Math.max(0, variance)) / 80, 0, 1);
  const brightness = clamp(meanLum / 255, 0, 1);
  const sharpness = computeSharpness(data, width, height);
  const qualityScore = clamp(sharpness * 0.45 + contrast * 0.3 + (1 - Math.abs(brightness - 0.5) * 2) * 0.25, 0, 1);

  let wasteBoundingBox: BoundingBox;
  if (wastePixels > totalPixels * 0.02 && maxX > minX && maxY > minY) {
    wasteBoundingBox = {
      x: ((minX + maxX) / 2) / width,
      y: ((minY + maxY) / 2) / height,
      width: (maxX - minX + 1) / width,
      height: (maxY - minY + 1) / height,
    };
  } else {
    wasteBoundingBox = { x: 0.5, y: 0.55, width: 0.6, height: 0.45 };
  }

  return {
    imageWidth: image.width,
    imageHeight: image.height,
    wastePixelRatio: clamp(wastePixelRatio, 0, 1),
    wasteBoundingBox,
    quality: { sharpness, brightness, contrast, score: qualityScore },
    colorComposition,
    dominantColors,
  };
}

/** Applique des bornes crédibles pour éviter les volumes ou poids excessifs. */
export function applyVolumeSanityChecks(
  volumeM3: number,
  surfaceM2: number,
  heightAvgM: number,
  wasteAreaRatio: number,
): { volumeM3: number; surfaceM2: number; heightAvgM: number } {
  const areaBasedSurface = clamp(surfaceM2, 0.05, 80);
  const areaBasedHeight = clamp(heightAvgM, 0.05, 4.5);
  let safeVolume = clamp(volumeM3, 0.02, 45);
  const maxFromArea = areaBasedSurface * areaBasedHeight;
  safeVolume = Math.min(safeVolume, maxFromArea * 1.15);
  const minFromCoverage = wasteAreaRatio * 0.15;
  safeVolume = Math.max(safeVolume, minFromCoverage);
  const safeSurface = clamp(areaBasedSurface, 0.05, Math.cbrt(safeVolume) * 4);
  const safeHeight = clamp(safeVolume / Math.max(safeSurface, 0.05), 0.05, 4.5);
  return {
    volumeM3: Math.round(safeVolume * 1000) / 1000,
    surfaceM2: Math.round(safeSurface * 100) / 100,
    heightAvgM: Math.round(safeHeight * 100) / 100,
  };
}
