import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, ShieldCheck } from "lucide-react";
import { useAccess, type Role, ACCESS_CODES } from "@/lib/access-store";

type Props = {
  required: Exclude<Role, "citoyen">[];
  title: string;
  children: React.ReactNode;
};

export function AccessGate({ required, title, children }: Props) {
  const { session, login } = useAccess();
  const [role, setRole] = useState<Exclude<Role, "citoyen">>(required[0]);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  if (required.includes(session.role as any) || session.role === "admin") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-md place-items-center px-4">
        <div className="w-full rounded-3xl border border-border bg-card p-7 shadow-xl shadow-black/5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-kin/10 text-kin">
              <Lock className="size-5" />
            </span>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Accès contrôlé
              </div>
              <h1 className="font-display text-xl font-bold">{title}</h1>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Cet espace est réservé aux responsables habilités. Connectez-vous avec votre identifiant institutionnel et votre mot de passe.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (login(role, identifier, password)) {
                setErr(null);
              } else {
                setErr("Identifiant ou mot de passe incorrect.");
              }
            }}
            className="mt-5 space-y-3"
          >
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rôle</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              >
                {required.map((r) => (
                  <option key={r} value={r}>
                    {r === "gouverneur" ? "Gouverneur" : r === "bourgmestre" ? "Bourgmestre" : "Administrateur"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Identifiant</label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                type="text"
                placeholder="ECOKIN2026"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mot de passe</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            {err && <p className="text-xs font-semibold text-red-600">{err}</p>}
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-eco px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-eco/30"
            >
              <ShieldCheck className="size-4" /> Se connecter
            </button>
            <details className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
              <summary className="cursor-pointer font-semibold">Identifiants de démonstration</summary>
              <ul className="mt-2 space-y-0.5 font-mono">
                {Object.entries(ACCESS_CODES).filter(([r]) => r !== "agent").map(([r, c]) => (
                  <li key={r}>{r} : {c}</li>
                ))}
              </ul>
            </details>
            <Link to="/" className="block text-center text-xs text-muted-foreground hover:underline">
              ← Retour à l'accueil
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
