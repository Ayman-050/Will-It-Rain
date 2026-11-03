import React, { useState } from "react";
import type { TrendModel } from "../model/climatology";

interface WeatherChartProps {
  trend: TrendModel;
  targetYear: number;
}

const WIDTH = 640;
const HEIGHT = 240;
const PAD = { top: 16, right: 16, bottom: 32, left: 44 };

// Scatter of yearly average highs around the chosen date, with the trend line the model fitted.
const WeatherChart: React.FC<WeatherChartProps> = ({ trend, targetYear }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const { points, slope, intercept } = trend;
  if (points.length < 2) return null;

  const years = points.map((p) => p.year);
  const temps = points.map((p) => p.tmax);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const minTemp = Math.floor(Math.min(...temps) - 1);
  const maxTemp = Math.ceil(Math.max(...temps) + 1);

  const x = (year: number) =>
    PAD.left + ((year - minYear) / (maxYear - minYear)) * (WIDTH - PAD.left - PAD.right);
  const y = (temp: number) =>
    PAD.top + ((maxTemp - temp) / (maxTemp - minTemp)) * (HEIGHT - PAD.top - PAD.bottom);

  const tempTicks = niceTicks(minTemp, maxTemp);
  const yearTicks = years.filter((yr) => yr % 5 === 0);
  const perDecade = slope * 10;
  const hoveredPoint = hovered === null ? null : points[hovered];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-1">Average high around this date, by year</h3>
      <p className="text-sm text-gray-600 mb-4">
        The dashed line is the trend the model learned:{" "}
        <span className="font-semibold text-gray-800">
          {perDecade >= 0 ? "+" : ""}
          {perDecade.toFixed(2)}°C per decade
        </span>
        . It uses this to adjust older years to {targetYear}'s climate.
      </p>

      <div className="relative">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" role="img"
          aria-label={`Yearly average high temperature from ${minYear} to ${maxYear}, trend ${perDecade.toFixed(2)} degrees per decade`}>
          {/* Grid and axes */}
          {tempTicks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(t)} y2={y(t)} stroke="#e5e7eb" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="#6b7280">
                {t}°C
              </text>
            </g>
          ))}
          {yearTicks.map((yr) => (
            <text key={yr} x={x(yr)} y={HEIGHT - 10} textAnchor="middle" fontSize={11} fill="#6b7280">
              {yr}
            </text>
          ))}

          {/* Trend line */}
          <line
            x1={x(minYear)} y1={y(intercept + slope * minYear)}
            x2={x(maxYear)} y2={y(intercept + slope * maxYear)}
            stroke="#374151" strokeWidth={2} strokeDasharray="6 4"
          />

          {/* Yearly points, with larger invisible hit areas for hovering */}
          {points.map((p, i) => (
            <g key={p.year} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <circle cx={x(p.year)} cy={y(p.tmax)} r={hovered === i ? 6 : 4.5}
                fill="#2563eb" stroke="#ffffff" strokeWidth={2} />
              <circle cx={x(p.year)} cy={y(p.tmax)} r={12} fill="transparent" />
            </g>
          ))}
        </svg>

        {hoveredPoint && (
          <div
            className="absolute pointer-events-none bg-gray-900 text-white text-xs rounded px-2 py-1 shadow"
            style={{
              left: `${(x(hoveredPoint.year) / WIDTH) * 100}%`,
              top: `${(y(hoveredPoint.tmax) / HEIGHT) * 100}%`,
              transform: "translate(-50%, -130%)",
            }}
          >
            {hoveredPoint.year}: {hoveredPoint.tmax.toFixed(1)}°C
          </div>
        )}
      </div>
    </div>
  );
};

function niceTicks(min: number, max: number): number[] {
  const step = max - min > 12 ? 5 : max - min > 6 ? 2 : 1;
  const ticks = [];
  for (let t = Math.ceil(min / step) * step; t <= max; t += step) ticks.push(t);
  return ticks;
}

export default WeatherChart;
