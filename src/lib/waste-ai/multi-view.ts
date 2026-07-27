import type { CompositionEntry, WasteMaterial } from "./types";

/**
 * Fusionne plusieurs compositions provenant de vues différentes en une seule
 * estimation agrégée. Chaque entrée est pondérée par la confiance globale de
 * la vue d'origine, ce qui lisse les erreurs de perspective isolées.
 */
export function mergeMultiViewCompositions(views: CompositionEntry[][]): CompositionEntry[] {
    const totals = new Map<WasteMaterial, number>();
    let totalWeight = 0;

    for (const composition of views) {
        for (const entry of composition) {
            if (entry.percentage <= 0) continue;
            const weight = entry.percentage;
            totals.set(entry.material, (totals.get(entry.material) ?? 0) + weight);
            totalWeight += weight;
        }
    }

    if (totalWeight === 0) return [{ material: "inconnu", percentage: 100 }];

    const merged = Array.from(totals.entries())
        .map(([material, value]) => ({
            material,
            percentage: Math.round((value / totalWeight) * 100),
        }))
        .filter((entry) => entry.percentage > 0)
        .sort((a, b) => b.percentage - a.percentage);

    const totalPct = merged.reduce((sum, entry) => sum + entry.percentage, 0);
    if (totalPct !== 100 && merged.length > 0) {
        merged[0].percentage += 100 - totalPct;
    }

    return merged;
}