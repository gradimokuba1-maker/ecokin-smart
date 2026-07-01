import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
