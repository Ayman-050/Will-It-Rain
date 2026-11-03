import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
  color: string;
}

const colorClasses = {
  green: 'bg-green-100 text-green-800 border-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  red: 'bg-red-100 text-red-800 border-red-300',
};

const levelText = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
};

export default function RiskBadge({ level, color }: RiskBadgeProps) {
  const colorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.green;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClass}`}
    >
      {levelText[level]}
    </span>
  );
}
