import { motion } from "motion/react";
import type { TemperatureUnit } from "../backend";
import type { WeatherData } from "../hooks/useQueries";
import { formatDay, formatTemp, getWeatherInfo } from "../utils/weather";

interface DailyForecastProps {
  weatherData: WeatherData;
  unit: TemperatureUnit;
}

export function DailyForecast({ weatherData, unit }: DailyForecastProps) {
  const { daily } = weatherData;
  const maxTemp = Math.max(...daily.temperature_2m_max);
  const minTemp = Math.min(...daily.temperature_2m_min);
  const range = maxTemp - minTemp || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="glass-card rounded-2xl p-5 shadow-glass"
    >
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
        7-Day Forecast
      </h3>
      <div className="space-y-1">
        {daily.time.map((date, idx) => {
          const code = daily.weather_code[idx];
          const high = daily.temperature_2m_max[idx];
          const low = daily.temperature_2m_min[idx];
          const precip = daily.precipitation_probability_max[idx];
          const info = getWeatherInfo(code);
          const isToday = idx === 0;

          // Temperature range bar positioning
          const barStart = ((low - minTemp) / range) * 100;
          const barWidth = ((high - low) / range) * 100;

          return (
            <motion.div
              key={date}
              data-ocid={`daily.item.${idx + 1}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.52 + idx * 0.04, duration: 0.3 }}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-colors duration-150
                ${isToday ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/40"}
              `}
            >
              {/* Day */}
              <span
                className={`text-sm font-semibold w-16 ${isToday ? "text-primary" : "text-foreground"}`}
              >
                {formatDay(date)}
              </span>

              {/* Icon */}
              <span
                className="text-lg leading-none w-8 text-center"
                role="img"
                aria-label={info.label}
              >
                {info.emoji}
              </span>

              {/* Condition */}
              <span className="text-xs text-muted-foreground hidden sm:block w-24 truncate">
                {info.label}
              </span>

              {/* Precip */}
              {precip > 0 ? (
                <span className="text-xs text-blue-400 w-10 text-right font-medium">
                  {precip}%
                </span>
              ) : (
                <span className="text-xs text-transparent w-10">—</span>
              )}

              {/* Temp range bar */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs text-muted-foreground w-12 text-right shrink-0">
                  {formatTemp(low, unit).replace(/°[CF]$/, "")}°
                </span>
                <div className="relative flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      delay: 0.6 + idx * 0.06,
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                    style={{
                      position: "absolute",
                      left: `${barStart}%`,
                      width: `${Math.max(barWidth, 8)}%`,
                      top: 0,
                      bottom: 0,
                      transformOrigin: "left",
                    }}
                    className="rounded-full bg-gradient-to-r from-blue-500 to-amber-400"
                  />
                </div>
                <span className="text-xs font-semibold text-foreground w-12 shrink-0">
                  {formatTemp(high, unit).replace(/°[CF]$/, "")}°
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
