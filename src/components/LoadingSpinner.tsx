import { CloudRain } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="bg-white rounded-lg shadow-md p-12 w-full max-w-md flex flex-col items-center justify-center space-y-4">
      <CloudRain className="w-16 h-16 text-blue-600 animate-bounce" />
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Checking the Weather
        </h3>
        <p className="text-gray-600">
          Analyzing weather patterns...
        </p>
      </div>
      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full animate-progress" />
      </div>
    </div>
  );
}
