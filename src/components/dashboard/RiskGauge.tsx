
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getRiskColor, getRiskLabel } from "@/lib/risk-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RiskGaugeProps {
  score: number;
}

export function RiskGauge({ score }: RiskGaugeProps) {
  const data = [
    { value: score },
    { value: 100 - score },
  ];

  const color = getRiskColor(score);
  const label = getRiskLabel(score);

  return (
    <Card className="h-full flex flex-col items-center justify-center overflow-hidden">
      <CardHeader className="text-center pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Risk Index (EHRI)
        </CardTitle>
      </CardHeader>
      <CardContent className="relative flex flex-col items-center justify-center pt-6 pb-10 w-full">
        <div className="h-[180px] w-full max-w-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="85%"
                startAngle={180}
                endAngle={0}
                innerRadius={70}
                outerRadius={95}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={color} />
                <Cell fill="hsl(var(--muted))" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute top-[55%] flex flex-col items-center">
          <span className="text-5xl font-headline font-bold tabular-nums" style={{ color }}>
            {score.toFixed(1)}
          </span>
          <span className="text-sm font-semibold mt-1" style={{ color: color }}>
            {label}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
