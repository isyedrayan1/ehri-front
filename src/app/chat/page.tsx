"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/dashboard/Header";
import { QASection } from "@/components/dashboard/QASection";
import { fetchCityRisk } from "@/services/api";
import { CityRiskData, defaultCity } from "@/data/mock-data";
import { LoadingOverlay } from "@/components/dashboard/LoadingOverlay";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Activity, Terminal, ShieldCheck, Database } from "lucide-react";

function ChatContent() {
  const searchParams = useSearchParams();
  const cityQuery = searchParams.get("city") || defaultCity;
  
  const [cityData, setCityData] = useState<CityRiskData | null>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Navigation - Ultra Slim */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border/40 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </Button>
          </Link>
          <div className="h-4 w-px bg-border/40 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" strokeWidth={2.5} />
            <h1 className="text-xs font-black uppercase tracking-[0.2em]">EHRI Intelligence Agent</h1>
          </div>
        </div>
        
        {cityData && (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-4 mr-4">
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Selected Node</span>
                <span className="text-[10px] font-bold text-foreground">{cityData.city}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">EHRI Score</span>
                <span className="text-[10px] font-bold text-foreground">{cityData.ehri}</span>
              </div>
            </div>
            <div className="px-3 py-1 bg-primary text-white rounded-full flex items-center gap-2 shadow-lg shadow-primary/10">
              <MapPin className="w-3 h-3" />
              <span className="text-[9px] font-black uppercase tracking-widest">{cityData.city}</span>
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
        <div className="flex-1 flex overflow-hidden">
          {/* Scientific Context Sidebar */}
          <aside className="w-80 hidden lg:flex flex-col border-r border-border/40 bg-muted/20 overflow-y-auto">
            <div className="p-6 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="w-3 h-3 text-primary/60" />
                  <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Node Telemetry</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: "AQI Level", value: cityData.airQuality.status, icon: ShieldCheck },
                    { label: "Thermal Load", value: `${cityData.weather.temp}°C`, icon: Database },
                    { label: "Humidity Index", value: `${cityData.weather.humidity}%`, icon: Activity },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-2xl border border-border/40 shadow-sm group hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-2 mb-1">
                        <item.icon className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">{item.label}</span>
                      </div>
                      <p className="text-xs font-bold font-headline">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Suggested Inquiries</h3>
                <div className="space-y-2">
                  {[
                    "What are the specific health risks for seniors in this city today?",
                    "Is it safe to go for a 10km run based on current PM2.5 levels?",
                    "How does population density impact the current heat stress?",
                  ].map((query, i) => (
                    <button 
                      key={i}
                      className="w-full text-left p-4 rounded-2xl bg-white border border-border/40 text-[10px] font-bold text-muted-foreground leading-relaxed hover:bg-muted hover:border-border transition-all shadow-sm"
                    >
                      "{query}"
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto p-6 border-t border-border/40">
              <div className="flex items-center gap-3 text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">
                <ShieldCheck className="w-3 h-3" />
                <span>End-to-End Encrypted Node</span>
              </div>
            </div>
          </aside>

          {/* Chat Interface - Full Page Application Style */}
          <div className="flex-1 flex flex-col bg-[#fcfcfd]">
            <QASection cityData={cityData} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<LoadingOverlay />}>
        <ChatContent />
      </Suspense>
    </main>
  );
}