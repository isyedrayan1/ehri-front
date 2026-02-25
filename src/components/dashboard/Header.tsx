
import { ShieldAlert } from "lucide-react";

export function Header() {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <ShieldAlert className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
            EHRI <span className="text-primary font-medium">Intelligence</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            AI-Powered Environmental Health Risk Dashboard
          </p>
        </div>
      </div>
    </header>
  );
}
