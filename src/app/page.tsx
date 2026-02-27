"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { LocationSearch } from "@/components/dashboard/LocationSearch";
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
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { CityComparisonModal } from "@/components/dashboard/CityComparisonModal";
import { fetchCityRisk, CityRiskData, defaultCity, transformToLegacy } from "@/services/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDashboard } from "@/hooks/use-dashboard";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { NewsDigestSection } from "@/components/dashboard/NewsDigestSection";
import { DashboardInsightsResponse } from "@/types/api";
import { AlertCircle, ShieldCheck, Database, LayoutGrid, GitCompare, MapPin } from "lucide-react";

export default function Home() {
  const [currentCityName, setCurrentCityName] = useState(defaultCity);
  const [coords, setCoords] = useState<{lat?: number, lng?: number}>({});
  
  // Use the new dashboard hook with coordinates
  const { data, loading, error, refetch } = useDashboard(currentCityName, coords.lat, coords.lng);
  
  // Auto-detect location on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Just set coordinates, hook will refetch
          setCoords({ lat: latitude, lng: longitude });
          
          // Optionally get name too for UI consistency
          import("@/lib/locations").then(lib => {
            lib.reverseGeocode(latitude, longitude).then(loc => {
              if (loc) setCurrentCityName(loc.name);
            });
          });
        },
        () => {
          // Fallback handled by default state
          console.log("Geolocation declined or failed, using default.");
        }
      );
    }
  }, []);

  const handleLocationChange = (city: string, lat?: number, lng?: number) => {
    setCurrentCityName(city);
    setCoords({ lat, lng });
  };

  const apiData = data;

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-24 relative">
        <Header />

        {/* Floating Intelligence Console - Centered Top */}
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[60] w-full max-w-lg px-3 animate-in fade-in slide-in-from-top-8 duration-1000">
           <LocationSearch 
              currentCity={currentCityName} 
              onLocationChange={handleLocationChange} 
              disabled={loading}
           />
        </div>

        {/* Section 1: Contextual Signals */}
        <section className="mb-14 pt-12">
           <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-primary/10 rounded-xl">
                      <MapPin className="w-5 h-5 text-primary" />
                   </div>
                   <h2 className="text-3xl font-headline font-bold text-foreground">
                     {currentCityName} Node
                   </h2>
                </div>
                {apiData && (
                  <div className="flex items-center gap-4 px-1 animate-in fade-in duration-700">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">State Node</span>
                      <span className="text-[10px] font-bold">{apiData.risk_summary.state}</span>
                    </div>
                    <div className="w-px h-6 bg-border/40" />
                    <a 
                      href={`https://www.openstreetmap.org/search?query=${apiData.risk_summary.city}, ${apiData.risk_summary.state}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex flex-col"
                    >
                      <span className="text-[8px] font-black uppercase tracking-widest text-primary/60 group-hover:text-primary transition-colors">Visual Grounding</span>
                      <span className="text-[10px] font-bold flex items-center gap-1 group-hover:underline">
                        View Map <LayoutGrid className="w-2.5 h-2.5" />
                      </span>
                    </a>
                  </div>
                )}
                <div className="pt-2">
                  <CityComparisonModal initialCity={currentCityName} />
                </div>
              </div>
              
              {apiData && (
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                   {[
                     { 
                       label: "EHRI SCORE", 
                       value: apiData.risk_summary.ehri.toFixed(1), 
                       icon: Database 
                     },
                     { 
                       label: "AQI STATUS", 
                       value: apiData.metric_breakdown.metrics.find(m => m.name === 'PM2.5')?.severity.toUpperCase() || "N/A", 
                       icon: ShieldCheck 
                     },
                     { 
                       label: "THERMAL LOAD", 
                       value: `${apiData.metric_breakdown.metrics.find(m => m.name === 'Temperature')?.value || 0}°C`, 
                       icon: Database 
                     },
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

        {/* Global Alert Banner */}
        {apiData && apiData.dynamic_alerts.length > 0 && (
          <AlertBanner alerts={apiData.dynamic_alerts} />
        )}

        {error && (
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <Alert variant="destructive" className="rounded-3xl border-none shadow-xl bg-red-50 text-red-900 p-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
                <div className="space-y-2">
                  <AlertTitle className="text-lg font-headline font-bold">System Telemetry Interrupted</AlertTitle>
                  <AlertDescription className="text-sm font-medium opacity-80 leading-relaxed">
                    {error}
                  </AlertDescription>
                  <button 
                    onClick={() => refetch()}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                  >
                    Re-establish Connection
                  </button>
                </div>
              </div>
            </Alert>
          </div>
        )}

        {loading && <LoadingOverlay />}

        {apiData && (
          <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
            
            {/* Section 2: Sensor Matrix (Bento Grid) */}
            <section>
              <div className="flex items-center gap-4 mb-10">
                 <div className="p-2 bg-foreground/5 rounded-xl">
                    <LayoutGrid className="w-4 h-4 text-foreground/70" />
                 </div>
                 <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Environmental Sensor Matrix</h2>
                 <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
              </div>
              <div className="bento-grid">
                {/* Primary Card: Large diagnostic index */}
                <div className="md:col-span-2 md:row-span-2">
                  <RiskGauge 
                    score={apiData.risk_summary.ehri} 
                    status={apiData.risk_summary.summary} 
                    data={apiData.risk_summary}
                  />
                </div>
                
                {/* Secondary Cards: Metrics and Context */}
                <div className="md:col-span-1">
                  <AirQualityCard 
                    metric={apiData.metric_breakdown.metrics.find(m => m.name === 'PM2.5')} 
                  />
                </div>
                <div className="md:col-span-1">
                  <WeatherCard 
                    tempMetric={apiData.metric_breakdown.metrics.find(m => m.name === 'Temperature')}
                    humidityMetric={apiData.metric_breakdown.metrics.find(m => m.name === 'Humidity')}
                  />
                </div>
                <div className="md:col-span-1">
                  <PopulationDensityCard 
                    metric={apiData.metric_breakdown.metrics.find(m => m.name === 'Population Density')} 
                  />
                </div>
                <div className="md:col-span-1">
                  <PrecautionsCard 
                    precautions={apiData.health_advisory.precautions} 
                  />
                </div>
                
                {/* Tertiary Cards: Trends and Breakdown */}
                <div className="md:col-span-2">
                  <TrendChart 
                    trend={[apiData.risk_summary.ehri]} // Fallback trend
                    forecast={apiData.forecast_snapshot}
                  />
                </div>
                <div className="md:col-span-2">
                  <FactorBreakdown 
                    metrics={apiData.metric_breakdown.metrics}
                  />
                </div>
              </div>
            </section>

            {/* Section 3: AI Summary (Cognitive Synthesis) with CTA */}
            <section>
              <AIExplanationPanel 
                cityData={transformToLegacy(apiData)} 
                aiSummary={apiData.ai_summary} 
                coords={coords}
              />
            </section>

            {/* Section 4: Latest Intelligence News */}
            {apiData.news_digest.articles.length > 0 && (
              <section>
                <NewsDigestSection data={apiData.news_digest} />
              </section>
            )}

            {/* Section 5: Health Impact Analysis */}
            <section>
              <div className="flex items-center gap-4 mb-10">
                 <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Biomedical Impact Analysis</h2>
                 <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
              </div>
              <HealthImpactPanel advisory={apiData.health_advisory} />
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
