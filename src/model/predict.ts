// Combines the historical model with the short-range forecast into one prediction,
// and measures how accurate the historical model is on years it never saw.

import { getHistory, dayOfYear, type DailyRecord } from './history';
import {
  predictClimatology,
  windowDays,
  dayDistance,
  WINDOW_DAYS,
  WET_DAY_MM,
  type ClimatologyResult,
} from './climatology';
import { getForecast, FORECAST_DAYS, type DayForecast } from './forecast';

const BACKTEST_YEARS = 5;

export interface Backtest {
  testYears: [number, number];
  testDays: number;
  // Brier score: average of (predicted chance − what happened)². 0 is perfect; lower is better.
  rainBrier: number;
  rainBrierBaseline: number; // using the place's year-round rain frequency instead
  tempError: number; // average |predicted high − actual high|, °C
  tempErrorBaseline: number; // using the place's year-round average high instead
}

export interface Prediction {
  isoDate: string;
  lat: number;
  lon: number;
  daysAhead: number;
  rainChance: number; // final answer, 0..1
  tmax: number; // final answer, °C
  tmin: number;
  climatology: ClimatologyResult;
  forecast: (DayForecast & { weight: number }) | null;
  backtest: Backtest | null;
  observed: { tmax: number; tmin: number; precip: number } | null; // for past dates
}

export async function predict(lat: number, lon: number, isoDate: string): Promise<Prediction> {
  lon = ((((lon + 180) % 360) + 360) % 360) - 180; // map clicks can wrap past ±180

  const [year, month, day] = isoDate.split('-').map(Number);
  const targetDoy = dayOfYear(year, month, day);
  const daysAhead = daysFromToday(year, month, day);

  const [history, forecast] = await Promise.all([
    getHistory(lat, lon),
    daysAhead >= 0 && daysAhead < FORECAST_DAYS
      ? getForecast(lat, lon, isoDate).catch(() => null) // forecast is a bonus; don't fail without it
      : Promise.resolve(null),
  ]);

  // For past dates, hide that year's nearby days so the model can't "peek" at the answer.
  const training = history.filter(
    (r) => !(r.year === year && dayDistance(r.dayOfYear, targetDoy) <= WINDOW_DAYS),
  );
  const climatology = predictClimatology(training, year, targetDoy);

  const observedDay = history.find((r) => r.key === isoDate.split('-').join(''));

  let rainChance = climatology.rainChance;
  let tmax = climatology.tmax;
  let tmin = climatology.tmin;
  let forecastPart: Prediction['forecast'] = null;
  if (forecast) {
    // Trust the forecast a lot for tomorrow (90%) and less each day after (down to 20% at day 15),
    // because forecast accuracy fades with time while the historical odds stay the same.
    const weight = 0.9 - (0.7 * daysAhead) / (FORECAST_DAYS - 1);
    const blend = (f: number | null, c: number) => (f === null ? c : weight * f + (1 - weight) * c);
    rainChance = blend(forecast.rainChance, rainChance);
    tmax = blend(forecast.tmax, tmax);
    tmin = blend(forecast.tmin, tmin);
    forecastPart = { ...forecast, weight };
  }

  return {
    isoDate,
    lat,
    lon,
    daysAhead,
    rainChance,
    tmax,
    tmin,
    climatology,
    forecast: forecastPart,
    backtest: runBacktest(training, targetDoy),
    observed: observedDay
      ? { tmax: observedDay.tmax, tmin: observedDay.tmin, precip: observedDay.precip }
      : null,
  };
}

// Train on older years only, predict the last few complete years, and compare with what
// really happened. The baseline is a "dumb" guess that ignores the time of year.
function runBacktest(records: DailyRecord[], targetDoy: number): Backtest | null {
  const thisYear = new Date().getFullYear();
  const years = [...new Set(records.map((r) => r.year))].filter((y) => y < thisYear).sort();
  const testYears = years.slice(-BACKTEST_YEARS);
  if (years.length < BACKTEST_YEARS + 10) return null;

  const train = records.filter((r) => r.year < testYears[0]);
  const baseRainChance = train.filter((r) => r.precip >= WET_DAY_MM).length / train.length;
  const baseTmax = train.reduce((a, r) => a + r.tmax, 0) / train.length;

  let brier = 0, brierBase = 0, tempErr = 0, tempErrBase = 0, n = 0;
  for (const testYear of testYears) {
    const model = predictClimatology(train, testYear, targetDoy);
    const actualDays = windowDays(records.filter((r) => r.year === testYear), targetDoy);
    for (const day of actualDays) {
      const rained = day.precip >= WET_DAY_MM ? 1 : 0;
      brier += (model.rainChance - rained) ** 2;
      brierBase += (baseRainChance - rained) ** 2;
      tempErr += Math.abs(model.tmax - day.tmax);
      tempErrBase += Math.abs(baseTmax - day.tmax);
      n++;
    }
  }
  if (n === 0) return null;

  return {
    testYears: [testYears[0], testYears[testYears.length - 1]],
    testDays: n,
    rainBrier: brier / n,
    rainBrierBaseline: brierBase / n,
    tempError: tempErr / n,
    tempErrorBaseline: tempErrBase / n,
  };
}

function daysFromToday(year: number, month: number, day: number): number {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((Date.UTC(year, month - 1, day) - today) / 86_400_000);
}
