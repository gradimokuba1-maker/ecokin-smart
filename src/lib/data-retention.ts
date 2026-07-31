import type { EcokinDb } from "./ecokin-db";
import type { LiveReport } from "./live-reports";

export type RetentionActionType =
    | "create"
    | "update"
    | "soft_delete"
    | "restore"
    | "backup"
    | "sync";

export type RetentionAuditEntry = {
    id: string;
    at: string;
    actor: string;
    action: RetentionActionType;
    entity: string;
    entityId?: string;
    details?: string;
};

export type RetentionBackup = {
    id: string;
    createdAt: string;
    source: string;
    db: EcokinDb;
    summary: {
        users: number;
        reports: number;
        counters: number;
    };
};

const BACKUP_KEY = "ecokin_retention_backups_v1";
const AUDIT_KEY = "ecokin_retention_audit_v1";
const MAX_BACKUPS = 25;
const MAX_AUDIT = 500;
const EVT = "ecokin:retention";

function now() {
    return new Date().toISOString();
}

function readBackups(): RetentionBackup[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(BACKUP_KEY) ?? "[]") as RetentionBackup[];
    } catch {
        return [];
    }
}

function writeBackups(list: RetentionBackup[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(BACKUP_KEY, JSON.stringify(list.slice(0, MAX_BACKUPS)));
    window.dispatchEvent(new Event(EVT));
}

function readAudit(): RetentionAuditEntry[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(AUDIT_KEY) ?? "[]") as RetentionAuditEntry[];
    } catch {
        return [];
    }
}

function writeAudit(list: RetentionAuditEntry[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(AUDIT_KEY, JSON.stringify(list.slice(0, MAX_AUDIT)));
    window.dispatchEvent(new Event(EVT));
}

export function recordRetentionAudit(
    action: RetentionActionType,
    entity: string,
    actor = "system",
    details?: string,
    entityId?: string,
) {
    const entry: RetentionAuditEntry = {
        id: `ret_${Math.random().toString(36).slice(2, 10)}`,
        at: now(),
        actor,
        action,
        entity,
        entityId,
        details,
    };
    const list = [entry, ...readAudit()];
    writeAudit(list);
    return entry;
}

export function createRetentionSnapshot(
    db: EcokinDb,
    source: string,
    actor = "system",
    details?: string,
): RetentionBackup {
    const snapshot: RetentionBackup = {
        id: `bak_${Date.now().toString(36)}`,
        createdAt: now(),
        source,
        db: JSON.parse(JSON.stringify(db)),
        summary: {
            users: db.users.length,
            reports: db.reports.length,
            counters: Object.keys(db.counters).length,
        },
    };

    const backups = [snapshot, ...readBackups()];
    writeBackups(backups);
    recordRetentionAudit("backup", "database", actor, details ?? `snapshot ${source}`, snapshot.id);
    return snapshot;
}

export function restoreRetentionSnapshot(snapshotId: string, actor = "system") {
    const backups = readBackups();
    const match = backups.find((backup) => backup.id === snapshotId);
    if (!match) return null;
    if (typeof window !== "undefined") {
        localStorage.setItem("ecokin_db_v1", JSON.stringify(match.db));
        window.dispatchEvent(new Event("ecokin:db"));
    }
    recordRetentionAudit("restore", "database", actor, `restore ${snapshotId}`, snapshotId);
    return match;
}

export function listRetentionBackups() {
    return readBackups();
}

export function listRetentionAudit() {
    return readAudit();
}

export function softDeleteReportRecord(report: LiveReport, actor = "system") {
    return {
        ...report,
        archivedAt: now(),
        active: false,
        deletedBy: actor,
    };
}

export function softDeleteUserRecord<T extends { active?: boolean; updatedAt?: string }>(
    user: T,
    actor = "system",
) {
    return {
        ...user,
        active: false,
        deletedAt: now(),
        deletedBy: actor,
        updatedAt: now(),
    };
}

export function restoreArchivedRecord<T extends { active?: boolean; deletedAt?: string }>(record: T) {
    return {
        ...record,
        active: true,
        deletedAt: undefined,
        deletedBy: undefined,
        restoredAt: now(),
    };
}
