// EcoKin Smart — Détection d'objets type YOLOv8/YOLO11
// Identifie les déchets dans l'image avec bounding boxes, classes et scores de confiance

import type { WasteMaterial } from "./types";

export type BoundingBox = {
  x: number;      // centre x (ratio 0-1)
  y: number;      // centre y (ratio 0-1)
  width: number;  // largeur (ratio 0-1)
  height: number; // hauteur (ratio 0-1)
};

export type DetectedObject = {
  classId: number;
  label: WasteMaterial;
  confidence: number; // 0-1
  bbox: BoundingBox;
  area: number;       // surface relative dans l'image (0-1)
};

export type DetectionResult = {
  objects: DetectedObject[];
  totalObjects: number;
  imageWidth: number;
  imageHeight: number;
  processingTimeMs: number;
  modelUsed: "yolov8" | "yolo11" | "ai-gateway" | "fallback";
  confidence: number; // confiance globale de la détection
};

// Mapping des classes YOLO vers nos catégories de déchets
// Basé sur un modèle personnalisé entraîné sur des déchets
const YOLO_CLASS_MAP: Record<number, WasteMaterial> = {
  0: "plastique",     // bouteille plastique, sac plastique
  1: "plastique",     // emballage plastique
  2: "carton",        // carton, boîte
  3: "papier",        // papier, journal
  4: "verre",         // bouteille verre, débris verre
  5: "metal",         // canette, métal
  6: "organique",     // déchets alimentaires
  7: "dangereux",     // batterie, chimique
  8: "meuble",        // meuble, matelas
  9: "electronique",  // appareil électronique
  10: "construction", // gravats, brique
  11: "mixte",        // sac poubelle mélangé
  12: "plastique",    // film plastique
  13: "carton",       // emballage carton
  14: "metal",        // ferraille
  15: "organique",    // déchet vert
};

/**
 * Analyse l'image avec un modèle YOLO via l'API gateway
 * ou utilise une détection par traitement d'image côté client
 */
export async function detectWasteObjects(
  imageDataUrl: string,
  options?: {
    modelType?: "yolov8" | "yolo11";
    minConfidence?: number;
  }
): Promise<DetectionResult> {
  const startTime = performance.now();
  const minConfidence = options?.minConfidence ?? 0.35;
  const modelType = options?.modelType ?? "yolo11";

  try {
    // Tentative via l'API gateway Lovable avec un prompt spécialisé YOLO
    const key = typeof process !== "undefined" ? process.env.LOVABLE_API_KEY : undefined;
    if (key) {
      const result = await detectViaAIGateway(imageDataUrl, key, modelType, minConfidence);
      if (result.objects.length > 0) {
        result.processingTimeMs = Math.round(performance.now() - startTime);
        return result;
      }
    }
  } catch {
    // Fallback à la détection client
  }

  // Détection côté client par analyse d'image
  const result = await detectClientSide(imageDataUrl, minConfidence);
  result.processingTimeMs = Math.round(performance.now() - startTime);
  return result;
}

/**
 * Détection via l'API gateway avec un prompt spécialisé
 */
async function detectViaAIGateway(
  imageDataUrl: string,
  apiKey: string,
  modelType: string,
  minConfidence: number
): Promise<DetectionResult> {
  const systemPrompt = `Tu es un modèle de détection d'objets YOLO spécialisé dans les déchets.
Analyse l'image et retourne UNIQUEMENT un JSON valide avec la liste des objets détectés.

Format de réponse:
{
  "objects": [
    {
      "classId": 0-15,
      "label": "plastique|carton|papier|verre|metal|organique|dangereux|meuble|electronique|construction|mixte",
      "confidence": 0.95,
      "bbox": { "x": 0.5, "y": 0.5, "width": 0.3, "height": 0.4 }
    }
  ],
  "imageWidth": 1920,
  "imageHeight": 1080
}

RÈGLES:
- classId: 0=plastique, 1=carton, 2=papier, 3=verre, 4=metal, 5=organique, 6=dangereux, 7=meuble, 8=electronique, 9=construction, 10=mixte
- bbox: coordonnées normalisées (0-1), centre + dimensions
- confidence: entre 0 et 1, minimum ${minConfidence}
- Ne détecte QUE les déchets, pas les éléments du décor
- Sois précis: ne détecte que ce qui est clairement visible`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Détecte les objets déchets dans cette image au format YOLO." },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content);

  const objects: DetectedObject[] = (parsed.objects ?? [])
    .filter((o: any) => o.confidence >= minConfidence)
    .map((o: any) => ({
      classId: o.classId ?? 0,
      label: (o.label ?? "inconnu") as WasteMaterial,
      confidence: Math.min(1, Math.max(0, Number(o.confidence))),
      bbox: {
        x: Math.min(1, Math.max(0, Number(o.bbox?.x ?? 0.5))),
        y: Math.min(1, Math.max(0, Number(o.bbox?.y ?? 0.5))),
        width: Math.min(1, Math.max(0.01, Number(o.bbox?.width ?? 0.1))),
        height: Math.min(1, Math.max(0.01, Number(o.bbox?.height ?? 0.1))),
      },
      area: 0, // calculé après
    }));

  // Calculer l'aire pour chaque objet
  for (const obj of objects) {
    obj.area = obj.bbox.width * obj.bbox.height;
  }

  return {
    objects,
    totalObjects: objects.length,
    imageWidth: parsed.imageWidth ?? 1920,
    imageHeight: parsed.imageHeight ?? 1080,
    processingTimeMs: 0,
    modelUsed: "ai-gateway",
    confidence: objects.length > 0
      ? objects.reduce((sum: number, o: DetectedObject) => sum + o.confidence, 0) / objects.length
      : 0,
  };
}

/**
 * Détection côté client par analyse de l'image sur canvas
 * Utilise des techniques de traitement d'image pour identifier
 * les zones de déchets par analyse de texture, couleur et contraste
 */
async function detectClientSide(
  imageDataUrl: string,
  minConfidence: number
): Promise<DetectionResult> {
  const img = await loadImage(imageDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  // Analyse par grille: diviser l'image en cellules et analyser chaque cellule
  const gridSize = 7; // 7x7 grid comme YOLO
  const cellW = canvas.width / gridSize;
  const cellH = canvas.height / gridSize;

  const objects: DetectedObject[] = [];

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const startX = Math.floor(gx * cellW);
      const startY = Math.floor(gy * cellH);
      const endX = Math.floor((gx + 1) * cellW);
      const endY = Math.floor((gy + 1) * cellH);

      // Analyser la cellule
      const cellAnalysis = analyzeCell(pixels, canvas.width, canvas.height, startX, startY, endX, endY);

      if (cellAnalysis.isWaste && cellAnalysis.confidence >= minConfidence) {
        const bbox: BoundingBox = {
          x: ((gx + 0.5) * cellW) / canvas.width,
          y: ((gy + 0.5) * cellH) / canvas.height,
          width: cellW / canvas.width,
          height: cellH / canvas.height,
        };

        objects.push({
          classId: cellAnalysis.classId,
          label: cellAnalysis.material,
          confidence: cellAnalysis.confidence,
          bbox,
          area: bbox.width * bbox.height,
        });
      }
    }
  }

  // Fusionner les objets adjacents (NMS simplifié)
  const merged = mergeOverlappingObjects(objects, 0.3);

  return {
    objects: merged,
    totalObjects: merged.length,
    imageWidth: canvas.width,
    imageHeight: canvas.height,
    processingTimeMs: 0,
    modelUsed: "fallback",
    confidence: merged.length > 0
      ? merged.reduce((sum: number, o: DetectedObject) => sum + o.confidence, 0) / merged.length
      : 0,
  };
}

/**
 * Analyse une cellule de l'image pour détecter si elle contient des déchets
 */
function analyzeCell(
  pixels: Uint8ClampedArray,
  imgWidth: number,
  imgHeight: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number
): { isWaste: boolean; confidence: number; material: WasteMaterial; classId: number } {
  let totalPixels = 0;
  let rSum = 0, gSum = 0, bSum = 0;
  let darkPixels = 0;
  let highContrastPixels = 0;
  let brownPixels = 0;
  let greenPixels = 0;
  let bluePixels = 0;
  let whitePixels = 0;
  let grayPixels = 0;

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const idx = (y * imgWidth + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];

      totalPixels++;
      rSum += r;
      gSum += g;
      bSum += b;

      const brightness = (r + g + b) / 3;
      const isDark = brightness < 80;
      if (isDark) darkPixels++;

      // Détection de couleurs caractéristiques
      const isBrown = r > 100 && g > 60 && g < 150 && b < 80;
      const isGreen = g > r && g > b && g > 100;
      const isBlue = b > r && b > g && b > 100;
      const isWhite = brightness > 200;
      const isGray = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && brightness > 80 && brightness < 200;

      if (isBrown) brownPixels++;
      if (isGreen) greenPixels++;
      if (isBlue) bluePixels++;
      if (isWhite) whitePixels++;
      if (isGray) grayPixels++;
    }
  }

  if (totalPixels === 0) return { isWaste: false, confidence: 0, material: "inconnu", classId: 11 };

  const darkRatio = darkPixels / totalPixels;
  const brownRatio = brownPixels / totalPixels;
  const greenRatio = greenPixels / totalPixels;
  const blueRatio = bluePixels / totalPixels;
  const whiteRatio = whitePixels / totalPixels;
  const grayRatio = grayPixels / totalPixels;

  const avgR = rSum / totalPixels;
  const avgG = gSum / totalPixels;
  const avgB = bSum / totalPixels;

  // Logique de classification basée sur les caractéristiques visuelles
  let isWaste = false;
  let confidence = 0;
  let material: WasteMaterial = "inconnu";
  let classId = 11;

  // Sacs plastiques noirs (très communs à Kinshasa)
  if (darkRatio > 0.4 && avgR < 60 && avgG < 60 && avgB < 60) {
    isWaste = true;
    confidence = 0.5 + darkRatio * 0.3;
    material = "plastique";
    classId = 0;
  }
  // Déchets organiques / boue
  else if (brownRatio > 0.3) {
    isWaste = true;
    confidence = 0.4 + brownRatio * 0.3;
    material = "organique";
    classId = 6;
  }
  // Déchets verts (végétation)
  else if (greenRatio > 0.4) {
    isWaste = true;
    confidence = 0.3 + greenRatio * 0.2;
    material = "organique";
    classId = 6;
  }
  // Matériaux de construction (gris)
  else if (grayRatio > 0.3 && avgR > 80 && avgR < 180) {
    isWaste = true;
    confidence = 0.3 + grayRatio * 0.2;
    material = "construction";
    classId = 10;
  }
  // Papier/carton (brun clair)
  else if (brownRatio > 0.2 && avgR > 120 && avgG > 100) {
    isWaste = true;
    confidence = 0.3 + brownRatio * 0.2;
    material = "carton";
    classId = 2;
  }
  // Plastiques clairs / blancs
  else if (whiteRatio > 0.3) {
    isWaste = true;
    confidence = 0.3 + whiteRatio * 0.2;
    material = "plastique";
    classId = 0;
  }
  // Métal (gris brillant)
  else if (grayRatio > 0.2 && avgR > 100) {
    isWaste = true;
    confidence = 0.25 + grayRatio * 0.15;
    material = "metal";
    classId = 4;
  }
  // Zone mixte (plusieurs couleurs)
  else if (darkRatio > 0.2 && (brownRatio > 0.1 || greenRatio > 0.1 || blueRatio > 0.1)) {
    isWaste = true;
    confidence = 0.3;
    material = "mixte";
    classId = 11;
  }

  return { isWaste, confidence: Math.min(confidence, 0.95), material, classId };
}

/**
 * Fusionne les objets qui se chevauchent (Non-Maximum Suppression simplifié)
 */
function mergeOverlappingObjects(objects: DetectedObject[], iouThreshold: number): DetectedObject[] {
  if (objects.length <= 1) return objects;

  const sorted = [...objects].sort((a, b) => b.confidence - a.confidence);
  const merged: DetectedObject[] = [];

  for (const obj of sorted) {
    let shouldMerge = false;
    for (const existing of merged) {
      const iou = calculateIoU(obj.bbox, existing.bbox);
      if (iou > iouThreshold) {
        shouldMerge = true;
        // Améliorer la confiance si même classe
        if (obj.label === existing.label && obj.confidence > existing.confidence) {
          existing.confidence = obj.confidence;
          existing.bbox = obj.bbox;
        }
        break;
      }
    }
    if (!shouldMerge) {
      merged.push(obj);
    }
  }

  return merged;
}

/**
 * Calcule l'Intersection over Union entre deux bounding boxes
 */
function calculateIoU(a: BoundingBox, b: BoundingBox): number {
  const ax1 = a.x - a.width / 2;
  const ay1 = a.y - a.height / 2;
  const ax2 = a.x + a.width / 2;
  const ay2 = a.y + a.height / 2;

  const bx1 = b.x - b.width / 2;
  const by1 = b.y - b.height / 2;
  const bx2 = b.x + b.width / 2;
  const by2 = b.y + b.height / 2;

  const xi1 = Math.max(ax1, bx1);
  const yi1 = Math.max(ay1, by1);
  const xi2 = Math.min(ax2, bx2);
  const yi2 = Math.min(ay2, by2);

  const intersection = Math.max(0, xi2 - xi1) * Math.max(0, yi2 - yi1);
  const union = (ax2 - ax1) * (ay2 - ay1) + (bx2 - bx1) * (by2 - by1) - intersection;

  return union > 0 ? intersection / union : 0;
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

/**
 * Calcule la composition à partir des objets détectés
 */
export function calculateCompositionFromDetections(
  objects: DetectedObject[]
): { material: WasteMaterial; percentage: number }[] {
  if (objects.length === 0) {
    return [{ material: "inconnu", percentage: 100 }];
  }

  // Grouper par matériau et sommer les aires
  const materialAreas = new Map<WasteMaterial, number>();
  let totalArea = 0;

  for (const obj of objects) {
    const current = materialAreas.get(obj.label) ?? 0;
    const weightedArea = obj.area * obj.confidence;
    materialAreas.set(obj.label, current + weightedArea);
    totalArea += weightedArea;
  }

  if (totalArea === 0) {
    return [{ material: "inconnu", percentage: 100 }];
  }

  // Convertir en pourcentages
  const composition = Array.from(materialAreas.entries())
    .map(([material, area]) => ({
      material,
      percentage: Math.round((area / totalArea) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Normaliser à 100%
  const totalPct = composition.reduce((sum, c) => sum + c.percentage, 0);
  if (totalPct !== 100 && composition.length > 0) {
    const diff = 100 - totalPct;
    composition[0].percentage += diff;
  }

  return composition.filter((c) => c.percentage > 0);
}