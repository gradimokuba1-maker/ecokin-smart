import { Fragment } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { useFleet, type Vehicle as FleetVehicle } from "@/lib/fleet-store";
import "leaflet/dist/leaflet.css";
import { icon } from "leaflet";

export type FleetMapVehicle = {
  id: string;
  plate: string;
  driver: string;
  current?: { lat: number; lng: number };
  currentPosition?: { lat: number; lon: number };
  route?: [number, number][] | { name: string; path: { lat: number; lon: number }[] };
};

export type FleetMapProps = {
  vehicles?: FleetMapVehicle[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  height?: number;
};

const truckIcon = icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function getRouteCoordinates(route: FleetMapVehicle["route"]) {
  if (!route) return [] as [number, number][];
  if (Array.isArray(route)) return route;
  return route.path.map((point) => [point.lat, point.lon] as [number, number]);
}

export function FleetMap({ vehicles: controlledVehicles, selectedId, onSelect, height = 520 }: FleetMapProps) {
  const fleet = useFleet();
  const vehicles: FleetMapVehicle[] = controlledVehicles ?? fleet.vehicles.map((v) => ({
    id: v.id,
    plate: v.plate,
    driver: v.type === "camion_benne" ? "Camion" : v.type === "tricycle" ? "Tricycle" : "Vélo",
    current: v.currentPosition ? { lat: v.currentPosition.lat, lng: v.currentPosition.lon } : undefined,
    currentPosition: v.currentPosition,
    route: v.route,
  }));
  const position: [number, number] = [-4.325, 15.322222]; // Kinshasa

  return (
    <MapContainer center={position} zoom={12} scrollWheelZoom={false} style={{ height, width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {vehicles.map((vehicle) => {
        const coords = vehicle.current ? [vehicle.current.lat, vehicle.current.lng] : undefined;
        const routeCoords = getRouteCoordinates(vehicle.route);
        return (
          <Fragment key={vehicle.id}>
            {coords && (
              <Marker
                icon={truckIcon}
                position={coords as [number, number]}
                eventHandlers={onSelect ? { click: () => onSelect(vehicle.id) } : undefined}
              >
                <Popup>
                  <strong>{vehicle.plate}</strong>
                  <br />
                  {vehicle.driver}
                </Popup>
              </Marker>
            )}
            {routeCoords.length > 0 && (
              <Polyline
                positions={routeCoords}
                color={vehicle.id === selectedId ? "#10b981" : "blue"}
              />
            )}
          </Fragment>
        );
      })}
    </MapContainer>
  );
}
