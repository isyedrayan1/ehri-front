
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, Activity, Heart, AlertTriangle } from "lucide-react";
import { CityRiskData } from "@/data/mock-data";

interface HealthImpactPanelProps {
  healthImpact: CityRiskData["healthImpact"];
}

export function HealthImpactPanel({ healthImpact }: HealthImpactPanelProps) {
  const impacts = [
    { 
      title: "Respiratory System", 
      text: healthImpact.respiratory, 
      icon: Activity, 
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    { 
      title: "Cardiovascular Health", 
      text: healthImpact.cardiovascular, 
      icon: Heart, 
      color: "text-red-500",
      bg: "bg-red-50"
    },
    { 
      title: "Long-term Prognosis", 
      text: healthImpact.longTerm, 
      icon: AlertTriangle, 
      color: "text-amber-500",
      bg: "bg-amber-50"
    },
  ];

  return (
    <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl bg-card">
      <CardContent className="p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-muted rounded-xl">
            <Stethoscope className="w-4 h-4 text-foreground/70" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Clinical Health Analysis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {impacts.map((item, i) => (
            <div key={i} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.bg}`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <h4 className="text-sm font-bold tracking-tight">{item.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
