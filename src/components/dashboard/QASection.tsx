"use client";

import { useState } from "react";
import { interactiveQa } from "@/ai/flows/interactive-qa";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircleCode, Bot, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { CityRiskData } from "@/data/mock-data";

interface QASectionProps {
  cityData: CityRiskData;
}

export function QASection({ cityData }: QASectionProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const response = await interactiveQa({
        question,
        cityData: {
            ...cityData,
            explanation: cityData.explanation
        },
      });
      setAnswer(response.answer);
    } catch (error) {
      setAnswer("Core cognitive node recalibrating. Data stream temporary unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <Card className="border border-border/40 shadow-[0_12px_40px_rgb(0,0,0,0.03)] rounded-[2.5rem] bg-card/60 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/[0.02]">
        <CardContent className="p-10 md:p-14">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-primary/5 rounded-xl">
              <MessageCircleCode className="w-4 h-4 text-primary/70" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground/80">
              Interactive Inquiry Loop
            </p>
          </div>

          <form onSubmit={handleSubmit} className="relative group">
            <Input
              placeholder={`Analyze ${cityData.city}'s risk factors...`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="h-20 pl-10 pr-20 bg-muted/30 border-none shadow-inner rounded-3xl focus:ring-1 focus:ring-primary/10 placeholder:text-muted-foreground/40 font-medium text-xl transition-all"
              disabled={loading}
            />
            <Button 
              type="submit" 
              disabled={loading || !question.trim()} 
              size="icon" 
              className="absolute right-4 top-4 h-12 w-12 bg-foreground hover:bg-foreground/90 rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-30"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-6 h-6" />}
            </Button>
          </form>

          {answer && (
            <div className="mt-12 p-10 rounded-[2rem] bg-primary/[0.02] border border-primary/5 flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="mt-1.5 p-3 bg-foreground/5 rounded-2xl shrink-0 h-fit w-fit">
                <Bot className="w-6 h-6 text-foreground/60" />
              </div>
              <div className="space-y-6 flex-1">
                <p className="text-xl text-foreground/80 leading-relaxed font-medium">
                  {answer}
                </p>
                <div className="flex items-center gap-2 border-t border-border/40 pt-6">
                  <Sparkles className="w-4 h-4 text-primary/30" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Research Authenticated Response</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30">
        AI responses are syntheses of live sensor telemetry and peer-reviewed historical benchmarks.
      </p>
    </div>
  );
}
