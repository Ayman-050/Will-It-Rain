import { useState, useEffect } from 'react';
import { Cloud, Droplets, Thermometer, Wind, MapPin, Calendar } from 'lucide-react';
import './'

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setIsVisible(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });

  const weatherCards = [
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "RAIN PROBABILITY",
      value: "Rain Probability Calculation",
      status: "Nasa API (POWER)",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      icon: <Thermometer className="w-6 h-6" />,
      title: "TEMPERATURE",
      value: "Heat Risk Prediction",
      status: "Nasa API (POWER)",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      icon: <Wind className="w-6 h-6" />,
      title: "WIND SPEED",
      value: "Wind Speed Measurements",
      status: "Nasa API (POWER)",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20"
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-green-500/5 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Status bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center px-6 py-4">
        <div className="text-white font-bold text-lg">
          {formatTime(currentTime)}
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-100"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-200"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        {/* Hero title */}
        <div 
          className={`text-center mb-12 transition-all duration-1000 ease-out
            ${isVisible ? 'opacity-100 translate-y-0 animate-fade-in-up' : 'opacity-0 translate-y-8'}
          `}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-sm border border-blue-500/30 animate-bounce-slow">
              <Droplets className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight animate-fade-in-up">
              BAROONAUTS
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Advanced weather intelligence for your events. 
            <span className="text-blue-400"> Predict, plan, and protect.</span>
          </p>
        </div>

        {/* Weather cards grid */}
        <div 
          className={`grid md:grid-cols-3 gap-6 w-full max-w-6xl mb-12
            ${isVisible ? 'animate-stagger-fade-in' : 'opacity-0'}
          `}
        >
          {weatherCards.map((card, index) => (
            <div
              key={index}
              className={`group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${card.borderColor}
                ${isVisible ? `animate-fade-in-up delay-[${index * 200}ms]` : 'opacity-0 translate-y-8'}
              `}
            >
              {/* Card glow effect */}
              <div className={`absolute inset-0 rounded-2xl ${card.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${card.bgColor} ${card.borderColor} border`}>
                    {card.icon}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${card.color.replace('text-', 'bg-')} animate-pulse`}></div>
                </div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                  {card.title}
                </h3>
                <div className="text-3xl font-bold text-white mb-2">
                  {card.value}
                </div>
                <p className={`text-sm font-medium ${card.color}`}>
                  {card.status}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action cards */}
        <div 
          className={`grid md:grid-cols-2 gap-6 w-full max-w-4xl
            ${isVisible ? 'animate-stagger-fade-in delay-500' : 'opacity-0'}
          `}
        >
          <div className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl border border-green-500/30 animate-bounce-slow">
                <MapPin className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">LOCATION</h3>
                <p className="text-sm text-gray-400">Select your event location</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Choose from our interactive map or enter coordinates manually for precise weather analysis.
            </p>
          </div>
          <div className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 animate-fade-in-up delay-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30 animate-bounce-slow">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">DATE</h3>
                <p className="text-sm text-gray-400">Pick your event date</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Get detailed weather forecasts and risk assessments for your specific date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
