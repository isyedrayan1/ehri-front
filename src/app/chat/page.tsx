"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchCityRisk } from "@/services/api";
import { CityRiskData, defaultCity } from "@/data/mock-data";
import { LoadingOverlay } from "@/components/dashboard/LoadingOverlay";
import { QASection } from "@/components/dashboard/QASection";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Activity, 
  Terminal, 
  ShieldCheck, 
  Database, 
  PanelLeftClose, 
  PanelLeft,
  LayoutGrid,
  Wind,
  Cloud,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

function ChatContent() {
  const searchParams = useSearchParams();
  const cityQuery = searchParams.get("city") || defaultCity;
  
  const [cityData, setCityData] = useState<CityRiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchCityRisk(cityQuery);
        setCityData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [cityQuery]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#fcfcfd]">
      {/* Ultra-Slim Unified Header */}
      <header className="flex items-center justify-between px-4 h-12 border-b border-border/40 bg-white/80 backdrop-blur-md z-50 shrink-0">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground lg:flex hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </Button>
          <Link href="/">
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground px-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit to Dashboard</span>
            </Button>
          </Link>
          <div className="h-4 w-px bg-border/40" />
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" strokeWidth={2.5} />
            <h1 className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">Intelligence Node</h1>
          </div>
        </div>
        
        {cityData && (
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 rounded-full border border-primary/10 shadow-sm">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary/70">{cityData.city} Node Active</span>
             </div>
          </div>
        )}
      </header>

      {loading && (
        <div className="flex-1 flex items-center justify-center bg-background">
          <LoadingOverlay />
        </div>
      )}

      {cityData && (
        <div className="flex-1 flex overflow-hidden relative">
          {/* Research Context Sidebar - Compact & Toggleable */}
          <aside 
            className={cn(
              "absolute lg:relative z-40 h-full bg-muted/10 border-r border-border/40 transition-all duration-300 ease-in-out flex flex-col overflow-hidden backdrop-blur-xl",
              isSidebarOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full lg:w-0"
            )}
          >
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
              {/* Telemetry Card: EHRI Diagnostic */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Terminal className="w-3 h-3 text-primary/40" />
                  <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Diagnostic Matrix</h3>
                </div>
                
                <div className="p-4 bg-white rounded-2xl border border-border/40 shadow-[0_2px_8px_rgba(0,0,0,0.02)] group hover:border-primary/20 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">EHRI Score</span>
                    <Sparkles className="w-3 h-3 text-primary/20" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black font-headline tracking-tighter">{cityData.ehri}</p>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase">{cityData.status.split('–')[0]}</span>
                  </div>
                  <div className="mt-3 h-1 w-full bg-muted/40 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${cityData.ehri}%` }} />
                  </div>
                </div>
              </div>

              {/* Sensor Grid: Compact Telemetry Cards */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <LayoutGrid className="w-3 h-3 text-primary/40" />
                  <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Live Sensor Stream</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-border/40 shadow-sm hover:border-primary/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-500/5 rounded-lg">
                        <Wind className="w-3.5 h-3.5 text-blue-500/70" />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground/80">PM2.5 Level</span>
                    </div>
                    <span className="text-xs font-black font-headline">{cityData.airQuality.pm25}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-border/40 shadow-sm hover:border-primary/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-orange-500/5 rounded-lg">
                        <Activity className="w-3.5 h-3.5 text-orange-500/70" />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground/80">Thermal Load</span>
                    </div>
                    <span className="text-xs font-black font-headline">{cityData.weather.temp}°C</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-border/40 shadow-sm hover:border-primary/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-cyan-500/5 rounded-lg">
                        <Cloud className="w-3.5 h-3.5 text-cyan-500/70" />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground/80">Air Moisture</span>
                    </div>
                    <span className="text-xs font-black font-headline">{cityData.weather.humidity}%</span>
                  </div>
                </div>
              </div>

              {/* Inquiry Shortcuts */}
              <div className="space-y-3 pt-4 border-t border-border/40">
                <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Neural Shortcuts</h3>
                <div className="space-y-1.5">
                  {[
                    "Safety for outdoor jogging?",
                    "Risks for senior residents?",
                    "Heat vs Pollution impact?",
                  ].map((query, i) => (
                    <button 
                      key={i}
                      className="w-full flex items-center justify-between text-left p-2.5 rounded-xl bg-white border border-border/40 text-[9px] font-bold text-muted-foreground/80 hover:bg-muted/50 hover:border-border transition-all shadow-sm group"
                    >
                      <span className="truncate pr-2 italic">"{query}"</span>
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border/40 bg-white/40">
              <div className="flex items-center gap-2 text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
                <ShieldCheck className="w-3 h-3" />
                <span>Encrypted Node Signal</span>
              </div>
            </div>
          </aside>

          {/* Chat Interface - Compact Command Console */}
          <div className="flex-1 flex flex-col bg-white">
            <QASection cityData={cityData} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <main className="h-screen bg-background overflow-hidden">
      <Suspense fallback={<LoadingOverlay />}>
        <ChatContent />
      </Suspense>
    </main>
  );
}
