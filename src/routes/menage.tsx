import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Trash2, Map, Users, Settings, Truck, CreditCard } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { HouseholdList } from "@/components/household-list";
import { HouseholdForm } from "@/components/household-form";
import { ClientOnly } from "@/components/client-only";
import { OperationalDashboard } from "@/components/operational-dashboard";
import { CollectionOperationsPanel } from "@/components/collection-operations-panel";
import { useEcoUser, type User, type UserRole } from "@/lib/user-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Payments } from "@/components/payments";
import { COLLECTION_SCHEDULE, SORT_TIPS } from "@/lib/household-store";

const FleetMap = lazy(() =>
  import("@/components/fleet-map").then((m) => ({ default: m.FleetMap })),
);
const CollectionZones = lazy(() =>
  import("@/components/collection-zones").then((m) => ({ default: m.CollectionZones })),
);

export const Route = createFileRoute("/menage")({
  component: MenageRoute,
});

type View = "dashboard" | "list" | "form" | "zones" | "settings" | "fleet" | "payments" | "operations";

function MenageRoute() {
  const [view, setView] = useState<View>("dashboard");
  const { user, login } = useEcoUser();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppSidebar view={view} setView={setView} user={user} login={login} />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SiteNav minimal />
        </header>
        <MobileQuickNav view={view} setView={setView} />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {view === "dashboard" && <OperationalDashboard />}
          {view === "list" && <HouseholdList setView={setView} />}
          {view === "form" && <HouseholdForm />}
          {view === "fleet" && (
            <Card>
              <CardHeader>
                <CardTitle>Suivi de la flotte</CardTitle>
                <CardDescription>
                  Localisation en temps réel des véhicules de collecte.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ClientOnly>
                  <Suspense fallback={<div className="h-full w-full animate-pulse bg-muted" />}>
                    <FleetMap />
                  </Suspense>
                </ClientOnly>
              </CardContent>
            </Card>
          )}
          {view === "zones" && (
            <ClientOnly>
              <Suspense
                fallback={
                  <Card>
                    <CardHeader>
                      <CardTitle>Zones de collecte</CardTitle>
                      <CardDescription>Points de collecte réels à Kinshasa.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px] w-full animate-pulse bg-muted" />
                    </CardContent>
                  </Card>
                }
              >
                <CollectionZones />
              </Suspense>
            </ClientOnly>
          )}
          {view === "payments" && <Payments />}
          {view === "operations" && <CollectionOperationsPanel />}
          {view === "settings" && <HouseholdSettings />}
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}

function MobileQuickNav({
  view,
  setView,
}: {
  view: View;
  setView: (view: View) => void;
}) {
  const items: Array<{ key: View; label: string; icon: typeof Home }> = [
    { key: "dashboard", label: "Accueil", icon: Home },
    { key: "list", label: "Ménages", icon: Users },
    { key: "fleet", label: "Flotte", icon: Truck },
    { key: "zones", label: "Zones", icon: Map },
    { key: "operations", label: "Opérations", icon: Truck },
    { key: "payments", label: "Paiements", icon: CreditCard },
    { key: "settings", label: "Réglages", icon: Settings },
  ];

  return (
    <div className="border-b bg-background px-4 py-2 sm:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = view === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setView(item.key)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-muted/50 text-muted-foreground"
                }`}
            >
              <Icon className="size-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HouseholdSettings() {
  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const schedule = COLLECTION_SCHEDULE.default;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Parametres de collecte</CardTitle>
          <CardDescription>Configuration active pour la demonstration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-lg border p-3">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Passage hebdomadaire
            </div>
            <div className="mt-1 font-semibold">
              {schedule.days.map((day) => days[day]).join(" et ")} - {schedule.window}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Bacs standards
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {["120L", "240L", "660L"].map((bin) => (
                <span
                  key={bin}
                  className="rounded-full bg-eco/10 px-3 py-1 text-xs font-bold text-eco"
                >
                  {bin}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Consignes de tri</CardTitle>
          <CardDescription>Rappels visibles par les agents et les menages.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {SORT_TIPS.slice(0, 4).map((tip) => (
            <div key={tip.id} className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full" style={{ backgroundColor: tip.color }} />
                <div className="font-semibold">{tip.label}</div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{tip.tips[0]}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function AppSidebar({
  view,
  setView,
  user,
  login,
}: {
  view: View;
  setView: (view: View) => void;
  user: User | null;
  login: (user: User) => void;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <a
          href="#"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Trash2 className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">EcoKin Smart</span>
        </a>
        <a
          href="#"
          onClick={() => setView("dashboard")}
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${view === "dashboard" ? "bg-accent text-accent-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8`}
        >
          <Home className="h-5 w-5" />
          <span className="sr-only">Dashboard</span>
        </a>
        <a
          href="#"
          onClick={() => setView("list")}
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${view === "list" || view === "form" ? "bg-accent text-accent-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8`}
        >
          <Users className="h-5 w-5" />
          <span className="sr-only">Households</span>
        </a>
        <a
          href="#"
          onClick={() => setView("fleet")}
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${view === "fleet" ? "bg-accent text-accent-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8`}
        >
          <Truck className="h-5 w-5" />
          <span className="sr-only">Suivi des véhicules</span>
        </a>
        <a
          href="#"
          onClick={() => setView("zones")}
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${view === "zones" ? "bg-accent text-accent-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8`}
        >
          <Map className="h-5 w-5" />
          <span className="sr-only">Collection Zones</span>
        </a>
        <a
          href="#"
          onClick={() => setView("operations")}
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${view === "operations" ? "bg-accent text-accent-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8`}
        >
          <Truck className="h-5 w-5" />
          <span className="sr-only">Opérations</span>
        </a>
        <a
          href="#"
          onClick={() => setView("payments")}
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${view === "payments" ? "bg-accent text-accent-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8`}
        >
          <CreditCard className="h-5 w-5" />
          <span className="sr-only">Paiements</span>
        </a>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <div className="w-full px-2">
          <Select
            value={user?.role}
            onValueChange={(role) => {
              const newUser: User = {
                id: user?.id || "U-1",
                name: role,
                role: role as UserRole,
                points: user?.points ?? 0,
                reports: user?.reports ?? 0,
                badges: user?.badges ?? [],
                registered: user?.registered ?? false,
              };
              if (role === "bourgmestre") {
                newUser.commune = "Kalamu";
              }
              login(newUser);
            }}
          >
            <SelectTrigger className="w-full h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="citoyen">Citoyen</SelectItem>
              <SelectItem value="bourgmestre">Bourgmestre</SelectItem>
              <SelectItem value="gouverneur">Gouverneur</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <a
          href="#"
          onClick={() => setView("settings")}
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${view === "settings" ? "bg-accent text-accent-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8`}
        >
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </a>
      </nav>
    </aside>
  );
}
