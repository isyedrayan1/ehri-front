"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  SendHorizontal, 
  User, 
  Sparkles,
  Info,
  BrainCircuit,
  Database,
  Lock
} from "lucide-react";
import { CityRiskData } from "@/services/api";
import { cn } from "@/lib/utils";
import { sendChatMessage } from "@/services/chat";
import { Audience, ConversationCard } from "@/types/api";
import { ChatCardRenderer } from "@/components/chat/ChatCardRenderer";
import { SuggestionChips } from "@/components/chat/SuggestionChips";
import { AudienceToggle } from "@/components/chat/AudienceToggle";
import { DetectedCitiesBadges } from "@/components/chat/DetectedCitiesBadges";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "ai";
  content: string;
  card?: ConversationCard;
  suggestions?: string[];
  detectedCities?: string[];
}

interface QASectionProps {
  cityData: CityRiskData;
  lat?: number;
  lng?: number;
  externalQuestion?: string;
  onExternalQuestionConsumed?: () => void;
}

export function QASection({ 
  cityData, 
  lat, 
  lng, 
  externalQuestion, 
  onExternalQuestionConsumed 
}: QASectionProps) {
  const [question, setQuestion] = useState("");
  const [audience, setAudience] = useState<Audience>("public");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: `EHRI Intelligence Agent active. Currently monitoring the ${cityData.city} node with an EHRI of ${cityData.ehri.toFixed(1)}. I can interpret clinical risks, health advisories, and long-term environmental outcomes based on our grounded telemetry.`
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (externalQuestion) {
      setQuestion(externalQuestion);
      onExternalQuestionConsumed?.();
      // Focus the input field after populating it
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [externalQuestion, onExternalQuestionConsumed]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = async (e?: React.FormEvent, customQuestion?: string) => {
    e?.preventDefault();
    const query = customQuestion || question;
    if (!query.trim() || loading) return;

    const userMsg = query.trim();
    setQuestion("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: (m.role === 'ai' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: m.content
      }));

      const response = await sendChatMessage(userMsg, audience, history, lat, lng);
      
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: response.text,
        card: response.cards[0], // Take first card if any
        suggestions: response.suggestions,
        detectedCities: response.detected_cities
      }]);
    } catch (error) {
      setMessages(prev => [
        ...prev, 
        { role: "ai", content: "Signal sync error. The intelligence node is currently under heavy load." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Neural Message Feed - Balanced for High-Density Reading */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto w-full space-y-6">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={cn(
                "flex w-full animate-in fade-in slide-in-from-bottom-1 duration-500",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-[90%] sm:max-w-[80%] flex gap-3",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}>
                <div className={cn(
                  "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm border",
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-white border-border/40 text-primary/60"
                )}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-[13px] leading-relaxed",
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground font-medium rounded-tr-sm" 
                    : "bg-[#f8fafc] border border-border/30 text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-tl-sm"
                )}>
                  {msg.role === "ai" ? (
                    <div className="prose prose-sm prose-slate max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                  
                  {msg.card && (
                    <div className="mt-4">
                      <ChatCardRenderer card={msg.card} />
                    </div>
                  )}

                  {msg.suggestions && msg.role === "ai" && idx === messages.length - 1 && (
                    <SuggestionChips 
                      suggestions={msg.suggestions} 
                      onSelect={(s) => handleSubmit(undefined, s)} 
                      disabled={loading}
                    />
                  )}

                  {msg.detectedCities && msg.detectedCities.length > 0 && msg.role === "ai" && (
                    <div className="mt-4 pt-4 border-t border-border/10">
                      <DetectedCitiesBadges cities={msg.detectedCities} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-7 h-7 rounded-xl bg-white border border-border/40 flex items-center justify-center shrink-0 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-primary/40" />
                </div>
                <div className="bg-[#f8fafc] border border-border/30 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 animate-pulse">Syncing Telemetry...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Inquiry Console - Compact UI */}
      <div className="px-4 md:px-8 pb-6 bg-gradient-to-t from-white via-white to-transparent pt-4 space-y-4">
        <div className="max-w-3xl mx-auto w-full">
           <AudienceToggle 
            current={audience} 
            onChange={setAudience} 
            disabled={loading} 
          />
        </div>

        <div className="max-w-3xl mx-auto w-full space-y-3">
          <form onSubmit={(e) => handleSubmit(e)} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <Input
              ref={inputRef}
              placeholder={loading ? "Synthesizing response..." : `Inquire about ${cityData.city} risk profile...`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="h-12 pl-5 pr-14 bg-white border-border/60 shadow-lg rounded-2xl focus:ring-1 focus:ring-primary/10 placeholder:text-muted-foreground/40 font-medium text-xs transition-all relative z-10"
              disabled={loading}
            />
            <Button 
              type="submit" 
              disabled={loading || !question.trim()} 
              size="icon" 
              className="absolute right-1.5 top-1.5 h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-20 z-20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizontal className="w-4 h-4" />}
            </Button>
          </form>
          
          <div className="flex items-center justify-center gap-6 text-[7px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 px-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Neural Synthesis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database className="w-2.5 h-2.5" />
              <span>Telemetry Grounded</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-2.5 h-2.5" />
              <span>Private Node</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
