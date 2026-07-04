// Mock data for EcoKin Smart — Kinshasa (24 communes)
export type Commune = {
  id: "matete" | "lemba" | "kisenso";
  name: string;
  center: [number, number];
  population: string;
  color: string;
};

export const COMMUNES: Commune[] = [
  { id: "matete", name: "Matete", center: [-4.3833, 15.3333], population: "≈ 270 000", color: "#10b981" },
  { id: "lemba", name: "Lemba", center: [-4.3786, 15.2978], population: "≈ 350 000", color: "#0ea5e9" },
  { id: "kisenso", name: "Kisenso", center: [-4.4156, 15.3361], population: "≈ 450 000", color: "#f59e0b" },
];

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

export const COLLECTION_POINTS = [
  { id: "cp1", name: "Centre de tri Matete", commune: "matete", lat: -4.382, lng: 15.331, kind: "tri" },
  { id: "cp2", name: "Point de collecte Lemba-Terminus", commune: "lemba", lat: -4.379, lng: 15.295, kind: "collecte" },
  { id: "cp3", name: "Recyclage Kisenso", commune: "kisenso", lat: -4.413, lng: 15.337, kind: "recyclage" },
  { id: "cp4", name: "Dépôt Matete-Marché", commune: "matete", lat: -4.386, lng: 15.336, kind: "collecte" },
  { id: "cp5", name: "Centre de tri Lemba-Université", commune: "lemba", lat: -4.376, lng: 15.300, kind: "tri" },
];

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

export const WEATHER_FORECAST: WeatherDay[] = [
  { day: "Aujourd'hui", icon: "storm", tempC: 27, rainMm: 48, floodRisk: "critique" },
  { day: "Demain", icon: "rain", tempC: 26, rainMm: 22, floodRisk: "eleve" },
  { day: "J+2", icon: "rain", tempC: 27, rainMm: 14, floodRisk: "modere" },
  { day: "J+3", icon: "cloud", tempC: 28, rainMm: 3, floodRisk: "faible" },
  { day: "J+4", icon: "sun", tempC: 30, rainMm: 0, floodRisk: "faible" },
  { day: "J+5", icon: "cloud", tempC: 29, rainMm: 6, floodRisk: "faible" },
  { day: "J+6", icon: "rain", tempC: 27, rainMm: 18, floodRisk: "modere" },
];

// ---------- Indice de Propreté de Kinshasa (IPK /100) ----------
export const IPK = {
  matete: { score: 72, trend: +4, rang: 1 },
  lemba: { score: 65, trend: +2, rang: 2 },
  kisenso: { score: 48, trend: -3, rang: 3 },
};
export const IPK_KINSHASA = 62;

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

export const INTERVENTIONS: Intervention[] = [
  { id: "INT-101", commune: "kisenso", type: "curage", team: "Équipe Alpha", truckId: "T-03", status: "en_cours", scheduledAt: "2026-06-20 08:00", notes: "Curage caniveau Mokali (92% obstrué)." },
  { id: "INT-102", commune: "matete", type: "collecte", team: "Équipe Bravo", truckId: "T-01", status: "en_cours", scheduledAt: "2026-06-20 07:30", notes: "Collecte marché Matete." },
  { id: "INT-103", commune: "lemba", type: "sensibilisation", team: "Équipe Citoyenne", status: "planifiee", scheduledAt: "2026-06-21 09:00", notes: "Atelier tri à l'Université de Kinshasa." },
  { id: "INT-104", commune: "kisenso", type: "urgence", team: "Équipe Alpha", truckId: "T-04", status: "terminee", scheduledAt: "2026-06-19 16:00", notes: "Inondation Av. Kimpwanza — évacuation 9 m³.", beforePhoto: "x", afterPhoto: "x" },
  { id: "INT-105", commune: "matete", type: "collecte", team: "Équipe Bravo", truckId: "T-05", status: "planifiee", scheduledAt: "2026-06-22 06:00", notes: "Tournée hebdomadaire quartier Tomba." },
];

export const COMMUNE_BUDGET = {
  matete: { hebdo: 4_800_000, mensuel: 19_500_000, cout_tonne: 125_000 },
  lemba: { hebdo: 6_200_000, mensuel: 24_800_000, cout_tonne: 120_000 },
  kisenso: { hebdo: 7_100_000, mensuel: 28_400_000, cout_tonne: 138_000 },
};

export const AI_RECOMMENDATIONS = [
  { id: "ai1", priorite: 1, commune: "kisenso" as const, titre: "Curage urgent Av. Mokali", motif: "Caniveau 92% obstrué + pluies 48mm prévues. Risque inondation critique.", camions: 3, equipes: 2, eta: "≤ 12 h" },
  { id: "ai2", priorite: 2, commune: "lemba" as const, titre: "Collecte renforcée Lemba-Sud", motif: "Décharge sauvage 7m³ à 80m d'une école.", camions: 2, equipes: 1, eta: "≤ 24 h" },
  { id: "ai3", priorite: 3, commune: "matete" as const, titre: "Sensibilisation marché Matete", motif: "Hausse de 18% des signalements plastiques sur 7 jours.", camions: 1, equipes: 1, eta: "≤ 48 h" },
  { id: "ai4", priorite: 4, commune: "kisenso" as const, titre: "Renfort Kimpwanza", motif: "Zone basse + 2 caniveaux obstrués sur 1 km.", camions: 2, equipes: 1, eta: "≤ 72 h" },
];

export const PRIORITY_ALERTS = [
  { id: "pa1", level: "critique" as const, commune: "kisenso" as const, msg: "Inondation imminente — Av. Mokali (Kisenso)" },
  { id: "pa2", level: "eleve" as const, commune: "lemba" as const, msg: "Décharge sauvage à proximité d'école — Lemba-Sud" },
  { id: "pa3", level: "modere" as const, commune: "matete" as const, msg: "Caniveau Av. Lumumba — 80% obstrué" },
];


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

export const HOTSPOTS: Hotspot[] = [
  { id: "hs1", commune: "kisenso", lat: -4.418, lng: 15.340, name: "Av. Mokali — virage bas", recurrence: 28, trend: "hausse", predictedRiskNext7d: "critique" },
  { id: "hs2", commune: "kisenso", lat: -4.421, lng: 15.339, name: "Av. Kimpwanza", recurrence: 22, trend: "hausse", predictedRiskNext7d: "eleve" },
  { id: "hs3", commune: "lemba", lat: -4.383, lng: 15.301, name: "Carrefour Lemba-Sud", recurrence: 19, trend: "stable", predictedRiskNext7d: "eleve" },
  { id: "hs4", commune: "matete", lat: -4.387, lng: 15.336, name: "Pont Matete", recurrence: 14, trend: "stable", predictedRiskNext7d: "modere" },
  { id: "hs5", commune: "matete", lat: -4.382, lng: 15.331, name: "Marché Matete (arrière)", recurrence: 11, trend: "baisse", predictedRiskNext7d: "modere" },
  { id: "hs6", commune: "lemba", lat: -4.378, lng: 15.299, name: "Université — av. principale", recurrence: 9, trend: "stable", predictedRiskNext7d: "faible" },
];

// ---------- Performance des communes ----------
export const COMMUNE_PERFORMANCE = {
  matete: { ipk: 72, tauxCollecte: 78, tauxResolution: 84, tauxValorisation: 42, tempsReponseH: 6.2 },
  lemba: { ipk: 65, tauxCollecte: 71, tauxResolution: 77, tauxValorisation: 39, tempsReponseH: 7.8 },
  kisenso: { ipk: 48, tauxCollecte: 58, tauxResolution: 62, tauxValorisation: 31, tempsReponseH: 11.4 },
};

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

export const DECISIONS: Decision[] = [
  {
    id: "DEC-001",
    titre: "Curage d'urgence Av. Mokali (Kisenso)",
    responsable: "Bourgmestre Kisenso",
    commune: "kisenso",
    dateLancement: "2026-06-18",
    budget: 18_500_000,
    etat: "en_cours",
    avancementPct: 65,
    resultats: "4 caniveaux dégagés sur 6, ≈ 22 m³ de déchets évacués.",
    kpis: [{ label: "Caniveaux dégagés", value: "4 / 6" }, { label: "Volume", value: "22 m³" }],
  },
  {
    id: "DEC-002",
    titre: "Brigade verte Lemba-Sud",
    responsable: "Bourgmestre Lemba",
    commune: "lemba",
    dateLancement: "2026-06-10",
    budget: 9_200_000,
    etat: "en_cours",
    avancementPct: 40,
    resultats: "Recrutement 24 jeunes, 3 tournées hebdo opérationnelles.",
    kpis: [{ label: "Emplois", value: "24" }, { label: "Tournées/sem.", value: "3" }],
  },
  {
    id: "DEC-003",
    titre: "Campagne IEC plastiques marchés",
    responsable: "Cabinet du Gouverneur",
    commune: "kinshasa",
    dateLancement: "2026-06-05",
    budget: 4_500_000,
    etat: "terminee",
    avancementPct: 100,
    resultats: "12 marchés couverts, −18% signalements plastiques.",
    kpis: [{ label: "Marchés", value: "12" }, { label: "Réduction", value: "−18%" }],
  },
  {
    id: "DEC-004",
    titre: "Acquisition 5 camions bennes",
    responsable: "Cabinet du Gouverneur",
    commune: "kinshasa",
    dateLancement: "2026-05-22",
    budget: 285_000_000,
    etat: "planifiee",
    avancementPct: 10,
    resultats: "Appel d'offres lancé.",
    kpis: [{ label: "Offres reçues", value: "3" }, { label: "ETA", value: "Q4 2026" }],
  },
  {
    id: "DEC-005",
    titre: "Plan anti-inondations saison pluvieuse",
    responsable: "Direction urbanisme",
    commune: "kinshasa",
    dateLancement: "2026-04-01",
    budget: 62_000_000,
    etat: "bloquee",
    avancementPct: 28,
    resultats: "Financement partiel — attente déblocage tranche 2.",
    kpis: [{ label: "Caniveaux ciblés", value: "184" }, { label: "Traités", value: "52" }],
  },
];

// ---------- Historique des interventions résolues ----------
export const INTERVENTION_HISTORY = [
  { date: "2026-06-19", commune: "kisenso", type: "urgence", duree_h: 4, volume_m3: 9, equipe: "Alpha" },
  { date: "2026-06-18", commune: "matete", type: "collecte", duree_h: 3, volume_m3: 14, equipe: "Bravo" },
  { date: "2026-06-17", commune: "lemba", type: "curage", duree_h: 5, volume_m3: 6, equipe: "Citoyenne" },
  { date: "2026-06-16", commune: "kisenso", type: "collecte", duree_h: 4, volume_m3: 18, equipe: "Alpha" },
  { date: "2026-06-15", commune: "lemba", type: "sensibilisation", duree_h: 4, volume_m3: 0, equipe: "Citoyenne" },
  { date: "2026-06-14", commune: "matete", type: "collecte", duree_h: 3, volume_m3: 12, equipe: "Bravo" },
];

// ---------- Évolution mensuelle de la propreté ----------
export const IPK_TREND = [
  { mois: "Jan", matete: 58, lemba: 54, kisenso: 41, kinshasa: 51 },
  { mois: "Fév", matete: 61, lemba: 56, kisenso: 42, kinshasa: 53 },
  { mois: "Mar", matete: 64, lemba: 58, kisenso: 44, kinshasa: 55 },
  { mois: "Avr", matete: 67, lemba: 60, kisenso: 45, kinshasa: 57 },
  { mois: "Mai", matete: 70, lemba: 63, kisenso: 47, kinshasa: 60 },
  { mois: "Juin", matete: 72, lemba: 65, kisenso: 48, kinshasa: 62 },
];

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
