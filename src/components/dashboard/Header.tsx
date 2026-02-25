
"use client";

import { ShieldAlert, Moon, Sun } from "lucide-react";
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
    <header className="flex items-center justify-between py-6 px-1 mb-6 border-b border-border/40">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-foreground/5 rounded-xl">
          <ShieldAlert className="w-7 h-7 text-foreground" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-2xl font-headline font-bold tracking-tight text-foreground">
            EHRI
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">
            Enviro-Risk Intelligence
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
         <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsDark(!isDark)}
          className="rounded-full hover:bg-foreground/5"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>
    </header>
  );
}
