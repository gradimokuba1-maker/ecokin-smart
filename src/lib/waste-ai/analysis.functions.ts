// EcoKin Smart — Analyse IA avancée des dépôts sauvages
// Composition, quantification 3D, poids, priorité, localisation
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  type WasteAnalysisResult,
  type WasteMaterial,
  type CompositionEntry,
  type CameraCapability,
  type Dimensions3D,
  type WeightEstimate,
  type LocationInfo,
  calculateWeightFromVolume,
  calculatePriorityLevel,
  MATERIAL_DENSITIES,
} from "./types";

const InputSchema = z.object({
  imageDataUrl: z.string().min(20),
  additionalImages: z.array(z.string()).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  accuracy: z.number().optional(),
  altitudeM: z.number().optional(),
  capturedAt: z.string().datetime().optional(),
  cameraCapability: z.enum(["lidar", "arcore", "basic"]).optional(),
  depthData: z.string().optional(), // JSON stringified depth data if available
});

type Input = z.infer<typeof InputSchema>;

const MATERIALS: readonly WasteMaterial[] = [
  "plastique", "carton", "papier", "verre", "metal", "organique",
  "dangereux", "meuble", "electronique", "construction", "mixte", "inconnu",
];

function toMaterial(value: unknown, fallback: WasteMaterial = "inconnu"): WasteMaterial {
  return typeof value === "string" && MATERIALS.includes(value as WasteMaterial)
    ? (value as WasteMaterial)
    : fallback;
}

function toRisk(value: unknown): "faible" | "modere" | "eleve" {
  return value === "faible" || value === "modere" || value === "eleve" ? value : "modere";
}

function detectedObjects(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).flatMap((object) => {
    if (!object || typeof object !== "object") return [];
    const item = object as Record<string, unknown>;
    const label = typeof item.label === "string" ? item.label.trim().slice(0, 60) : "déchet non précisé";
    const count = Math.max(1, Math.min(999, Math.round(Number(item.count) || 1)));
    const confidence = Math.max(0, Math.min(1, Number(item.confidence) || 0));
    return label ? [{ label, count, confidence }] : [];
  });
}

// Fallback pour quand l'API IA est indisponible
function createFallback(input: Input): WasteAnalysisResult {
  const now = new Date().toISOString();
  const id = "ECO-" + Date.now().toString(36).toUpperCase();
  const composition: CompositionEntry[] = [
    { material: "mixte", percentage: 100 },
  ];
  const dimensions: Dimensions3D = {
    lengthM: 1.5,
    widthM: 1.0,
    heightAvgM: 0.8,
    surfaceM2: 1.5,
    volumeM3: 1.2,
    confidence: 0.4,
  };
  const weight = calculateWeightFromVolume(dimensions.volumeM3, composition);
  const location: LocationInfo = {
    lat: input.lat ?? -4.3317,
    lng: input.lng ?? 15.3139,
    accuracy: input.accuracy ?? 100,
    commune: "matete",
    altitudeM: input.altitudeM,
    capturedAt: input.capturedAt ?? now,
  };
  const priorityScore = 45;
  return {
    id,
    timestamp: now,
    photoUrl: input.imageDataUrl,
    model3DAvailable: false,
    composition,
    mainCategory: "mixte",
    dimensions,
    weight,
    location,
    priorityScore,
    priorityLevel: calculatePriorityLevel(priorityScore),
    interventionUrgent: false,
    floodRisk: false,
    healthRisk: "modere",
    environmentalRisk: "modere",
    obstructionRisk: "faible",
    cameraCapability: input.cameraCapability ?? "basic",
    analysisConfidence: 0.4,
    wasteAreaPercent: 60,
    detectedObjects: [{ label: "dépôt mélangé", count: 1, confidence: 0.4 }],
    environmentDetected: ["sol", "route"],
    description: "Dépôt de déchets détecté. Analyse précise indisponible (mode dégradé).",
    recommendations: [
      "Confirmer la localisation sur la carte",
      "Signaler aux services communaux",
      "Planifier une intervention de collecte",
    ],
    status: "en_attente",
  };
}

export const analyzeWastePhotoAdvanced = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<WasteAnalysisResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return createFallback(data);

    const now = new Date().toISOString();
    const id = "ECO-" + Date.now().toString(36).toUpperCase();

    const systemPrompt = `Tu es l'IA EcoKin Smart spécialisée dans l'analyse des dépôts sauvages à Kinshasa (RDC).
Réponds UNIQUEMENT avec un JSON valide, sans texte avant ni après.

Analyse la photo et renvoie ce JSON EXACT :
{
  "mainCategory": "plastique"|"carton"|"papier"|"verre"|"metal"|"organique"|"dangereux"|"meuble"|"electronique"|"construction"|"mixte"|"inconnu",
  "secondaryCategory": "plastique"|"carton"|"papier"|"verre"|"metal"|"organique"|"dangereux"|"meuble"|"electronique"|"construction"|"mixte"|"inconnu"|null,
  "composition": [
    {"material": "plastique", "percentage": 45},
    {"material": "carton", "percentage": 25}
  ],
  "detectedObjects": [
    {"label": "bouteilles PET", "count": 12, "confidence": 0.91},
    {"label": "sacs plastiques", "count": 4, "confidence": 0.82}
  ],
  "wasteAreaPercent": 65,
  "environmentDetected": ["route", "sol", "arbres"],
  "lengthM": 5.0,
  "widthM": 3.0,
  "heightAvgM": 1.5,
  "surfaceM2": 15.0,
  "volumeM3": 22.5,
  "dimensionsConfidence": 0.75,
  "floodRisk": false,
  "healthRisk": "faible"|"modere"|"eleve",
  "environmentalRisk": "faible"|"modere"|"eleve",
  "obstructionRisk": "faible"|"modere"|"eleve",
  "interventionUrgent": false,
  "description": "Courte description en français du dépôt observé",
  "recommendations": ["Recommandation 1", "Recommandation 2", "Recommandation 3"]
}

RÈGLES IMPORTANTES :
- composition doit contenir 1 à 5 matériaux, les pourcentages doivent totaliser 100
- wasteAreaPercent = pourcentage de l'image occupé par les déchets (0-100)
- environmentDetected = liste des éléments de l'environnement visibles
- lengthM/widthM/heightAvgM = dimensions estimées en mètres
- volumeM3 = lengthM * widthM * heightAvgM
- dimensionsConfidence = niveau de confiance sur les dimensions (0-1)
- floodRisk = true si le dépôt obstrue un caniveau ou cours d'eau
- Sois précis et réaliste dans les estimations de volume`;

    try {
      const messages: any[] = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyse ce dépôt de déchets et renvoie le JSON d'analyse complète." },
            { type: "image_url", image_url: { url: data.imageDataUrl } },
          ],
        },
      ];

      // Ajouter les images supplémentaires si disponibles
      if (data.additionalImages && data.additionalImages.length > 0) {
        for (const img of data.additionalImages.slice(0, 3)) {
          messages.push({
            role: "user",
            content: [
              { type: "text", text: "Voici une vue supplémentaire du même dépôt." },
              { type: "image_url", image_url: { url: img } },
            ],
          });
        }
      }

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          response_format: { type: "json_object" },
          messages,
        }),
      });

      if (!res.ok) {
        console.error("AI gateway error", res.status, await res.text());
        return createFallback(data);
      }

      const json: any = await res.json();
      const content: string = json?.choices?.[0]?.message?.content ?? "";
      const p = JSON.parse(content);

      // Construire la composition
      const composition: CompositionEntry[] = (p.composition ?? []).map((c: any) => ({
        material: toMaterial(c.material),
        percentage: Math.round(c.percentage ?? 0),
      }));

      // Normaliser les pourcentages à 100
      const totalPct = composition.reduce((sum: number, c: CompositionEntry) => sum + c.percentage, 0);
      if (totalPct > 0 && totalPct !== 100) {
        const factor = 100 / totalPct;
        for (const c of composition) {
          c.percentage = Math.round(c.percentage * factor);
        }
      }

      if (composition.length === 0) {
        composition.push({ material: toMaterial(p.mainCategory, "mixte"), percentage: 100 });
      }

      // Dimensions 3D
      const lengthM = Math.max(0.1, Number(p.lengthM ?? 1));
      const widthM = Math.max(0.1, Number(p.widthM ?? 1));
      const heightAvgM = Math.max(0.05, Number(p.heightAvgM ?? 0.5));
      const surfaceM2 = Math.round(lengthM * widthM * 10) / 10;
      const volumeM3 = Math.round(lengthM * widthM * heightAvgM * 100) / 100;
      const dimensionsConfidence = Math.max(0, Math.min(1, Number(p.dimensionsConfidence ?? 0.6)));

      const dimensions: Dimensions3D = {
        lengthM: Math.round(lengthM * 10) / 10,
        widthM: Math.round(widthM * 10) / 10,
        heightAvgM: Math.round(heightAvgM * 10) / 10,
        surfaceM2,
        volumeM3,
        confidence: dimensionsConfidence,
      };

      // Poids
      const weight = calculateWeightFromVolume(volumeM3, composition);

      // Localisation
      const location: LocationInfo = {
        lat: data.lat ?? -4.3317,
        lng: data.lng ?? 15.3139,
        accuracy: data.accuracy ?? 50,
        altitudeM: data.altitudeM,
        capturedAt: data.capturedAt ?? now,
        commune: "matete", // sera mis à jour côté client
      };

      // Score de priorité
      const sevScore = p.interventionUrgent ? 40 : p.healthRisk === "eleve" ? 30 : p.healthRisk === "modere" ? 20 : 10;
      const floodScore = p.floodRisk ? 25 : 0;
      const volumeScore = volumeM3 > 10 ? 20 : volumeM3 > 3 ? 12 : 5;
      const healthScore = p.healthRisk === "eleve" ? 15 : p.healthRisk === "modere" ? 8 : 0;
      const priorityScore = Math.min(100, sevScore + floodScore + volumeScore + healthScore);

      const mainCategory = toMaterial(p.mainCategory, "mixte");
      const secondaryCategory = p.secondaryCategory ? toMaterial(p.secondaryCategory) : undefined;

      return {
        id,
        timestamp: now,
        photoUrl: data.imageDataUrl,
        model3DAvailable: data.cameraCapability === "lidar" || data.cameraCapability === "arcore",
        composition,
        mainCategory,
        secondaryCategory,
        wasteAreaPercent: Math.min(100, Math.max(0, Number(p.wasteAreaPercent ?? 50))),
        detectedObjects: detectedObjects(p.detectedObjects),
        environmentDetected: Array.isArray(p.environmentDetected) ? p.environmentDetected : ["sol"],
        dimensions,
        weight,
        location,
        priorityScore,
        priorityLevel: calculatePriorityLevel(priorityScore),
        interventionUrgent: Boolean(p.interventionUrgent),
        floodRisk: Boolean(p.floodRisk),
        healthRisk: toRisk(p.healthRisk),
        environmentalRisk: toRisk(p.environmentalRisk),
        obstructionRisk: toRisk(p.obstructionRisk),
        cameraCapability: data.cameraCapability ?? "basic",
        analysisConfidence: dimensionsConfidence,
        description: String(p.description ?? "Dépôt de déchets détecté."),
        recommendations: Array.isArray(p.recommendations)
          ? p.recommendations.slice(0, 5).map(String)
          : ["Signaler aux services communaux", "Planifier une intervention"],
        status: "en_attente",
      };
    } catch (err) {
      console.error("AI analyze advanced failed", err);
      return createFallback(data);
    }
  });
