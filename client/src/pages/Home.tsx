import { useEffect } from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import HeroEnhanced from "@/components/landing/HeroEnhanced";
import PersonaSelector from "@/components/landing/PersonaSelector";
import TrustBadges from "@/components/landing/TrustBadges";
import TrustSignals from "@/components/landing/TrustSignals";
import HowItWorks from "@/components/landing/HowItWorks";
import SavingsCalculator from "@/components/landing/SavingsCalculator";
import HomeownerGuide from "@/components/landing/HomeownerGuide";
import CTA from "@/components/landing/CTA";
import { OnboardingTour, useOnboarding } from "@/components/OnboardingTour";

export default function Home() {
  const { showTour, completeTour } = useOnboarding();

  // Set SEO-optimized page title
  useEffect(() => {
    document.title = "VENTURR VALDT - Quote Verification Australia";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main>
        <HeroEnhanced />
        <PersonaSelector />
        <TrustBadges />
        <SavingsCalculator />
        <HomeownerGuide />
        <TrustSignals />
        <HowItWorks />
        <CTA />
      </main>

      <Footer />
      
      {/* Onboarding tour for first-time users */}
      <OnboardingTour isOpen={showTour} onComplete={completeTour} />
    </div>
  );
}
