import { useEffect, useState, useCallback } from "react";
import { useEcoUser } from "./user-store";

export type HouseholdKind = "menage" | "pme";
export type BinType = "120L" | "240L" | "660L";

export type Household = {
  id: string;
  kind: HouseholdKind;
  name: string;
  commune: string;
  quartier: string;
  address: string;
  phone: string;
  occupants: number;
  binType: BinType;
  createdAt: string;
  paymentStatus?: "paid" | "unpaid";
  gps?: {
    lat: number;
    lon: number;
  };
};

export type CollectionRequest = {
  id: string;
  householdId: string;
  reason: string;
  requestedAt: string;
  preferredDate: string;
  status: "en_attente" | "planifiee" | "terminee" | "refusee";
  note?: string;
};

export type BinIssue = {
  id: string;
  householdId: string;
  description: string;
  photoUrl?: string;
  reportedAt: string;
  status: "signale" | "en_cours" | "remplace" | "reparation";
};

export type CollectionHistoryItem = {
  id: string;
  householdId: string;
  at: string;
  weightKg?: number;
  crew?: string;
  note?: string;
};

const K_HH = "ecokin_household_v1";
const K_REQ = "ecokin_collection_requests_v1";
const K_BIN = "ecokin_bin_issues_v1";
const K_HIST = "ecokin_collection_history_v1";
const EVT = "ecokin:household";

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

export function useHouseholds() {
  const { user } = useEcoUser();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [requests, setRequests] = useState<CollectionRequest[]>([]);
  const [issues, setIssues] = useState<BinIssue[]>([]);
  const [history, setHistory] = useState<CollectionHistoryItem[]>([]);

  const refresh = useCallback(() => {
    let allHouseholds = read<Household>(K_HH);
    if (user) {
      if (user.role === "bourgmestre" && user.commune) {
        allHouseholds = allHouseholds.filter((h) => h.commune === user.commune);
      }
    }
    setHouseholds(allHouseholds);
    setRequests(read<CollectionRequest>(K_REQ));
    setIssues(read<BinIssue>(K_BIN));
    setHistory(read<CollectionHistoryItem>(K_HIST));
  }, [user]);

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

  useEffect(() => {
    const data = read<Household>(K_HH);
    if (data.length === 0) {
      write(K_HH, [
        {
          id: "HH-1",
          kind: "menage",
          name: "Famille Kabongo",
          commune: "Kalamu",
          quartier: "Matonge",
          address: "123, Avenue Victoire",
          phone: "+243810000001",
          occupants: 5,
          binType: "120L",
          createdAt: new Date().toISOString(),
        },
        {
          id: "HH-2",
          kind: "pme",
          name: "Chez Mama Nseya",
          commune: "Kalamu",
          quartier: "Yolo",
          address: "456, Avenue de l'Université",
          phone: "+243810000002",
          occupants: 10,
          binType: "240L",
          createdAt: new Date().toISOString(),
        },
        {
          id: "HH-3",
          kind: "menage",
          name: "Famille Mavanga",
          commune: "Gombe",
          quartier: "Centre-ville",
          address: "789, Boulevard du 30 Juin",
          phone: "+243810000003",
          occupants: 3,
          binType: "120L",
          createdAt: new Date().toISOString(),
        },
      ]);
      refresh();
    }
  }, [refresh]);

  return {
    households,
    requests,
    issues,
    history,
    registerHousehold(h: Omit<Household, "id" | "createdAt">): Household {
      const list = read<Household>(K_HH);
      const next: Household = {
        ...h,
        id: `HH-${Date.now().toString(36).toUpperCase()}`,
        createdAt: new Date().toISOString(),
      };
      write(K_HH, [next, ...list]);
      return next;
    },
    updateHousehold(id: string, patch: Partial<Household>) {
      write(
        K_HH,
        read<Household>(K_HH).map((x) => (x.id === id ? { ...x, ...patch } : x)),
      );
    },
    removeHousehold(id: string) {
      write(
        K_HH,
        read<Household>(K_HH).filter((x) => x.id !== id),
      );
    },
    createRequest(r: Omit<CollectionRequest, "id" | "requestedAt" | "status">) {
      const next: CollectionRequest = {
        ...r,
        id: `RQ-${Date.now().toString(36).toUpperCase()}`,
        requestedAt: new Date().toISOString(),
        status: "en_attente",
      };
      write(K_REQ, [next, ...read<CollectionRequest>(K_REQ)]);
      return next;
    },
    reportBinIssue(b: Omit<BinIssue, "id" | "reportedAt" | "status">) {
      const next: BinIssue = {
        ...b,
        id: `BI-${Date.now().toString(36).toUpperCase()}`,
        reportedAt: new Date().toISOString(),
        status: "signale",
      };
      write(K_BIN, [next, ...read<BinIssue>(K_BIN)]);
      return next;
    },
    logCollection(h: Omit<CollectionHistoryItem, "id" | "at">) {
      const next: CollectionHistoryItem = {
        ...h,
        id: `CL-${Date.now().toString(36).toUpperCase()}`,
        at: new Date().toISOString(),
      };
      write(K_HIST, [next, ...read<CollectionHistoryItem>(K_HIST)]);
      return next;
    },
  };
}

// Calendrier de collecte par commune (jours par défaut).
// Chaque commune reçoit un passage 2×/semaine.
export const COLLECTION_SCHEDULE: Record<string, { days: number[]; window: string }> = {
  // 0 = dimanche
  default: { days: [1, 4], window: "06:00 – 12:00" },
};

export function scheduleFor(commune: string) {
  const key = commune.toLowerCase();
  return COLLECTION_SCHEDULE[key] ?? COLLECTION_SCHEDULE.default;
}

export const SORT_TIPS = [
  {
    id: "organique",
    label: "Déchets organiques",
    color: "#84cc16",
    tips: [
      "Épluchures, restes de repas, marc de café → bac vert (compostable)",
      "Éviter de mélanger avec du plastique ou du verre",
    ],
  },
  {
    id: "plastique",
    label: "Plastiques & PET",
    color: "#0ea5e9",
    tips: [
      "Rincer les bouteilles, écraser pour gagner de la place",
      "Séparer les bouchons et étiquettes lorsqu'ils sont amovibles",
    ],
  },
  {
    id: "papier",
    label: "Papier & carton",
    color: "#f59e0b",
    tips: [
      "Aplatir les cartons pour optimiser le volume",
      "Éviter les papiers gras ou souillés (à composter)",
    ],
  },
  {
    id: "verre",
    label: "Verre",
    color: "#10b981",
    tips: ["Bocaux et bouteilles rincés", "Ne pas jeter d'ampoules ni de vaisselle dans ce bac"],
  },
  {
    id: "deee",
    label: "Déchets électroniques (DEEE)",
    color: "#8b5cf6",
    tips: [
      "Rapporter piles, chargeurs, téléphones aux points de collecte partenaires",
      "Ne jamais mélanger avec les ordures ménagères",
    ],
  },
  {
    id: "dangereux",
    label: "Déchets dangereux",
    color: "#ef4444",
    tips: [
      "Médicaments périmés → pharmacie",
      "Peintures, solvants, huiles → collecte spéciale sur demande",
    ],
  },
];
