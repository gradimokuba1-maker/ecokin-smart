// Validation duale IA + Communale : stocke les corrections de classification
// pour simuler l'apprentissage progressif du modèle (mémoire locale).
import { useEffect, useState } from "react";

const KEY = "ecokin_ia_learning_v1";

export type Correction = {
  reportId: string;
  predicted: string;
  corrected: string;
  by: string; // commune / agent
  at: string;
};

type Store = {
  corrections: Correction[];
  validations: number; // signalements validés sans correction
};

const DEFAULT: Store = { corrections: [], validations: 0 };

function read(): Store {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function write(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function useLearning() {
  const [store, setStore] = useState<Store>(DEFAULT);
  useEffect(() => setStore(read()), []);

  const validate = () => {
    setStore((s) => {
      const next = { ...s, validations: s.validations + 1 };
      write(next);
      return next;
    });
  };
  const correct = (c: Correction) => {
    setStore((s) => {
      const next = { ...s, corrections: [c, ...s.corrections].slice(0, 200) };
      write(next);
      return next;
    });
  };

  const total = store.validations + store.corrections.length;
  // Précision IA simulée — augmente avec les validations, diminue avec corrections
  const precisionPct =
    total === 0
      ? 92.4
      : Math.min(99, Math.max(60, Math.round(((store.validations + 30) / (total + 30)) * 100)));

  return { store, validate, correct, precisionPct };
}
