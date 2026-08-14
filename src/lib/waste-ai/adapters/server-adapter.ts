import type { ModelAdapter } from "./types";
import type { DetectionResult } from "../detection";
import type { SegmentationResult } from "../segmentation";
import type { DepthEstimate } from "../volume-estimator";
import type { DetectedObject } from "../detection";
import type { WasteMaterial, WasteObjectType } from "../types";

function mapLabelToMaterial(label: string): WasteMaterial {
  const s = String(label || "").toLowerCase();
  if (!s) return "inconnu";
  if (s === "mist") return "inconnu";
  if (s.includes("mixed") || s.includes("mixte")) return "mixte";
  if (
    s.includes("plast") ||
    s.includes("pet") ||
    s.includes("bottle") ||
    s.includes("sac") ||
    s.includes("bag") ||
    s.includes("plastic") ||
    s.includes("film")
  )
    return "plastique";
  if (s.includes("glass") || s.includes("verre")) return "verre";
  if (s.includes("cardboard") || s.includes("carton") || s.includes("box")) return "carton";
  if (
    s.includes("paper") ||
    s.includes("papier") ||
    s.includes("newspaper") ||
    s.includes("journal")
  )
    return "papier";
  if (
    s.includes("metal") ||
    s.includes("can") ||
    s.includes("aluminium") ||
    s.includes("canette") ||
    s.includes("tin")
  )
    return "metal";
  if (
    s.includes("food") ||
    s.includes("organic") ||
    s.includes("vegetable") ||
    s.includes("fruit") ||
    s.includes("organic")
  )
    return "organique";
  if (
    s.includes("electro") ||
    s.includes("phone") ||
    s.includes("laptop") ||
    s.includes("tv") ||
    s.includes("electron")
  )
    return "electronique";
  if (
    s.includes("rubble") ||
    s.includes("brick") ||
    s.includes("grav") ||
    s.includes("concrete") ||
    s.includes("construction")
  )
    return "construction";
  if (
    s.includes("cloth") ||
    s.includes("textile") ||
    s.includes("clothes") ||
    s.includes("vetement") ||
    s.includes("vêtement")
  )
    return "textile";
  if (s.includes("tire") || s.includes("tyre") || s.includes("pneu")) return "pneu";
  if (s.includes("furniture") || s.includes("meuble") || s.includes("chair") || s.includes("table"))
    return "meuble";
  if (
    s.includes("medical") ||
    s.includes("syringe") ||
    s.includes("needle") ||
    s.includes("biohazard") ||
    s.includes("hospital")
  )
    return "dangereux";
  if (s.includes("rubber") || s.includes("caoutchouc")) return "menager";
  // fallback to unknown
  return "inconnu";
}

function displayLabelForMaterial(material: WasteMaterial): WasteObjectType {
  if (material === "plastique") return "plastiques";
  if (material === "carton") return "cartons";
  if (material === "papier") return "papiers";
  if (material === "metal") return "metaux";
  if (material === "organique") return "organiques";
  if (material === "electronique") return "electroniques";
  if (material === "construction") return "gravats";
  if (material === "textile") return "textiles";
  if (material === "pneu") return "pneus";
  if (material === "menager") return "menagers";
  if (material === "verre") return "verre";
  return "autres";
}

async function callVisionAI(imageDataUrl: string, prompt: string, signal?: AbortSignal) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY not set for server adapter");
  const endpoint =
    process.env.WASTE_DETECTION_ENDPOINT || "https://ai.gateway.lovable.dev/v1/chat/completions";
  const model = process.env.WASTE_DETECTION_MODEL || "google/gemini-3-flash-preview";

  const body = {
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: [{ type: "image_url", image_url: { url: imageDataUrl } }] },
    ],
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Vision AI error ${res.status}: ${txt}`);
  }
  const json: any = await res.json();
  const content: string = json?.choices?.[0]?.message?.content ?? "";
  const clean = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(clean || "{}");
}

/**
 * Prototype d'adaptateur pour un moteur IA serveur externe.
 *
 * Cette implémentation n'est pas activée par défaut. Elle sert de base
 * pour intégrer ultérieurement un modèle IA plus performant côté serveur.
 */
export const serverWasteAIAdapter: ModelAdapter = {
  async detect(imageDataUrl, options) {
    const started = Date.now();
    try {
      const prompt = `You are EcoKin Smart's vision engine. Analyze only the image content.
Return valid JSON only:
{
  "objects": [
    {
      "label": "concrete visible object",
      "material": "plastique|carton|papier|verre|metal|organique|dangereux|meuble|electronique|construction|textile|pneu|menager|mixte|inconnu",
      "confidence": 0.0,
      "bbox": [xmin, ymin, xmax, ymax]
    }
  ]
}
Rules:
- bbox values must be normalized from 0 to 1.
- Do not invent waste. If no identifiable waste is visible, return {"objects":[]}.
- Never return "Mist" as a label, material or category.
- Keep only objects with confidence >= ${options?.minConfidence ?? 0.35}.`;
      const data = await callVisionAI(imageDataUrl, prompt, options?.signal);
      const objs = Array.isArray(data.objects) ? data.objects : [];
      const detected: DetectedObject[] = objs
        .map((o: any) => {
          const rawLabel = String(o.material || o.category || o.label || "inconnu");
          const material = mapLabelToMaterial(rawLabel);
          const display = displayLabelForMaterial(material);
          const rawBbox = Array.isArray(o.bbox)
            ? o.bbox
            : [o.bbox?.xmin, o.bbox?.ymin, o.bbox?.xmax, o.bbox?.ymax];
          const xmin = Math.max(0, Math.min(1, Number(rawBbox?.[0] ?? 0)));
          const ymin = Math.max(0, Math.min(1, Number(rawBbox?.[1] ?? 0)));
          const xmax = Math.max(xmin, Math.min(1, Number(rawBbox?.[2] ?? 0)));
          const ymax = Math.max(ymin, Math.min(1, Number(rawBbox?.[3] ?? 0)));
          const confidence = Math.max(0, Math.min(1, Number(o.confidence || 0)));
          if (material === "inconnu" || confidence < (options?.minConfidence ?? 0.35)) return null;
          return {
            classId: 0,
            label: material as any,
            displayLabel: display as any,
            confidence,
            bbox: {
              x: (xmin + xmax) / 2,
              y: (ymin + ymax) / 2,
              width: xmax - xmin,
              height: ymax - ymin,
            },
            area: (xmax - xmin) * (ymax - ymin),
          } as DetectedObject;
        })
        .filter(
          (item: DetectedObject | null): item is DetectedObject => item !== null && item.area > 0,
        );

      const confidence = detected.length
        ? detected.reduce((s, x) => s + x.confidence, 0) / detected.length
        : 0;
      // Attempt to get image size via a lightweight approach: not available server-side, default to 800x600
      const imageWidth = 800;
      const imageHeight = 600;
      return {
        objects: detected,
        totalObjects: detected.length,
        imageWidth,
        imageHeight,
        processingTimeMs: Date.now() - started,
        modelUsed: "server-vision" as const,
        confidence: Math.round((confidence || 0) * 100) / 100,
      } as DetectionResult;
    } catch (e) {
      console.warn("serverWasteAIAdapter.detect failed, falling back", e);
      return {
        objects: [],
        totalObjects: 0,
        imageWidth: 800,
        imageHeight: 600,
        processingTimeMs: Date.now() - started,
        modelUsed: "unavailable",
        confidence: 0,
      } as DetectionResult;
    }
  },
  async segment(_imageDataUrl, detections, _options) {
    const segments = (detections || []).map((d: any, i: number) => {
      const areaRatio = Math.max(
        0,
        Math.min(1, d.area || (d.bbox?.width ?? 0) * (d.bbox?.height ?? 0)),
      );
      const bbox = d.bbox ?? { x: 0.5, y: 0.5, width: 0, height: 0 };
      return {
        id: i,
        label: d.label ?? "inconnu",
        displayLabel: d.displayLabel,
        areaRatio,
        area: Math.round(areaRatio * 800 * 600),
        confidence: Math.max(0, Math.min(1, d.confidence ?? 0)),
        mask: null,
        maskDataUrl: "",
        bbox,
        contour: [
          { x: bbox.x - bbox.width / 2, y: bbox.y - bbox.height / 2 },
          { x: bbox.x + bbox.width / 2, y: bbox.y - bbox.height / 2 },
          { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 },
          { x: bbox.x - bbox.width / 2, y: bbox.y + bbox.height / 2 },
        ],
      };
    });
    return {
      segments,
      totalSegments: segments.length,
      wasteAreaRatio: Math.min(
        1,
        segments.reduce((s, x) => s + x.areaRatio, 0),
      ),
      imageWidth: 800,
      imageHeight: 600,
      processingTimeMs: 0,
      confidence:
        Math.round(
          (segments.reduce((s, x) => s + x.confidence, 0) / Math.max(1, segments.length)) * 100,
        ) / 100,
      modelUsed: "server-segmentation",
    } as SegmentationResult;
  },
  async estimateVolume(_imageDataUrl, segments, _options) {
    if (segments.length === 0) {
      return {
        method: "estimation",
        distanceM: 0,
        fieldOfViewDeg: 0,
        dimensions: {
          lengthM: 0,
          widthM: 0,
          heightAvgM: 0,
          surfaceM2: 0,
          volumeM3: 0,
          confidence: 0,
          uncertaintyPercent: 100,
        },
        confidence: 0,
      };
    }

    const areaRatio = Math.min(
      1,
      segments.reduce((s: any, seg: any) => s + (seg.areaRatio || 0), 0),
    );
    const confidence = Math.max(
      0.15,
      Math.min(0.45, (segments.reduce((s, seg) => s + seg.confidence, 0) / segments.length) * 0.5),
    );
    const surfaceM2 = Math.round(Math.max(0.05, areaRatio * 6) * 100) / 100;
    const heightAvgM =
      Math.round(Math.max(0.05, Math.min(0.8, Math.sqrt(areaRatio) * 0.35)) * 100) / 100;
    const volumeM3 = Math.round(surfaceM2 * heightAvgM * 100) / 100;
    return {
      method: "estimation",
      distanceM: 0,
      fieldOfViewDeg: 0,
      dimensions: {
        lengthM: Math.round(Math.sqrt(surfaceM2) * 10) / 10,
        widthM: Math.round(Math.sqrt(surfaceM2) * 10) / 10,
        heightAvgM,
        surfaceM2,
        volumeM3,
        confidence,
        uncertaintyPercent: Math.round((1 - confidence) * 100),
      },
      confidence,
    } as DepthEstimate;
  },
};
