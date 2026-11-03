import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, AttributionControl, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Free OpenStreetMap tiles via Leaflet. No API key or billing account needed.

const defaultCenter: [number, number] = [37.7749, -122.4194]; // San Francisco

interface MapProps {
  lat?: number;
  lng?: number;
  onMapSelect?: (lat: number, lng: number) => void;
}

// Moves the map when the location changes (e.g. after a city search)
function FlyTo({ lat, lng }: { lat?: number; lng?: number }) {
  const map = useMap();
  useEffect(() => {
    if (typeof lat === "number" && typeof lng === "number") {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 10));
    }
  }, [lat, lng, map]);
  return null;
}

function ClickHandler({ onMapSelect }: { onMapSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (event) => onMapSelect?.(event.latlng.lat, event.latlng.lng),
  });
  return null;
}

export default function Map({ lat, lng, onMapSelect }: MapProps) {
  const hasLocation = typeof lat === "number" && typeof lng === "number";

  return (
    <div className="relative z-0 w-full max-w-4xl rounded-lg overflow-hidden shadow-md" style={{ height: "60vh" }}>
      <MapContainer
        center={hasLocation ? [lat, lng] : defaultCenter}
        zoom={hasLocation ? 10 : 4}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        {/* Replaces Leaflet's default credit, which includes a flag icon */}
        <AttributionControl prefix='<a href="https://leafletjs.com">Leaflet</a>' />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasLocation && (
          <CircleMarker
            center={[lat, lng]}
            radius={9}
            pathOptions={{ color: "#ffffff", weight: 2, fillColor: "#2563eb", fillOpacity: 1 }}
          />
        )}
        <FlyTo lat={lat} lng={lng} />
        <ClickHandler onMapSelect={onMapSelect} />
      </MapContainer>
    </div>
  );
}
