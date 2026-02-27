"use client";

import { MapPin } from "lucide-react";

interface DetectedCitiesBadgesProps {
  cities: string[];
}

export function DetectedCitiesBadges({ cities }: DetectedCitiesBadgesProps) {
  if (cities.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/5 rounded-lg border border-primary/10">
        <MapPin className="w-2.5 h-2.5 text-primary/60" />
        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Grounded Context:</span>
      </div>
      {cities.map((city, i) => (
        <div 
          key={i} 
          className="px-2 py-1 bg-white border border-border/40 rounded-lg shadow-sm text-[9px] font-black uppercase tracking-widest text-primary"
        >
          {city}
        </div>
      ))}
    </div>
  );
}
