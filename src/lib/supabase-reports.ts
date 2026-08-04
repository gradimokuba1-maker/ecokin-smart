import { createClient, type RealtimeChannel } from "@supabase/supabase-js";
import type { LiveReport } from "./live-reports";

const url = (import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

const LEGACY_CHANNEL = "ecokin-signalements-realtime";
const clientSingleton = url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: false },
    })
    : null;

export function getSupabaseConfig() {
    return {
        url,
        anonKey,
        enabled: Boolean(url && anonKey),
    };
}

export function getSupabaseClient() {
    return clientSingleton;
}

export type SignalementRow = {
    id: string;
    created_at: string;
    author: string;
    author_id?: string | null;
    author_role?: string | null;
    province?: string | null;
    city?: string | null;
    commune: string;
    quartier?: string | null;
    zone?: string | null;
    category: string;
    urgency: string;
    description?: string | null;
    lat?: number | null;
    lng?: number | null;
    address?: string | null;
    volume_m3?: number | null;
    priority_score?: number | null;
    ack: boolean;
    ack_by?: string | null;
    ack_at?: string | null;
    team?: string | null;
    status: string;
    history: Array<{ at: string; label: string }>;
    photo_before?: string | null;
    photo_after?: string | null;
    photo_url?: string | null;
    image_hash?: string | null;
    ai_analysis?: unknown | null;
    weight_kg?: number | null;
    weight_tons?: number | null;
    green_points_awarded?: number | null;
    active?: boolean | null;
    deleted_at?: string | null;
    deleted_by?: string | null;
    archived_at?: string | null;
    assigned_agent_id?: string | null;
    assigned_agent_name?: string | null;
};

function getClient() {
    return getSupabaseClient();
}

function normalizeHistory(history?: Array<{ at: string; label: string }> | null): Array<{ at: string; label: string }> {
    return Array.isArray(history) && history.length > 0
        ? history
        : [{ at: new Date().toISOString(), label: "Signalement reçu" }];
}

function toRow(report: LiveReport): SignalementRow {
    return {
        id: report.id,
        created_at: report.createdAt,
        author: report.author,
        author_id: report.authorId ?? null,
        author_role: report.authorRole ?? null,
        province: report.province ?? null,
        city: report.city ?? null,
        commune: report.commune,
        quartier: report.quartier ?? null,
        zone: report.zone ?? null,
        category: report.category,
        urgency: report.urgency,
        description: report.description ?? null,
        lat: report.lat ?? null,
        lng: report.lng ?? null,
        address: report.address ?? null,
        volume_m3: report.volumeM3 ?? null,
        priority_score: report.priorityScore ?? null,
        ack: report.ack,
        ack_by: report.ackBy ?? null,
        ack_at: report.ackAt ?? null,
        team: report.team ?? null,
        status: report.status,
        history: normalizeHistory(report.history),
        photo_before: report.photoBefore ?? null,
        photo_after: report.photoAfter ?? null,
        photo_url: report.photoUrl ?? null,
        image_hash: report.imageHash ?? null,
        ai_analysis: report.aiAnalysis ?? null,
        weight_kg: report.weightKg ?? null,
        weight_tons: report.weightTons ?? null,
        green_points_awarded: report.greenPointsAwarded ?? null,
        active: report.active ?? true,
        deleted_at: report.deletedAt ?? null,
        deleted_by: report.deletedBy ?? null,
        archived_at: report.archivedAt ?? null,
        assigned_agent_id: report.assignedAgentId ?? null,
        assigned_agent_name: report.assignedAgentName ?? null,
    };
}

function fromRow(row: SignalementRow): LiveReport {
    return {
        id: row.id,
        createdAt: row.created_at,
        author: row.author,
        authorId: row.author_id ?? undefined,
        authorRole: (row.author_role as LiveReport["authorRole"]) ?? "anonyme",
        province: row.province ?? undefined,
        city: row.city ?? undefined,
        commune: row.commune,
        quartier: row.quartier ?? undefined,
        zone: row.zone ?? undefined,
        category: row.category,
        urgency: row.urgency as LiveReport["urgency"],
        description: row.description ?? undefined,
        lat: row.lat ?? undefined,
        lng: row.lng ?? undefined,
        address: row.address ?? undefined,
        volumeM3: row.volume_m3 ?? undefined,
        priorityScore: row.priority_score ?? undefined,
        ack: row.ack,
        ackBy: row.ack_by ?? undefined,
        ackAt: row.ack_at ?? undefined,
        team: row.team ?? undefined,
        status: row.status as LiveReport["status"],
        history: normalizeHistory(row.history),
        photoBefore: row.photo_before ?? undefined,
        photoAfter: row.photo_after ?? undefined,
        photoUrl: row.photo_url ?? undefined,
        imageHash: row.image_hash ?? undefined,
        aiAnalysis: row.ai_analysis ?? undefined,
        weightKg: row.weight_kg ?? undefined,
        weightTons: row.weight_tons ?? undefined,
        greenPointsAwarded: row.green_points_awarded ?? undefined,
        deletedAt: row.deleted_at ?? undefined,
        deletedBy: row.deleted_by ?? undefined,
        archivedAt: row.archived_at ?? undefined,
        assignedAgentId: row.assigned_agent_id ?? undefined,
        assignedAgentName: row.assigned_agent_name ?? undefined,
        active: row.active ?? true,
    };
}

export async function loadSharedReportsFromSupabase(): Promise<LiveReport[]> {
    const client = getClient();
    if (!client) return [];

    try {
        const { data, error } = await client
            .from("signalements")
            .select("*")
            .filter("active", "not.is", false)
            .order("created_at", {
                ascending: false,
            });
        if (error) {
            console.warn("Supabase signalements read failed:", error.message);
            return [];
        }
        return (data ?? []).map((row) => fromRow(row as SignalementRow));
    } catch (error) {
        console.warn("Supabase signalements unavailable:", error);
        return [];
    }
}

export async function syncReportToSupabase(report: LiveReport) {
    const client = getClient();
    if (!client) return;

    try {
        const row = toRow(report);
        const { error } = await client.from("signalements").upsert(row, { onConflict: "id" });
        if (error) {
            console.warn("Supabase signalements upsert failed:", error.message);
        }
    } catch (error) {
        console.warn("Supabase signalements sync unavailable:", error);
    }
}

export function subscribeSharedReports(handler: (reports: LiveReport[]) => void) {
    const client = getClient();
    if (!client) return () => { };

    let channel: RealtimeChannel | null = null;
    try {
        channel = client.channel(LEGACY_CHANNEL);
        channel
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "signalements" },
                async () => {
                    const remote = await loadSharedReportsFromSupabase();
                    handler(remote);
                },
            )
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    return;
                }
                if (status === "CHANNEL_ERROR") {
                    console.warn("Supabase realtime channel error for signalements");
                }
            });
    } catch (error) {
        console.warn("Supabase realtime subscription unavailable:", error);
    }

    return () => {
        if (channel) {
            void channel.unsubscribe();
        }
    };
}

export function isSupabaseCentralReportingEnabled() {
    return Boolean(getSupabaseClient() && url && anonKey);
}
