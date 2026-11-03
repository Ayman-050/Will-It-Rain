import React from 'react';
import { Cloud, Sun, CloudRain, Snowflake, Thermometer, Droplets, Wind, FlaskConical, Radar, History } from 'lucide-react';
import WeatherChart from './WeatherChart';
import type { Prediction } from '../model/predict';
import { HEAVY_RAIN_MM, HOT_DAY_C, WET_DAY_MM, WINDOW_DAYS } from '../model/climatology';

interface WeatherPredictionProps {
  prediction: Prediction;
}

const percent = (value: number) => `${Math.round(value * 100)}%`;

const getWeatherIcon = (weatherType: string) => {
  switch (weatherType) {
    case 'Sunny': return <Sun className="w-6 h-6 text-yellow-500" />;
    case 'Cloudy': return <Cloud className="w-6 h-6 text-gray-500" />;
    case 'Rainy': return <CloudRain className="w-6 h-6 text-blue-500" />;
    case 'Snowy': return <Snowflake className="w-6 h-6 text-blue-300" />;
    default: return <Cloud className="w-6 h-6 text-gray-500" />;
  }
};

const WeatherPrediction: React.FC<WeatherPredictionProps> = ({ prediction }) => {
  const { climatology: model, forecast, backtest, observed } = prediction;
  const conditions = Object.entries(model.conditions).sort((a, b) => b[1] - a[1]);
  const mostLikely = conditions[0];
  const [year, month, day] = prediction.isoDate.split('-').map(Number);
  const dateLabel = new Date(year, month - 1, day).toLocaleDateString(undefined, { dateStyle: 'long' });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Detailed Prediction</h2>
        <p className="text-gray-600">
          ({prediction.lat.toFixed(2)}, {prediction.lon.toFixed(2)}) | {dateLabel}
        </p>
        <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-800 border border-blue-200">
          {forecast ? <Radar className="w-4 h-4" /> : <History className="w-4 h-4" />}
          {forecast
            ? `Live forecast (${percent(forecast.weight)}) + ${model.lastYear - model.firstYear + 1} years of history`
            : `Based on ${model.lastYear - model.firstYear + 1} years of history`}
        </span>
      </div>

      {/* What actually happened (past dates only) */}
      {observed && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center text-green-900">
          <p className="font-semibold">This date is in the past. What actually happened:</p>
          <p>
            High {observed.tmax.toFixed(1)}°C · Low {observed.tmin.toFixed(1)}°C · Rain {observed.precip.toFixed(1)} mm
            {observed.precip >= WET_DAY_MM ? ' (a rainy day)' : ' (a dry day)'}
          </p>
          <p className="text-xs mt-1">That year was hidden from the model, so you can compare its prediction fairly.</p>
        </div>
      )}

      {/* Most Likely Weather */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-6 text-center">
        <h3 className="text-xl font-semibold mb-2">Most Likely Weather</h3>
        <div className="flex items-center justify-center gap-3">
          <span className="[&>svg]:text-white [&>svg]:w-8 [&>svg]:h-8">{getWeatherIcon(mostLikely[0])}</span>
          <span className="text-2xl font-bold">{mostLikely[0]} ({percent(mostLikely[1])})</span>
        </div>
      </div>

      {/* Weather Probabilities */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Weather Type Probabilities</h3>
        <p className="text-sm text-gray-500 mb-4">
          How often each type of day happened around this date in past years.
        </p>
        <div className="space-y-3">
          {conditions.map(([type, probability]) => (
            <div key={type} className="flex items-center gap-3">
              {getWeatherIcon(type)}
              <span className="w-20 text-sm font-medium text-gray-700">{type}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: percent(probability) }}
                ></div>
              </div>
              <span className="w-12 text-sm font-semibold text-gray-800">{percent(probability)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weather Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <Thermometer className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{prediction.tmax.toFixed(1)}°C</div>
          <div className="text-sm text-gray-600">Expected high</div>
          <div className="text-xs text-gray-500 mt-1">
            Usually {model.tmaxLow.toFixed(0)}° – {model.tmaxHigh.toFixed(0)}°
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{percent(prediction.rainChance)}</div>
          <div className="text-sm text-gray-600">Chance of rain (≥{WET_DAY_MM} mm)</div>
          <div className="text-xs text-gray-500 mt-1">
            Heavy rain (≥{HEAVY_RAIN_MM} mm): {percent(model.heavyRainChance)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <Thermometer className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{percent(model.hotChance)}</div>
          <div className="text-sm text-gray-600">Chance of ≥{HOT_DAY_C}°C</div>
          <div className="text-xs text-gray-500 mt-1">
            Below freezing at night: {percent(model.freezeChance)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <Wind className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">
            {model.wind === null ? '–' : `${model.wind.toFixed(1)} m/s`}
          </div>
          <div className="text-sm text-gray-600">Average wind</div>
          <div className="text-xs text-gray-500 mt-1">
            Humidity: {model.humidity === null ? '–' : `${model.humidity.toFixed(0)}%`}
          </div>
        </div>
      </div>

      {/* Forecast vs history breakdown */}
      {forecast && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-sm text-blue-900">
          <h4 className="font-semibold mb-1">How the forecast was blended in</h4>
          <p>
            This date is {prediction.daysAhead === 0 ? 'today' : `${prediction.daysAhead} day(s) away`}, so a real
            weather forecast is available. Forecasts get less reliable further ahead, so it counts
            for {percent(forecast.weight)} of the answer and historical odds count for the rest.
          </p>
          <p className="mt-1">
            Forecast: {forecast.rainChance === null ? 'no rain chance given' : `${percent(forecast.rainChance)} rain`}
            {forecast.tmax !== null && `, high ${forecast.tmax.toFixed(1)}°C`} · History: {percent(model.rainChance)} rain,
            high {model.tmax.toFixed(1)}°C
          </p>
        </div>
      )}

      {/* Temperature trend the model learned */}
      <WeatherChart trend={model.trend} targetYear={year} />

      {/* Model accuracy on years it never saw */}
      {backtest && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
            <FlaskConical className="w-5 h-5 text-purple-600" /> How accurate is this model?
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            We trained the model only on years before {backtest.testYears[0]}, then asked it to predict
            this time of year in {backtest.testYears[0]}–{backtest.testYears[1]} ({backtest.testDays} days)
            and compared with what really happened.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-800">Daily high temperature</p>
              <p className="text-gray-600">
                Off by {backtest.tempError.toFixed(1)}°C on average, versus {backtest.tempErrorBaseline.toFixed(1)}°C
                when guessing the year-round average.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-800">Rain / no rain</p>
              <p className="text-gray-600">
                Brier score {backtest.rainBrier.toFixed(3)} versus {backtest.rainBrierBaseline.toFixed(3)} for the
                year-round rain rate (lower is better; 0 is perfect).{' '}
                {backtest.rainBrier < backtest.rainBrierBaseline
                  ? 'The seasonal model does better here.'
                  : "Rain here barely depends on the season, so the model can't beat the simple guess."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <h4 className="font-semibold text-gray-800 mb-2">How this prediction works</h4>
        <p>
          The model looks at {model.sampleDays} past days within {WINDOW_DAYS} days of this date
          ({model.firstYear}–{model.lastYear}, NASA POWER data). It learns the long-term temperature trend
          and adjusts older years to today's climate, gives more weight to recent years and to days
          closest to your date, then counts how often each outcome happened. Dates within 16 days also
          use a live forecast from Open-Meteo. This shows the odds, not a guarantee.
        </p>
      </div>
    </div>
  );
};

export default WeatherPrediction;
