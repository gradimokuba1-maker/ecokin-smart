import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHouseholds, type Household } from "@/lib/household-store";
import { useWasteTax, generateInvoices, type PaymentMethod, PAYMENT_PROVIDERS } from "@/lib/eco-store";
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

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  mobile_money: "Mobile Money",
  bank: "Banque",
  card: "Carte bancaire",
  international: "Paiement international",
};

export function Payments() {
  const { households, updateHousehold } = useHouseholds();
  const { allPayments, pay, totalPaid } = useWasteTax();
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("mobile_money");
  const [selectedProvider, setSelectedProvider] = useState<string>(PAYMENT_PROVIDERS.mobile_money[0]);

  useEffect(() => {
    setSelectedProvider(PAYMENT_PROVIDERS[selectedMethod][0] ?? "");
  }, [selectedMethod]);

  const paidCount = households.filter((household) => household.paymentStatus === "paid").length;
  const pendingCount = households.length - paidCount;
  const availableProviders = PAYMENT_PROVIDERS[selectedMethod] ?? [];
  const paymentHistory = [...allPayments].sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1));

  const handlePay = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedHousehold) return;
    const invoices = generateInvoices(selectedHousehold);
    const latestInvoice = invoices[invoices.length - 1];
    if (!latestInvoice) return;
    pay(latestInvoice, selectedMethod, selectedProvider, `UI-${Date.now()}`);
    updateHousehold(selectedHousehold.id, { paymentStatus: "paid" });
    setSelectedHousehold(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contribution obligatoire</CardTitle>
          <CardDescription>Suivi des contributions payées et des contributions en attente.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Contributions payées</div>
            <div className="text-2xl font-bold">{paidCount}</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Contributions en attente</div>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Total collecté</div>
            <div className="text-2xl font-bold">{totalPaid.toLocaleString("fr-FR")} CDF</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des contributions</CardTitle>
          <CardDescription>Dernières contributions enregistrées dans le module.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ménage</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Prestataire</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.slice(0, 10).map((payment) => {
                  const household = households.find((h) => h.id === payment.householdId);
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>{household?.name ?? payment.householdId}</TableCell>
                      <TableCell>{payment.amountCdf.toLocaleString("fr-FR")} CDF</TableCell>
                      <TableCell>{PAYMENT_METHOD_LABELS[payment.method]}</TableCell>
                      <TableCell>{payment.provider}</TableCell>
                      <TableCell>{new Date(payment.paidAt).toLocaleDateString("fr-FR")}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paiement de la contribution obligatoire</CardTitle>
          <CardDescription>Choisissez un ménage, un mode de paiement et un prestataire.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {households.map((household) => {
                const invoices = generateInvoices(household);
                const latestInvoice = invoices[invoices.length - 1];
                const alreadyPaid = allPayments.some((payment) => payment.invoiceId === latestInvoice?.id);
                return (
                  <div key={household.id} className="rounded-xl border p-4">
                    <div className="font-semibold">{household.name}</div>
                    <div className="text-xs text-muted-foreground">{household.commune}</div>
                    <div className="mt-2 text-sm">
                      Montant dû : {latestInvoice?.amountCdf.toLocaleString("fr-FR")} CDF
                    </div>
                    <div className="mt-2">
                      <Badge variant={alreadyPaid ? "default" : "destructive"}>
                        {alreadyPaid ? "Contribution payée" : "Contribution en attente"}
                      </Badge>
                    </div>
                    {!alreadyPaid && (
                      <Button className="mt-4" onClick={() => setSelectedHousehold(household)}>
                        Enregistrer le paiement
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedHousehold && (
              <form className="space-y-4 rounded-xl border p-4" onSubmit={handlePay}>
                <div className="text-base font-semibold">
                  Paiement de la contribution obligatoire · {selectedHousehold.name}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      Mode de paiement
                    </span>
                    <select
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedMethod}
                      onChange={(event) => setSelectedMethod(event.target.value as PaymentMethod)}
                    >
                      {Object.entries(PAYMENT_PROVIDERS).map(([methodKey]) => (
                        <option key={methodKey} value={methodKey}>
                          {PAYMENT_METHOD_LABELS[methodKey as PaymentMethod]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      Prestataire
                    </span>
                    <select
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedProvider}
                      onChange={(event) => setSelectedProvider(event.target.value)}
                    >
                      {availableProviders.map((provider) => (
                        <option key={provider} value={provider}>
                          {provider}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="space-y-2">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      Montant
                    </span>
                    <div className="rounded-lg border bg-muted px-3 py-2 text-sm">
                      {generateInvoices(selectedHousehold).slice(-1)[0]?.amountCdf.toLocaleString("fr-FR") ?? 0}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit">Enregistrer le paiement</Button>
                  <Button type="button" variant="secondary" onClick={() => setSelectedHousehold(null)}>
                    Annuler
                  </Button>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
