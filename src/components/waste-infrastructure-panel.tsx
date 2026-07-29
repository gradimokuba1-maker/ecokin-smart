import { useEffect, useMemo, useRef, useState } from "react";
import { Factory, Layers3, MapPinned, Recycle, Truck, Warehouse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_CITY } from "@/lib/cities";

type SiteCategory = "traitement" | "transfert" | "regroupement";
type SiteStatus = "fonctionnel" | "maintenance" | "sature";

type WasteSite = {
  id: string;
  name: string;
  category: SiteCategory;
  commune: string;
  quartier: string;
  lat: number;
  lng: number;
  status: SiteStatus;
  description: string;
};

const WASTE_SITES: WasteSite[] = [
  {
    id: "ctve-mpasa",
    name: "Centre de traitement et valorisation de Mpasa",
    category: "traitement",
    commune: "N'sele",
    quartier: "Mpasa",
    lat: -4.3779,
    lng: 15.4616,
    status: "fonctionnel",
    description:
      "Site de reception, tri, compostage et enfouissement controle pour les flux venant de l'est de Kinshasa.",
  },
  {
    id: "ctve-mitendi",
    name: "Pole de valorisation de Mitendi",
    category: "traitement",
    commune: "Mont-Ngafula",
    quartier: "Mitendi",
    lat: -4.4425,
    lng: 15.1978,
    status: "maintenance",
    description:
      "Unite de valorisation des dechets organiques et recyclables, avec maintenance preventive sur une ligne de tri.",
  },
  {
    id: "cte-kimwenza",
    name: "Centre d'enfouissement controle de Kimwenza",
    category: "traitement",
    commune: "Mont-Ngafula",
    quartier: "Kimwenza",
    lat: -4.4741,
    lng: 15.2944,
    status: "fonctionnel",
    description:
      "Infrastructure de traitement final avec casiers controles, suivi environnemental et zone de compactage.",
  },
  {
    id: "ct-masina",
    name: "Centre de transfert Masina",
    category: "transfert",
    commune: "Masina",
    quartier: "Petro-Congo",
    lat: -4.3832,
    lng: 15.3886,
    status: "fonctionnel",
    description:
      "Plateforme intermediaire ou les dechets collectes dans les quartiers sont regroupes avant acheminement vers traitement.",
  },
  {
    id: "ct-limete",
    name: "Centre de transfert Limete industriel",
    category: "transfert",
    commune: "Limete",
    quartier: "Industriel",
    lat: -4.3514,
    lng: 15.3432,
    status: "sature",
    description:
      "Site tres sollicite pour les flux du centre et de l'est; evacuation acceleree recommandee en periode de pointe.",
  },
  {
    id: "ct-bumbu",
    name: "Centre de transfert Bumbu",
    category: "transfert",
    commune: "Bumbu",
    quartier: "Matadi Mayo",
    lat: -4.3693,
    lng: 15.2878,
    status: "fonctionnel",
    description:
      "Point de rupture de charge pour mutualiser les tournees de collecte venant de Bumbu, Makala et Selembao.",
  },
  {
    id: "prd-gombe",
    name: "Point de regroupement Gare Centrale",
    category: "regroupement",
    commune: "Gombe",
    quartier: "Gare Centrale",
    lat: -4.3211,
    lng: 15.3094,
    status: "fonctionnel",
    description:
      "Point de depot de proximite pour les menages et petits commerces du centre-ville avant collecte municipale.",
  },
  {
    id: "prd-kalamu",
    name: "Point de regroupement Matonge",
    category: "regroupement",
    commune: "Kalamu",
    quartier: "Matonge",
    lat: -4.3508,
    lng: 15.3086,
    status: "sature",
    description:
      "Point de regroupement a forte frequentation, prioritaire pour les levees rapides et le nettoyage des abords.",
  },
  {
    id: "prd-ngaba",
    name: "Point de regroupement Rond-point Ngaba",
    category: "regroupement",
    commune: "Ngaba",
    quartier: "Rond-point",
    lat: -4.3936,
    lng: 15.3091,
    status: "fonctionnel",
    description:
      "Infrastructure de proximite permettant aux riverains d'evacuer leurs sacs menagers vers une collecte organisee.",
  },
  {
    id: "prd-ndjili",
    name: "Point de regroupement N'djili Sainte-Therese",
    category: "regroupement",
    commune: "N'djili",
    quartier: "Sainte-Therese",
    lat: -4.3948,
    lng: 15.3748,
    status: "maintenance",
    description:
      "Point de depot temporairement sous entretien partiel; usage maintenu avec surveillance des bacs disponibles.",
  },
  {
    id: "prd-kintambo",
    name: "Point de regroupement Kintambo Magasin",
    category: "regroupement",
    commune: "Kintambo",
    quartier: "Magasin",
    lat: -4.3386,
    lng: 15.2702,
    status: "fonctionnel",
    description:
      "Point de proximite pour les quartiers ouest, connecte aux tournees vers le centre de transfert le plus proche.",
  },
  {
    id: "prd-kimbanseke",
    name: "Point de regroupement Kimbanseke Centre",
    category: "regroupement",
    commune: "Kimbanseke",
    quartier: "Centre",
    lat: -4.4318,
    lng: 15.4081,
    status: "fonctionnel",
    description:
      "Point de depot citoyen pour reduire les decharges sauvages et orienter les flux vers Masina puis Mpasa.",
  },
];

const CATEGORY_META: Record<
  SiteCategory,
  {
    label: string;
    shortLabel: string;
    color: string;
    bg: string;
    text: string;
    icon: typeof Factory;
    marker: string;
  }
> = {
  traitement: {
    label: "Centre de traitement, valorisation et enfouissement",
    shortLabel: "Traitement",
    color: "#10b981",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700",
    icon: Factory,
    marker: "TVE",
  },
  transfert: {
    label: "Centre de transfert",
    shortLabel: "Transfert",
    color: "#f59e0b",
    bg: "bg-amber-500/10",
    text: "text-amber-700",
    icon: Warehouse,
    marker: "CT",
  },
  regroupement: {
    label: "Point de regroupement",
    shortLabel: "Regroupement",
    color: "#0ea5e9",
    bg: "bg-sky-500/10",
    text: "text-sky-700",
    icon: Recycle,
    marker: "PRD",
  },
};

const FILTERS: Array<{ value: "all" | SiteCategory; label: string }> = [
  { value: "all", label: "Toutes les categories" },
  { value: "traitement", label: "Centres de traitement" },
  { value: "transfert", label: "Centres de transfert" },
  { value: "regroupement", label: "Points de regroupement" },
];

const STATUS_LABEL: Record<SiteStatus, string> = {
  fonctionnel: "Fonctionnel",
  maintenance: "En maintenance",
  sature: "Sature",
};

function statusClass(status: SiteStatus) {
  if (status === "sature") return "border-red-500/30 bg-red-500/10 text-red-600";
  if (status === "maintenance") return "border-amber-500/30 bg-amber-500/10 text-amber-700";
  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700";
}

function markerHtml(site: WasteSite) {
  const meta = CATEGORY_META[site.category];
  return `<div style="width:34px;height:34px;border-radius:10px;background:${meta.color};border:3px solid #fff;box-shadow:0 8px 20px rgba(15,23,42,.28);display:grid;place-items:center;color:#fff;font:800 10px/1 Inter,Arial,sans-serif;letter-spacing:.02em">${meta.marker}</div>`;
}

function popupHtml(site: WasteSite) {
  const meta = CATEGORY_META[site.category];
  return `<div style="min-width:230px;font-family:Inter,Arial,sans-serif;color:#0f172a">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <span style="width:12px;height:12px;border-radius:4px;background:${meta.color};display:inline-block"></span>
      <strong style="font-size:14px">${site.name}</strong>
    </div>
    <div style="font-size:12px;color:#475569;margin-bottom:6px">${meta.label}</div>
    <div style="font-size:12px;line-height:1.6">
      <div><strong>Commune :</strong> ${site.commune}</div>
      <div><strong>Quartier :</strong> ${site.quartier}</div>
      <div><strong>GPS :</strong> ${site.lat.toFixed(4)}, ${site.lng.toFixed(4)}</div>
      <div><strong>Statut :</strong> ${STATUS_LABEL[site.status]}</div>
    </div>
    <p style="font-size:12px;color:#475569;margin:8px 0 0">${site.description}</p>
  </div>`;
}

function InfrastructureMap({
  sites,
  selectedSiteId,
  onSelectSite,
}: {
  sites: WasteSite[];
  selectedSiteId: string | null;
  onSelectSite: (site: WasteSite) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const markerRefs = useRef<Record<string, any>>({});
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView(DEFAULT_CITY.center, DEFAULT_CITY.defaultZoom);

      map.setMaxBounds(L.latLngBounds(DEFAULT_CITY.bounds[0], DEFAULT_CITY.bounds[1]).pad(0.16));
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap · © CARTO · EcoKin Smart",
        maxZoom: 19,
      }).addTo(map);

      DEFAULT_CITY.communes.forEach((commune) => {
        L.circleMarker(commune.center, {
          radius: 3,
          color: "#10b981",
          weight: 1,
          fillColor: "#10b981",
          fillOpacity: 0.35,
        })
          .bindTooltip(commune.name, { direction: "top" })
          .addTo(map);
      });

      const layer = L.layerGroup().addTo(map);
      mapRef.current = map;
      layerRef.current = layer;
      setMapReady(true);
      setTimeout(() => map.invalidateSize(), 120);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !layerRef.current || !mapRef.current) return;
    (async () => {
      const L = (await import("leaflet")).default;
      layerRef.current.clearLayers();
      markerRefs.current = {};

      sites.forEach((site) => {
        const marker = L.marker([site.lat, site.lng], {
          icon: L.divIcon({
            className: "",
            html: markerHtml(site),
            iconSize: [34, 34],
            iconAnchor: [17, 17],
            popupAnchor: [0, -18],
          }),
        })
          .bindPopup(popupHtml(site))
          .on("click", () => onSelectSite(site))
          .addTo(layerRef.current);

        markerRefs.current[site.id] = marker;
      });

      if (sites.length > 0) {
        const bounds = L.latLngBounds(
          sites.map((site) => [site.lat, site.lng] as [number, number]),
        );
        mapRef.current.fitBounds(bounds.pad(0.22), { maxZoom: 12 });
      }
    })();
  }, [sites, mapReady, onSelectSite]);

  useEffect(() => {
    if (!selectedSiteId) return;
    const marker = markerRefs.current[selectedSiteId];
    if (!marker || !mapRef.current) return;
    mapRef.current.setView(marker.getLatLng(), Math.max(mapRef.current.getZoom(), 13));
    marker.openPopup();
  }, [selectedSiteId]);

  return (
    <div className="relative h-[520px] w-full">
      <div
        ref={containerRef}
        className="h-full w-full overflow-hidden rounded-2xl border border-border bg-secondary"
      />
      <div className="absolute bottom-3 left-3 z-[500] rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <Layers3 className="size-3.5" /> Legende
        </div>
        <div className="space-y-2">
          {(Object.keys(CATEGORY_META) as SiteCategory[]).map((category) => {
            const meta = CATEGORY_META[category];
            const Icon = meta.icon;
            return (
              <div key={category} className="flex items-center gap-2 text-xs font-medium">
                <span
                  className="grid size-6 place-items-center rounded-md border-2 border-white text-[8px] font-black text-white shadow-sm"
                  style={{ backgroundColor: meta.color }}
                >
                  <Icon className="size-3.5" />
                </span>
                <span>{meta.shortLabel}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function WasteInfrastructurePanel() {
  const [filter, setFilter] = useState<"all" | SiteCategory>("all");
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(WASTE_SITES[0]?.id ?? null);

  const filteredSites = useMemo(
    () => WASTE_SITES.filter((site) => filter === "all" || site.category === filter),
    [filter],
  );

  const selectedSite = useMemo(
    () => WASTE_SITES.find((site) => site.id === selectedSiteId) ?? filteredSites[0] ?? null,
    [filteredSites, selectedSiteId],
  );

  const stats = useMemo(() => {
    return {
      traitement: WASTE_SITES.filter((site) => site.category === "traitement").length,
      transfert: WASTE_SITES.filter((site) => site.category === "transfert").length,
      regroupement: WASTE_SITES.filter((site) => site.category === "regroupement").length,
      sature: WASTE_SITES.filter((site) => site.status === "sature").length,
    };
  }, []);

  return (
    <div className="mt-6 space-y-6">
      <Card className="border-eco/20 bg-gradient-to-br from-eco/10 via-background to-urban/10">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPinned className="size-5 text-eco" /> Cartographie des infrastructures de
                dechets
              </CardTitle>
              <CardDescription className="mt-2 max-w-3xl">
                Visualisez sur une seule carte les centres de traitement, les centres de transfert
                et les points de regroupement disponibles dans la ville de Kinshasa.
              </CardDescription>
            </div>
            <Badge className="border-eco/30 bg-eco/10 text-eco">Kinshasa</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <SummaryTile
            icon={<Factory className="size-5 text-emerald-600" />}
            label="Traitement"
            value={stats.traitement}
          />
          <SummaryTile
            icon={<Warehouse className="size-5 text-amber-600" />}
            label="Transfert"
            value={stats.transfert}
          />
          <SummaryTile
            icon={<Recycle className="size-5 text-sky-600" />}
            label="Regroupement"
            value={stats.regroupement}
          />
          <SummaryTile
            icon={<Truck className="size-5 text-red-600" />}
            label="Sites satures"
            value={stats.sature}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filtres de la carte</CardTitle>
          <CardDescription>
            Affichez une categorie precise ou toutes les infrastructures simultanement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  setFilter(item.value);
                  const first = WASTE_SITES.find(
                    (site) => item.value === "all" || site.category === item.value,
                  );
                  setSelectedSiteId(first?.id ?? null);
                }}
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                  filter === item.value
                    ? "border-eco bg-eco text-white"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPinned className="size-5 text-eco" /> Carte interactive
            </CardTitle>
            <CardDescription>
              Cliquez sur un marqueur pour ouvrir la fiche du site et identifier rapidement sa
              categorie par couleur.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InfrastructureMap
              sites={filteredSites}
              selectedSiteId={selectedSite?.id ?? null}
              onSelectSite={(site) => setSelectedSiteId(site.id)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fiche du site</CardTitle>
            <CardDescription>{filteredSites.length} infrastructure(s) affichee(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedSite ? (
              <>
                <SiteDetails site={selectedSite} />
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Sites affiches
                  </div>
                  <div className="max-h-64 space-y-2 overflow-auto pr-1">
                    {filteredSites.map((site) => {
                      const meta = CATEGORY_META[site.category];
                      return (
                        <button
                          key={site.id}
                          onClick={() => setSelectedSiteId(site.id)}
                          className={`w-full rounded-xl border p-3 text-left transition hover:bg-muted ${
                            selectedSite.id === site.id
                              ? "border-eco bg-eco/5"
                              : "border-border bg-background"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className="mt-0.5 size-3 shrink-0 rounded-sm"
                              style={{ backgroundColor: meta.color }}
                            />
                            <div>
                              <div className="text-sm font-semibold">{site.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {meta.shortLabel} · {site.commune}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun site ne correspond au filtre selectionne.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      <div className="text-sm text-muted-foreground">Infrastructure(s)</div>
    </div>
  );
}

function SiteDetails({ site }: { site: WasteSite }) {
  const meta = CATEGORY_META[site.category];
  const Icon = meta.icon;

  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-white text-white shadow-sm"
          style={{ backgroundColor: meta.color }}
        >
          <Icon className="size-5" />
        </span>
        <div>
          <div className="font-display text-lg font-bold leading-tight">{site.name}</div>
          <div
            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${meta.bg} ${meta.text}`}
          >
            {meta.label}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm">
        <DetailLine label="Commune" value={site.commune} />
        <DetailLine label="Quartier" value={site.quartier} />
        <DetailLine label="GPS" value={`${site.lat.toFixed(4)}, ${site.lng.toFixed(4)}`} />
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Statut</span>
          <Badge variant="outline" className={statusClass(site.status)}>
            {STATUS_LABEL[site.status]}
          </Badge>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">{site.description}</p>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-2 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
