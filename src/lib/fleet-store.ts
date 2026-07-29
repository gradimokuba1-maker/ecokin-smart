// EcoKin Smart — Module Suivi de la flotte.
import { useEffect, useState, useCallback } from "react";

export type VehicleStatus = "en_service" | "en_panne" | "en_maintenance" | "hors_service";

export type Vehicle = {
  id: string;
  plate: string;
  type: "camion_benne" | "tricycle" | "moto";
  capacityKg: number;
  status: VehicleStatus;
  currentPosition?: {
    lat: number;
    lon: number;
  };
  route?: {
    name: string;
    path: { lat: number; lon: number }[];
  };
};

const K_VEHICLES = "ecokin_vehicles_v1";
const EVT = "ecokin:fleet";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, list: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(list));
  window.dispatchEvent(new Event(EVT));
}

export function useFleet() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const refresh = useCallback(() => {
    setVehicles(read<Vehicle>(K_VEHICLES));
  }, []);

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, [refresh]);

  // Simulate vehicle movement
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedVehicles = vehicles.map((v) => {
        if (v.status === "en_service" && v.route && v.currentPosition) {
          const newLat = v.currentPosition.lat + (Math.random() - 0.5) * 0.001;
          const newLon = v.currentPosition.lon + (Math.random() - 0.5) * 0.001;
          return { ...v, currentPosition: { lat: newLat, lon: newLon } };
        }
        return v;
      });
      write(K_VEHICLES, updatedVehicles);
    }, 5000); // every 5 seconds

    return () => clearInterval(interval);
  }, [vehicles]);

  // Initialize with sample data if empty
  useEffect(() => {
    const data = read<Vehicle>(K_VEHICLES);
    if (data.length === 0) {
      write(K_VEHICLES, [
        {
          id: "V-1",
          plate: "AB-123-CD",
          type: "camion_benne",
          capacityKg: 5000,
          status: "en_service",
          currentPosition: { lat: -4.325, lon: 15.322222 },
          route: {
            name: "Collecte Matonge",
            path: [
              { lat: -4.325, lon: 15.322222 },
              { lat: -4.328, lon: 15.323 },
              { lat: -4.33, lon: 15.325 },
            ],
          },
        },
        {
          id: "V-2",
          plate: "EF-456-GH",
          type: "tricycle",
          capacityKg: 500,
          status: "en_service",
          currentPosition: { lat: -4.335, lon: 15.31 },
        },
        {
          id: "V-3",
          plate: "IJ-789-KL",
          type: "moto",
          capacityKg: 100,
          status: "en_panne",
          currentPosition: { lat: -4.34, lon: 15.315 },
        },
      ]);
      refresh();
    }
  }, [refresh]);

  return {
    vehicles,
    addVehicle(v: Omit<Vehicle, "id">): Vehicle {
      const list = read<Vehicle>(K_VEHICLES);
      const next: Vehicle = {
        ...v,
        id: `V-${Date.now().toString(36).toUpperCase()}`,
      };
      write(K_VEHICLES, [next, ...list]);
      return next;
    },
    updateVehicle(id: string, patch: Partial<Vehicle>) {
      write(
        K_VEHICLES,
        read<Vehicle>(K_VEHICLES).map((x) => (x.id === id ? { ...x, ...patch } : x)),
      );
    },
  };
}
