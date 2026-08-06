import type { ModelAdapter, AdapterDetectionHint } from "./types";
import type { DetectionResult } from "../detection";
import type { SegmentationResult } from "../segmentation";
import type { DepthEstimate } from "../volume-estimator";
import type { DetectedObject } from "../detection";
import type { WasteMaterial } from "../types";

function mapLabelToMaterial(label: string): WasteMaterial {
    const s = String(label || "").toLowerCase();
    if (!s) return "inconnu";
    if (s.includes("plast") || s.includes("pet") || s.includes("bottle") || s.includes("sac") || s.includes("bag") || s.includes("plastic") || s.includes("film")) return "plastique";
    if (s.includes("glass") || s.includes("verre")) return "verre";
    if (s.includes("cardboard") || s.includes("carton") || s.includes("box")) return "carton";
    if (s.includes("paper") || s.includes("papier") || s.includes("newspaper") || s.includes("journal")) return "papier";
    if (s.includes("metal") || s.includes("can") || s.includes("aluminium") || s.includes("canette") || s.includes("tin")) return "metal";
    if (s.includes("food") || s.includes("organic") || s.includes("vegetable") || s.includes("fruit") || s.includes("organic")) return "organique";
    if (s.includes("electro") || s.includes("phone") || s.includes("laptop") || s.includes("tv") || s.includes("electron")) return "electronique";
    if (s.includes("rubble") || s.includes("brick") || s.includes("grav") || s.includes("concrete") || s.includes("construction")) return "construction";
    if (s.includes("cloth") || s.includes("textile") || s.includes("clothes") || s.includes("vetement") || s.includes("vêtement")) return "textile";
    if (s.includes("tire") || s.includes("tyre") || s.includes("pneu")) return "pneu";
    if (s.includes("furniture") || s.includes("meuble") || s.includes("chair") || s.includes("table")) return "meuble";
    if (s.includes("medical") || s.includes("syringe") || s.includes("needle") || s.includes("biohazard") || s.includes("hospital")) return "dangereux";
    if (s.includes("rubber") || s.includes("caoutchouc")) return "menager";
    // fallback to unknown
    return "inconnu";
}

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
            const detected: DetectedObject[] = objs.map((o: any) => {
                const rawLabel = String(o.label || "inconnu");
                const material = mapLabelToMaterial(rawLabel);
                const display = material;
                return {
                    classId: 0,
                    label: material as any,
                    displayLabel: display as any,
                    confidence: Number(o.confidence || 0),
                    bbox: {
                        x: ((Number(o.bbox?.[0] ?? 0) + Number(o.bbox?.[2] ?? 0)) / 2) || 0.5,
                        y: ((Number(o.bbox?.[1] ?? 0) + Number(o.bbox?.[3] ?? 0)) / 2) || 0.5,
                        width: Math.abs(Number(o.bbox?.[2] ?? 0) - Number(o.bbox?.[0] ?? 0)) || 0.1,
                        height: Math.abs(Number(o.bbox?.[3] ?? 0) - Number(o.bbox?.[1] ?? 0)) || 0.1,
                    },
                    area: (Math.abs(Number(o.bbox?.[2] ?? 0) - Number(o.bbox?.[0] ?? 0)) || 0.1) *
                        (Math.abs(Number(o.bbox?.[3] ?? 0) - Number(o.bbox?.[1] ?? 0)) || 0.1),
                } as DetectedObject;
            });

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
