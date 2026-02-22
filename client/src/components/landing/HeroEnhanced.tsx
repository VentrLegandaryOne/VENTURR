import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { TriangularShield, TriangularZap, TriangularTrendingUp, TriangularArrowRight } from "@/components/branding/TriangularIcons";
import { useLocation } from "wouter";
import { useRef, useEffect, useState } from "react";

export default function HeroEnhanced() {
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Detect mobile and client-side rendering
  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const features = [
    {
      icon: TriangularShield,
      title: "100% Secure",
      description: "Bank-grade encryption",
      color: "text-success",
    },
    {
      icon: TriangularZap,
      title: "60 Seconds",
      description: "Lightning-fast analysis",
      color: "text-accent",
    },
    {
      icon: TriangularTrendingUp,
      title: "Identify Savings",
      description: "Market rate comparison",
      color: "text-primary",
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5"
    >
      {/* Simplified background for better mobile performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Static gradient orbs - no complex animations on mobile */}
        <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full bg-gradient-to-tl from-accent/20 via-success/10 to-transparent blur-3xl" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(0,0,0,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.1)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Hero content - always visible */}
      <div className="container relative z-10 text-center px-4 sm:px-6 py-16 md:py-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-card/80 border border-primary/20 mb-6 md:mb-8 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            AI-Powered Quote Verification
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 max-w-4xl mx-auto leading-tight"
        >
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Never Overpay for a Quote Again
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto px-4"
        >
          AI-powered verification in <span className="text-primary font-semibold">60 seconds</span>.
          Get instant insights on pricing, materials, and compliance.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 md:mb-16 px-4"
        >
          <Button
            size="lg"
            onClick={() => setLocation("/quote/upload")}
            className="w-full sm:w-auto group relative overflow-hidden px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Verify Your Quote Now
              <TriangularArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => setLocation("/dashboard")}
            className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg bg-white/50 dark:bg-card/50 hover:bg-white dark:hover:bg-card transition-colors"
          >
            View Dashboard
          </Button>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto px-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              className="bg-white/80 dark:bg-card/80 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <feature.icon className={`w-7 h-7 md:w-8 md:h-8 ${feature.color} mb-2 md:mb-3 mx-auto sm:mx-0`} />
              <h3 className="font-semibold text-foreground mb-1 text-center sm:text-left">{feature.title}</h3>
              <p className="text-sm text-muted-foreground text-center sm:text-left">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator - hidden on mobile */}
        {!isMobile && isClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2"
            >
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-2 bg-primary rounded-full"
              />
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
