
"use client";

import { useState } from "react";
import { interactiveQa } from "@/ai/flows/interactive-qa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, Bot, Loader2 } from "lucide-react";
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
      console.error("QA error:", error);
      setAnswer("I'm sorry, I couldn't process that question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" />
          Interactive Environmental Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder={`Ask about ${cityData.city}'s health risks...`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={loading} size="icon" className="shrink-0 bg-accent hover:bg-accent/90">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>

        {answer && (
          <div className="p-4 rounded-xl bg-secondary/50 border border-secondary flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mt-1 p-1 bg-accent/10 rounded-lg shrink-0 h-fit">
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed font-medium">
              {answer}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
