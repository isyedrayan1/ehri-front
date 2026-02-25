
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Stethoscope, 
  Activity, 
  Heart, 
  Users, 
  AlertTriangle, 
  FileText,
  Microscope,
  Info
} from "lucide-react";
import { CityRiskData } from "@/data/mock-data";
import { cn } from "@/lib/utils";

interface HealthImpactPanelProps {
  healthImpact: CityRiskData["healthImpact"];
}

export function HealthImpactPanel({ healthImpact }: HealthImpactPanelProps) {
  const getSeverityColor = (severity: number) => {
    if (severity > 75) return "bg-red-500";
    if (severity > 50) return "bg-amber-500";
    return "bg-blue-500";
  };

  const getSeverityLabel = (severity: number) => {
    if (severity > 75) return "Critical";
    if (severity > 50) return "Elevated";
    return "Standard";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Clinical Streams */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[2.5rem] bg-card overflow-hidden">
            <CardContent className="p-8 md:p-10 space-y-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/5 rounded-xl">
                    <Microscope className="w-4 h-4 text-primary/70" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Biomedical Pathophysiology</h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/5 rounded-full border border-green-500/10">
                   <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-[9px] font-bold uppercase tracking-widest text-green-600">Clinical Data Stream Active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Respiratory */}
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-xl">
                        <Activity className="w-4 h-4 text-blue-500" />
                      </div>
                      <h4 className="font-headline font-bold text-lg">Respiratory System</h4>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] uppercase font-bold px-2 py-0 border-none", 
                      healthImpact.respiratory.severity > 75 ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {getSeverityLabel(healthImpact.respiratory.severity)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {healthImpact.respiratory.summary}
                  </p>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span>Systemic Load</span>
                        <span>{healthImpact.respiratory.severity}%</span>
                      </div>
                      <Progress value={healthImpact.respiratory.severity} className="h-1" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {healthImpact.respiratory.indicators.map((ind, i) => (
                        <span key={i} className="text-[9px] font-bold uppercase tracking-tight px-2 py-1 bg-muted/50 rounded-md text-muted-foreground">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cardiovascular */}
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 rounded-xl">
                        <Heart className="w-4 h-4 text-red-500" />
                      </div>
                      <h4 className="font-headline font-bold text-lg">Cardiovascular Health</h4>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] uppercase font-bold px-2 py-0 border-none", 
                      healthImpact.cardiovascular.severity > 75 ? "bg-red-50 text-red-600" : "bg-red-50 text-red-600"
                    )}>
                      {getSeverityLabel(healthImpact.cardiovascular.severity)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {healthImpact.cardiovascular.summary}
                  </p>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span>Inflammatory Index</span>
                        <span>{healthImpact.cardiovascular.severity}%</span>
                      </div>
                      <Progress value={healthImpact.cardiovascular.severity} className="h-1" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {healthImpact.cardiovascular.indicators.map((ind, i) => (
                        <span key={i} className="text-[9px] font-bold uppercase tracking-tight px-2 py-1 bg-muted/50 rounded-md text-muted-foreground">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Insights */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[2.5rem] bg-card h-full">
            <CardContent className="p-8 md:p-10 flex flex-col h-full gap-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/5 rounded-xl">
                    <Users className="w-4 h-4 text-primary/70" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Vulnerability Node</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="p-5 rounded-[1.5rem] bg-muted/30 border border-border/40 space-y-2">
                     <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/40">Priority Demographic</p>
                     <p className="text-sm font-bold text-foreground">{healthImpact.vulnerability.demographic}</p>
                  </div>
                  <div className="p-5 rounded-[1.5rem] bg-muted/30 border border-border/40 space-y-2">
                     <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/40">Primary Risk Determinant</p>
                     <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">"{healthImpact.vulnerability.riskFactor}"</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 mt-auto border-t border-border/40 pt-10">
                 <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/5 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-primary/70" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Prognosis Matrix</h3>
                </div>
                <div className="relative">
                   <div className="absolute top-0 left-0 w-1 h-full bg-primary/10 rounded-full" />
                   <p className="pl-6 text-sm text-muted-foreground leading-relaxed font-medium italic">
                     {healthImpact.longTerm}
                   </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30 py-4">
        <Info className="w-3 h-3" />
        <span>Clinical telemetry cross-referenced with ICD-11 diagnostic benchmarks</span>
      </div>
    </div>
  );
}
