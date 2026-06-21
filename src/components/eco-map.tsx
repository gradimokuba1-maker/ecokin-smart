import { useEffect, useRef } from "react";
import {
  COMMUNES,
  type Report,
  COLLECTION_POINTS,
  FLOOD_RISK_ZONES,
  type Commune,
  POIS,
  ILLEGAL_DUMPS,
  BLOCKED_DRAINS,
  MAIN_ROADS,
  RIVERS,
  type Truck,
  WEATHER_FORECAST,
} from "@/lib/data";
import { Cloud, CloudLightning, CloudRain, Sun, AlertTriangle } from "lucide-react";

const WEATHER_ICONS = { sun: Sun, cloud: Cloud, rain: CloudRain, storm: CloudLightning };
const riskBg = (l: string) =>
  l === "critique" ? "bg-red-500" : l === "eleve" ? "bg-orange-500" : l === "modere" ? "bg-amber-500" : "bg-emerald-500";

type Props = {
  reports?: Report[];
  height?: number;
  showCollection?: boolean;
  showFloodZones?: boolean;
  showPois?: boolean;
  showDumps?: boolean;
  showDrains?: boolean;
  showRoads?: boolean;
  showRivers?: boolean;
  showWeather?: boolean;
  trucks?: Truck[];
  focusCommune?: Commune["id"] | "all";
  onSelectReport?: (r: Report) => void;
};

const sevColor: Record<string, string> = {
  critique: "#ef4444",
  modere: "#f59e0b",
  faible: "#10b981",
};

const poiStyle: Record<string, { bg: string; icon: string }> = {
  ecole: { bg: "#6366f1", icon: "🎓" },
  hopital: { bg: "#ef4444", icon: "✚" },
  marche: { bg: "#a855f7", icon: "🛒" },
};

export function EcoMap({
  reports = [],
  height = 460,
  showCollection = true,
  showFloodZones = true,
  showPois = false,
  showDumps = false,
  showDrains = false,
  showRoads = false,
  showRivers = false,
  showWeather = false,
  trucks,
  focusCommune = "all",
  onSelectReport,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const truckLayerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !ref.current) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const center: [number, number] =
        focusCommune === "all"
          ? [-4.395, 15.318]
          : (COMMUNES.find((c) => c.id === focusCommune)?.center ?? [-4.395, 15.318]);

      const map = L.map(ref.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView(center, focusCommune === "all" ? 13 : 14);
      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap · © CARTO · EcoKin Smart",
        maxZoom: 19,
      }).addTo(map);

      COMMUNES.forEach((c) => {
        L.circle(c.center, {
          radius: 1700,
          color: c.color,
          weight: 2,
          opacity: 0.5,
          fillOpacity: 0.06,
          dashArray: "6 6",
        })
          .bindTooltip(`Commune de ${c.name}`, { permanent: false, direction: "top" })
          .addTo(map);
        L.marker(c.center, {
          icon: L.divIcon({
            className: "",
            html: `<div style="background:${c.color};color:#fff;padding:2px 8px;border-radius:9999px;font:600 11px/1 Inter,sans-serif;box-shadow:0 4px 10px rgba(0,0,0,.18);white-space:nowrap;">${c.name}</div>`,
            iconSize: [60, 18],
            iconAnchor: [30, 9],
          }),
          interactive: false,
        }).addTo(map);
      });

      if (showRivers) {
        RIVERS.forEach((r) =>
          L.polyline(r.path, { color: "#0ea5e9", weight: 4, opacity: 0.55 })
            .bindTooltip(r.name)
            .addTo(map),
        );
      }
      if (showRoads) {
        MAIN_ROADS.forEach((r) =>
          L.polyline(r.path, { color: "#475569", weight: 3, opacity: 0.6, dashArray: "2 6" })
            .bindTooltip(r.name)
            .addTo(map),
        );
      }

      if (showFloodZones) {
        FLOOD_RISK_ZONES.forEach((z) => {
          const color = z.level === "critique" ? "#ef4444" : z.level === "eleve" ? "#f97316" : "#f59e0b";
          L.circle([z.lat, z.lng], { radius: z.radius, color, weight: 1, fillOpacity: 0.15 })
            .bindPopup(
              `<strong>Zone à risque d'inondation</strong><br/>Commune : ${z.commune}<br/>Niveau : <b style="color:${color}">${z.level}</b>`,
            )
            .addTo(map);
        });
      }

      if (showCollection) {
        COLLECTION_POINTS.forEach((cp) => {
          L.marker([cp.lat, cp.lng], {
            icon: L.divIcon({
              className: "",
              html: `<div style="background:#0ea5e9;color:#fff;width:24px;height:24px;display:grid;place-items:center;border-radius:6px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.25);font:700 11px/1 Inter,sans-serif;">♻</div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            }),
          })
            .bindPopup(`<strong>${cp.name}</strong><br/>Type : ${cp.kind}`)
            .addTo(map);
        });
      }

      if (showPois) {
        POIS.forEach((p) => {
          const s = poiStyle[p.kind];
          L.marker([p.lat, p.lng], {
            icon: L.divIcon({
              className: "",
              html: `<div style="background:${s.bg};color:#fff;width:22px;height:22px;display:grid;place-items:center;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.25);font:700 12px/1 Inter,sans-serif;">${s.icon}</div>`,
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            }),
          })
            .bindPopup(`<strong>${p.name}</strong><br/>${p.kind}`)
            .addTo(map);
        });
      }

      if (showDumps) {
        ILLEGAL_DUMPS.forEach((d) => {
          L.circleMarker([d.lat, d.lng], {
            radius: 8,
            color: "#7c2d12",
            weight: 2,
            fillColor: "#b45309",
            fillOpacity: 0.85,
          })
            .bindPopup(`<strong>Décharge sauvage</strong><br/>${d.name}<br/>Volume : ${d.volumeM3} m³`)
            .addTo(map);
        });
      }

      if (showDrains) {
        BLOCKED_DRAINS.forEach((d) => {
          const col = d.blockedPct >= 85 ? "#ef4444" : d.blockedPct >= 60 ? "#f97316" : "#f59e0b";
          L.circleMarker([d.lat, d.lng], {
            radius: 7,
            color: col,
            weight: 2,
            fillColor: col,
            fillOpacity: 0.6,
          })
            .bindPopup(`<strong>Caniveau obstrué</strong><br/>${d.name}<br/>Obstruction : <b style="color:${col}">${d.blockedPct}%</b>`)
            .addTo(map);
        });
      }

      reports.forEach((r) => {
        const color = sevColor[r.severity] ?? "#10b981";
        const m = L.circleMarker([r.lat, r.lng], {
          radius: r.severity === "critique" ? 9 : r.severity === "modere" ? 7 : 5,
          color: "#fff",
          weight: 2,
          fillColor: color,
          fillOpacity: 0.85,
        })
          .bindPopup(
            `<strong>${r.id}</strong> · ${r.type}<br/>Sévérité : <b style="color:${color}">${r.severity}</b><br/>Volume estimé : ${r.volumeM3} m³<br/><em>${r.description}</em><br/><span style="color:#64748b;font-size:11px">par ${r.author}</span>`,
          )
          .addTo(map);
        if (onSelectReport) m.on("click", () => onSelectReport(r));
      });

      truckLayerRef.current = L.layerGroup().addTo(map);

      setTimeout(() => map.invalidateSize(), 100);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [reports, showCollection, showFloodZones, showPois, showDumps, showDrains, showRoads, showRivers, focusCommune, onSelectReport]);

  // Update trucks live without rebuilding the map
  useEffect(() => {
    (async () => {
      if (!trucks || !mapRef.current || !truckLayerRef.current) return;
      const L = (await import("leaflet")).default;
      truckLayerRef.current.clearLayers();
      trucks.forEach((t) => {
        const col = t.status === "collecte" ? "#10b981" : t.status === "en_route" ? "#0ea5e9" : t.status === "depot" ? "#6366f1" : "#94a3b8";
        L.marker([t.lat, t.lng], {
          icon: L.divIcon({
            className: "",
            html: `<div style="background:${col};color:#fff;padding:3px 6px;border-radius:6px;border:2px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.25);font:700 11px/1 Inter,sans-serif;display:flex;align-items:center;gap:4px;">🚚 ${t.id}</div>`,
            iconSize: [60, 22],
            iconAnchor: [30, 11],
          }),
        })
          .bindPopup(
            `<strong>${t.id}</strong> · ${t.plate}<br/>Chauffeur : ${t.driver}<br/>Statut : <b>${t.status}</b><br/>Charge : ${t.loadPct}%<br/>Vitesse : ${t.speedKmh} km/h`,
          )
          .addTo(truckLayerRef.current);
      });
    })();
  }, [trucks]);

  const todayAlert = WEATHER_FORECAST[0];
  return (
    <div className="relative" style={{ height, width: "100%" }}>
      <div
        ref={ref}
        style={{ height, width: "100%" }}
        className="overflow-hidden rounded-2xl border border-border bg-secondary"
      />
      {showWeather && (
        <>
          {/* Flood alert banner */}
          {(todayAlert.floodRisk === "critique" || todayAlert.floodRisk === "eleve") && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 z-[400] flex items-center gap-2 rounded-xl border border-red-200 bg-red-500/95 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-red-500/30">
              <AlertTriangle className="size-4" />
              <span className="truncate">
                Alerte pluie {todayAlert.rainMm} mm – risque d'inondation {todayAlert.floodRisk} sur les communes pilotes.
              </span>
            </div>
          )}
          {/* 7-day forecast panel */}
          <div className="absolute bottom-3 left-3 right-3 z-[400] rounded-xl border border-border bg-card/95 p-2 shadow-lg backdrop-blur sm:left-auto sm:right-3 sm:w-[420px]">
            <div className="mb-1.5 flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Prévision 7 j · risque d'inondation
              </span>
              <span className="text-[10px] text-muted-foreground">Kinshasa</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {WEATHER_FORECAST.map((d) => {
                const Icon = WEATHER_ICONS[d.icon];
                return (
                  <div key={d.day} className="rounded-lg bg-background p-1.5 text-center">
                    <div className="truncate text-[9px] font-bold uppercase text-muted-foreground">{d.day}</div>
                    <Icon className="mx-auto mt-0.5 size-4 text-kin" />
                    <div className="text-[10px] font-bold">{d.tempC}°</div>
                    <div className="text-[9px] text-muted-foreground">{d.rainMm}mm</div>
                    <span className={`mx-auto mt-1 block h-1 w-5 rounded-full ${riskBg(d.floodRisk)}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
