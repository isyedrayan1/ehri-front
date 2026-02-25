
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { citiesData } from "@/data/mock-data";
import { MapPin } from "lucide-react";

interface CitySelectorProps {
  currentCity: string;
  onCityChange: (city: string) => void;
  disabled?: boolean;
}

export function CitySelector({ currentCity, onCityChange, disabled }: CitySelectorProps) {
  const cities = Object.keys(citiesData);

  return (
    <div className="flex items-center gap-2 w-full max-w-xs">
      <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
      <Select value={currentCity} onValueChange={onCityChange} disabled={disabled}>
        <SelectTrigger className="w-full bg-card shadow-sm border-none focus:ring-accent font-medium">
          <SelectValue placeholder="Select a city" />
        </SelectTrigger>
        <SelectContent>
          {cities.map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
