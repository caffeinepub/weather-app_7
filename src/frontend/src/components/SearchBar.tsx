import { Input } from "@/components/ui/input";
import { Loader2, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useSearchCity } from "../hooks/useQueries";
import type { SearchResult } from "../hooks/useQueries";

interface SearchBarProps {
  onSelectCity: (result: SearchResult) => void;
  placeholder?: string;
  inputOcid?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  onSelectCity,
  placeholder = "Search city…",
  inputOcid = "search.search_input",
  className = "",
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce input
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  const { data: results = [], isFetching } = useSearchCity(debouncedQuery);

  // Open dropdown when results arrive
  useEffect(() => {
    if (results.length > 0 && query.trim().length >= 2) {
      setIsOpen(true);
    } else if (query.trim().length < 2) {
      setIsOpen(false);
    }
  }, [results, query]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSelect(result: SearchResult) {
    onSelectCity(result);
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
  }

  function handleClear() {
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        {isFetching ? (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin pointer-events-none" />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        )}
        <Input
          ref={inputRef}
          data-ocid={inputOcid}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() =>
            results.length > 0 && query.trim().length >= 2 && setIsOpen(true)
          }
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="pl-9 pr-8 bg-secondary/60 border-border/50 focus:border-primary/50 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
              setQuery("");
            }
          }}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl overflow-hidden glass-elevated"
          >
            {results.slice(0, 6).map((result, idx) => (
              <button
                key={result.id}
                type="button"
                data-ocid={`search.item.${idx + 1}`}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-primary/10 transition-colors duration-100 group border-b border-border/30 last:border-0"
                onClick={() => handleSelect(result)}
              >
                <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                  📍
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {result.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {result.admin1 ? `${result.admin1}, ` : ""}
                    {result.country}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  Select →
                </span>
              </button>
            ))}
          </motion.div>
        )}
        {isOpen &&
          debouncedQuery.trim().length >= 2 &&
          !isFetching &&
          results.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl px-4 py-4 text-center text-sm text-muted-foreground glass-elevated"
            >
              No cities found for "{debouncedQuery}"
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
