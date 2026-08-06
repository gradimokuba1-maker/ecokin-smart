import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { analyzeWastePhotoAdvanced } from "./waste-ai";
import type { CaptureResult } from "@/components/waste-ai/SmartWasteCamera";
import { detectCityCommune, DEFAULT_CITY } from "./cities";
import { pushLiveReport } from "./live-reports";
import { updateReport } from "./ecokin-db";
import { computePerceptualHash } from "./image-hash";
import { runServerWasteAIEngine, getServerAIAnalysis } from "./waste-ai/ai-engine";
import { registerValidatedImage } from "./waste-ai/ai-learning";

// Empreinte perceptuelle aHash 8x8 → 16 hex chars.
const HashSchema = z.string().regex(/^[0-9a-f]{16}$/i, "Empreinte invalide");

const ValidateSchema = z.object({
  hash: HashSchema,
  lat: z.number().gte(-90).lte(90).optional(),
  lng: z.number().gte(-180).lte(180).optional(),
  category: z.string().max(40).optional(),
  reportId: z.string().min(3).max(60).optional(),
});

const CommitSchema = ValidateSchema.extend({
  reportId: z.string().min(3).max(60),
});

// Store en mémoire (isolate Worker). Persiste entre requêtes du même isolate.
type Stored = { hash: string; at: string; reportId?: string; lat?: number; lng?: number };
const STORE_KEY = "__ecokin_hashes__";
type G = typeof globalThis & { [STORE_KEY]?: Stored[] };
function store(): Stored[] {
  const g = globalThis as G;
  if (!g[STORE_KEY]) g[STORE_KEY] = [];
  return g[STORE_KEY]!;
}

function hamming(a: string, b: string): number {
  if (a.length !== b.length) return 64;
  let d = 0;
  for (let i = 0; i < a.length; i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (x) {
      d += x & 1;
      x >>= 1;
    }
  }
  return d;
}
function similarity(a: string, b: string) {
  return Math.round((1 - hamming(a, b) / 64) * 100);
}

export type DuplicateCheck = {
  duplicate: boolean;
  similarity?: number;
  matchedAt?: string;
  matchedReportId?: string;
  distanceMeters?: number;
};

// 1) Vérification anti-fraude côté serveur (avant enregistrement).
export const validateReportHash = createServerFn({ method: "POST" })
  .validator((d: unknown) => ValidateSchema.parse(d))
  .handler(async ({ data }): Promise<DuplicateCheck> => {
    const list = store();
    let best: { s: Stored; sim: number } | null = null;
    for (const s of list) {
      const sim = similarity(s.hash, data.hash);
      if (sim >= 95 && (!best || sim > best.sim)) best = { s, sim };
    }
    if (!best) return { duplicate: false };
    let distance: number | undefined;
    if (data.lat != null && data.lng != null && best.s.lat != null && best.s.lng != null) {
      const R = 6371000,
        toR = (v: number) => (v * Math.PI) / 180;
      const dLat = toR(best.s.lat - data.lat);
      const dLng = toR(best.s.lng - data.lng);
      const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toR(data.lat)) * Math.cos(toR(best.s.lat)) * Math.sin(dLng / 2) ** 2;
      distance = Math.round(2 * R * Math.asin(Math.sqrt(h)));
    }
    return {
      duplicate: true,
      similarity: best.sim,
      matchedAt: best.s.at,
      matchedReportId: best.s.reportId,
      distanceMeters: distance,
    };
  });

// 2) Enregistrement côté serveur du hash (après création du signalement côté client).
export const commitReportHash = createServerFn({ method: "POST" })
  .validator((d: unknown) => CommitSchema.parse(d))
  .handler(async ({ data }): Promise<{ ok: true } | DuplicateCheck> => {
    const list = store();
    // Re-vérifier au commit (protection contre TOCTOU).
    for (const s of list) {
      if (similarity(s.hash, data.hash) >= 95) {
        return {
          duplicate: true,
          similarity: similarity(s.hash, data.hash),
          matchedAt: s.at,
          matchedReportId: s.reportId,
        };
      }
    }
    list.push({
      hash: data.hash,
      at: new Date().toISOString(),
      reportId: data.reportId,
      lat: data.lat,
      lng: data.lng,
    });
    // Bornage mémoire
    if (list.length > 5000) list.splice(0, list.length - 5000);
    return { ok: true };
  });

// 3) Nouveau flux de soumission citoyen (asynchrone)
const CitizenReportSchema = z.object({
  capture: z.any(), // Zod schema for CaptureResult is complex, 'any' is pragmatic for now
  description: z.string().max(500).optional(),
  hash: HashSchema,
  author: z.string().max(80).optional(),
  authorId: z.string().max(80).optional(),
  authorRole: z
    .union([
      z.literal("citoyen"),
      z.literal("agent"),
      z.literal("bourgmestre"),
      z.literal("gouverneur"),
      z.literal("admin"),
      z.literal("anonyme"),
    ])
    .optional(),
  reportId: z.string().min(3).max(60),
});

export const submitCitizenReport = createServerFn({ method: "POST" })
  .validator((d: unknown) => CitizenReportSchema.parse(d))
  .handler(
    async ({
      data,
    }): Promise<{
      success: true;
      reportId: string;
      analysisPatch: Partial<import("./live-reports").LiveReport>;
    }> => {
      console.log("[1] Début submitCitizenReport");
      const { capture, description, hash, reportId } = data;
      console.log("[1.1] Capture summary", {
        hasLocation: Boolean(capture?.location),
        imageUrlLength: capture?.imageDataUrl?.length ?? 0,
        additionalCount: Array.isArray(capture?.additionalImages)
          ? capture.additionalImages.length
          : 0,
      });

      if (
        !capture.location ||
        typeof capture.location.lat !== "number" ||
        typeof capture.location.lng !== "number"
      ) {
        throw new Error("Localisation GPS invalide ou manquante.");
      }

      console.log("[2] Vérification anti-fraude");
      const duplicateCheck = await validateReportHash({
        data: { hash, lat: capture.location.lat, lng: capture.location.lng },
      });
      console.log("[3] Validation anti-fraude terminée");
      if (duplicateCheck.duplicate) {
        console.log(
          `Duplicate report detected (similarity: ${duplicateCheck.similarity}%), proceeding anyway but could be flagged.`,
        );
      }

      await commitReportHash({
        data: {
          hash,
          lat: capture.location.lat,
          lng: capture.location.lng,
          reportId: reportId,
          category: "mixte",
        },
      });

      try {
        console.log("[4] Lancement de l'analyse IA");
        const analysisResult = await analyzeWastePhotoAdvanced({
          data: {
            imageDataUrl: capture.imageDataUrl,
            additionalImages: capture.additionalImages,
            lat: capture.location?.lat,
            lng: capture.location?.lng,
            accuracy: capture.location?.accuracy,
            altitudeM: capture.location?.altitudeM,
            capturedAt: capture.capturedAt,
            cameraCapability:
              capture.cameraCapability === "lidar" || capture.cameraCapability === "arcore"
                ? capture.cameraCapability
                : "basic",
            depthData: capture.depthData,
          },
        });
        console.log("[5] Analyse IA terminée");

        const engineResult = await runServerWasteAIEngine(reportId, capture, analysisResult);
        // Reconcile analysisResult (LLM or fallback) with server-side quantification.
        // If the server quantification is more confident or analysis returned a generic "mixte",
        // prefer the server-derived main category and composition computed from detected objects.
        const engineConfidence = engineResult.summary?.confidence ?? 0;
        const analysisConfidence = analysisResult.analysisConfidence ?? 0;

        // Build composition from engine detected objects when available
        function compositionFromEngineObjects() {
          const map = new Map<string, number>();
          for (const obj of engineResult.objects ?? []) {
            const key = (obj.material || "mixte") as string;
            const weight = (obj.surface || 0) * (obj.confidence || 1);
            map.set(key, (map.get(key) || 0) + weight);
          }
          const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
          if (total === 0) return [{ material: "mixte", percentage: 100 }];
          const arr = Array.from(map.entries())
            .map(([material, v]) => ({ material, percentage: Math.round((v / total) * 100) }))
            .sort((a, b) => b.percentage - a.percentage);
          const corr = 100 - arr.reduce((s, it) => s + it.percentage, 0);
          if (arr[0]) arr[0].percentage += corr;
          return arr;
        }

        const engineComposition = compositionFromEngineObjects();
        const engineMain = engineComposition[0]?.material ?? engineResult.summary?.mainCategory ?? "mixte";

        let finalMainCategory = analysisResult.mainCategory;
        let finalComposition = analysisResult.composition;
        // Choose engine result when it's meaningfully more confident or analysis gave a generic mixte
        if (
          engineResult.objects.length > 0 &&
          (analysisResult.mainCategory === "mixte" || engineConfidence > analysisConfidence + 0.05)
        ) {
          finalMainCategory = engineMain as any;
          finalComposition = engineComposition as any;
        }
        registerValidatedImage(
          reportId,
          capture,
          engineResult.objects.map((object) => ({
            reportId: reportId,
            category: object.category,
            material: object.material,
            confidence: object.confidence,
            boundingBox: object.boundingBox,
            mask: object.segmentationMask,
            correctedBy: "server-ai",
            correctedAt: new Date().toISOString(),
          })),
        );

        const combinedConfidence = Math.max(analysisConfidence, engineConfidence);

        const patch: Partial<import("./live-reports").LiveReport> = {
          category: finalMainCategory,
          description: analysisResult.description || description,
          volumeM3: analysisResult.dimensions?.volumeM3,
          priorityScore: analysisResult.priorityScore,
          priorityLevel: analysisResult.priorityLevel,
          analysisConfidence: combinedConfidence,
          dimensions: analysisResult.dimensions,
          cameraCapability: analysisResult.cameraCapability ?? "basic",
          model3DAvailable: analysisResult.model3DAvailable ?? false,
          healthRisk: analysisResult.healthRisk,
          floodRisk: analysisResult.floodRisk,
          interventionUrgent: analysisResult.interventionUrgent,
          composition: finalComposition?.map((c) => ({
            material: c.material,
            percentage: c.percentage,
          })),
          aiAnalysis: analysisResult,
          ...(analysisResult.interventionUrgent || analysisResult.priorityLevel === "critique"
            ? { status: "assignee" as const }
            : {}),
        };

        // Compute weight estimate when we have volume and composition
        try {
          const vol = patch.volumeM3;
          const comp = patch.composition ?? (analysisResult.composition as any);
          if (vol && comp && comp.length) {
            const { calculateWeightFromVolume } = await import("./waste-ai/types");
            const w = calculateWeightFromVolume(vol, comp as any);
            patch.weightKg = w.weightKg;
            patch.weightTons = w.weightTons;
          }
        } catch (e) {
          // ignore weight calculation failures
        }

        console.log("[6] Envoi du patch d'analyse au client");
        return {
          success: true,
          reportId: reportId,
          analysisPatch: patch,
        };
      } catch (analysisError) {
        console.error(
          "Analyse IA en arrière-plan échouée pour le signalement :",
          analysisError instanceof Error ? analysisError.message : analysisError,
        );
        // En cas d'erreur de l'IA, on renvoie quand même un succès partiel.
        return { success: true, reportId: reportId, analysisPatch: {} };
      }
    },
  );
