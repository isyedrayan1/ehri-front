"use client";

import { useState } from "react";
import { interactiveQa } from "@/ai/flows/interactive-qa";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageCircleCode, Bot, Loader2, Sparkles, ChevronRight } from "lucide-react";
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
    <div className="space-y-6">
      <Card className="border border-border/40 shadow-sm rounded-[2rem] bg-card/60 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/[0.02]">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-primary/5 rounded-xl">
              <MessageCircleCode className="w-4 h-4 text-primary/70" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground/80">
              Interactive Inquiry
            </p>
          </div>

          <form onSubmit={handleSubmit} className="relative group">
            <Input
              placeholder={`Investigate ${cityData.city}'s risk factors...`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="h-16 pl-8 pr-16 bg-muted/30 border-none shadow-inner rounded-2xl focus:ring-1 focus:ring-primary/10 placeholder:text-muted-foreground/40 font-medium text-lg transition-all"
              disabled={loading}
            />
            <Button 
              type="submit" 
              disabled={loading || !question.trim()} 
              size="icon" 
              className="absolute right-3 top-3 h-10 w-10 bg-foreground hover:bg-foreground/90 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-30"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
            </Button>
          </form>

          {answer && (
            <div className="mt-8 p-8 rounded-3xl bg-primary/[0.02] border border-primary/5 flex gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="mt-1.5 p-2 bg-foreground/5 rounded-xl shrink-0 h-fit">
                <Bot className="w-5 h-5 text-foreground/60" />
              </div>
              <div className="space-y-4">
                <p className="text-base text-foreground/80 leading-relaxed font-medium">
                  {answer}
                </p>
                <div className="flex items-center gap-2 border-t border-border/40 pt-4">
                  <Sparkles className="w-3.5 h-3.5 text-primary/30" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Authenticated System Response</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
        AI responses are based on real-time sensor telemetry and historical benchmarks.
      </p>
    </div>
  );
}