// Statistical "climatology" model: predicts the weather on a date by learning
// from the same time of year in past years.
//
// How it works:
// 1. Take every past day within ±WINDOW_DAYS of the target day-of-year
//    (e.g. for July 4th: June 27 – July 11 of every year since 1995).
// 2. Train a linear trend of temperature vs. year on those days, so a warming
//    (or cooling) climate is accounted for, then shift each past day's
//    temperature to what it would be in the target year.
// 3. Weight each day: closer to the target date and more recent years count more.
// 4. Count weighted outcomes, e.g. rain chance = weighted share of days with ≥1 mm.

import type { DailyRecord } from './history';

export const WINDOW_DAYS = 7;
const RECENCY_HALF_LIFE_YEARS = 15; // a day from 15 years ago counts half as much
const MAX_TREND_YEARS_AHEAD = 10; // don't extrapolate the trend further than this

export const WET_DAY_MM = 1; // standard meteorological definition of a "rain day"
export const HEAVY_RAIN_MM = 10;
export const HOT_DAY_C = 32;
export const FREEZE_C = 0;
const CLOUDY_PERCENT = 50;

export interface Conditions {
  Sunny: number;
  Cloudy: number;
  Rainy: number;
  Snowy: number;
}

export interface TrendModel {
  slope: number; // °C per year
  intercept: number;
  points: { year: number; tmax: number }[]; // yearly averages it was trained on
}

export interface ClimatologyResult {
  rainChance: number; // 0..1
  heavyRainChance: number;
  avgPrecipMm: number;
  tmax: number; // expected daily high, °C
  tmin: number; // expected daily low, °C
  tmaxLow: number; // 10th percentile of daily high
  tmaxHigh: number; // 90th percentile of daily high
  hotChance: number;
  freezeChance: number;
  humidity: number | null;
  wind: number | null;
  conditions: Conditions;
  trend: TrendModel;
  sampleDays: number;
  firstYear: number;
  lastYear: number;
}

export function dayDistance(a: number, b: number): number {
  const d = Math.abs(a - b);
  return Math.min(d, 365 - d); // wraps around New Year
}

export function windowDays(records: DailyRecord[], targetDoy: number): DailyRecord[] {
  return records.filter((r) => dayDistance(r.dayOfYear, targetDoy) <= WINDOW_DAYS);
}

// Ordinary least squares: the line through the yearly averages with the smallest squared error.
export function fitTrend(days: DailyRecord[]): TrendModel {
  const byYear = new Map<number, number[]>();
  for (const r of days) {
    if (!byYear.has(r.year)) byYear.set(r.year, []);
    byYear.get(r.year)!.push(r.tmax);
  }
  const points = [...byYear.entries()]
    .map(([year, temps]) => ({ year, tmax: mean(temps) }))
    .sort((a, b) => a.year - b.year);

  const n = points.length;
  const meanX = mean(points.map((p) => p.year));
  const meanY = mean(points.map((p) => p.tmax));
  if (n < 10) return { slope: 0, intercept: meanY, points }; // too little data for a trend

  let num = 0;
  let den = 0;
  for (const p of points) {
    num += (p.year - meanX) * (p.tmax - meanY);
    den += (p.year - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: meanY - slope * meanX, points };
}

export function predictClimatology(
  records: DailyRecord[],
  targetYear: number,
  targetDoy: number,
): ClimatologyResult {
  const days = windowDays(records, targetDoy);
  if (days.length === 0) throw new Error('No historical data around this date');

  const trend = fitTrend(days);
  const firstYear = Math.min(...days.map((r) => r.year));
  const lastYear = Math.max(...days.map((r) => r.year));
  const trendYear = Math.min(targetYear, lastYear + MAX_TREND_YEARS_AHEAD);

  const weights = days.map((r) => {
    const closeness = 1 - dayDistance(r.dayOfYear, targetDoy) / (WINDOW_DAYS + 1);
    const recency = 0.5 ** ((lastYear - r.year) / RECENCY_HALF_LIFE_YEARS);
    return closeness * recency;
  });

  // Shift each past day's temperature to the target year using the learned trend.
  const shift = (r: DailyRecord) => trend.slope * (trendYear - r.year);
  const tmaxAdj = days.map((r) => r.tmax + shift(r));
  const tminAdj = days.map((r) => r.tmin + shift(r));

  const chance = (test: (i: number) => boolean) =>
    weightedMean(days.map((_, i) => (test(i) ? 1 : 0)), weights);

  return {
    rainChance: chance((i) => days[i].precip >= WET_DAY_MM),
    heavyRainChance: chance((i) => days[i].precip >= HEAVY_RAIN_MM),
    avgPrecipMm: weightedMean(days.map((r) => r.precip), weights),
    tmax: weightedMean(tmaxAdj, weights),
    tmin: weightedMean(tminAdj, weights),
    tmaxLow: weightedQuantile(tmaxAdj, weights, 0.1),
    tmaxHigh: weightedQuantile(tmaxAdj, weights, 0.9),
    hotChance: chance((i) => tmaxAdj[i] >= HOT_DAY_C),
    freezeChance: chance((i) => tminAdj[i] <= FREEZE_C),
    humidity: optionalMean(days.map((r) => r.humidity), weights),
    wind: optionalMean(days.map((r) => r.wind), weights),
    conditions: conditionChances(days, weights, tmaxAdj, tminAdj),
    trend,
    sampleDays: days.length,
    firstYear,
    lastYear,
  };
}

// Sorts each past day into one weather type, then takes the weighted share of each.
// Days without cloud data are left out of this breakdown only.
function conditionChances(
  days: DailyRecord[],
  weights: number[],
  tmaxAdj: number[],
  tminAdj: number[],
): Conditions {
  const totals: Conditions = { Sunny: 0, Cloudy: 0, Rainy: 0, Snowy: 0 };
  let totalWeight = 0;
  days.forEach((r, i) => {
    if (r.cloud === null) return;
    let type: keyof Conditions;
    if (r.precip >= WET_DAY_MM) {
      type = (tmaxAdj[i] + tminAdj[i]) / 2 <= 0.5 ? 'Snowy' : 'Rainy';
    } else {
      type = r.cloud >= CLOUDY_PERCENT ? 'Cloudy' : 'Sunny';
    }
    totals[type] += weights[i];
    totalWeight += weights[i];
  });
  if (totalWeight === 0) return totals;
  for (const k of Object.keys(totals) as (keyof Conditions)[]) totals[k] /= totalWeight;
  return totals;
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function weightedMean(values: number[], weights: number[]): number {
  let sum = 0;
  let total = 0;
  values.forEach((v, i) => {
    sum += v * weights[i];
    total += weights[i];
  });
  return sum / total;
}

function optionalMean(values: (number | null)[], weights: number[]): number | null {
  const kept = values.flatMap((v, i) => (v === null ? [] : [{ v, w: weights[i] }]));
  if (kept.length === 0) return null;
  return weightedMean(kept.map((k) => k.v), kept.map((k) => k.w));
}

function weightedQuantile(values: number[], weights: number[], q: number): number {
  const sorted = values.map((v, i) => ({ v, w: weights[i] })).sort((a, b) => a.v - b.v);
  const total = sorted.reduce((a, b) => a + b.w, 0);
  let running = 0;
  for (const s of sorted) {
    running += s.w;
    if (running >= q * total) return s.v;
  }
  return sorted[sorted.length - 1].v;
}
