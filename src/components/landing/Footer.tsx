"use client";
import { ShieldCheck } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-32 pt-16 pb-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-12 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-bold max-w-7xl mx-auto px-6 lg:px-12 w-full">
      <div className="flex flex-col items-center md:items-start gap-4">
         <div className="flex items-center gap-2">
           <ShieldCheck className="w-4 h-4 text-primary/30" />
           <span>Protocol Secure L-7</span>
         </div>
         <span>&copy; {new Date().getFullYear()} EHRI Research Consortium</span>
      </div>
      <div className="flex flex-wrap justify-center gap-6 md:gap-10">
        <a href="#" className="hover:text-foreground transition-all">Documentation</a>
        <a href="#" className="hover:text-foreground transition-all">Data Privacy</a>
        <a href="#" className="hover:text-foreground transition-all">Academic Citations</a>
      </div>
    </footer>
  );
};
