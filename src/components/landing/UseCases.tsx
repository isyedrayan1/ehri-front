"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Stethoscope, Users } from 'lucide-react';

const useCases = [
  {
    id: "public-health",
    title: "Public Health Officials",
    icon: Building2,
    description: "Monitor city-wide environmental risks, track PM2.5 trends, and deploy precautionary protocols during high-risk periods to protect vulnerable populations.",
    stats: ["City-wide Monitoring", "Protocol Deployment"]
  },
  {
    id: "patients",
    title: "Asthma Patients",
    icon: Users,
    description: "Get real-time insights on when it's safe to exercise outdoors. Receive AI-driven warnings and actionable advice to minimize respiratory stress.",
    stats: ["Real-time Alerts", "Personalized Advice"]
  },
  {
    id: "clinical",
    title: "Clinical Practitioners",
    icon: Stethoscope,
    description: "Correlate patient symptoms with live environmental data. Use our clinical-grade analysis to understand the impact of air quality on cardiovascular and respiratory systems.",
    stats: ["Diagnostic Bridge", "Environmental Correlation"]
  }
];

export const UseCases = () => {
  const [activeTab, setActiveTab] = useState(useCases[0].id);

  const activeUseCase = useCases.find(c => c.id === activeTab)!;

  return (
    <section id="use-cases" className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-16 md:text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-headline font-bold text-foreground mb-6">Built For Everyone</h2>
          <p className="text-muted-foreground text-lg">Whether you are managing city infrastructure or personal health, EHRI adapts to your intelligence needs.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            {useCases.map((uc) => (
              <button
                key={uc.id}
                onClick={() => setActiveTab(uc.id)}
                className={`flex items-center gap-4 p-5 rounded-2xl text-left transition-all border ${activeTab === uc.id ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 'bg-secondary/50 text-foreground border-transparent hover:bg-secondary'}`}
              >
                <div className={`p-2 rounded-xl ${activeTab === uc.id ? 'bg-primary-foreground/20' : 'bg-background text-primary'}`}>
                  <uc.icon size={24} />
                </div>
                <span className="font-bold text-lg">{uc.title}</span>
              </button>
            ))}
          </div>

          <div className="w-full md:w-2/3 bg-card border border-border rounded-3xl p-8 md:p-12 shadow-xl min-h-[350px] flex flex-col justify-center relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeUseCase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col justify-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8">
                  <activeUseCase.icon size={32} />
                </div>
                <h3 className="text-3xl font-headline font-bold mb-4 text-foreground">{activeUseCase.title}</h3>
                <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                  {activeUseCase.description}
                </p>
                <div className="flex flex-wrap gap-4 mt-auto">
                  {activeUseCase.stats.map((stat, idx) => (
                    <div key={idx} className="px-4 py-2 bg-secondary rounded-lg text-sm font-bold text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {stat}
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
