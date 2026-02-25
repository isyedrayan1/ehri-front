
"use client";

import { useState } from "react";
import { interactiveQa } from "@/ai/flows/interactive-qa";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquareText, Bot, Loader2, Sparkles } from "lucide-react";
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
      setAnswer("Our intelligence node is currently recalibrating. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-border/40 shadow-sm rounded-3xl bg-card overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/5 rounded-xl">
            <MessageSquareText className="w-4 h-4 text-primary" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Scientific Inquiry Gateway
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative group">
          <Input
            placeholder={`Query details about ${cityData.city}'s environmental load...`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="h-14 pl-6 pr-14 bg-[#f8fafc] border-none shadow-inner rounded-2xl focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/60 font-medium"
            disabled={loading}
          />
          <Button 
            type="submit" 
            disabled={loading} 
            size="icon" 
            className="absolute right-2 top-2 h-10 w-10 bg-foreground hover:bg-foreground/90 rounded-xl transition-all shadow-md group-hover:scale-105"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>

        {answer && (
          <div className="mt-6 p-6 rounded-2xl bg-[#f8fafc] border border-border/20 flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="mt-1 p-1.5 bg-foreground/5 rounded-lg shrink-0 h-fit">
              <Bot className="w-4 h-4 text-foreground/70" />
            </div>
            <div className="space-y-3">
              <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                {answer}
              </p>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-primary/40" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Verified Response</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
