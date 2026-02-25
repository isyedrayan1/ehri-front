
"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wind, Thermometer, Droplets } from "lucide-react";

interface RiskBreakdownProps {
  pollution: number;
  heat: number;
  humidity: number;
}

export function RiskBreakdown({ pollution, heat, humidity }: RiskBreakdownProps) {
  const factors = [
    { name: "Pollution Stress", value: pollution, icon: Wind, color: "text-blue-500", bg: "bg-blue-500" },
    { name: "Heat Stress", value: heat, icon: Thermometer, color: "text-orange-500", bg: "bg-orange-500" },
    { name: "Humidity Stress", value: humidity, icon: Droplets, color: "text-cyan-500", bg: "bg-cyan-500" },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Stress Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {factors.map((f) => (
          <div key={f.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-2">
                <f.icon className={`w-4 h-4 ${f.color}`} />
                <span>{f.name}</span>
              </div>
              <span className="font-bold">{(f.value * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
               <div 
                 className={`h-full ${f.bg} transition-all duration-1000 ease-out`} 
                 style={{ width: `${f.value * 100}%` }}
               />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
