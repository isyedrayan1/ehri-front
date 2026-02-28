"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Sun, Cloud, CloudRain, CloudLightning, Thermometer, Wind, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { ForecastSnapshotCard } from "@/types/api";

interface TrendChartProps {
  trend: number[];
  forecast?: ForecastSnapshotCard;
}

export function TrendChart({ trend, forecast }: TrendChartProps) {
  // 1. Prepare 7-day data sequence
  const forecastItems = forecast?.daily_forecasts?.length 
    ? forecast.daily_forecasts.slice(0, 7).map((item, idx) => {
        const date = new Date(item.date);
        const dayName = idx === 0 ? "Today" : idx === 1 ? "Tomorrow" : date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const score = item.ehri;
        // Deterministic pseudo-random based on index to avoid hydration mismatch
        const temp = item.temp || (24 + (idx * 1.5) % 8); 
        
        return {
          day: dayName,
          dateLabel: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
          score: score,
          temp: Math.round(temp),
          condition: score > 75 ? 'smog' : score > 50 ? 'cloudy' : 'clear'
        };
      })
    : Array.from({ length: 7 }).map((_, idx) => {
        // Use a deterministic "now" for SSR consistency if possible, 
        // but since we can't easily pass it without props, we'll use a fixed start if data is missing
        const d = new Date(2026, 1, 28); // Fallback to a fixed point if no data, but usually forecast exists
        d.setDate(d.getDate() + idx);
        return {
          day: idx === 0 ? "Today" : idx === 1 ? "Tomorrow" : d.toLocaleDateString('en-US', { weekday: 'short' }),
          dateLabel: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
          score: trend[0] || 0,
          temp: 26 + idx,
          condition: 'clear'
        };
      });

  const getWeatherIcon = (condition: string, score: number) => {
    if (score > 80) return <Wind className="w-5 h-5 text-slate-400 animate-pulse" />;
    if (score > 60) return <CloudRain className="w-5 h-5 text-blue-400" />;
    if (score > 40) return <Cloud className="w-5 h-5 text-slate-300" />;
    return <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />;
  };

  const getScoreColor = (score: number) => {
    if (score > 75) return "text-red-500 bg-red-500/10 border-red-500/20";
    if (score > 50) return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    if (score > 25) return "text-yellow-600 bg-yellow-500/10 border-yellow-500/20";
    return "text-green-500 bg-green-500/10 border-green-500/20";
  };

  return (
    <Card className="border-none shadow-[0_4px_25px_rgba(0,0,0,0.04)] rounded-3xl bg-card h-full overflow-hidden">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                   <span className="text-[8px] font-black uppercase tracking-[0.25em] text-muted-foreground/40 block">Temporal Matrix</span>
                   <h3 className="text-base font-headline font-black tracking-tight text-slate-800 uppercase">7-Day Risk Outlook</h3>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
             <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Predictive</span>
          </div>
        </div>

        {/* Forecast Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 flex-1">
          {forecastItems.map((item, idx) => (
            <div 
              key={idx} 
              className={cn(
                "group relative flex flex-col items-center justify-between p-3.5 rounded-2xl border transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]",
                idx === 0 
                  ? "bg-slate-900 border-slate-800 shadow-xl shadow-slate-200/50 text-white" 
                  : "bg-white border-slate-100 hover:border-primary/20 hover:shadow-lg"
              )}
            >
              {/* Day Label */}
              <div className="text-center">
                <p className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  idx === 0 ? "text-primary-foreground/60" : "text-slate-400"
                )}>
                  {item.day}
                </p>
                <p className={cn(
                  "text-[7px] font-bold opacity-30 uppercase tracking-tighter",
                  idx === 0 ? "text-white" : "text-slate-500"
                )}>
                  {item.dateLabel}
                </p>
              </div>

              {/* Weather Visual */}
              <div className="py-2 flex flex-col items-center gap-2">
                 <div className={cn(
                   "p-2 rounded-xl transition-transform duration-700 group-hover:rotate-12",
                   idx === 0 ? "bg-white/5" : "bg-slate-50"
                 )}>
                    {getWeatherIcon(item.condition, item.score)}
                 </div>
                 <div className="flex items-center gap-1">
                    <Thermometer className={cn("w-2.5 h-2.5 opacity-30", idx === 0 ? "text-white" : "text-slate-400")} />
                    <span className="text-xs font-black tracking-tight">{item.temp}°</span>
                 </div>
              </div>

              {/* EHRI Badge */}
              <div className="w-full space-y-1">
                <div className={cn(
                  "flex flex-col items-center justify-center py-1.5 rounded-xl border transition-all",
                  idx === 0 
                    ? "bg-white/10 border-white/20 text-white" 
                    : getScoreColor(item.score)
                )}>
                   <div className="flex items-center gap-1">
                     <span className="text-[7px] font-black opacity-50">EHRI</span>
                     <span className="text-[10px] font-black">{item.score.toFixed(0)}</span>
                   </div>
                   <span className={cn(
                     "text-[7px] font-black uppercase tracking-tighter opacity-80",
                     idx === 0 ? "text-primary-foreground" : ""
                   )}>
                     {item.score <= 25 ? "Safe" : item.score <= 50 ? "Moderate" : item.score <= 75 ? "Risky" : "Severe"}
                   </span>
                </div>
              </div>

              {/* Highlight bar for Today */}
              {idx === 0 && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-b-full" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <style jsx>{`
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: slow-spin 8s linear infinite;
        }
      `}</style>
    </Card>
  );
}
