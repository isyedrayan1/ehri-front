
import { Loader2 } from "lucide-react";

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-2xl">
      <div className="bg-card p-6 rounded-2xl shadow-xl border flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="text-sm font-semibold text-muted-foreground animate-pulse">
          Analyzing Environmental Indicators...
        </span>
      </div>
    </div>
  );
}
