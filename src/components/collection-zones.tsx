import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollectionZones } from "@/lib/collection-zones-store";
import { KINSHASA_COMMUNES } from "@/lib/cities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { icon } from "leaflet";

const zoneIcon = icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function CollectionZones() {
  const { zones } = useCollectionZones();
  const [selectedCommune, setSelectedCommune] = useState<string | null>(null);
  const [selectedQuartier, setSelectedQuartier] = useState<string | null>(null);

  const communesWithZones = [...new Set(zones.map((z) => z.commune))];
  const quartiersWithZones = selectedCommune
    ? [...new Set(zones.filter((z) => z.commune === selectedCommune).map((z) => z.quartier))]
    : [];
  const filteredZones = selectedQuartier
    ? zones.filter((z) => z.quartier === selectedQuartier)
    : selectedCommune
      ? zones.filter((z) => z.commune === selectedCommune)
      : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zones de collecte</CardTitle>
        <CardDescription>Points de collecte réels à Kinshasa.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Select
            onValueChange={(value) => {
              setSelectedCommune(value);
              setSelectedQuartier(null);
            }}
            value={selectedCommune || ""}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Commune" />
            </SelectTrigger>
            <SelectContent>
              {KINSHASA_COMMUNES.filter((c) => communesWithZones.includes(c.name)).map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCommune && (
            <Select onValueChange={setSelectedQuartier} value={selectedQuartier || ""}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Quartier" />
              </SelectTrigger>
              <SelectContent>
                {quartiersWithZones.map((q) => (
                  <SelectItem key={q} value={q}>
                    {q}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="h-[400px]">
          {filteredZones.length > 0 ? (
            <MapContainer
              center={[filteredZones[0].position.lat, filteredZones[0].position.lon]}
              zoom={14}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredZones.map((zone) => (
                <Marker
                  key={zone.id}
                  icon={zoneIcon}
                  position={[zone.position.lat, zone.position.lon]}
                >
                  <Popup>
                    <strong>{zone.name}</strong>
                    <br />
                    {zone.type}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Aucun point enregistré dans cette zone.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
