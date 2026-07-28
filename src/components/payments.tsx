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

export function Payments() {
  const { households, updateHousehold } = useHouseholds();

  const togglePaymentStatus = (household: Household) => {
    const newStatus = household.paymentStatus === "paid" ? "unpaid" : "paid";
    updateHousehold(household.id, { paymentStatus: newStatus });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paiements</CardTitle>
        <CardDescription>
          Statut de paiement des ménages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Commune</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {households.map((household) => (
              <TableRow key={household.id}>
                <TableCell>{household.name}</TableCell>
                <TableCell>{household.commune}</TableCell>
                <TableCell>
                  <Badge variant={household.paymentStatus === "paid" ? "default" : "destructive"}>
                    {household.paymentStatus === "paid" ? "Payé" : "Non payé"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button onClick={() => togglePaymentStatus(household)}>
                    Changer le statut
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
