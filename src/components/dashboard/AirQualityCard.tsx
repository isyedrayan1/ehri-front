"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { Wind } from "lucide-react";

import { MetricSeverity } from "@/types/api";
import { getMetricSeverityColor, getMetricSeverityLabel } from "@/lib/risk-utils";

interface AirQualityCardProps {
  data?: {
    pm25: number;
    status: string;
    trend: number[];
  };
  metric?: MetricSeverity;
}

export function AirQualityCard({ data, metric }: AirQualityCardProps) {
  // Priority: 1. metric (API), 2. data (Legacy)
  const pm25 = metric ? metric.value : (data?.pm25 ?? 0);
  const status = metric ? metric.description : (data?.status ?? "Unknown");
  const severity = metric ? metric.severity : "info";
  const trend = data?.trend ?? [];

  const chartData = trend.map((val, i) => ({ value: val, name: `T-${6-i}h` }));
  const severityColor = getMetricSeverityColor(severity as any);

  return (
    <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl bg-card overflow-hidden h-full group hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-muted rounded-xl transition-colors group-hover:bg-primary/5">
            <Wind className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            PM2.5 Metric
          </span>
        </div>

        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-3xl font-headline font-bold">{pm25}</span>
          <span className="text-xs font-semibold text-muted-foreground">µg/m³</span>
        </div>
        
        <p className="text-xs font-semibold text-muted-foreground mb-4">
          {status}
        </p>

        <div className="mt-auto h-20 w-full -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '8px 12px'
                }}
                labelStyle={{ display: 'none' }}
                cursor={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--foreground))" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorPm)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
