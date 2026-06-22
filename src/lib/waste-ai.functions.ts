import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  imageDataUrl: z.string().min(20),
});

export type WasteCategory =
  | "plastique"
  | "organique"
  | "menager"
  | "electronique"
  | "medical"
  | "construction"
  | "mixte"
  | "inconnu";

export type WasteAnalysis = {
  // Compat (ancien champ)
  type: WasteCategory | "metal" | "verre";
  category: WasteCategory;
  confidence: number;
  severity: "faible" | "modere" | "critique";
  volumeEstimateM3: number;
  surfaceM2: number;
  description: string;
  recommendations: string[];
  // Risques étendus
  floodRisk: boolean;
  risqueSanitaire: "faible" | "modere" | "eleve";
  risqueEnvironnemental: "faible" | "modere" | "eleve";
  risqueObstruction: "faible" | "modere" | "eleve";
  niveauDanger: "faible" | "modere" | "eleve";
  interventionImmediate: boolean;
};

const FALLBACK: WasteAnalysis = {
  type: "plastique",
  category: "plastique",
  confidence: 0.7,
  severity: "modere",
  volumeEstimateM3: 1.4,
  surfaceM2: 3,
  description: "Dépôt de déchets plastiques détecté. Analyse précise indisponible.",
  recommendations: ["Confirmer la localisation", "Signaler aux services communaux"],
  floodRisk: false,
  risqueSanitaire: "modere",
  risqueEnvironnemental: "modere",
  risqueObstruction: "faible",
  niveauDanger: "modere",
  interventionImmediate: false,
};

export const analyzeWastePhoto = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<WasteAnalysis> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return FALLBACK;

    const systemPrompt = `Tu es l'IA d'EcoKin Smart, plateforme officielle de gestion des déchets de Kinshasa (RDC). Analyse la photo et réponds STRICTEMENT en JSON valide :
{
  "category": "plastique"|"organique"|"menager"|"electronique"|"medical"|"construction"|"mixte"|"inconnu",
  "confidence": number 0..1,
  "severity": "faible"|"modere"|"critique",
  "volumeEstimateM3": number,
  "surfaceM2": number (surface au sol approximative),
  "description": string court FR (1-2 phrases),
  "recommendations": string[] 2-3 actions courtes FR,
  "floodRisk": boolean (caniveau / rivière obstrué visible),
  "risqueSanitaire": "faible"|"modere"|"eleve",
  "risqueEnvironnemental": "faible"|"modere"|"eleve",
  "risqueObstruction": "faible"|"modere"|"eleve" (risque de boucher caniveau),
  "niveauDanger": "faible"|"modere"|"eleve",
  "interventionImmediate": boolean
}
Rien d'autre que le JSON.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
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
        return FALLBACK;
      }
      const json: any = await res.json();
      const content: string = json?.choices?.[0]?.message?.content ?? "";
      const p = JSON.parse(content);
      const cat: WasteCategory = p.category ?? "inconnu";
      return {
        type: cat,
        category: cat,
        confidence: Math.max(0, Math.min(1, Number(p.confidence ?? 0.6))),
        severity: p.severity ?? "modere",
        volumeEstimateM3: Number(p.volumeEstimateM3 ?? 1),
        surfaceM2: Number(p.surfaceM2 ?? 2),
        description: String(p.description ?? FALLBACK.description),
        recommendations: Array.isArray(p.recommendations)
          ? p.recommendations.slice(0, 4).map(String)
          : FALLBACK.recommendations,
        floodRisk: Boolean(p.floodRisk),
        risqueSanitaire: p.risqueSanitaire ?? "modere",
        risqueEnvironnemental: p.risqueEnvironnemental ?? "modere",
        risqueObstruction: p.risqueObstruction ?? "faible",
        niveauDanger: p.niveauDanger ?? "modere",
        interventionImmediate: Boolean(p.interventionImmediate),
      };
    } catch (err) {
      console.error("AI analyze failed", err);
      return FALLBACK;
    }
  });

// -------------- Assistant IA décideurs (Q/R langage naturel) --------------
const ChatSchema = z.object({
  question: z.string().min(2).max(500),
  context: z.string().max(8000).optional(),
});

export const askDecisionAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ChatSchema.parse(data))
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
