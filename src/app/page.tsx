
"use client";

import { useState, useEffect } from "react";
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
import { QASection } from "@/components/dashboard/QASection";
import { HealthImpactPanel } from "@/components/dashboard/HealthImpactPanel";
import { LoadingOverlay } from "@/components/dashboard/LoadingOverlay";
import { fetchCityRisk } from "@/services/api";
import { CityRiskData, defaultCity } from "@/data/mock-data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, MapPin, ShieldCheck } from "lucide-react";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Header />

        {/* Section 1: Location & Initial Context */}
        <section className="mb-12">
           <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div className="space-y-4 w-full max-w-sm">
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full w-fit">
                   <MapPin className="w-3 h-3 text-primary" />
                   <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Stationary Node Alpha-1</span>
                </div>
                <CitySelector 
                  currentCity={currentCityName} 
                  onCityChange={setCurrentCityName} 
                  disabled={loading}
                />
              </div>
              
              {cityData && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
                   <div className="p-4 bg-card rounded-2xl shadow-sm border border-border/40">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">EHRI Score</p>
                      <p className="text-xl font-headline font-bold">{cityData.ehri}</p>
                   </div>
                   <div className="p-4 bg-card rounded-2xl shadow-sm border border-border/40">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">AQI Status</p>
                      <p className="text-xl font-headline font-bold">{cityData.airQuality.status}</p>
                   </div>
                   <div className="p-4 bg-card rounded-2xl shadow-sm border border-border/40">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Thermal Load</p>
                      <p className="text-xl font-headline font-bold">{cityData.weather.temp}°C</p>
                   </div>
                   <div className="p-4 bg-card rounded-2xl shadow-sm border border-border/40">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Risk Status</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase">Active</span>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </section>

        {error && (
          <Alert variant="destructive" className="mb-8 rounded-2xl border-none shadow-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>System Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && <LoadingOverlay />}

        {cityData && (
          <div className="space-y-12 animate-in fade-in duration-1000">
            {/* Section 2: AI Summary (The "So What?") */}
            <section>
              <AIExplanationPanel cityData={cityData} />
            </section>

            {/* Section 3: Interactive QA (The "Ask Anything") */}
            <section className="max-w-3xl mx-auto w-full">
              <QASection cityData={cityData} />
            </section>

            {/* Section 4: All Metrics (The Bento Grid) */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                 <h2 className="text-lg font-headline font-bold">Environmental Sensor Network</h2>
                 <div className="h-px flex-1 bg-border/40" />
              </div>
              <div className="bento-grid">
                {/* Primary Metric (2x2) */}
                <div className="md:col-span-2 md:row-span-2">
                  <RiskGauge score={cityData.ehri} status={cityData.status} />
                </div>

                <div className="md:col-span-1">
                  <AirQualityCard data={cityData.airQuality} />
                </div>

                <div className="md:col-span-1">
                  <WeatherCard weather={cityData.weather} />
                </div>

                <div className="md:col-span-2">
                  <TrendChart trend={cityData.trend} />
                </div>

                <div className="md:col-span-1">
                  <PopulationDensityCard density={cityData.populationDensity} />
                </div>

                <div className="md:col-span-1">
                  <PrecautionsCard precautions={cityData.precautions} />
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

            {/* Section 5: Health Impact Analysis */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                 <h2 className="text-lg font-headline font-bold">Health Impact Analysis</h2>
                 <div className="h-px flex-1 bg-border/40" />
              </div>
              <HealthImpactPanel healthImpact={cityData.healthImpact} />
            </section>
          </div>
        )}

        <footer className="mt-24 pt-12 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          <div className="flex items-center gap-4">
             <ShieldCheck className="w-5 h-5 text-primary/40" />
             <span>&copy; {new Date().getFullYear()} EHRI Research Lab • Institute of Atmospheric Physics</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-foreground transition-colors">Methodology</a>
            <a href="#" className="hover:text-foreground transition-colors">API Gateway</a>
            <a href="#" className="hover:text-foreground transition-colors">Whitepapers</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
