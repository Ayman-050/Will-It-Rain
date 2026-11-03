import { Cloud, Thermometer } from 'lucide-react';
import { ForecastResult } from '../types';
import RiskBadge from './RiskBadge';

interface ResultsCardProps {
  result: ForecastResult;
  cityName?: string;
}

export default function ResultsCard({ result, cityName }: ResultsCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Check if result has the expected structure
  if (!result || !result.location || !result.rainRisk || !result.heatRisk) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl animate-fadeIn">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Weather Data Available
          </h2>
          <p className="text-gray-600">
            {cityName || 'Location coordinates'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Raw NASA POWER API data received
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">NASA POWER API Response</h3>
          <pre className="text-xs text-gray-600 overflow-auto max-h-64">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl animate-fadeIn">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Weather Risk Report
        </h2>
        <p className="text-gray-600">
          {cityName || `${result.location.latitude.toFixed(2)}°, ${result.location.longitude.toFixed(2)}°`}
        </p>
        <p className="text-sm text-gray-500 mt-1">{formatDate(result.date)}</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Cloud className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800">Rain Risk</h3>
            </div>
            <span className="text-4xl">{result.rainRisk.emoji}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-blue-600">
                {result.rainRisk.probability}%
              </span>
              <span className="text-gray-600">chance of rain</span>
            </div>
            <RiskBadge level={result.rainRisk.level} color={result.rainRisk.color} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Thermometer className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-semibold text-gray-800">Heat Risk</h3>
            </div>
            <span className="text-4xl">{result.heatRisk.emoji}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-orange-600">
                  {result.heatRisk.temperatureMax}°
                </span>
                <span className="text-gray-600">F</span>
              </div>
              <span className="text-gray-400 text-2xl">/</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-gray-700">
                  {result.heatRisk.temperatureMin}°
                </span>
                <span className="text-gray-600">F</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              ({result.heatRisk.temperatureMaxC}°C / {result.heatRisk.temperatureMinC}°C)
            </p>
            <RiskBadge level={result.heatRisk.level} color={result.heatRisk.color} />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          Data provided by Open-Meteo Weather API
        </p>
      </div>
    </div>
  );
}
