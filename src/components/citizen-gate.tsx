import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Leaf, LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { useEcoUser } from "@/lib/user-store";
import {
  getCitizenProfile,
  getCitizenSession,
  signInCitizen,
  signUpCitizen,
} from "@/lib/citizen-auth";
import { KINSHASA_COMMUNES } from "@/lib/cities";
import { formatNumber } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  forceForm?: boolean;
  postAuthRedirect?: string;
};

export function CitizenGate({
  title,
  description,
  children,
  forceForm = false,
  postAuthRedirect,
}: Props) {
  const navigate = useNavigate();
  const { user, login } = useEcoUser();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [form, setForm] = useState({
    name: "",
    commune: KINSHASA_COMMUNES[0]?.name ?? "Kinshasa",
    phone: "",
    email: "",
    pin: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const syncSupabaseUser = useCallback(async () => {
    const session = await getCitizenSession();
    if (!session) return false;
    const profile = await getCitizenProfile(session.user.id);
    if (!profile) return false;
    login({
      id: session.user.id,
      name: profile.name,
      role: "citoyen",
      commune: profile.commune ?? undefined,
      phone: profile.phone ?? undefined,
      points: 0,
      reports: 0,
      badges: [],
      registered: true,
    });
    return true;
  }, [login]);

  useEffect(() => {
    void syncSupabaseUser().catch(() => undefined);
  }, [syncSupabaseUser]);

  useEffect(() => {
    if (user.registered) {
      if (postAuthRedirect && typeof window !== "undefined") {
        window.location.assign(postAuthRedirect);
        return;
      }
      navigate({ to: "/citoyen", replace: true });
    }
  }, [user.registered, navigate, postAuthRedirect]);

  if (user.registered && !forceForm) return <>{children}</>;

  const hasExisting = user.points > 0 || user.reports > 0 || user.phone;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    if (mode === "signup") {
      if (!form.name.trim() || !form.phone.trim() || form.pin.length < 8 || !form.email.trim()) {
        setErr("Nom, email, téléphone et mot de passe (8 caractères min.) sont obligatoires.");
        setBusy(false);
        return;
      }
      try {
        const result = await signUpCitizen({
          email: form.email,
          password: form.pin,
          name: form.name,
          phone: form.phone,
          commune: form.commune,
        });
        if (!result.session) {
          setErr("Vérifiez votre email avant de vous connecter.");
          setMode("signin");
          setBusy(false);
          return;
        }
        await syncSupabaseUser();
      } catch (error) {
        setErr(error instanceof Error ? error.message : "Impossible de créer le compte Supabase.");
        setBusy(false);
        return;
      }
    } else {
      if (!form.email.trim() || form.pin.length < 8) {
        setErr("Email et mot de passe (8 caractères min.) sont obligatoires.");
        setBusy(false);
        return;
      }
      try {
        const result = await signInCitizen(form.email, form.pin);
        if (!result.profile) {
          setErr("Compte Auth trouvé, mais profil citoyen absent.");
          setBusy(false);
          return;
        }
        await syncSupabaseUser();
      } catch (error) {
        setErr(error instanceof Error ? error.message : "Email ou mot de passe incorrect.");
        setBusy(false);
        return;
      }
    }
    setBusy(false);
    if (postAuthRedirect && typeof window !== "undefined") {
      window.location.assign(postAuthRedirect);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid max-w-md place-items-center px-4 py-10">
        <div className="w-full rounded-3xl border border-border bg-card p-7 shadow-xl shadow-black/5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-eco/10 text-eco">
              <Leaf className="size-5" />
            </span>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Compte citoyen requis
              </div>
              <h1 className="font-display text-xl font-bold">{title}</h1>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {description ??
              "Créez votre compte citoyen EcoKin pour accéder à ce module. Votre compte conserve vos Green Points et votre historique pour vos prochaines visites."}
          </p>

          {hasExisting && (
            <div className="mt-4 rounded-xl border border-eco/30 bg-eco/5 p-3 text-xs text-eco">
              <div className="font-bold uppercase tracking-widest">
                {formatNumber(user.points)} Green Points conservés
              </div>
              <div className="mt-1 text-eco/80">
                Ils resteront associés à votre compte après identification.
              </div>
            </div>
          )}

          <div className="mt-5 flex gap-2 rounded-full bg-muted p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-full px-3 py-2 ${
                mode === "signup" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              <UserPlus className="mr-1 inline size-3.5" /> Créer un compte
            </button>
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-full px-3 py-2 ${
                mode === "signin" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              <LogIn className="mr-1 inline size-3.5" /> Se connecter
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            {mode === "signup" && (
              <>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Nom complet
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex. Jean Mbala"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Commune
                  </label>
                  <select
                    value={form.commune}
                    onChange={(e) => setForm({ ...form, commune: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  >
                    {KINSHASA_COMMUNES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Email
              </label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="vous@example.com"
                type="email"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Téléphone
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+243 ..."
                inputMode="tel"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Mot de passe (8 caractères min.)
              </label>
              <input
                value={form.pin}
                onChange={(e) => setForm({ ...form, pin: e.target.value })}
                type="password"
                placeholder="********"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            {err && <p className="text-xs font-semibold text-red-600">{err}</p>}
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-eco px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-eco/30"
            >
              <ShieldCheck className="size-4" />
              {busy ? "Patientez..." : mode === "signup" ? "Créer mon compte" : "Se connecter"}
            </button>
            <Link
              to="/"
              className="block text-center text-xs text-muted-foreground hover:underline"
            >
              ← Retour à l'accueil
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
