import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { analyzeWastePhotoAdvanced } from "./waste-ai/analysis.functions";
import type { CaptureResult } from "@/components/waste-ai/SmartWasteCamera";
import { detectCityCommune, DEFAULT_CITY } from "./cities";
import { pushLiveReport, urgencyFromSeverity } from "./live-reports";
import { severityFromAnalysis, priorityScoreFromAnalysis } from "./dashboard-analytics";
import { computePerceptualHash, findDuplicate, saveHash } from "./image-hash";

// Empreinte perceptuelle aHash 8x8 → 16 hex chars.
const HashSchema = z
  .string()
  .regex(/^[0-9a-f]{16}$/i, "Empreinte invalide");

const ValidateSchema = z.object({
  hash: HashSchema,
  lat: z.number().gte(-90).lte(90).optional(),
  lng: z.number().gte(-180).lte(180).optional(),
  category: z.string().max(40).optional(),
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
  .inputValidator((d: unknown) => ValidateSchema.parse(d))
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
  .inputValidator((d: unknown) => CommitSchema.parse(d))
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
});

export const submitCitizenReport = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => CitizenReportSchema.parse(d))
  .handler(async ({ data }): Promise<{ success: true; reportId: string }> => {
    console.log("[1] Début submitCitizenReport");
    const { capture, description, hash } = data as { capture: CaptureResult; description?: string; hash: string };

    try {
      if (!capture.location) {
        throw new Error("Localisation GPS manquante.");
      }
      
      console.log("[2] Vérification anti-fraude");
      const duplicateCheck = await validateReportHash({ data: { hash, lat: capture.location.lat, lng: capture.location.lng }});
      console.log("[3] Validation anti-fraude terminée");
      if (duplicateCheck.duplicate) {
        console.log(`Duplicate report detected (similarity: ${duplicateCheck.similarity}%), proceeding anyway but could be flagged.`);
      }

      const preliminaryCommune = detectCityCommune(DEFAULT_CITY, capture.location.lat, capture.location.lng).id;

      const preliminaryReport = {
          author: "Citoyen Anonyme",
          authorId: "anonyme",
          authorRole: "anonyme" as const,
          province: "Kinshasa",
          city: "Kinshasa",
          commune: preliminaryCommune,
          category: "mixte" as const,
          urgency: 3, // Default urgency
          description: description || "Signalement citoyen rapide.",
          lat: capture.location.lat,
          lng: capture.location.lng,
          photoUrl: capture.imageDataUrl,
          status: "pending_analysis" as const,
          cameraCapability: capture.cameraCapability,
          capturedAt: capture.capturedAt,
          greenPointsAwarded: 0,
      };
      
      console.log("[4] Création du signalement");
      const item = pushLiveReport(preliminaryReport);
      console.log("[5] Signalement créé, ID:", item.id);
      
      console.log("[6] Commit du hash");
      await commitReportHash({ data: { hash, lat: capture.location.lat, lng: capture.location.lng, reportId: item.id, category: 'mixte' }});
      console.log("[7] Commit terminé");
      
      console.log("[8] Début analyse IA");
      const analysisResult = await analyzeWastePhotoAdvanced({
        data: {
          imageDataUrl: capture.imageDataUrl,
          additionalImages: capture.additionalImages,
          lat: capture.location?.lat,
          lng: capture.location?.lng,
          accuracy: capture.location?.accuracy,
          altitudeM: capture.location?.altitudeM,
          capturedAt: capture.capturedAt,
          cameraCapability: capture.cameraCapability,
          depthData: capture.depthData,
        },
      });
      console.log("[9] Analyse IA terminée");
      
      // Now, update the report with the full analysis
      console.log("[10] Mise à jour du signalement");
      item.category = analysisResult.mainCategory;
      item.urgency = urgencyFromSeverity(severityFromAnalysis(analysisResult), analysisResult.floodRisk);
      item.volumeM3 = analysisResult.dimensions.volumeM3;
      item.priorityScore = priorityScoreFromAnalysis(analysisResult, item.commune);
      item.composition = analysisResult.composition;
      item.weightTons = analysisResult.weight.weightTons;
      item.dimensions = analysisResult.dimensions;
      item.priorityLevel = analysisResult.priorityLevel;
      item.healthRisk = analysisResult.healthRisk;
      item.aiAnalysis = analysisResult;
      item.status = 'en_attente'; // Analysis complete, ready for authority review
      console.log("[11] Mise à jour terminée");

      console.log("[12] Fin submitCitizenReport");
      return { success: true, reportId: item.id };
    } catch (error) {
      console.error("Erreur détaillée dans submitCitizenReport:", error instanceof Error ? error.message : error);
      if (error instanceof Error && error.stack) {
        console.error(error.stack);
      }
      throw error;
    }
  });


