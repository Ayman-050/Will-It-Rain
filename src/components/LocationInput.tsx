import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";

interface LocationInputProps {
  onLocationSelect: (lat: number, lon: number, cityName?: string) => void;
  manualLat: string;
  manualLon: string;
  setManualLat: (lat: string) => void;
  setManualLon: (lon: string) => void;
}

export default function LocationInput({
  onLocationSelect,
  manualLat,
  manualLon,
  setManualLat,
  setManualLon,
}: LocationInputProps) {
  const [city, setCity] = useState("");
  const [useManual, setUseManual] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState("");

  const geocodeCity = async (cityName: string) => {
    setIsGeocoding(true);
    setError("");

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          cityName
        )}&count=1&language=en&format=json`
      );

      if (!response.ok) {
        throw new Error("Failed to find location");
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error(
          "City not found. Please try a different name or use manual coordinates."
        );
      }

      const result = data.results[0];
      onLocationSelect(result.latitude, result.longitude, result.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to find location");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      geocodeCity(city.trim());
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const latitude = parseFloat(manualLat);
    const longitude = parseFloat(manualLon);

    if (isNaN(latitude) || isNaN(longitude)) {
      setError("Please enter valid numbers for coordinates");
      return;
    }

    if (latitude < -90 || latitude > 90) {
      setError("Latitude must be between -90 and 90");
      return;
    }

    if (longitude < -180 || longitude > 180) {
      setError("Longitude must be between -180 and 180");
      return;
    }

    onLocationSelect(latitude, longitude);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Location</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setUseManual(false)}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            !useManual
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          City Name
        </button>
        <button
          onClick={() => setUseManual(true)}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            useManual
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Coordinates
        </button>
      </div>

      {!useManual ? (
        <form onSubmit={handleCitySubmit}>
          <div className="space-y-3">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name (e.g., San Francisco)"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              disabled={isGeocoding}
            />
            <button
              type="submit"
              disabled={!city.trim() || isGeocoding}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isGeocoding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Finding Location...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Find Location
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleManualSubmit}>
          <div className="space-y-3">
            <input
              type="text"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              placeholder="Latitude (e.g., 37.7749)"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <input
              type="text"
              value={manualLon}
              onChange={(e) => setManualLon(e.target.value)}
              placeholder="Longitude (e.g., -122.4194)"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!manualLat.trim() || !manualLon.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Use Coordinates
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
