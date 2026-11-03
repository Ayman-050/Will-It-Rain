import React, { useCallback, useRef, useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "75vh", // Adjust as needed or make responsive
};

const defaultCenter = {
  lat: 37.7749, // Default to San Francisco
  lng: -122.4194,
};

// TODO: Replace with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = "AIzaSyD4jgY3kfbY_xalzXJWu115yNvaQONlWjE";

interface MapProps {
  lat?: number;
  lng?: number;
  onMapSelect?: (lat: number, lng: number) => void;
}

export default function Map({ lat, lng, onMapSelect }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [zoom, setZoom] = useState(10);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Update map when props change
  useEffect(() => {
    if (typeof lat === "number" && typeof lng === "number") {
      setSelected({ lat, lng });
      setZoom(15);
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(15);
      }
    }
  }, [lat, lng]);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setSelected({ lat, lng });
      setZoom(15);
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(15);
      }
      if (onMapSelect) {
        onMapSelect(lat, lng);
      }
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={selected || defaultCenter}
          zoom={zoom}
          onClick={handleMapClick}
          onLoad={handleMapLoad}
        >
          {selected && <Marker position={selected} />}
        </GoogleMap>
      ) : (
        <div>Loading Map...</div>
      )}
    </div>
  );
}
