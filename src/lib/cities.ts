import { KINSHASA_COMMUNE_POLYGONS } from "./kinshasa-commune-polygons";

export type CityCommune = {
  id: string;
  name: string;
  center: [number, number];
  pilot?: boolean;
};

export type City = {
  id: string;
  name: string;
  country: string;
  center: [number, number];
  bounds: [[number, number], [number, number]];
  defaultZoom: number;
  communes: CityCommune[];
};

export const KINSHASA_COMMUNES: CityCommune[] = KINSHASA_COMMUNE_POLYGONS.map(
  ({ id, name, center }) => ({ id, name, center }),
);

export const KINSHASA: City = {
  id: "kinshasa",
  name: "Kinshasa",
  country: "RDC",
  center: [-4.4801, 15.8306],
  bounds: [
    [-5.08, 15.12],
    [-3.93, 16.32],
  ],
  defaultZoom: 10,
  communes: KINSHASA_COMMUNES,
};

export const CITIES: City[] = [KINSHASA];

export const DEFAULT_CITY = KINSHASA;

function isPointInRing(lat: number, lng: number, ring: Array<[number, number]>): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const yi = ring[i][0];
    const xi = ring[i][1];
    const yj = ring[j][0];
    const xj = ring[j][1];
    const crosses = yi > lat !== yj > lat;
    const edgeLng = ((xj - xi) * (lat - yi)) / (yj - yi || Number.EPSILON) + xi;
    if (crosses && lng < edgeLng) inside = !inside;
  }
  return inside;
}

function isPointInCommune(
  lat: number,
  lng: number,
  rings: Array<Array<[number, number]>>,
): boolean {
  return rings.some((ring) => isPointInRing(lat, lng, ring));
}

export function detectCityCommune(city: City, lat: number, lng: number): CityCommune {
  if (city.id === "kinshasa") {
    const polygonMatch = KINSHASA_COMMUNE_POLYGONS.find((commune) =>
      isPointInCommune(lat, lng, commune.rings),
    );
    const commune = polygonMatch
      ? city.communes.find((item) => item.id === polygonMatch.id)
      : undefined;
    if (commune) return commune;
  }

  let best = city.communes[0];
  let bestD = Infinity;
  for (const c of city.communes) {
    const d = haversineMeters(c.center, [lat, lng]);
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
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
