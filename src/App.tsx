import { useState } from "react";
import { Umbrella } from "lucide-react";
import LocationInput from "./components/LocationInput";
import DatePicker from "./components/DatePicker";
import ResultsCard from "./components/ResultsCard";
import LoadingSpinner from "./components/LoadingSpinner";
import WeatherPrediction from "./components/WeatherPrediction";
import Intro from "./components/Intro";
import HeroSection from "./components/HeroSection";
import { ForecastResult } from "./types";
import Map from "./components/Map";
import axios from "axios";
import "./App.css"; 
import Footer from "./components/Footer";
import WhyUs from "./components/WhyUs";

// Transform NASA POWER API data to ForecastResult format
const transformNASADataToForecastResult = (nasaData: any, location: { lat: number; lon: number }, date: string): ForecastResult => {
  const parameters = nasaData.properties?.parameter || {};
  const temperatureData = parameters.T2M || {};
  const precipitationData = parameters.PRECTOT || {};
  
  // Calculate averages
  const temperatures = Object.values(temperatureData).filter((val: any) => val !== null) as number[];
  const precipitations = Object.values(precipitationData).filter((val: any) => val !== null) as number[];
  
  const avgTemp = temperatures.length > 0 ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length : 20;
  const minTemp = temperatures.length > 0 ? Math.min(...temperatures) : avgTemp - 5;
  const maxTemp = temperatures.length > 0 ? Math.max(...temperatures) : avgTemp + 5;
  const avgPrecipitation = precipitations.length > 0 ? precipitations.reduce((a, b) => a + b, 0) / precipitations.length : 0;
  
  // Convert temperature from Celsius to Fahrenheit
  const tempMaxF = (maxTemp * 9/5) + 32;
  const tempMinF = (minTemp * 9/5) + 32;
  
  // Determine rain risk
  const rainProbability = Math.min(90, avgPrecipitation * 100);
  const rainLevel = rainProbability < 30 ? 'low' : rainProbability < 70 ? 'medium' : 'high';
  const rainColor = rainLevel === 'low' ? 'green' : rainLevel === 'medium' ? 'yellow' : 'red';
  const rainEmoji = rainLevel === 'low' ? '☀️' : rainLevel === 'medium' ? '⛅' : '🌧️';
  
  // Determine heat risk
  const heatLevel = tempMaxF < 80 ? 'low' : tempMaxF < 95 ? 'medium' : 'high';
  const heatColor = heatLevel === 'low' ? 'blue' : heatLevel === 'medium' ? 'orange' : 'red';
  const heatEmoji = heatLevel === 'low' ? '❄️' : heatLevel === 'medium' ? '🌡️' : '🔥';
  
  return {
    location: {
      latitude: location.lat,
      longitude: location.lon
    },
    date: date,
    rainRisk: {
      probability: Math.round(rainProbability),
      level: rainLevel as 'low' | 'medium' | 'high',
      color: rainColor,
      emoji: rainEmoji
    },
    heatRisk: {
      temperatureMax: Math.round(tempMaxF),
      temperatureMin: Math.round(tempMinF),
      temperatureMaxC: Math.round(maxTemp),
      temperatureMinC: Math.round(minTemp),
      level: heatLevel as 'low' | 'medium' | 'high',
      color: heatColor,
      emoji: heatEmoji
    }
  };
};

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [location, setLocation] = useState<{
    lat: number;
    lon: number;
    name?: string;
  } | null>(null);
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");
  const [date, setDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [error, setError] = useState<string>(""); 

  const handleLocationSelect = (
    lat: number,
    lon: number,
    cityName?: string
  ) => {
    setLocation({ lat, lon, name: cityName });
    setManualLat(lat.toString());
    setManualLon(lon.toString());
    setResult(null);
    setError("");
  };

  // Called when user clicks on map
  const handleMapSelect = (lat: number, lon: number) => {
    setLocation({ lat, lon });
    setManualLat(lat.toString());
    setManualLon(lon.toString());
  };

  const handleDateSelect = (selectedDate: string) => {
    setDate(selectedDate);
    setResult(null);
    setError("");
  };

  
  const handleGetForecast = async () => {
    if (!location || !date) return;

    // Format the user-selected date for NASA API (YYYYMMDD format)
    const formatDateForNASA = (dateString: string): string => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    };

    const formattedDate = formatDateForNASA(date);

    setIsLoading(true);
    setError("");
    setResult(null);
    
    console.log(`https://power.larc.nasa.gov/api/temporal/hourly/point?start=${formattedDate}&end=${formattedDate}&latitude=${location.lat}&longitude=${location.lon}&community=ag&parameters=T2M,RH2M,PRECTOT,WS2M&header=true`)

    try {
      // Use the same parameters as WeatherPrediction for consistency
      const forecast = await axios.get(`https://power.larc.nasa.gov/api/temporal/hourly/point?start=${formattedDate}&end=${formattedDate}&latitude=${location.lat}&longitude=${location.lon}&community=ag&parameters=T2M,RH2M,PRECTOT,WS2M&header=true`);
      console.log(forecast)
      
      // Transform NASA API response to ForecastResult format
      const transformedResult = transformNASADataToForecastResult(forecast.data, location, date);
      setResult(transformedResult);
    
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch forecast. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const canGetForecast = location && date && !isLoading;

  const handleIntroComplete = () => {
    setShowIntro(false);
  };





//   async function getData() {
//     const response = await axios.get(`https://power.larc.nasa.gov/api/temporal/hourly/point?start=20250720&end=20250730&latitude=73.0364&longitude=13.4109&community=ag&parameters=T2M&header=true
// `)
//     setTemperature(response.data)
//     console.log(response.data.properties.parameter.T2M)
//   }

//   useEffect(()=>{
//     getData()
//   }, [])

  return (
    <>
      {showIntro && <Intro onComplete={handleIntroComplete} />}
      
      {/* Hero Section */}
      <HeroSection />

      <WhyUs />
      
      {/* Main App Content */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8">
        
          <header className="header text-center mb-12 mt-20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Umbrella className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Will It Rain On My Parade?
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Check weather risks for your upcoming events. Get rain probability
            and heat risk forecasts to plan your perfect day.
          </p>
        </header>
        

        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl mb-20">
            <LocationInput
              onLocationSelect={handleLocationSelect}
              manualLat={manualLat}
              manualLon={manualLon}
              setManualLat={setManualLat}
              setManualLon={setManualLon}
            />
            <DatePicker onDateSelect={handleDateSelect} disabled={!location} />
          </div>

          <Map
            lat={location?.lat}
            lng={location?.lon}
            onMapSelect={handleMapSelect}
          />

          {/* Weather Prediction Section - Shows when location and date are selected */}
          {location && date && (
            <div className="w-full max-w-4xl">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Weather Prediction</h2>
                <p className="text-gray-600">Powered by NASA POWER API and AI analysis</p>
              </div>
              <WeatherPrediction 
                latitude={location.lat} 
                longitude={location.lon} 
                date={date}
                dateRangeDays={14} // Analyze 7 days before and after the selected date
              />
            </div>
          )}

          {location && date && (
            <button
              onClick={handleGetForecast}
              disabled={!canGetForecast}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              Check Weather Risk
            </button>
          )}
        </div>
        
       

        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          {isLoading ? (
            <LoadingSpinner />
          ) : result ? (
            <ResultsCard result={result} cityName={location?.name} />
          ) : null}
        </div>

        
        


      </div>

      <footer className="text-center py-8 text-gray-600 text-sm">
        <p>Weather data powered by Open-Meteo and NASA POWER</p>
      </footer>
      </div>
          <Footer />

    </>
  );
}

export default App;









// import './App.css'
// import {Routes ,Route} from 'react-router'
// import Login from './pages/Login'
// import Homepage from './pages/Homepage'
// import Signup from './pages/Signup'
// import Navbar from './components/Navbar'
// import ValidateIsLoggedIn from './validators/ValidateIsLoggedIn'
// import ValidateIsLoggedOut from './validators/'

// function App() {


//   return (
//     <>
//       <Navbar/>
//       <Routes>
//         <Route path="/" element={<ValidateIsLoggedIn><Homepage/></ValidateIsLoggedIn>}/>
//         <Route path="/signup" element={<ValidateIsLoggedOut><Signup/></ValidateIsLoggedOut>}/>
//         <Route path="/login" element={<ValidateIsLoggedOut><Login/></ValidateIsLoggedOut>}/>
//       </Routes>
//     </>
//   )
// }

// export default App


