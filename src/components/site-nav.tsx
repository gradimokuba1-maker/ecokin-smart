import { Link } from "@tanstack/react-router";
import { useEcoUser } from "@/lib/user-store";
import { useAccess } from "@/lib/access-store";
import { Leaf, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { NotificationBell } from "@/components/notification-bell";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/gouverneur", label: "Gouverneur" },
  { to: "/carte", label: "Carte SIG" },
  { to: "/interventions", label: "Interventions" },
  { to: "/signaler", label: "Signaler" },
  { to: "/recompenses", label: "Récompenses" },
  { to: "/autorites", label: "Autorités" },
  { to: "/rapports", label: "Rapports" },
] as const;


export function SiteNav() {
  const { user } = useEcoUser();
  const { session, logout } = useAccess();
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-eco text-white shadow-sm shadow-eco/30">
            <Leaf className="size-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            EcoKin <span className="text-eco">Smart</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-eco" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <NotificationBell />
          <div className="text-right">
            <div className="text-xs font-semibold text-eco">{user.points.toLocaleString()} GP</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {session.role === "citoyen" ? user.name : session.name}
            </div>
          </div>
          {session.role === "citoyen" ? (
            <Link
              to="/admin"
              className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              Connexion autorité
            </Link>
          ) : (
            <button
              onClick={logout}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
              title="Se déconnecter"
            >
              <LogOut className="size-3.5" /> Sortir
            </button>
          )}
        </div>

        <button onClick={() => setOpen((o) => !o)} className="md:hidden">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                activeProps={{ className: "text-eco bg-eco/5" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Espace Administrateur
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
