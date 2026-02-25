
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
import { LoadingOverlay } from "@/components/dashboard/LoadingOverlay";
import { fetchCityRisk } from "@/services/api";
import { CityRiskData, defaultCity } from "@/data/mock-data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowUpRight } from "lucide-react";

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
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Header />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <CitySelector 
            currentCity={currentCityName} 
            onCityChange={setCurrentCityName} 
            disabled={loading}
          />
          {cityData && (
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border/40">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Real-time monitoring active
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8 rounded-2xl border-none shadow-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>System Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && <LoadingOverlay />}

        <div className={`bento-grid transition-all duration-700 ease-out ${loading ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}>
          {cityData && (
            <>
              {/* Primary Card (2x2) */}
              <div className="md:col-span-2 md:row-span-2">
                <RiskGauge score={cityData.ehri} status={cityData.status} />
              </div>

              {/* Air Quality Card */}
              <div className="md:col-span-1">
                <AirQualityCard data={cityData.airQuality} />
              </div>

              {/* Weather Card */}
              <div className="md:col-span-1">
                <WeatherCard weather={cityData.weather} />
              </div>

              {/* Health Summary */}
              <div className="md:col-span-2">
                <AIExplanationPanel cityData={cityData} />
              </div>

              {/* Trend Analysis */}
              <div className="md:col-span-2">
                <TrendChart trend={cityData.trend} />
              </div>

              {/* Population Density */}
              <div className="md:col-span-1">
                <PopulationDensityCard density={cityData.populationDensity} />
              </div>

              {/* Precautions */}
              <div className="md:col-span-1">
                <PrecautionsCard precautions={cityData.precautions} />
              </div>

              {/* Environmental Breakdown */}
              <div className="md:col-span-2">
                <FactorBreakdown 
                  pollution={cityData.pollutionStress} 
                  heat={cityData.heatStress} 
                  humidity={cityData.humidityStress} 
                />
              </div>
            </>
          )}
        </div>

        <footer className="mt-16 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          <span>&copy; {new Date().getFullYear()} EHRI Research Lab • Institute of Atmospheric Physics</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Methodology</a>
            <a href="#" className="hover:text-foreground transition-colors">API Docs</a>
            <a href="#" className="hover:text-foreground transition-colors">System Status</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
