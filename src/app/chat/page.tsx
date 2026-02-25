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
import { ArrowLeft, MapPin, BrainCircuit } from "lucide-react";

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
    <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
      <Header />
      
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 pt-8">
        <Link href="/">
          <Button variant="ghost" className="gap-2 -ml-4 hover:bg-transparent text-muted-foreground hover:text-foreground font-bold uppercase tracking-widest text-[10px]">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
        
        {cityData && (
          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-border/40 shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-primary/40" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">{cityData.city} Context</span>
          </div>
        )}
      </div>

      {loading && <LoadingOverlay />}

      {cityData && (
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-3 px-3 py-1 bg-primary/5 rounded-full border border-primary/10 mb-2">
              <BrainCircuit className="w-3.5 h-3.5 text-primary/60" />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60">Neural Inquiry Node</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">Environmental Intelligence Agent</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
              Interact with our research synthesis model to explore the specific environmental health profile of {cityData.city}.
            </p>
          </div>

          <QASection cityData={cityData} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12">
            <div className="p-8 bg-card rounded-[2rem] border border-border/40 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Example Inquiry</h3>
              <p className="text-foreground/70 font-medium italic leading-relaxed">
                "What are the specific health risks for elderly residents during peak thermal loads in {cityData.city}?"
              </p>
            </div>
            <div className="p-8 bg-card rounded-[2rem] border border-border/40 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Data Fidelity</h3>
              <p className="text-foreground/70 font-medium italic leading-relaxed">
                "Model responses are cross-referenced with real-time sensor telemetry and biomedical impact benchmarks."
              </p>
            </div>
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
