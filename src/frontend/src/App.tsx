import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { ChevronLeft, ChevronRight, CloudSun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { TemperatureUnit } from "./backend";
import type { SavedCity } from "./backend";
import {
  useRemoveSavedCity,
  useSaveCity,
  useSavedCities,
  useSetUnit,
  useUnit,
  useWeather,
} from "./hooks/useQueries";
import type { SearchResult } from "./hooks/useQueries";

import { CurrentWeather } from "./components/CurrentWeather";
import { DailyForecast } from "./components/DailyForecast";
import { HourlyForecast } from "./components/HourlyForecast";
import { SavedCities } from "./components/SavedCities";
import { SearchBar } from "./components/SearchBar";
import { WeatherSkeleton } from "./components/WeatherSkeleton";

// Default city: London
const DEFAULT_CITY = {
  id: "2643743",
  name: "London",
  country: "United Kingdom",
  admin1: "England",
  lat: 51.50853,
  lon: -0.12574,
};

interface ActiveCity {
  id: string;
  name: string;
  country: string;
  admin1?: string;
  lat: number;
  lon: number;
}

export default function App() {
  const [activeCity, setActiveCity] = useState<ActiveCity>(DEFAULT_CITY);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const { data: savedCities = [], isLoading: citiesLoading } = useSavedCities();
  const { data: unit = TemperatureUnit.celsius } = useUnit();
  const {
    data: weatherData,
    isLoading: weatherLoading,
    isError: weatherError,
  } = useWeather(activeCity.lat, activeCity.lon);

  const saveCity = useSaveCity();
  const removeCity = useRemoveSavedCity();
  const setUnit = useSetUnit();

  useEffect(() => {
    if (!weatherLoading) setHasLoaded(true);
  }, [weatherLoading]);

  function handleSelectCity(result: SearchResult) {
    setActiveCity({
      id: String(result.id),
      name: result.name,
      country: result.country,
      admin1: result.admin1,
      lat: result.latitude,
      lon: result.longitude,
    });
  }

  function handleSelectSavedCity(city: SavedCity) {
    setActiveCity({
      id: city.id,
      name: city.name,
      country: city.country,
      admin1: city.admin1,
      lat: city.lat,
      lon: city.lon,
    });
    // On mobile, close sidebar after selecting
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }

  async function handleSave() {
    try {
      await saveCity.mutateAsync({
        id: activeCity.id,
        name: activeCity.name,
        country: activeCity.country,
        lat: activeCity.lat,
        lon: activeCity.lon,
        admin1: activeCity.admin1 ?? null,
      });
      toast.success(`${activeCity.name} saved to favorites`);
    } catch {
      toast.error("Failed to save city");
    }
  }

  async function handleRemove() {
    try {
      await removeCity.mutateAsync(activeCity.id);
      toast.success(`${activeCity.name} removed from favorites`);
    } catch {
      toast.error("Failed to remove city");
    }
  }

  async function handleRemoveSaved(id: string) {
    setRemovingId(id);
    try {
      await removeCity.mutateAsync(id);
      const city = savedCities.find((c) => c.id === id);
      if (city) toast.success(`${city.name} removed`);
    } catch {
      toast.error("Failed to remove city");
    } finally {
      setRemovingId(null);
    }
  }

  async function handleToggleUnit() {
    const newUnit =
      unit === TemperatureUnit.celsius
        ? TemperatureUnit.fahrenheit
        : TemperatureUnit.celsius;
    try {
      await setUnit.mutateAsync(newUnit);
    } catch {
      toast.error("Failed to update unit preference");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      {/* Ambient background atmosphere — two soft orbs for depth */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Top-left cool blue haze */}
        <div
          className="absolute -top-[20%] -left-[15%] w-[70vw] h-[70vw] rounded-full blur-[96px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.52 0.18 228 / 0.18) 0%, transparent 65%)",
          }}
        />
        {/* Bottom-right deep violet bloom */}
        <div
          className="absolute -bottom-[20%] -right-[10%] w-[55vw] h-[55vw] rounded-full blur-[80px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.38 0.14 268 / 0.16) 0%, transparent 65%)",
          }}
        />
        {/* Center subtle sky wash */}
        <div
          className="absolute top-[15%] left-[35%] w-[45vw] h-[40vw] rounded-full blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.45 0.10 240 / 0.08) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Header ────────────────────────────────────────── */}
      <header className="relative z-20 border-b border-border/40 glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-glow-sm">
              <CloudSun className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold font-display text-foreground hidden sm:block">
              Atmosfera
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm mx-4">
            <SearchBar
              onSelectCity={handleSelectCity}
              placeholder="Search any city…"
              inputOcid="search.search_input"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Unit toggle */}
            <Button
              data-ocid="weather.unit_toggle"
              variant="outline"
              size="sm"
              onClick={handleToggleUnit}
              disabled={setUnit.isPending}
              className="font-bold tracking-wider border-border/50 bg-secondary/60 hover:bg-secondary text-foreground text-sm px-3 h-8"
            >
              {unit === TemperatureUnit.celsius ? "°C" : "°F"}
            </Button>

            {/* Sidebar toggle (mobile) */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8 text-muted-foreground"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle saved cities"
            >
              <ChevronLeft
                className={`h-4 w-4 transition-transform ${sidebarOpen ? "rotate-180" : ""}`}
              />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main layout ──────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-4">
          {/* City title bar */}
          <motion.div
            key={activeCity.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <span>Showing weather for</span>
            <span className="font-semibold text-foreground">
              {activeCity.name}
            </span>
            {activeCity.admin1 && <span>· {activeCity.admin1}</span>}
            <span>· {activeCity.country}</span>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCity.id}-${unit}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {!hasLoaded && weatherLoading ? (
                <WeatherSkeleton />
              ) : (
                <div className="space-y-4">
                  <CurrentWeather
                    weatherData={weatherData}
                    isLoading={weatherLoading}
                    isError={weatherError}
                    unit={unit}
                    cityName={activeCity.name}
                    cityCountry={activeCity.country}
                    cityRegion={activeCity.admin1}
                    savedCities={savedCities}
                    currentCityId={activeCity.id}
                    onSave={handleSave}
                    onRemove={handleRemove}
                    isSaving={saveCity.isPending || removeCity.isPending}
                  />

                  {weatherData && !weatherError && (
                    <>
                      <HourlyForecast weatherData={weatherData} unit={unit} />
                      <DailyForecast weatherData={weatherData} unit={unit} />
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Sidebar ────────────────────────────────────── */}
        <AnimatePresence>
          {(sidebarOpen || true) && (
            <motion.aside
              initial={false}
              className={`
                shrink-0 w-72
                hidden lg:block
              `}
            >
              <div className="glass-card rounded-2xl p-4 shadow-glass sticky top-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground font-display tracking-wide">
                    Saved Cities
                  </h3>
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    {savedCities.length}
                  </span>
                </div>

                {citiesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="shimmer h-14 rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <SavedCities
                    cities={savedCities}
                    unit={unit}
                    activeCityId={activeCity.id}
                    onSelectCity={handleSelectSavedCity}
                    onRemoveCity={handleRemoveSaved}
                    removingId={removingId}
                  />
                )}

                <div className="pt-2 border-t border-border/30">
                  <p className="text-xs text-muted-foreground text-center">
                    Search and bookmark cities to save them here
                  </p>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-40 w-80 lg:hidden"
            >
              <div className="glass-card h-full p-4 pt-20 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground font-display tracking-wide">
                    Saved Cities
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {citiesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="shimmer h-14 rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <SavedCities
                    cities={savedCities}
                    unit={unit}
                    activeCityId={activeCity.id}
                    onSelectCity={handleSelectSavedCity}
                    onRemoveCity={handleRemoveSaved}
                    removingId={removingId}
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 mt-8 py-5 px-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <span className="text-muted-foreground/70">
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </span>
        </p>
      </footer>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.16 0.04 258)",
            border: "1px solid oklch(0.35 0.08 255 / 0.35)",
            color: "oklch(0.95 0.01 240)",
          },
        }}
      />
    </div>
  );
}
