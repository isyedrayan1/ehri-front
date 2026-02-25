
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Wind } from "lucide-react";

interface AirQualityCardProps {
  data: {
    pm25: number;
    status: string;
    trend: number[];
  };
}

export function AirQualityCard({ data }: AirQualityCardProps) {
  const chartData = data.trend.map((val, i) => ({ value: val }));

  return (
    <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl bg-card overflow-hidden h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-muted rounded-xl">
            <Wind className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            PM2.5 Metric
          </span>
        </div>

        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-3xl font-headline font-bold">{data.pm25}</span>
          <span className="text-xs font-semibold text-muted-foreground">µg/m³</span>
        </div>
        
        <p className="text-xs font-semibold text-muted-foreground mb-4">
          {data.status}
        </p>

        <div className="mt-auto h-12 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--foreground))" 
                strokeWidth={2} 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
