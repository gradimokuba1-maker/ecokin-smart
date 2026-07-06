import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AccessGate } from "@/components/access-gate";
import {
  Activity,
  BarChart3,
  Brain,
  ClipboardList,
  Compass,
  FileText,
  Gauge,
  Gift,
  LineChart,
  MapPin,
  Radio,
  Route as RouteIcon,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/autorite")({
  head: () => ({
    meta: [
      { title: "Espace Autorité & Suivi — EcoKin Smart" },
      {
        name: "description",
        content:
          "Console professionnelle réservée aux autorités : situation, prédictif, flotte, IA, crise, audit et administration.",
      },
    ],
  }),
  component: AuthorityHub,
});

type Tool = {
  to: string;
  label: string;
  desc: string;
  icon: typeof MapPin;
};

const GROUPS: { title: string; tools: Tool[] }[] = [
  {
    title: "Pilotage & analyse",
    tools: [
      { to: "/situation", label: "Situation", desc: "Tableau de bord opérationnel temps réel.", icon: Gauge },
      { to: "/observatoire", label: "Observatoire", desc: "Indicateurs consolidés & tendances.", icon: BarChart3 },
      { to: "/predictif", label: "Analyse prédictive", desc: "Prévisions IA des zones à risque.", icon: LineChart },
      { to: "/decisions", label: "Aide à la décision", desc: "Scénarios & recommandations.", icon: Compass },
      { to: "/gouverneur", label: "Cabinet Gouverneur", desc: "Vue consolidée haut niveau.", icon: ShieldCheck },
    ],
  },
  {
    title: "Terrain & flotte",
    tools: [
      { to: "/interventions", label: "Interventions", desc: "Gestion des équipes terrain.", icon: Users },
      { to: "/itineraires", label: "Itinéraires", desc: "Planification des tournées.", icon: RouteIcon },
      { to: "/gps-flotte", label: "GPS Flotte", desc: "Suivi véhicules temps réel.", icon: Truck },
      { to: "/carte", label: "Carte SIG", desc: "Cartographie interactive Kinshasa.", icon: MapPin },
    ],
  },
  {
    title: "IA, crise & sensibilisation",
    tools: [
      { to: "/assistant-ia", label: "Assistant IA", desc: "Analyse & conversation intelligente.", icon: Brain },
      { to: "/crise", label: "Gestion des crises", desc: "Cellule de crise & alertes.", icon: ShieldAlert },
      { to: "/sensibilisation", label: "Sensibilisation", desc: "Campagnes & messages citoyens.", icon: Radio },
    ],
  },
  {
    title: "Suivi & administration",
    tools: [
      { to: "/rapports", label: "Rapports", desc: "Exports PDF & statistiques.", icon: FileText },
      { to: "/audit", label: "Audit", desc: "Journal de traçabilité.", icon: ClipboardList },
      { to: "/autorites", label: "Autorités", desc: "Console autorités complète.", icon: Activity },
      { to: "/recompenses", label: "Récompenses", desc: "Programme Green Points citoyens.", icon: Gift },
      { to: "/admin", label: "Administration", desc: "Paramètres & réinitialisation.", icon: Sparkles },
    ],
  },
];

function AuthorityHub() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <AccessGate path="/autorite">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-foreground text-background">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Console professionnelle
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Espace Autorité & Suivi
              </h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Tous les outils de gestion, d'analyse, de terrain et d'administration
            réservés aux autorités et gestionnaires d'EcoKin Smart.
          </p>

          <div className="mt-10 space-y-10">
            {GROUPS.map((g) => (
              <section key={g.title}>
                <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {g.title}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {g.tools.map((t) => (
                    <Link
                      key={t.to}
                      to={t.to}
                      className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-foreground transition-colors group-hover:bg-eco group-hover:text-white">
                        <t.icon className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-display text-base font-bold">{t.label}</div>
                        <div className="mt-0.5 text-sm text-muted-foreground">{t.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </AccessGate>
      <SiteFooter />
    </div>
  );
}
