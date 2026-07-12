/**
 * Segmentation SAM 2 guidée par les boîtes YOLO11.
 *
 * SAM 2 reçoit chaque boîte détectée comme prompt et retourne un masque
 * pixel-précis. Le fallback conserve une zone rectangulaire exploitable si le
 * modèle ONNX n'a pas encore pu être téléchargé ou si l'appareil est hors ligne.
 */

import type { WasteMaterial, WasteObjectType } from "./types";
import type { BoundingBox } from "./detection";

export type SegmentMask = {
  id: number;
  label: WasteMaterial;
  displayLabel?: WasteObjectType;
  confidence: number;
  mask: ImageData | null;
  maskDataUrl: string;
  bbox: BoundingBox;
  area: number;
  areaRatio: number;
  contour: Array<{ x: number; y: number }>;
};

export type SegmentationResult = {
  segments: SegmentMask[];
  totalSegments: number;
  wasteAreaRatio: number;
  imageWidth: number;
  imageHeight: number;
  processingTimeMs: number;
  modelUsed: "sam2" | "fallback";
  confidence: number;
};

type DetectionHint = {
  bbox: BoundingBox;
  label: WasteMaterial;
  displayLabel?: WasteObjectType;
  confidence: number;
};

type SamRuntime = {
  model: (input: unknown) => Promise<{ pred_masks: { data: Uint8Array | Float32Array; dims: number[] }; iou_scores?: { data: Float32Array | number[] } }>;
  processor: (image: unknown, options: { input_boxes: number[][][] }) => Promise<Record<string, unknown>> & {
    post_process_masks?: (...args: unknown[]) => unknown;
  };
  postProcess: (...args: unknown[]) => unknown;
  readImage: (source: string) => Promise<unknown>;
};

let samPromise: Promise<SamRuntime> | null = null;

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

async function getSam2(onProgress?: (message: string) => void) {
  if (!samPromise) {
    samPromise = import("@huggingface/transformers").then(async (runtime) => {
      onProgress?.("Chargement de SAM 2…");
      const [model, processor] = await Promise.all([
        runtime.Sam2Model.from_pretrained("onnx-community/sam2-hiera-tiny", {
          dtype: "q4",
          progress_callback: () => onProgress?.("Préparation des masques SAM 2…"),
        }),
        runtime.AutoProcessor.from_pretrained("onnx-community/sam2-hiera-tiny"),
      ]);
      return {
        model: model as unknown as SamRuntime["model"],
        processor: processor as unknown as SamRuntime["processor"],
        postProcess: (processor as { post_process_masks: (...args: unknown[]) => unknown }).post_process_masks.bind(processor),
        readImage: runtime.RawImage.read,
      };
    });
  }
  return samPromise;
}

function rectangularContour(bbox: BoundingBox) {
  const x0 = bbox.x - bbox.width / 2;
  const y0 = bbox.y - bbox.height / 2;
  const x1 = bbox.x + bbox.width / 2;
  const y1 = bbox.y + bbox.height / 2;
  return [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }];
}

function chooseMaskIndex(scores?: Float32Array | number[]) {
  if (!scores || scores.length === 0) return 0;
  let best = 0;
  for (let index = 1; index < scores.length; index += 1) if (Number(scores[index]) > Number(scores[best])) best = index;
  return best;
}

function tensorFromPostProcess(result: unknown): { data: Uint8Array | Float32Array; dims: number[] } | null {
  if (Array.isArray(result)) return tensorFromPostProcess(result[0]);
  if (result && typeof result === "object" && "data" in result && "dims" in result) {
    const tensor = result as { data: Uint8Array | Float32Array; dims: number[] };
    return Array.isArray(tensor.dims) ? tensor : null;
  }
  return null;
}

function maskToSegment(
  id: number,
  hint: DetectionHint,
  tensor: { data: Uint8Array | Float32Array; dims: number[] },
  maskIndex: number,
  imageWidth: number,
  imageHeight: number,
): SegmentMask | null {
  const height = tensor.dims.at(-2) ?? 0;
  const width = tensor.dims.at(-1) ?? 0;
  const masks = tensor.dims.length >= 3 ? tensor.dims.at(-3) ?? 1 : 1;
  if (width < 1 || height < 1 || tensor.data.length < width * height) return null;
  const selected = Math.min(Math.max(0, maskIndex), masks - 1);
  const offset = selected * width * height;
  const rgba = new Uint8ClampedArray(width * height * 4);
  let count = 0;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const active = Number(tensor.data[offset + y * width + x]) > 0;
      if (!active) continue;
      count += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      const pixel = (y * width + x) * 4;
      rgba[pixel] = 16;
      rgba[pixel + 1] = 185;
      rgba[pixel + 2] = 129;
      rgba[pixel + 3] = 150;
    }
  }
  if (count === 0) return null;

  const imageData = new ImageData(rgba, width, height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.putImageData(imageData, 0, 0);
  const bbox: BoundingBox = {
    x: ((minX + maxX) / 2) / width,
    y: ((minY + maxY) / 2) / height,
    width: (maxX - minX + 1) / width,
    height: (maxY - minY + 1) / height,
  };
  const areaRatio = count / (width * height);

  return {
    id,
    label: hint.label,
    displayLabel: hint.displayLabel,
    confidence: hint.confidence,
    mask: imageData,
    maskDataUrl: canvas.toDataURL("image/png"),
    bbox,
    area: Math.round(areaRatio * imageWidth * imageHeight),
    areaRatio,
    contour: rectangularContour(bbox),
  };
}

async function segmentWithSam2(imageDataUrl: string, hints: DetectionHint[], onProgress?: (message: string) => void) {
  const [runtime, image] = await Promise.all([getSam2(onProgress), loadImage(imageDataUrl)]);
  const rawImage = await runtime.readImage(imageDataUrl);
  const segments: SegmentMask[] = [];

  for (const hint of hints.slice(0, 12)) {
    onProgress?.(`Segmentation SAM 2 · ${segments.length + 1}/${Math.min(hints.length, 12)}…`);
    const x0 = Math.max(0, (hint.bbox.x - hint.bbox.width / 2) * image.width);
    const y0 = Math.max(0, (hint.bbox.y - hint.bbox.height / 2) * image.height);
    const x1 = Math.min(image.width, (hint.bbox.x + hint.bbox.width / 2) * image.width);
    const y1 = Math.min(image.height, (hint.bbox.y + hint.bbox.height / 2) * image.height);
    const inputs = await runtime.processor(rawImage, { input_boxes: [[[x0, y0, x1, y1]]] });
    const outputs = await runtime.model(inputs);
    const postProcessed = runtime.postProcess(outputs.pred_masks, (inputs as { original_sizes?: unknown }).original_sizes, (inputs as { reshaped_input_sizes?: unknown }).reshaped_input_sizes);
    const tensor = tensorFromPostProcess(postProcessed);
    const segment = tensor ? maskToSegment(segments.length, hint, tensor, chooseMaskIndex(outputs.iou_scores?.data), image.width, image.height) : null;
    if (segment) segments.push(segment);
  }
  return { segments, imageWidth: image.width, imageHeight: image.height };
}

async function fallbackSegments(imageDataUrl: string, hints: DetectionHint[]) {
  const image = await loadImage(imageDataUrl);
  const segments = hints.map((hint, index): SegmentMask => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");
    const left = (hint.bbox.x - hint.bbox.width / 2) * image.width;
    const top = (hint.bbox.y - hint.bbox.height / 2) * image.height;
    context?.fillRect(left, top, hint.bbox.width * image.width, hint.bbox.height * image.height);
    return {
      id: index,
      label: hint.label,
      displayLabel: hint.displayLabel,
      confidence: hint.confidence * 0.7,
      mask: null,
      maskDataUrl: canvas.toDataURL("image/png"),
      bbox: hint.bbox,
      area: Math.round(hint.bbox.width * hint.bbox.height * image.width * image.height),
      areaRatio: hint.bbox.width * hint.bbox.height,
      contour: rectangularContour(hint.bbox),
    };
  });
  return { segments, imageWidth: image.width, imageHeight: image.height };
}

/** Segmente précisément les objets décelés; ne segmente jamais le décor seul. */
export async function segmentWasteAreas(
  imageDataUrl: string,
  detections: DetectionHint[] = [],
  onProgress?: (message: string) => void,
): Promise<SegmentationResult> {
  const startedAt = performance.now();
  try {
    const result = await segmentWithSam2(imageDataUrl, detections, onProgress);
    const area = Math.min(1, result.segments.reduce((sum, segment) => sum + segment.areaRatio, 0));
    const confidence = result.segments.length
      ? result.segments.reduce((sum, segment) => sum + segment.confidence, 0) / result.segments.length
      : 0;
    return {
      ...result,
      totalSegments: result.segments.length,
      wasteAreaRatio: area,
      processingTimeMs: Math.round(performance.now() - startedAt),
      modelUsed: "sam2",
      confidence,
    };
  } catch (error) {
    console.warn("SAM 2 segmentation unavailable; using bounding-box fallback", error);
    const fallback = await fallbackSegments(imageDataUrl, detections);
    const area = Math.min(1, fallback.segments.reduce((sum, segment) => sum + segment.areaRatio, 0));
    return {
      ...fallback,
      totalSegments: fallback.segments.length,
      wasteAreaRatio: area,
      processingTimeMs: Math.round(performance.now() - startedAt),
      modelUsed: "fallback",
      confidence: fallback.segments.length
        ? fallback.segments.reduce((sum, segment) => sum + segment.confidence, 0) / fallback.segments.length
        : 0,
    };
  }
}
