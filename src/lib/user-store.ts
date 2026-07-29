// EcoKin Smart — Module utilisateur citoyen et simulation de compte.
import { useEffect, useState, useCallback } from "react";
import { upsertUser, findUserByCredentials, updateUser } from "./ecokin-db";
import type { EcokinUserRecord } from "./ecokin-db";

export type UserRole = "citoyen" | "agent" | "bourgmestre" | "gouverneur" | "admin";

export type User = {
  id: string;
  name: string;
  role: UserRole;
  commune?: string;
  phone?: string;
  points: number;
  reports: number;
  badges: string[];
  registered: boolean;
};

const K_USER = "ecokin_user_v1";
const EVT = "ecokin:user";

const DEFAULT_USER: User = {
  id: "citoyen-anonyme",
  name: "Citoyen",
  role: "citoyen",
  points: 0,
  reports: 0,
  badges: [],
  registered: false,
};

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new Event(EVT));
}

function userFromRecord(record: EcokinUserRecord): User {
  return {
    id: record.id,
    name: record.name,
    role: record.role,
    commune: record.commune,
    phone: record.phone,
    points: record.points,
    reports: record.reports,
    badges: record.badges,
    registered: true,
  };
}

function readUser(): User {
  const stored = read<User>(K_USER);
  if (!stored) return DEFAULT_USER;

  if (stored.role === "citoyen" && stored.registered && stored.id) {
    const record = findUserByCredentials("citoyen", stored.phone ?? "", "");
    if (record && record.id === stored.id) {
      return userFromRecord(record);
    }
  }

  return { ...DEFAULT_USER, ...stored };
}

export function useEcoUser() {
  const [user, setUser] = useState<User>(readUser);

  const refresh = useCallback(() => {
    setUser(readUser());
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

  useEffect(() => {
    const data = read<User>(K_USER);
    if (!data) {
      write(K_USER, DEFAULT_USER);
      refresh();
    }
  }, [refresh]);

  return {
    user,
    login(u: User) {
      write(K_USER, u);
      setUser(u);
    },
    logout() {
      if (typeof window === "undefined") return;
      localStorage.removeItem(K_USER);
      setUser(DEFAULT_USER);
      window.dispatchEvent(new Event(EVT));
    },
    register(input: { name: string; commune?: string; phone: string; pin: string }) {
      const normalizedPhone = input.phone.trim();
      if (!normalizedPhone) return false;
      const record = findUserByCredentials("citoyen", normalizedPhone, input.pin);
      const saved = record
        ? record
        : upsertUser({
          role: "citoyen",
          identifier: normalizedPhone,
          password: input.pin,
          name: input.name,
          phone: normalizedPhone,
          commune: input.commune,
          points: 0,
          reports: 0,
          badges: [],
        });
      const next = userFromRecord(saved);
      write(K_USER, next);
      setUser(next);
      return true;
    },
    signIn(phone: string, pin: string) {
      const normalizedPhone = phone.trim();
      const record = findUserByCredentials("citoyen", normalizedPhone, pin);
      if (!record) return false;
      const next = userFromRecord(record);
      write(K_USER, next);
      setUser(next);
      return true;
    },
    spend(cost: number) {
      if (user.points < cost) return false;
      if (!user.registered) return false;
      const updated = updateUser(user.id, { points: user.points - cost });
      if (!updated) return false;
      const next = userFromRecord(updated);
      write(K_USER, next);
      setUser(next);
      return true;
    },
  };
}
