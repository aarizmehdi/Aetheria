import { WeatherData, WeatherCondition, Coordinates, GeoSearchResult } from '../types';


const mapWeatherCode = (code: number): WeatherCondition => {
  if (code === 0 || code === 1) return WeatherCondition.Clear;
  if (code === 2 || code === 3) return WeatherCondition.Cloudy;
  if (code >= 45 && code <= 48) return WeatherCondition.Fog;
  if (code >= 51 && code <= 57) return WeatherCondition.Drizzle;
  if (code >= 61 && code <= 67) return WeatherCondition.Rain;
  if (code >= 71 && code <= 77) return WeatherCondition.Snow;
  if (code >= 80 && code <= 82) return WeatherCondition.Rain;
  if (code >= 85 && code <= 86) return WeatherCondition.Snow;
  if (code >= 95) return WeatherCondition.Thunderstorm;
  return WeatherCondition.Clear;
};

export const searchCities = async (query: string): Promise<GeoSearchResult[]> => {
  if (query.length < 2) return [];
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Geocoding error:", error);
    return [];
  }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {

    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    const data = await response.json();

    const city = data.city || data.locality || data.principalSubdivision;
    const country = data.countryName;

    if (city && country) return `${city}, ${country}`;
    if (country) return country;
    return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
  } catch (e) {
    console.error("Reverse geocode failed", e);
    return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
  }
};

export const getWeatherData = async (coords: Coordinates): Promise<WeatherData> => {
  const params = new URLSearchParams({
    latitude: coords.lat.toString(),
    longitude: coords.lng.toString(),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '8'
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  const data = await response.json();

  if (!data || !data.current) throw new Error("Failed to fetch weather data");

  const current = data.current;
  const daily = data.daily;
  const condition = mapWeatherCode(current.weather_code);

  const forecast = daily.time.slice(1).map((time: string, index: number) => ({
    day: new Date(time).toLocaleDateString('en-US', { weekday: 'short' }),
    high: Math.round(daily.temperature_2m_max[index + 1]),
    low: Math.round(daily.temperature_2m_min[index + 1]),
    condition: mapWeatherCode(daily.weather_code[index + 1])
  }));

  const desc = `Current conditions are ${condition.toLowerCase()}. Feels like ${Math.round(current.apparent_temperature)}°C.`;

  return {
    location: coords.name || await reverseGeocode(coords.lat, coords.lng),
    temp: Math.round(current.temperature_2m),
    condition: condition,
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
    windDirection: getWindDirection(current.wind_direction_10m),
    pressure: Math.round(current.surface_pressure),
    uvIndex: Math.round(daily.uv_index_max[0] || 0),
    visibility: 10,
    description: desc,
    aqi: 0,
    forecast: forecast,
    lat: data.latitude,
    lng: data.longitude,
    isDay: data.current.is_day === 1,
    utcOffsetSeconds: data.utc_offset_seconds
  };
};

const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % 8];
};

export const getMockCoordinates = (): Coordinates => ({
  lat: 40.7128,
  lng: -74.0060,
  name: "New York, USA",
  country: "USA"
}); 
