import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type WasteMaterial =
  | "plastique"
  | "carton"
  | "papier"
  | "verre"
  | "metal"
  | "organique"
  | "dangereux"
  | "meuble"
  | "electronique"
  | "construction"
  | "mixte"
  | "inconnu";


export type CompositionEntry = { material: WasteMaterial; percentage: number };

const AdvancedInputSchema = z.object({
  imageDataUrl: z.string().min(20),
  additionalImages: z.array(z.string()).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  accuracy: z.number().optional(),
  altitudeM: z.number().optional(),
  capturedAt: z.string().datetime().optional(),
  cameraCapability: z.enum(["lidar", "arcore", "basic"]).optional(),
  depthData: z.string().optional(),
});

export type WasteAnalysisResult = {
  mainCategory: WasteMaterial;
  secondaryCategory?: WasteMaterial;
  composition: CompositionEntry[];
  detectedObjects: { label: string; count: number; confidence: number }[];
  environmentDetected: string[];
  wasteAreaPercent: number;
  dimensions: {
    lengthM: number;
    widthM: number;
    heightAvgM: number;
    surfaceM2: number;
    volumeM3: number;
    confidence: number;
  };
  location: {
    lat: number;
    lng: number;
    accuracy: number;
    altitudeM?: number;
    commune: string;
    quartier?: string;
  };
  healthRisk: "faible" | "modere" | "eleve";
  environmentalRisk: "faible" | "modere" | "eleve";
  obstructionRisk: "faible" | "modere" | "eleve";
  floodRisk: boolean;
  interventionUrgent: boolean;
  priorityScore: number;
  priorityLevel: "faible" | "moyen" | "eleve" | "critique";
  description: string;
  recommendations: string[];
  analysisConfidence: number;
  model3DAvailable: boolean;
  cameraCapability?: "lidar" | "arcore" | "basic";
};

const FALLBACK_ADVANCED: Omit<WasteAnalysisResult, "location" | "cameraCapability" | "model3DAvailable"> = {
  mainCategory: "mixte",
  composition: [{ material: "mixte", percentage: 100 }],
  detectedObjects: [],
  environmentDetected: ["inconnu"],
  wasteAreaPercent: 50,
  dimensions: { lengthM: 2, widthM: 1.5, heightAvgM: 0.5, surfaceM2: 3, volumeM3: 1.5, confidence: 0.5 },
  healthRisk: "modere",
  environmentalRisk: "modere",
  obstructionRisk: "faible",
  floodRisk: false,
  interventionUrgent: false,
  priorityScore: 50,
  priorityLevel: "moyen",
  description: "Analyse IA préliminaire. Impossible de déterminer les détails du dépôt.",
  recommendations: ["Évaluation manuelle requise pour confirmer les détails."],
  analysisConfidence: 0.4,
};


export const analyzeWastePhotoAdvanced = createServerFn({ method: "POST" })
  .validator((data: unknown) => AdvancedInputSchema.parse(data))
  .handler(async ({ data }): Promise<WasteAnalysisResult> => {
    const key = process.env.LOVABLE_API_KEY;

    const fallbackResult: WasteAnalysisResult = {
        ...FALLBACK_ADVANCED,
        location: { lat: data.lat ?? 0, lng: data.lng ?? 0, accuracy: data.accuracy ?? 100, commune: "Inconnue" },
        cameraCapability: data.cameraCapability ?? "basic",
        model3DAvailable: !!data.depthData,
    };

    if (!key) return fallbackResult;

    const systemPrompt = `Tu es l'IA d'EcoKin Smart. Analyse la photo du dépôt de déchets et réponds en JSON.
Format de réponse attendu:
{
  "mainCategory": "plastique"|"carton"|"papier"|"verre"|"metal"|"organique"|"dangereux"|"meuble"|"electronique"|"construction"|"mixte"|"inconnu",
  "composition": [{ "material": "...", "percentage": number }],
  "dimensions": { "lengthM": number, "widthM": number, "heightAvgM": number, "surfaceM2": number, "volumeM3": number, "confidence": number },
  "healthRisk": "faible"|"modere"|"eleve",
  "environmentalRisk": "faible"|"modere"|"eleve",
  "obstructionRisk": "faible"|"modere"|"eleve",
  "floodRisk": boolean,
  "interventionUrgent": boolean,
  "priorityScore": number (0-100),
  "priorityLevel": "faible"|"moyen"|"eleve"|"critique",
  "description": string (courte, en français),
  "recommendations": string[],
  "analysisConfidence": number (0-1)
}
NE PAS inclure de champ "weight" ou "poids". L'estimation doit se baser sur le volume en m³. La somme des pourcentages dans "composition" doit être 100.
`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
        body: JSON.stringify({
          model: "google/gemini-pro-vision",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyse ce dépôt de déchets et renvoie le JSON." },
                { type: "image_url", image_url: { url: data.imageDataUrl } },
              ],
            },
          ],
        }),
      });

      if (!res.ok) {
        console.error("AI gateway error", res.status, await res.text());
        return fallbackResult;
      }
      const json: any = await res.json();
      const content: string = json?.choices?.[0]?.message?.content ?? "";
      const p = JSON.parse(content);

      return {
        ...fallbackResult,
        mainCategory: p.mainCategory ?? "mixte",
        composition: p.composition ?? [{ material: "mixte", percentage: 100 }],
        dimensions: p.dimensions ?? fallbackResult.dimensions,
        healthRisk: p.healthRisk ?? "modere",
        environmentalRisk: p.environmentalRisk ?? "modere",
        obstructionRisk: p.obstructionRisk ?? "faible",
        floodRisk: p.floodRisk ?? false,
        interventionUrgent: p.interventionUrgent ?? false,
        priorityScore: p.priorityScore ?? 50,
        priorityLevel: p.priorityLevel ?? "moyen",
        description: p.description ?? fallbackResult.description,
        recommendations: p.recommendations ?? fallbackResult.recommendations,
        analysisConfidence: p.analysisConfidence ?? 0.5,
      };
    } catch (err) {
      console.error("AI analyze failed", err);
      return fallbackResult;
    }
  });

// -------------- Assistant IA décideurs (Q/R langage naturel) --------------
const ChatSchema = z.object({
  question: z.string().min(2).max(500),
  context: z.string().max(8000).optional(),
});

export const askDecisionAssistant = createServerFn({ method: "POST" })
  .validator((data: unknown) => ChatSchema.parse(data))
  .handler(async ({ data }): Promise<{ answer: string }> => {
    const key = process.env.LOVABLE_API_KEY;
    const fallbackAnswer =
      "Service IA momentanément indisponible. Consultez le tableau de bord du Gouverneur pour les indicateurs clés (IPK, alertes prioritaires, hotspots).";
    if (!key) return { answer: fallbackAnswer };

    const sys = `Tu es l'Assistant IA d'EcoKin Smart pour les décideurs (Gouverneur, Bourgmestres) de Kinshasa. Réponds en français, de façon concise, structurée (listes courtes, chiffres clés), orientée action. Tu disposes des données de plateforme suivantes :\n${data.context ?? "(données non fournies)"}\nSi la question dépasse ces données, indique-le honnêtement. Toujours conclure par une recommandation prioritaire si pertinent.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: sys },
            { role: "user", content: data.question },
          ],
        }),
      });
      if (!res.ok) {
        console.error("Assistant gateway error", res.status, await res.text());
        return { answer: fallbackAnswer };
      }
      const json: any = await res.json();
      const answer = String(json?.choices?.[0]?.message?.content ?? fallbackAnswer);
      return { answer };
    } catch (e) {
      console.error("Assistant failed", e);
      return { answer: fallbackAnswer };
    }
  });
