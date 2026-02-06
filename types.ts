export interface WeatherData {
  temp: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  uvIndex: number;
  visibility: number;
  location: string;
  description: string;
  forecast: ForecastDay[];
  aqi: number;
  lat: number;
  lng: number;
  isDay: boolean;
  utcOffsetSeconds: number;
}

export interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: WeatherCondition;
}

export enum WeatherCondition {
  Clear = 'Clear',
  Cloudy = 'Cloudy',
  Rain = 'Rain',
  Snow = 'Snow',
  Thunderstorm = 'Thunderstorm',
  Fog = 'Fog',
  Drizzle = 'Drizzle'
}

export interface GeminiInsight {
  outfit: string;
  narrative: string;
  activity: string;
  music: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
  name?: string;
  country?: string;
}

export interface GeoSearchResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}