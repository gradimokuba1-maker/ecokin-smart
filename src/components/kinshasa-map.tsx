// EcoKin Smart — Carte SIG Kinshasa (24 communes, clustering, GPS live, recherche, draggable).
// Architecture multi-ville : accepte n'importe quelle `City` de src/lib/cities.ts.
import { useEffect, useRef, useState } from "react";
import type { City } from "@/lib/cities";
import { haversineMeters } from "@/lib/cities";
import { Search, LocateFixed, Loader2 } from "lucide-react";

export type MapReport = {
  id: string;
  lat: number;
  lng: number;
  category?: string;
  status?: "nouveau" | "en_cours" | "collecte" | "resolu" | string;
  urgency?: string;
  createdAt?: string;
  description?: string;
  photoUrl?: string;
  priorityScore?: number;
  commune?: string;
};

const STATUS_COLOR: Record<string, string> = {
  nouveau: "#ef4444", // rouge — nouveau
  en_attente: "#ef4444",
  assignee: "#f59e0b",
  en_cours: "#f59e0b", // orange — traitement
  collecte: "#0ea5e9", // bleu — collecté
  resolu: "#10b981", // vert — résolu
  terminee: "#10b981",
};
const STATUS_LABEL: Record<string, string> = {
  nouveau: "Nouveau",
  en_attente: "Nouveau",
  assignee: "Assigné",
  en_cours: "En cours",
  collecte: "Collecté",
  resolu: "Résolu",
  terminee: "Résolu",
};

type Props = {
  city: City;
  reports: MapReport[];
  height?: number;
  // Mode signalement : marqueur draggable pour choisir la position exacte.
  picker?: {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number) => void;
  };
  // Suivi GPS live de l'utilisateur (position bleue).
  followUser?: boolean;
  onUserLocation?: (lat: number, lng: number, accuracy: number) => void;
};

export function KinshasaMap({ city, reports, height = 560, picker, followUser = true, onUserLocation }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const clusterRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);
  const pickerMarkerRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ label: string; lat: number; lng: number }>>([]);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Init map (once)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      await import("leaflet.markercluster");
      await import("leaflet.markercluster/dist/MarkerCluster.css");
      await import("leaflet.markercluster/dist/MarkerCluster.Default.css");
      if (cancelled || !containerRef.current) return;
      LRef.current = L;

      const map = L.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        preferCanvas: true,
      }).setView(city.center, city.defaultZoom);
      mapRef.current = map;

      // Limiter le viewport à la ville
      map.setMaxBounds(L.latLngBounds(city.bounds[0], city.bounds[1]).pad(0.15));

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap · © CARTO · EcoKin Smart",
        maxZoom: 19,
      }).addTo(map);

      // Contours communes (labels discrets)
      city.communes.forEach((c) => {
        L.circleMarker(c.center, {
          radius: 4,
          color: c.pilot ? "#10b981" : "#94a3b8",
          weight: 2,
          fillColor: c.pilot ? "#10b981" : "#cbd5e1",
          fillOpacity: 0.6,
        })
          .bindTooltip(c.pilot ? `${c.name} (pilote)` : c.name, { direction: "top" })
          .addTo(map);
      });

      // Cluster group
      const cluster = (L as any).markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 55,
        showCoverageOnHover: false,
      });
      clusterRef.current = cluster;
      map.addLayer(cluster);

      setTimeout(() => map.invalidateSize(), 120);
      setMapReady(true);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city.id]);

  // Rebuild markers when reports change
  useEffect(() => {
    if (!mapReady || !clusterRef.current || !LRef.current) return;
    const L = LRef.current;
    const cluster = clusterRef.current;
    cluster.clearLayers();
    const userLL = userPos ? [userPos.lat, userPos.lng] as [number, number] : null;
    reports.forEach((r) => {
      if (!Number.isFinite(r.lat) || !Number.isFinite(r.lng)) return;
      const color = STATUS_COLOR[r.status ?? "nouveau"] ?? "#ef4444";
      const label = STATUS_LABEL[r.status ?? "nouveau"] ?? "Nouveau";
      const marker = L.circleMarker([r.lat, r.lng], {
        radius: 8,
        color: "#fff",
        weight: 2,
        fillColor: color,
        fillOpacity: 0.9,
      });
      const dist = userLL ? haversineMeters(userLL, [r.lat, r.lng]) : null;
      const distStr =
        dist == null ? "" : `<div style="color:#64748b;font-size:11px;margin-top:4px">📍 ${dist < 1000 ? Math.round(dist) + " m" : (dist / 1000).toFixed(1) + " km"} de vous</div>`;
      const photo = r.photoUrl
        ? `<img src="${r.photoUrl}" style="width:100%;max-height:120px;object-fit:cover;border-radius:6px;margin-bottom:6px" />`
        : "";
      const created = r.createdAt ? new Date(r.createdAt).toLocaleString("fr-FR") : "";
      marker.bindPopup(
        `<div style="min-width:180px;font-family:Inter,sans-serif">
          ${photo}
          <div style="font-weight:700">${r.id}</div>
          <div style="font-size:12px;color:#334155">${r.category ?? "Déchet"} · ${r.commune ?? ""}</div>
          <div style="margin-top:4px"><span style="background:${color};color:#fff;padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:700">${label}</span>${r.priorityScore != null ? ` <span style="font-size:11px;color:#64748b">priorité ${r.priorityScore}/100</span>` : ""}</div>
          ${r.description ? `<div style="font-size:12px;margin-top:4px">${r.description}</div>` : ""}
          <div style="font-size:11px;color:#64748b;margin-top:4px">${created}</div>
          ${distStr}
        </div>`,
      );
      cluster.addLayer(marker);
    });
  }, [reports, mapReady, userPos]);

  // Draggable picker marker
  useEffect(() => {
    if (!mapReady || !picker || !LRef.current || !mapRef.current) return;
    const L = LRef.current;
    if (pickerMarkerRef.current) {
      pickerMarkerRef.current.setLatLng([picker.lat, picker.lng]);
      return;
    }
    const icon = L.divIcon({
      className: "",
      html: `<div style="width:28px;height:28px;background:#10b981;border:3px solid #fff;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,.35);display:grid;place-items:center;color:#fff;font-weight:700;font-size:14px">📍</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    const m = L.marker([picker.lat, picker.lng], { icon, draggable: true }).addTo(mapRef.current);
    m.bindTooltip("Glissez pour ajuster la position", { direction: "top", offset: [0, -12] }).openTooltip();
    m.on("dragend", () => {
      const p = m.getLatLng();
      picker.onChange(p.lat, p.lng);
    });
    mapRef.current.on("click", (e: any) => {
      m.setLatLng(e.latlng);
      picker.onChange(e.latlng.lat, e.latlng.lng);
    });
    pickerMarkerRef.current = m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, picker?.lat, picker?.lng]);

  // Suivi GPS live utilisateur (watchPosition)
  useEffect(() => {
    if (!followUser || typeof navigator === "undefined" || !navigator.geolocation) return;
    let firstFix = true;
    const wid = navigator.geolocation.watchPosition(
      (p) => {
        const lat = p.coords.latitude;
        const lng = p.coords.longitude;
        const acc = p.coords.accuracy;
        setUserPos({ lat, lng, accuracy: acc });
        onUserLocation?.(lat, lng, acc);
        if (!mapRef.current || !LRef.current) return;
        const L = LRef.current;
        if (!userMarkerRef.current) {
          const icon = L.divIcon({
            className: "",
            html: `<div style="width:18px;height:18px;background:#0ea5e9;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 6px rgba(14,165,233,.25)"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          });
          userMarkerRef.current = L.marker([lat, lng], { icon, interactive: false }).addTo(mapRef.current);
          accuracyCircleRef.current = L.circle([lat, lng], {
            radius: acc,
            color: "#0ea5e9",
            weight: 1,
            fillOpacity: 0.08,
          }).addTo(mapRef.current);
        } else {
          userMarkerRef.current.setLatLng([lat, lng]);
          accuracyCircleRef.current.setLatLng([lat, lng]);
          accuracyCircleRef.current.setRadius(acc);
        }
        if (firstFix) {
          firstFix = false;
          mapRef.current.setView([lat, lng], 15);
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(wid);
  }, [followUser, onUserLocation]);

  async function runSearch(q: string) {
    setQuery(q);
    if (q.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    try {
      // Nominatim OSM (viewbox restreint à Kinshasa)
      const vb = `${city.bounds[0][1]},${city.bounds[0][0]},${city.bounds[1][1]},${city.bounds[1][0]}`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=0&viewbox=${vb}&bounded=1&q=${encodeURIComponent(q + ", " + city.name)}`;
      const res = await fetch(url, { headers: { "Accept-Language": "fr" } });
      const j: any[] = await res.json();
      setSuggestions(
        j.map((x) => ({
          label: x.display_name as string,
          lat: parseFloat(x.lat),
          lng: parseFloat(x.lon),
        })),
      );
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }

  function focusPlace(lat: number, lng: number) {
    mapRef.current?.setView([lat, lng], 16);
    setSuggestions([]);
  }

  function locateMe() {
    if (!userPos || !mapRef.current) {
      navigator.geolocation?.getCurrentPosition(
        (p) => mapRef.current?.setView([p.coords.latitude, p.coords.longitude], 15),
        () => {},
        { enableHighAccuracy: true },
      );
      return;
    }
    mapRef.current.setView([userPos.lat, userPos.lng], 16);
  }

  return (
    <div className="relative" style={{ height, width: "100%" }}>
      <div
        ref={containerRef}
        style={{ height, width: "100%" }}
        className="overflow-hidden rounded-2xl border border-border bg-secondary"
      />
      {/* Search bar */}
      <div className="absolute left-3 right-3 top-3 z-[500] sm:right-auto sm:w-96">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card/95 px-3 py-2 shadow-lg backdrop-blur">
          {searching ? <Loader2 className="size-4 animate-spin text-eco" /> : <Search className="size-4 text-muted-foreground" />}
          <input
            value={query}
            onChange={(e) => runSearch(e.target.value)}
            placeholder={`Rechercher commune, quartier, avenue à ${city.name}…`}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        {suggestions.length > 0 && (
          <ul className="mt-1 max-h-64 overflow-auto rounded-xl border border-border bg-card shadow-lg">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  onClick={() => focusPlace(s.lat, s.lng)}
                  className="w-full truncate px-3 py-2 text-left text-xs hover:bg-secondary"
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Locate button */}
      <button
        onClick={locateMe}
        className="absolute bottom-3 right-3 z-[500] inline-flex items-center gap-2 rounded-xl border border-border bg-card/95 px-3 py-2 text-xs font-bold shadow-lg backdrop-blur hover:bg-secondary"
      >
        <LocateFixed className="size-4 text-eco" /> Ma position
      </button>
    </div>
  );
}
