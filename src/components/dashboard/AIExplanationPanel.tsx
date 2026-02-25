
"use client";

import { useState, useEffect } from "react";
import { generateAiExplanation } from "@/ai/flows/ai-generated-explanation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
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
        console.error("AI explanation failed, falling back to static:", error);
        setExplanation(cityData.explanation);
      } finally {
        setLoading(false);
      }
    }
    getExplanation();
  }, [cityData]);

  return (
    <Card className="h-full border-accent/20 bg-accent/[0.02]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-accent uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          AI Intelligence Insight
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-[120px] flex items-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center w-full gap-2 text-muted-foreground italic text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            Synthesizing environmental health report...
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-foreground/90 font-medium">
            {explanation}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
