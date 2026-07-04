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

function seed(): KinLabelActivity[] {
  const today = new Date().toISOString();
  return [
    {
      id: "KL-001",
      title: "Campagne Kin Label — Marché Gambela",
      description: "Distribution des labels 'Marché Propre' et sensibilisation des commerçants.",
      commune: "Kinshasa",
      team: "Brigade Verte Kin-Centre",
      responsable: "Mme Kabeya",
      startDate: "2026-06-10",
      endDate: "2026-07-30",
      budgetCdf: 12_500_000,
      spentCdf: 7_800_000,
      objective: "Labelliser 45 étals et former 120 commerçants au tri.",
      status: "en_cours",
      progressPct: 58,
      kpis: [
        { id: "k1", label: "Étals labellisés", target: 45, actual: 26, unit: "étals" },
        { id: "k2", label: "Commerçants formés", target: 120, actual: 78, unit: "pers." },
        { id: "k3", label: "Points de tri installés", target: 8, actual: 5, unit: "points" },
      ],
      reports: [
        { id: "fr1", at: today, agent: "Agent T. Muland", note: "26 étals audités, 3 non conformes.", lat: -4.323, lng: 15.312 },
      ],
      createdAt: today,
    },
    {
      id: "KL-002",
      title: "Curage participatif — Bandalungwa",
      description: "Chantier école avec 3 associations de quartier.",
      commune: "Bandalungwa",
      team: "RASKIN B-2",
      responsable: "Ing. Mpoyi",
      startDate: "2026-05-20",
      endDate: "2026-06-15",
      budgetCdf: 8_000_000,
      spentCdf: 8_150_000,
      objective: "1,2 km de caniveaux curés + 40 m³ évacués.",
      status: "en_retard",
      progressPct: 82,
      kpis: [
        { id: "k1", label: "Caniveaux curés", target: 1200, actual: 980, unit: "m" },
        { id: "k2", label: "Volume évacué", target: 40, actual: 33, unit: "m³" },
      ],
      reports: [],
      createdAt: today,
    },
    {
      id: "KL-003",
      title: "École propre — Ngaliema",
      description: "Kit de tri dans 15 écoles primaires, formation des éco-délégués.",
      commune: "Ngaliema",
      team: "Cellule Éducation",
      responsable: "Prof. Ilunga",
      startDate: "2026-07-01",
      endDate: "2026-09-30",
      budgetCdf: 6_400_000,
      spentCdf: 0,
      objective: "15 écoles équipées et 300 éco-délégués formés.",
      status: "planifiee",
      progressPct: 0,
      kpis: [
        { id: "k1", label: "Écoles équipées", target: 15, actual: 0, unit: "écoles" },
        { id: "k2", label: "Éco-délégués formés", target: 300, actual: 0, unit: "élèves" },
      ],
      reports: [],
      createdAt: today,
    },
  ];
}

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
