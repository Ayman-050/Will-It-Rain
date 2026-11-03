// Real weather-model forecast from Open-Meteo (free, no API key).
// Only covers the next 16 days — beyond that, no forecast has useful skill.
// Docs: https://open-meteo.com/en/docs

export const FORECAST_DAYS = 16;

export interface DayForecast {
  rainChance: number | null; // 0..1
  precipMm: number | null;
  tmax: number | null; // °C
  tmin: number | null; // °C
}

export async function getForecast(lat: number, lon: number, isoDate: string): Promise<DayForecast | null> {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
    '&daily=precipitation_probability_max,precipitation_sum,temperature_2m_max,temperature_2m_min' +
    `&forecast_days=${FORECAST_DAYS}&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) return null;
  const daily = (await response.json())?.daily;
  const i: number = daily?.time?.indexOf(isoDate) ?? -1;
  if (i < 0) return null;

  const probability = daily.precipitation_probability_max?.[i];
  return {
    rainChance: probability == null ? null : probability / 100,
    precipMm: daily.precipitation_sum?.[i] ?? null,
    tmax: daily.temperature_2m_max?.[i] ?? null,
    tmin: daily.temperature_2m_min?.[i] ?? null,
  };
}
