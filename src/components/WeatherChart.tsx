import React from "react";

interface WeatherChartProps {
  weatherData: {
    temperature: { average: number; min: number; max: number };
    humidity: { average: number };
    precipitation: { average: number; precip_probability: number };
    wind_speed: { average: number };
  };
}

const WeatherChart: React.FC<WeatherChartProps> = ({ weatherData }) => {
  // Prepare data for a simple bar chart
  const chartData = [
    {
      label: "Avg Temp (°C)",
      value: weatherData.temperature.average,
      color: "#3b82f6",
    },
    {
      label: "Min Temp (°C)",
      value: weatherData.temperature.min,
      color: "#60a5fa",
    },
    {
      label: "Max Temp (°C)",
      value: weatherData.temperature.max,
      color: "#2563eb",
    },
    {
      label: "Humidity (%)",
      value: weatherData.humidity.average,
      color: "#06b6d4",
    },
    {
      label: "Precip (mm)",
      value: weatherData.precipitation.average,
      color: "#818cf8",
    },
    {
      label: "Wind (m/s)",
      value: weatherData.wind_speed.average,
      color: "#22d3ee",
    },
  ];

  // Find the max value for scaling
  const maxValue = Math.max(...chartData.map((d) => d.value)) || 1;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Weather Data Chart</h3>
      <div className="flex items-end gap-4 h-48 w-full justify-center">
        {chartData.map((d) => (
          <div key={d.label} className="flex flex-col items-center w-16">
            <div
              className="rounded-t-lg"
              style={{
                height: `${(d.value / maxValue) * 100}%`,
                background: d.color,
                width: "100%",
                minHeight: "8px",
                transition: "height 0.5s",
              }}
              title={`${d.value}`}
            ></div>
            <span className="text-xs text-gray-600 mt-2 text-center">{d.label}</span>
            <span className="text-xs font-semibold text-gray-800">{d.value.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherChart;