import { defaultWasteAIAdapter } from "./adapters/default-adapter";
import type { DetectionResult } from "../detection";
import type { WasteDetectionAnalysis, WasteMaterial } from "./types";

function normalizeMaterial(label: string): WasteMaterial {
    const s = String(label || "").toLowerCase();
    if (!s) return "inconnu";
    if (s.includes("plast") || s.includes("pet") || s.includes("bottle") || s.includes("sac") || s.includes("bag") || s.includes("plastic") || s.includes("film")) return "plastique";
    if (s.includes("glass") || s.includes("verre")) return "verre";
    if (s.includes("cardboard") || s.includes("carton") || s.includes("box")) return "carton";
    if (s.includes("paper") || s.includes("papier") || s.includes("newspaper") || s.includes("journal")) return "papier";
    if (s.includes("metal") || s.includes("can") || s.includes("aluminium") || s.includes("canette") || s.includes("tin")) return "metal";
    if (s.includes("food") || s.includes("organic") || s.includes("vegetable") || s.includes("fruit")) return "organique";
    if (s.includes("electro") || s.includes("phone") || s.includes("laptop") || s.includes("tv") || s.includes("electron")) return "electronique";
    if (s.includes("rubble") || s.includes("brick") || s.includes("grav") || s.includes("concrete") || s.includes("construction")) return "construction";
    if (s.includes("cloth") || s.includes("textile") || s.includes("clothes") || s.includes("vetement") || s.includes("vêtement")) return "textile";
    if (s.includes("tire") || s.includes("tyre") || s.includes("pneu")) return "pneu";
    if (s.includes("furniture") || s.includes("meuble") || s.includes("chair") || s.includes("table")) return "meuble";
    if (s.includes("medical") || s.includes("syringe") || s.includes("needle") || s.includes("biohazard") || s.includes("hospital")) return "dangereux";
    if (s.includes("rubber") || s.includes("caoutchouc")) return "menager";
    return "inconnu";
}

function buildComment(category: WasteMaterial, secondaryCategories: WasteMaterial[]): string {
    const primary = category === "inconnu" ? "déchets divers" : category;
    const secondary = secondaryCategories[0] && secondaryCategories[0] !== "inconnu" ? ` avec des traces de ${secondaryCategories[0]}` : "";
    return `Analyse visuelle : dépôt principalement composé de ${primary}${secondary}.`;
}

function extractTopMaterials(objects: DetectionResult["objects"]): { dominant: WasteMaterial; secondary: WasteMaterial[]; confidence: number } {
    const counts = new Map<WasteMaterial, number>();
    let totalConfidence = 0;
    let count = 0;

    for (const object of objects ?? []) {
        const material = normalizeMaterial(String(object.label || ""));
        if (material === "inconnu") continue;
        counts.set(material, (counts.get(material) || 0) + 1);
        totalConfidence += Number(object.confidence || 0);
        count += 1;
    }

    const ranked = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    const dominant = ranked[0]?.[0] ?? "inconnu";
    const secondary = ranked.slice(1, 3).map(([material]) => material);
    const confidence = count > 0 ? Math.max(0.2, Math.min(0.98, totalConfidence / Math.max(1, count))) : 0.35;

    return { dominant, secondary, confidence };
}

export interface WasteDetectionService {
    analyzeImage(imageDataUrl: string, options?: { signal?: AbortSignal; minConfidence?: number }): Promise<WasteDetectionAnalysis>;
}

class LovableVisionWasteDetectionService implements WasteDetectionService {
    async analyzeImage(imageDataUrl: string, options?: { signal?: AbortSignal; minConfidence?: number }): Promise<WasteDetectionAnalysis> {
        const key = process.env.LOVABLE_API_KEY || process.env.VITE_LOVABLE_API_KEY;
        if (!key) {
            return this.fallback(imageDataUrl);
        }

        try {
            const endpoint = process.env.WASTE_DETECTION_ENDPOINT || "https://ai.gateway.lovable.dev/v1/chat/completions";
            const model = process.env.WASTE_DETECTION_MODEL || "google/gemini-3-flash-preview";
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Lovable-API-Key": key,
                },
                body: JSON.stringify({
                    model,
                    response_format: { type: "json_object" },
                    messages: [
                        {
                            role: "system",
                            content: "Tu es un service de vision dédié à la classification de déchets. Réponds uniquement en JSON avec les clés dominantCategory, secondaryCategories, confidence et comment.",
                        },
                        {
                            role: "user",
                            content: [{ type: "image_url", image_url: { url: imageDataUrl } }],
                        },
                    ],
                }),
                signal: options?.signal,
            });

            if (!response.ok) {
                throw new Error(`Vision service error ${response.status}`);
            }

            const payload = await response.json();
            const content = String(payload?.choices?.[0]?.message?.content ?? "{}");
            const parsed = JSON.parse(content);
            const dominant = normalizeMaterial(String(parsed?.dominantCategory || parsed?.mainCategory || parsed?.category || "inconnu"));
            const secondary = Array.isArray(parsed?.secondaryCategories)
                ? parsed.secondaryCategories
                    .map((entry: unknown) => normalizeMaterial(String(entry)))
                    .filter((entry: WasteMaterial) => entry !== "inconnu")
                : [];
            const confidence = Math.max(0.1, Math.min(0.99, Number(parsed?.confidence ?? 0.5)));
            const comment = String(parsed?.comment || buildComment(dominant, secondary));

            return {
                dominantCategory: dominant,
                secondaryCategories: secondary.slice(0, 3),
                confidence,
                comment,
                provider: "lovable-vision",
            };
        } catch (error) {
            console.warn("Waste detection service fell back to local heuristic", error);
            return this.fallback(imageDataUrl);
        }
    }

    private async fallback(imageDataUrl: string): Promise<WasteDetectionAnalysis> {
        try {
            const result = await defaultWasteAIAdapter.detect(imageDataUrl, {
                minConfidence: 0.2,
                modelType: "yolo11",
            });
            const { dominant, secondary, confidence } = extractTopMaterials(result.objects ?? []);
            return {
                dominantCategory: dominant,
                secondaryCategories: secondary,
                confidence,
                comment: buildComment(dominant, secondary),
                provider: "rule-based",
            };
        } catch {
            return {
                dominantCategory: "inconnu",
                secondaryCategories: [],
                confidence: 0.35,
                comment: "Analyse visuelle indisponible. Le système utilisera un mode dégradé.",
                provider: "rule-based",
            };
        }
    }
}

export function createWasteDetectionService(provider?: string): WasteDetectionService {
    const requested = provider ?? process.env.WASTE_DETECTION_PROVIDER ?? (process.env.LOVABLE_API_KEY ? "lovable-vision" : "rule-based");
    const normalized = String(requested || "rule-based").toLowerCase();
    if (normalized === "lovable-vision" || normalized === "lovable" || normalized === "vision") {
        return new LovableVisionWasteDetectionService();
    }
    return new LovableVisionWasteDetectionService();
}

let singleton: WasteDetectionService | null = null;

export function getWasteDetectionService(provider?: string): WasteDetectionService {
    if (!singleton || provider) {
        singleton = createWasteDetectionService(provider);
    }
    return singleton;
}
