import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { motion } from "motion/react";
import { TemperatureUnit } from "../backend";
import type { SavedCity } from "../backend";
import type { WeatherData } from "../hooks/useQueries";
import {
  degreesToCompass,
  formatTemp,
  getWeatherInfo,
  metersToKm,
} from "../utils/weather";
import { MetricCard } from "./MetricCard";
import { WeatherSkeleton } from "./WeatherSkeleton";

interface CurrentWeatherProps {
  weatherData: WeatherData | undefined;
  isLoading: boolean;
  isError: boolean;
  unit: TemperatureUnit;
  cityName: string;
  cityCountry: string;
  cityRegion?: string;
  savedCities: SavedCity[];
  currentCityId: string | null;
  onSave: () => void;
  onRemove: () => void;
  isSaving: boolean;
}

export function CurrentWeather({
  weatherData,
  isLoading,
  isError,
  unit,
  cityName,
  cityCountry,
  cityRegion,
  savedCities,
  currentCityId,
  onSave,
  onRemove,
  isSaving,
}: CurrentWeatherProps) {
  const isSaved = currentCityId
    ? savedCities.some((c) => c.id === currentCityId)
    : false;

  if (isLoading) return <WeatherSkeleton />;

  if (isError || !weatherData) {
    return (
      <div
        data-ocid="weather.error_state"
        className="glass-card rounded-2xl p-12 text-center space-y-4"
      >
        <div className="text-4xl">⚠️</div>
        <h3 className="text-xl font-semibold text-foreground">
          Couldn't load weather
        </h3>
        <p className="text-muted-foreground text-sm">
          Weather data is temporarily unavailable. Please try again.
        </p>
      </div>
    );
  }

  const c = weatherData.current;
  const info = getWeatherInfo(c.weather_code);
  const dailyToday = weatherData.daily;
  const todayHigh = dailyToday.temperature_2m_max[0];
  const todayLow = dailyToday.temperature_2m_min[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Hero card — weather gradient bleeds through the semi-transparent glass */}
      <div className={`relative rounded-2xl overflow-hidden ${info.bgClass}`}>
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* City + temp */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="space-y-2"
            >
              <div className="flex items-start gap-3">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-foreground leading-tight">
                    {cityName}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1 tracking-wide">
                    {cityRegion ? `${cityRegion}, ` : ""}
                    {cityCountry}
                  </p>
                </div>
                <Button
                  data-ocid="weather.save_button"
                  variant="ghost"
                  size="icon"
                  onClick={isSaved ? onRemove : onSave}
                  disabled={isSaving}
                  className="ml-auto mt-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                  title={isSaved ? "Remove from saved" : "Save city"}
                >
                  {isSaved ? (
                    <BookmarkCheck className="h-5 w-5 text-primary" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </Button>
              </div>

              {/* Temperature — hero data, maximum visual weight */}
              <div className="flex items-end gap-0 mt-5">
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.2,
                    duration: 0.45,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  className="font-bold font-display leading-none text-foreground temp-glow"
                  style={{ fontSize: "clamp(4.5rem, 12vw, 7.5rem)" }}
                >
                  {formatTemp(c.temperature_2m, unit).replace(/°[CF]$/, "")}
                </motion.div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.3 }}
                  className="font-display font-light text-primary/70 mb-2 ml-1"
                  style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
                >
                  °{unit === TemperatureUnit.fahrenheit ? "F" : "C"}
                </motion.span>
              </div>

              {/* Secondary weather info — clear two-tier hierarchy */}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm font-medium text-foreground/75">
                  Feels {formatTemp(c.apparent_temperature, unit)}
                </span>
                <span className="w-px h-3.5 bg-border/60 shrink-0" />
                <span className="text-sm text-muted-foreground">
                  <span className="text-foreground/60 font-medium">H</span>{" "}
                  {formatTemp(todayHigh, unit)}
                  <span className="mx-1.5 text-border">·</span>
                  <span className="text-foreground/60 font-medium">L</span>{" "}
                  {formatTemp(todayLow, unit)}
                </span>
              </div>
            </motion.div>

            {/* Weather icon + label */}
            <motion.div
              initial={{ opacity: 0, scale: 0.75, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                delay: 0.18,
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="flex flex-col items-center md:items-end gap-2.5"
            >
              <span
                className="leading-none select-none drop-shadow-2xl"
                style={{ fontSize: "clamp(4rem, 10vw, 6rem)" }}
                role="img"
                aria-label={info.label}
              >
                {info.emoji}
              </span>
              <span className="text-sm font-semibold text-foreground/70 tracking-wide">
                {info.label}
              </span>
            </motion.div>
          </div>

          {/* Metrics grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8"
          >
            <MetricCard
              icon="💧"
              label="Humidity"
              value={`${c.relative_humidity_2m}%`}
            />
            <MetricCard
              icon="💨"
              label="Wind"
              value={`${Math.round(c.wind_speed_10m)} km/h`}
              sub={degreesToCompass(c.wind_direction_10m)}
            />
            <MetricCard
              icon="🌞"
              label="UV Index"
              value={c.uv_index.toFixed(1)}
              sub={
                c.uv_index <= 2
                  ? "Low"
                  : c.uv_index <= 5
                    ? "Moderate"
                    : c.uv_index <= 7
                      ? "High"
                      : "Very High"
              }
            />
            <MetricCard
              icon="👁️"
              label="Visibility"
              value={metersToKm(c.visibility)}
            />
            <MetricCard
              icon="🌧️"
              label="Precipitation"
              value={`${c.precipitation.toFixed(1)} mm`}
            />
            <MetricCard
              icon="🕐"
              label="Updated"
              value={new Date(c.time).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
