"use client";

import { DynamicAlertResponse } from "@/types/api";
import { AlertCircle, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDynamicAlertClasses } from "@/lib/risk-utils";
import { useState } from "react";

interface AlertBannerProps {
  alerts: DynamicAlertResponse[];
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  const [closed, setClosed] = useState(false);

  if (alerts.length === 0 || closed) return null;

  return (
    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col gap-3">
        {alerts.map((alert, idx) => (
          <div
            key={`${alert.city}-${alert.alert_type}-${idx}`}
            className={cn(
              "relative overflow-hidden rounded-2xl border p-4 shadow-sm backdrop-blur-md transition-all",
              getDynamicAlertClasses(alert.severity)
            )}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {alert.severity === "critical" ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                ) }
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
                    {alert.city} • {alert.alert_type.replace("_", " ")}
                  </span>
                </div>
                <h4 className="font-headline text-sm font-bold leading-none tracking-tight">
                  {alert.title}
                </h4>
                <p className="text-xs font-medium opacity-90 leading-relaxed">
                  {alert.message}
                </p>
              </div>
              <button 
                onClick={() => setClosed(true)}
                className="opacity-40 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Subtle animated background pulse for critical alerts */}
            {alert.severity === "critical" && (
              <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
