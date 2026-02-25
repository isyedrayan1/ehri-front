"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/dashboard/Header";
import { CitySelector } from "@/components/dashboard/CitySelector";
import { RiskGauge } from "@/components/dashboard/RiskGauge";
import { AirQualityCard } from "@/components/dashboard/AirQualityCard";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { PopulationDensityCard } from "@/components/dashboard/PopulationDensityCard";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { AIExplanationPanel } from "@/components/dashboard/AIExplanationPanel";
import { PrecautionsCard } from "@/components/dashboard/PrecautionsCard";
import { FactorBreakdown } from "@/components/dashboard/FactorBreakdown";
import { HealthImpactPanel } from "@/components/dashboard/HealthImpactPanel";
import { LoadingOverlay } from "@/components/dashboard/LoadingOverlay";
import { fetchCityRisk } from "@/services/api";
import { CityRiskData, defaultCity } from "@/data/mock-data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ShieldCheck, Database, MessageSquarePlus, ArrowRight, BrainCircuit } from "lucide-react";

export default function Home() {
  const [currentCityName, setCurrentCityName] = useState(defaultCity);
  const [cityData, setCityData] = useState<CityRiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCityRisk(currentCityName);
        setCityData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentCityName]);

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <Header />

        {/* Section 1: Location & Initial Context */}
        <section className="mb-16 pt-8">
           <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
              <div className="space-y-6 w-full max-w-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full w-fit border border-primary/10">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/60">Live Signal: Alpha Node</span>
                </div>
                <div className="space-y-1">
                   <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Selected Region</h2>
                   <CitySelector 
                    currentCity={currentCityName} 
                    onCityChange={setCurrentCityName} 
                    disabled={loading}
                  />
                </div>
              </div>
              
              {cityData && (
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                   {[
                     { label: "EHRI SCORE", value: cityData.ehri, icon: Database },
                     { label: "AQI STATUS", value: cityData.airQuality.status, icon: ShieldCheck },
                     { label: "THERMAL LOAD", value: `${cityData.weather.temp}°C`, icon: Database },
                   ].map((item, idx) => (
                     <div key={idx} className="flex-1 md:flex-none min-w-[120px] p-5 bg-card rounded-2xl shadow-sm border border-border/40">
                        <div className="flex items-center gap-2 mb-2">
                           <item.icon className="w-3 h-3 text-muted-foreground/60" />
                           <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{item.label}</p>
                        </div>
                        <p className="text-lg font-headline font-bold">{item.value}</p>
                     </div>
                   ))}
                </div>
              )}
           </div>
        </section>

        {error && (
          <Alert variant="destructive" className="mb-12 rounded-3xl border-none shadow-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>System Diagnostic Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && <LoadingOverlay />}

        {cityData && (
          <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
            {/* Section 2: AI Summary (Cognitive Synthesis) */}
            <section>
              <AIExplanationPanel cityData={cityData} />
            </section>

            {/* Section 3: Sensor Matrix (The Bento Grid) */}
            <section>
              <div className="flex items-center gap-4 mb-10">
                 <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Environmental Sensor Matrix</h2>
                 <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
              </div>
              <div className="bento-grid">
                <div className="md:col-span-2 md:row-span-2">
                  <RiskGauge score={cityData.ehri} status={cityData.status} />
                </div>
                <div className="md:col-span-1">
                  <AirQualityCard data={cityData.airQuality} />
                </div>
                <div className="md:col-span-1">
                  <WeatherCard weather={cityData.weather} />
                </div>
                <div className="md:col-span-1">
                  <PopulationDensityCard density={cityData.populationDensity} />
                </div>
                <div className="md:col-span-1">
                  <PrecautionsCard precautions={cityData.precautions} />
                </div>
                <div className="md:col-span-2">
                  <TrendChart trend={cityData.trend} />
                </div>
                <div className="md:col-span-2">
                  <FactorBreakdown 
                    pollution={cityData.pollutionStress} 
                    heat={cityData.heatStress} 
                    humidity={cityData.humidityStress} 
                  />
                </div>
              </div>
            </section>

            {/* Section 4: AI Call to Action */}
            <section className="relative py-12">
               <div className="absolute inset-0 bg-primary/[0.02] rounded-[3rem] -z-10" />
               <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-background border border-border/60 rounded-full shadow-sm">
                    <BrainCircuit className="w-4 h-4 text-primary/40" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Cognitive node online</span>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">Investigate Anomalies with AI</h2>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                      Query our neural network for city-specific risk mitigations, historical context, and predictive health trends.
                    </p>
                  </div>
                  <div className="pt-4">
                    <Link href={`/chat?city=${currentCityName}`}>
                      <Button size="lg" className="h-16 px-10 rounded-2xl bg-foreground text-background hover:bg-foreground/90 text-lg font-bold gap-4 group">
                        <MessageSquarePlus className="w-6 h-6" />
                        Talk with AI
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
               </div>
            </section>

            {/* Section 5: Health Impact Analysis */}
            <section>
              <div className="flex items-center gap-4 mb-10">
                 <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Biomedical Impact Analysis</h2>
                 <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
              </div>
              <HealthImpactPanel healthImpact={cityData.healthImpact} />
            </section>
          </div>
        )}

        <footer className="mt-32 pt-16 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-bold">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-primary/30" />
               <span>Protocol Secure L-7</span>
             </div>
             <span>&copy; {new Date().getFullYear()} EHRI Research Consortium</span>
          </div>
          <div className="flex gap-10">
            <a href="#" className="hover:text-foreground transition-all">Documentation</a>
            <a href="#" className="hover:text-foreground transition-all">Data Privacy</a>
            <a href="#" className="hover:text-foreground transition-all">Academic Citations</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
