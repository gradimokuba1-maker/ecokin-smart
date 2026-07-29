// EcoKin Smart — Store de suivi GPS temps réel et itinéraires de la flotte.
// Simulateur intégré (mouvement fluide) + persistance localStorage.
import { useEffect, useState } from "react";
import { KINSHASA } from "./cities";

export type VehicleStatus = "en_circulation" | "arret" | "hors_ligne";

export type VehicleFix = {
  lat: number;
  lng: number;
  speedKmh: number;
  headingDeg: number;
  at: string;
};

export type Vehicle = {
  id: string;
  plate: string;
  driver: string;
  commune: string;
  status: VehicleStatus;
  loadPct: number;
  startedAt?: string;
  lastFixAt?: string;
  route: [number, number][]; // planned waypoints
  track: VehicleFix[]; // history (last 200)
  current: VehicleFix;
  deviationMeters: number;
};

const KEY = "ecokin_fleet_gps_v1";
const EVT = "ecokin:fleet-gps";
const MAX_TRACK = 200;

function seed(): Vehicle[] {
  const c = KINSHASA.center;
  const now = new Date().toISOString();
  const mk = (
    id: string,
    plate: string,
    driver: string,
    commune: string,
    off: [number, number],
    route: [number, number][],
    status: VehicleStatus,
    load: number,
  ): Vehicle => ({
    id,
    plate,
    driver,
    commune,
    status,
    loadPct: load,
    startedAt: now,
    lastFixAt: now,
    route,
    track: [],
    current: {
      lat: c[0] + off[0],
      lng: c[1] + off[1],
      speedKmh: status === "en_circulation" ? 22 : 0,
      headingDeg: 90,
      at: now,
    },
    deviationMeters: 0,
  });
  return [
    mk(
      "T-01",
      "CD-2041-AA",
      "B. Kasongo",
      "Gombe",
      [0.01, -0.02],
      [
        [-4.315, 15.3],
        [-4.32, 15.31],
        [-4.33, 15.32],
      ],
      "en_circulation",
      62,
    ),
    mk(
      "T-02",
      "CD-3187-BK",
      "P. Mwamba",
      "Lemba",
      [-0.05, -0.015],
      [
        [-4.38, 15.29],
        [-4.385, 15.295],
        [-4.39, 15.3],
      ],
      "en_circulation",
      30,
    ),
    mk(
      "T-03",
      "CD-4421-CK",
      "J. Ilunga",
      "Kisenso",
      [-0.08, 0.005],
      [
        [-4.41, 15.335],
        [-4.42, 15.34],
        [-4.425, 15.345],
      ],
      "en_circulation",
      84,
    ),
    mk(
      "T-04",
      "CD-1209-DK",
      "S. Mbala",
      "Ngaliema",
      [-0.02, -0.06],
      [
        [-4.35, 15.25],
        [-4.355, 15.26],
      ],
      "arret",
      100,
    ),
    mk(
      "T-05",
      "CD-5566-EK",
      "M. Tshala",
      "Matete",
      [-0.05, 0.005],
      [
        [-4.38, 15.33],
        [-4.385, 15.335],
      ],
      "en_circulation",
      45,
    ),
    mk(
      "T-06",
      "CD-7788-FK",
      "L. Nzuzi",
      "Masina",
      [-0.04, 0.06],
      [
        [-4.377, 15.373],
        [-4.38, 15.38],
      ],
      "hors_ligne",
      12,
    ),
  ];
}

function read(): Vehicle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const s = seed();
  write(s);
  return s;
}

function write(list: Vehicle[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVT));
}

function stepVehicle(v: Vehicle): Vehicle {
  if (v.status !== "en_circulation") return v;
  const jitter = () => (Math.random() - 0.5) * 0.0009;
  const lat = v.current.lat + jitter();
  const lng = v.current.lng + jitter();
  const heading = (v.current.headingDeg + (Math.random() - 0.5) * 20 + 360) % 360;
  const speedKmh = Math.max(0, Math.min(45, v.current.speedKmh + (Math.random() - 0.5) * 4));
  const at = new Date().toISOString();
  const fix: VehicleFix = { lat, lng, speedKmh, headingDeg: heading, at };
  const track = [fix, ...v.track].slice(0, MAX_TRACK);
  // déviation approx = distance au 1er waypoint le plus proche
  const dev = v.route.length
    ? Math.min(
        ...v.route.map((p) =>
          Math.hypot(
            (p[0] - lat) * 111000,
            (p[1] - lng) * 111000 * Math.cos((lat * Math.PI) / 180),
          ),
        ),
      )
    : 0;
  return { ...v, current: fix, track, lastFixAt: at, deviationMeters: Math.round(dev) };
}

export type FleetAlert = {
  id: string;
  vehicleId: string;
  kind: "hors_zone" | "arret_prolonge" | "deviation" | "hors_ligne";
  msg: string;
  at: string;
};

export function useFleet(intervalMs = 4000) {
  const [items, setItems] = useState<Vehicle[]>(() => read());
  const [alerts, setAlerts] = useState<FleetAlert[]>([]);

  useEffect(() => {
    const h = () => setItems(read());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);

  useEffect(() => {
    const i = setInterval(() => {
      const cur = read();
      const next = cur.map(stepVehicle);
      write(next);
      // Alertes
      const newAlerts: FleetAlert[] = [];
      const now = new Date().toISOString();
      next.forEach((v) => {
        if (v.deviationMeters > 400 && v.status === "en_circulation") {
          newAlerts.push({
            id: `${v.id}-dev-${Date.now()}`,
            vehicleId: v.id,
            kind: "deviation",
            msg: `${v.id} : déviation d'itinéraire (${v.deviationMeters} m)`,
            at: now,
          });
        }
        if (v.status === "arret" && v.current.speedKmh === 0 && v.loadPct < 100) {
          newAlerts.push({
            id: `${v.id}-stop-${Date.now()}`,
            vehicleId: v.id,
            kind: "arret_prolonge",
            msg: `${v.id} : arrêt prolongé (${v.commune})`,
            at: now,
          });
        }
        if (v.status === "hors_ligne") {
          newAlerts.push({
            id: `${v.id}-off-${Date.now()}`,
            vehicleId: v.id,
            kind: "hors_ligne",
            msg: `${v.id} : hors ligne`,
            at: now,
          });
        }
      });
      if (newAlerts.length) setAlerts((a) => [...newAlerts, ...a].slice(0, 30));
    }, intervalMs);
    return () => clearInterval(i);
  }, [intervalMs]);

  return {
    vehicles: items,
    alerts,
    setStatus(id: string, status: VehicleStatus) {
      write(read().map((v) => (v.id === id ? { ...v, status } : v)));
    },
    setRoute(id: string, route: [number, number][]) {
      write(read().map((v) => (v.id === id ? { ...v, route } : v)));
    },
    reset() {
      write(seed());
    },
  };
}

// Optimisation naïve : plus proche voisin sur les waypoints.
export function optimizeRoute(
  points: [number, number][],
  start?: [number, number],
): [number, number][] {
  if (points.length <= 2) return points;
  const remaining = points.slice();
  const result: [number, number][] = [];
  let current = start ?? remaining.shift()!;
  result.push(current);
  while (remaining.length) {
    let best = 0;
    let bestD = Infinity;
    remaining.forEach((p, i) => {
      const d = Math.hypot(p[0] - current[0], p[1] - current[1]);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    current = remaining.splice(best, 1)[0];
    result.push(current);
  }
  return result;
}

export function routeDistanceKm(points: [number, number][]): number {
  let km = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    km += Math.hypot((b[0] - a[0]) * 111, (b[1] - a[1]) * 111 * Math.cos((a[0] * Math.PI) / 180));
  }
  return km;
}
