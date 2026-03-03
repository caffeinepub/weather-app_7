# Weather App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- A weather app with current conditions, hourly forecast, and 7-day forecast
- City search functionality to look up weather by location name
- Display of key weather metrics: temperature, feels-like, humidity, wind speed, UV index, visibility
- Weather condition icons and descriptive labels (sunny, cloudy, rainy, etc.)
- Background/theme that adapts to current weather condition and time of day
- Saved/recent cities for quick access
- Unit toggle between Celsius and Fahrenheit

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend (Motoko)
- Store user preferences: temperature unit (C/F), saved cities list
- Store recent search history (up to 5 cities)
- Use HTTP outcalls to fetch weather data from Open-Meteo API (free, no API key required)
  - Current weather: temperature, apparent temperature, humidity, wind speed, wind direction, weather code, UV index, visibility, precipitation
  - Hourly forecast: next 24 hours
  - Daily forecast: next 7 days (high/low, weather code, precipitation probability)
- Geocoding via Open-Meteo's geocoding API to resolve city names to lat/lon
- Backend functions:
  - `searchCity(name: Text)` - returns list of matching city results
  - `getWeather(lat: Float, lon: Float)` - returns full weather data object
  - `saveCity(city: CityRecord)` - saves a city to favorites
  - `getSavedCities()` - returns saved cities
  - `removeSavedCity(id: Text)` - removes a city from saved
  - `setUnit(unit: Text)` - saves temperature unit preference
  - `getUnit()` - returns current unit preference

### Frontend (React)
- Main layout: large current weather card at top, hourly scroll below, 7-day forecast grid
- Search bar with autocomplete city results
- Weather condition-based dynamic background gradient
- Metric cards for humidity, wind, UV index, feels-like, visibility, precipitation
- Saved cities sidebar/list for quick switching
- Unit toggle (C/F) in header
- Responsive design for mobile and desktop
- Skeleton loading states while fetching data
- Error state for failed searches or API failures
