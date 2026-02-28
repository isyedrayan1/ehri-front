
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchCityRisk, CityRiskData, defaultCity, transformToLegacy } from "@/services/api";
import { useDashboard } from "@/hooks/use-dashboard";
import { LoadingOverlay } from "@/components/dashboard/LoadingOverlay";
import { QASection } from "@/components/dashboard/QASection";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Activity, 
  LayoutGrid,
  Wind,
  Cloud,
  ChevronRight,
  Sparkles,
  Zap,
  PanelLeftClose,
  PanelLeft,
  ShieldCheck,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

function ChatContent() {
  const searchParams = useSearchParams();
  const rawCity = searchParams.get("city");
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  
  const cityQuery = rawCity ? decodeURIComponent(rawCity) : defaultCity;
  const latitude = latParam ? parseFloat(latParam) : undefined;
  const longitude = lngParam ? parseFloat(lngParam) : undefined;
  
  const { data: apiData, loading, error, refetch } = useDashboard(cityQuery, latitude, longitude);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Transform for legacy components used in sidebar
  const cityData = apiData ? transformToLegacy(apiData) : null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#fcfcfd]">
      {/* Global Header - Minimalist Navigation */}
      <header className="flex items-center justify-between px-4 h-12 border-b border-border/40 bg-white z-50 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="h-4 w-px bg-border/40" />
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <h1 className="text-[10px] font-black uppercase tracking-[0.2em]">Intelligence Node</h1>
          </div>
        </div>
        
        {cityData && (
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-primary/70">{cityData.city} Grounded</span>
          </div>
        )}
      </header>

      {loading && (
        <div className="flex-1 flex items-center justify-center bg-background">
          <LoadingOverlay />
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full bg-white border border-destructive/20 p-8 rounded-3xl shadow-xl text-center space-y-4">
            <div className="w-12 h-12 bg-destructive/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Activity className="w-6 h-6 text-destructive" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-destructive">Signal Sync Error</h2>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed">
              {error}
            </p>
            <Button 
              onClick={() => refetch()} 
              className="mt-4 bg-foreground text-background rounded-xl font-bold uppercase tracking-widest text-[9px] h-10 px-6"
            >
              Re-sync Telemetry
            </Button>
          </div>
        </div>
      )}

      {cityData && (
        <div className="flex-1 flex overflow-hidden relative">
          {/* Research Context Sidebar */}
          <aside 
            className={cn(
              "absolute lg:relative z-40 h-full bg-muted/5 border-r border-border/40 transition-all duration-300 ease-in-out flex flex-col overflow-hidden",
              isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:w-0"
            )}
          >
            {/* Sidebar Toggle - Integrated below header line */}
            <div className="flex items-center justify-between p-3 border-b border-border/40 bg-white/50">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Research Matrix</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setIsSidebarOpen(false)}
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Compact Diagnostic Card */}
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-xl border border-border/40 shadow-sm group hover:border-primary/20 transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">EHRI Index</span>
                    <a 
                      href={`https://www.openstreetmap.org/search?query=${apiData?.risk_summary.city}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary/40 hover:text-primary transition-colors"
                    >
                      <MapPin className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-black font-headline tracking-tighter">{cityData.ehri}</p>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase">{cityData.status.split('–')[0]}</span>
                  </div>
                  <div className="mt-2 h-1 w-full bg-muted/40 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${cityData.ehri}%` }} />
                  </div>
                  {apiData?.metric_breakdown.station_name && (
                    <div className="mt-3 pt-2 border-t border-border/20 flex items-center gap-1.5">
                      <div className={cn(
                        "w-1 h-1 rounded-full",
                        apiData.metric_breakdown.station_name === "Regional Estimate" ? "bg-orange-400" : "bg-green-500"
                      )} />
                      <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/40 truncate">
                        Source: {apiData.metric_breakdown.station_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Compact Sensor Grid */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <LayoutGrid className="w-3 h-3 text-primary/40" />
                  <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Live Sensor Stream</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-1.5">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-border/40 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Wind className="w-3 h-3 text-blue-500/70" />
                      <span className="text-[9px] font-bold text-muted-foreground/80">PM2.5</span>
                    </div>
                    <span className="text-[10px] font-black font-headline">{cityData.airQuality.pm25}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-border/40 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3 h-3 text-orange-500/70" />
                      <span className="text-[9px] font-bold text-muted-foreground/80">Heat</span>
                    </div>
                    <span className="text-[10px] font-black font-headline">{cityData.weather.temp}°C</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-border/40 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-3 h-3 text-cyan-500/70" />
                      <span className="text-[9px] font-bold text-muted-foreground/80">Humidity</span>
                    </div>
                    <span className="text-[10px] font-black font-headline">{cityData.weather.humidity}%</span>
                  </div>
                </div>
              </div>

              {/* Inquiry Shortcuts */}
              <div className="space-y-2 pt-4 border-t border-border/40">
                <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Shortcuts</h3>
                <div className="space-y-1">
                  {[
                    "Is it safe to jog?",
                    "Risks for seniors?",
                    "Long-term outcomes?",
                  ].map((query, i) => (
                    <button 
                      key={i}
                      className="w-full flex items-center justify-between text-left p-2 rounded-lg bg-white border border-border/40 text-[9px] font-bold text-muted-foreground/80 hover:bg-muted/50 hover:border-border transition-all shadow-sm group"
                    >
                      <span className="truncate pr-2">"{query}"</span>
                      <ChevronRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-border/40 bg-white/40">
              <div className="flex items-center gap-2 text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
                <ShieldCheck className="w-3 h-3" />
                <span>Node Secure</span>
              </div>
            </div>
          </aside>

          {/* Chat Interface Container */}
          <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
            {!isSidebarOpen && (
              <div className="absolute left-2 top-2 z-50">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 bg-white/80 backdrop-blur-sm shadow-sm border-border/40 text-muted-foreground hover:text-foreground hover:bg-white"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <PanelLeft className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex-1 flex flex-col min-h-0">
              <QASection cityData={cityData} lat={latitude} lng={longitude} />
            </div>
          </main>
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
