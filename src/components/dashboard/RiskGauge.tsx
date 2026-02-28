"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getRiskColor, getRiskLabel } from "@/lib/risk-utils";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

import { RiskSummaryCard } from "@/types/api";

interface RiskGaugeProps {
  score: number;
  status: string;
  data?: RiskSummaryCard;
  stationName?: string;
}

export function RiskGauge({ score, status, data: apiData, stationName }: RiskGaugeProps) {
  // Use API data if available, fallback to legacy props
  const displayScore = apiData ? apiData.ehri : score;
  const displayStatus = apiData ? apiData.summary : status;

  const data = [
    { value: displayScore },
    { value: 100 - displayScore },
  ];

  const color = getRiskColor(displayScore);
  const label = getRiskLabel(displayScore);

  return (
    <Card className="h-full border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[2.5rem] bg-card group overflow-hidden flex flex-col">
      <CardContent className="p-10 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-8">
          <div className="flex flex-col gap-1.5 overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">
              Diagnostic Index
            </span>
            <h2 className="text-2xl font-headline font-bold text-foreground truncate">
              Aggregate EHRI
            </h2>
            {stationName && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  stationName === "Regional Estimate" ? "bg-orange-400" : "bg-green-500"
                )} />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 whitespace-nowrap overflow-hidden text-ellipsis">
                  Source: {stationName}
                </span>
              </div>
            )}
          </div>
          <div className="p-2.5 bg-muted/50 rounded-xl shrink-0">
            <ShieldCheck className="w-5 h-5 text-muted-foreground/40" />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
          <div className="h-full w-full max-w-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="85%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={110}
                  outerRadius={135}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                  animationDuration={2000}
                >
                  <Cell fill={color} />
                  <Cell fill="hsl(var(--muted))" fillOpacity={0.5} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="absolute top-[60%] flex flex-col items-center">
            <span className="text-6xl font-headline font-bold tracking-tighter" style={{ color }}>
              {displayScore.toFixed(1)}
            </span>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 mt-4 bg-background/40 backdrop-blur-sm shadow-sm transition-all group-hover:scale-105">
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
               <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color }}>
                {label}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40">
          <p className="text-sm text-muted-foreground font-medium leading-relaxed italic opacity-80">
            &ldquo;{displayStatus}&rdquo;
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
