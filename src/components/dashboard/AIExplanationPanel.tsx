"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { generateAiExplanation } from "@/ai/flows/ai-generated-explanation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Quote, BrainCircuit, MessageSquarePlus, ArrowRight } from "lucide-react";
import { CityRiskData } from "@/data/mock-data";

interface AIExplanationPanelProps {
  cityData: CityRiskData;
}

export function AIExplanationPanel({ cityData }: AIExplanationPanelProps) {
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function getExplanation() {
      setLoading(true);
      try {
        const result = await generateAiExplanation({
          city: cityData.city,
          ehri: cityData.ehri,
          pollutionStress: cityData.pollutionStress,
          heatStress: cityData.heatStress,
          humidityStress: cityData.humidityStress,
          topFactors: cityData.topFactors,
        });
        setExplanation(result);
      } catch (error) {
        setExplanation(cityData.explanation);
      } finally {
        setLoading(false);
      }
    }
    getExplanation();
  }, [cityData]);

  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-[2.5rem] blur-xl opacity-30 pointer-events-none" />
      <Card className="border-none shadow-[0_8px_32px_rgb(0,0,0,0.02)] rounded-[2.5rem] bg-card/80 backdrop-blur-xl relative overflow-hidden group border border-border/20">
        <CardContent className="p-8 md:p-10 lg:p-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
              <span className="text-[10px] font-bold text-muted-foreground/60 tracking-[0.3em] uppercase">
                Synthesizing...
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
              <div className="lg:col-span-3 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-foreground/5 rounded-xl">
                    <BrainCircuit className="w-4 h-4 text-foreground/70" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                    Cognitive Synthesis Hub
                  </span>
                </div>
                
                <div className="relative">
                  <Quote className="absolute -top-6 -left-6 w-12 h-12 text-foreground/[0.02]" />
                  <p className="text-xl md:text-2xl leading-[1.4] text-foreground font-headline font-medium tracking-tight">
                    {explanation}
                  </p>
                </div>

                <div className="flex items-center gap-6 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                  <span className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    Verified Research Synthesis
                  </span>
                  <span className="hidden sm:inline">EHRI-Agent V.2.14</span>
                </div>
              </div>

              <div className="lg:col-span-1 flex justify-center lg:justify-end">
                <Link href={`/chat?city=${cityData.city}`} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full lg:w-auto h-14 px-8 rounded-2xl bg-foreground text-background hover:bg-foreground/90 text-xs font-bold gap-3 transition-all hover:scale-[1.02] shadow-xl shadow-primary/10 group">
                    <MessageSquarePlus className="w-4 h-4" />
                    Deep Inquiry
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
