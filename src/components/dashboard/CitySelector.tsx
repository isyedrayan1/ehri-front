"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Search } from "lucide-react";
import { searchLocations, CityLocation } from "@/lib/locations";

interface CitySelectorProps {
  currentCity: string;
  onCityChange: (city: string, lat?: number, lng?: number) => void;
  disabled?: boolean;
}

export function CitySelector({ currentCity, onCityChange, disabled }: CitySelectorProps) {
  const [query, setQuery] = useState(currentCity);
  const [suggestions, setSuggestions] = useState<CityLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 3 && query !== currentCity) {
        setLoading(true);
        const results = await searchLocations(query);
        setSuggestions(results);
        setLoading(false);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, currentCity]);

  const handleSelect = (loc: CityLocation) => {
    setQuery(loc.name);
    onCityChange(loc.name, loc.lat, loc.lng);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full max-w-xs">
      <div className="relative flex items-center gap-2">
        <MapPin className="absolute left-3 w-3 h-3 text-muted-foreground z-10" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search node..."
          disabled={disabled}
          className="pl-8 bg-card shadow-sm border-none focus:ring-accent font-medium h-10 text-xs"
        />
        {loading && (
          <Loader2 className="absolute right-3 w-3 h-3 animate-spin text-muted-foreground" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-11 left-0 right-0 bg-white border border-border/40 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2">
          {suggestions.map((loc, idx) => (
            <button
              key={`${loc.name}-${idx}`}
              onClick={() => handleSelect(loc)}
              className="w-full text-left p-3 hover:bg-muted/50 transition-colors flex flex-col gap-0.5"
            >
              <span className="text-xs font-bold">{loc.name}</span>
              <span className="text-[9px] text-muted-foreground font-medium uppercase">{loc.state}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
