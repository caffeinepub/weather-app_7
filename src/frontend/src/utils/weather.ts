import { TemperatureUnit } from "../backend";

export interface WeatherInfo {
  emoji: string;
  label: string;
  bgClass: string;
}

export function getWeatherInfo(code: number): WeatherInfo {
  if (code === 0)
    return { emoji: "☀️", label: "Clear Sky", bgClass: "weather-bg-clear" };
  if (code === 1)
    return { emoji: "🌤️", label: "Mainly Clear", bgClass: "weather-bg-clear" };
  if (code === 2)
    return {
      emoji: "⛅",
      label: "Partly Cloudy",
      bgClass: "weather-bg-cloudy",
    };
  if (code === 3)
    return { emoji: "☁️", label: "Overcast", bgClass: "weather-bg-cloudy" };
  if (code === 45 || code === 48)
    return { emoji: "🌫️", label: "Fog", bgClass: "weather-bg-fog" };
  if (code === 51 || code === 53 || code === 55)
    return { emoji: "🌦️", label: "Drizzle", bgClass: "weather-bg-rain" };
  if (code === 61 || code === 63 || code === 65)
    return { emoji: "🌧️", label: "Rain", bgClass: "weather-bg-rain" };
  if (code === 71 || code === 73 || code === 75 || code === 77)
    return { emoji: "🌨️", label: "Snow", bgClass: "weather-bg-snow" };
  if (code === 80 || code === 81 || code === 82)
    return { emoji: "🌦️", label: "Rain Showers", bgClass: "weather-bg-rain" };
  if (code === 85 || code === 86)
    return { emoji: "🌨️", label: "Snow Showers", bgClass: "weather-bg-snow" };
  if (code === 95)
    return { emoji: "⛈️", label: "Thunderstorm", bgClass: "weather-bg-storm" };
  if (code === 96 || code === 99)
    return {
      emoji: "⛈️",
      label: "Thunderstorm w/ Hail",
      bgClass: "weather-bg-storm",
    };
  return { emoji: "🌡️", label: "Unknown", bgClass: "weather-bg-cloudy" };
}

export function convertTemp(celsius: number, unit: TemperatureUnit): number {
  if (unit === TemperatureUnit.fahrenheit) {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export function formatTemp(celsius: number, unit: TemperatureUnit): string {
  return `${convertTemp(celsius, unit)}°${unit === TemperatureUnit.fahrenheit ? "F" : "C"}`;
}

export function degreesToCompass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

export function metersToKm(meters: number): string {
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatHour(isoTime: string): string {
  const date = new Date(isoTime);
  const h = date.getHours();
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export function formatDay(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${isoDate}T12:00:00`);
  d.setHours(0, 0, 0, 0);
  const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function getCurrentHourIndex(times: string[]): number {
  const now = new Date();
  const currentHour = now.toISOString().slice(0, 13); // "2024-01-15T14"
  const idx = times.findIndex((t) => t.slice(0, 13) === currentHour);
  return idx >= 0 ? idx : 0;
}
