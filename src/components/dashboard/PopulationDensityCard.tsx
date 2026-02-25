
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

interface PopulationDensityCardProps {
  density: {
    value: string;
    context: string;
  };
}

export function PopulationDensityCard({ density }: PopulationDensityCardProps) {
  return (
    <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl bg-card h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-muted rounded-xl">
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Density Stress
          </span>
        </div>

        <span className="text-2xl font-headline font-bold mb-2">{density.value}</span>
        
        <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">
          {density.context}
        </p>
      </CardContent>
    </Card>
  );
}
