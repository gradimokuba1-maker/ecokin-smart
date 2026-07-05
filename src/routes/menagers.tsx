import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Calendar,
  CheckCircle2,
  CreditCard,
  Download,
  History,
  Home,
  Info,
  Package,
  Receipt,
  Recycle,
  Send,
  Wallet,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useHouseholds, scheduleFor, SORT_TIPS, type Household, type BinType, type HouseholdKind } from "@/lib/household-store";
import { useWasteTax, PAYMENT_PROVIDERS, formatCdf, type Invoice, type PaymentMethod } from "@/lib/waste-tax";
import { KINSHASA_COMMUNES } from "@/lib/cities";
import { pushNotification } from "@/components/notification-bell";
import { formatNumber } from "@/lib/utils";

export const Route = createFileRoute("/menagers")({
  head: () => ({
    meta: [
      { title: "Déchets ménagers — EcoKin Smart" },
      {
        name: "description",
        content:
          "Gérez la collecte de vos déchets ménagers à Kinshasa : enregistrement du ménage, calendrier, collecte exceptionnelle, taxe et paiement.",
      },
      { property: "og:title", content: "Déchets ménagers — EcoKin Smart" },
      {
        property: "og:description",
        content:
          "Module citoyen EcoKin Smart : calendrier de collecte, taxe déchets, paiement Mobile Money et suivi historique.",
      },
    ],
  }),
  component: MenagersPage,
});

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function MenagersPage() {
  const store = useHouseholds();
  const [activeId, setActiveId] = useState<string | null>(null);
  const household = useMemo(
    () => store.households.find((h) => h.id === activeId) ?? store.households[0] ?? null,
    [store.households, activeId],
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <header className="border-b border-border bg-gradient-to-br from-eco/10 via-background to-urban/10">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-eco">
            <Home className="size-4" /> Module Déchets ménagers
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            Gérez la collecte de vos déchets — simplement.
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Enregistrez votre ménage ou votre PME, consultez le calendrier de passage,
            demandez une collecte exceptionnelle, payez votre taxe et téléchargez vos reçus.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {store.households.length > 1 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Comptes enregistrés :
            </span>
            {store.households.map((h) => (
              <button
                key={h.id}
                onClick={() => setActiveId(h.id)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  household?.id === h.id
                    ? "border-eco bg-eco text-white"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {h.name} · {h.commune}
              </button>
            ))}
          </div>
        )}

        <Tabs defaultValue={household ? "dashboard" : "register"} className="w-full">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
            <TabsTrigger value="dashboard" className="gap-1.5">
              <Home className="size-3.5" /> Mon compte
            </TabsTrigger>
            <TabsTrigger value="register" className="gap-1.5">
              <Package className="size-3.5" /> Enregistrement
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-1.5">
              <Calendar className="size-3.5" /> Calendrier
            </TabsTrigger>
            <TabsTrigger value="request" className="gap-1.5">
              <Send className="size-3.5" /> Collecte exceptionnelle
            </TabsTrigger>
            <TabsTrigger value="bin" className="gap-1.5">
              <Wrench className="size-3.5" /> Bac endommagé
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="size-3.5" /> Historique
            </TabsTrigger>
            <TabsTrigger value="tips" className="gap-1.5">
              <Recycle className="size-3.5" /> Conseils tri
            </TabsTrigger>
            <TabsTrigger value="tax" className="gap-1.5">
              <Wallet className="size-3.5" /> Taxe déchets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab household={household} store={store} />
          </TabsContent>
          <TabsContent value="register">
            <RegisterTab store={store} onCreated={(h) => setActiveId(h.id)} />
          </TabsContent>
          <TabsContent value="calendar">
            <CalendarTab household={household} />
          </TabsContent>
          <TabsContent value="request">
            <RequestTab household={household} store={store} />
          </TabsContent>
          <TabsContent value="bin">
            <BinIssueTab household={household} store={store} />
          </TabsContent>
          <TabsContent value="history">
            <HistoryTab household={household} store={store} />
          </TabsContent>
          <TabsContent value="tips">
            <TipsTab />
          </TabsContent>
          <TabsContent value="tax">
            <TaxTab household={household} />
          </TabsContent>
        </Tabs>
      </main>

      <SiteFooter />
    </div>
  );
}

/* ---------- Dashboard ---------- */
function DashboardTab({
  household,
  store,
}: {
  household: Household | null;
  store: ReturnType<typeof useHouseholds>;
}) {
  const tax = useWasteTax(household ?? undefined);
  if (!household) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Aucun ménage enregistré</CardTitle>
          <CardDescription>
            Rendez-vous dans l'onglet « Enregistrement » pour créer votre premier compte
            ménage ou PME.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  const nextInvoices = tax.invoices.filter((i) => i.status !== "paid").slice(0, 3);
  const nextCollect = nextCollectionDate(household.commune);
  const reqCount = store.requests.filter((r) => r.householdId === household.id).length;

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label={household.kind === "pme" ? "PME" : "Ménage"}
        value={household.name}
        sub={`${household.commune} · ${household.quartier}`}
        icon={<Home className="size-5 text-eco" />}
      />
      <StatCard
        label="Prochaine collecte"
        value={nextCollect.label}
        sub={scheduleFor(household.commune).window}
        icon={<Calendar className="size-5 text-urban" />}
      />
      <StatCard
        label="Solde taxe"
        value={formatCdf(tax.totalDue)}
        sub={`${nextInvoices.length} facture(s) en attente`}
        icon={<Wallet className="size-5 text-amber-500" />}
      />
      <StatCard
        label="Demandes exceptionnelles"
        value={String(reqCount)}
        sub={`Bac ${household.binType} · ${household.occupants} occupants`}
        icon={<Send className="size-5 text-primary" />}
      />
    </div>
  );
}

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
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

/* ---------- Register ---------- */
function RegisterTab({
  store,
  onCreated,
}: {
  store: ReturnType<typeof useHouseholds>;
  onCreated: (h: Household) => void;
}) {
  const [kind, setKind] = useState<HouseholdKind>("menage");
  const [name, setName] = useState("");
  const [commune, setCommune] = useState<string>("");
  const [quartier, setQuartier] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [occupants, setOccupants] = useState(4);
  const [binType, setBinType] = useState<BinType>("120L");
  const [ok, setOk] = useState(false);

  const submit = () => {
    if (!name.trim() || !commune || !quartier.trim() || !address.trim() || !phone.trim()) {
      alert("Merci de compléter tous les champs obligatoires.");
      return;
    }
    const created = store.registerHousehold({
      kind, name: name.trim(), commune, quartier: quartier.trim(),
      address: address.trim(), phone: phone.trim(),
      occupants: Math.max(1, occupants), binType,
    });
    pushNotification({
      title: "Compte enregistré",
      body: `${kind === "pme" ? "PME" : "Ménage"} ${created.name} enregistré à ${created.commune}.`,
      level: "info",
    });
    setOk(true);
    setName(""); setQuartier(""); setAddress(""); setPhone("");
    onCreated(created);
    setTimeout(() => setOk(false), 2500);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Enregistrer un ménage ou une PME</CardTitle>
        <CardDescription>
          Ces informations servent à planifier vos collectes et à calculer votre taxe déchets.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={kind} onValueChange={(v) => setKind(v as HouseholdKind)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="menage">Ménage</SelectItem>
              <SelectItem value="pme">PME / Commerce</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Nom {kind === "pme" ? "de l'entreprise" : "du chef de ménage"} *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Kabongo Mwamba" />
        </div>
        <div className="space-y-2">
          <Label>Commune *</Label>
          <Select value={commune} onValueChange={setCommune}>
            <SelectTrigger><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {KINSHASA_COMMUNES.map((c) => (
                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Quartier *</Label>
          <Input value={quartier} onChange={(e) => setQuartier(e.target.value)} placeholder="Ex. Salongo" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Adresse *</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="N° / Avenue" />
        </div>
        <div className="space-y-2">
          <Label>Téléphone *</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+243…" />
        </div>
        <div className="space-y-2">
          <Label>Nombre d'occupants</Label>
          <Input
            type="number" min={1} max={50} value={occupants}
            onChange={(e) => setOccupants(parseInt(e.target.value || "1"))}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Type de bac</Label>
          <div className="flex flex-wrap gap-2">
            {(["120L", "240L", "660L"] as BinType[]).map((b) => (
              <button
                key={b}
                onClick={() => setBinType(b)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                  binType === b ? "border-eco bg-eco text-white" : "border-border bg-background"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardContent>
        <div className="flex items-center gap-3">
          <Button onClick={submit} className="bg-eco text-white hover:bg-eco/90">
            <CheckCircle2 className="size-4" /> Enregistrer
          </Button>
          {ok && <span className="text-sm font-semibold text-eco">✓ Compte créé</span>}
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- Calendar ---------- */
function CalendarTab({ household }: { household: Household | null }) {
  const commune = household?.commune ?? "Kinshasa";
  const s = scheduleFor(commune);
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const week = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Calendrier de collecte — {commune}</CardTitle>
        <CardDescription>
          Passage {s.days.map((d) => DAYS[d]).join(" & ")} · {s.window}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {DAYS.map((d) => (
            <div key={d} className="font-semibold text-muted-foreground">{d}</div>
          ))}
          {week.map((d) => {
            const isPass = s.days.includes(d.getDay());
            const isToday = d.toDateString() === today.toDateString();
            return (
              <div
                key={d.toISOString()}
                className={`rounded-lg border p-2 ${
                  isPass ? "border-eco bg-eco/10 font-bold text-eco" : "border-border"
                } ${isToday ? "ring-2 ring-primary" : ""}`}
              >
                <div className="text-[10px]">{d.getDate()}/{d.getMonth() + 1}</div>
                {isPass && <div className="mt-1 text-[10px]">Collecte</div>}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function nextCollectionDate(commune: string) {
  const s = scheduleFor(commune);
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    if (s.days.includes(d.getDay())) {
      return {
        label: i === 0 ? "Aujourd'hui" : i === 1 ? "Demain" : d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" }),
        date: d,
      };
    }
  }
  return { label: "—", date: now };
}

/* ---------- Request ---------- */
function RequestTab({
  household,
  store,
}: {
  household: Household | null;
  store: ReturnType<typeof useHouseholds>;
}) {
  const [reason, setReason] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [ok, setOk] = useState(false);
  const requests = household ? store.requests.filter((r) => r.householdId === household.id) : [];

  if (!household) return <NoHouseholdCard />;

  const submit = () => {
    if (!reason.trim() || !preferredDate) return alert("Merci d'indiquer un motif et une date.");
    store.createRequest({ householdId: household.id, reason: reason.trim(), preferredDate });
    pushNotification({
      title: "Collecte exceptionnelle demandée",
      body: `${household.name} — ${new Date(preferredDate).toLocaleDateString("fr-FR")}`,
      level: "info",
    });
    setReason(""); setPreferredDate("");
    setOk(true);
    setTimeout(() => setOk(false), 2500);
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Demander une collecte exceptionnelle</CardTitle>
          <CardDescription>Utile après un événement, un déménagement ou un gros volume.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Motif *</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex. Débarras suite à travaux…" />
          </div>
          <div className="space-y-2">
            <Label>Date souhaitée *</Label>
            <Input type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={submit} className="bg-eco text-white hover:bg-eco/90"><Send className="size-4" /> Envoyer</Button>
            {ok && <span className="text-sm font-semibold text-eco">✓ Demande enregistrée</span>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Mes demandes</CardTitle>
          <CardDescription>{requests.length} demande(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune demande pour le moment.</p>
          ) : (
            <ul className="divide-y divide-border">
              {requests.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <div className="font-semibold">{r.reason}</div>
                    <div className="text-xs text-muted-foreground">
                      Souhaitée : {new Date(r.preferredDate).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">{r.status.replace("_", " ")}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- Bin issue ---------- */
function BinIssueTab({ household, store }: { household: Household | null; store: ReturnType<typeof useHouseholds> }) {
  const [desc, setDesc] = useState("");
  const [ok, setOk] = useState(false);
  const list = household ? store.issues.filter((i) => i.householdId === household.id) : [];
  if (!household) return <NoHouseholdCard />;
  const submit = () => {
    if (!desc.trim()) return;
    store.reportBinIssue({ householdId: household.id, description: desc.trim() });
    pushNotification({ title: "Bac signalé", body: household.name, level: "info" });
    setDesc(""); setOk(true); setTimeout(() => setOk(false), 2500);
  };
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Signaler un bac endommagé</CardTitle>
          <CardDescription>Un agent sera dépêché pour remplacer ou réparer votre bac.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Décrivez l'état du bac (cassé, roulettes, couvercle…)" />
          <div className="flex items-center gap-3">
            <Button onClick={submit} className="bg-eco text-white hover:bg-eco/90"><Wrench className="size-4" /> Envoyer</Button>
            {ok && <span className="text-sm font-semibold text-eco">✓ Signalement transmis</span>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Historique des signalements bac</CardTitle></CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun signalement.</p>
          ) : (
            <ul className="divide-y divide-border">
              {list.map((i) => (
                <li key={i.id} className="py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{i.description}</span>
                    <Badge variant="outline" className="capitalize">{i.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(i.reportedAt).toLocaleString("fr-FR")}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- History ---------- */
function HistoryTab({ household, store }: { household: Household | null; store: ReturnType<typeof useHouseholds> }) {
  if (!household) return <NoHouseholdCard />;
  const list = store.history.filter((h) => h.householdId === household.id);
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Historique des collectes — {household.name}</CardTitle>
        <CardDescription>
          {list.length} collecte(s) enregistrée(s). L'historique s'alimente à partir des passages effectifs des équipes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune collecte enregistrée pour le moment.</p>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((h) => (
              <li key={h.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-semibold">{new Date(h.at).toLocaleString("fr-FR")}</div>
                  <div className="text-xs text-muted-foreground">
                    {h.crew ?? "Équipe non renseignée"}{h.weightKg ? ` · ${h.weightKg} kg` : ""}
                  </div>
                </div>
                <CheckCircle2 className="size-4 text-eco" />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------- Tips ---------- */
function TipsTab() {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {SORT_TIPS.map((t) => (
        <Card key={t.id} className="overflow-hidden">
          <div className="h-1.5" style={{ background: t.color }} />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ background: t.color }} /> {t.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {t.tips.map((tp, i) => (
                <li key={i} className="flex gap-2">
                  <Recycle className="mt-0.5 size-4 shrink-0 text-eco" />
                  <span>{tp}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ---------- Tax ---------- */
function TaxTab({ household }: { household: Household | null }) {
  const tax = useWasteTax(household ?? undefined);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  if (!household) return <NoHouseholdCard />;
  const unpaid = tax.invoices.filter((i) => i.status !== "paid");

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Solde à payer" value={formatCdf(tax.totalDue)} sub={`${unpaid.length} facture(s)`} icon={<Wallet className="size-5 text-amber-500" />} />
        <StatCard label="Total payé" value={formatCdf(tax.totalPaid)} sub={`${tax.payments.length} paiement(s)`} icon={<CheckCircle2 className="size-5 text-eco" />} />
        <StatCard label="Tarif mensuel" value={formatCdf(tax.invoices[0]?.amountCdf ?? 0)} sub={`Bac ${household.binType} · ${household.kind === "pme" ? "PME" : "Ménage"}`} icon={<Receipt className="size-5 text-primary" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Factures</CardTitle>
          <CardDescription>Vos échéances mensuelles. Cliquez sur « Payer » pour régler par Mobile Money, banque ou carte.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2">Période</th>
                  <th>Échéance</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {tax.invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/60">
                    <td className="py-2 font-mono text-xs">{inv.period}</td>
                    <td>{new Date(inv.dueDate).toLocaleDateString("fr-FR")}</td>
                    <td className="font-semibold">{formatCdf(inv.amountCdf)}</td>
                    <td>
                      <Badge
                        variant="outline"
                        className={
                          inv.status === "paid" ? "border-eco text-eco" :
                          inv.status === "late" ? "border-red-500 text-red-500" :
                          "border-amber-500 text-amber-500"
                        }
                      >
                        {inv.status === "paid" ? "Payé" : inv.status === "late" ? "En retard" : "À payer"}
                      </Badge>
                    </td>
                    <td className="text-right">
                      {inv.status === "paid" ? (
                        <Button variant="outline" size="sm" onClick={() => downloadReceipt(inv, household, tax.payments.find((p) => p.invoiceId === inv.id))}>
                          <Download className="size-3.5" /> Reçu
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => setPayingInvoice(inv)} className="bg-eco text-white hover:bg-eco/90">
                          <CreditCard className="size-3.5" /> Payer
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Historique des paiements</CardTitle></CardHeader>
        <CardContent>
          {tax.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun paiement enregistré.</p>
          ) : (
            <ul className="divide-y divide-border">
              {tax.payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <div className="font-semibold">{p.provider} · {formatCdf(p.amountCdf)}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      Réf. {p.reference} · {new Date(p.paidAt).toLocaleString("fr-FR")}
                    </div>
                  </div>
                  <Badge className="bg-eco text-white">Confirmé</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <PayDialog
        invoice={payingInvoice}
        household={household}
        onClose={() => setPayingInvoice(null)}
        onPaid={(method, provider, reference) => {
          if (!payingInvoice) return;
          tax.pay(payingInvoice, method, provider, reference);
          pushNotification({
            title: "Paiement confirmé",
            body: `${provider} · ${formatCdf(payingInvoice.amountCdf)}`,
            level: "info",
          });
          setPayingInvoice(null);
        }}
      />
    </div>
  );
}

function PayDialog({
  invoice, household, onClose, onPaid,
}: {
  invoice: Invoice | null;
  household: Household;
  onClose: () => void;
  onPaid: (method: PaymentMethod, provider: string, reference: string) => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>("mobile_money");
  const [provider, setProvider] = useState<string>(PAYMENT_PROVIDERS.mobile_money[0]);
  const [reference, setReference] = useState("");

  return (
    <Dialog open={!!invoice} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Paiement — {invoice?.period}</DialogTitle>
          <DialogDescription>
            {household.name} · {formatCdf(invoice?.amountCdf ?? 0)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Méthode</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["mobile_money", "bank", "card"] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMethod(m); setProvider(PAYMENT_PROVIDERS[m][0]); }}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                    method === m ? "border-eco bg-eco text-white" : "border-border"
                  }`}
                >
                  {m === "mobile_money" ? "Mobile Money" : m === "bank" ? "Banque" : "Carte"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Opérateur</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_PROVIDERS[method].map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Référence / N° transaction</Label>
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Ex. MP240918.XYZ" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button
            onClick={() => {
              const ref = reference.trim() || `AUTO-${Date.now().toString(36).toUpperCase()}`;
              onPaid(method, provider, ref);
            }}
            className="bg-eco text-white hover:bg-eco/90"
          >
            Confirmer le paiement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function downloadReceipt(inv: Invoice, h: Household, payment?: { provider: string; reference: string; paidAt: string } | undefined) {
  if (typeof window === "undefined") return;
  import("jspdf").then(({ jsPDF }) => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text("EcoKin Smart — Reçu de taxe déchets", 14, 20);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Reçu N° ${inv.id}`, 14, 28);
    doc.setTextColor(20);
    doc.setFontSize(12);
    const lines = [
      `Bénéficiaire : Hôtel de Ville de Kinshasa`,
      ``,
      `Contribuable : ${h.name} (${h.kind === "pme" ? "PME" : "Ménage"})`,
      `Adresse : ${h.address}, ${h.quartier}, ${h.commune}`,
      `Téléphone : ${h.phone}`,
      ``,
      `Période : ${inv.period}`,
      `Échéance : ${new Date(inv.dueDate).toLocaleDateString("fr-FR")}`,
      `Montant : ${formatNumber(inv.amountCdf)} CDF`,
      ``,
      `Paiement : ${payment?.provider ?? "—"}`,
      `Référence : ${payment?.reference ?? "—"}`,
      `Date paiement : ${payment ? new Date(payment.paidAt).toLocaleString("fr-FR") : "—"}`,
    ];
    let y = 44;
    lines.forEach((l) => { doc.text(l, 14, y); y += 8; });
    doc.setFontSize(9); doc.setTextColor(120);
    doc.text("Document généré automatiquement par la plateforme EcoKin Smart.", 14, 280);
    doc.save(`recu-${inv.id}.pdf`);
  });
}

function NoHouseholdCard() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="size-5 text-amber-500" /> Enregistrement requis
        </CardTitle>
        <CardDescription>Veuillez d'abord enregistrer un ménage ou une PME dans l'onglet « Enregistrement ».</CardDescription>
      </CardHeader>
    </Card>
  );
}

// Silence unused imports safety net.
void Bell;
