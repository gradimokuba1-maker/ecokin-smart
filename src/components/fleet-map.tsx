import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { useFleet } from "@/lib/fleet-store";
import "leaflet/dist/leaflet.css";
import { icon } from "leaflet";

const truckIcon = icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

export function FleetMap() {
  const { vehicles } = useFleet();
  const position: [number, number] = [-4.325, 15.322222]; // Kinshasa

  return (
    <MapContainer center={position} zoom={12} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {vehicles.map((vehicle) => (
        <>
          {vehicle.currentPosition && (
            <Marker icon={truckIcon} position={[vehicle.currentPosition.lat, vehicle.currentPosition.lon]}>
              <Popup>
                <strong>{vehicle.plate}</strong>
                <br />
                {vehicle.type}
              </Popup>
            </Marker>
          )}
          {vehicle.route && (
            <Polyline
              positions={vehicle.route.path.map((p) => [p.lat, p.lon])}
              color="blue"
            />
          )}
        </>
      ))}
    </MapContainer>
  );
}
