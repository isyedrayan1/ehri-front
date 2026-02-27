"use client";

import { HealthTipCard as HealthTipCardType } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import { HeartPulse, CheckCircle2 } from "lucide-react";

interface HealthTipCardProps {
  data: HealthTipCardType;
}

export function HealthTipCard({ data }: HealthTipCardProps) {
  const info = data.data;
  return (
    <Card className="max-w-md rounded-[1.5rem] border-none shadow-xl bg-card overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-red-500/5 p-5 flex items-center gap-3 border-b border-red-500/10">
          <div className="p-2 bg-white rounded-xl shadow-sm">
             <HeartPulse className="w-4 h-4 text-red-500" />
          </div>
          <div>
             <h3 className="text-sm font-headline font-bold text-red-950">Clinical Advisory</h3>
             <p className="text-[9px] font-bold text-red-500/60 uppercase tracking-widest">{info.category}</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
           <p className="text-sm font-bold text-foreground leading-tight">
             {info.tip}
           </p>

           <div className="space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Precautions</p>
              {info.actions.map((action, i) => (
                <div key={i} className="flex items-center gap-3 group">
                   <CheckCircle2 className="w-3.5 h-3.5 text-green-500/40 group-hover:text-green-500 transition-colors" />
                   <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{action}</span>
                </div>
              ))}
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
