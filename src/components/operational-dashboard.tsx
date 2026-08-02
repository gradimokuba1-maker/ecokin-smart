import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHouseholds } from "@/lib/household-store";
import { useFleet } from "@/lib/fleet-store";
import { useCollectionOperations } from "@/lib/collection-operations-store";
import { Users, Truck, Wrench, CircleCheck, Building2, Route } from "lucide-react";

export function OperationalDashboard() {
  const { households } = useHouseholds();
  const { vehicles } = useFleet();
  const operations = useCollectionOperations();

  const totalHouseholds = households.length;
  const activeHouseholds = households.filter((household) => household.phone).length;
  const availableVehicles = vehicles.filter((v) => v.status === "en_service").length;
  const activeVehicles = vehicles.filter((v) => v.status === "en_service").length;
  const activePmes = operations.pmes.filter((pme) => pme.status === "active").length;
  const activeMissions = operations.missions.filter(
    (mission) => mission.status === "in_progress" || mission.status === "assigned",
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Ménages enregistrés"
        value={totalHouseholds.toString()}
        icon={<Users className="size-5 text-eco" />}
        sub="Total des ménages et PME"
      />
      <StatCard
        label="Ménages actifs"
        value={activeHouseholds.toString()}
        icon={<CircleCheck className="size-5 text-green-500" />}
        sub="Abonnement à jour"
      />
      <StatCard
        label="Véhicules disponibles"
        value={`${availableVehicles} / ${vehicles.length}`}
        icon={<Truck className="size-5 text-urban" />}
        sub="En service aujourd'hui"
      />
      <StatCard
        label="Véhicules en activité"
        value={activeVehicles.toString()}
        icon={<Wrench className="size-5 text-primary" />}
        sub="En cours de collecte"
      />
      <StatCard
        label="PME actives"
        value={activePmes.toString()}
        icon={<Building2 className="size-5 text-amber-500" />}
        sub="Acteurs opérationnels"
      />
      <StatCard
        label="Missions actives"
        value={activeMissions.toString()}
        icon={<Route className="size-5 text-sky-500" />}
        sub="Collectes en suivi"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </div>
          {icon}
        </div>
        <div className="mt-2 font-display text-xl font-bold">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}
