// Mock data for EcoKin Smart — 3 pilot communes of Kinshasa
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

export type WasteType = "plastique" | "organique" | "metal" | "verre" | "mixte";
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

export const REPORTS: Report[] = [
  ...seed(COMMUNES[0], 14, 1001),
  ...seed(COMMUNES[1], 18, 2001),
  ...seed(COMMUNES[2], 22, 3001),
];

export const COLLECTION_POINTS = [
  { id: "cp1", name: "Centre de tri Matete", commune: "matete", lat: -4.382, lng: 15.331, kind: "tri" },
  { id: "cp2", name: "Point de collecte Lemba-Terminus", commune: "lemba", lat: -4.379, lng: 15.295, kind: "collecte" },
  { id: "cp3", name: "Recyclage Kisenso", commune: "kisenso", lat: -4.413, lng: 15.337, kind: "recyclage" },
  { id: "cp4", name: "Dépôt Matete-Marché", commune: "matete", lat: -4.386, lng: 15.336, kind: "collecte" },
  { id: "cp5", name: "Centre de tri Lemba-Université", commune: "lemba", lat: -4.376, lng: 15.300, kind: "tri" },
];

export const LEADERBOARD = [
  { rank: 1, name: "Moussa Bashala", commune: "Matete", points: 4820, reports: 142, badges: ["sentinelle", "eco", "champion"] },
  { rank: 2, name: "Sarah Kabongo", commune: "Lemba", points: 3850, reports: 98, badges: ["eco", "champion"] },
  { rank: 3, name: "Jean-Paul Mbiya", commune: "Kisenso", points: 3100, reports: 84, badges: ["sentinelle"] },
  { rank: 4, name: "Francine Bilonda", commune: "Lemba", points: 2780, reports: 71, badges: ["eco"] },
  { rank: 5, name: "Patrick Tshibanda", commune: "Matete", points: 2410, reports: 65, badges: ["sentinelle"] },
  { rank: 6, name: "Aline Nzuzi", commune: "Kisenso", points: 2050, reports: 58, badges: ["eco"] },
  { rank: 7, name: "Christian Mbuyi", commune: "Matete", points: 1780, reports: 51, badges: [] },
  { rank: 8, name: "Diane Lwamba", commune: "Lemba", points: 1620, reports: 47, badges: [] },
];

export const REWARDS = [
  { id: "rw1", name: "Crédit Orange 1 000 CDF", cost: 500, kind: "telecom" },
  { id: "rw2", name: "Crédit Vodacom 2 000 CDF", cost: 950, kind: "telecom" },
  { id: "rw3", name: "Ticket Transco", cost: 2000, kind: "transport" },
  { id: "rw4", name: "Bon Kin Marché 5 000 CDF", cost: 2500, kind: "shopping" },
  { id: "rw5", name: "Réduction inscription état civil", cost: 4000, kind: "commune" },
  { id: "rw6", name: "Sac réutilisable EcoKin", cost: 1200, kind: "merch" },
];

export const ALERTS = [
  {
    id: "al1",
    title: "Pluies fortes prévues à Kisenso (48 h)",
    body: "Évitez les zones basses des avenues Mokali et Kimpwanza. Signalez tout caniveau obstrué.",
    level: "critique" as const,
    date: "Aujourd'hui",
  },
  {
    id: "al2",
    title: "Opération de collecte — Lemba Salongo",
    body: "Équipe RASKIN sur place demain de 06h à 11h. Sortez vos déchets plastiques.",
    level: "info" as const,
    date: "Demain",
  },
  {
    id: "al3",
    title: "Atelier sensibilisation jeunesse — Matete",
    body: "Samedi à la place du marché, de 09h à 13h. +100 Green Points pour la participation.",
    level: "info" as const,
    date: "Samedi",
  },
];

export const TIPS = [
  "Un sachet plastique met jusqu'à 400 ans à se décomposer dans nos caniveaux.",
  "80 % des inondations à Kinshasa sont aggravées par les déchets bloquant les caniveaux.",
  "Trier le PET (bouteilles) permet une revalorisation locale et finance la collecte.",
  "Compostez vos déchets organiques : ils représentent près de 60 % de nos poubelles.",
  "Un signalement précis (photo + position) accélère l'intervention de jusqu'à 4×.",
];

export const COMMUNE_KPIS = {
  matete: { signalements: 284, collecte_t: 38.2, recyclage: 42, risque: 28 },
  lemba: { signalements: 412, collecte_t: 51.6, recyclage: 39, risque: 35 },
  kisenso: { signalements: 386, collecte_t: 34.9, recyclage: 31, risque: 62 },
};

export const MONTHLY_TREND = [
  { mois: "Jan", signalements: 180, collecte: 22 },
  { mois: "Fév", signalements: 240, collecte: 28 },
  { mois: "Mar", signalements: 310, collecte: 34 },
  { mois: "Avr", signalements: 380, collecte: 41 },
  { mois: "Mai", signalements: 460, collecte: 48 },
  { mois: "Juin", signalements: 540, collecte: 56 },
];

export const FLOOD_RISK_ZONES = [
  { commune: "kisenso", lat: -4.418, lng: 15.339, radius: 600, level: "critique" },
  { commune: "lemba", lat: -4.381, lng: 15.299, radius: 450, level: "eleve" },
  { commune: "matete", lat: -4.385, lng: 15.334, radius: 380, level: "modere" },
];
