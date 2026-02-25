
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  Info, 
  Activity, 
  Droplets, 
  Home, 
  Wind, 
  Sun, 
  GlassWater, 
  Shirt, 
  Clock, 
  Smile, 
  Flower2, 
  Filter, 
  Fan, 
  Stethoscope,
  Shield
} from "lucide-react";

interface PrecautionsCardProps {
  precautions: { icon: string; text: string }[];
}

const iconMap: Record<string, any> = {
  Mask: Shield,
  Activity, 
  Droplets, 
  Home, 
  Wind, 
  Sun, 
  GlassWater, 
  Shirt, 
  Clock, 
  Smile, 
  Flower2, 
  Filter, 
  AirVent: Fan, 
  Stethoscope
};

export function PrecautionsCard({ precautions }: PrecautionsCardProps) {
  return (
    <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl bg-card h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-muted rounded-xl">
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Health Safety
          </span>
        </div>

        <div className="space-y-4 mt-2">
          {precautions.map((p, i) => {
            const IconComp = iconMap[p.icon] || Info;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <IconComp className="w-4 h-4 text-foreground/70" />
                </div>
                <span className="text-xs font-semibold text-foreground/80">{p.text}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
