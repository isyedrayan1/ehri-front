"use client";

import { NewsDigestCard } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper, ExternalLink, Calendar } from "lucide-react";
import { format } from "date-fns";

interface NewsDigestSectionProps {
  data: NewsDigestCard;
}

export function NewsDigestSection({ data }: NewsDigestSectionProps) {
  if (!data.articles || data.articles.length === 0) return null;

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-foreground/5 rounded-xl">
          <Newspaper className="w-4 h-4 text-foreground/70" />
        </div>
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Regional News Intelligence</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.articles.map((article, idx) => (
          <a 
            key={idx} 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group block h-full"
          >
            <Card className="h-full border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl bg-card overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 bg-primary/5 px-2 py-1 rounded-md">
                    {article.source}
                  </span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </div>
                
                <h3 className="text-sm font-headline font-bold leading-snug mb-3 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                
                {article.description && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                    {article.description}
                  </p>
                )}
                
                <div className="mt-auto pt-4 border-t border-border/40 flex items-center gap-2 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(article.published_at), "MMM d, yyyy")}
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
