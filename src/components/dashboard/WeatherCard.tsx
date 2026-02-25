"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Thermometer, Droplets, Cloud } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface WeatherCardProps {
  weather: {
    temp: number;
    humidity: number;
    condition: string;
  };
}

export function WeatherCard({ weather }: WeatherCardProps) {
  // Simple radial visualization for humidity
  const humidityData = [
    { value: weather.humidity },
    { value: 100 - weather.humidity },
  ];

  return (
    <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl bg-card h-full group hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
      <CardContent className="p-6 flex flex-col h-full relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-muted rounded-xl group-hover:bg-blue-50">
            <Cloud className="w-4 h-4 text-muted-foreground group-hover:text-blue-500" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Environment
          </span>
        </div>

        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-3xl font-headline font-bold">{weather.temp}°C</span>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{weather.condition}</span>
        </div>

        <div className="flex-1 flex items-center justify-center -my-4 relative">
          <div className="h-28 w-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={humidityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={40}
                  startAngle={90}
                  endAngle={450}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1000}
                >
                  <Cell fill="rgb(59 130 246)" />
                  <Cell fill="hsl(var(--muted))" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-blue-600">{weather.humidity}%</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">Humid</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/40">
           <div className="flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[10px] font-bold uppercase tracking-tight">Thermal</span>
           </div>
           <div className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-tight">Moisture</span>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
