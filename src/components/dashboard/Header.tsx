"use client";

import { ShieldAlert, Moon, Sun, MonitorDot } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <header className="flex items-center justify-between py-10 px-1 mb-8">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="p-3 bg-foreground text-background rounded-2xl shadow-lg transition-transform hover:scale-105">
            <ShieldAlert className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#f8fafc] flex items-center justify-center">
             <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tighter text-foreground leading-none">
            EHRI
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <MonitorDot className="w-3 h-3 text-muted-foreground/40" />
            <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground/60">
              Sensor Intelligence Lab
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
         <div className="hidden md:flex flex-col items-end">
            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">Network Status</span>
            <span className="text-[11px] font-bold text-foreground/80">Operational 24/7</span>
         </div>
         <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsDark(!isDark)}
          className="rounded-2xl h-12 w-12 border-border/60 hover:bg-foreground/5 shadow-sm"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>
    </header>
  );
}