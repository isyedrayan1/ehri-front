"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-16 animate-pulse">
      {/* Hero Stats Skeleton */}
      <div className="flex flex-wrap gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 min-w-[120px] h-24 bg-muted/20 rounded-2xl border border-border/10" />
        ))}
      </div>

      {/* Bento Grid Skeleton */}
      <div className="bento-grid gap-6">
        <div className="md:col-span-2 md:row-span-2 h-[450px] bg-muted/20 rounded-[2.5rem]" />
        <div className="md:col-span-1 h-[220px] bg-muted/20 rounded-2xl" />
        <div className="md:col-span-1 h-[220px] bg-muted/20 rounded-2xl" />
        <div className="md:col-span-1 h-[220px] bg-muted/20 rounded-2xl" />
        <div className="md:col-span-1 h-[220px] bg-muted/20 rounded-2xl" />
        <div className="md:col-span-2 h-[260px] bg-muted/20 rounded-2xl" />
        <div className="md:col-span-2 h-[260px] bg-muted/20 rounded-2xl" />
      </div>

      {/* AI Panel Skeleton */}
      <div className="h-48 bg-muted/20 rounded-[2.5rem]" />
    </div>
  );
}
