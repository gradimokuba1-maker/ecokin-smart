import { useEffect, useRef } from "react";
import { COMMUNES, type Report, COLLECTION_POINTS, FLOOD_RISK_ZONES, type Commune } from "@/lib/data";

type Props = {
  reports?: Report[];
  height?: number;
  showCollection?: boolean;
  showFloodZones?: boolean;
  focusCommune?: Commune["id"] | "all";
  onSelectReport?: (r: Report) => void;
};

const sevColor: Record<string, string> = {
  critique: "#ef4444",
  modere: "#f59e0b",
  faible: "#10b981",
};

export function EcoMap({
  reports = [],
  height = 460,
  showCollection = true,
  showFloodZones = true,
  focusCommune = "all",
  onSelectReport,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

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

      // Communes outlines (approximate circles)
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

      // Flood risk zones
      if (showFloodZones) {
        FLOOD_RISK_ZONES.forEach((z) => {
          const color = z.level === "critique" ? "#ef4444" : z.level === "eleve" ? "#f97316" : "#f59e0b";
          L.circle([z.lat, z.lng], {
            radius: z.radius,
            color,
            weight: 1,
            fillOpacity: 0.15,
          })
            .bindPopup(
              `<strong>Zone à risque d'inondation</strong><br/>Commune : ${z.commune}<br/>Niveau : <b style="color:${color}">${z.level}</b>`,
            )
            .addTo(map);
        });
      }

      // Collection points
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

      // Reports
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

      // Invalidate size after mount (containers sometimes 0px before layout)
      setTimeout(() => map.invalidateSize(), 100);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [reports, showCollection, showFloodZones, focusCommune, onSelectReport]);

  return (
    <div
      ref={ref}
      style={{ height, width: "100%" }}
      className="overflow-hidden rounded-2xl border border-border bg-secondary"
    />
  );
}
