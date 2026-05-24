"use client";
import { useEffect, useRef } from 'react';
import { ShieldCheck, Activity, Wind, BrainCircuit } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "Live Sensor Matrix",
    description: "Bento-grid visualization of PM2.5, Temperature, Humidity, and Density.",
    icon: Wind,
    colSpan: "md:col-span-2",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "AI Synthesis",
    description: "AI-generated risk explanations grounded in live data.",
    icon: BrainCircuit,
    colSpan: "md:col-span-1",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Biomedical Impact",
    description: "Clinical-grade analysis of respiratory and cardiovascular risks.",
    icon: Activity,
    colSpan: "md:col-span-1",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Intelligence Node",
    description: "Interactive AI chatbot for deep inquiry into environmental health profiles.",
    icon: ShieldCheck,
    colSpan: "md:col-span-2",
    color: "bg-cyan-500/10 text-cyan-600",
  }
];

export const FeaturesBento = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".bento-card", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(1.2)"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="features" className="py-24 bg-secondary/30" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-headline font-bold text-foreground mb-6">Unprecedented Environmental Insight</h2>
          <p className="text-muted-foreground text-lg">We transform raw atmospheric data into actionable clinical intelligence to protect your health.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.02 }}
              className={`bento-card bg-card border border-border p-8 rounded-3xl shadow-sm ${feature.colSpan} flex flex-col`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.color}`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-2xl font-bold font-headline mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
