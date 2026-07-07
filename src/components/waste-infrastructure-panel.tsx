import { useMemo, useState } from "react";
import { Factory, MapPinned, Recycle, Truck, Warehouse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SiteCategory = "traitement" | "transfert" | "regroupement";
type SiteStatus = "fonctionnel" | "maintenance" | "saturé";

type WasteSite = {
    id: string;
    name: string;
    category: SiteCategory;
    commune: string;
    quartier: string;
    gps: string;
    status: SiteStatus;
    description: string;
    x: number;
    y: number;
};

const SITES: WasteSite[] = [
    {
        id: "ctev-kingasani",
        name: "CTEV de Kingasani",
        category: "traitement",
        commune: "Kingasani",
        quartier: "Kingasani",
        gps: "-4.4412, 15.3201",
        status: "fonctionnel",
        description: "Centre de tri, compostage et valorisation pour les déchets organiques et recyclables.",
        x: 28,
        y: 56,
    },
    {
        id: "ctev-nsele",
        name: "Centre de valorisation de Nsele",
        category: "traitement",
        commune: "Nsele",
        quartier: "Nsele",
        gps: "-4.4700, 15.3600",
        status: "fonctionnel",
        description: "Infrastructure moderne orientée valorisation énergétique, recyclage et enfouissement contrôlé.",
        x: 18,
        y: 72,
    },
    {
        id: "transfer-masina",
        name: "Centre de transfert de Masina",
        category: "transfert",
        commune: "Masina",
        quartier: "Masina Nord",
        gps: "-4.3920, 15.3010",
        status: "fonctionnel",
        description: "Point intermédiaire entre collecte de quartier et traitement final, avec forte capacité journalière.",
        x: 62,
        y: 44,
    },
    {
        id: "transfer-mont-ngafula",
        name: "Hub de transfert de Mont Ngafula",
        category: "transfert",
        commune: "Mont Ngafula",
        quartier: "Mont Ngafula",
        gps: "-4.4100, 15.2600",
        status: "saturé",
        description: "Centre de transit très sollicité en période de forte densité et de collecte décentralisée.",
        x: 72,
        y: 63,
    },
    {
        id: "prd-gombe",
        name: "Point de regroupement Gombe",
        category: "regroupement",
        commune: "Gombe",
        quartier: "Kasa-Vubu",
        gps: "-4.3210, 15.3090",
        status: "fonctionnel",
        description: "Point de regroupement central pour les déchets ménagers, plastiques et papiers issus du centre-ville.",
        x: 48,
        y: 28,
    },
    {
        id: "prd-limete",
        name: "Centre de regroupement Limete",
        category: "regroupement",
        commune: "Limete",
        quartier: "Matete",
        gps: "-4.3589, 15.2886",
        status: "saturé",
        description: "Point fortement sollicité avec besoin de collecte renforcée pour éviter la saturation rapide.",
        x: 54,
        y: 52,
    },
    {
        id: "prd-ndjili",
        name: "PRD Ndjili Nord",
        category: "regroupement",
        commune: "Ndjili",
        quartier: "Makala",
        gps: "-4.3841, 15.4283",
        status: "maintenance",
        description: "Infrastructure de proximité utilisée pour la collecte décentralisée et l’évacuation vers les centres de transfert.",
        x: 76,
        y: 24,
    },
];

const FILTERS: Array<{ value: "all" | SiteCategory; label: string }> = [
    { value: "all", label: "Toutes les infrastructures" },
    { value: "traitement", label: "Traitement / valorisation" },
    { value: "transfert", label: "Centres de transfert" },
    { value: "regroupement", label: "Points de regroupement" },
];

const CATEGORY_META: Record<SiteCategory, { label: string; color: string; icon: typeof Factory }> = {
    traitement: { label: "Traitement / valorisation / enfouissement", color: "border-emerald-500 bg-emerald-500/10 text-emerald-700", icon: Factory },
    transfert: { label: "Centre de transfert", color: "border-amber-500 bg-amber-500/10 text-amber-700", icon: Warehouse },
    regroupement: { label: "Point de regroupement", color: "border-sky-500 bg-sky-500/10 text-sky-700", icon: Recycle },
};

function statusBadge(status: SiteStatus) {
    switch (status) {
        case "saturé":
            return "border-red-500/30 bg-red-500/10 text-red-600";
        case "maintenance":
            return "border-amber-500/30 bg-amber-500/10 text-amber-700";
        default:
            return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700";
    }
}

export function WasteInfrastructurePanel() {
    const [commune, setCommune] = useState("Toutes");
    const [status, setStatus] = useState("Tous");
    const [type, setType] = useState("Tous");

    const filteredPrd = useMemo(() => {
        return PRD_POINTS.filter((point) => {
            const communeMatches = commune === "Toutes" || point.commune === commune;
            const statusMatches = status === "Tous" || point.fillLevel === status;
            return communeMatches && statusMatches;
        });
    }, [commune, status]);

    const derivedStats = useMemo(() => {
        const totalPrd = PRD_POINTS.length;
        const operational = PRD_POINTS.filter((p) => p.fillLevel !== "critique").length;
        const saturated = PRD_POINTS.filter((p) => p.fillLevel === "critique").length;
        const transferVolume = TRANSFER_CENTERS.reduce((sum, c) => sum + c.dailyVolumeTons, 0);
        const treatmentVolume = TREATMENT_CENTERS.reduce((sum, c) => sum + c.dailyReceivedTons, 0);
        return { totalPrd, operational, saturated, transferVolume, treatmentVolume };
    }, []);

    return (
        <div className="mt-6 space-y-6">
            <Card className="border-eco/20 bg-gradient-to-br from-eco/10 via-background to-sky-500/10">
                <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <MapPinned className="size-5 text-eco" /> Infrastructure Smart City & SIG
                            </CardTitle>
                            <CardDescription className="mt-2 max-w-3xl">
                                Vue intégrée des points de regroupement, centres de transfert et centres de traitement pour piloter les flux de déchets à Kinshasa avec une logique opérationnelle moderne.
                            </CardDescription>
                        </div>
                        <Badge className="border-eco/30 bg-eco/10 text-eco">Prêt SIG</Badge>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">PRD enregistrés</div>
                        <div className="mt-2 text-2xl font-semibold">{derivedStats.totalPrd}</div>
                        <div className="text-sm text-muted-foreground">Points de regroupement actifs</div>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Opérationnels</div>
                        <div className="mt-2 text-2xl font-semibold">{derivedStats.operational}</div>
                        <div className="text-sm text-muted-foreground">Points hors saturation</div>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Saturés</div>
                        <div className="mt-2 text-2xl font-semibold">{derivedStats.saturated}</div>
                        <div className="text-sm text-muted-foreground">Alerte municipale</div>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Volume transfert</div>
                        <div className="mt-2 text-2xl font-semibold">{derivedStats.transferVolume} t</div>
                        <div className="text-sm text-muted-foreground">Par jour</div>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Traitement quotidien</div>
                        <div className="mt-2 text-2xl font-semibold">{derivedStats.treatmentVolume} t</div>
                        <div className="text-sm text-muted-foreground">Vers valorisation</div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="size-5 text-urban" /> Filtres SIG et couches opérationnelles
                    </CardTitle>
                    <CardDescription>Filtrez les infrastructures par commune, niveau d’occupation et type d’équipement.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {COMMUNES.map((item) => (
                            <button
                                key={item}
                                onClick={() => setCommune(item)}
                                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${commune === item ? "border-eco bg-eco text-white" : "border-border bg-background text-muted-foreground"}`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((item) => (
                            <button
                                key={item}
                                onClick={() => setStatus(item)}
                                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${status === item ? "border-urban bg-urban/10 text-urban" : "border-border bg-background text-muted-foreground"}`}
                            >
                                {item === "Tous" ? "Tous niveaux" : item}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {TYPE_OPTIONS.map((item) => (
                            <button
                                key={item}
                                onClick={() => setType(item)}
                                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${type === item ? "border-sky-500 bg-sky-500/10 text-sky-700" : "border-border bg-background text-muted-foreground"}`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="size-5 text-eco" /> Points de regroupement des déchets (PRD)
                        </CardTitle>
                        <CardDescription>Cartographie opérationnelle des points de regroupement avec alertes de saturation et planification de collecte.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {filteredPrd.map((point) => (
                            <div key={point.id} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="font-semibold">{point.name}</div>
                                        <div className="text-sm text-muted-foreground">{point.commune} · {point.quartier} · {point.avenue}</div>
                                    </div>
                                    <Badge className={fillLevelBadge(point.fillLevel)}>{point.fillLevel}</Badge>
                                </div>
                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                    <div className="rounded-xl bg-muted/60 p-3 text-sm">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Capacité</div>
                                        <div className="mt-1 font-semibold">{point.capacityTonsPerDay} t/j</div>
                                        <div className="text-xs text-muted-foreground">{point.householdsServed} ménages desservis</div>
                                    </div>
                                    <div className="rounded-xl bg-muted/60 p-3 text-sm">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Dernière collecte</div>
                                        <div className="mt-1 font-semibold">{new Date(point.lastCollection).toLocaleDateString("fr-FR")}</div>
                                        <div className="text-xs text-muted-foreground">{point.collectionFrequency}</div>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    {point.acceptedWaste.map((waste) => (
                                        <span key={waste} className="rounded-full border border-border bg-background px-2.5 py-1">{waste}</span>
                                    ))}
                                </div>
                                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                        <span>{point.alert}</span>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Équipe :</span> {point.team}
                                    <span className="text-border">•</span>
                                    <span className="font-medium text-foreground">Véhicule :</span> {point.vehicle}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="size-5 text-urban" /> Alertes et planification
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {filteredPrd.filter((p) => p.fillLevel === "critique").length > 0 ? (
                                filteredPrd.filter((p) => p.fillLevel === "critique").map((point) => (
                                    <div key={point.id} className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                        <div className="font-semibold">{point.name}</div>
                                        <div className="mt-1">Planification de collecte recommandée dès maintenant pour éviter la saturation des flux.</div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                                    Aucune alerte critique pour les points sélectionnés. La chaîne de collecte reste stable.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Factory className="size-5 text-eco" /> Centres de traitement & valorisation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {TREATMENT_CENTERS.map((center) => (
                                <div key={center.id} className="rounded-xl border border-border/70 bg-background/70 p-3">
                                    <div className="font-semibold">{center.name}</div>
                                    <div className="mt-1 text-sm text-muted-foreground">{center.commune} · {center.gps}</div>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                        {center.technologies.map((tech) => (
                                            <span key={tech} className="rounded-full border border-border bg-background px-2 py-1">{tech}</span>
                                        ))}
                                    </div>
                                    <div className="mt-2 text-sm">
                                        <span className="font-medium">Valorisation :</span> {center.valorizedTons} t/j · {center.valorizationRate}%
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Warehouse className="size-5 text-urban" /> Centres de transfert
                        </CardTitle>
                        <CardDescription>Suivi intermédiaire entre collecte quartier et traitement final.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {TRANSFER_CENTERS.map((center) => (
                            <div key={center.id} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="font-semibold">{center.name}</div>
                                        <div className="text-sm text-muted-foreground">{center.commune} · {center.zoneServed}</div>
                                    </div>
                                    <Badge className={center.status === "saturation" ? "border-red-500/30 bg-red-500/10 text-red-600" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"}>
                                        {center.status === "saturation" ? "saturation" : "stable"}
                                    </Badge>
                                </div>
                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl bg-muted/60 p-3 text-sm">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Entrants / sortants</div>
                                        <div className="mt-1 font-semibold">{center.inboundVehicles} / {center.outboundVehicles}</div>
                                    </div>
                                    <div className="rounded-xl bg-muted/60 p-3 text-sm">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Volume traité</div>
                                        <div className="mt-1 font-semibold">{center.dailyVolumeTons} t/j</div>
                                        <div className="text-xs text-muted-foreground">Stockage moyen {center.storageHours}h</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Recycle className="size-5 text-eco" /> Chaîne de traitement et suivi environnemental
                        </CardTitle>
                        <CardDescription>Cadre opérationnel prêt pour une mise en œuvre municipale progressive.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            "Réception des déchets",
                            "Tri",
                            "Séparation des matières valorisables",
                            "Recyclage",
                            "Compostage des déchets organiques",
                            "Valorisation énergétique",
                            "Enfouissement contrôlé",
                        ].map((step, index) => (
                            <div key={step} className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/70 p-3">
                                <div className="grid size-7 place-items-center rounded-full bg-eco/10 text-sm font-semibold text-eco">{index + 1}</div>
                                <div>
                                    <div className="font-semibold">{step}</div>
                                    <div className="text-sm text-muted-foreground">Processus intégré dans la logique de la chaîne de valorisation urbaine.</div>
                                </div>
                            </div>
                        ))}
                        <div className="rounded-xl border border-border/70 bg-muted/40 p-3 text-sm text-muted-foreground">
                            Suivi environnemental : contrôle des lixiviats, émissions de gaz, nuisances et gestion des risques planifiés sur l’ensemble des sites.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
