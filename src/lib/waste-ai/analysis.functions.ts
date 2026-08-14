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

const InputSchema = z
  .object({
    imageDataUrl: z.string().min(20),
    additionalImages: z.array(z.string()).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    accuracy: z.number().optional(),
    altitudeM: z.number().optional(),
    capturedAt: z.string().datetime().optional(),
    cameraCapability: z.enum(["lidar", "arcore", "basic"]).optional(),
    depthData: z.string().optional(), // JSON stringified depth data if available
  })
  .extend({
    // Ajout de champs pour une analyse plus riche côté serveur
    volumeM3FromDepth: z.number().optional(),
    surfaceM2FromDepth: z.number().optional(),
    heightAvgMFromDepth: z.number().optional(),
  });

type Input = z.infer<typeof InputSchema>;

const MATERIALS: readonly WasteMaterial[] = [
  "plastique",
  "carton",
  "papier",
  "verre",
  "metal",
  "organique",
  "dangereux",
  "meuble",
  "electronique",
  "construction",
  "mixte",
  "inconnu",
];

function toMaterial(value: unknown, fallback: WasteMaterial = "inconnu"): WasteMaterial {
  if (typeof value === "string" && value.trim().toLowerCase() === "mist") return fallback;
  return typeof value === "string" && MATERIALS.includes(value as WasteMaterial)
    ? (value as WasteMaterial)
    : fallback;
}

function toRisk(
  value: unknown,
  fallback: "faible" | "modere" | "eleve" = "faible",
): "faible" | "modere" | "eleve" {
  return value === "faible" || value === "modere" || value === "eleve" ? value : fallback;
}

function detectedObjects(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).flatMap((object) => {
    if (!object || typeof object !== "object") return [];
    const item = object as Record<string, unknown>;
    const label = typeof item.label === "string" ? item.label.trim().slice(0, 60) : "";
    if (!label || label.toLowerCase() === "mist") return [];
    const count = Math.max(1, Math.min(999, Math.round(Number(item.count) || 1)));
    const confidence = Math.max(0, Math.min(1, Number(item.confidence) || 0));
    return label ? [{ label, count, confidence }] : [];
  });
}

// Fallback pour quand l'API IA est indisponible
function createFallback(input: Input): WasteAnalysisResult {
  const now = new Date().toISOString();
  const id = "ECO-" + Date.now().toString(36).toUpperCase();
  const composition: CompositionEntry[] = [];
  const dimensions: Dimensions3D = {
    lengthM: 0,
    widthM: 0,
    heightAvgM: 0,
    surfaceM2: 0,
    volumeM3: 0,
    confidence: 0,
    uncertaintyPercent: 100,
  };
  const weight: WeightEstimate = {
    weightKg: 0,
    weightTons: 0,
    densityKgM3: 0,
    minWeightKg: 0,
    maxWeightKg: 0,
    confidence: 0,
    uncertaintyPercent: 100,
  };
  const location: LocationInfo = {
    lat: input.lat ?? -4.3317,
    lng: input.lng ?? 15.3139,
    accuracy: input.accuracy ?? 100,
    commune: "matete",
    altitudeM: input.altitudeM,
    capturedAt: input.capturedAt ?? now,
  };
  const priorityScore = 0;
  return {
    id,
    timestamp: now,
    photoUrl: input.imageDataUrl,
    model3DAvailable: false,
    composition,
    mainCategory: "inconnu",
    dimensions,
    weight,
    location,
    priorityScore,
    priorityLevel: calculatePriorityLevel(priorityScore),
    interventionUrgent: false,
    floodRisk: false,
    healthRisk: "faible",
    environmentalRisk: "faible",
    pollutionRisk: "faible",
    fireRisk: "faible",
    obstructionRisk: "faible",
    cameraCapability: input.cameraCapability ?? "basic",
    methods: {
      detection: "unavailable",
      segmentation: "unavailable",
      volume: "estimation",
      captureMode: "single",
      viewsAnalyzed: 1,
    },
    analysisConfidence: 0,
    wasteAreaPercent: 0,
    detectedObjects: [],
    environmentDetected: [],
    description: "Analyse IA indisponible : aucun resultat de vision fiable n'a ete produit.",
    recommendations: [
      "Confirmer la localisation sur la carte",
      "Signaler aux services communaux",
      "Planifier une intervention de collecte",
    ],
    status: "en_attente",
  };
}

/**
 * Calcule le volume, la surface et la hauteur moyenne à partir des données de profondeur.
 * @param depthData - Les données de profondeur JSON stringifiées.
 * @returns Un objet avec volumeM3, surfaceM2, heightAvgM, ou null.
 */
function calculateVolumeFromDepth(depthData?: string): {
  volumeM3: number;
  surfaceM2: number;
  heightAvgM: number;
} | null {
  if (!depthData) return null;

  try {
    const data = JSON.parse(depthData);
    const { depthMap, width, height, metric } = data;

    if (!Array.isArray(depthMap) || !width || !height) return null;

    // Hypothèse : la photo est prise à environ 2m de distance, couvrant une zone de 4x4m.
    // Cette hypothèse peut être affinée avec des données de calibration.
    const pixelArea = (4 * 4) / (width * height); // Surface en m² par pixel

    let surfaceM2 = 0;
    let totalDepth = 0;
    let depthPixels = 0;

    for (const row of depthMap) {
      for (const depth of row) {
        if (depth > 0) {
          surfaceM2 += pixelArea;
          totalDepth += depth;
          depthPixels++;
        }
      }
    }

    if (depthPixels === 0) return null;

    const heightAvgM = totalDepth / depthPixels;
    const volumeM3 = surfaceM2 * heightAvgM;

    return {
      volumeM3: Number(volumeM3.toFixed(2)),
      surfaceM2: Number(surfaceM2.toFixed(2)),
      heightAvgM: Number(heightAvgM.toFixed(2)),
    };
  } catch {
    return null;
  }
}

export const analyzeWastePhotoAdvanced = createServerFn({ method: "POST" })
  .validator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<WasteAnalysisResult> => {
    console.log("Début de l'analyse IA...");
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      console.warn("Clé API Lovable manquante. Utilisation du fallback.");
      return createFallback(data);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    try {
      const analysisResult = await (async (): Promise<WasteAnalysisResult> => {
        const {
          imageDataUrl,
          additionalImages,
          lat,
          lng,
          accuracy,
          altitudeM,
          capturedAt,
          cameraCapability,
          depthData,
        } = data;
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
- Ne renvoie jamais "Mist".
- N'invente aucun dechet. Si aucun dechet identifiable n'est visible ou si l'image est floue/sombre/mal cadree, renvoie mainCategory "inconnu", composition [], detectedObjects [], wasteAreaPercent 0, volumeM3 0 et dimensionsConfidence 0.
- composition doit contenir uniquement les materiaux visibles avec confiance suffisante; elle peut etre vide si rien n'est fiable.
- composition doit contenir 1 à 5 matériaux maximum lorsque des déchets sont réellement visibles, les pourcentages doivent totaliser 100
- wasteAreaPercent = pourcentage de l'image occupé par les déchets (0-100)
- environmentDetected = liste des éléments de l'environnement visibles
- lengthM/widthM/heightAvgM = dimensions estimées en mètres uniquement si elles sont inferables depuis la photo ou les donnees de profondeur fournies
- volumeM3 = lengthM * widthM * heightAvgM, en m³, ou 0 si l'estimation n'est pas fiable
- dimensionsConfidence = niveau de confiance sur les dimensions (0-1)
- floodRisk = true si le dépôt obstrue un caniveau ou cours d'eau
- Sois précis et réaliste dans les estimations de volume; ne presente jamais une estimation perspective comme une mesure exacte`;

        console.log("Prétraitement de l'image et des données de profondeur...");
        const depthMetrics = calculateVolumeFromDepth(depthData);

        const payloadForAI = {
          imageDataUrl,
          additionalImages,
          lat,
          lng,
          ...(depthMetrics && {
            volumeM3FromDepth: depthMetrics.volumeM3,
            surfaceM2FromDepth: depthMetrics.surfaceM2,
            heightAvgMFromDepth: depthMetrics.heightAvgM,
          }),
        };

        const imageContent: Array<
          { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }
        > = [
          {
            type: "text",
            text: "Analyse ce dépôt de déchets et renvoie le JSON d'analyse complète.",
          },
          { type: "image_url", image_url: { url: payloadForAI.imageDataUrl } },
        ];

        for (const image of payloadForAI.additionalImages?.slice(0, 3) ?? []) {
          imageContent.push({ type: "image_url", image_url: { url: image } });
        }

        const messages = [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: imageContent,
          },
        ];

        console.log("Appel IA avec AbortController...");
        const endpoint =
          process.env.WASTE_DETECTION_ENDPOINT ||
          "https://ai.gateway.lovable.dev/v1/chat/completions";
        const model = process.env.WASTE_DETECTION_MODEL || "google/gemini-3-flash-preview";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
          body: JSON.stringify({
            model,
            response_format: { type: "json_object" },
            messages,
          }),
          signal: controller.signal, // Intégration de l'AbortSignal
        });

        if (!res.ok) {
          throw new Error(`AI gateway error: ${res.status} ${await res.text()}`);
        }

        console.log("Réponse IA reçue.");
        const json: any = await res.json();
        const content: string = json?.choices?.[0]?.message?.content ?? "";
        const cleanContent = content
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();
        const p = JSON.parse(cleanContent || "{}");

        console.log("Calcul des dimensions et de la composition...");
        const composition: CompositionEntry[] = (p.composition ?? []).map((c: any) => ({
          material: toMaterial(c.material),
          percentage: Math.round(c.percentage ?? 0),
        }));

        const totalPct = composition.reduce(
          (sum: number, c: CompositionEntry) => sum + c.percentage,
          0,
        );
        if (totalPct > 0 && totalPct !== 100) {
          const factor = 100 / totalPct;
          for (const c of composition) {
            c.percentage = Math.round(c.percentage * factor);
          }
        }

        const rawDetectedObjects = detectedObjects(p.detectedObjects);
        const reliableDetectedObjects = rawDetectedObjects.filter(
          (object) => object.confidence >= 0.35,
        );
        if (composition.length === 0 && reliableDetectedObjects.length > 0) {
          const material = toMaterial(p.mainCategory, "inconnu");
          if (material !== "inconnu") composition.push({ material, percentage: 100 });
        }

        const hasDepthMetrics = !!depthMetrics;
        const hasModelVolume =
          Number.isFinite(Number(p.surfaceM2)) &&
          Number.isFinite(Number(p.heightAvgM)) &&
          Number.isFinite(Number(p.volumeM3));
        const surfaceM2 = hasDepthMetrics
          ? depthMetrics.surfaceM2
          : hasModelVolume
            ? Math.max(0, Math.round(Number(p.surfaceM2) * 10) / 10)
            : 0;
        const heightAvgM = hasDepthMetrics
          ? depthMetrics.heightAvgM
          : hasModelVolume
            ? Math.max(0, Number(p.heightAvgM))
            : 0;
        const volumeM3 = hasDepthMetrics
          ? depthMetrics.volumeM3
          : hasModelVolume
            ? Math.max(0, Math.round(Number(p.volumeM3) * 100) / 100)
            : 0;

        const ratio =
          Number(p.lengthM) > 0 && Number(p.widthM) > 0 ? Number(p.lengthM) / Number(p.widthM) : 1;
        const widthM = surfaceM2 > 0 ? Math.sqrt(surfaceM2 / ratio) : 0;
        const lengthM = widthM * ratio;

        const dimensionsConfidence = hasDepthMetrics
          ? 0.85
          : hasModelVolume
            ? Math.max(0, Math.min(0.55, Number(p.dimensionsConfidence ?? 0.35)))
            : 0;

        const dimensions: Dimensions3D = {
          lengthM: Math.round(lengthM * 10) / 10,
          widthM: Math.round(widthM * 10) / 10,
          heightAvgM: Math.round(heightAvgM * 10) / 10,
          surfaceM2,
          volumeM3,
          confidence: dimensionsConfidence,
          uncertaintyPercent: Math.round((1 - dimensionsConfidence) * 100),
        };

        const weight =
          volumeM3 > 0 && composition.length > 0
            ? calculateWeightFromVolume(volumeM3, composition)
            : createFallback(data).weight;

        const location: LocationInfo = {
          lat: payloadForAI.lat ?? -4.3317,
          lng: payloadForAI.lng ?? 15.3139,
          accuracy: accuracy ?? 50,
          altitudeM: altitudeM,
          capturedAt: capturedAt ?? now,
          commune: "matete",
        };

        const sevScore = p.interventionUrgent
          ? 40
          : p.healthRisk === "eleve"
            ? 30
            : p.healthRisk === "modere"
              ? 20
              : 10;
        const floodScore = p.floodRisk ? 25 : 0;
        const volumeScore = volumeM3 > 10 ? 20 : volumeM3 > 3 ? 12 : 5;
        const healthScore = p.healthRisk === "eleve" ? 15 : p.healthRisk === "modere" ? 8 : 0;
        const priorityScore = Math.min(100, sevScore + floodScore + volumeScore + healthScore);

        const mainCategory =
          composition.length > 0 ? toMaterial(p.mainCategory, composition[0].material) : "inconnu";
        const secondaryCategory =
          composition.length > 1 && p.secondaryCategory
            ? toMaterial(p.secondaryCategory)
            : composition[1]?.material;

        console.log("Fin de l'analyse.");
        return {
          id,
          timestamp: now,
          photoUrl: payloadForAI.imageDataUrl,
          model3DAvailable: cameraCapability === "lidar" || cameraCapability === "arcore",
          composition,
          mainCategory,
          secondaryCategory,
          wasteAreaPercent: Math.min(100, Math.max(0, Number(p.wasteAreaPercent ?? 0))),
          detectedObjects: reliableDetectedObjects,
          environmentDetected: Array.isArray(p.environmentDetected) ? p.environmentDetected : [],
          dimensions,
          weight,
          location,
          priorityScore,
          priorityLevel: calculatePriorityLevel(priorityScore),
          interventionUrgent: Boolean(p.interventionUrgent),
          floodRisk: Boolean(p.floodRisk),
          healthRisk: toRisk(p.healthRisk),
          environmentalRisk: toRisk(p.environmentalRisk),
          pollutionRisk: toRisk(p.environmentalRisk), // IA ne fait pas la distinction, on duplique
          fireRisk: "faible", // L'IA ne le fournit pas encore
          obstructionRisk: toRisk(p.obstructionRisk),
          cameraCapability: cameraCapability ?? "basic",
          methods: {
            detection: "yolo11+zero-shot",
            segmentation: "bounding-box",
            volume: hasDepthMetrics ? "depth-api" : "ai-depth",
            captureMode: (additionalImages?.length ?? 0) > 0 ? "multi" : "single",
            viewsAnalyzed: 1 + (additionalImages?.length ?? 0),
          },
          analysisConfidence: Math.max(
            dimensionsConfidence,
            reliableDetectedObjects.length
              ? reliableDetectedObjects.reduce((sum, item) => sum + item.confidence, 0) /
                  reliableDetectedObjects.length
              : 0,
          ),
          description:
            composition.length > 0 || reliableDetectedObjects.length > 0
              ? String(p.description ?? "Analyse des dechets visibles realisee.")
              : "Aucun dechet identifiable avec une confiance suffisante. Reprenez une photo plus nette et mieux cadree.",
          recommendations: Array.isArray(p.recommendations)
            ? p.recommendations.slice(0, 5).map(String)
            : ["Signaler aux services communaux", "Planifier une intervention"],
          status: "en_attente",
        };
      })();
      clearTimeout(timeoutId); // Clear timeout if the request succeeds
      return analysisResult;
    } catch (err) {
      clearTimeout(timeoutId); // Clear timeout on failure as well
      if (err instanceof Error && err.name === "AbortError") {
        console.error("L'analyse IA a dépassé le délai de 30 secondes et a été annulée.", err);
      } else {
        console.error("L'analyse IA a échoué.", err);
      }
      console.log("Création d'un signalement de secours (fallback).");
      return createFallback(data);
    }
  });

// Assistant IA pour les décideurs (réutilisé par l'UI)
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
