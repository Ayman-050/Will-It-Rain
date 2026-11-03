// Downloads and cleans ~30 years of daily weather history from NASA POWER.
// Docs: https://power.larc.nasa.gov/docs/services/api/temporal/daily/

export interface DailyRecord {
  year: number;
  dayOfYear: number; // 1..366
  key: string; // YYYYMMDD
  tmax: number; // °C
  tmin: number; // °C
  precip: number; // mm/day
  humidity: number | null; // %
  wind: number | null; // m/s at 2 m
  cloud: number | null; // % cloud cover
}

export const HISTORY_START_YEAR = 1995;
const NASA_FILL_VALUE = -999; // NASA's marker for "no data"
const PARAMETERS = 'T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M,WS2M,CLOUD_AMT';

// Downloads are ~1 MB, so keep them per location for the session.
// Changing only the date then re-uses the same data instantly.
const cache = new Map<string, Promise<DailyRecord[]>>();

export function getHistory(lat: number, lon: number): Promise<DailyRecord[]> {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  let request = cache.get(key);
  if (!request) {
    request = downloadHistory(lat, lon);
    request.catch(() => cache.delete(key)); // let a failed download be retried
    cache.set(key, request);
  }
  return request;
}

async function downloadHistory(lat: number, lon: number): Promise<DailyRecord[]> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const url =
    'https://power.larc.nasa.gov/api/temporal/daily/point' +
    `?start=${HISTORY_START_YEAR}0101&end=${toKey(yesterday)}` +
    `&latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
    `&community=ag&parameters=${PARAMETERS}&format=JSON`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`NASA POWER request failed (HTTP ${response.status})`);
  }
  const json = await response.json();
  const p = json?.properties?.parameter;
  if (!p?.T2M_MAX) {
    throw new Error('NASA POWER returned no data for this location');
  }

  const clean = (value: number | undefined) =>
    value === undefined || value === NASA_FILL_VALUE ? null : value;

  const records: DailyRecord[] = [];
  for (const key of Object.keys(p.T2M_MAX)) {
    const tmax = clean(p.T2M_MAX[key]);
    const tmin = clean(p.T2M_MIN[key]);
    const precip = clean(p.PRECTOTCORR[key]);
    // Temperature and rain are required; skip days missing them.
    if (tmax === null || tmin === null || precip === null) continue;

    const year = Number(key.slice(0, 4));
    const month = Number(key.slice(4, 6));
    const day = Number(key.slice(6, 8));
    records.push({
      year,
      dayOfYear: dayOfYear(year, month, day),
      key,
      tmax,
      tmin,
      precip,
      humidity: clean(p.RH2M?.[key]),
      wind: clean(p.WS2M?.[key]),
      cloud: clean(p.CLOUD_AMT?.[key]),
    });
  }

  if (records.length < 365 * 10) {
    throw new Error('Not enough historical data for this location');
  }
  return records;
}

export function dayOfYear(year: number, month: number, day: number): number {
  return Math.round((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 86_400_000);
}

export function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}
