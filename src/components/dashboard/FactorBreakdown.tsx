"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

import { MetricSeverity } from "@/types/api";

interface FactorBreakdownProps {
  pollution?: number;
  heat?: number;
  humidity?: number;
  metrics?: MetricSeverity[];
}

export function FactorBreakdown({ pollution, heat, humidity, metrics }: FactorBreakdownProps) {
  // Priority: 1. metrics (API), 2. individual props (Legacy)
  const pollutionVal = metrics ? (metrics.find(m => m.name === 'PM2.5')?.value ?? 0) : (pollution ?? 0) * 100;
  const heatVal = metrics ? (metrics.find(m => m.name === 'Temperature')?.value ?? 0) : (heat ?? 0) * 100;
  const humidityVal = metrics ? (metrics.find(m => m.name === 'Humidity')?.value ?? 0) : (humidity ?? 0) * 100;

  const data = [
    { subject: 'Pollution', A: Math.min(pollutionVal, 100) },
    { subject: 'Heat', A: Math.min(heatVal, 100) },
    { subject: 'Humidity', A: Math.min(humidityVal, 100) },
  ];

  return (
    <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl bg-card h-full group hover:shadow-xl transition-all duration-500">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-muted rounded-xl group-hover:bg-primary/5">
            <BarChart2 className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Stress Profile
          </span>
        </div>

        <div className="flex-1 min-h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 'bold' }} 
              />
              <Tooltip 
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', fontSize: '11px' }}
              />
              <Radar
                name="Impact Factor"
                dataKey="A"
                stroke="hsl(var(--foreground))"
                fill="hsl(var(--foreground))"
                fillOpacity={0.15}
                animationDuration={2000}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-border/40">
           {data.map(d => (
             <div key={d.subject} className="text-center group/item transition-all hover:scale-105">
                <p className="text-[8px] font-bold uppercase text-muted-foreground mb-0.5">{d.subject}</p>
                <p className="text-xs font-bold text-foreground">{d.A.toFixed(0)}%</p>
             </div>
           ))}
        </div>
      </CardContent>
    </Card>
  );
}
