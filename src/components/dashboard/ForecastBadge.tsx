"use client";

import { ForecastTrend } from "@/types/api";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ForecastBadgeProps {
  trend: ForecastTrend | "Unknown";
  className?: string;
}

export function ForecastBadge({ trend, className }: ForecastBadgeProps) {
  if (!trend || trend === "Unknown" || typeof trend !== 'string') return null;

  const config = {
    Rising: {
      color: "text-red-600 bg-red-50 border-red-100",
      icon: TrendingUp,
      label: "Rising Risk",
      bg: "bg-red-500",
    },
    Falling: {
      color: "text-green-600 bg-green-50 border-green-100",
      icon: TrendingDown,
      label: "Improving",
      bg: "bg-green-500",
    },
    Stable: {
      color: "text-slate-600 bg-slate-50 border-slate-100",
      icon: Minus,
      label: "Stable",
      bg: "bg-slate-400",
    },
  };

  // Normalize casing just in case backend returns "rising" instead of "Rising"
  const normalizedTrend = (trend.charAt(0).toUpperCase() + trend.slice(1).toLowerCase()) as keyof typeof config;
  const item = config[normalizedTrend];

  if (!item) {
    console.warn(`ForecastBadge: Unexpected trend value received: "${trend}"`);
    return null;
  }

  const { color, icon: Icon, label, bg } = item;

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all",
      color,
      className
    )}>
      <div className={cn("w-1 h-1 rounded-full animate-pulse", bg)} />
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
}
