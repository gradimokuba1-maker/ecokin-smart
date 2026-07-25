// Session citoyenne persistante. Les comptes sont conserves dans ecokin-db;
// la deconnexion ne supprime plus le profil ni les Green Points.
import { useEffect, useState } from "react";
import { DB_EVT, findUserByCredentials, readDb, updateUser, upsertUser } from "./ecokin-db";
import type { EcokinUserRecord } from "./ecokin-db";

const SESSION_KEY = "ecokin_citizen_session_v1";

export type EcoUser = {
  id?: string;
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

function toEcoUser(record?: EcokinUserRecord, registered = false): EcoUser {
  if (!record) return DEFAULT;
  return {
    id: record.id,
    name: record.name,
    commune: record.commune ?? record.city,
    phone: record.phone ?? record.identifier,
    pin: record.password,
    registered,
    points: record.points,
    reports: record.reports,
    badges: record.badges,
  };
}

function readSessionUser(): EcoUser {
  if (typeof window === "undefined") return DEFAULT;
  const userId = localStorage.getItem(SESSION_KEY);
  if (!userId) return DEFAULT;
  const record = readDb().users.find((user) => user.id === userId && user.role === "citoyen");
  return toEcoUser(record, Boolean(record));
}

function writeSession(userId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, userId);
  window.dispatchEvent(new Event(DB_EVT));
}

function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(DB_EVT));
}

export function useEcoUser() {
  const [user, setUser] = useState<EcoUser>(DEFAULT);

  useEffect(() => {
    const refresh = () => setUser(readSessionUser());
    refresh();
    window.addEventListener(DB_EVT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(DB_EVT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const update = (patch: Partial<EcoUser>) => {
    setUser((prev) => {
      if (!prev.id) return { ...prev, ...patch };
      const updated = updateUser(prev.id, {
        name: patch.name,
        commune: patch.commune,
        phone: patch.phone,
        identifier: patch.phone,
        password: patch.pin,
        points: patch.points,
        reports: patch.reports,
        badges: patch.badges,
      });
      return toEcoUser(updated, true);
    });
  };

  const addPoints = (n: number) => {
    setUser((prev) => {
      if (!prev.id) return prev;
      const updated = updateUser(prev.id, {
        points: prev.points + n,
        reports: prev.reports + 1,
      });
      return toEcoUser(updated, true);
    });
  };

  const spend = (n: number) => {
    if (user.points < n || !user.id) return false;
    const updated = updateUser(user.id, { points: user.points - n });
    setUser(toEcoUser(updated, true));
    return true;
  };

  const register = (data: { name: string; commune: string; phone: string; pin: string }) => {
    const existing = readDb().users.find((item) => item.role === "citoyen" && item.phone === data.phone);
    const saved = upsertUser({
      id: existing?.id,
      role: "citoyen",
      name: data.name,
      identifier: data.phone,
      password: data.pin,
      phone: data.phone,
      commune: data.commune,
      points: existing?.points ?? 0,
      reports: existing?.reports ?? 0,
      badges: existing?.badges ?? [],
      active: true,
    });
    writeSession(saved.id);
    setUser(toEcoUser(saved, true));
    return true;
  };

  const signIn = (phone: string, pin: string) => {
    const record = findUserByCredentials("citoyen", phone, pin);
    if (!record) return false;
    writeSession(record.id);
    setUser(toEcoUser(record, true));
    return true;
  };

  const signOut = () => {
    clearSession();
    setUser(DEFAULT);
  };

  return { user, update, addPoints, spend, register, signIn, signOut };
}
