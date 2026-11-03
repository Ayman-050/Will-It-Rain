import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Snowflake, Thermometer, Droplets, Wind, Eye } from 'lucide-react';
import WeatherChart from "./WeatherChart";

interface WeatherPredictionProps {
  latitude: number;
  longitude: number;
  date: string;
  dateRangeDays?: number; // Optional: number of days before/after to include in analysis
  community?: string; // NASA API community parameter (default: 'ag')
  parameters?: string; // NASA API parameters (default: 'T2M,RH2M,PRECTOT,WS2M')
}

interface WeatherData {
  temperature: {
    average: number;
    min: number;
    max: number;
  };
  humidity: {
    average: number;
  };
  precipitation: {
    average: number;
    precip_probability: number;
  };
  wind_speed: {
    average: number;
  };
  weather_probabilities: {
    Sunny: number;
    Cloudy: number;
    Rainy: number;
    Snowy: number;
  };
  confidence_score: number;
  data_summary: {
    data_quality: string;
    total_records: number;
  };
}

const WeatherPrediction: React.FC<WeatherPredictionProps> = ({ 
  latitude, 
  longitude, 
  date, 
  dateRangeDays = 7,
  community = 'ag',
  parameters = 'T2M,RH2M,PRECTOT,WS2M'
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Format date for NASA API (YYYYMMDD format)
  const formatDateForNASA = (dateString: string): string => {
    const date = new Date(dateString);
    // Subtract 3 from the year
    const year = date.getFullYear() - 3;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  // Process NASA POWER API data into our expected format
  const processNASAData = (nasaData: any): WeatherData => {
    const parameters = nasaData.properties.parameter;
    const temperatureData = parameters.T2M || {};
    const humidityData = parameters.RH2M || {};
    const precipitationData = parameters.PRECTOT || {};
    const windSpeedData = parameters.WS2M || {};
    
    // Calculate averages and statistics
    const temperatures = Object.values(temperatureData).filter((val: any) => val !== null) as number[];
    const humidities = Object.values(humidityData).filter((val: any) => val !== null) as number[];
    const precipitations = Object.values(precipitationData).filter((val: any) => val !== null) as number[];
    const windSpeeds = Object.values(windSpeedData).filter((val: any) => val !== null) as number[];
    
    const avgTemp = temperatures.length > 0 ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length : 20;
    const minTemp = temperatures.length > 0 ? Math.min(...temperatures) : avgTemp - 5;
    const maxTemp = temperatures.length > 0 ? Math.max(...temperatures) : avgTemp + 5;
    const avgHumidity = humidities.length > 0 ? humidities.reduce((a, b) => a + b, 0) / humidities.length : 60;
    const avgPrecipitation = precipitations.length > 0 ? precipitations.reduce((a, b) => a + b, 0) / precipitations.length : 0;
    const avgWindSpeed = windSpeeds.length > 0 ? windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length : 5;
    
    // Determine weather type based on data
    const weatherProbabilities = determineWeatherType(avgTemp, avgHumidity, avgPrecipitation, avgWindSpeed);
    
    // Calculate confidence score based on data availability
    const dataQuality = temperatures.length > 0 ? 'Good' : 'Limited';
    const confidenceScore = Math.min(95, 70 + (temperatures.length * 2));
    
    return {
      temperature: {
        average: avgTemp,
        min: minTemp,
        max: maxTemp
      },
      humidity: {
        average: avgHumidity
      },
      precipitation: {
        average: avgPrecipitation,
        precip_probability: avgPrecipitation > 0.1 ? Math.min(90, avgPrecipitation * 100) : 10
      },
      wind_speed: {
        average: avgWindSpeed
      },
      weather_probabilities: weatherProbabilities,
      confidence_score: confidenceScore,
      data_summary: {
        data_quality: dataQuality,
        total_records: temperatures.length
      }
    };
  };

  // Determine weather type based on meteorological data
  const determineWeatherType = (temp: number, humidity: number, precipitation: number, windSpeed: number) => {
    const probabilities = {
      'Sunny': 0,
      'Cloudy': 0,
      'Rainy': 0,
      'Snowy': 0
    };
    
    // Temperature-based logic
    if (temp < 0) {
      probabilities['Snowy'] += 40;
      probabilities['Cloudy'] += 30;
      probabilities['Sunny'] += 20;
      probabilities['Rainy'] += 10;
    } else if (temp < 5) {
      probabilities['Snowy'] += 30;
      probabilities['Cloudy'] += 35;
      probabilities['Rainy'] += 25;
      probabilities['Sunny'] += 10;
    } else if (temp < 15) {
      probabilities['Cloudy'] += 40;
      probabilities['Rainy'] += 30;
      probabilities['Sunny'] += 20;
      probabilities['Snowy'] += 10;
    } else if (temp < 25) {
      probabilities['Sunny'] += 35;
      probabilities['Cloudy'] += 35;
      probabilities['Rainy'] += 20;
      probabilities['Snowy'] += 10;
    } else {
      probabilities['Sunny'] += 50;
      probabilities['Cloudy'] += 25;
      probabilities['Rainy'] += 15;
      probabilities['Snowy'] += 10;
    }
    
    // Humidity adjustment
    if (humidity > 80) {
      probabilities['Rainy'] += 20;
      probabilities['Cloudy'] += 15;
      probabilities['Sunny'] -= 15;
    } else if (humidity < 30) {
      probabilities['Sunny'] += 20;
      probabilities['Cloudy'] -= 10;
      probabilities['Rainy'] -= 10;
    }
    
    // Precipitation adjustment
    if (precipitation > 1) {
      probabilities['Rainy'] += 30;
      probabilities['Snowy'] += 10;
      probabilities['Sunny'] -= 20;
      probabilities['Cloudy'] -= 20;
    }
    
    // Wind speed adjustment
    if (windSpeed > 10) {
      probabilities['Cloudy'] += 10;
      probabilities['Rainy'] += 10;
    }
    
    // Normalize probabilities to sum to 100
    const total = Object.values(probabilities).reduce((a, b) => a + b, 0);
    Object.keys(probabilities).forEach(key => {
      probabilities[key as keyof typeof probabilities] = Math.max(5, Math.round((probabilities[key as keyof typeof probabilities] / total) * 100));
    });
    
    // Final normalization
    const finalTotal = Object.values(probabilities).reduce((a, b) => a + b, 0);
    Object.keys(probabilities).forEach(key => {
      probabilities[key as keyof typeof probabilities] = Math.round((probabilities[key as keyof typeof probabilities] / finalTotal) * 100);
    });
    
    return probabilities;
  };

  // Fetch weather data from NASA POWER API
  const fetchWeatherData = async () => {
    if (!latitude || !longitude || !date) return;

    setLoading(true);
    setError('');

    try {
      // Create a date range for better historical analysis
      const selectedDate = new Date(date);
      const startDate = new Date(selectedDate);
      startDate.setDate(selectedDate.getDate() - dateRangeDays);
      const endDate = new Date(selectedDate); 
      endDate.setDate(selectedDate.getDate() + dateRangeDays);

      // Format start and end dates with year - 3 and yyyymmdd format
      const startDateFormatted = formatDateForNASA(startDate.toISOString().split('T')[0]);
      const endDateFormatted = formatDateForNASA(endDate.toISOString().split('T')[0]);

      const nasaApiUrl = `https://power.larc.nasa.gov/api/temporal/hourly/point?start=${startDateFormatted}&end=${endDateFormatted}&latitude=${latitude}&longitude=${longitude}&community=${community}&parameters=${parameters}&header=true`;

      console.log('Fetching weather data from:', nasaApiUrl);
      
      const response = await fetch(nasaApiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const nasaData = await response.json();
      const processedData = processNASAData(nasaData);
      console.log(nasaData)
      setWeatherData(processedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (latitude && longitude && date) {
      fetchWeatherData();
    }
  }, [latitude, longitude, date]);

  const getWeatherIcon = (weatherType: string) => {
    switch (weatherType) {
      case 'Sunny': return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'Cloudy': return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'Rainy': return <CloudRain className="w-6 h-6 text-blue-500" />;
      case 'Snowy': return <Snowflake className="w-6 h-6 text-blue-300" />;
      default: return <Cloud className="w-6 h-6 text-gray-500" />;
    }
  };

  const getMostLikelyWeather = () => {
    if (!weatherData) return null;
    const entries = Object.entries(weatherData.weather_probabilities);
    return entries.reduce((a, b) => weatherData.weather_probabilities[a[0] as keyof typeof weatherData.weather_probabilities] > weatherData.weather_probabilities[b[0] as keyof typeof weatherData.weather_probabilities] ? a : b);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading weather prediction...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <p className="text-red-700 font-medium">Error loading weather prediction</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  const mostLikely = getMostLikelyWeather();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Weather Prediction</h2>
        <p className="text-gray-600">
          Location: ({latitude.toFixed(4)}, {longitude.toFixed(4)}) | Date: {new Date(date).toLocaleDateString()}
        </p>
      </div>

      {/* Most Likely Weather */}
      {mostLikely && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Most Likely Weather</h3>
          <div className="flex items-center justify-center gap-3">
            {getWeatherIcon(mostLikely[0])}
            <span className="text-2xl font-bold">{mostLikely[0]} ({mostLikely[1]}%)</span>
          </div>
        </div>
      )}

      {/* Weather Probabilities */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Weather Type Probabilities</h3>
        <div className="space-y-3">
          {Object.entries(weatherData.weather_probabilities).map(([type, probability]) => (
            <div key={type} className="flex items-center gap-3">
              {getWeatherIcon(type)}
              <span className="w-20 text-sm font-medium text-gray-700">{type}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${probability}%` }}
                ></div>
              </div>
              <span className="w-12 text-sm font-semibold text-blue-600">{probability}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weather Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <Thermometer className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{weatherData.temperature.average.toFixed(1)}°C</div>
          <div className="text-sm text-gray-600">
            {weatherData.temperature.min.toFixed(1)}° - {weatherData.temperature.max.toFixed(1)}°
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{weatherData.precipitation.average.toFixed(1)}mm</div>
          <div className="text-sm text-gray-600">
            {weatherData.precipitation.precip_probability.toFixed(1)}% chance
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <Wind className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{weatherData.wind_speed.average.toFixed(1)} m/s</div>
          <div className="text-sm text-gray-600">Wind Speed</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <Eye className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{weatherData.confidence_score.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">
            {weatherData.data_summary.data_quality} data
          </div>
        </div>
      </div>

      {/* Weather Chart */}
      <WeatherChart weatherData={weatherData} />

      {/* Data Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">Data Analysis Summary</h4>
        <div className="text-sm text-gray-600">
          <p>Records analyzed: {weatherData.data_summary.total_records}</p>
          <p>Data quality: {weatherData.data_summary.data_quality}</p>
          <p>Confidence level: {weatherData.confidence_score.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherPrediction;
