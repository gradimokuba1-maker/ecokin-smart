// Lightweight client-side "session" for the demo citizen account.
// Persists in localStorage. Real auth would replace this with Lovable Cloud.
import { useEffect, useState } from "react";

const KEY = "ecokin_user_v1";

export type EcoUser = {
  name: string;
  commune: string;
  points: number;
  reports: number;
  badges: string[];
};

const DEFAULT: EcoUser = {
  name: "Citoyen EcoKin",
  commune: "Matete",
  points: 1420,
  reports: 17,
  badges: ["eco", "sentinelle"],
};

function read(): EcoUser {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function write(u: EcoUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(u));
}

export function useEcoUser() {
  const [user, setUser] = useState<EcoUser>(DEFAULT);
  useEffect(() => setUser(read()), []);
  const update = (patch: Partial<EcoUser>) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      write(next);
      return next;
    });
  };
  const addPoints = (n: number) => update({ points: user.points + n, reports: user.reports + 1 });
  const spend = (n: number) => {
    if (user.points < n) return false;
    update({ points: user.points - n });
    return true;
  };
  return { user, update, addPoints, spend };
}
