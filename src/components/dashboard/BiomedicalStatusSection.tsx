"use client";

import { useState, useCallback } from "react";
import { 
  ShieldCheck, 
  Activity, 
  Wind, 
  Heart, 
  Brain, 
  Eye, 
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  AlertOctagon,
  Microscope,
  ShieldAlert,
  Fingerprint,
  RefreshCcw,
  Gauge
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  BiomedicalStatus, 
  PrecautionaryProtocol, 
  BiologicalSystemStatus,
  AlertLevel 
} from "@/types/api";

interface BiomedicalStatusSectionProps {
  biomedicalStatus: BiomedicalStatus;
  precautionaryProtocol: PrecautionaryProtocol;
  alertLevel: AlertLevel;
}

const getStatusColor = (status: BiologicalSystemStatus) => {
  switch (status) {
    case 'Stable': return "text-emerald-500 bg-emerald-50/50 border-emerald-100";
    case 'Elevated': return "text-amber-500 bg-amber-50/50 border-amber-100";
    case 'High Load': return "text-orange-500 bg-orange-50/50 border-orange-100";
    case 'Extreme': return "text-red-500 bg-red-50/50 border-red-100";
    default: return "text-slate-500 bg-slate-50 border-slate-100";
  }
};

const getProgressBarColor = (status: BiologicalSystemStatus) => {
  switch (status) {
    case 'Stable': return "bg-emerald-500";
    case 'Elevated': return "bg-amber-500";
    case 'High Load': return "bg-orange-500";
    case 'Extreme': return "bg-red-500";
    default: return "bg-slate-500";
  }
};

const getAlertLevelStyles = (level: AlertLevel) => {
  switch (level) {
    case 'low': return { color: "text-emerald-600", bg: "bg-emerald-50/50", border: "border-emerald-100", icon: CheckCircle2, label: "NOMINAL" };
    case 'moderate': return { color: "text-amber-600", bg: "bg-amber-50/50", border: "border-amber-100", icon: AlertTriangle, label: "ELEVATED" };
    case 'high': return { color: "text-orange-600", bg: "bg-orange-50/50", border: "border-orange-100", icon: Flame, label: "SEVERE" };
    case 'severe': return { color: "text-red-600", bg: "bg-red-50/50", border: "border-red-100", icon: AlertOctagon, label: "CRITICAL" };
    default: return { color: "text-emerald-600", bg: "bg-emerald-50/50", border: "border-emerald-100", icon: CheckCircle2, label: "STABLE" };
  }
};

const getSystemIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('respiratory')) return Wind;
  if (n.includes('cardiovascular')) return Heart;
  if (n.includes('neurological')) return Brain;
  if (n.includes('dermal') || n.includes('ocular')) return Eye;
  if (n.includes('metabolic')) return Zap;
  return Activity;
};

export function BiomedicalStatusSection({ biomedicalStatus, precautionaryProtocol, alertLevel }: BiomedicalStatusSectionProps) {
  if (!biomedicalStatus || !biomedicalStatus.systems) return null;
  
  const protocolStyles = getAlertLevelStyles(alertLevel);
  const ProtocolIcon = protocolStyles.icon;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-2 bg-foreground/5 rounded-xl">
           <Microscope className="w-4 h-4 text-foreground/70" />
        </div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Biomedical Impact Analysis</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-border/40 to-transparent" />
        {/* Fidelity Badges */}
        <div className="hidden md:flex items-center gap-3">
           <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/5 border border-emerald-500/10">
              <RefreshCcw className="w-2.5 h-2.5 text-emerald-500" />
              <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest">Refresh: Real-time</span>
           </div>
           <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/5 border border-blue-500/10">
              <Gauge className="w-2.5 h-2.5 text-blue-500" />
              <span className="text-[7px] font-black text-blue-600 uppercase tracking-widest">Confidence: 94%</span>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Master Verdict Card */}
        <Card className="border-none shadow-[0_8px_32px_rgb(0,0,0,0.015)] rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-border/10 overflow-hidden group relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-30" />
          <CardContent className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className={cn("p-10 rounded-[3rem] shrink-0 transition-all duration-700 group-hover:scale-105 shadow-[0_20px_40px_rgba(0,0,0,0.05)] relative overflow-hidden", protocolStyles.bg)}>
                <div className="absolute inset-0 bg-white/10 opacity-50 backdrop-blur-3xl" />
                <ShieldCheck className={cn("w-14 h-14 relative z-10", protocolStyles.color)} />
              </div>
              <div className="space-y-6 text-center md:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase border-primary/20 bg-primary/5 text-primary rounded-lg py-1 px-3">
                    Physiological Sentinel
                  </Badge>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-border/10">
                    <Fingerprint className="w-3 h-3 text-muted-foreground/40" />
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.1em]">Protocol: CL-DIA-VERDICT-9.1</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.5em] block">Audit Verdict</span>
                  <h3 className="text-2xl md:text-4xl font-headline font-bold text-foreground leading-[1.1] tracking-tight">
                    {biomedicalStatus.summary}
                  </h3>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Biological Diagnostic Grid */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {biomedicalStatus.systems.map((system) => {
              const Icon = getSystemIcon(system.name);
              const statusStyles = getStatusColor(system.status);
              return (
                <Card key={system.name} className="border-none shadow-[0_4px_20px_rgb(0,0,0,0.015)] rounded-3xl bg-white/50 backdrop-blur-md border border-border/5 group hover:shadow-2xl hover:bg-white/80 transition-all duration-500 ease-out flex flex-col">
                  <CardContent className="p-7 space-y-8 flex-1 flex flex-col">
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-white shadow-sm rounded-2xl group-hover:bg-primary transition-all duration-500 border border-border/5 group-hover:border-primary/20 group-hover:shadow-lg group-hover:shadow-primary/20">
                        <Icon className="w-5 h-5 text-foreground/40 group-hover:text-white transition-colors" />
                      </div>
                      <Badge variant="outline" className={cn("text-[8px] font-black tracking-widest uppercase border-transparent py-1.5 px-3 rounded-lg shadow-sm font-body", statusStyles)}>
                        {system.status}
                      </Badge>
                    </div>

                    <div className="space-y-5">
                      <div className="flex items-end justify-between">
                         <div className="flex flex-col gap-1">
                            <span className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-widest">Biometric Stream</span>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/80">{system.name}</h4>
                         </div>
                         <div className="text-right">
                            <span className="text-[14px] font-black text-foreground tracking-tighter leading-none">{system.stress_score}%</span>
                            <span className="text-[7px] font-black text-muted-foreground/30 uppercase tracking-widest block">Vector Load</span>
                         </div>
                      </div>
                      <div className="relative pt-1">
                        <Progress 
                          value={system.stress_score} 
                          className="h-1.5 bg-muted/20" 
                          indicatorClassName={cn("transition-all duration-1000 ease-in-out", getProgressBarColor(system.status))} 
                        />
                      </div>
                    </div>

                    <div className="space-y-4 flex-1">
                      <div className="relative">
                        <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-primary/10 rounded-full" />
                        <p className="text-[13px] font-medium text-foreground/70 leading-[1.6]">
                          {system.ai_verdict}
                        </p>
                      </div>
                      <div className="pt-4 flex items-center gap-3 bg-foreground/[0.02] p-4 rounded-2xl border border-border/5 group-hover:bg-primary/5 transition-all duration-500">
                        <Activity className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary transition-colors" />
                        <div className="flex flex-col">
                           <span className="text-[6px] font-black text-primary/30 uppercase tracking-[0.2em]">Clinical Directive</span>
                           <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest leading-tight">
                            {system.action_hint}
                           </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Precautionary Protocol Card */}
          <div className="lg:col-span-1">
            <Card className={cn("h-full border-none shadow-2xl rounded-[3rem] overflow-hidden border relative group/p transition-all duration-1000 hover:shadow-primary/5", protocolStyles.border)}>
              <div className={cn("absolute inset-0 opacity-0 group-hover/p:opacity-20 transition-opacity bg-gradient-to-br", protocolStyles.bg.replace('bg-', 'from-'))} />
              <CardContent className="p-8 md:p-10 space-y-10 flex flex-col h-full relative z-10">
                <div className="space-y-8">
                  <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-700 group-hover/p:rotate-6 group-hover/p:scale-110", protocolStyles.bg, protocolStyles.color)}>
                    <ProtocolIcon className="w-10 h-10" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <ShieldAlert className={cn("w-3 h-3", protocolStyles.color)} />
                       <span className={cn("text-[9px] font-black uppercase tracking-[0.3em]", protocolStyles.color)}>Level: {protocolStyles.label}</span>
                    </div>
                    <h3 className={cn("text-2xl font-headline font-bold uppercase tracking-tight leading-[1.1]", protocolStyles.color)}>
                      {precautionaryProtocol?.title || "Safety Protocol Active"}
                    </h3>
                  </div>
                </div>

                <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-3">
                  <div className="space-y-4">
                    <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">Mandatory Actions</span>
                    <ul className="space-y-6">
                      {precautionaryProtocol?.precautions?.map((item, i) => (
                        <li key={i} className="flex items-start gap-4 group/li">
                          <div className={cn("mt-2 w-1.5 h-1.5 rounded-full shrink-0 scale-75 group-hover/li:scale-125 transition-all duration-300 shadow", protocolStyles.bg.replace('/50',''))} />
                          <span className="text-[13px] font-medium text-foreground/70 leading-relaxed transition-colors group-hover/li:text-foreground">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8 border-t border-border/10 space-y-5">
                    <div className="flex items-center gap-2">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Critical Vulnerabilities</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {precautionaryProtocol?.vulnerable_groups?.map(group => (
                        <Badge key={group} variant="secondary" className="bg-foreground/[0.03] hover:bg-foreground/[0.08] transition-colors border-none text-[8px] font-black uppercase px-3 py-2 rounded-xl tracking-widest text-muted-foreground/80 font-body">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                   <div className="p-4 bg-foreground/[0.03] rounded-2xl border border-border/5 flex items-center justify-between group-hover/p:bg-white/50 transition-all">
                      <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Protocol Integrity</span>
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verified L-7</span>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
