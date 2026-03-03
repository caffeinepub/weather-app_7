import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TemperatureUnit } from "../backend";
import type { SavedCity } from "../backend";
import { useActor } from "./useActor";

export interface WeatherData {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    weather_code: number;
    uv_index: number;
    visibility: number;
    precipitation: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_probability_max: number[];
  };
}

export interface SearchResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export function useSavedCities() {
  const { actor, isFetching } = useActor();
  return useQuery<SavedCity[]>({
    queryKey: ["saved-cities"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSavedCities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUnit() {
  const { actor, isFetching } = useActor();
  return useQuery<TemperatureUnit>({
    queryKey: ["unit"],
    queryFn: async () => {
      if (!actor) return TemperatureUnit.celsius;
      return actor.getUnit();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWeather(lat: number | null, lon: number | null) {
  const { actor, isFetching } = useActor();
  return useQuery<WeatherData>({
    queryKey: ["weather", lat, lon],
    queryFn: async () => {
      if (!actor || lat === null || lon === null)
        throw new Error("No location");
      const raw = await actor.getWeather(lat, lon);
      return JSON.parse(raw) as WeatherData;
    },
    enabled: !!actor && !isFetching && lat !== null && lon !== null,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useSearchCity(query: string) {
  const { actor, isFetching } = useActor();
  return useQuery<SearchResult[]>({
    queryKey: ["search", query],
    queryFn: async () => {
      if (!actor || !query.trim()) return [];
      const raw = await actor.searchCity(query.trim());
      const parsed = JSON.parse(raw) as { results?: SearchResult[] };
      return parsed.results ?? [];
    },
    enabled: !!actor && !isFetching && query.trim().length >= 2,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSaveCity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (city: {
      id: string;
      name: string;
      country: string;
      lat: number;
      lon: number;
      admin1: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.saveCity(
        city.id,
        city.name,
        city.country,
        city.lat,
        city.lon,
        city.admin1,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-cities"] });
    },
  });
}

export function useRemoveSavedCity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      await actor.removeSavedCity(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-cities"] });
    },
  });
}

export function useSetUnit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (unit: TemperatureUnit) => {
      if (!actor) throw new Error("No actor");
      await actor.setUnit(unit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unit"] });
    },
  });
}
