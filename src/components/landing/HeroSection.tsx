"use client";
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { EHRIComposition } from './EHRIComposition';
import gsap from 'gsap';
import Link from 'next/link';

export const HeroSection = () => {
  const headlineRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-text", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.2
      });
    }, headlineRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 items-center">
        <div ref={headlineRef} className="space-y-8">
          <div className="hero-text inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live Global Matrix
          </div>
          <h1 className="hero-text text-5xl md:text-7xl font-headline font-extrabold tracking-tighter text-foreground leading-[1.1]">
            Environmental <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Risk Intelligence</span>
          </h1>
          <p className="hero-text text-lg md:text-xl text-muted-foreground font-body max-w-lg leading-relaxed">
            Synchronize with the global sensor matrix. Get clinical-grade analysis of respiratory and cardiovascular risks grounded in live environmental data.
          </p>
          <div className="hero-text flex flex-wrap gap-4 pt-4">
            <Link href="/dashboard" className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              Initialize Node
            </Link>
            <a href="#features" className="px-8 py-4 bg-secondary text-secondary-foreground font-bold rounded-2xl hover:bg-secondary/80 transition-all">
              Explore Features
            </a>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.4, type: "spring" }}
          className="relative"
          style={{ perspective: "1000px" }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 blur-3xl -z-10 rounded-full" />
          <div className="rounded-3xl overflow-hidden border border-border shadow-2xl bg-card">
            <EHRIComposition />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
