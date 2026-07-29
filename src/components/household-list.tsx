import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHouseholds, type Household } from "@/lib/household-store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";

export function HouseholdList({
  setView,
}: {
  setView: (view: "list" | "form" | "dashboard" | "zones" | "settings") => void;
}) {
  const { households } = useHouseholds();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Ménages</CardTitle>
          <CardDescription>Liste des ménages enregistrés.</CardDescription>
        </div>
        <Button onClick={() => setView("form")}>Ajouter un ménage</Button>
      </CardHeader>
      <CardContent>
        <HouseholdTable households={households} />
      </CardContent>
    </Card>
  );
}

function HouseholdTable({ households }: { households: Household[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Commune</TableHead>
          <TableHead>Quartier</TableHead>
          <TableHead>Adresse</TableHead>
          <TableHead>Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {households.map((household) => (
          <TableRow key={household.id}>
            <TableCell>{household.name}</TableCell>
            <TableCell>{household.commune}</TableCell>
            <TableCell>{household.quartier}</TableCell>
            <TableCell>{household.address}</TableCell>
            <TableCell>
              <Badge variant={household.kind === "pme" ? "default" : "secondary"}>
                {household.kind}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
