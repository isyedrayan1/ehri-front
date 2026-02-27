"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GitCompare, Loader2, Info } from "lucide-react";
import { fetchCityComparison } from "@/services/dashboard";
import { CompareResponse, CityComparisonResponse, ComparisonCard as ComparisonCardType } from "@/types/api";
import { CitySelector, SUPPORTED_CITIES } from "./CitySelector";
import { ComparisonCard } from "@/components/chat/ComparisonCard";

interface CityComparisonModalProps {
  initialCity: string;
}

export function CityComparisonModal({ initialCity }: CityComparisonModalProps) {
  const [cityB, setCityB] = useState<typeof SUPPORTED_CITIES[number]>(
    SUPPORTED_CITIES.find(c => c !== initialCity) || "Mumbai"
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CityComparisonResponse | null>(null);

  const handleCompare = async () => {
    setLoading(true);
    try {
      const data = await fetchCityComparison([initialCity, cityB]);
      
      // Transform multi-city compare into the 2-city card structure we want
      const cityA = data.cities.find(c => c.city === initialCity);
      const cityBObj = data.cities.find(c => c.city === cityB);
      
      if (cityA && cityBObj) {
        const transformed: CityComparisonResponse = {
          city_a: cityA.city,
          city_b: cityBObj.city,
          ehri_a: cityA.ehri,
          ehri_b: cityBObj.ehri,
          comparison_text: `${cityA.city} has an EHRI of ${cityA.ehri.toFixed(1)}, while ${cityBObj.city} is at ${cityBObj.ehri.toFixed(1)}. The risk delta is ${Math.abs(cityA.ehri - cityBObj.ehri).toFixed(1)} points.`,
          card: {
            type: "comparison",
            data: {
              city_a: cityA.city,
              city_b: cityBObj.city,
              ehri_a: cityA.ehri,
              ehri_b: cityBObj.ehri,
              comparison_text: `Differential analysis between ${cityA.city} and ${cityBObj.city}.`
            }
          }
        };
        setResult(transformed);
      }
    } catch (error) {
      console.error("Comparison failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl border-dashed gap-2 text-[10px] font-black uppercase tracking-widest h-10 px-4">
          <GitCompare className="w-4 h-4" />
          Cross-Region Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 bg-muted/30 border-b border-border/20">
          <div className="flex items-center gap-3 mb-2">
             <GitCompare className="w-5 h-5 text-primary" />
             <DialogTitle className="font-headline text-xl font-bold">Risk Vector Comparative Analysis</DialogTitle>
          </div>
          <DialogDescription className="text-xs font-medium text-muted-foreground">
            Benchmarking clinical environmental metrics between node points.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
             <div className="flex-1 w-full space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Primary Node</p>
                <div className="p-4 bg-muted/20 rounded-xl border border-border/10 font-bold text-sm">
                  {initialCity}
                </div>
             </div>
             <div className="p-2 bg-foreground/5 rounded-full">
                <ArrowRight className="w-4 h-4 text-muted-foreground/40" />
             </div>
             <div className="flex-1 w-full space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Comparative Node</p>
                <CitySelector 
                  currentCity={cityB} 
                  onCityChange={(c) => {
                    setCityB(c as any);
                    setResult(null);
                  }} 
                />
             </div>
          </div>

          {!result && (
            <Button 
              className="w-full h-14 rounded-2xl bg-foreground text-background font-bold uppercase tracking-widest text-xs gap-3"
              disabled={loading || cityB === initialCity}
              onClick={handleCompare}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
              Execute Comparison Matrix
            </Button>
          )}

          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <ComparisonCard data={result.card} />
               <div className="mt-6 flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <Info className="w-4 h-4 text-primary/60 mt-0.5" />
                  <p className="text-[11px] font-medium leading-relaxed text-foreground/80">
                    This analysis uses multi-variate normalizing of EHRI signals. Scores represent indexed risk where 100 is theoretical maximum biological stress.
                  </p>
               </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
