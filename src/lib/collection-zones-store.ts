// EcoKin Smart — Module Zones de collecte.
import { useEffect, useState, useCallback } from "react";

export type CollectionPointType = "regroupement" | "tri" | "valorisation" | "evacuation";

export type CollectionPoint = {
  id: string;
  name: string;
  commune: string;
  quartier: string;
  type: CollectionPointType;
  position: {
    lat: number;
    lon: number;
  };
};

const K_ZONES = "ecokin_collection_zones_v1";
const EVT = "ecokin:zones";

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

export function useCollectionZones() {
  const [zones, setZones] = useState<CollectionPoint[]>([]);

  const refresh = useCallback(() => {
    setZones(read<CollectionPoint>(K_ZONES));
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

  // Initialize with sample data if empty
  useEffect(() => {
    const data = read<CollectionPoint>(K_ZONES);
    if (data.length === 0) {
      write(K_ZONES, [
        {
          id: "Z-1",
          name: "Point de regroupement Victoire",
          commune: "Kalamu",
          quartier: "Victoire",
          type: "regroupement",
          position: { lat: -4.333, lon: 15.305 },
        },
        {
          id: "Z-2",
          name: "Centre de tri de Limete",
          commune: "Limete",
          quartier: "Industriel",
          type: "tri",
          position: { lat: -4.35, lon: 15.34 },
        },
      ]);
      refresh();
    }
  }, [refresh]);

  return {
    zones,
    addZone(z: Omit<CollectionPoint, "id">): CollectionPoint {
      const list = read<CollectionPoint>(K_ZONES);
      const next: CollectionPoint = {
        ...z,
        id: `Z-${Date.now().toString(36).toUpperCase()}`,
      };
      write(K_ZONES, [next, ...list]);
      return next;
    },
  };
}
