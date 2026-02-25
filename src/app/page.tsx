
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { CitySelector } from "@/components/dashboard/CitySelector";
import { RiskGauge } from "@/components/dashboard/RiskGauge";
import { RiskBreakdown } from "@/components/dashboard/RiskBreakdown";
import { FeatureBarChart } from "@/components/dashboard/FeatureBarChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { AIExplanationPanel } from "@/components/dashboard/AIExplanationPanel";
import { QASection } from "@/components/dashboard/QASection";
import { LoadingOverlay } from "@/components/dashboard/LoadingOverlay";
import { fetchCityRisk } from "@/services/api";
import { CityRiskData, defaultCity } from "@/data/mock-data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
    <main className="min-h-screen p-4 md:p-8 lg:p-12 bg-[#F6F7F8]">
      <div className="max-w-7xl mx-auto relative">
        <Header />

        <div className="flex items-center justify-between mb-8">
          <CitySelector 
            currentCity={currentCityName} 
            onCityChange={setCurrentCityName} 
            disabled={loading}
          />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          {/* Column 1: Core Metrics */}
          <div className="flex flex-col gap-6">
            <div className="flex-1">
              {cityData && <RiskGauge score={cityData.ehri} />}
            </div>
            <div className="flex-1">
              {cityData && (
                <RiskBreakdown 
                  pollution={cityData.pollutionStress} 
                  heat={cityData.heatStress} 
                  humidity={cityData.humidityStress} 
                />
              )}
            </div>
          </div>

          {/* Column 2: Analysis */}
          <div className="flex flex-col gap-6">
            <div className="flex-1">
              {cityData && <FeatureBarChart data={cityData.topFactors} />}
            </div>
            <div className="flex-1">
              {cityData && <AIExplanationPanel cityData={cityData} />}
            </div>
          </div>

          {/* Column 3: Trends & Interaction */}
          <div className="flex flex-col gap-6">
             <div className="flex-1">
              {cityData && <TrendChart trend={cityData.trend} />}
            </div>
            <div className="flex-1">
              {cityData && <QASection cityData={cityData} />}
            </div>
          </div>
        </div>

        {loading && <LoadingOverlay />}

        {!cityData && !loading && !error && (
          <div className="text-center p-12 bg-card rounded-2xl shadow-sm border border-dashed text-muted-foreground">
            No data available for the selected city.
          </div>
        )}
      </div>
      
      <footer className="mt-12 pt-8 border-t text-center text-xs text-muted-foreground font-medium">
        &#169; {new Date().getFullYear()} Environmental Health Risk Intelligence (EHRI). All data is simulated for demonstration purposes.
      </footer>
    </main>
  );
}
