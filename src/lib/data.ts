// Mock data for EcoKin Smart — Kinshasa (24 communes)
import { KINSHASA_COMMUNES } from "./cities";

export type Commune = {
  id: string;
  name: string;
  center: [number, number];
  population: string;
  color: string;
};

const COMMUNE_COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#6366f1", "#ef4444", "#14b8a6", "#8b5cf6", "#84cc16"];

export const COMMUNES: Commune[] = KINSHASA_COMMUNES.map((commune, index) => ({
  ...commune,
  population: "Données à consolider",
  color: COMMUNE_COLORS[index % COMMUNE_COLORS.length],
}));

export type WasteType =
  | "plastique"
  | "organique"
  | "menager"
  | "electronique"
  | "medical"
  | "construction"
  | "metal"
  | "verre"
  | "mixte";

export const WASTE_CATEGORIES: { id: WasteType; label: string; color: string; icon: string }[] = [
  { id: "plastique", label: "Plastiques", color: "#0ea5e9", icon: "🧴" },
  { id: "organique", label: "Organiques", color: "#65a30d", icon: "🍃" },
  { id: "menager", label: "Ménagers", color: "#a3a3a3", icon: "🗑" },
  { id: "electronique", label: "Électroniques", color: "#6366f1", icon: "🔌" },
  { id: "medical", label: "Médicaux", color: "#ef4444", icon: "⚕" },
  { id: "construction", label: "Gravats / Construction", color: "#a16207", icon: "🧱" },
  { id: "metal", label: "Métal", color: "#94a3b8", icon: "⚙" },
  { id: "verre", label: "Verre", color: "#14b8a6", icon: "🍾" },
  { id: "mixte", label: "Mixtes", color: "#475569", icon: "♻" },
];
export type Severity = "faible" | "modere" | "critique";

export type Report = {
  id: string;
  commune: Commune["id"];
  lat: number;
  lng: number;
  type: WasteType;
  severity: Severity;
  status: "nouveau" | "en_cours" | "resolu";
  createdAt: string;
  author: string;
  description: string;
  volumeM3: number;
  points: number;
};

const r = (lat: number, lng: number, spread = 0.012) => [
  lat + (Math.random() - 0.5) * spread,
  lng + (Math.random() - 0.5) * spread,
] as [number, number];

function seed(commune: Commune, count: number, baseId: number): Report[] {
  const types: WasteType[] = ["plastique", "plastique", "plastique", "organique", "metal", "mixte"];
  const sevs: Severity[] = ["faible", "modere", "modere", "critique"];
  const statuses: Report["status"][] = ["nouveau", "en_cours", "resolu"];
  const authors = ["M. Kabasele", "S. Malu", "F. Bilonda", "J. Mukendi", "P. Tshibanda", "A. Nzuzi", "C. Mbuyi", "D. Lwamba"];
  return Array.from({ length: count }, (_, i) => {
    const [lat, lng] = r(commune.center[0], commune.center[1]);
    const type = types[i % types.length];
    const severity = sevs[i % sevs.length];
    return {
      id: `RPT-${baseId + i}`,
      commune: commune.id,
      lat,
      lng,
      type,
      severity,
      status: statuses[i % statuses.length],
      createdAt: new Date(Date.now() - i * 3600_000 * 4).toISOString(),
      author: authors[i % authors.length],
      description:
        severity === "critique"
          ? "Obstruction caniveau, risque d'inondation imminent."
          : "Dépôt sauvage signalé sur la voie publique.",
      volumeM3: +(0.4 + Math.random() * 3.6).toFixed(1),
      points: severity === "critique" ? 80 : severity === "modere" ? 50 : 25,
    };
  });
}

// Réinitialisation complète : les signalements proviendront exclusivement
// des tests terrain (live-reports.ts). Aucune donnée simulée.
export const REPORTS: Report[] = [];
void seed;

export type InfrastructureKind = "transfert" | "regroupement" | "valorisation" | "traitement" | "collecte" | "tri" | "recyclage";

export const COLLECTION_POINTS: {
  id: string;
  name: string;
  commune: string;
  lat: number;
  lng: number;
  kind: InfrastructureKind;
}[] = COMMUNES.flatMap((commune, index) => {
  const [lat, lng] = commune.center;
  const offset = 0.002 + (index % 4) * 0.0004;
  return [
    {
      id: `cp-${commune.id}-regroupement`,
      name: `Point de regroupement ${commune.name}`,
      commune: commune.id,
      lat: lat + offset,
      lng: lng - offset,
      kind: "regroupement",
    },
    {
      id: `cp-${commune.id}-collecte`,
      name: `Zone de collecte ${commune.name}`,
      commune: commune.id,
      lat: lat - offset,
      lng: lng + offset,
      kind: "collecte",
    },
    ...(index % 3 === 0
      ? [
          {
            id: `cp-${commune.id}-transfert`,
            name: `Centre de transfert ${commune.name}`,
            commune: commune.id,
            lat: lat + offset * 1.6,
            lng: lng + offset,
            kind: "transfert" as const,
          },
        ]
      : []),
    ...(index % 4 === 0
      ? [
          {
            id: `cp-${commune.id}-valorisation`,
            name: `Centre de valorisation ${commune.name}`,
            commune: commune.id,
            lat: lat - offset * 1.4,
            lng: lng - offset,
            kind: "valorisation" as const,
          },
        ]
      : []),
    ...(index % 5 === 0
      ? [
          {
            id: `cp-${commune.id}-traitement`,
            name: `Centre de traitement ${commune.name}`,
            commune: commune.id,
            lat: lat,
            lng: lng + offset * 1.7,
            kind: "traitement" as const,
          },
        ]
      : []),
  ];
});

// Classement citoyens — alimenté par les vrais signalements après réinitialisation.
export const LEADERBOARD: { rank: number; name: string; commune: string; points: number; reports: number; badges: string[] }[] = [];

export const REWARDS = [
  { id: "rw1", name: "Crédit Orange 1 000 CDF", cost: 500, kind: "telecom" },
  { id: "rw2", name: "Crédit Vodacom 2 000 CDF", cost: 950, kind: "telecom" },
  { id: "rw3", name: "Ticket Transco", cost: 2000, kind: "transport" },
  { id: "rw4", name: "Bon Kin Marché 5 000 CDF", cost: 2500, kind: "shopping" },
  { id: "rw5", name: "Réduction inscription état civil", cost: 4000, kind: "commune" },
  { id: "rw6", name: "Sac réutilisable EcoKin", cost: 1200, kind: "merch" },
];

// Aucune alerte pré-remplie : les alertes seront calculées à partir des données terrain.
export const ALERTS: { id: string; title: string; body: string; level: "critique" | "info"; date: string }[] = [];

export const TIPS = [
  "Un sachet plastique met jusqu'à 400 ans à se décomposer dans nos caniveaux.",
  "80 % des inondations à Kinshasa sont aggravées par les déchets bloquant les caniveaux.",
  "Trier le PET (bouteilles) permet une revalorisation locale et finance la collecte.",
  "Compostez vos déchets organiques : ils représentent près de 60 % de nos poubelles.",
  "Un signalement précis (photo + position) accélère l'intervention de jusqu'à 4×.",
];

// KPIs par commune — réinitialisés. Alimentés dynamiquement par les signalements réels.
export const COMMUNE_KPIS: Record<string, { signalements: number; collecte_t: number; recyclage: number; risque: number }> = {};

export const MONTHLY_TREND: { mois: string; signalements: number; collecte: number }[] = [];

// Zones à risque d'inondation — calculées dynamiquement à partir des données météo & signalements.
export const FLOOD_RISK_ZONES: { commune: string; lat: number; lng: number; radius: number; level: string }[] = [];

// ---------- SIG layers (équipements urbains) ----------
export type PoiKind = "ecole" | "hopital" | "marche";
export const POIS: { id: string; name: string; kind: PoiKind; lat: number; lng: number; commune: Commune["id"] }[] = [
  { id: "ec1", name: "École Lumumba", kind: "ecole", lat: -4.382, lng: 15.330, commune: "matete" },
  { id: "ec2", name: "Lycée Bosangani", kind: "ecole", lat: -4.378, lng: 15.298, commune: "lemba" },
  { id: "ec3", name: "Institut Kisenso", kind: "ecole", lat: -4.414, lng: 15.335, commune: "kisenso" },
  { id: "ec4", name: "École Mokali", kind: "ecole", lat: -4.420, lng: 15.341, commune: "kisenso" },
  { id: "hp1", name: "Hôpital général Matete", kind: "hopital", lat: -4.385, lng: 15.332, commune: "matete" },
  { id: "hp2", name: "Centre médical Lemba", kind: "hopital", lat: -4.380, lng: 15.296, commune: "lemba" },
  { id: "hp3", name: "Hôpital Kisenso", kind: "hopital", lat: -4.412, lng: 15.338, commune: "kisenso" },
  { id: "mk1", name: "Marché Matete", kind: "marche", lat: -4.386, lng: 15.335, commune: "matete" },
  { id: "mk2", name: "Marché Lemba-Terminus", kind: "marche", lat: -4.379, lng: 15.300, commune: "lemba" },
  { id: "mk3", name: "Marché Kimpwanza", kind: "marche", lat: -4.417, lng: 15.340, commune: "kisenso" },
];

// Décharges sauvages & caniveaux obstrués — alimentés uniquement par les signalements terrain.
export const ILLEGAL_DUMPS: { id: string; name: string; lat: number; lng: number; commune: string; volumeM3: number }[] = [];

export const BLOCKED_DRAINS: { id: string; name: string; lat: number; lng: number; commune: string; blockedPct: number }[] = [];

export const MAIN_ROADS: { name: string; path: [number, number][] }[] = [
  { name: "Bd Lumumba", path: [[-4.370, 15.290], [-4.385, 15.320], [-4.405, 15.345]] },
  { name: "Av. By-Pass", path: [[-4.378, 15.295], [-4.392, 15.320], [-4.418, 15.342]] },
];

export const RIVERS: { name: string; path: [number, number][] }[] = [
  { name: "Rivière Matete", path: [[-4.378, 15.325], [-4.388, 15.334], [-4.400, 15.342]] },
  { name: "Bassin Kisenso", path: [[-4.410, 15.330], [-4.418, 15.339], [-4.425, 15.348]] },
];

// ---------- Flotte de camions (suivi GPS simulé) ----------
export type Truck = {
  id: string;
  plate: string;
  commune: Commune["id"];
  driver: string;
  status: "en_route" | "collecte" | "depot" | "pause";
  loadPct: number;
  lat: number;
  lng: number;
  speedKmh: number;
};

// Flotte de camions — les véhicules connectés apparaîtront ici via GPS temps réel.
export const TRUCKS: Truck[] = [];

// ---------- Météo / alerte pluie ----------
export type WeatherDay = {
  day: string;
  icon: "sun" | "cloud" | "rain" | "storm";
  tempC: number;
  rainMm: number;
  floodRisk: "faible" | "modere" | "eleve" | "critique";
};

// Prévisions météo — à connecter à une source réelle (OpenWeather / DGM RDC).
// Vide par défaut : évite d'afficher un risque d'inondation en saison sèche.
export const WEATHER_FORECAST: WeatherDay[] = [];

// ---------- Indice de Propreté de Kinshasa (IPK /100) ----------
// Calculé dynamiquement à partir des signalements réels.
export const IPK: Record<string, { score: number; trend: number; rang: number }> = {};
export const IPK_KINSHASA = 0;

// ---------- Interventions ----------
export type Intervention = {
  id: string;
  commune: Commune["id"];
  type: "collecte" | "curage" | "sensibilisation" | "urgence";
  team: string;
  truckId?: string;
  status: "planifiee" | "en_cours" | "terminee";
  scheduledAt: string;
  beforePhoto?: string;
  afterPhoto?: string;
  notes: string;
};

export const INTERVENTIONS: Intervention[] = [];

// Budgets communaux — à saisir par les autorités.
export const COMMUNE_BUDGET: Record<string, { hebdo: number; mensuel: number; cout_tonne: number }> = {};

export const AI_RECOMMENDATIONS: { id: string; priorite: number; commune: string; titre: string; motif: string; camions: number; equipes: number; eta: string }[] = [];

export const PRIORITY_ALERTS: { id: string; level: "critique" | "eleve" | "modere"; commune: string; msg: string }[] = [];



// ---------- Hotspots prédictifs (analyse récurrente) ----------
export type Hotspot = {
  id: string;
  commune: Commune["id"];
  lat: number;
  lng: number;
  name: string;
  recurrence: number; // signalements/mois
  trend: "hausse" | "stable" | "baisse";
  predictedRiskNext7d: "faible" | "modere" | "eleve" | "critique";
};

// Hotspots prédictifs — calculés dynamiquement à partir des récurrences réelles.
export const HOTSPOTS: Hotspot[] = [];

// ---------- Performance des communes ----------
// Les indicateurs sont calculés à partir des signalements et interventions réels.
export const COMMUNE_PERFORMANCE: Record<string, { ipk: number; tauxCollecte: number; tauxResolution: number; tauxValorisation: number; tempsReponseH: number }> = {};

// ---------- Mur des Décisions ----------
export type Decision = {
  id: string;
  titre: string;
  responsable: string;
  commune?: Commune["id"] | "kinshasa";
  dateLancement: string;
  budget: number; // CDF
  etat: "planifiee" | "en_cours" | "terminee" | "bloquee";
  avancementPct: number;
  resultats: string;
  kpis: { label: string; value: string }[];
};

export const DECISIONS: Decision[] = [];

// ---------- Historique des interventions résolues ----------
export const INTERVENTION_HISTORY: { date: string; commune: string; type: string; duree_h: number; volume_m3: number; equipe: string }[] = [];

// ---------- Évolution mensuelle de la propreté ----------
export const IPK_TREND: { mois: string; matete: number; lemba: number; kisenso: number; kinshasa: number }[] = [];

// ---------- Helpers ----------
export function detectCommune(lat: number, lng: number): Commune["id"] {
  let best: Commune["id"] = "matete";
  let bestD = Infinity;
  COMMUNES.forEach((c) => {
    const d = Math.hypot(c.center[0] - lat, c.center[1] - lng);
    if (d < bestD) {
      bestD = d;
      best = c.id;
    }
  });
  return best;
}

// Calcule un score de priorité 0..100 selon les critères Smart City
export function priorityScore(input: {
  commune: Commune["id"];
  lat: number;
  lng: number;
  severity: Severity;
  signalsCount?: number;
}): number {
  const sev = input.severity === "critique" ? 40 : input.severity === "modere" ? 22 : 10;
  const pois = POIS.filter((p) => {
    const d = Math.hypot(p.lat - input.lat, p.lng - input.lng);
    return d < 0.005; // ~550 m
  });
  const prox =
    pois.some((p) => p.kind === "hopital") ? 18 :
    pois.some((p) => p.kind === "ecole") ? 14 :
    pois.some((p) => p.kind === "marche") ? 10 : 0;
  const flood = FLOOD_RISK_ZONES.some((z) => z.commune === input.commune &&
    Math.hypot(z.lat - input.lat, z.lng - input.lng) * 111000 < z.radius)
    ? 18 : 0;
  const density =
    input.commune === "kisenso" ? 8 : input.commune === "lemba" ? 6 : 5;
  const signals = Math.min(8, (input.signalsCount ?? 0) / 3);
  return Math.min(100, Math.round(sev + prox + flood + density + signals));
}

// Détecte alertes automatiques (école/hôpital/marché proches)
export function proximityAlerts(lat: number, lng: number): string[] {
  const out: string[] = [];
  POIS.forEach((p) => {
    const d = Math.hypot(p.lat - lat, p.lng - lng) * 111000; // m
    if (d < 250) out.push(`${p.kind === "ecole" ? "École" : p.kind === "hopital" ? "Hôpital" : "Marché"} ${p.name} à ${Math.round(d)} m`);
  });
  return out;
}
