import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCollectionOperations } from "@/lib/collection-operations-store";
import { useFleet } from "@/lib/fleet-store";
import { useHouseholds } from "@/lib/household-store";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function CollectionOperationsPanel() {
    const operations = useCollectionOperations();
    const { vehicles } = useFleet();
    const { households } = useHouseholds();
    const [pmeName, setPmeName] = useState("");
    const [manager, setManager] = useState("");
    const [contacts, setContacts] = useState("");
    const [commune, setCommune] = useState("Kalamu");
    const [collectorName, setCollectorName] = useState("");
    const [collectorIdentifier, setCollectorIdentifier] = useState("");
    const [collectorZone, setCollectorZone] = useState("");
    const [missionTitle, setMissionTitle] = useState("");
    const [missionZone, setMissionZone] = useState("");
    const [selectedCollector, setSelectedCollector] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState("");

    const collectorOptions = useMemo(() => operations.collectors, [operations.collectors]);
    const vehicleOptions = useMemo(() => vehicles, [vehicles]);

    const submitPme = () => {
        if (!pmeName.trim() || !manager.trim() || !contacts.trim()) {
            toast.error("Remplissez les informations PME");
            return;
        }
        operations.registerPme({
            name: pmeName.trim(),
            manager: manager.trim(),
            contacts: contacts.trim(),
            commune,
            zonesCovered: [collectorZone || "Zone principale"],
            agentCount: 3,
            vehicleCount: 1,
            status: "active",
        });
        toast.success("PME enregistrée");
        setPmeName("");
        setManager("");
        setContacts("");
    };

    const submitCollector = () => {
        if (!collectorName.trim() || !collectorIdentifier.trim() || !collectorZone.trim()) {
            toast.error("Remplissez les informations du collecteur");
            return;
        }
        operations.registerCollector({
            name: collectorName.trim(),
            identifier: collectorIdentifier.trim(),
            commune,
            vehicleType: "tricycle",
            zone: collectorZone.trim(),
            available: true,
        });
        toast.success("Collecteur enregistré");
        setCollectorName("");
        setCollectorIdentifier("");
        setCollectorZone("");
    };

    const submitMission = () => {
        if (!missionTitle.trim() || !missionZone.trim()) {
            toast.error("Indiquez le titre et la zone de la mission");
            return;
        }
        operations.createMission({
            title: missionTitle.trim(),
            commune,
            zone: missionZone.trim(),
            householdIds: households.slice(0, 3).map((item) => item.id),
            assignedCollectorId: selectedCollector || undefined,
            assignedVehicleId: selectedVehicle || undefined,
        });
        toast.success("Mission de collecte créée");
        setMissionTitle("");
        setMissionZone("");
        setSelectedCollector("");
        setSelectedVehicle("");
    };

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Acteurs et missions</CardTitle>
                    <CardDescription>PME, collecteurs indépendants et missions de collecte.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3 rounded-lg border p-3">
                        <h3 className="font-semibold">Enregistrer une PME</h3>
                        <Input placeholder="Nom de la PME" value={pmeName} onChange={(e) => setPmeName(e.target.value)} />
                        <Input placeholder="Responsable" value={manager} onChange={(e) => setManager(e.target.value)} />
                        <Input placeholder="Contacts" value={contacts} onChange={(e) => setContacts(e.target.value)} />
                        <Select value={commune} onValueChange={setCommune}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Kalamu">Kalamu</SelectItem>
                                <SelectItem value="Limete">Limete</SelectItem>
                                <SelectItem value="Gombe">Gombe</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={submitPme} className="w-full">Ajouter la PME</Button>
                    </div>

                    <div className="space-y-3 rounded-lg border p-3">
                        <h3 className="font-semibold">Créer un collecteur indépendant</h3>
                        <Input placeholder="Nom du collecteur" value={collectorName} onChange={(e) => setCollectorName(e.target.value)} />
                        <Input placeholder="Identifiant" value={collectorIdentifier} onChange={(e) => setCollectorIdentifier(e.target.value)} />
                        <Input placeholder="Zone d'intervention" value={collectorZone} onChange={(e) => setCollectorZone(e.target.value)} />
                        <Button onClick={submitCollector} className="w-full">Ajouter le collecteur</Button>
                    </div>

                    <div className="space-y-3 rounded-lg border p-3">
                        <h3 className="font-semibold">Créer une mission</h3>
                        <Input placeholder="Titre de la mission" value={missionTitle} onChange={(e) => setMissionTitle(e.target.value)} />
                        <Input placeholder="Zone" value={missionZone} onChange={(e) => setMissionZone(e.target.value)} />
                        <Select value={selectedCollector} onValueChange={setSelectedCollector}>
                            <SelectTrigger><SelectValue placeholder="Collecteur" /></SelectTrigger>
                            <SelectContent>
                                {collectorOptions.map((collector) => (
                                    <SelectItem key={collector.id} value={collector.id}>{collector.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                            <SelectTrigger><SelectValue placeholder="Véhicule" /></SelectTrigger>
                            <SelectContent>
                                {vehicleOptions.map((vehicle) => (
                                    <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.plate}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={submitMission} className="w-full">Créer la mission</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Vue opérationnelle</CardTitle>
                    <CardDescription>Données utiles pour le suivi rapide du module.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2 md:grid-cols-2">
                        <div className="rounded-lg border p-3">
                            <div className="text-xs uppercase tracking-widest text-muted-foreground">PME actives</div>
                            <div className="mt-1 text-2xl font-bold">{operations.pmes.length}</div>
                        </div>
                        <div className="rounded-lg border p-3">
                            <div className="text-xs uppercase tracking-widest text-muted-foreground">Collecteurs</div>
                            <div className="mt-1 text-2xl font-bold">{operations.collectors.length}</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {operations.missions.map((mission) => (
                            <div key={mission.id} className="rounded-lg border p-3">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="font-semibold">{mission.title}</div>
                                    <Badge variant="secondary">{mission.status}</Badge>
                                </div>
                                <div className="mt-1 text-sm text-muted-foreground">{mission.zone} • {mission.commune}</div>
                                <div className="mt-1 text-sm">Progression {mission.progressPercent}%</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
