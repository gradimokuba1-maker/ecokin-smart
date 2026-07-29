import { FormEvent, useState } from "react";
import { Lock, ShieldCheck, User } from "lucide-react";
import { AUTH_USERS, type AuthorityRole } from "@/lib/access-store";
import { CommuneSelector } from "@/components/commune-selector";

type Props = {
  role: AuthorityRole;
  title: string;
  onSubmit: (identifier: string, password: string, commune?: string) => boolean;
};

export function LoginForm({ role, title, onSubmit }: Props) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [commune, setCommune] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const needsCommune = role === "agent" || role === "bourgmestre" || role === "admin";
  const userDetails = AUTH_USERS[role];

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (needsCommune && !commune) {
      setErr("Veuillez choisir votre commune avant de continuer.");
      return;
    }
    if (onSubmit(identifier, password, needsCommune ? commune : undefined)) {
      setErr(null);
    } else {
      setErr("Identifiant, mot de passe ou commune incorrect.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-3">
      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Identifiant
        </label>
        <div className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
          <User className="size-4 text-muted-foreground" />
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            type="text"
            placeholder="Identifiant"
            autoComplete="username"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Mot de passe
        </label>
        <div className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
          <Lock className="size-4 text-muted-foreground" />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>
      {needsCommune && <CommuneSelector value={commune} onChange={setCommune} required />}
      {err && <p className="text-xs font-semibold text-red-600">{err}</p>}
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-eco px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-eco/30"
      >
        <ShieldCheck className="size-4" /> Se connecter
      </button>
      <details className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
        <summary className="cursor-pointer font-semibold">Identifiants de démo ({title})</summary>
        <ul className="mt-2 space-y-0.5 font-mono">
          <li>Identifiant: {userDetails.identifier}</li>
          <li>Mot de passe: {userDetails.password}</li>
        </ul>
      </details>
    </form>
  );
}
