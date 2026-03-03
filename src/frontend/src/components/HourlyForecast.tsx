import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { motion } from "motion/react";
import type { TemperatureUnit } from "../backend";
import type { WeatherData } from "../hooks/useQueries";
import {
  formatHour,
  formatTemp,
  getCurrentHourIndex,
  getWeatherInfo,
} from "../utils/weather";

interface HourlyForecastProps {
  weatherData: WeatherData;
  unit: TemperatureUnit;
}

export function HourlyForecast({ weatherData, unit }: HourlyForecastProps) {
  const { hourly } = weatherData;
  const currentIdx = getCurrentHourIndex(hourly.time);
  // Show next 24 hours from current
  const items = hourly.time.slice(currentIdx, currentIdx + 24);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="glass-card rounded-2xl p-5 shadow-glass"
    >
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
        24-Hour Forecast
      </h3>
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-3">
          {items.map((time, idx) => {
            const absIdx = currentIdx + idx;
            const code = hourly.weather_code[absIdx];
            const temp = hourly.temperature_2m[absIdx];
            const precip = hourly.precipitation_probability[absIdx];
            const info = getWeatherInfo(code);
            const isCurrentHour = idx === 0;

            return (
              <motion.div
                key={time}
                data-ocid={`hourly.item.${idx + 1}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + idx * 0.02, duration: 0.3 }}
                className={`
                  flex flex-col items-center gap-2 shrink-0 rounded-xl p-3 min-w-[64px]
                  transition-all duration-200
                  ${
                    isCurrentHour
                      ? "bg-primary/20 border border-primary/40 shadow-glow-sm"
                      : "glass-card-light hover:bg-muted/60"
                  }
                `}
              >
                <span
                  className={`text-xs font-semibold ${isCurrentHour ? "text-primary" : "text-muted-foreground"}`}
                >
                  {isCurrentHour ? "Now" : formatHour(time)}
                </span>
                <span
                  className="text-xl leading-none"
                  role="img"
                  aria-label={info.label}
                >
                  {info.emoji}
                </span>
                <span className="text-sm font-bold text-foreground font-display">
                  {formatTemp(temp, unit).replace(/°[CF]$/, "")}°
                </span>
                {precip > 0 && (
                  <span className="text-xs text-blue-400 font-medium">
                    {precip}%
                  </span>
                )}
                {precip === 0 && (
                  <span className="text-xs text-transparent">—</span>
                )}
              </motion.div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="opacity-30" />
      </ScrollArea>
    </motion.div>
  );
}
