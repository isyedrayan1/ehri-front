
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Thermometer, Droplets, Cloud } from "lucide-react";

interface WeatherCardProps {
  weather: {
    temp: number;
    humidity: number;
    condition: string;
  };
}

export function WeatherCard({ weather }: WeatherCardProps) {
  return (
    <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl bg-card h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-6">
          <div className="p-2 bg-muted rounded-xl">
            <Cloud className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Live Weather
          </span>
        </div>

        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-3xl font-headline font-bold">{weather.temp}°C</span>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{weather.condition}</span>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold">{weather.temp}°C</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold">{weather.humidity}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
