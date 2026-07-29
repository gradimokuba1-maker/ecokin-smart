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
  bourgmestre: [
    "signaler",
    "export_data",
    "manage_alerts",
    "manage_activities",
    "manage_fleet",
    "moderate_reports",
  ],
  gouverneur: [
    "signaler",
    "export_data",
    "manage_alerts",
    "manage_activities",
    "manage_fleet",
    "moderate_reports",
  ],
  admin: [
    "signaler",
    "export_data",
    "manage_alerts",
    "manage_activities",
    "manage_fleet",
    "moderate_reports",
    "reset_data",
  ],
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

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function communeId(name: string, fallbackIndex: number) {
  return (
    DEFAULT_CITY.communes.find((commune) => commune.name.toLowerCase() === name.toLowerCase())
      ?.id ??
    DEFAULT_CITY.communes[fallbackIndex]?.id ??
    name.toLowerCase()
  );
}

function demoPhoto(label: string, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#0f172a"/></linearGradient></defs><rect width="960" height="640" fill="url(#g)"/><circle cx="710" cy="155" r="90" fill="rgba(255,255,255,.18)"/><path d="M120 430c95-38 151-28 224-7 91 26 164 53 301-19 75-39 140-31 215 1v235H120z" fill="rgba(255,255,255,.2)"/><rect x="130" y="160" width="700" height="260" rx="28" fill="rgba(255,255,255,.16)" stroke="rgba(255,255,255,.45)" stroke-width="3"/><text x="480" y="290" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="48" font-weight="700">${label}</text><text x="480" y="342" text-anchor="middle" fill="rgba(255,255,255,.82)" font-family="Arial, sans-serif" font-size="24">Photo de demonstration EcoKin Smart</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function demoReports(): LiveReport[] {
  const kalamu = communeId("Kalamu", 3);
  const matete = communeId("Matete", 0);
  const limete = communeId("Limete", 4);
  const gombe = communeId("Gombe", 5);
  const ngaba = communeId("Ngaba", 6);
  const kimbanseke = communeId("Kimbanseke", 7);

  return [
    {
      id: "ECO-SIG-000001",
      createdAt: hoursAgo(3),
      author: "Citoyen Anonyme",
      authorId: "demo-citizen-1",
      authorRole: "citoyen",
      province: DEFAULT_SCOPE.province,
      city: DEFAULT_SCOPE.city,
      commune: kalamu,
      quartier: "Matonge",
      zone: "Avenue Victoire",
      category: "mixte",
      urgency: "critique",
      description: "Depot sauvage pres du marche, obstruction partielle du caniveau.",
      lat: -4.3508,
      lng: 15.3086,
      volumeM3: 18,
      priorityScore: 94,
      ack: true,
      ackBy: "Bourgmestre",
      ackAt: hoursAgo(2.7),
      team: "Equipe RASKIN Kalamu-1",
      status: "assignee",
      history: [
        { at: hoursAgo(3), label: "Signalement recu" },
        { at: hoursAgo(2.8), label: "Auto-assignation -> Equipe RASKIN Kalamu-1" },
      ],
      photoUrl: demoPhoto("Depot Kalamu", "#ef4444"),
      photoBefore: demoPhoto("Avant Kalamu", "#dc2626"),
      composition: [
        { material: "plastique", percentage: 42 },
        { material: "organique", percentage: 35 },
        { material: "metal", percentage: 8 },
      ],
      weightTons: 5.4,
      weightConfidence: 0.82,
      dimensions: {
        lengthM: 7.5,
        widthM: 3.2,
        heightAvgM: 0.75,
        surfaceM2: 24,
        volumeM3: 18,
        confidence: 0.78,
      },
      priorityLevel: "critique",
      analysisConfidence: 0.87,
      cameraCapability: "basic",
      model3DAvailable: true,
      healthRisk: "eleve",
      floodRisk: true,
      interventionUrgent: true,
      greenPointsAwarded: 45,
      assignedAgentId: "ECO-USER-000004",
      assignedAgentName: "Agent terrain",
    },
    {
      id: "ECO-SIG-000002",
      createdAt: hoursAgo(9),
      author: "Citoyen EcoKin",
      authorId: "demo-citizen-2",
      authorRole: "citoyen",
      province: DEFAULT_SCOPE.province,
      city: DEFAULT_SCOPE.city,
      commune: matete,
      quartier: "Mutoto",
      category: "organique",
      urgency: "eleve",
      description: "Accumulation de dechets organiques autour du point de collecte.",
      lat: -4.3833,
      lng: 15.3333,
      volumeM3: 11,
      priorityScore: 78,
      ack: false,
      team: "Equipe RASKIN Matete-1",
      status: "en_cours",
      history: [
        { at: hoursAgo(9), label: "Signalement recu" },
        { at: hoursAgo(8.5), label: "Statut -> en_cours" },
      ],
      photoUrl: demoPhoto("Collecte Matete", "#f97316"),
      photoBefore: demoPhoto("Avant Matete", "#f59e0b"),
      composition: [
        { material: "organique", percentage: 58 },
        { material: "plastique", percentage: 27 },
      ],
      weightTons: 3.1,
      priorityLevel: "eleve",
      analysisConfidence: 0.81,
      cameraCapability: "basic",
      model3DAvailable: false,
      healthRisk: "modere",
      floodRisk: false,
      interventionUrgent: true,
      greenPointsAwarded: 30,
      assignedAgentId: "ECO-USER-000004",
      assignedAgentName: "Agent terrain",
    },
    {
      id: "ECO-SIG-000003",
      createdAt: hoursAgo(26),
      author: "Sentinelle EcoKin",
      authorId: "demo-citizen-3",
      authorRole: "citoyen",
      province: DEFAULT_SCOPE.province,
      city: DEFAULT_SCOPE.city,
      commune: limete,
      quartier: "Industriel",
      category: "plastique",
      urgency: "moyen",
      description: "Sacs plastiques disperses pres du centre de transfert.",
      lat: -4.3514,
      lng: 15.3432,
      volumeM3: 6,
      priorityScore: 55,
      ack: true,
      status: "terminee",
      history: [
        { at: hoursAgo(26), label: "Signalement recu" },
        { at: hoursAgo(22), label: "Statut -> terminee" },
      ],
      photoUrl: demoPhoto("Limete", "#0ea5e9"),
      photoBefore: demoPhoto("Avant Limete", "#0284c7"),
      photoAfter: demoPhoto("Apres Limete", "#10b981"),
      composition: [
        { material: "plastique", percentage: 72 },
        { material: "papier", percentage: 12 },
      ],
      weightTons: 1.8,
      priorityLevel: "moyen",
      analysisConfidence: 0.76,
      cameraCapability: "basic",
      healthRisk: "faible",
      floodRisk: false,
      interventionUrgent: false,
      greenPointsAwarded: 20,
    },
    {
      id: "ECO-SIG-000004",
      createdAt: hoursAgo(50),
      author: "Service communal",
      authorId: "demo-authority-1",
      authorRole: "bourgmestre",
      province: DEFAULT_SCOPE.province,
      city: DEFAULT_SCOPE.city,
      commune: gombe,
      quartier: "Gare Centrale",
      category: "verre",
      urgency: "faible",
      description: "Bacs de tri a relever apres forte affluence.",
      lat: -4.3211,
      lng: 15.3094,
      volumeM3: 3,
      priorityScore: 32,
      ack: true,
      status: "terminee",
      history: [
        { at: hoursAgo(50), label: "Signalement recu" },
        { at: hoursAgo(45), label: "Statut -> terminee" },
      ],
      photoUrl: demoPhoto("Gombe", "#6366f1"),
      photoAfter: demoPhoto("Apres Gombe", "#22c55e"),
      composition: [{ material: "verre", percentage: 83 }],
      weightTons: 2.3,
      priorityLevel: "faible",
      analysisConfidence: 0.7,
      cameraCapability: "basic",
      healthRisk: "faible",
      floodRisk: false,
      interventionUrgent: false,
      greenPointsAwarded: 12,
    },
    {
      id: "ECO-SIG-000005",
      createdAt: hoursAgo(74),
      author: "Citoyen Anonyme",
      authorId: "demo-citizen-4",
      authorRole: "citoyen",
      province: DEFAULT_SCOPE.province,
      city: DEFAULT_SCOPE.city,
      commune: ngaba,
      quartier: "Rond-point",
      category: "construction",
      urgency: "eleve",
      description: "Gravats de construction sur la chaussee, circulation reduite.",
      lat: -4.3936,
      lng: 15.3091,
      volumeM3: 14,
      priorityScore: 83,
      ack: false,
      team: "Cellule d'urgence Gouvernorat",
      status: "assignee",
      history: [
        { at: hoursAgo(74), label: "Signalement recu" },
        { at: hoursAgo(73.5), label: "Auto-assignation -> Cellule d'urgence Gouvernorat" },
      ],
      photoUrl: demoPhoto("Ngaba", "#8b5cf6"),
      composition: [{ material: "gravats", percentage: 88 }],
      weightTons: 8.7,
      priorityLevel: "eleve",
      analysisConfidence: 0.79,
      cameraCapability: "basic",
      healthRisk: "modere",
      floodRisk: false,
      interventionUrgent: true,
      greenPointsAwarded: 35,
    },
    {
      id: "ECO-SIG-000006",
      createdAt: hoursAgo(120),
      author: "Citoyen EcoKin",
      authorId: "demo-citizen-5",
      authorRole: "citoyen",
      province: DEFAULT_SCOPE.province,
      city: DEFAULT_SCOPE.city,
      commune: kimbanseke,
      quartier: "Centre",
      category: "metal",
      urgency: "moyen",
      description: "Depot mixte contenant ferraille et emballages.",
      lat: -4.4318,
      lng: 15.4081,
      volumeM3: 8,
      priorityScore: 61,
      ack: true,
      status: "en_attente",
      history: [{ at: hoursAgo(120), label: "Signalement recu" }],
      photoUrl: demoPhoto("Kimbanseke", "#14b8a6"),
      composition: [
        { material: "metal", percentage: 31 },
        { material: "plastique", percentage: 26 },
      ],
      weightTons: 4.2,
      priorityLevel: "moyen",
      analysisConfidence: 0.74,
      cameraCapability: "basic",
      healthRisk: "modere",
      floodRisk: false,
      interventionUrgent: false,
      greenPointsAwarded: 18,
    },
  ];
}

function emptyDb(): EcokinDb {
  const at = now();
  return {
    version: 1,
    counters: {
      "ECO-USER": AUTHORITY_SEEDS.length,
      "ECO-SIG": 6,
      "ECO-COL": 0,
    },
    users: AUTHORITY_SEEDS.map((user) => ({ ...user, createdAt: at, updatedAt: at })),
    reports: demoReports(),
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
    if (
      !legacy.phone ||
      db.users.some((user) => user.role === "citoyen" && user.phone === legacy.phone)
    )
      return db;
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
  nextReport.history = nextReport.history?.length
    ? nextReport.history
    : [{ at: nextReport.createdAt, label: "Signalement reçu" }];
  return nextReport;
}

function migrateLegacyReports(db: EcokinDb) {
  if (typeof window === "undefined") return db;
  try {
    const raw = localStorage.getItem(OLD_REPORTS_KEY);
    if (!raw) return db;
    const legacy = JSON.parse(raw) as LiveReport[];
    const existingIds = new Set(db.reports.map((report) => report.id));
    const migrated = legacy
      .map((report) => normalizeReport(report, db))
      .filter((report) => !existingIds.has(report.id));
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

export function upsertUser(
  input: Partial<EcokinUserRecord> &
    Pick<EcokinUserRecord, "role" | "name" | "identifier" | "password">,
) {
  const db = readDb();
  const at = now();
  const commune = normalizeCommune(input.commune);
  const existingIndex = db.users.findIndex(
    (user) =>
      user.role === input.role && user.identifier.toLowerCase() === input.identifier.toLowerCase(),
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
    db.users[existingIndex] = {
      ...db.users[existingIndex],
      ...base,
      id: db.users[existingIndex].id,
    };
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
    updated = {
      ...user,
      ...patch,
      commune: normalizeCommune(patch.commune) ?? user.commune,
      updatedAt: at,
    };
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

export function insertReport(
  input: Omit<LiveReport, "id" | "createdAt" | "ack" | "status" | "history">,
) {
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
