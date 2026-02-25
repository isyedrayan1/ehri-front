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
  Info,
  ChevronRight,
  Database,
  Timer,
  ShieldAlert
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

  const getSeverityColor = (severity: number) => {
    if (severity > 75) return "text-red-600 bg-red-50 border-red-100";
    if (severity > 50) return "text-orange-600 bg-orange-50 border-orange-100";
    return "text-blue-600 bg-blue-50 border-blue-100";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 ease-in-out">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Main Clinical Streams */}
        <div className="lg:col-span-8">
          <Card className="border-none shadow-[0_8px_40px_rgb(0,0,0,0.02)] rounded-[2rem] bg-card/80 backdrop-blur-sm h-full flex flex-col overflow-hidden border border-border/20">
            <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/40">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-primary/5 rounded-xl">
                    <Microscope className="w-5 h-5 text-primary/70" />
                  </div>
                  <div>
                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Biomedical Pathophysiology</h3>
                    <p className="text-base font-headline font-bold text-foreground">Diagnostic Synthesis</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-green-500/5 rounded-full border border-green-500/10 w-fit">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-[9px] font-bold uppercase tracking-widest text-green-600">Active Telemetry</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
                {/* Respiratory Section */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <h4 className="font-headline font-bold text-lg tracking-tight">Respiratory</h4>
                    </div>
                    <Badge variant="outline" className={cn("text-[8px] font-black uppercase px-2 py-0 tracking-widest border", 
                      getSeverityColor(healthImpact.respiratory.severity)
                    )}>
                      {getSeverityLabel(healthImpact.respiratory.severity)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4 flex-1 flex flex-col">
                    <p className="text-xs text-muted-foreground/90 leading-relaxed font-medium">
                      {healthImpact.respiratory.summary}
                    </p>
                    
                    <div className="space-y-2.5 mt-auto">
                      <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                        <span>Inflammatory Load</span>
                        <span className="text-foreground">{healthImpact.respiratory.severity}%</span>
                      </div>
                      <Progress value={healthImpact.respiratory.severity} className="h-1.5 bg-muted/30" />
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {healthImpact.respiratory.indicators.map((ind, i) => (
                        <span key={i} className="px-2 py-1 bg-muted/40 rounded-lg text-[9px] font-bold text-muted-foreground/80 border border-border/5">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cardiovascular Section */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-red-500" />
                      <h4 className="font-headline font-bold text-lg tracking-tight">Cardiovascular</h4>
                    </div>
                    <Badge variant="outline" className={cn("text-[8px] font-black uppercase px-2 py-0 tracking-widest border", 
                      getSeverityColor(healthImpact.cardiovascular.severity)
                    )}>
                      {getSeverityLabel(healthImpact.cardiovascular.severity)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4 flex-1 flex flex-col">
                    <p className="text-xs text-muted-foreground/90 leading-relaxed font-medium">
                      {healthImpact.cardiovascular.summary}
                    </p>
                    
                    <div className="space-y-2.5 mt-auto">
                      <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                        <span>Oxidative Stress</span>
                        <span className="text-foreground">{healthImpact.cardiovascular.severity}%</span>
                      </div>
                      <Progress value={healthImpact.cardiovascular.severity} className="h-1.5 bg-muted/30" />
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {healthImpact.cardiovascular.indicators.map((ind, i) => (
                        <span key={i} className="px-2 py-1 bg-muted/40 rounded-lg text-[9px] font-bold text-muted-foreground/80 border border-border/5">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Stream Tickers */}
              <div className="mt-auto pt-6 border-t border-border/40 grid grid-cols-3 gap-4">
                 {[
                   { label: "Confidence", value: "94.2%", icon: Database },
                   { label: "Refresh", value: "Real-time", icon: Timer },
                   { label: "Fidelity", value: "Grade-A", icon: ShieldAlert },
                 ].map((item, idx) => (
                   <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-primary/[0.01] border border-primary/5">
                      <item.icon className="w-3.5 h-3.5 text-primary/30" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/50">{item.label}</span>
                        <span className="text-[10px] font-bold text-foreground">{item.value}</span>
                      </div>
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Insights */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="border-none shadow-[0_8px_40px_rgb(0,0,0,0.02)] rounded-[2rem] bg-card/80 backdrop-blur-sm flex-1 border border-border/20">
            <CardContent className="p-6 md:p-8 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-primary/5 rounded-xl">
                  <Users className="w-4 h-4 text-primary/70" />
                </div>
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Vulnerability Node</h3>
              </div>
              
              <div className="space-y-4 flex-1">
                <div className="p-5 rounded-[1.5rem] bg-muted/30 border border-border/20 space-y-2 hover:bg-muted/40 transition-all cursor-default">
                   <p className="text-[8px] font-black uppercase tracking-widest text-primary/50">Priority Demographic</p>
                   <p className="text-base font-headline font-bold text-foreground leading-tight">{healthImpact.vulnerability.demographic}</p>
                </div>
                <div className="p-5 rounded-[1.5rem] bg-muted/30 border border-border/20 space-y-2 hover:bg-muted/40 transition-all cursor-default">
                   <p className="text-[8px] font-black uppercase tracking-widest text-primary/50">Risk Determinant</p>
                   <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic border-l border-primary/20 pl-3">
                     "{healthImpact.vulnerability.riskFactor}"
                   </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/40 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/5 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-primary/70" />
                  </div>
                  <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Long-term Prognosis</h3>
                </div>
                <p className="text-[11px] text-muted-foreground/80 leading-relaxed font-medium italic">
                  {healthImpact.longTerm}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 py-2">
        <Info className="w-3 h-3" />
        <span>WHO Air Quality Standardized cross-reference (2021)</span>
      </div>
    </div>
  );
}
