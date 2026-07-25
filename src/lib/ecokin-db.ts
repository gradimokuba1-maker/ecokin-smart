import { useEffect, useState } from "react";
import { DEFAULT_CITY } from "./cities";
import type { LiveReport } from "./live-reports";

export type EcokinRole = "citoyen" | "agent" | "bourgmestre" | "gouverneur" | "admin";

export type TerritorialScope = {
  province: string;
  city: string;
  commune?: string;
  quartier?: string;
  zone?: string;
};

export type EcokinUserRecord = TerritorialScope & {
  id: string;
  identifier: string;
  password: string;
  role: EcokinRole;
  name: string;
  phone?: string;
  permissions: string[];
  active: boolean;
  points: number;
  reports: number;
  badges: string[];
  createdAt: string;
  updatedAt: string;
};

export type EcokinDb = {
  version: 1;
  counters: Record<string, number>;
  users: EcokinUserRecord[];
  reports: LiveReport[];
};

export const DB_KEY = "ecokin_db_v1";
export const DB_EVT = "ecokin:db";

const OLD_USER_KEY = "ecokin_user_v1";
const OLD_REPORTS_KEY = "ecokin_live_reports_v1";

export const DEFAULT_SCOPE: Required<Pick<TerritorialScope, "province" | "city">> = {
  province: "Kinshasa",
  city: "Kinshasa",
};

export const ROLE_PERMISSIONS_DB: Record<EcokinRole, string[]> = {
  citoyen: ["signaler"],
  agent: ["signaler", "manage_fleet", "manage_activities"],
  bourgmestre: ["signaler", "export_data", "manage_alerts", "manage_activities", "manage_fleet", "moderate_reports"],
  gouverneur: ["signaler", "export_data", "manage_alerts", "manage_activities", "manage_fleet", "moderate_reports"],
  admin: ["signaler", "export_data", "manage_alerts", "manage_activities", "manage_fleet", "moderate_reports", "reset_data"],
};

const AUTHORITY_SEEDS: Array<Omit<EcokinUserRecord, "createdAt" | "updatedAt">> = [
  {
    id: "ECO-USER-000001",
    identifier: "ECOKIN-GOUV",
    password: "GOUV2026",
    role: "gouverneur",
    name: "Cabinet du Gouverneur",
    province: DEFAULT_SCOPE.province,
    city: DEFAULT_SCOPE.city,
    permissions: ROLE_PERMISSIONS_DB.gouverneur,
    active: true,
    points: 0,
    reports: 0,
    badges: [],
  },
  {
    id: "ECO-USER-000002",
    identifier: "ECOKIN-ADMIN",
    password: "ADMIN2026",
    role: "admin",
    name: "Administrateur communal",
    province: DEFAULT_SCOPE.province,
    city: DEFAULT_SCOPE.city,
    commune: DEFAULT_CITY.communes[0]?.id,
    permissions: ROLE_PERMISSIONS_DB.admin,
    active: true,
    points: 0,
    reports: 0,
    badges: [],
  },
  {
    id: "ECO-USER-000003",
    identifier: "ECOKIN-BOURG",
    password: "BOURG2026",
    role: "bourgmestre",
    name: "Bourgmestre",
    province: DEFAULT_SCOPE.province,
    city: DEFAULT_SCOPE.city,
    commune: DEFAULT_CITY.communes[0]?.id,
    permissions: ROLE_PERMISSIONS_DB.bourgmestre,
    active: true,
    points: 0,
    reports: 0,
    badges: [],
  },
  {
    id: "ECO-USER-000004",
    identifier: "ECOKIN-AGENT",
    password: "AGENT2026",
    role: "agent",
    name: "Agent terrain",
    province: DEFAULT_SCOPE.province,
    city: DEFAULT_SCOPE.city,
    commune: DEFAULT_CITY.communes[0]?.id,
    permissions: ROLE_PERMISSIONS_DB.agent,
    active: true,
    points: 0,
    reports: 0,
    badges: [],
  },
];

function now() {
  return new Date().toISOString();
}

function emptyDb(): EcokinDb {
  const at = now();
  return {
    version: 1,
    counters: {
      "ECO-USER": AUTHORITY_SEEDS.length,
      "ECO-SIG": 0,
      "ECO-COL": 0,
    },
    users: AUTHORITY_SEEDS.map((user) => ({ ...user, createdAt: at, updatedAt: at })),
    reports: [],
  };
}

function parseCounter(id: string, prefix: string) {
  const match = id.match(new RegExp(`^${prefix}-(\\d+)$`));
  return match ? Number(match[1]) : 0;
}

function normalizeCommune(commune?: string) {
  if (!commune) return undefined;
  const trimmed = commune.trim();
  const byId = DEFAULT_CITY.communes.find((c) => c.id === trimmed);
  if (byId) return byId.id;
  const byName = DEFAULT_CITY.communes.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
  return byName?.id ?? trimmed;
}

function migrateLegacyUser(db: EcokinDb) {
  if (typeof window === "undefined") return db;
  try {
    const raw = localStorage.getItem(OLD_USER_KEY);
    if (!raw) return db;
    const legacy = JSON.parse(raw) as {
      name?: string;
      commune?: string;
      phone?: string;
      pin?: string;
      registered?: boolean;
      points?: number;
      reports?: number;
      badges?: string[];
    };
    if (!legacy.phone || db.users.some((user) => user.role === "citoyen" && user.phone === legacy.phone)) return db;
    const id = nextId(db, "ECO-USER");
    db.users.push({
      id,
      identifier: legacy.phone,
      password: legacy.pin ?? "",
      role: "citoyen",
      name: legacy.name ?? "Citoyen EcoKin",
      phone: legacy.phone,
      province: DEFAULT_SCOPE.province,
      city: DEFAULT_SCOPE.city,
      commune: normalizeCommune(legacy.commune),
      permissions: ROLE_PERMISSIONS_DB.citoyen,
      active: Boolean(legacy.registered),
      points: legacy.points ?? 0,
      reports: legacy.reports ?? 0,
      badges: legacy.badges ?? [],
      createdAt: now(),
      updatedAt: now(),
    });
  } catch {
    return db;
  }
  return db;
}

function normalizeReport(report: LiveReport, db: EcokinDb): LiveReport {
  const nextReport = { ...report };
  const sequence = parseCounter(nextReport.id, "ECO-SIG");
  if (!sequence) {
    nextReport.id = nextId(db, "ECO-SIG");
  } else {
    db.counters["ECO-SIG"] = Math.max(db.counters["ECO-SIG"] ?? 0, sequence);
  }
  nextReport.commune = normalizeCommune(nextReport.commune) ?? nextReport.commune;
  nextReport.history = nextReport.history?.length ? nextReport.history : [{ at: nextReport.createdAt, label: "Signalement reçu" }];
  return nextReport;
}

function migrateLegacyReports(db: EcokinDb) {
  if (typeof window === "undefined") return db;
  try {
    const raw = localStorage.getItem(OLD_REPORTS_KEY);
    if (!raw) return db;
    const legacy = JSON.parse(raw) as LiveReport[];
    const existingIds = new Set(db.reports.map((report) => report.id));
    const migrated = legacy.map((report) => normalizeReport(report, db)).filter((report) => !existingIds.has(report.id));
    db.reports = [...db.reports, ...migrated];
  } catch {
    return db;
  }
  return db;
}

function withConstraints(db: EcokinDb): EcokinDb {
  const userIds = new Set<string>();
  const users = db.users
    .filter((user) => {
      if (!user.id || userIds.has(user.id)) return false;
      userIds.add(user.id);
      return true;
    })
    .map((user) => ({
      ...user,
      commune: normalizeCommune(user.commune),
      permissions: user.permissions?.length ? user.permissions : ROLE_PERMISSIONS_DB[user.role],
      active: user.active !== false,
      points: user.points ?? 0,
      reports: user.reports ?? 0,
      badges: user.badges ?? [],
    }));

  const reportIds = new Set<string>();
  const reports = db.reports.filter((report) => {
    if (!report.id || reportIds.has(report.id)) return false;
    reportIds.add(report.id);
    return true;
  });

  const userMax = Math.max(0, ...users.map((user) => parseCounter(user.id, "ECO-USER")));
  const reportMax = Math.max(0, ...reports.map((report) => parseCounter(report.id, "ECO-SIG")));

  return {
    version: 1,
    counters: {
      ...db.counters,
      "ECO-USER": Math.max(db.counters["ECO-USER"] ?? 0, userMax),
      "ECO-SIG": Math.max(db.counters["ECO-SIG"] ?? 0, reportMax),
      "ECO-COL": db.counters["ECO-COL"] ?? 0,
    },
    users,
    reports,
  };
}

export function readDb(): EcokinDb {
  if (typeof window === "undefined") return emptyDb();
  try {
    const raw = localStorage.getItem(DB_KEY);
    const parsed = raw ? ({ ...emptyDb(), ...JSON.parse(raw) } as EcokinDb) : emptyDb();
    const migrated = migrateLegacyReports(migrateLegacyUser(parsed));
    const constrained = withConstraints(migrated);
    if (!raw || JSON.stringify(parsed) !== JSON.stringify(constrained)) writeDb(constrained, false);
    return constrained;
  } catch {
    const db = emptyDb();
    writeDb(db, false);
    return db;
  }
}

export function writeDb(db: EcokinDb, notify = true) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DB_KEY, JSON.stringify(withConstraints(db)));
  if (notify) window.dispatchEvent(new Event(DB_EVT));
}

export function nextId(db: EcokinDb, prefix: "ECO-USER" | "ECO-SIG" | "ECO-COL") {
  const next = (db.counters[prefix] ?? 0) + 1;
  db.counters[prefix] = next;
  return `${prefix}-${String(next).padStart(6, "0")}`;
}

export function useEcokinDb() {
  const [db, setDb] = useState<EcokinDb>(() => readDb());
  useEffect(() => {
    const refresh = () => setDb(readDb());
    refresh();
    window.addEventListener(DB_EVT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(DB_EVT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return db;
}

export function upsertUser(input: Partial<EcokinUserRecord> & Pick<EcokinUserRecord, "role" | "name" | "identifier" | "password">) {
  const db = readDb();
  const at = now();
  const commune = normalizeCommune(input.commune);
  const existingIndex = db.users.findIndex(
    (user) => user.role === input.role && user.identifier.toLowerCase() === input.identifier.toLowerCase(),
  );
  const base: EcokinUserRecord = {
    id: input.id ?? nextId(db, "ECO-USER"),
    identifier: input.identifier,
    password: input.password,
    role: input.role,
    name: input.name,
    phone: input.phone,
    province: input.province ?? DEFAULT_SCOPE.province,
    city: input.city ?? DEFAULT_SCOPE.city,
    commune,
    quartier: input.quartier,
    zone: input.zone,
    permissions: input.permissions ?? ROLE_PERMISSIONS_DB[input.role],
    active: input.active ?? true,
    points: input.points ?? 0,
    reports: input.reports ?? 0,
    badges: input.badges ?? [],
    createdAt: input.createdAt ?? at,
    updatedAt: at,
  };
  if (existingIndex >= 0) {
    db.users[existingIndex] = { ...db.users[existingIndex], ...base, id: db.users[existingIndex].id };
  } else {
    db.users.unshift(base);
  }
  writeDb(db);
  return existingIndex >= 0 ? db.users[existingIndex] : base;
}

export function updateUser(id: string, patch: Partial<EcokinUserRecord>) {
  const db = readDb();
  const at = now();
  let updated: EcokinUserRecord | undefined;
  db.users = db.users.map((user) => {
    if (user.id !== id) return user;
    updated = { ...user, ...patch, commune: normalizeCommune(patch.commune) ?? user.commune, updatedAt: at };
    return updated;
  });
  writeDb(db);
  return updated;
}

export function deleteUser(id: string) {
  const db = readDb();
  db.users = db.users.filter((user) => user.id !== id);
  writeDb(db);
}

export function findUserByCredentials(role: EcokinRole, identifier: string, password: string) {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const normalizedPassword = password.trim();
  return readDb().users.find(
    (user) =>
      user.active &&
      user.role === role &&
      user.identifier.trim().toLowerCase() === normalizedIdentifier &&
      user.password === normalizedPassword,
  );
}

export function insertReport(input: Omit<LiveReport, "id" | "createdAt" | "ack" | "status" | "history">) {
  const db = readDb();
  const at = now();
  const item: LiveReport = {
    ...input,
    id: nextId(db, "ECO-SIG"),
    createdAt: at,
    commune: normalizeCommune(input.commune) ?? input.commune,
    ack: false,
    status: "en_attente",
    history: [{ at, label: "Signalement reçu" }],
    photoBefore: undefined,
    photoAfter: undefined,
  };
  db.reports = [item, ...db.reports];
  writeDb(db);
  return item;
}

export function updateReport(id: string, patch: Partial<LiveReport>, historyLabel?: string) {
  const db = readDb();
  const at = now();
  let updated: LiveReport | undefined;
  db.reports = db.reports.map((report) => {
    if (report.id !== id) return report;
    updated = {
      ...report,
      ...patch,
      history: historyLabel ? [...report.history, { at, label: historyLabel }] : report.history,
    };
    return updated;
  });
  writeDb(db);
  return updated;
}

export function clearOperationalData() {
  const db = readDb();
  db.reports = [];
  db.counters["ECO-SIG"] = 0;
  writeDb(db);
}
