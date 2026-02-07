"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Map } from "mapbox-gl";

interface GeocodingFeature {
  id: string;
  place_type: string[];
  place_name: string;
  center: [number, number];
  bbox?: [number, number, number, number];
}

interface GeocodingResponse {
  features: GeocodingFeature[];
}

export interface MapSearchProps {
  map: Map | null;
  placeholder?: string;
  className?: string;
}

export function MapSearch({ map, placeholder = "Search country or place...", className }: MapSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const search = useCallback(
    async (q: string) => {
      if (!q.trim() || !token) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const encoded = encodeURIComponent(q.trim());
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&types=country,place,region&limit=5`;
        const res = await fetch(url);
        const data: GeocodingResponse = await res.json();
        setResults(data.features ?? []);
        setSelectedIndex(-1);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const flyTo = useCallback(
    (feature: GeocodingFeature) => {
      if (!map) return;
      if (feature.bbox) {
        map.fitBounds(
          [
            [feature.bbox[0], feature.bbox[1]],
            [feature.bbox[2], feature.bbox[3]],
          ],
          { padding: 40, duration: 1500 }
        );
      } else {
        map.flyTo({
          center: feature.center,
          zoom: 4,
          duration: 1500,
        });
      }
      setQuery("");
      setResults([]);
      setIsOpen(false);
    },
    [map]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault();
      flyTo(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-64", className)}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="glass h-9 border-border/50 pl-8 pr-3 text-foreground placeholder:text-muted-foreground"
        />
        {isLoading && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            …
          </span>
        )}
      </div>
      {isOpen && results.length > 0 && (
        <ul
          className="glass absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-auto rounded-md border border-border/50 py-1 shadow-lg"
          role="listbox"
        >
          {results.map((f, i) => (
            <li
              key={f.id}
              role="option"
              aria-selected={i === selectedIndex}
              className={cn(
                "cursor-pointer px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/50",
                i === selectedIndex && "bg-muted/50"
              )}
              onMouseEnter={() => setSelectedIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                flyTo(f);
              }}
            >
              {f.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
