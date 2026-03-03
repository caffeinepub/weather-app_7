import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import OutCall "http-outcalls/outcall";

actor {
  public type WeatherApiResponse = Text;
  public type CitySearchResponse = Text;
  public type TemperatureUnit = { #celsius; #fahrenheit };
  public type SavedCity = {
    id : Text;
    name : Text;
    country : Text;
    lat : Float;
    lon : Float;
    admin1 : ?Text;
  };

  module SavedCity {
    public func compare(city1 : SavedCity, city2 : SavedCity) : Order.Order {
      Text.compare(city1.name, city2.name);
    };

    public func equal(city1 : SavedCity, city2 : SavedCity) : Bool {
      city1.id == city2.id;
    };
  };

  type UserPreferences = {
    var unit : TemperatureUnit;
    var savedCities : List.List<SavedCity>;
  };

  let userPrefs = Map.empty<Principal, UserPreferences>();

  public shared ({ caller }) func saveCity(id : Text, name : Text, country : Text, lat : Float, lon : Float, admin1 : ?Text) : async () {
    let prefs = switch (userPrefs.get(caller)) {
      case (null) {
        let newPrefs = {
          var unit = #celsius : TemperatureUnit;
          var savedCities = List.empty<SavedCity>();
        };
        userPrefs.add(caller, newPrefs);
        newPrefs;
      };
      case (?prefs) { prefs };
    };

    let city = {
      id;
      name;
      country;
      lat;
      lon;
      admin1;
    };

    // Check if city already exists
    if (prefs.savedCities.any(func(c) { c.id == id })) {
      Runtime.trap("City already exists in list");
    };

    // Enforce limit of 10 cities
    if (prefs.savedCities.size() >= 10) {
      Runtime.trap("Maximum of 10 saved cities reached");
    };

    // Add new city to the list
    prefs.savedCities.add(city);
  };

  public shared ({ caller }) func removeSavedCity(id : Text) : async () {
    let prefs = switch (userPrefs.get(caller)) {
      case (null) { Runtime.trap("User has no saved cities") };
      case (?prefs) { prefs };
    };

    // Store original size
    let originalSize = prefs.savedCities.size();

    // Remove city by ID
    let newSavedCities = prefs.savedCities.filter(func(c) { c.id != id });

    // Check if city was present by comparing sizes
    if (newSavedCities.size() == originalSize) {
      Runtime.trap("City not found in saved cities");
    };

    // Update saved cities
    prefs.savedCities := newSavedCities;
  };

  public shared ({ caller }) func setUnit(unit : TemperatureUnit) : async () {
    let prefs = switch (userPrefs.get(caller)) {
      case (null) {
        let newPrefs = {
          var unit = #celsius : TemperatureUnit;
          var savedCities = List.empty<SavedCity>();
        };
        userPrefs.add(caller, newPrefs);
        newPrefs;
      };
      case (?prefs) { prefs };
    };

    prefs.unit := unit;
  };

  public query ({ caller }) func getUnit() : async TemperatureUnit {
    switch (userPrefs.get(caller)) {
      case (null) { #celsius }; // Default unit
      case (?prefs) { prefs.unit };
    };
  };

  public query ({ caller }) func getSavedCities() : async [SavedCity] {
    switch (userPrefs.get(caller)) {
      case (null) { [] };
      case (?prefs) {
        prefs.savedCities.toArray();
      };
    };
  };

  // Helper function for the transform callback used by the IC
  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // HTTP Outcall to Geocoding API
  public shared ({ caller }) func searchCity(name : Text) : async Text {
    let url = "https://geocoding-api.open-meteo.com/v1/search?name=" # name # "&count=5&language=en&format=json";
    await OutCall.httpGetRequest(url, [], transform);
  };

  public shared ({ caller }) func getWeather(lat : Float, lon : Float) : async Text {
    let url = "https://api.open-meteo.com/v1/forecast?latitude=" # lat.toText() # "&longitude=" # lon.toText() # "&current_weather=true&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,uv_index,visibility,precipitation,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_hours,uv_index_max&forecast_days=7&temperature_unit=celsius&windspeed_unit=kmh&precipitation_unit=mm";
    await OutCall.httpGetRequest(url, [], transform);
  };
};
