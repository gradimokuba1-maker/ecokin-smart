import { createClient, type Session, type User } from "@supabase/supabase-js";

export type CitizenProfile = {
  auth_user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  commune: string | null;
  quartier: string | null;
  address: string | null;
  status: "active" | "blocked" | "pending";
};

const url = (import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

export const citizenSupabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;

export async function getCitizenSession(): Promise<Session | null> {
  if (!citizenSupabase) return null;
  const { data, error } = await citizenSupabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCitizenProfile(userId: string): Promise<CitizenProfile | null> {
  if (!citizenSupabase) return null;
  const { data, error } = await citizenSupabase
    .from("profiles")
    .select("auth_user_id,name,phone,email,commune,quartier,address,status")
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as CitizenProfile | null;
}

export async function saveCitizenProfile(user: User, input: Partial<CitizenProfile>) {
  if (!citizenSupabase) throw new Error("Supabase Auth n’est pas configuré.");
  const { data, error } = await citizenSupabase
    .from("profiles")
    .upsert(
      {
        auth_user_id: user.id,
        name:
          input.name?.trim() || user.user_metadata?.name || user.email?.split("@")[0] || "Citoyen",
        phone: input.phone?.trim() || null,
        email: user.email ?? null,
        commune: input.commune?.trim() || null,
        quartier: input.quartier?.trim() || null,
        address: input.address?.trim() || null,
        status: input.status ?? "active",
      },
      { onConflict: "auth_user_id" },
    )
    .select("auth_user_id,name,phone,email,commune,quartier,address,status")
    .single();
  if (error) throw error;
  return data as CitizenProfile;
}

export async function signUpCitizen(input: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  commune?: string;
}) {
  if (!citizenSupabase) throw new Error("Supabase Auth n’est pas configuré.");
  const { data, error } = await citizenSupabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: { data: { name: input.name.trim(), phone: input.phone?.trim() || null } },
  });
  if (error) throw error;
  if (!data.user) throw new Error("Supabase Auth n’a pas retourné d’utilisateur.");
  if (!data.session) return { user: data.user, session: null, profile: null };
  return {
    user: data.user,
    session: data.session,
    profile: await saveCitizenProfile(data.user, input),
  };
}

export async function signInCitizen(email: string, password: string) {
  if (!citizenSupabase) throw new Error("Supabase Auth n’est pas configuré.");
  const { data, error } = await citizenSupabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  const profile =
    (await getCitizenProfile(data.user.id)) ??
    (await saveCitizenProfile(data.user, {
      name:
        typeof data.user.user_metadata?.name === "string"
          ? data.user.user_metadata.name
          : undefined,
      phone:
        typeof data.user.user_metadata?.phone === "string"
          ? data.user.user_metadata.phone
          : undefined,
    }));
  return { user: data.user, session: data.session, profile };
}

export async function signOutCitizen() {
  if (!citizenSupabase) return;
  const { error } = await citizenSupabase.auth.signOut();
  if (error) throw error;
}
