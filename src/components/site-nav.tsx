import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useEcoUser } from "@/lib/user-store";
import { useAccess } from "@/lib/access-store";
import { formatNumber } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ArrowLeft,
  BarChart3,
  Bot,
  Building2,
  FileText,
  HandCoins,
  Home as HomeIcon,
  House,
  Layers3,
  LogOut,
  Map,
  Menu,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { NotificationBell } from "@/components/notification-bell";

type NavLink = { to: string; label: string; icon: typeof HomeIcon };

type SiteNavProps = {
  minimal?: boolean;
};

const NAV: NavLink[] = [
  { to: "/menagers", label: "Déchets ménagers", icon: HomeIcon },
  { to: "/signaler", label: "Dépôts sauvages", icon: Trash2 },
];

const MOBILE_DRAWER_GROUPS = [
  {
    title: "Accueil & services",
    items: [
      { to: "/", label: "Accueil", icon: HomeIcon },
      { to: "/menagers", label: "Gestion des déchets ménagers", icon: House },
      { to: "/signaler", label: "Signalements citoyens", icon: Trash2 },
      { to: "/carte", label: "Cartographie", icon: Map },
      { to: "/observatoire", label: "Observatoire", icon: BarChart3 },
    ],
  },
  {
    title: "Pilotage & décision",
    items: [
      { to: "/gouverneur", label: "Espace Gouverneur", icon: ShieldCheck },
      { to: "/bourgmestre", label: "Espace Bourgmestre", icon: Building2 },
      { to: "/admin", label: "Administration", icon: Settings },
      { to: "/agent", label: "Espace Agent", icon: Users },
      { to: "/assistant-ia", label: "Assistant IA", icon: Bot },
    ],
  },
  {
    title: "Opérations & suivi",
    items: [
      { to: "/gps-flotte", label: "Suivi GPS", icon: Map },
      { to: "/rapports", label: "Rapports", icon: FileText },
      { to: "/interventions", label: "Interventions", icon: Layers3 },
      { to: "/recompenses", label: "Récompenses", icon: HandCoins },
      { to: "/payments", label: "Paiements", icon: Wallet },
    ],
  },
];

export function SiteNav({ minimal }: SiteNavProps = {}) {
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user } = useEcoUser();
  const { session, logout } = useAccess();
  const isMobile = useIsMobile();
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

  const mobileDashboardTo = authorityLink?.to ?? "/menagers";

  if (pathname === "/") {
    return null;
  }

  if (minimal) {
    return (
      <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-2 text-sm font-medium text-muted-foreground"
          >
            <ArrowLeft className="size-4" /> Retour
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-2 text-sm font-medium text-muted-foreground"
          >
            <House className="size-4" /> Accueil
          </Link>
        </div>
      </nav>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/images/logo-ecokin.png"
                alt="EcoKin Smart"
                className="size-9 rounded-xl object-cover shadow-sm shadow-eco/30"
              />
              <span className="font-display text-sm font-bold tracking-tight sm:text-base">
                EcoKin <span className="text-eco">Smart</span>
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-2.5 py-2 text-xs font-semibold text-muted-foreground"
              >
                <ArrowLeft className="size-3.5" />
                Retour
              </button>

              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full border-border bg-background/70"
                >
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
            </div>
          </div>
        </nav>

        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-2 py-2 backdrop-blur-md sm:hidden">
          <div className="grid grid-cols-5 gap-1">
            <Link
              to="/"
              className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold text-muted-foreground"
              activeProps={{ className: "text-eco" }}
            >
              <HomeIcon className="size-4" />
              <span>Accueil</span>
            </Link>
            <Link
              to="/carte"
              className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold text-muted-foreground"
              activeProps={{ className: "text-eco" }}
            >
              <Map className="size-4" />
              <span>Carte</span>
            </Link>
            <Link
              to="/menagers"
              className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold text-muted-foreground"
              activeProps={{ className: "text-eco" }}
            >
              <House className="size-4" />
              <span>Déchets</span>
            </Link>
            <Link
              to={mobileDashboardTo}
              className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold text-muted-foreground"
              activeProps={{ className: "text-eco" }}
            >
              <BarChart3 className="size-4" />
              <span>Tableau</span>
            </Link>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold text-muted-foreground"
              >
                <Layers3 className="size-4" />
                <span>Plus</span>
              </button>
            </SheetTrigger>
          </div>
        </div>

        <SheetContent side="left" className="w-[88vw] p-0 sm:max-w-sm">
          <div className="flex h-full flex-col bg-background">
            <SheetHeader className="border-b px-4 py-4 text-left">
              <div className="flex items-center gap-3">
                <img
                  src="/images/logo-ecokin.png"
                  alt="EcoKin Smart"
                  className="size-10 rounded-xl object-cover"
                />
                <SheetTitle className="text-left">EcoKin Smart</SheetTitle>
              </div>
              <SheetDescription>
                Navigation compacte et accès à toutes les sections de la plateforme.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
              {MOBILE_DRAWER_GROUPS.map((group) => (
                <div key={group.title} className="space-y-2">
                  <p className="px-2 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                    {group.title}
                  </p>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SheetClose asChild key={item.to}>
                        <Link
                          to={item.to}
                          className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                        >
                          <span className="grid size-8 place-items-center rounded-xl bg-eco/10 text-eco">
                            <Icon className="size-4" />
                          </span>
                          <span>{item.label}</span>
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>
              ))}

              {session.role !== "citoyen" && (
                <div className="space-y-2 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-card/70 px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <span className="grid size-8 place-items-center rounded-xl bg-destructive/10 text-destructive">
                      <LogOut className="size-4" />
                    </span>
                    <span>Se déconnecter</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <nav
      className={`sticky top-0 z-50 border-b backdrop-blur-md ${isAuthority ? "border-slate-800/60 bg-[linear-gradient(135deg,#071523_0%,#102f40_45%,#0f3b2a_100%)] text-white" : "border-border bg-background/85 text-foreground"}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/images/logo-ecokin.png"
            alt="EcoKin Smart"
            className="size-9 rounded-xl object-cover shadow-sm shadow-eco/30"
          />
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
              activeProps={{
                className: isAuthority ? "text-white bg-white/10" : "text-eco bg-eco/5",
              }}
            >
              <l.icon className="size-4" /> {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <NotificationBell />
          <div className="text-right">
            <div
              className={`text-xs font-semibold ${isAuthority ? "text-emerald-300" : "text-eco"}`}
            >
              {formatNumber(user.points)} GP
            </div>
            <div
              className={`text-[10px] uppercase tracking-widest ${isAuthority ? "text-white/70" : "text-muted-foreground"}`}
            >
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
      </div>
    </nav>
  );
}
