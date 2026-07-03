// EcoKin Smart — Carte flotte GPS temps réel.
// Rendu Leaflet léger, marqueurs orientés par la direction, tracés historiques et itinéraires planifiés.
import { useEffect, useRef } from "react";
import type { Vehicle } from "@/lib/fleet-gps";
import { KINSHASA } from "@/lib/cities";

const COLOR: Record<Vehicle["status"], string> = {
  en_circulation: "#10b981",
  arret: "#f59e0b",
  hors_ligne: "#94a3b8",
};

type Props = {
  vehicles: Vehicle[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  showPlannedRoute?: boolean;
  showTrack?: boolean;
  height?: number;
};

export function FleetMap({ vehicles, selectedId, onSelect, showPlannedRoute = true, showTrack = true, height = 520 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !ref.current) return;
      LRef.current = L;
      const map = L.map(ref.current, { preferCanvas: true }).setView(KINSHASA.center, 12);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap · © CARTO",
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      setTimeout(() => map.invalidateSize(), 100);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !LRef.current || !layerRef.current) return;
    const L = LRef.current;
    layerRef.current.clearLayers();
    vehicles.forEach((v) => {
      const color = COLOR[v.status];
      const isSel = v.id === selectedId;
      // Itinéraire planifié
      if (showPlannedRoute && v.route.length > 1) {
        L.polyline(v.route, { color: "#0ea5e9", weight: 3, opacity: isSel ? 0.9 : 0.35, dashArray: "6 6" }).addTo(layerRef.current);
      }
      // Trace historique
      if (showTrack && v.track.length > 1) {
        const line = v.track.slice(0, 60).map((f) => [f.lat, f.lng]) as [number, number][];
        L.polyline(line, { color, weight: isSel ? 4 : 2, opacity: 0.75 }).addTo(layerRef.current);
      }
      // Marqueur véhicule (flèche orientée)
      const html = `<div style="transform:rotate(${v.current.headingDeg}deg);width:32px;height:32px;display:grid;place-items:center">
        <div style="width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:20px solid ${color};filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))"></div>
      </div>`;
      const icon = L.divIcon({ className: "", html, iconSize: [32, 32], iconAnchor: [16, 16] });
      const m = L.marker([v.current.lat, v.current.lng], { icon }).addTo(layerRef.current);
      m.bindPopup(
        `<div style="font-family:Inter,sans-serif;min-width:180px">
          <div style="font-weight:700">${v.id} · ${v.plate}</div>
          <div style="font-size:12px;color:#334155">${v.driver} · ${v.commune}</div>
          <div style="margin-top:4px"><span style="background:${color};color:#fff;padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:700">${v.status.replace("_", " ")}</span></div>
          <div style="font-size:11px;margin-top:6px;color:#64748b">
            Vitesse : <b>${Math.round(v.current.speedKmh)} km/h</b><br/>
            Charge : <b>${v.loadPct}%</b><br/>
            Déviation : <b>${v.deviationMeters} m</b><br/>
            Dernier fix : ${v.lastFixAt ? new Date(v.lastFixAt).toLocaleTimeString("fr-FR") : "—"}
          </div>
        </div>`,
      );
      m.on("click", () => onSelect?.(v.id));
    });
  }, [vehicles, selectedId, showPlannedRoute, showTrack, onSelect]);

  return <div ref={ref} style={{ height, width: "100%" }} className="overflow-hidden rounded-2xl border border-border bg-secondary" />;
}
