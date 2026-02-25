"use client";

import { useState, useRef, useEffect } from "react";
import { interactiveQa } from "@/ai/flows/interactive-qa";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  Loader2, 
  SendHorizontal, 
  User, 
  Sparkles,
  Info
} from "lucide-react";
import { CityRiskData } from "@/data/mock-data";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface QASectionProps {
  cityData: CityRiskData;
}

export function QASection({ cityData }: QASectionProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: `I am your Environmental Intelligence Assistant for ${cityData.city}. How can I help you analyze today's risk factors?`
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userMsg = question.trim();
    setQuestion("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const response = await interactiveQa({
        question: userMsg,
        cityData: cityData,
      });
      setMessages(prev => [...prev, { role: "ai", content: response.answer }]);
    } catch (error) {
      setMessages(prev => [
        ...prev, 
        { role: "ai", content: "I encountered a synchronization error with the environmental node. Please restate your inquiry." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/40 shadow-xl rounded-[2.5rem] bg-card/60 backdrop-blur-xl flex flex-col h-[70vh] max-h-[700px] overflow-hidden">
      {/* Header Info */}
      <div className="px-6 py-4 border-b border-border/40 bg-card/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/5 rounded-xl">
            <Bot className="w-4 h-4 text-primary/70" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Intelligence Node</p>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Active Connection</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Grounded Mode</span>
        </div>
      </div>

      {/* Message Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={cn(
              "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[85%] flex gap-3",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1",
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn(
                "p-4 rounded-3xl text-sm font-medium leading-relaxed",
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-tr-none" 
                  : "bg-white border border-border/40 text-foreground rounded-tl-none shadow-sm"
              )}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
              <div className="bg-white border border-border/40 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Analyzing sensor data...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-card/80 border-t border-border/40">
        <form onSubmit={handleSubmit} className="relative">
          <Input
            placeholder={`Inquire about ${cityData.city}...`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="h-14 pl-5 pr-14 bg-muted/40 border-none shadow-inner rounded-2xl focus:ring-1 focus:ring-primary/10 placeholder:text-muted-foreground/30 font-medium text-sm transition-all"
            disabled={loading}
          />
          <Button 
            type="submit" 
            disabled={loading || !question.trim()} 
            size="icon" 
            className="absolute right-2 top-2 h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-30"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizontal className="w-4 h-4" />}
          </Button>
        </form>
        <div className="mt-3 flex items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
          <Sparkles className="w-3 h-3" />
          <span>Grounded in Real-time Telemetry & Clinical Standards</span>
        </div>
      </div>
    </Card>
  );
}
