import { getSupabaseClient } from "./supabase-reports";

export async function loadRolesFromSupabase() {
    const client = getSupabaseClient();
    if (!client) return [] as Array<{ id: string; name: string; permissions: string[] }>;
    try {
        const { data, error } = await client.from("ecokin_roles").select("id,name,permissions").order("created_at", { ascending: false });
        if (error) return [] as any;
        return (data ?? []) as any;
    } catch {
        return [] as any;
    }
}

export async function upsertRoleToSupabase(role: { id: string; name: string; permissions: string[] }) {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
        const { error } = await client.from("ecokin_roles").upsert({ id: role.id, name: role.name, permissions: role.permissions });
        if (error) throw error;
        return true;
    } catch (e) {
        console.warn("upsertRoleToSupabase failed", e.message || e);
        return null;
    }
}

export async function deleteRoleFromSupabase(id: string) {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
        const { error } = await client.from("ecokin_roles").delete().eq("id", id);
        if (error) throw error;
        return true;
    } catch (e) {
        console.warn("deleteRoleFromSupabase failed", e.message || e);
        return null;
    }
}

export async function loadActivitiesFromSupabase() {
    const client = getSupabaseClient();
    if (!client) return [] as any[];
    try {
        const { data, error } = await client.from("ecokin_activities").select("*").order("created_at", { ascending: false });
        if (error) return [] as any[];
        return (data ?? []) as any[];
    } catch {
        return [] as any[];
    }
}

export async function upsertActivityToSupabase(activity: any) {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
        const { error } = await client.from("ecokin_activities").upsert(activity, { onConflict: "id" });
        if (error) throw error;
        return true;
    } catch (e) {
        console.warn("upsertActivityToSupabase failed", e.message || e);
        return null;
    }
}

export async function deleteActivityFromSupabase(id: string) {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
        const { error } = await client.from("ecokin_activities").delete().eq("id", id);
        if (error) throw error;
        return true;
    } catch (e) {
        console.warn("deleteActivityFromSupabase failed", e.message || e);
        return null;
    }
}

export async function upsertUserToSupabase(user: any) {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
        const payload = {
            id: user.id,
            identifier: user.identifier,
            name: user.name,
            phone: user.phone ?? null,
            role: user.role,
            commune: user.commune ?? null,
            permissions: user.permissions ?? [],
            active: user.active ?? true,
        };
        const { error } = await client.from("ecokin_users").upsert(payload, { onConflict: "id" });
        if (error) throw error;
        return true;
    } catch (e) {
        console.warn("upsertUserToSupabase failed", e.message || e);
        return null;
    }
}

export async function deleteUserFromSupabase(id: string) {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
        const { error } = await client.from("ecokin_users").update({ active: false, deleted_at: new Date().toISOString() }).eq("id", id);
        if (error) throw error;
        return true;
    } catch (e) {
        console.warn("deleteUserFromSupabase failed", e.message || e);
        return null;
    }
}
