import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  CreditCard,
  FileText,
  MapPinned,
  Truck,
  Wallet,
} from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { HouseholdList } from "@/components/household-list";
import { HouseholdForm } from "@/components/household-form";
import { ClientOnly } from "@/components/client-only";
import { Payments } from "@/components/payments";

const FleetMap = lazy(() =>
  import("@/components/fleet-map").then((m) => ({ default: m.FleetMap })),
);
const CollectionZones = lazy(() =>
  import("@/components/collection-zones").then((m) => ({ default: m.CollectionZones })),
);

export const Route = createFileRoute("/menage")({
  component: MenageRoute,
});

type View = "home" | "form" | "payments" | "zones" | "fleet";

function MenageRoute() {
  const [view, setView] = useState<View>("home");

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SiteNav minimal />
        </header>
        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
          {view === "home" ? (
            <div className="mx-auto max-w-6xl space-y-4">
              <div className="rounded-3xl border border-border bg-card px-4 py-5 sm:px-6">
                <div className="text-xs font-bold uppercase tracking-[0.34em] text-eco">
                  Gestion des déchets ménagers
                </div>
                <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                  Accès rapide aux 4 services du ménage
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
                  Une seule page, quatre grandes fonctionnalités pour l’enregistrement, la contribution, les zones de collecte et le suivi de la flotte.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FeatureCard
                  icon={FileText}
                  title="Enregistrement du ménage"
                  description="Enregistrez votre ménage, mettez à jour vos informations et consultez votre statut en un seul endroit."
                  tone="rose"
                  onClick={() => setView("form")}
                />
                <FeatureCard
                  icon={Wallet}
                  title="Contribution obligatoire"
                  description="Consultez le montant à payer, le statut du paiement et l’historique des contributions."
                  tone="blue"
                  onClick={() => setView("payments")}
                />
                <FeatureCard
                  icon={MapPinned}
                  title="Zones de collecte"
                  description="Visualisez les points de collecte, les horaires et les jours de passage pour votre quartier."
                  tone="amber"
                  onClick={() => setView("zones")}
                />
                <FeatureCard
                  icon={Truck}
                  title="Suivi de la flotte"
                  description="Suivez la position des véhicules et recevez le repérage de leur progression jusqu’à votre quartier."
                  tone="emerald"
                  onClick={() => setView("fleet")}
                />
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-6xl space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
                <button
                  type="button"
                  onClick={() => setView("home")}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                  Retour
                </button>
                <div className="text-sm font-semibold text-muted-foreground">
                  {view === "form" && "Enregistrement du ménage"}
                  {view === "payments" && "Contribution obligatoire"}
                  {view === "zones" && "Zones de collecte"}
                  {view === "fleet" && "Suivi de la flotte"}
                </div>
              </div>

              {view === "form" && (
                <div className="space-y-4">
                  <HouseholdForm />
                  <HouseholdList setView={setView} />
                </div>
              )}
              {view === "payments" && <Payments />}
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
                          <div className="h-[420px] w-full animate-pulse bg-muted" />
                        </CardContent>
                      </Card>
                    }
                  >
                    <CollectionZones />
                  </Suspense>
                </ClientOnly>
              )}
              {view === "fleet" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Suivi de la flotte</CardTitle>
                    <CardDescription>
                      Localisation en temps réel des véhicules de collecte.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[520px]">
                    <ClientOnly>
                      <Suspense fallback={<div className="h-full w-full animate-pulse bg-muted" />}>
                        <FleetMap />
                      </Suspense>
                    </ClientOnly>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  tone,
  onClick,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  tone: "rose" | "blue" | "amber" | "emerald";
  onClick: () => void;
}) {
  const toneClass = {
    rose: "from-rose-500/20 to-rose-100 text-rose-600",
    blue: "from-sky-500/20 to-sky-100 text-sky-600",
    amber: "from-amber-500/20 to-amber-100 text-amber-700",
    emerald: "from-emerald-500/20 to-emerald-100 text-emerald-700",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group overflow-hidden rounded-[28px] border border-border bg-card text-left shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className={`bg-gradient-to-br ${toneClass} p-5 sm:p-6`}>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/85 shadow-sm sm:h-16 sm:w-16">
          <Icon className="size-8 sm:size-9" />
        </div>
        <div className="mt-5">
          <div className="text-xl font-bold sm:text-2xl">{title}</div>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-700 sm:text-base">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
