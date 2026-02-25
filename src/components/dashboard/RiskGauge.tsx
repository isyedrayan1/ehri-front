
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getRiskColor, getRiskLabel } from "@/lib/risk-utils";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="h-full border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl bg-card overflow-hidden">
      <CardContent className="p-8 flex flex-col h-full">
        <div className="flex flex-col gap-1 mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Environmental Health Risk Index
          </span>
          <h2 className="text-xl font-headline font-bold text-foreground">
            Aggregate EHRI Level
          </h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="h-[240px] w-full max-w-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="90%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={85}
                  outerRadius={110}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1500}
                >
                  <Cell fill={color} />
                  <Cell fill="hsl(var(--muted))" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="absolute top-[50%] flex flex-col items-center">
            <span className="text-7xl font-headline font-bold tracking-tighter" style={{ color }}>
              {score.toFixed(1)}
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border mt-2 bg-background/50 backdrop-blur-sm">
               <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
               <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                {label}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-6 border-t border-border/40">
          <p className="text-sm text-muted-foreground font-medium italic">
            &ldquo;{status}&rdquo;
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
