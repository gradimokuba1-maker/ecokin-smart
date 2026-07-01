// EcoKin Smart — configuration multi-villes.
// Architecture prête pour l'extension future à d'autres villes de RDC.

export type CityCommune = {
  id: string;
  name: string;
  center: [number, number]; // [lat, lng]
  pilot?: boolean;
};

export type City = {
  id: string;
  name: string;
  country: string;
  center: [number, number];
  bounds: [[number, number], [number, number]]; // [SW, NE]
  defaultZoom: number;
  communes: CityCommune[];
};

// 24 communes de Kinshasa (centres approximatifs).
export const KINSHASA_COMMUNES: CityCommune[] = [
  { id: "matete", name: "Matete", center: [-4.3833, 15.3333], pilot: true },
  { id: "lemba", name: "Lemba", center: [-4.3786, 15.2978], pilot: true },
  { id: "kisenso", name: "Kisenso", center: [-4.4156, 15.3361], pilot: true },
  { id: "gombe", name: "Gombe", center: [-4.3157, 15.3081] },
  { id: "kintambo", name: "Kintambo", center: [-4.3399, 15.2707] },
  { id: "bandalungwa", name: "Bandalungwa", center: [-4.3542, 15.2861] },
  { id: "kasa-vubu", name: "Kasa-Vubu", center: [-4.3444, 15.2986] },
  { id: "kalamu", name: "Kalamu", center: [-4.3506, 15.3061] },
  { id: "bumbu", name: "Bumbu", center: [-4.3689, 15.2903] },
  { id: "makala", name: "Makala", center: [-4.3789, 15.3072] },
  { id: "selembao", name: "Selembao", center: [-4.3900, 15.2814] },
  { id: "ngaba", name: "Ngaba", center: [-4.3944, 15.3072] },
  { id: "limete", name: "Limete", center: [-4.3494, 15.3269] },
  { id: "lingwala", name: "Lingwala", center: [-4.3306, 15.3033] },
  { id: "kinshasa", name: "Kinshasa (commune)", center: [-4.3167, 15.3167] },
  { id: "barumbu", name: "Barumbu", center: [-4.3222, 15.3208] },
  { id: "ngiri-ngiri", name: "Ngiri-Ngiri", center: [-4.3411, 15.2953] },
  { id: "mont-ngafula", name: "Mont-Ngafula", center: [-4.4483, 15.2603] },
  { id: "ngaliema", name: "Ngaliema", center: [-4.3567, 15.2508] },
  { id: "masina", name: "Masina", center: [-4.3767, 15.3736] },
  { id: "ndjili", name: "N'djili", center: [-4.4058, 15.3611] },
  { id: "nsele", name: "N'sele", center: [-4.4028, 15.5333] },
  { id: "maluku", name: "Maluku", center: [-4.0733, 15.5333] },
  { id: "kimbanseke", name: "Kimbanseke", center: [-4.4361, 15.4083] },
];

export const KINSHASA: City = {
  id: "kinshasa",
  name: "Kinshasa",
  country: "RDC",
  center: [-4.3317, 15.3139],
  bounds: [
    [-4.55, 15.15],
    [-4.05, 15.6],
  ],
  defaultZoom: 11,
  communes: KINSHASA_COMMUNES,
};

// Liste des villes actives (extensible : Lubumbashi, Goma, Mbuji-Mayi…).
export const CITIES: City[] = [KINSHASA];

export const DEFAULT_CITY = KINSHASA;

export function detectCityCommune(city: City, lat: number, lng: number): CityCommune {
  let best = city.communes[0];
  let bestD = Infinity;
  for (const c of city.communes) {
    const d = Math.hypot(c.center[0] - lat, c.center[1] - lng);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

export function haversineMeters(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
