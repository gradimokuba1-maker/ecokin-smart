// EcoKin Smart — Module utilisateur citoyen et simulation de compte.
import { useEffect, useState, useCallback } from "react";
import {
  upsertUser,
  findUserByCredentials,
  updateUser,
  updateReport,
  readDb,
} from "./ecokin-db";
import type { EcokinUserRecord } from "./ecokin-db";

export type UserRole = "citoyen" | "agent" | "bourgmestre" | "gouverneur" | "admin";

const PENDING_REPORTS_KEY = "ecokin_pending_report_ids_v1";

function readPendingReportIds(): string[] {
  return read<string[]>(PENDING_REPORTS_KEY) ?? [];
}

export function queuePendingReportId(reportId: string) {
  if (typeof window === "undefined") return;
  const existing = readPendingReportIds();
  if (!existing.includes(reportId)) {
    write(PENDING_REPORTS_KEY, [...existing, reportId]);
  }
}

function clearPendingReportIds() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PENDING_REPORTS_KEY);
}

function linkPendingReportsToUser(user: User) {
  const pending = readPendingReportIds();
  if (!pending.length) return 0;

  let linkedCount = 0;
  pending.forEach((reportId) => {
    const updated = updateReport(reportId, {
      author: user.name,
      authorId: user.id,
      authorRole: user.role,
    });
    if (updated) linkedCount += 1;
  });

  clearPendingReportIds();
  return linkedCount;
}

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
    const record = readDb().users.find((user) => user.id === stored.id && user.active);
    if (record) {
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
      if (u.registered && u.role === "citoyen") {
        const saved = updateUser(u.id, { points: u.points, reports: u.reports });
        if (saved) {
          u = userFromRecord(saved);
        }
        const linkedCount = linkPendingReportsToUser(u);
        if (linkedCount > 0) {
          const refreshed = readDb().users.find((record) => record.id === u.id);
          if (refreshed) {
            u = userFromRecord(refreshed);
          }
        }
      }
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
      const carriedPoints = user.registered ? 0 : user.points;
      const carriedReports = user.registered ? 0 : user.reports;
      const record = findUserByCredentials("citoyen", normalizedPhone, input.pin);
      const saved = record
        ? (updateUser(record.id, {
          name: input.name,
          commune: input.commune,
          points: record.points + carriedPoints,
          reports: record.reports + carriedReports,
        }) ?? record)
        : upsertUser({
          role: "citoyen",
          identifier: normalizedPhone,
          password: input.pin,
          name: input.name,
          phone: normalizedPhone,
          commune: input.commune,
          points: carriedPoints,
          reports: carriedReports,
          badges: [],
        });
      let next = userFromRecord(saved);
      const linkedCount = linkPendingReportsToUser(next);
      if (linkedCount > 0) {
        const refreshed = readDb().users.find((record) => record.id === next.id);
        if (refreshed) {
          next = userFromRecord(refreshed);
        }
      }
      write(K_USER, next);
      setUser(next);
      return true;
    },
    signIn(phone: string, pin: string) {
      const normalizedPhone = phone.trim();
      const record = findUserByCredentials("citoyen", normalizedPhone, pin);
      if (!record) return false;
      const carriedPoints = user.registered ? 0 : user.points;
      const carriedReports = user.registered ? 0 : user.reports;
      const saved = carriedPoints || carriedReports
        ? (updateUser(record.id, {
          points: record.points + carriedPoints,
          reports: record.reports + carriedReports,
        }) ?? record)
        : record;
      let next = userFromRecord(saved);
      const linkedCount = linkPendingReportsToUser(next);
      if (linkedCount > 0) {
        const refreshed = readDb().users.find((record) => record.id === next.id);
        if (refreshed) {
          next = userFromRecord(refreshed);
        }
      }
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
