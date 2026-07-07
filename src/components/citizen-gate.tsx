import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Leaf, LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { useEcoUser } from "@/lib/user-store";
import { KINSHASA_COMMUNES } from "@/lib/cities";
import { formatNumber } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function CitizenGate({ title, description, children }: Props) {
  const { user, register, signIn } = useEcoUser();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [form, setForm] = useState({
    name: "",
    commune: KINSHASA_COMMUNES[0]?.name ?? "Kinshasa",
    phone: "",
    pin: "",
  });
  const [err, setErr] = useState<string | null>(null);

  if (user.registered) return <>{children}</>;

  const hasExisting = user.points > 0 || user.reports > 0 || user.phone;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (mode === "signup") {
      if (!form.name.trim() || !form.phone.trim() || form.pin.length < 4) {
        setErr("Nom, téléphone et code PIN (4 chiffres min) sont obligatoires.");
        return;
      }
      register(form);
    } else {
      if (!signIn(form.phone, form.pin)) {
        setErr("Téléphone ou code PIN incorrect.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-md place-items-center px-4 py-10">
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
                Code PIN (4 chiffres min)
              </label>
              <input
                value={form.pin}
                onChange={(e) => setForm({ ...form, pin: e.target.value })}
                type="password"
                inputMode="numeric"
                placeholder="••••"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            {err && <p className="text-xs font-semibold text-red-600">{err}</p>}
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-eco px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-eco/30"
            >
              <ShieldCheck className="size-4" />
              {mode === "signup" ? "Créer mon compte" : "Se connecter"}
            </button>
            <Link to="/" className="block text-center text-xs text-muted-foreground hover:underline">
              ← Retour à l'accueil
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
