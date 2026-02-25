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
  Timer
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
    <div className="space-y-12 animate-in fade-in duration-1000 ease-in-out">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Main Clinical Streams */}
        <div className="lg:col-span-8">
          <Card className="border-none shadow-[0_8px_40px_rgb(0,0,0,0.02)] rounded-[2.5rem] bg-card/80 backdrop-blur-sm h-full flex flex-col overflow-hidden border border-border/20">
            <CardContent className="p-8 md:p-12 flex-1 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 pb-8 border-b border-border/40">
                <div className="flex items-center gap-5">
                  <div className="p-3.5 bg-primary/5 rounded-[1.25rem]">
                    <Microscope className="w-6 h-6 text-primary/70" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Biomedical Pathophysiology</h3>
                    <p className="text-lg font-headline font-bold text-foreground mt-0.5">Diagnostic Synthesis</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 bg-green-500/5 rounded-full border border-green-500/10 w-fit">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">Active Telemetry Sync</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16 mb-12">
                {/* Respiratory Section */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-blue-500/5 rounded-2xl">
                        <Activity className="w-5 h-5 text-blue-500" />
                      </div>
                      <h4 className="font-headline font-bold text-xl tracking-tight">Respiratory System</h4>
                    </div>
                    <Badge variant="outline" className={cn("text-[9px] font-black uppercase px-2.5 py-0.5 tracking-widest border", 
                      getSeverityColor(healthImpact.respiratory.severity)
                    )}>
                      {getSeverityLabel(healthImpact.respiratory.severity)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-6 flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground/90 leading-relaxed font-medium min-h-[4rem]">
                      {healthImpact.respiratory.summary}
                    </p>
                    
                    <div className="space-y-3 mt-auto">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                        <span>Inflammatory Load</span>
                        <span className="text-foreground">{healthImpact.respiratory.severity}%</span>
                      </div>
                      <Progress value={healthImpact.respiratory.severity} className="h-2 bg-muted/30" />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4">
                      {healthImpact.respiratory.indicators.map((ind, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/30 rounded-xl text-[10px] font-bold text-muted-foreground/80 border border-border/10">
                          <ChevronRight className="w-3 h-3 text-primary/30" />
                          {ind}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cardiovascular Section */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-red-500/5 rounded-2xl">
                        <Heart className="w-5 h-5 text-red-500" />
                      </div>
                      <h4 className="font-headline font-bold text-xl tracking-tight">Cardiovascular Health</h4>
                    </div>
                    <Badge variant="outline" className={cn("text-[9px] font-black uppercase px-2.5 py-0.5 tracking-widest border", 
                      getSeverityColor(healthImpact.cardiovascular.severity)
                    )}>
                      {getSeverityLabel(healthImpact.cardiovascular.severity)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-6 flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground/90 leading-relaxed font-medium min-h-[4rem]">
                      {healthImpact.cardiovascular.summary}
                    </p>
                    
                    <div className="space-y-3 mt-auto">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                        <span>Oxidative Stress</span>
                        <span className="text-foreground">{healthImpact.cardiovascular.severity}%</span>
                      </div>
                      <Progress value={healthImpact.cardiovascular.severity} className="h-2 bg-muted/30" />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4">
                      {healthImpact.cardiovascular.indicators.map((ind, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/30 rounded-xl text-[10px] font-bold text-muted-foreground/80 border border-border/10">
                          <ChevronRight className="w-3 h-3 text-primary/30" />
                          {ind}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* New Bottom Section: Clinical Data Stream */}
              <div className="mt-auto pt-10 border-t border-border/40 grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { label: "Confidence Interval", value: "94.2%", icon: Database },
                   { label: "Clinical Refresh", value: "Real-time", icon: Timer },
                   { label: "Sensor Fidelity", value: "Grade-A", icon: Microscope },
                 ].map((item, idx) => (
                   <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-primary/[0.02] border border-primary/5 group hover:bg-primary/[0.04] transition-all">
                      <div className="p-2 bg-white rounded-xl shadow-sm border border-border/40 group-hover:scale-110 transition-transform">
                        <item.icon className="w-4 h-4 text-primary/40" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{item.label}</span>
                        <span className="text-xs font-bold text-foreground">{item.value}</span>
                      </div>
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Insights */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <Card className="border-none shadow-[0_8px_40px_rgb(0,0,0,0.02)] rounded-[2.5rem] bg-card/80 backdrop-blur-sm flex-1 border border-border/20">
            <CardContent className="p-8 md:p-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-12">
                <div className="p-3 bg-primary/5 rounded-[1rem]">
                  <Users className="w-5 h-5 text-primary/70" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Vulnerability Matrix</h3>
              </div>
              
              <div className="space-y-6 flex-1">
                <div className="p-6 rounded-[2rem] bg-background/40 border border-border/30 space-y-3 hover:border-primary/20 transition-all group">
                   <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/40 group-hover:text-primary/60 transition-colors">Risk Priority Demographic</p>
                   <p className="text-lg font-headline font-bold text-foreground leading-tight">{healthImpact.vulnerability.demographic}</p>
                </div>
                <div className="p-6 rounded-[2rem] bg-background/40 border border-border/30 space-y-4 hover:border-primary/20 transition-all group">
                   <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/40 group-hover:text-primary/60 transition-colors">Critical Determinant</p>
                   <div className="border-l-2 border-primary/10 pl-4 py-1">
                     <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">
                       "{healthImpact.vulnerability.riskFactor}"
                     </p>
                   </div>
                </div>
              </div>

              <div className="mt-12 pt-10 border-t border-border/40 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/5 rounded-[1rem]">
                    <AlertTriangle className="w-5 h-5 text-primary/70" />
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Long-term Prognosis</h3>
                </div>
                <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium italic pl-1">
                  {healthImpact.longTerm}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-[0.45em] text-muted-foreground/30 py-4">
        <Info className="w-3.5 h-3.5" />
        <span>Clinical telemetry cross-referenced with WHO Air Quality Standards (2021)</span>
      </div>
    </div>
  );
}
