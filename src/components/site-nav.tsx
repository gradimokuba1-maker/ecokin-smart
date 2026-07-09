import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useEcoUser } from "@/lib/user-store";
import { useAccess } from "@/lib/access-store";
import { formatNumber } from "@/lib/utils";
import { ArrowLeft, Home as HomeIcon, Leaf, LogOut, Menu, ShieldCheck, Trash2, X, House } from "lucide-react";
import { useState } from "react";
import { NotificationBell } from "@/components/notification-bell";

type NavLink = { to: string; label: string; icon: typeof HomeIcon };

const NAV: NavLink[] = [
  { to: "/menagers", label: "Déchets ménagers", icon: HomeIcon },
  { to: "/signaler", label: "Dépôts sauvages", icon: Trash2 },
];

export function SiteNav() {
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user } = useEcoUser();
  const { session, logout } = useAccess();
  const [open, setOpen] = useState(false);
  const isAuthority = session.role !== "citoyen";
  const authorityLink =
    session.role === "gouverneur"
      ? { to: "/gouverneur", label: "Espace Gouverneur", icon: ShieldCheck }
      : session.role === "bourgmestre"
        ? { to: "/bourgmestre", label: "Espace Bourgmestre", icon: ShieldCheck }
        : session.role === "admin"
          ? { to: "/admin", label: "Administration", icon: ShieldCheck }
          : session.role === "agent"
            ? { to: "/agent", label: "Espace Agent", icon: ShieldCheck }
          : null;
  const links = isAuthority ? (authorityLink ? [authorityLink] : []) : NAV;

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      router.navigate({ to: "/" });
    }
  };

  if (pathname === "/") {
    return null;
  }

  return (
    <nav className={`sticky top-0 z-50 border-b backdrop-blur-md ${isAuthority ? "border-slate-800/60 bg-[linear-gradient(135deg,#071523_0%,#102f40_45%,#0f3b2a_100%)] text-white" : "border-border bg-background/85 text-foreground"}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-eco text-white shadow-sm shadow-eco/30">
            <Leaf className="size-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            EcoKin <span className="text-eco">Smart</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-2 text-sm font-medium transition-colors ${isAuthority ? "border-white/20 bg-white/10 text-white hover:bg-white/15" : "border-border bg-background/70 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Retour</span>
          </button>
          <Link
            to="/"
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-2 text-sm font-medium transition-colors ${isAuthority ? "border-white/20 bg-white/10 text-white hover:bg-white/15" : "border-border bg-background/70 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <House className="size-4" />
            <span className="hidden sm:inline">Accueil</span>
          </Link>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${isAuthority ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              activeProps={{ className: isAuthority ? "text-white bg-white/10" : "text-eco bg-eco/5" }}
            >
              <l.icon className="size-4" /> {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <NotificationBell />
          <div className="text-right">
            <div className={`text-xs font-semibold ${isAuthority ? "text-emerald-300" : "text-eco"}`}>{formatNumber(user.points)} GP</div>
            <div className={`text-[10px] uppercase tracking-widest ${isAuthority ? "text-white/70" : "text-muted-foreground"}`}>
              {session.role === "citoyen" ? user.name : session.name}
            </div>
          </div>
          {session.role === "citoyen" ? null : (
            <button
              onClick={logout}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-semibold ${isAuthority ? "border-white/20 text-white/80 hover:bg-white/10" : "border-border text-muted-foreground hover:bg-muted"}`}
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
            <button
              type="button"
              onClick={() => {
                handleBack();
                setOpen(false);
              }}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium ${isAuthority ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted"}`}
            >
              <ArrowLeft className="size-4" /> Retour
            </button>
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${isAuthority ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted"}`}
            >
              <House className="size-4" /> Accueil
            </Link>
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${isAuthority ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted"}`}
                activeProps={{ className: isAuthority ? "text-white bg-white/10" : "text-eco bg-eco/5" }}
              >
                <l.icon className="size-4" /> {l.label}
              </Link>
            ))}
            {isAuthority && (
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium ${isAuthority ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted"}`}
              >
                <LogOut className="size-4" /> Se déconnecter
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
