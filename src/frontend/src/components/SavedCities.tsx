import { Button } from "@/components/ui/button";
import { Loader2, MapPin, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { SavedCity } from "../backend";
import type { TemperatureUnit } from "../backend";
import { useActor } from "../hooks/useActor";
import { useWeather } from "../hooks/useQueries";
import { formatTemp, getWeatherInfo } from "../utils/weather";

interface SavedCityItemProps {
  city: SavedCity;
  index: number;
  unit: TemperatureUnit;
  isActive: boolean;
  onSelect: () => void;
  onRemove: () => void;
  isRemoving: boolean;
}

function SavedCityItem({
  city,
  index,
  unit,
  isActive,
  onSelect,
  onRemove,
  isRemoving,
}: SavedCityItemProps) {
  const { actor, isFetching } = useActor();
  const { data: weather, isLoading } = useWeather(
    actor && !isFetching ? city.lat : null,
    actor && !isFetching ? city.lon : null,
  );

  const currentTemp = weather?.current.temperature_2m;
  const code = weather?.current.weather_code ?? 1;
  const info = getWeatherInfo(code);

  return (
    <motion.div
      data-ocid={`saved.item.${index}`}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      className={`
        group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
        transition-all duration-150
        ${
          isActive
            ? "bg-primary/20 border border-primary/30"
            : "glass-card-light hover:bg-muted/50"
        }
      `}
      onClick={onSelect}
    >
      <MapPin
        className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate ${isActive ? "text-primary" : "text-foreground"}`}
        >
          {city.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {city.admin1 ? `${city.admin1}, ` : ""}
          {city.country}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : currentTemp !== undefined ? (
          <>
            <span className="text-base leading-none">{info.emoji}</span>
            <span className="text-sm font-bold text-foreground font-display">
              {formatTemp(currentTemp, unit).replace(/°[CF]$/, "")}°
            </span>
          </>
        ) : null}
        <Button
          data-ocid={`saved.delete_button.${index}`}
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          disabled={isRemoving}
        >
          {isRemoving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <X className="h-3 w-3" />
          )}
        </Button>
      </div>
    </motion.div>
  );
}

interface SavedCitiesProps {
  cities: SavedCity[];
  unit: TemperatureUnit;
  activeCityId: string | null;
  onSelectCity: (city: SavedCity) => void;
  onRemoveCity: (id: string) => void;
  removingId: string | null;
}

export function SavedCities({
  cities,
  unit,
  activeCityId,
  onSelectCity,
  onRemoveCity,
  removingId,
}: SavedCitiesProps) {
  if (cities.length === 0) {
    return (
      <div
        data-ocid="saved.empty_state"
        className="text-center py-8 px-4 space-y-2"
      >
        <div className="text-3xl">📍</div>
        <p className="text-sm text-muted-foreground">
          No saved cities yet.
          <br />
          Search and save a city to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <AnimatePresence mode="popLayout">
        {cities.map((city, idx) => (
          <SavedCityItem
            key={city.id}
            city={city}
            index={idx + 1}
            unit={unit}
            isActive={activeCityId === city.id}
            onSelect={() => onSelectCity(city)}
            onRemove={() => onRemoveCity(city.id)}
            isRemoving={removingId === city.id}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
