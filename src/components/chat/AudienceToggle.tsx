"use client";

import { Audience } from "@/types/api";
import { cn } from "@/lib/utils";
import { User, Microscope, Landmark } from "lucide-react";

interface AudienceToggleProps {
  current: Audience;
  onChange: (audience: Audience) => void;
  disabled?: boolean;
}

export function AudienceToggle({ current, onChange, disabled }: AudienceToggleProps) {
  const options: { value: Audience; label: string; icon: any }[] = [
    { value: "public", label: "Public", icon: User },
    { value: "researcher", label: "Researcher", icon: Microscope },
    { value: "professional", label: "Professional", icon: Landmark },
  ];

  return (
    <div className="flex p-1 bg-muted/50 rounded-xl border border-border/40 w-full">
      {options.map((opt) => (
        <button
          key={opt.value}
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
            current === opt.value
              ? "bg-white text-primary shadow-sm border border-border/20"
              : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-white/40"
          )}
        >
          <opt.icon className={cn("w-3.5 h-3.5", current === opt.value ? "text-primary" : "text-muted-foreground/40")} />
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
