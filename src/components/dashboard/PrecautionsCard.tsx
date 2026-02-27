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
  Shield,
  ShieldAlert
} from "lucide-react";

interface PrecautionsCardProps {
  precautions: { icon: string; text: string }[] | string[];
}

/**
 * Map a precaution text to a Lucide icon name.
 * Simple keyword-based mapping.
 */
function mapPrecautionIcon(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('mask') || lower.includes('n95')) return 'Shield';
  if (lower.includes('indoor') || lower.includes('remain')) return 'Home';
  if (lower.includes('purif')) return 'Wind';
  if (lower.includes('exercise') || lower.includes('exertion')) return 'Activity';
  if (lower.includes('hydra') || lower.includes('drink') || lower.includes('water')) return 'GlassWater';
  if (lower.includes('medical') || lower.includes('symptom')) return 'Stethoscope';
  if (lower.includes('uv') || lower.includes('sun')) return 'Sun';
  if (lower.includes('ventilat')) return 'Wind';
  return 'ShieldAlert';
}

/**
 * Mapping of string identifiers to Lucide components.
 * Ensures that mock data icons are correctly rendered.
 */
const iconMap: Record<string, any> = {
  Shield,
  ShieldAlert,
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
    <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl bg-card h-full group hover:shadow-xl transition-all duration-500">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-6">
          <div className="p-2 bg-muted rounded-xl transition-colors group-hover:bg-primary/5">
            <ShieldAlert className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Health Safety
          </span>
        </div>

        <div className="space-y-4 mt-2">
          {precautions.map((p, i) => {
            const isString = typeof p === 'string';
            const iconName = isString ? mapPrecautionIcon(p) : p.icon;
            const text = isString ? p : p.text;
            const IconComp = iconMap[iconName] || Info;
            
            return (
              <div key={i} className="flex items-center gap-4 group/item cursor-default">
                <div className="w-10 h-10 rounded-2xl bg-secondary/50 flex items-center justify-center shrink-0 transition-all group-hover/item:bg-primary group-hover/item:scale-110 group-hover/item:rotate-3 shadow-sm">
                  <IconComp className="w-5 h-5 text-foreground/70 group-hover/item:text-primary-foreground transition-colors" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground/90 leading-tight group-hover/item:text-primary transition-colors">
                    {text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-auto pt-6 border-t border-border/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
           <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 text-center">
             Verified Advisory Data
           </p>
        </div>
      </CardContent>
    </Card>
  );
}
