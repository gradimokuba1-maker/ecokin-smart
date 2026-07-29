import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHouseholds } from "@/lib/household-store";
import { useFleet } from "@/lib/fleet-store";
import { Users, Truck, Wrench, CircleCheck } from "lucide-react";

export function OperationalDashboard() {
  const { households } = useHouseholds();
  const { vehicles } = useFleet();

  const totalHouseholds = households.length;
  const activeHouseholds = households.length; // Placeholder
  const collectionsToday = 0; // Placeholder
  const availableVehicles = vehicles.filter((v) => v.status === "en_service").length;
  const activeVehicles = vehicles.filter((v) => v.status === "en_service").length; // Placeholder

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
