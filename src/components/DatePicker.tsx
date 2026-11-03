import { useState } from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  onDateSelect: (date: string) => void;
  disabled?: boolean;
}

export default function DatePicker({ onDateSelect, disabled }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    onDateSelect(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Date</h2>
      </div>

      <div className="space-y-3">
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700"
        />
        <p className="text-sm text-gray-500">
          Select any date
        </p>
      </div>
    </div>
  );
}
