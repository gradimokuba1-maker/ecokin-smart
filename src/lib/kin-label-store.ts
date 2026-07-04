// EcoKin Smart — Store Suivi & Évaluation (Monitoring & Evaluation) Kin Label.
// Persistance localStorage + événement de synchro live. Prêt pour un futur backend Supabase.
import { useEffect, useState } from "react";

export type ActivityStatus = "planifiee" | "en_cours" | "terminee" | "en_retard";

export type KpiIndicator = {
  id: string;
  label: string;
  target: number;
  actual: number;
  unit: string;
};

export type FieldReport = {
  id: string;
  at: string;
  agent: string;
  note: string;
  lat?: number;
  lng?: number;
  photoUrl?: string;
};

export type KinLabelActivity = {
  id: string;
  title: string;
  description: string;
  commune: string;
  team: string;
  responsable: string;
  startDate: string;
  endDate: string;
  budgetCdf: number;
  spentCdf: number;
  objective: string;
  status: ActivityStatus;
  progressPct: number;
  kpis: KpiIndicator[];
  reports: FieldReport[];
  createdAt: string;
};

const KEY = "ecokin_kin_label_v1";
const EVT = "ecokin:kin-label";

function read(): KinLabelActivity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function write(list: KinLabelActivity[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVT));
}

// Aucune activité de démonstration : les autorités saisissent leurs propres
// activités Kin Label avec des montants réels.


function computeStatus(a: KinLabelActivity): ActivityStatus {
  if (a.progressPct >= 100) return "terminee";
  const now = Date.now();
  const end = new Date(a.endDate).getTime();
  if (end < now && a.progressPct < 100) return "en_retard";
  const start = new Date(a.startDate).getTime();
  if (start <= now) return "en_cours";
  return "planifiee";
}

export function useKinLabel() {
  const [items, setItems] = useState<KinLabelActivity[]>(() => read());
  useEffect(() => {
    const h = () => setItems(read());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return {
    items: items.map((a) => ({ ...a, status: computeStatus(a) })),
    create(a: Omit<KinLabelActivity, "id" | "createdAt" | "reports" | "spentCdf" | "progressPct" | "status">) {
      const list = read();
      const id = `KL-${String(list.length + 1).padStart(3, "0")}`;
      const next: KinLabelActivity = {
        ...a,
        id,
        createdAt: new Date().toISOString(),
        reports: [],
        spentCdf: 0,
        progressPct: 0,
        status: "planifiee",
      };
      write([next, ...list]);
    },
    update(id: string, patch: Partial<KinLabelActivity>) {
      write(read().map((x) => (x.id === id ? { ...x, ...patch } : x)));
    },
    addReport(id: string, r: Omit<FieldReport, "id" | "at">) {
      write(
        read().map((x) =>
          x.id === id
            ? { ...x, reports: [{ ...r, id: `fr${Date.now()}`, at: new Date().toISOString() }, ...x.reports] }
            : x,
        ),
      );
    },
    remove(id: string) {
      write(read().filter((x) => x.id !== id));
    },
  };
}
