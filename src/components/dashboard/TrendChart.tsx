
"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, ArrowUpRight } from "lucide-react";

import { ForecastSnapshotCard } from "@/types/api";
import { ForecastBadge } from "./ForecastBadge";

interface TrendChartProps {
  trend: number[];
  forecast?: ForecastSnapshotCard;
}

export function TrendChart({ trend, forecast }: TrendChartProps) {
  // Use forecast values if available, otherwise fallback to trend history
  const chartValues = forecast && forecast.available 
    ? [...trend, ...forecast.forecast_values]
    : trend;

  const data = chartValues.map((val, i) => ({
    name: i < trend.length ? `Day ${i + 1}` : `F-${i - trend.length + 1}`,
    score: val,
    isForecast: i >= trend.length
  }));

  const lastScore = trend[trend.length - 1];
  const prevScore = trend[trend.length - 2] || lastScore;
  const percentChange = ((lastScore - prevScore) / (prevScore || 1) * 100).toFixed(1);

  return (
    <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl bg-card h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-6">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2">
                <div className="p-2 bg-muted rounded-xl">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Temporal Analysis
                </span>
             </div>
              <h3 className="text-lg font-headline font-bold mt-1">
                {forecast?.available ? "Risk Projection Matrix" : "7-Day Risk Velocity"}
              </h3>
           </div>
           <div className="flex flex-col items-end gap-2">
             {forecast && (
               <ForecastBadge trend={forecast.trend} />
             )}
             <div className="flex items-center gap-1 text-xs font-bold text-foreground bg-muted/50 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3" />
                {percentChange}%
             </div>
           </div>
        </div>

        <div className="flex-1 min-h-[160px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                fontSize={9} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
              />
              <YAxis 
                fontSize={9} 
                axisLine={false} 
                tickLine={false} 
                domain={[0, 100]} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px', fontWeight: 600 }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="hsl(var(--foreground))" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorScore)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
