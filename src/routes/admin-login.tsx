import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Lock, Phone } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useAccess, AUTH_USERS } from "@/lib/access-store";
import { CommuneSelector } from "@/components/commune-selector";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Connexion administrateur — EcoKin Smart" },
      {
        name: "description",
        content:
          "Connexion sécurisée à la console d'administration EcoKin Smart par téléphone et code PIN.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const { session, loginAdmin } = useAccess();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [commune, setCommune] = useState("");
  const [err, setErr] = useState<string | null>(null);

  // Redirection automatique si déjà admin.
  useEffect(() => {
    if ((session.role === "admin" || session.role === "superadmin") && (session.commune || session.role === "superadmin")) {
      navigate({ to: "/admin", replace: true });
    }
  }, [session.role, session.commune, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto grid max-w-md place-items-center px-4 py-16">
        <div className="w-full rounded-3xl border border-border bg-card p-7 shadow-xl shadow-black/5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-kin text-white">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Accès réservé
              </div>
              <h1 className="font-display text-xl font-bold">Connexion administrateur</h1>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Cet espace est strictement réservé aux administrateurs habilités de la plateforme EcoKin
            Smart. Authentifiez-vous par téléphone et code PIN.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!commune) {
                setErr("Veuillez choisir la commune administree.");
                return;
              }
              if (loginAdmin(phone, pin, commune)) {
                setErr(null);
                navigate({ to: "/admin", replace: true });
              } else {
                setErr("Téléphone ou code PIN invalide.");
              }
            }}
            className="mt-5 space-y-3"
          >
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Téléphone
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                <Phone className="size-4 text-muted-foreground" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  placeholder="+243 900 000 000"
                  autoComplete="tel"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Code PIN
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                <Lock className="size-4 text-muted-foreground" />
                <input
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  type="password"
                  inputMode="numeric"
                  placeholder="••••"
                  autoComplete="current-password"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>
            <CommuneSelector value={commune} onChange={setCommune} required />
            {err && <p className="text-xs font-semibold text-red-600">{err}</p>}
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-eco px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-eco/30"
            >
              <ShieldCheck className="size-4" /> Se connecter
            </button>
            <details className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
              <summary className="cursor-pointer font-semibold">
                Identifiants de démonstration
              </summary>
              <ul className="mt-2 space-y-0.5 font-mono">
                <li>Téléphone : {AUTH_USERS.admin.identifier}</li>
                <li>PIN : {AUTH_USERS.admin.password}</li>
              </ul>
            </details>
            <Link
              to="/"
              className="block text-center text-xs text-muted-foreground hover:underline"
            >
              ← Retour à l'accueil
            </Link>
          </form>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
