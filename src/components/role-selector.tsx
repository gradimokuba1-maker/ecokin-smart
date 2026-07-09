import { Link } from "@tanstack/react-router";
import { Building2, ShieldCheck, UserCog, UserRound } from "lucide-react";

type Role = "gouverneur" | "bourgmestre" | "admin" | "agent";

type RoleCard = {
  role: Role;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof ShieldCheck;
};

const ACCESS_TYPES: RoleCard[] = [
  {
    role: "gouverneur",
    title: "Gouverneur",
    subtitle: "Supervision globale",
    description: "Vision stratégique de Kinshasa, des 24 communes et des infrastructures prioritaires.",
    icon: ShieldCheck,
  },
  {
    role: "bourgmestre",
    title: "Bourgmestre",
    subtitle: "Pilotage communal",
    description: "Signalements, équipes, PME, agents et indicateurs filtrés sur sa commune.",
    icon: Building2,
  },
  {
    role: "admin",
    title: "Administrateur",
    subtitle: "Gestion technique",
    description: "Administration complète des utilisateurs, rôles, communes, infrastructures et statistiques.",
    icon: UserCog,
  },
  {
    role: "agent",
    title: "Agent de terrain",
    subtitle: "Interventions terrain",
    description: "Missions, points de collecte, signalements locaux et validation avant/après intervention.",
    icon: UserRound,
  },
];

export function RoleSelector() {
  return (
    <div className="mt-8 space-y-3">
      {ACCESS_TYPES.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.role}
            to="/autorite/connexion"
            search={{ role: item.role }}
            className="block w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-left transition-all hover:border-emerald-400/30 hover:bg-white/15"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid size-10 place-items-center rounded-xl bg-emerald-400/15 text-emerald-200">
                <Icon className="size-5" />
              </span>
              <div>
                <div className="font-semibold text-white">{item.title}</div>
                <div className="text-sm font-medium text-emerald-200">{item.subtitle}</div>
                <p className="mt-1 text-sm text-slate-300">{item.description}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
