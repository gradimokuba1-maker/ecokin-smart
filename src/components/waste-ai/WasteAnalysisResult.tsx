// EcoKin Smart — WasteAnalysisResult : Affichage détaillé des résultats d'analyse IA
// Composition, dimensions 3D, poids, priorité, risques

import { type WasteAnalysisResult, type CompositionEntry, type WasteMaterial } from "@/lib/waste-ai.functions";
import { BarChart3, Box, Crosshair, Gauge, Scale, Shield, Siren, Sparkles, TriangleAlert, Truck, Zap } from "lucide-react";

type Props = {
  result: WasteAnalysisResult;
  loading?: boolean;
};

const MATERIAL_ICONS: Record<WasteMaterial, string> = {
  plastique: "🧴",
  carton: "📦",
  papier: "📄",
  verre: "🍾",
  metal: "⚙️",
  organique: "🍃",
  dangereux: "☠️",
  meuble: "🪑",
  electronique: "🔌",
  construction: "🧱",
  mixte: "♻️",
  inconnu: "❓",
};

const PRIORITY_CONFIG = {
  critique: { color: "text-red-600", bg: "bg-red-500/10", border: "border-red-300", label: "CRITIQUE" },
  eleve: { color: "text-orange-600", bg: "bg-orange-500/10", border: "border-orange-300", label: "ÉLEVÉ" },
  moyen: { color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-300", label: "MOYEN" },
  faible: { color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-300", label: "FAIBLE" },
};

export function WasteAnalysisResultCard({ result, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-4 rounded-3xl border border-eco/30 bg-eco/5 p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-eco" />
          <h3 className="font-display text-lg font-bold">Analyse IA et coaching</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="size-4 animate-spin rounded-full border-2 border-eco border-t-transparent" />
          Analyse en cours…
        </div>
      </div>
    );
  }

  if (!result) return null;

  const priority = PRIORITY_CONFIG[result.priorityLevel];
  const mainIcon = MATERIAL_ICONS[result.mainCategory] ?? "♻️";

  return (
    <div className="space-y-4 rounded-3xl border border-eco/30 bg-eco/5 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-eco" />
          <h3 className="font-display text-lg font-bold">Analyse IA et coaching</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${priority.bg} ${priority.color}`}>
          {priority.label}
        </span>
      </div>

      {/* Badge confiance */}
      <div className="flex items-center gap-2">
        <Shield className="size-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">
          Confiance analyse : {Math.round(result.analysisConfidence * 100)}%
          {result.model3DAvailable && " · 3D disponible"}
        </span>
        {result.cameraCapability === "lidar" && (
          <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[9px] font-bold text-purple-700">LiDAR</span>
        )}
        {result.cameraCapability === "arcore" && (
          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold text-blue-700">ARCore</span>
        )}
      </div>

      {/* Composition */}
      <Section icon={<BarChart3 className="size-4" />} title="Composition estimée">
        <div className="space-y-2">
          {result.composition.map((entry, i) => (
            <CompositionBar key={i} entry={entry} />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="font-semibold capitalize">{mainIcon} {result.mainCategory}</span>
          {result.secondaryCategory && (
            <span className="text-muted-foreground">
              + {MATERIAL_ICONS[result.secondaryCategory]} {result.secondaryCategory}
            </span>
          )}
        </div>
      </Section>

      {result.detectedObjects.length > 0 && (
        <Section icon={<Crosshair className="size-4" />} title="Détections">
          <div className="space-y-2">
            {result.detectedObjects.map((object, i) => (
              <div key={`${object.label}-${i}`} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 text-xs">
                <span className="capitalize">{object.label}</span>
                <span className="font-semibold">{object.count} · {Math.round(object.confidence * 100)}%</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Environnement détecté */}
      {result.environmentDetected.length > 0 && (
        <Section icon={<Crosshair className="size-4" />} title="Environnement">
          <div className="flex flex-wrap gap-1">
            {result.environmentDetected.map((env, i) => (
              <span key={i} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium">
                {env}
              </span>
            ))}
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            Zone déchets : {result.wasteAreaPercent}% de l'image
          </div>
        </Section>
      )}

      {/* Dimensions 3D */}
      <Section icon={<Box className="size-4" />} title="Dimensions 3D">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <DimBox label="Longueur" value={`${result.dimensions.lengthM} m`} />
          <DimBox label="Largeur" value={`${result.dimensions.widthM} m`} />
          <DimBox label="Hauteur" value={`${result.dimensions.heightAvgM} m`} />
          <DimBox label="Surface" value={`${result.dimensions.surfaceM2} m²`} />
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-secondary/50 p-2">
          <Gauge className="size-4 text-eco" />
          <span className="text-sm font-bold">
            Volume : {result.dimensions.volumeM3} m³
          </span>
          <span className="text-[10px] text-muted-foreground">
            Précision {Math.round(result.dimensions.confidence * 100)}%
          </span>
        </div>
      </Section>

      {/* Poids estimé */}
      <Section icon={<Scale className="size-4" />} title="Poids estimé">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{result.weight.weightTons}</div>
            <div className="text-xs text-muted-foreground">tonnes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{result.weight.weightKg.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">kg</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold">{result.weight.densityUsed} kg/m³</div>
            <div className="text-xs text-muted-foreground">densité moyenne</div>
          </div>
          <div className="ml-auto">
            <span className="rounded-full bg-eco/10 px-2 py-1 text-[10px] font-bold text-eco">
              ±{result.weight.uncertaintyPercent}%
            </span>
          </div>
        </div>
      </Section>

      {/* Localisation */}
      <Section icon={<Crosshair className="size-4" />} title="Localisation">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Latitude :</span>
            <span className="ml-1 font-mono">{result.location.lat.toFixed(5)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Longitude :</span>
            <span className="ml-1 font-mono">{result.location.lng.toFixed(5)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Commune :</span>
            <span className="ml-1 font-semibold capitalize">{result.location.commune}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Précision :</span>
            <span className="ml-1 font-mono">±{result.location.accuracy}m</span>
          </div>
          {result.location.altitudeM != null && (
            <div>
              <span className="text-muted-foreground">Altitude :</span>
              <span className="ml-1 font-mono">{result.location.altitudeM} m</span>
            </div>
          )}
        </div>
        {result.location.quartier && (
          <div className="mt-1 text-[10px] text-muted-foreground">
            Quartier : {result.location.quartier}
          </div>
        )}
      </Section>

      {/* Risques */}
      <Section icon={<TriangleAlert className="size-4 text-flood" />} title="Risques">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <RiskBadge label="Sanitaire" level={result.healthRisk} />
          <RiskBadge label="Environnement" level={result.environmentalRisk} />
          <RiskBadge label="Obstruction" level={result.obstructionRisk} />
          <RiskBadge label="Inondation" level={result.floodRisk ? "eleve" : "faible"} />
        </div>
        {result.interventionUrgent && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-500/10 p-2 text-xs font-bold text-red-700">
            <Siren className="size-4" /> Intervention immédiate requise
          </div>
        )}
      </Section>

      {/* Score de priorité */}
      <div className={`rounded-xl border p-4 ${priority.bg} ${priority.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className={`size-5 ${priority.color}`} />
            <span className={`text-sm font-bold ${priority.color}`}>Score de priorité</span>
          </div>
          <span className={`text-2xl font-black ${priority.color}`}>
            {result.priorityScore}/100
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="rounded-lg bg-background p-3 text-sm leading-relaxed text-foreground">
        {result.description}
      </p>

      {/* Recommandations */}
      {result.recommendations.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Recommandations</h4>
          <ul className="space-y-1">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <Truck className="mt-0.5 size-3 shrink-0 text-eco" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-eco/15 bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function CompositionBar({ entry }: { entry: CompositionEntry }) {
  const icon = MATERIAL_ICONS[entry.material] ?? "❓";
  return (
    <div className="flex items-center gap-2">
      <span className="w-5 text-center text-sm">{icon}</span>
      <span className="w-20 text-xs font-medium capitalize">{entry.material}</span>
      <div className="flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-2 rounded-full bg-eco transition-all duration-500"
          style={{ width: `${entry.percentage}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-bold">{entry.percentage}%</span>
    </div>
  );
}

function DimBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/50 p-2 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}

function RiskBadge({ label, level }: { label: string; level: string }) {
  const colorMap: Record<string, string> = {
    faible: "bg-emerald-500/10 text-emerald-700",
    modere: "bg-amber-500/10 text-amber-700",
    eleve: "bg-red-500/10 text-red-700",
  };
  return (
    <div className={`rounded-lg p-2 text-center text-xs ${colorMap[level] ?? "bg-secondary text-muted-foreground"}`}>
      <div className="font-bold uppercase">{level}</div>
      <div className="text-[10px] opacity-80">{label}</div>
    </div>
  );
}
