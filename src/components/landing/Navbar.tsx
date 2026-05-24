"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-4' : 'bg-transparent py-6'}`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary text-primary-foreground rounded-xl group-hover:bg-primary/90 transition-colors">
            <ShieldCheck size={20} />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight text-foreground">EHRI</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 font-body font-medium text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#use-cases" className="hover:text-foreground transition-colors">Use Cases</a>
          <a href="#intelligence" className="hover:text-foreground transition-colors">Intelligence Node</a>
        </div>

        <div className="hidden md:flex">
          <Link href="/dashboard" className="px-5 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-transform hover:scale-105 shadow-md">
            Launch Dashboard
          </Link>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenu && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              <a href="#features" onClick={() => setMobileMenu(false)} className="font-medium text-foreground">Features</a>
              <a href="#use-cases" onClick={() => setMobileMenu(false)} className="font-medium text-foreground">Use Cases</a>
              <a href="#intelligence" onClick={() => setMobileMenu(false)} className="font-medium text-foreground">Intelligence Node</a>
              <Link href="/dashboard" className="mt-4 px-5 py-3 text-sm font-bold text-center text-primary-foreground bg-primary rounded-xl">
                Launch Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
