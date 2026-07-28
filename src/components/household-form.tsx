import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHouseholds, type HouseholdKind, type BinType } from "@/lib/household-store";
import { KINSHASA_COMMUNES } from "@/lib/cities";
import { toast } from "sonner";

export function HouseholdForm() {
  const store = useHouseholds();
  const [kind, setKind] = useState<HouseholdKind>("menage");
  const [name, setName] = useState("");
  const [commune, setCommune] = useState<string>("");
  const [quartier, setQuartier] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [occupants, setOccupants] = useState(4);
  const [binType, setBinType] = useState<BinType>("120L");
  const [errors, setErrors] = useState<Partial<Record<"name" | "commune" | "quartier" | "address" | "phone", string>>>({});
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number } | null>(null);

  const getGpsCoordinates = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          toast.success("Coordonnées GPS récupérées avec succès.");
        },
        (error) => {
          toast.error("Erreur lors de la récupération des coordonnées GPS.");
          console.error(error);
        }
      );
    } else {
      toast.error("La géolocalisation n'est pas supportée par ce navigateur.");
    }
  };

  const submit = () => {
    const newErrors: Partial<Record<"name" | "commune" | "quartier" | "address" | "phone", string>> = {};
    if (!name.trim()) newErrors.name = "Le nom est requis.";
    if (!commune) newErrors.commune = "La commune est requise.";
    if (!quartier.trim()) newErrors.quartier = "Le quartier est requis.";
    if (!address.trim()) newErrors.address = "L'adresse est requise.";
    if (!phone.trim()) newErrors.phone = "Le téléphone est requis.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    store.registerHousehold({
      kind, name: name.trim(), commune, quartier: quartier.trim(),
      address: address.trim(), phone: phone.trim(),
      occupants: Math.max(1, occupants), binType,
      // @ts-ignore
      gps: gpsCoords,
    });
    toast.success("Ménage enregistré avec succès.");
    setName(""); setQuartier(""); setAddress(""); setPhone("");
    setErrors({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enregistrer un ménage</CardTitle>
        <CardDescription>
          Remplissez le formulaire pour enregistrer un nouveau ménage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
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
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Kabongo Mwamba" className={errors.name ? "border-red-500" : ""} />
                {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            </div>
            <div className="space-y-2">
                <Label>Commune *</Label>
                <Select value={commune} onValueChange={setCommune}>
                    <SelectTrigger className={errors.commune ? "border-red-500" : ""}><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                    {KINSHASA_COMMUNES.map((c) => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                {errors.commune && <p className="text-xs text-red-600">{errors.commune}</p>}
            </div>
            <div className="space-y-2">
                <Label>Quartier *</Label>
                <Input value={quartier} onChange={(e) => setQuartier(e.target.value)} placeholder="Ex. Salongo" className={errors.quartier ? "border-red-500" : ""} />
                {errors.quartier && <p className="text-xs text-red-600">{errors.quartier}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label>Adresse *</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="N° / Avenue" className={errors.address ? "border-red-500" : ""} />
                {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
            </div>
            <div className="space-y-2">
                <Label>Téléphone *</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+243…" className={errors.phone ? "border-red-500" : ""} />
                {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
                <Label>Nombre d'occupants</Label>
                <Input
                    type="number" min={1} max={50} value={occupants}
                    onChange={(e) => setOccupants(parseInt(e.target.value || "1"))}
                />
            </div>
            <div className="space-y-2">
                <Label>Coordonnées GPS</Label>
                <div className="flex items-center gap-2">
                    <Button onClick={getGpsCoordinates} variant="outline">
                        Obtenir les coordonnées
                    </Button>
                    {gpsCoords && (
                        <span className="text-sm text-muted-foreground">
                        {gpsCoords.lat.toFixed(5)}, {gpsCoords.lon.toFixed(5)}
                        </span>
                    )}
                </div>
            </div>
        </div>
        <Button onClick={submit} className="bg-eco text-white hover:bg-eco/90">
          Enregistrer
        </Button>
      </CardContent>
    </Card>
  );
}
