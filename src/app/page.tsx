import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesBento } from '@/components/landing/FeaturesBento';
import { UseCases } from '@/components/landing/UseCases';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-body">
      <Navbar />
      <HeroSection />
      <FeaturesBento />
      <UseCases />
      <Footer />
    </main>
  );
}
