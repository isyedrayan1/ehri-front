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
      <div className="absolute -inset-2 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 rounded-[3rem] blur-2xl opacity-40 pointer-events-none" />
      <Card className="border-none shadow-[0_12px_40px_rgb(0,0,0,0.03)] rounded-[2.5rem] bg-card/90 backdrop-blur-xl relative overflow-hidden group">
        <CardContent className="p-12 md:p-16 lg:p-20">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-foreground/5 rounded-2xl">
                <BrainCircuit className="w-5 h-5 text-foreground/80" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground/80">
                Cognitive Synthesis Hub
              </span>
            </div>
            <Sparkles className="w-5 h-5 text-primary/20 animate-pulse" />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-8">
              <div className="relative">
                 <Loader2 className="w-10 h-10 animate-spin text-primary/10" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse" />
                 </div>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground/60 tracking-[0.4em] uppercase">
                Synthesizing Neural Indicators...
              </span>
            </div>
          ) : (
            <div className="relative space-y-16">
              <div className="relative">
                <Quote className="absolute -top-10 -left-12 w-24 h-24 text-foreground/[0.03]" />
                <p className="text-2xl md:text-3xl lg:text-4xl leading-[1.3] text-foreground font-headline font-medium tracking-tight max-w-5xl">
                  {explanation}
                </p>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 pt-10 border-t border-border/40">
                <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-3">
                      <div className="h-0.5 w-8 bg-primary/20" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">EHRI-Agent V.2.14</span>
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-11">Verified Research Data Synthesis</span>
                </div>

                <Link href={`/chat?city=${cityData.city}`}>
                  <Button size="lg" className="h-16 px-10 rounded-2xl bg-foreground text-background hover:bg-foreground/90 text-sm font-bold gap-4 group transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/10">
                    <MessageSquarePlus className="w-5 h-5" />
                    Deep Inquiry Mode
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
