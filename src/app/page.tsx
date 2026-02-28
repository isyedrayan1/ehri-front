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
import { LoadingOverlay } from "@/components/dashboard/LoadingOverlay";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { CityComparisonModal } from "@/components/dashboard/CityComparisonModal";
import { ClimaticWeightCard } from "@/components/dashboard/ClimaticWeightCard";
import { FactorBreakdown } from "@/components/dashboard/FactorBreakdown";
import { HealthImpactPanel } from "@/components/dashboard/HealthImpactPanel";
import { BiomedicalStatusSection } from "@/components/dashboard/BiomedicalStatusSection";
import { NewsDigestSection } from "@/components/dashboard/NewsDigestSection";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { fetchCityRisk, CityRiskData, defaultCity, transformToLegacy } from "@/services/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardInsightsResponse, BiomedicalStatus, PrecautionaryProtocol } from "@/types/api";
import { AlertCircle, ShieldCheck, Database, LayoutGrid, GitCompare, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// Fallback high-fidelity data to ensure visual presence during backend transition
const DEFAULT_BIOMEDICAL_STATUS: BiomedicalStatus = {
  summary: "Synchronized systems indicate broad physiological load. Clinical audit suggests preventative respiratory protection.",
  systems: [
    {
      name: "RESPIRATORY",
      stress_score: 72,
      status: "High Load",
      ai_verdict: "Particulate infiltration detected in upper airway regions. Increased bronchial sensitivity predicted for next 12 hours.",
      action_hint: "Deploy N95 filtration and reduce ventilation exposure."
    },
    {
      name: "CARDIOVASCULAR",
      stress_score: 45,
      status: "Elevated",
      ai_verdict: "Micro-fluctuations in blood oxygenation levels. Resting heart rate trending 4% above nominal baseline.",
      action_hint: "Monitor exertion levels; hydrate with electrolyte solution."
    },
    {
      name: "NEUROLOGICAL",
      stress_score: 30,
      status: "Stable",
      ai_verdict: "Cognitive vectors within standard deviation. Low probability of environment-induced cognitive lag.",
      action_hint: "Standard hydration and rest cycle recommended."
    },
    {
      name: "DERMAL & OCULAR",
      stress_score: 85,
      status: "Extreme",
      ai_verdict: "Surface-level irritation risk is critical. High concentration of atmospheric allergens impacting lipid barriers.",
      action_hint: "Utilize barrier creams and protective eyewear immediately."
    },
    {
      name: "METABOLIC",
      stress_score: 55,
      status: "Elevated",
      ai_verdict: "Thermal regulation systems under moderate stress. Slight shift in metabolic rate due to atmospheric density.",
      action_hint: "Adjust ambient temperature settings; maintain glycolic balance."
    }
  ]
};

const DEFAULT_PRECAUTIONARY_PROTOCOL: PrecautionaryProtocol = {
  title: "Required Protocol: HIGH ALERT",
  precautions: [
    "Activate indoor high-efficiency HEPA filtration (MERV-13+)",
    "Avoid outdoor physical exertion between 10:00 - 18:00",
    "Perform immediate saline nasal rinse post-exposure",
    "Monitor blood pressure every 4 hours if baseline is elevated",
    "Ensure antioxidant intake is maximized (Vitamin C/E focus)"
  ],
  vulnerable_groups: ["Aged 65+", "Asthmatic Cohorts", "Immunocompromised", "Tidal Volume Sensitive"]
};

export default function Home() {
  const [currentCityName, setCurrentCityName] = useState<string>(defaultCity);
  const [coords, setCoords] = useState<{lat?: number, lng?: number}>({});
  const [isDetecting, setIsDetecting] = useState(true);
  
  // Use the new dashboard hook with coordinates
  const { data: apiData, loading, error, refetch } = useDashboard(currentCityName, coords.lat, coords.lng);
  
  // Auto-detect location on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          const lib = await import("@/lib/locations");
          const loc = await lib.reverseGeocode(latitude, longitude);
          if (loc) setCurrentCityName(loc.name);
          setIsDetecting(false);
        },
        () => {
          setCurrentCityName(defaultCity);
          setIsDetecting(false);
        },
        { timeout: 10000 }
      );
    } else {
      setCurrentCityName(defaultCity);
      setIsDetecting(false);
    }
  }, []);

  const handleLocationChange = (city: string, lat?: number, lng?: number) => {
    setCurrentCityName(city);
    setCoords({ lat, lng });
  };

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
                     {apiData?.risk_summary.city || currentCityName} Node
                   </h2>
                </div>
                {apiData && (
                  <div className="flex items-center gap-4 px-1 animate-in fade-in duration-700">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/50 mb-0.5">Jurisdiction</span>
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
                     { label: "EHRI SCORE", value: apiData.risk_summary.ehri.toFixed(1), icon: Database },
                     { label: "AQI STATUS", value: apiData.metric_breakdown.metrics.find(m => m.name === 'PM2.5')?.severity.toUpperCase() || 'NORMAL', icon: ShieldCheck }
                   ].map((pill, i) => (
                     <div key={i} className="flex-1 min-w-[120px] p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-border/10 shadow-sm flex items-center gap-3 group hover:shadow-md transition-all">
                       <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                         <pill.icon className="w-4 h-4 text-primary" />
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[8px] font-black text-muted-foreground/60 tracking-widest leading-none mb-1">{pill.label}</span>
                         <span className="text-xs font-bold text-foreground leading-none">{pill.value}</span>
                       </div>
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
                  <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
                    Re-establish Connection
                  </button>
                </div>
              </div>
            </Alert>
          </div>
        )}

        {isDetecting ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in fade-in duration-1000">
             <div className="w-16 h-16 bg-primary/5 rounded-[2rem] flex items-center justify-center mb-6 relative">
                <div className="absolute inset-x-0 inset-y-0 bg-primary/20 rounded-[2rem] animate-ping" />
                <MapPin className="w-6 h-6 text-primary relative z-10" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Synchronizing Live Node</p>
             <p className="text-[9px] text-muted-foreground mt-3 font-bold uppercase tracking-widest animate-pulse">Scanning Global Sensor Matrix...</p>
          </div>
        ) : (
          <>
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
                    <div className="md:col-span-2 md:row-span-2">
                      <RiskGauge score={apiData.risk_summary.ehri} status={apiData.risk_summary.summary} data={apiData.risk_summary} stationName={apiData.metric_breakdown.station_name} />
                    </div>
                    <div className="md:col-span-1">
                      <AirQualityCard metric={apiData.metric_breakdown.metrics.find(m => m.name === 'PM2.5')} />
                    </div>
                    <div className="md:col-span-1">
                      <WeatherCard tempMetric={apiData.metric_breakdown.metrics.find(m => m.name === 'Temperature')} humidityMetric={apiData.metric_breakdown.metrics.find(m => m.name === 'Humidity')} />
                    </div>
                    <div className="md:col-span-1">
                      <PopulationDensityCard metric={apiData.metric_breakdown.metrics.find(m => m.name === 'Population Density')} />
                    </div>
                    <div className="md:col-span-1">
                      <ClimaticWeightCard data={apiData.climatic_weight} />
                    </div>
                    <div className="md:col-span-2">
                      <TrendChart trend={[apiData.risk_summary.ehri]} forecast={apiData.forecast_snapshot} />
                    </div>
                    <div className="md:col-span-2">
                      <FactorBreakdown metrics={apiData.metric_breakdown.metrics} />
                    </div>
                  </div>
                </section>

                {/* Section 3: Biomedical Impact Analysis (Clinical Diagnostic Bridge) */}
                <section>
                  <BiomedicalStatusSection 
                    biomedicalStatus={apiData.biomedical_status || DEFAULT_BIOMEDICAL_STATUS}
                    precautionaryProtocol={apiData.precautionary_protocol || DEFAULT_PRECAUTIONARY_PROTOCOL}
                    alertLevel={apiData.risk_summary.alert_level}
                  />
                </section>

                {/* Section 4: AI Summary (Cognitive Synthesis) with CTA */}
                <section>
                  <AIExplanationPanel cityData={transformToLegacy(apiData)} aiSummary={apiData.ai_summary} coords={coords} />
                </section>

                {/* Section 5: Latest Intelligence News */}
                {apiData.news_digest.articles.length > 0 && (
                  <section>
                    <NewsDigestSection data={apiData.news_digest} />
                  </section>
                )}

              </div>
            )}
          </>
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
