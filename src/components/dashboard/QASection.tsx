"use client";

import { useState, useRef, useEffect } from "react";
import { interactiveQa } from "@/ai/flows/interactive-qa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  Loader2, 
  SendHorizontal, 
  User, 
  Sparkles,
  Info,
  BrainCircuit,
  Database
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
      content: `I am the EHRI Environmental Health Assistant, currently processing real-time telemetry from the ${cityData.city} node. I am ready to interpret clinical risks, health advisories, and environmental impacts based on our latest grounded data.`
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
        { role: "ai", content: "Signal sync error with the Intelligence Node. Please retry your inquiry." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Message Feed - Full Screen Scrollable Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-10 space-y-8 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto w-full space-y-8">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={cn(
                "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-500",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-[85%] sm:max-w-[75%] flex gap-5",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}>
                <div className={cn(
                  "w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-1 shadow-sm",
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-white border border-border/40 text-muted-foreground"
                )}>
                  {msg.role === "user" ? <User className="w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
                </div>
                <div className={cn(
                  "p-5 rounded-[2rem] text-sm leading-relaxed",
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground font-medium rounded-tr-sm" 
                    : "bg-white border border-border/40 text-foreground shadow-sm rounded-tl-sm"
                )}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="flex gap-5 max-w-[75%]">
                <div className="w-9 h-9 rounded-2xl bg-white border border-border/40 flex items-center justify-center shrink-0 shadow-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-primary/40" />
                </div>
                <div className="bg-white border border-border/40 p-5 rounded-[2rem] rounded-tl-sm shadow-sm flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 animate-pulse">Synchronizing Data Streams...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Floating Bottom Console */}
      <div className="p-6 md:p-10 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-3xl mx-auto w-full space-y-4">
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-1000"></div>
            <Input
              placeholder={`Send a message to the ${cityData.city} Intelligence Agent...`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="h-16 pl-6 pr-16 bg-white border-border/60 shadow-xl rounded-[2rem] focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/30 font-medium text-base transition-all relative z-10"
              disabled={loading}
            />
            <Button 
              type="submit" 
              disabled={loading || !question.trim()} 
              size="icon" 
              className="absolute right-3 top-3 h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-30 z-20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizontal className="w-5 h-5" />}
            </Button>
          </form>
          
          <div className="flex items-center justify-center gap-6 text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              <span>Grounded Intelligence</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3" />
              <span>Real-time Telemetry Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-3 h-3" />
              <span>Clinical Standards Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}