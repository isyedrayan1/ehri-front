"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getRiskColor, getRiskLabel } from "@/lib/risk-utils";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

interface RiskGaugeProps {
  score: number;
  status: string;
}

export function RiskGauge({ score, status }: RiskGaugeProps) {
  const data = [
    { value: score },
    { value: 100 - score },
  ];

  const color = getRiskColor(score);
  const label = getRiskLabel(score);

  return (
    <Card className="h-full border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[2.5rem] bg-card group overflow-hidden">
      <CardContent className="p-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-10">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">
              Diagnostic Index
            </span>
            <h2 className="text-2xl font-headline font-bold text-foreground">
              Aggregate EHRI
            </h2>
          </div>
          <div className="p-2.5 bg-muted/50 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-muted-foreground/40" />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative py-4">
          <div className="h-[280px] w-full max-w-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="90%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={100}
                  outerRadius={125}
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
          
          <div className="absolute top-[48%] flex flex-col items-center">
            <span className="text-8xl font-headline font-bold tracking-tighter" style={{ color }}>
              {score.toFixed(1)}
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
            &ldquo;{status}&rdquo;
          </p>
        </div>
      </CardContent>
    </Card>
  );
}