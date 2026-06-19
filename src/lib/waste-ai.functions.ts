import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  imageDataUrl: z.string().min(20),
});

export type WasteAnalysis = {
  type: "plastique" | "organique" | "metal" | "verre" | "mixte" | "inconnu";
  confidence: number; // 0..1
  severity: "faible" | "modere" | "critique";
  volumeEstimateM3: number;
  description: string;
  recommendations: string[];
  floodRisk: boolean;
};

const FALLBACK: WasteAnalysis = {
  type: "plastique",
  confidence: 0.72,
  severity: "modere",
  volumeEstimateM3: 1.5,
  description:
    "Dépôt de déchets plastiques détecté. L'analyse précise n'a pas pu être complétée.",
  recommendations: [
    "Confirmer la localisation",
    "Signaler aux services communaux",
  ],
  floodRisk: false,
};

export const analyzeWastePhoto = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<WasteAnalysis> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return FALLBACK;

    const systemPrompt = `Tu es l'IA d'EcoKin Smart, plateforme de gestion des déchets de Kinshasa (RDC). Analyse la photo et réponds STRICTEMENT en JSON valide selon ce schéma :
{
  "type": "plastique" | "organique" | "metal" | "verre" | "mixte" | "inconnu",
  "confidence": number entre 0 et 1,
  "severity": "faible" | "modere" | "critique",
  "volumeEstimateM3": number,
  "description": string court (1-2 phrases en français),
  "recommendations": string[] (2 à 3 actions courtes en français),
  "floodRisk": boolean (true si la photo montre un caniveau, rivière ou voie d'eau obstrué)
}
N'ajoute rien d'autre que le JSON.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
        },
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
        const txt = await res.text();
        console.error("AI gateway error", res.status, txt);
        return FALLBACK;
      }

      const json: any = await res.json();
      const content: string = json?.choices?.[0]?.message?.content ?? "";
      const parsed = JSON.parse(content);

      return {
        type: parsed.type ?? "inconnu",
        confidence: Math.max(0, Math.min(1, Number(parsed.confidence ?? 0.6))),
        severity: parsed.severity ?? "modere",
        volumeEstimateM3: Number(parsed.volumeEstimateM3 ?? 1),
        description: String(parsed.description ?? FALLBACK.description),
        recommendations: Array.isArray(parsed.recommendations)
          ? parsed.recommendations.slice(0, 4).map(String)
          : FALLBACK.recommendations,
        floodRisk: Boolean(parsed.floodRisk),
      };
    } catch (err) {
      console.error("AI analyze failed", err);
      return FALLBACK;
    }
  });
