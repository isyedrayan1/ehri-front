"use client";

import { CityCard as CityCardType } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ShieldCheck, Activity } from "lucide-react";
import { getRiskColor, getRiskLabel } from "@/lib/risk-utils";

interface CityCardProps {
  data: CityCardType;
}

export function CityCard({ data }: CityCardProps) {
  const info = data.data;
  const color = getRiskColor(info.ehri);
  const label = getRiskLabel(info.ehri);

  return (
    <Card className="max-w-sm rounded-[1.5rem] border-none shadow-xl bg-card overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-muted/30 p-5 flex items-center justify-between border-b border-border/20">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white rounded-xl shadow-sm">
                <MapPin className="w-4 h-4 text-primary" />
             </div>
             <div>
                <h3 className="text-sm font-headline font-bold">{info.city}</h3>
                <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Regional Profile</p>
             </div>
          </div>
          <div className="text-right">
             <span className="text-2xl font-headline font-bold tracking-tighter" style={{ color }}>{info.ehri.toFixed(1)}</span>
             <p className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color }}>EHRI</p>
          </div>
        </div>
        
        <div className="p-5 space-y-4">
           <div className="flex items-center gap-3 px-4 py-2 bg-muted/20 rounded-xl border border-border/10">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">{label}</span>
           </div>

           <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/10 rounded-xl border border-border/5">
                 <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Status</p>
                 <p className="text-[10px] font-bold leading-tight">{info.status}</p>
              </div>
              <div className="p-3 bg-muted/10 rounded-xl border border-border/5">
                 <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Top Factor</p>
                 <p className="text-[10px] font-bold leading-tight">{info.top_factor}</p>
              </div>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
