// Lightweight client-side "session" for the demo citizen account.
// Persists in localStorage so Green Points and registration survive reloads.
import { useEffect, useState } from "react";

const KEY = "ecokin_user_v1";

export type EcoUser = {
  name: string;
  commune: string;
  phone: string;
  pin: string;
  registered: boolean;
  points: number;
  reports: number;
  badges: string[];
};

const DEFAULT: EcoUser = {
  name: "Citoyen EcoKin",
  commune: "Kinshasa",
  phone: "",
  pin: "",
  registered: false,
  points: 0,
  reports: 0,
  badges: [],
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
  const register = (data: { name: string; commune: string; phone: string; pin: string }) => {
    // Preserve accumulated Green Points, reports and badges.
    const current = read();
    const next: EcoUser = { ...current, ...data, registered: true };
    write(next);
    setUser(next);
    return true;
  };
  const signIn = (phone: string, pin: string) => {
    const current = read();
    if (current.registered && current.phone === phone && current.pin === pin) {
      setUser(current);
      return true;
    }
    return false;
  };
  const signOut = () => {
    const current = read();
    const next: EcoUser = { ...current, registered: false };
    write(next);
    setUser(next);
  };
  return { user, update, addPoints, spend, register, signIn, signOut };
}
