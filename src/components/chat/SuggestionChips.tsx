"use client";

import { MessageSquare, Sparkles } from "lucide-react";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (text: string) => void;
  disabled?: boolean;
}

export function SuggestionChips({ suggestions, onSelect, disabled }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {suggestions.map((s, i) => (
        <button
          key={i}
          disabled={disabled}
          onClick={() => onSelect(s)}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border/60 rounded-full text-[11px] font-bold text-foreground/80 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all shadow-sm disabled:opacity-50 group"
        >
          <Sparkles className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors" />
          {s}
        </button>
      ))}
    </div>
  );
}
