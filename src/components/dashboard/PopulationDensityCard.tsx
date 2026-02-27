"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

import { MetricSeverity } from "@/types/api";

interface PopulationDensityCardProps {
  density?: {
    value: string;
    context: string;
  };
  metric?: MetricSeverity;
}

export function PopulationDensityCard({ density, metric }: PopulationDensityCardProps) {
  // Priority: 1. metric (API), 2. density (Legacy)
  const displayValue = metric ? `${metric.value.toLocaleString()}` : (density?.value.replace("/km²", "") ?? "0");
  const displayContext = metric ? metric.description : (density?.context ?? "No data available.");
  
  // Comparison data: Current vs "Critical" benchmark
  const val = parseInt(displayValue.replace(/,/g, ''));
  const data = [
    { name: 'City', value: val },
    { name: 'Average', value: 8000 },
  ];

  return (
    <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl bg-card h-full group hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-muted rounded-xl group-hover:bg-primary/5">
            <Users className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Density Stress
          </span>
        </div>

        <div className="mb-2">
          <span className="text-2xl font-headline font-bold">{displayValue}</span>
          <span className="text-[10px] block font-bold text-muted-foreground uppercase">People per km²</span>
        </div>
        
        <div className="flex-1 min-h-[50px] w-full mb-3 flex items-center">
          <ResponsiveContainer width="100%" height={40}>
            <BarChart data={data} layout="vertical" margin={{ left: -30 }}>
              <XAxis type="number" hide domain={[0, Math.max(val, 12000) * 1.1]} />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '10px' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={10} animationDuration={1000}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--foreground))' : 'hsl(var(--muted))'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[10px] leading-relaxed text-muted-foreground font-medium opacity-80 mt-auto">
          {displayContext}
        </p>
      </CardContent>
    </Card>
  );
}
