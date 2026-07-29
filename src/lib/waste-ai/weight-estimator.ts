import type { CompositionEntry, WasteMaterial, WeightEstimate } from "./types";

type DensityRange = { min: number; typical: number; max: number };

/** Densités apparentes de déchets non compactés (kg/m³), volontairement en plages. */
const BULK_DENSITIES: Record<WasteMaterial, DensityRange> = {
  plastique: { min: 25, typical: 55, max: 110 },
  carton: { min: 35, typical: 70, max: 130 },
  papier: { min: 45, typical: 95, max: 180 },
  verre: { min: 280, typical: 480, max: 750 },
  metal: { min: 180, typical: 420, max: 850 },
  organique: { min: 300, typical: 520, max: 750 },
  dangereux: { min: 180, typical: 360, max: 700 },
  meuble: { min: 80, typical: 170, max: 320 },
  electronique: { min: 180, typical: 350, max: 600 },
  construction: { min: 850, typical: 1350, max: 1900 },
  textile: { min: 55, typical: 120, max: 240 },
  pneu: { min: 180, typical: 320, max: 520 },
  menager: { min: 130, typical: 240, max: 420 },
  mixte: { min: 120, typical: 260, max: 520 },
  inconnu: { min: 80, typical: 220, max: 550 },
};

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function estimateWasteWeight(
  volumeM3: number,
  composition: CompositionEntry[],
  volumeConfidence: number,
  detectionConfidence: number,
): WeightEstimate {
  const usable = composition.filter((entry) => entry.percentage > 0);
  const totalPercentage = usable.reduce((sum, entry) => sum + entry.percentage, 0) || 100;
  let typicalDensity = 0;
  let minimumDensity = 0;
  let maximumDensity = 0;

  for (const entry of usable.length
    ? usable
    : [{ material: "inconnu" as const, percentage: 100 }]) {
    const share = entry.percentage / totalPercentage;
    const density = BULK_DENSITIES[entry.material];
    typicalDensity += density.typical * share;
    minimumDensity += density.min * share;
    maximumDensity += density.max * share;
  }

  const confidence = Math.max(
    0,
    Math.min(0.92, volumeConfidence * 0.65 + detectionConfidence * 0.35),
  );
  const weightKg = Math.max(0, volumeM3 * typicalDensity);
  const minWeightKg = Math.max(0, volumeM3 * minimumDensity * (0.85 + confidence * 0.15));
  const maxWeightKg = Math.max(weightKg, volumeM3 * maximumDensity * (1.15 - confidence * 0.15));
  const uncertaintyPercent =
    weightKg > 0
      ? Math.min(100, Math.round(((maxWeightKg - minWeightKg) / (2 * weightKg)) * 100))
      : 100;

  return {
    weightKg: round(weightKg),
    weightTons: round(weightKg / 1000, 3),
    densityKgM3: round(typicalDensity),
    minWeightKg: round(minWeightKg),
    maxWeightKg: round(maxWeightKg),
    confidence: round(confidence, 2),
    uncertaintyPercent,
  };
}
