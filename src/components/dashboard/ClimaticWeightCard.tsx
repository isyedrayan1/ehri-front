"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Droplets, Thermometer, Wind, CloudFog, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClimaticWeightCard as ClimaticWeightType } from "@/types/api";

interface ClimaticWeightCardProps {
  data: ClimaticWeightType;
}

export function ClimaticWeightCard({ data }: ClimaticWeightCardProps) {
  // Defensive check for transition period
  if (!data) {
    return (
      <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-3xl bg-card h-full flex flex-col items-center justify-center p-8 opacity-50 italic text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">
        Sensor Initializing...
      </Card>
    );
  }

  // Logic to determine visual intensity
  const humidity = data.humidity_index || 0;
  const isHeavy = humidity > 60;
  
  return (
    <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-3xl bg-card h-full group hover:shadow-xl transition-all duration-500 overflow-hidden relative">
      {/* Subtle Background pattern */}
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
         <CloudFog className="w-32 h-32" />
      </div>

      <CardContent className="p-7 flex flex-col h-full relative z-10">
        <div className="flex items-start justify-between mb-8">
          <div className="p-2.5 bg-primary/10 rounded-2xl text-primary transition-all duration-500 group-hover:rotate-12">
            <Gauge className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/40">
            Atmospheric Mass
          </span>
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h3 className={cn(
               "text-2xl font-headline font-black uppercase tracking-tight",
               isHeavy ? "text-slate-800" : "text-primary"
            )}>
              {data.status}
            </h3>
            <p className="text-xs font-semibold text-muted-foreground/70 leading-relaxed max-w-[180px]">
              {data.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 group-hover:bg-white group-hover:border-primary/20 transition-all duration-500">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-3.5 h-3.5 text-blue-500/60" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Moisture</span>
                </div>
                <p className="text-lg font-black font-headline text-slate-700">{humidity}%</p>
             </div>
             
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 group-hover:bg-white group-hover:border-primary/20 transition-all duration-500">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="w-3.5 h-3.5 text-orange-500/60" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Apparent</span>
                </div>
                <p className="text-lg font-black font-headline text-slate-700">{Math.round(data.apparent_temp)}°C</p>
             </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40">
           <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Air Density Index</span>
              <div className="flex gap-1">
                 {[1, 2, 3, 4, 5].map((i) => (
                   <div 
                    key={i} 
                    className={cn(
                      "w-3 h-1 rounded-full transition-all duration-700",
                      i <= (humidity / 20) 
                        ? (isHeavy ? "bg-slate-800" : "bg-primary") 
                        : "bg-slate-100"
                    )} 
                   />
                 ))}
              </div>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
