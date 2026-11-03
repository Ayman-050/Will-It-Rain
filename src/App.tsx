import { useState } from "react";
import { Umbrella } from "lucide-react";
import LocationInput from "./components/LocationInput";
import DatePicker from "./components/DatePicker";
import ResultsCard from "./components/ResultsCard";
import LoadingSpinner from "./components/LoadingSpinner";
import WeatherPrediction from "./components/WeatherPrediction";
import Intro from "./components/Intro";
import HeroSection from "./components/HeroSection";
import { ForecastResult, RiskLevel } from "./types";
import Map from "./components/Map";
import { predict, type Prediction } from "./model/predict";
import "./App.css"; 
import Footer from "./components/Footer";
import WhyUs from "./components/WhyUs";

const toFahrenheit = (c: number) => Math.round((c * 9) / 5 + 32);

// Turn the model's prediction into the simple risk summary shown on the results card
const toForecastResult = (prediction: Prediction): ForecastResult => {
  const rainPercent = Math.round(prediction.rainChance * 100);
  const rainLevel: RiskLevel = rainPercent < 30 ? 'low' : rainPercent < 60 ? 'medium' : 'high';
  const tempMaxF = toFahrenheit(prediction.tmax);
  const heatLevel: RiskLevel = tempMaxF < 80 ? 'low' : tempMaxF < 95 ? 'medium' : 'high';
  const color = { low: 'green', medium: 'yellow', high: 'red' };

  return {
    location: {
      latitude: prediction.lat,
      longitude: prediction.lon
    },
    date: prediction.isoDate,
    rainRisk: {
      probability: rainPercent,
      level: rainLevel,
      color: color[rainLevel],
      emoji: rainLevel === 'low' ? '☀️' : rainLevel === 'medium' ? '⛅' : '🌧️'
    },
    heatRisk: {
      temperatureMax: tempMaxF,
      temperatureMin: toFahrenheit(prediction.tmin),
      temperatureMaxC: Math.round(prediction.tmax),
      temperatureMinC: Math.round(prediction.tmin),
      level: heatLevel,
      color: color[heatLevel],
      emoji: heatLevel === 'low' ? '😊' : heatLevel === 'medium' ? '🌡️' : '🔥'
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
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string>(""); 

  const handleLocationSelect = (
    lat: number,
    lon: number,
    cityName?: string
  ) => {
    setLocation({ lat, lon, name: cityName });
    setManualLat(lat.toString());
    setManualLon(lon.toString());
    setPrediction(null);
    setError("");
  };

  // Called when user clicks on map
  const handleMapSelect = (lat: number, lon: number) => {
    setLocation({ lat, lon });
    setManualLat(lat.toString());
    setManualLon(lon.toString());
    setPrediction(null);
    setError("");
  };

  const handleDateSelect = (selectedDate: string) => {
    setDate(selectedDate);
    setPrediction(null);
    setError("");
  };

  const handleGetForecast = async () => {
    if (!location || !date) return;

    setIsLoading(true);
    setError("");
    setPrediction(null);

    try {
      setPrediction(await predict(location.lat, location.lon, date));
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

        <div className="flex flex-col items-center gap-8">
          {isLoading ? (
            <LoadingSpinner />
          ) : prediction ? (
            <>
              <ResultsCard result={toForecastResult(prediction)} cityName={location?.name} />
              <div className="w-full max-w-4xl">
                <WeatherPrediction prediction={prediction} />
              </div>
            </>
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


