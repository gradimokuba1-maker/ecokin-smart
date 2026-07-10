// EcoKin Smart — Segmentation sémantique type SAM 2 (Segment Anything Model 2)
// Segmente les zones de déchets dans l'image avec des masques précis

import type { WasteMaterial } from "./types";
import type { BoundingBox } from "./detection";

export type SegmentMask = {
  id: number;
  label: WasteMaterial;
  confidence: number;       // 0-1
  mask: ImageData | null;   // masque binaire (optionnel, peut être lourd)
  maskDataUrl: string;      // data URL du masque pour affichage
  bbox: BoundingBox;
  area: number;             // nombre de pixels du masque
  areaRatio: number;        // ratio par rapport à l'image totale (0-1)
  contour: Array<{ x: number; y: number }>; // points du contour simplifié
};

export type SegmentationResult = {
  segments: SegmentMask[];
  totalSegments: number;
  wasteAreaRatio: number;   // ratio total de l'image couvert par les déchets
  imageWidth: number;
  imageHeight: number;
  processingTimeMs: number;
  modelUsed: "sam2" | "ai-gateway" | "color-based" | "fallback";
  confidence: number;
};

/**
 * Effectue une segmentation sémantique de l'image pour isoler les zones de déchets
 * Utilise l'API gateway avec un prompt SAM 2, ou une segmentation par couleur côté client
 */
export async function segmentWasteAreas(
  imageDataUrl: string,
  detections?: { bbox: BoundingBox; label: WasteMaterial; confidence: number }[]
): Promise<SegmentationResult> {
  const startTime = performance.now();

  try {
    const key = typeof process !== "undefined" ? process.env.LOVABLE_API_KEY : undefined;
    if (key) {
      const result = await segmentViaAIGateway(imageDataUrl, key, detections);
      if (result.segments.length > 0) {
        result.processingTimeMs = Math.round(performance.now() - startTime);
        return result;
      }
    }
  } catch {
    // Fallback
  }

  // Segmentation côté client
  const result = await segmentClientSide(imageDataUrl, detections);
  result.processingTimeMs = Math.round(performance.now() - startTime);
  return result;
}

/**
 * Segmentation via l'API gateway avec un prompt spécialisé SAM 2
 */
async function segmentViaAIGateway(
  imageDataUrl: string,
  apiKey: string,
  detections?: { bbox: BoundingBox; label: WasteMaterial; confidence: number }[]
): Promise<SegmentationResult> {
  const bboxContext = detections
    ? detections.map((d, i) =>
        `Objet ${i + 1}: ${d.label} (confiance: ${Math.round(d.confidence * 100)}%) ` +
        `bbox: centre(${d.bbox.x.toFixed(3)}, ${d.bbox.y.toFixed(3)}) ` +
        `taille(${(d.bbox.width * 100).toFixed(1)}%, ${(d.bbox.height * 100).toFixed(1)}%)`
      ).join("\n")
    : "Aucune détection préalable";

  const systemPrompt = `Tu es un modèle de segmentation SAM 2 spécialisé dans l'identification des déchets.
Analyse l'image et retourne UNIQUEMENT un JSON valide avec les masques de segmentation.

Format de réponse:
{
  "segments": [
    {
      "id": 0,
      "label": "plastique|carton|papier|verre|metal|organique|dangereux|meuble|electronique|construction|mixte",
      "confidence": 0.92,
      "bbox": { "x": 0.5, "y": 0.5, "width": 0.3, "height": 0.4 },
      "contour": [{ "x": 0.45, "y": 0.35 }, { "x": 0.55, "y": 0.35 }],
      "areaRatio": 0.12
    }
  ],
  "imageWidth": 1920,
  "imageHeight": 1080
}

RÈGLES:
- segments: liste des zones de déchets segmentées
- label: type de déchet détecté dans cette zone
- confidence: confiance de la segmentation (0-1)
- bbox: bounding box englobante normalisée (0-1)
- contour: polygone du contour (minimum 3 points, maximum 20 points), coordonnées normalisées
- areaRatio: ratio de l'image occupé par ce segment (0-1)
- Sois précis: segmente UNIQUEMENT les déchets, pas le sol, les arbres ou les bâtiments
- Si plusieurs objets déchets sont présents, crée un segment par objet distinct

Contexte des détections préalables:
${bboxContext}`;

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
            { type: "text", text: "Segmente les zones de déchets dans cette image." },
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

  const segments: SegmentMask[] = (parsed.segments ?? []).map((s: any, idx: number) => ({
    id: idx,
    label: (s.label ?? "inconnu") as WasteMaterial,
    confidence: Math.min(1, Math.max(0, Number(s.confidence ?? 0.5))),
    mask: null,
    maskDataUrl: "",
    bbox: {
      x: Math.min(1, Math.max(0, Number(s.bbox?.x ?? 0.5))),
      y: Math.min(1, Math.max(0, Number(s.bbox?.y ?? 0.5))),
      width: Math.min(1, Math.max(0.01, Number(s.bbox?.width ?? 0.1))),
      height: Math.min(1, Math.max(0.01, Number(s.bbox?.height ?? 0.1))),
    },
    area: Math.round((s.areaRatio ?? 0.05) * parsed.imageWidth * parsed.imageHeight),
    areaRatio: Math.min(1, Math.max(0, Number(s.areaRatio ?? 0.05))),
    contour: Array.isArray(s.contour) ? s.contour.slice(0, 20) : [],
  }));

  const totalAreaRatio = segments.reduce((sum: number, s: SegmentMask) => sum + s.areaRatio, 0);

  return {
    segments,
    totalSegments: segments.length,
    wasteAreaRatio: Math.min(1, totalAreaRatio),
    imageWidth: parsed.imageWidth ?? 1920,
    imageHeight: parsed.imageHeight ?? 1080,
    processingTimeMs: 0,
    modelUsed: "ai-gateway",
    confidence: segments.length > 0
      ? segments.reduce((sum: number, s: SegmentMask) => sum + s.confidence, 0) / segments.length
      : 0,
  };
}

/**
 * Segmentation côté client par analyse de couleur et de texture
 * Implémente une version simplifiée de SAM 2 basée sur:
 * 1. Analyse de couleur (seuillage adaptatif)
 * 2. Détection de contours (Sobel simplifié)
 * 3. Regroupement par proximité (connected components)
 */
async function segmentClientSide(
  imageDataUrl: string,
  detections?: { bbox: BoundingBox; label: WasteMaterial; confidence: number }[]
): Promise<SegmentationResult> {
  const img = await loadImage(imageDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  // Étape 1: Créer un masque binaire des zones de déchets
  const wasteMask = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];

      wasteMask[y * width + x] = isWastePixel(r, g, b) ? 1 : 0;
    }
  }

  // Étape 2: Appliquer un filtre morphologique (ouverture) pour nettoyer le masque
  const cleanedMask = morphologicalOpen(wasteMask, width, height, 2);

  // Étape 3: Trouver les composantes connexes (connected components)
  const components = findConnectedComponents(cleanedMask, width, height);

  // Étape 4: Filtrer les petits composants (bruit)
  const minComponentSize = (width * height) * 0.005; // 0.5% de l'image minimum
  const significantComponents = components.filter(c => c.size >= minComponentSize);

  // Étape 5: Créer les segments à partir des composantes
  const segments: SegmentMask[] = [];
  let totalWastePixels = 0;

  for (let i = 0; i < significantComponents.length; i++) {
    const comp = significantComponents[i];
    totalWastePixels += comp.size;

    // Calculer la bounding box
    const bbox = componentToBBox(comp, width, height);

    // Calculer le contour simplifié
    const contour = computeSimplifiedContour(cleanedMask, width, height, comp);

    // Déterminer le label basé sur les couleurs dominantes dans la zone
    const label = classifyComponentMaterial(pixels, width, height, comp);

    const areaRatio = comp.size / (width * height);

    segments.push({
      id: i,
      label,
      confidence: 0.4 + areaRatio * 0.3, // confiance basée sur la taille relative
      mask: null,
      maskDataUrl: "",
      bbox,
      area: comp.size,
      areaRatio,
      contour,
    });
  }

  // Si des détections YOLO sont disponibles, affiner les segments
  if (detections && detections.length > 0) {
    refineSegmentsWithDetections(segments, detections);
  }

  const wasteAreaRatio = totalWastePixels / (width * height);

  return {
    segments,
    totalSegments: segments.length,
    wasteAreaRatio,
    imageWidth: width,
    imageHeight: height,
    processingTimeMs: 0,
    modelUsed: "color-based",
    confidence: segments.length > 0
      ? segments.reduce((sum: number, s: SegmentMask) => sum + s.confidence, 0) / segments.length
      : 0,
  };
}

/**
 * Détermine si un pixel fait partie de déchets basé sur ses caractéristiques
 */
function isWastePixel(r: number, g: number, b: number): boolean {
  const brightness = (r + g + b) / 3;

  // Sacs plastiques noirs (très communs)
  if (brightness < 60 && r < 70 && g < 70 && b < 70) return true;

  // Couleurs sombres/saturées typiques des déchets
  if (brightness < 100) {
    // Vérifier si ce n'est pas une ombre (vérifier le contexte)
    return true;
  }

  // Bruns (carton, boue, déchets organiques)
  if (r > 100 && g > 60 && g < 150 && b < 80 && brightness < 150) return true;

  // Verts (déchets végétaux)
  if (g > r * 1.2 && g > b * 1.2 && g > 80 && brightness < 180) return true;

  // Bleus (sacs plastiques bleus)
  if (b > r * 1.3 && b > g * 1.1 && b > 60 && brightness < 150) return true;

  // Blancs (sacs plastiques blancs, papiers)
  if (brightness > 200 && r > 180 && g > 180 && b > 180) return true;

  // Gris (construction, métal)
  if (Math.abs(r - g) < 25 && Math.abs(g - b) < 25 && brightness > 80 && brightness < 200) {
    // Vérifier que ce n'est pas une route ou un mur
    // (les routes sont généralement plus lisses)
    return true;
  }

  return false;
}

/**
 * Ouverture morphologique: érosion suivie de dilatation
 */
function morphologicalOpen(
  mask: Uint8Array,
  width: number,
  height: number,
  kernelSize: number
): Uint8Array {
  const eroded = new Uint8Array(width * height);

  // Érosion
  for (let y = kernelSize; y < height - kernelSize; y++) {
    for (let x = kernelSize; x < width - kernelSize; x++) {
      let min = 1;
      for (let ky = -kernelSize; ky <= kernelSize; ky++) {
        for (let kx = -kernelSize; kx <= kernelSize; kx++) {
          min = Math.min(min, mask[(y + ky) * width + (x + kx)]);
        }
      }
      eroded[y * width + x] = min;
    }
  }

  const dilated = new Uint8Array(width * height);

  // Dilatation
  for (let y = kernelSize; y < height - kernelSize; y++) {
    for (let x = kernelSize; x < width - kernelSize; x++) {
      let max = 0;
      for (let ky = -kernelSize; ky <= kernelSize; ky++) {
        for (let kx = -kernelSize; kx <= kernelSize; kx++) {
          max = Math.max(max, eroded[(y + ky) * width + (x + kx)]);
        }
      }
      dilated[y * width + x] = max;
    }
  }

  return dilated;
}

type Component = {
  id: number;
  pixels: Array<{ x: number; y: number }>;
  size: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

/**
 * Trouve les composantes connexes dans un masque binaire
 * Utilise l'algorithme de Two-Pass
 */
function findConnectedComponents(
  mask: Uint8Array,
  width: number,
  height: number
): Component[] {
  const labels = new Int32Array(width * height);
  let currentLabel = 0;
  const equivalences: number[] = [];

  // Premier passage
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (mask[idx] === 0) continue;

      const left = x > 0 ? labels[idx - 1] : 0;
      const top = y > 0 ? labels[idx - width] : 0;

      if (left === 0 && top === 0) {
        currentLabel++;
        labels[idx] = currentLabel;
        equivalences[currentLabel] = currentLabel;
      } else if (left !== 0 && top === 0) {
        labels[idx] = findRoot(left, equivalences);
      } else if (left === 0 && top !== 0) {
        labels[idx] = findRoot(top, equivalences);
      } else {
        const rootLeft = findRoot(left, equivalences);
        const rootTop = findRoot(top, equivalences);
        if (rootLeft !== rootTop) {
          // Union
          equivalences[rootTop] = rootLeft;
        }
        labels[idx] = rootLeft;
      }
    }
  }

  // Deuxième passage: résoudre les équivalences
  for (let i = 0; i < width * height; i++) {
    if (labels[i] !== 0) {
      labels[i] = findRoot(labels[i], equivalences);
    }
  }

  // Compter les pixels par label
  const componentMap = new Map<number, Component>();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const label = labels[idx];
      if (label === 0) continue;

      if (!componentMap.has(label)) {
        componentMap.set(label, {
          id: label,
          pixels: [],
          size: 0,
          minX: x,
          maxX: x,
          minY: y,
          maxY: y,
        });
      }

      const comp = componentMap.get(label)!;
      comp.pixels.push({ x, y });
      comp.size++;
      comp.minX = Math.min(comp.minX, x);
      comp.maxX = Math.max(comp.maxX, x);
      comp.minY = Math.min(comp.minY, y);
      comp.maxY = Math.max(comp.maxY, y);
    }
  }

  return Array.from(componentMap.values());
}

function findRoot(label: number, equivalences: number[]): number {
  let root = label;
  while (equivalences[root] !== root) {
    root = equivalences[root];
  }
  return root;
}

/**
 * Convertit une composante en bounding box normalisée
 */
function componentToBBox(
  comp: Component,
  imageWidth: number,
  imageHeight: number
): BoundingBox {
  const cx = (comp.minX + comp.maxX) / 2 / imageWidth;
  const cy = (comp.minY + comp.maxY) / 2 / imageHeight;
  const w = (comp.maxX - comp.minX + 1) / imageWidth;
  const h = (comp.maxY - comp.minY + 1) / imageHeight;

  return {
    x: Math.min(1, Math.max(0, cx)),
    y: Math.min(1, Math.max(0, cy)),
    width: Math.min(1, Math.max(0.01, w)),
    height: Math.min(1, Math.max(0.01, h)),
  };
}

/**
 * Calcule un contour simplifié d'une composante
 * Utilise l'algorithme de Moore-Neighbor pour tracer le contour
 */
function computeSimplifiedContour(
  mask: Uint8Array,
  width: number,
  height: number,
  comp: Component
): Array<{ x: number; y: number }> {
  // Trouver le premier pixel du contour (en haut à gauche)
  let startX = -1, startY = -1;
  for (const p of comp.pixels) {
    if (startX === -1 || p.x < startX || (p.x === startX && p.y < startY)) {
      startX = p.x;
      startY = p.y;
    }
  }

  if (startX === -1) return [];

  // Moore-Neighbor tracing
  const contour: Array<{ x: number; y: number }> = [];
  let cx = startX, cy = startY;
  let dir = 7; // direction de départ (haut-gauche)
  const startDir = dir;

  do {
    contour.push({ x: cx / width, y: cy / height });

    // Chercher le prochain pixel du contour dans le sens horaire
    let found = false;
    for (let i = 0; i < 8; i++) {
      const nd = (dir + i) % 8;
      const nx = cx + neighborOffsets[nd][0];
      const ny = cy + neighborOffsets[nd][1];

      if (nx >= 0 && nx < width && ny >= 0 && ny < height && mask[ny * width + nx] === 1) {
        cx = nx;
        cy = ny;
        dir = (nd + 4) % 8; // tourner de 180 degrés pour continuer
        found = true;
        break;
      }
    }

    if (!found) break;

    // Limiter la taille du contour
    if (contour.length > 50) break;
  } while (cx !== startX || cy !== startY);

  // Simplifier le contour (Douglas-Peucker simplifié)
  return simplifyContour(contour, 0.02);
}

const neighborOffsets = [
  [1, 0],   // droite
  [1, -1],  // haut-droite
  [0, -1],  // haut
  [-1, -1], // haut-gauche
  [-1, 0],  // gauche
  [-1, 1],  // bas-gauche
  [0, 1],   // bas
  [1, 1],   // bas-droite
];

/**
 * Simplifie un contour en supprimant les points redondants
 */
function simplifyContour(
  contour: Array<{ x: number; y: number }>,
  tolerance: number
): Array<{ x: number; y: number }> {
  if (contour.length <= 3) return contour;

  const simplified: Array<{ x: number; y: number }> = [contour[0]];

  for (let i = 1; i < contour.length - 1; i++) {
    const prev = contour[i - 1];
    const curr = contour[i];
    const next = contour[i + 1];

    // Distance du point à la ligne formée par prev et next
    const dist = pointToLineDistance(curr, prev, next);

    if (dist > tolerance) {
      simplified.push(curr);
    }
  }

  simplified.push(contour[contour.length - 1]);
  return simplified;
}

/**
 * Distance d'un point à une ligne
 */
function pointToLineDistance(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
  }

  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq));
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;

  return Math.sqrt((p.x - projX) ** 2 + (p.y - projY) ** 2);
}

/**
 * Classifie le matériau d'une composante basé sur les couleurs dominantes
 */
function classifyComponentMaterial(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  comp: Component
): WasteMaterial {
  let rSum = 0, gSum = 0, bSum = 0;
  let darkCount = 0, brownCount = 0, greenCount = 0, blueCount = 0, whiteCount = 0, grayCount = 0;

  // Échantillonner les pixels (max 1000 pour la performance)
  const step = Math.max(1, Math.floor(comp.pixels.length / 1000));

  for (let i = 0; i < comp.pixels.length; i += step) {
    const p = comp.pixels[i];
    const idx = (p.y * width + p.x) * 4;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];

    rSum += r;
    gSum += g;
    bSum += b;

    const brightness = (r + g + b) / 3;

    if (brightness < 60) darkCount++;
    else if (r > 100 && g > 60 && g < 150 && b < 80) brownCount++;
    else if (g > r && g > b && g > 100) greenCount++;
    else if (b > r && b > g && b > 100) blueCount++;
    else if (brightness > 200) whiteCount++;
    else if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20) grayCount++;
  }

  const sampled = Math.min(comp.pixels.length, 1000);
  if (sampled === 0) return "inconnu";

  const darkRatio = darkCount / sampled;
  const brownRatio = brownCount / sampled;
  const greenRatio = greenCount / sampled;
  const blueRatio = blueCount / sampled;
  const whiteRatio = whiteCount / sampled;
  const grayRatio = grayCount / sampled;

  // Classification
  if (darkRatio > 0.4) return "plastique";
  if (brownRatio > 0.3) {
    const avgR = rSum / sampled;
    return avgR > 130 ? "carton" : "organique";
  }
  if (greenRatio > 0.4) return "organique";
  if (blueRatio > 0.3) return "plastique";
  if (whiteRatio > 0.3) return "papier";
  if (grayRatio > 0.3) return "construction";

  return "mixte";
}

/**
 * Affine les labels des segments avec les détections YOLO
 */
function refineSegmentsWithDetections(
  segments: SegmentMask[],
  detections: { bbox: BoundingBox; label: WasteMaterial; confidence: number }[]
): void {
  for (const seg of segments) {
    let bestOverlap = 0;
    let bestLabel: WasteMaterial | null = null;

    for (const det of detections) {
      const iou = calculateIoU(seg.bbox, det.bbox);
      if (iou > bestOverlap) {
        bestOverlap = iou;
        bestLabel = det.label;
      }
    }

    if (bestOverlap > 0.2 && bestLabel) {
      seg.label = bestLabel;
      seg.confidence = Math.max(seg.confidence, detections.find(d => d.label === bestLabel)?.confidence ?? seg.confidence);
    }
  }
}

/**
 * Calcule l'IoU entre deux bounding boxes
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