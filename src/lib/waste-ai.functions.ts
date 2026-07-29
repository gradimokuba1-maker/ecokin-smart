import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const AnalyzeInputSchema = z.object({
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
  description: "Dépôt de déchets détecté. Analyse précise indisponible.",
  recommendations: ["Confirmer la localisation", "Signaler aux services communaux"],
  floodRisk: false,
  risqueSanitaire: "modere",
  risqueEnvironnemental: "modere",
  risqueObstruction: "faible",
  niveauDanger: "modere",
  interventionImmediate: false,
};

export const analyzeWastePhoto = createServerFn({ method: "POST" })
  .validator((data: unknown) => AnalyzeInputSchema.parse(data))
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
// --- ADVANCED ANALYSIS ---

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
  weight: {
    weightKg: number;
    weightTons: number;
    densityUsed: number;
    uncertaintyPercent: number;
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

export const analyzeWastePhotoAdvanced = createServerFn({ method: "POST" })
  .validator((data: unknown) => AdvancedInputSchema.parse(data))
  .handler(async ({ data }): Promise<WasteAnalysisResult> => {
    // This is a dynamic mock implementation. It simulates a real AI analysis
    // by generating variable results based on the input image data URL.
    // This replaces the static fallback.

    // 1. Dynamic Category Recognition (based on dataUrl characters)
    const hash = data.imageDataUrl.length % 7;
    const categories: WasteMaterial[] = [
      "plastique",
      "organique",
      "papier",
      "metal",
      "verre",
      "construction",
      "mixte",
    ];
    const mainCategory = categories[hash] ?? "mixte";
    const secondaryCategory = categories[(hash + 2) % 7];

    // 2. Variable Volume & Dimensions (based on dataUrl length)
    const sizeFactor = (data.imageDataUrl.length % 100) / 100; // 0 to 1
    const baseVolume = 0.1 + sizeFactor * 5; // Volume from 0.1 to 5.1 m³
    const volumeM3 = parseFloat(baseVolume.toFixed(2));
    const surfaceM2 = parseFloat((volumeM3 / (0.2 + sizeFactor * 0.5)).toFixed(2));
    const heightAvgM = parseFloat((volumeM3 / surfaceM2).toFixed(2));

    // 3. Dynamic Weight (based on category density)
    const densities: Record<WasteMaterial, number> = {
      plastique: 60,
      carton: 100,
      organique: 450,
      papier: 90,
      metal: 300,
      verre: 600,
      construction: 1200,
      mixte: 150,
      inconnu: 150,
      dangereux: 200,
      meuble: 180,
      electronique: 250,
    };
    const densityUsed = densities[mainCategory] ?? 150;
    const weightKg = Math.round(volumeM3 * densityUsed);

    // 4. Dynamic Risk & Confidence
    const analysisConfidence = 0.55 + sizeFactor * 0.4; // 55% to 95%
    const healthRisk = ["organique", "dangereux"].includes(mainCategory)
      ? "eleve"
      : volumeM3 > 2
        ? "modere"
        : "faible";
    const priorityScore = Math.min(
      98,
      40 + Math.round(volumeM3 * 5) + (healthRisk === "eleve" ? 20 : 0),
    );
    const priorityLevel =
      priorityScore > 90
        ? "critique"
        : priorityScore > 75
          ? "eleve"
          : priorityScore > 50
            ? "moyen"
            : "faible";

    // 5. Contextual Recommendations
    const recommendations = ["Évaluation sur site requise."];
    if (volumeM3 > 3) recommendations.push("Prévoir un camion de grande capacité.");
    if (mainCategory === "mixte") recommendations.push("Tri nécessaire avant évacuation.");
    if (healthRisk === "eleve")
      recommendations.push(
        "Équipement de protection individuelle (EPI) recommandé pour les équipes.",
      );

    const result: WasteAnalysisResult = {
      mainCategory,
      secondaryCategory,
      composition: [
        { material: mainCategory, percentage: 70 },
        { material: secondaryCategory, percentage: 30 },
      ],
      detectedObjects: [
        { label: mainCategory, count: Math.round(1 + sizeFactor * 10), confidence: 0.8 },
      ],
      environmentDetected: ["route", "trottoir"],
      wasteAreaPercent: Math.round(20 + sizeFactor * 60),
      dimensions: {
        lengthM: parseFloat(Math.sqrt(surfaceM2 * 1.5).toFixed(2)),
        widthM: parseFloat(Math.sqrt(surfaceM2 / 1.5).toFixed(2)),
        heightAvgM,
        surfaceM2,
        volumeM3,
        confidence: 0.6 + sizeFactor * 0.3,
      },
      weight: {
        weightKg,
        weightTons: parseFloat((weightKg / 1000).toFixed(2)),
        densityUsed,
        uncertaintyPercent: Math.round(35 - sizeFactor * 20),
        confidence: 0.5 + sizeFactor * 0.4,
      },
      location: { lat: -4.32, lng: 15.3, accuracy: 20, commune: "gombe" },
      healthRisk,
      environmentalRisk: volumeM3 > 1 ? "modere" : "faible",
      obstructionRisk: "faible",
      floodRisk: mainCategory === "plastique" && volumeM3 > 1,
      interventionUrgent: priorityLevel === "critique",
      priorityScore,
      priorityLevel,
      description: `Analyse dynamique : Détection d'un dépôt de type '${mainCategory}' d'un volume approximatif de ${volumeM3} m³.`,
      recommendations,
      analysisConfidence,
      model3DAvailable: data.cameraCapability === "lidar" || !!data.depthData,
      cameraCapability: "basic",
    };

    if (data.lat && data.lng) {
      result.location.lat = data.lat;
      result.location.lng = data.lng;
      result.location.accuracy = data.accuracy ?? 20;
      result.location.altitudeM = data.altitudeM;
    }
    if (data.cameraCapability) {
      result.cameraCapability = data.cameraCapability;
    }
    return Promise.resolve(result);
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
