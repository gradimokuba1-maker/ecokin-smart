import type { ModelAdapter, AdapterDetectionHint } from "./types";
import type { DetectionResult } from "../detection";
import type { SegmentationResult } from "../segmentation";
import type { DepthEstimate } from "../volume-estimator";
import type { DetectedObject } from "../detection";

async function callVisionAI(imageDataUrl: string, prompt: string, signal?: AbortSignal) {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY not set for server adapter");

    const body = {
        model: "google/gemini-pro-vision",
        response_format: { type: "json_object" },
        messages: [
            { role: "system", content: prompt },
            { role: "user", content: [{ type: "image_url", image_url: { url: imageDataUrl } }] },
        ],
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
    return JSON.parse(content);
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
            const prompt = `Vous êtes un service de vision qui détecte des objets de déchets. Répondez uniquement en JSON avec la clé \"objects\" contenant une liste d'objets { label: string, confidence: number, bbox: [xmin, ymin, xmax, ymax] } en coordonnées normalisées (0-1). Ne renvoyez aucun texte autre que le JSON.`;
            const data = await callVisionAI(imageDataUrl, prompt);
            const objs = Array.isArray(data.objects) ? data.objects : [];
            const detected: DetectedObject[] = objs.map((o: any) => ({
                classId: 0,
                label: String(o.label || "inconnu").toLowerCase(),
                displayLabel: String(o.label || "inconnu"),
                confidence: Number(o.confidence || 0),
                bbox: {
                    x: ((Number(o.bbox?.[0] ?? 0) + Number(o.bbox?.[2] ?? 0)) / 2) || 0.5,
                    y: ((Number(o.bbox?.[1] ?? 0) + Number(o.bbox?.[3] ?? 0)) / 2) || 0.5,
                    width: Math.abs(Number(o.bbox?.[2] ?? 0) - Number(o.bbox?.[0] ?? 0)) || 0.1,
                    height: Math.abs(Number(o.bbox?.[3] ?? 0) - Number(o.bbox?.[1] ?? 0)) || 0.1,
                },
                area: (Math.abs(Number(o.bbox?.[2] ?? 0) - Number(o.bbox?.[0] ?? 0)) || 0.1) *
                    (Math.abs(Number(o.bbox?.[3] ?? 0) - Number(o.bbox?.[1] ?? 0)) || 0.1),
            }));

            const confidence = detected.length ? detected.reduce((s, x) => s + x.confidence, 0) / detected.length : 0;
            // Attempt to get image size via a lightweight approach: not available server-side, default to 800x600
            const imageWidth = 800;
            const imageHeight = 600;
            return {
                objects: detected,
                totalObjects: detected.length,
                imageWidth,
                imageHeight,
                processingTimeMs: Date.now() - started,
                modelUsed: 'server-vision' as const,
                confidence: Math.round((confidence || 0) * 100) / 100,
            } as DetectionResult;
        } catch (e) {
            console.warn('serverWasteAIAdapter.detect failed, falling back', e);
            return {
                objects: [],
                totalObjects: 0,
                imageWidth: 800,
                imageHeight: 600,
                processingTimeMs: Date.now() - started,
                modelUsed: 'unavailable',
                confidence: 0,
            } as DetectionResult;
        }
    },
    async segment(imageDataUrl, detections, _options) {
        // Simple segmentation based on detection bounding boxes: convert bbox area to areaRatio
        const segments = (detections || []).map((d: any, i: number) => ({
            id: `s-${i}`,
            label: d.displayLabel ?? d.label ?? 'mixte',
            areaRatio: Math.max(0.01, d.area || ((d.bbox?.width ?? 0.1) * (d.bbox?.height ?? 0.1))),
            confidence: d.confidence ?? 0.5,
            mask: null,
        }));
        const total = segments.reduce((s, x) => s + x.areaRatio * x.confidence, 0) || 1;
        return {
            segments,
            totalSegments: segments.length,
            wasteAreaRatio: Math.min(1, segments.reduce((s, x) => s + x.areaRatio, 0)),
            confidence: Math.round((segments.reduce((s, x) => s + x.confidence, 0) / Math.max(1, segments.length)) * 100) / 100,
            modelUsed: 'server-segmentation',
        } as SegmentationResult;
    },
    async estimateVolume(imageDataUrl, segments, _options) {
        // Use simple heuristic: volume based on sum of segment areaRatios and a typical height
        const areaRatio = Math.min(1, segments.reduce((s: any, seg: any) => s + (seg.areaRatio || 0), 0));
        const surfaceM2 = Math.max(0.1, Math.round(areaRatio * 10 * 10) / 10); // heuristic
        const heightAvgM = 0.4; // default
        const volumeM3 = Math.round(surfaceM2 * heightAvgM * 100) / 100;
        return {
            dimensions: {
                lengthM: Math.round(Math.sqrt(surfaceM2) * 10) / 10,
                widthM: Math.round(Math.sqrt(surfaceM2) * 10) / 10,
                heightAvgM,
                surfaceM2,
                volumeM3,
                confidence: 0.6,
            },
            method: 'server-estimate' as const,
            confidence: 0.6,
        } as DepthEstimate;
    },
};
