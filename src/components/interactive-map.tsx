import { useEffect, useRef } from "react";
import { COLLECTION_POINTS, COMMUNES, URGENCY_META, type LiveReport } from "@/lib/eco-store";
import { DEFAULT_CITY } from "@/lib/cities";

type Props = {
  commune?: string;
  reports?: LiveReport[];
  heightClassName?: string;
};

const ICONS: Record<string, { label: string; color: string; glyph: string }> = {
  transfert: { label: "Centre de transfert", color: "#0ea5e9", glyph: "T" },
  regroupement: { label: "Point de regroupement", color: "#f59e0b", glyph: "R" },
  valorisation: { label: "Centre de valorisation", color: "#10b981", glyph: "V" },
  traitement: { label: "Centre de traitement", color: "#6366f1", glyph: "X" },
  collecte: { label: "Zone de collecte", color: "#14b8a6", glyph: "C" },
  tri: { label: "Centre de tri", color: "#22c55e", glyph: "Tri" },
  recyclage: { label: "Recyclage", color: "#84cc16", glyph: "♻" },
};

export function InteractiveMap({ commune, reports = [], heightClassName = "h-[420px]" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !containerRef.current) return;

      const focusedCommune = commune ? COMMUNES.find((item) => item.id === commune) : null;
      const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: true }).setView(
        focusedCommune?.center ?? DEFAULT_CITY.center,
        focusedCommune ? 14 : DEFAULT_CITY.defaultZoom,
      );
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap · © CARTO · EcoKin Smart",
        maxZoom: 19,
      }).addTo(map);

      const communes = focusedCommune ? [focusedCommune] : COMMUNES;
      communes.forEach((item) => {
        L.circle(item.center, {
          radius: focusedCommune ? 1900 : 1200,
          color: item.color,
          weight: 1.6,
          opacity: 0.55,
          fillOpacity: 0.06,
          dashArray: "5 5",
        })
          .bindTooltip(`Commune de ${item.name}`, { direction: "top" })
          .addTo(map);
      });

      COLLECTION_POINTS.filter((point) => !commune || point.commune === commune).forEach((point) => {
        const meta = ICONS[point.kind] ?? ICONS.collecte;
        L.marker([point.lat, point.lng], {
          icon: L.divIcon({
            className: "",
            html: `<div style="background:${meta.color};color:#fff;width:28px;height:28px;display:grid;place-items:center;border-radius:8px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.25);font:800 10px/1 Inter,sans-serif;">${meta.glyph}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          }),
        })
          .bindPopup(`<strong>${point.name}</strong><br/>${meta.label}`)
          .addTo(map);
      });

      reports.forEach((report) => {
        if (!report.lat || !report.lng) return;
        const meta = URGENCY_META[report.urgency];
        const fillColor = report.urgency === "critique" ? "#ef4444" : report.urgency === "eleve" ? "#f97316" : "#10b981";
        L.circleMarker([report.lat, report.lng], {
          radius: report.urgency === "critique" ? 9 : 6,
          color: "#fff",
          weight: 1.5,
          fillColor,
          fillOpacity: 0.9,
        })
          .bindPopup(`<strong>${report.id}</strong><br/>${report.category}<br/>Urgence ${meta.label}`)
          .addTo(map);
      });

      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 120);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [commune, reports]);

  return <div ref={containerRef} className={`${heightClassName} w-full overflow-hidden rounded-lg border bg-secondary`} />;
}
