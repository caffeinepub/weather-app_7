export function WeatherSkeleton() {
  return (
    <div data-ocid="weather.loading_state" className="animate-pulse space-y-4">
      {/* Hero card skeleton */}
      <div className="glass-card rounded-2xl p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="shimmer h-8 w-48 rounded-lg" />
            <div className="shimmer h-5 w-32 rounded-md" />
            <div className="shimmer h-20 w-36 rounded-xl mt-4" />
            <div className="shimmer h-5 w-24 rounded-md" />
          </div>
          <div className="shimmer h-28 w-28 rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
          {["h1", "h2", "h3", "h4", "h5", "h6"].map((k) => (
            <div key={k} className="shimmer h-20 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Hourly skeleton */}
      <div className="glass-card rounded-2xl p-6">
        <div className="shimmer h-5 w-32 rounded-md mb-4" />
        <div className="flex gap-3 overflow-hidden">
          {["h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8"].map((k) => (
            <div key={k} className="shimmer h-24 w-16 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Daily skeleton */}
      <div className="glass-card rounded-2xl p-6">
        <div className="shimmer h-5 w-32 rounded-md mb-4" />
        <div className="space-y-3">
          {["d1", "d2", "d3", "d4", "d5", "d6", "d7"].map((k) => (
            <div key={k} className="shimmer h-12 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
