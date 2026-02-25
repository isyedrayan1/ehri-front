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
import { ArrowLeft, MapPin, BrainCircuit, Activity } from "lucide-react";

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
    <div className="max-w-5xl mx-auto px-4 md:px-6 pb-12">
      <Header />
      
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Button>
        </Link>
        
        {cityData && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-border/40 shadow-sm">
            <MapPin className="w-3 h-3 text-primary/40" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">{cityData.city} Context Active</span>
          </div>
        )}
      </div>

      {loading && (
        <div className="h-[60vh] flex items-center justify-center">
          <LoadingOverlay />
        </div>
      )}

      {cityData && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Sidebar Info - Compact */}
          <div className="lg:col-span-1 space-y-4 hidden lg:block">
            <div className="p-5 bg-card rounded-3xl border border-border/40 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-3.5 h-3.5 text-primary/60" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Live Metrics</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">EHRI Score</span>
                  <span className="text-xs font-bold font-headline">{cityData.ehri}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">AQI Status</span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-primary/5 text-primary uppercase border border-primary/10">
                    {cityData.airQuality.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-card rounded-3xl border border-border/40 shadow-sm">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3">Suggested Queries</h3>
              <ul className="space-y-2 text-[10px] font-medium text-muted-foreground/80 leading-snug">
                <li className="p-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-border/40">
                  "Is it safe for a 10km run today?"
                </li>
                <li className="p-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-border/40">
                  "Health risks for seniors?"
                </li>
              </ul>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <QASection cityData={cityData} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <Suspense fallback={<LoadingOverlay />}>
        <ChatContent />
      </Suspense>
    </main>
  );
}
