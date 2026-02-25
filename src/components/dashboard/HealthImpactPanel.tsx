"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Heart, 
  Users, 
  AlertTriangle, 
  Microscope,
  Info
} from "lucide-react";
import { CityRiskData } from "@/data/mock-data";
import { cn } from "@/lib/utils";

interface HealthImpactPanelProps {
  healthImpact: CityRiskData["healthImpact"];
}

export function HealthImpactPanel({ healthImpact }: HealthImpactPanelProps) {
  const getSeverityLabel = (severity: number) => {
    if (severity > 75) return "Critical";
    if (severity > 50) return "Elevated";
    return "Standard";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Clinical Streams */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[2.5rem] bg-card overflow-hidden">
            <CardContent className="p-8 md:p-12 space-y-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border/40 pb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/5 rounded-2xl">
                    <Microscope className="w-5 h-5 text-primary/70" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Biomedical Pathophysiology</h3>
                    <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest mt-1">Diagnostic System Stream Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/5 rounded-full border border-green-500/10 w-fit">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-[9px] font-bold uppercase tracking-widest text-green-600">Clinical Telemetry Sync</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                {/* Respiratory */}
                <div className="space-y-8">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-blue-50 rounded-2xl">
                        <Activity className="w-5 h-5 text-blue-500" />
                      </div>
                      <h4 className="font-headline font-bold text-xl">Respiratory System</h4>
                    </div>
                    <Badge variant="outline" className={cn("text-[9px] uppercase font-black px-3 py-0.5 border-none tracking-widest", 
                      healthImpact.respiratory.severity > 75 ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {getSeverityLabel(healthImpact.respiratory.severity)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium min-h-[4.5rem]">
                      {healthImpact.respiratory.summary}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        <span>Systemic Inflammatory Load</span>
                        <span>{healthImpact.respiratory.severity}%</span>
                      </div>
                      <Progress value={healthImpact.respiratory.severity} className="h-1.5 bg-muted/30" />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {healthImpact.respiratory.indicators.map((ind, i) => (
                        <span key={i} className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 bg-muted/40 rounded-lg text-muted-foreground/70 border border-border/20">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cardiovascular */}
                <div className="space-y-8">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-red-50 rounded-2xl">
                        <Heart className="w-5 h-5 text-red-500" />
                      </div>
                      <h4 className="font-headline font-bold text-xl">Cardiovascular Health</h4>
                    </div>
                    <Badge variant="outline" className={cn("text-[9px] uppercase font-black px-3 py-0.5 border-none tracking-widest", 
                      healthImpact.cardiovascular.severity > 75 ? "bg-red-50 text-red-600" : "bg-red-50 text-red-600"
                    )}>
                      {getSeverityLabel(healthImpact.cardiovascular.severity)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium min-h-[4.5rem]">
                      {healthImpact.cardiovascular.summary}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        <span>Oxidative Stress Index</span>
                        <span>{healthImpact.cardiovascular.severity}%</span>
                      </div>
                      <Progress value={healthImpact.cardiovascular.severity} className="h-1.5 bg-muted/30" />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {healthImpact.cardiovascular.indicators.map((ind, i) => (
                        <span key={i} className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 bg-muted/40 rounded-lg text-muted-foreground/70 border border-border/20">
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
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[2.5rem] bg-card flex-1">
            <CardContent className="p-8 md:p-10 flex flex-col h-full justify-between">
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/5 rounded-2xl">
                    <Users className="w-5 h-5 text-primary/70" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Vulnerability Node</h3>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="group p-6 rounded-[2rem] bg-muted/20 border border-border/30 space-y-3 transition-colors hover:bg-muted/30">
                     <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/40">Priority Demographic</p>
                     <p className="text-base font-bold text-foreground leading-tight">{healthImpact.vulnerability.demographic}</p>
                  </div>
                  <div className="group p-6 rounded-[2rem] bg-muted/20 border border-border/30 space-y-3 transition-colors hover:bg-muted/30">
                     <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/40">Primary Risk Determinant</p>
                     <p className="text-sm font-medium text-muted-foreground/90 leading-relaxed italic border-l-2 border-primary/10 pl-4">
                       "{healthImpact.vulnerability.riskFactor}"
                     </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8 mt-12 pt-10 border-t border-border/40">
                 <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/5 rounded-2xl">
                    <AlertTriangle className="w-5 h-5 text-primary/70" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Prognosis Matrix</h3>
                </div>
                <div className="relative">
                   <p className="text-sm text-muted-foreground/70 leading-relaxed font-medium italic">
                     {healthImpact.longTerm}
                   </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 py-8 border-t border-border/20">
        <Info className="w-3.5 h-3.5" />
        <span>Research-Grade clinical benchmarks referenced against WHO Air Quality Guidelines (2021)</span>
      </div>
    </div>
  );
}
