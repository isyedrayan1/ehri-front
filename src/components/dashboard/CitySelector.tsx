
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

import { SUPPORTED_CITIES as CITIES_WITH_COORDS } from "@/lib/locations";

/**
 * Full list of 40 supported Indian cities.
 * Case-insensitive on input; the backend returns canonical form.
 */
export const SUPPORTED_CITIES = CITIES_WITH_COORDS.map(c => c.name);

export type SupportedCity = typeof SUPPORTED_CITIES[number];

interface CitySelectorProps {
  currentCity: string;
  onCityChange: (city: string) => void;
  disabled?: boolean;
}

export function CitySelector({ currentCity, onCityChange, disabled }: CitySelectorProps) {
  return (
    <div className="flex items-center gap-2 w-full max-w-xs">
      <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
      <Select value={currentCity} onValueChange={onCityChange} disabled={disabled}>
        <SelectTrigger className="w-full bg-card shadow-sm border-none focus:ring-accent font-medium">
          <SelectValue placeholder="Select a city" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {SUPPORTED_CITIES.map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
