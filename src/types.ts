export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskData {
  probability?: number;
  temperatureMax?: number;
  temperatureMin?: number;
  temperatureMaxC?: number;
  temperatureMinC?: number;
  level: RiskLevel;
  color: string;
  emoji: string;
}

export interface ForecastResult {
  location: {
    latitude: number;
    longitude: number;
  };
  date: string;
  rainRisk: RiskData;
  heatRisk: RiskData;
}
