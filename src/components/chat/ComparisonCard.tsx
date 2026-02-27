"use client";

import { ComparisonCard as ComparisonCardType } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import { GitCompare, ArrowRight } from "lucide-react";

interface ComparisonCardProps {
  data: ComparisonCardType;
}

export function ComparisonCard({ data }: ComparisonCardProps) {
  const info = data.data;
  return (
    <Card className="rounded-[1.5rem] border-none shadow-xl bg-card overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-muted/30 p-5 flex items-center gap-3 border-b border-border/20">
          <div className="p-2 bg-white rounded-xl shadow-sm">
             <GitCompare className="w-4 h-4 text-primary" />
          </div>
          <div>
             <h3 className="text-sm font-headline font-bold">Risk Model Comparison</h3>
             <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">{info.city_a} vs {info.city_b}</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
           <div className="flex items-center gap-8 justify-center">
              <div className="text-center">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{info.city_a}</p>
                 <span className="text-3xl font-headline font-bold">{info.ehri_a.toFixed(1)}</span>
              </div>
              <div className="h-10 w-px bg-border/40" />
              <div className="text-center">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{info.city_b}</p>
                 <span className="text-3xl font-headline font-bold">{info.ehri_b.toFixed(1)}</span>
              </div>
           </div>

           <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-[11px] font-medium text-foreground leading-relaxed italic">
                "{info.comparison_text}"
              </p>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
