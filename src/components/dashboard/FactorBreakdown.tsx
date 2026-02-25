
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

interface FactorBreakdownProps {
  pollution: number;
  heat: number;
  humidity: number;
}

export function FactorBreakdown({ pollution, heat, humidity }: FactorBreakdownProps) {
  const factors = [
    { name: "Pollution Stress", value: pollution, color: "bg-foreground" },
    { name: "Heat Stress", value: heat, color: "bg-muted-foreground/60" },
    { name: "Humidity Modifier", value: humidity, color: "bg-muted-foreground/30" },
  ];

  return (
    <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl bg-card h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-8">
          <div className="p-2 bg-muted rounded-xl">
            <BarChart2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Stress Factors
          </span>
        </div>

        <div className="space-y-6">
          {factors.map((f) => (
            <div key={f.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{f.name}</span>
                <span className="text-[10px] font-bold text-foreground">{(f.value * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full ${f.color} transition-all duration-1000 ease-in-out`} 
                  style={{ width: `${f.value * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
