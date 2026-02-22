import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Shield, FileText, Lock, AlertTriangle, ChevronDown } from "lucide-react";
import { Link } from "wouter";

interface TermsAcceptanceProps {
  onAccept: () => void;
  onDecline?: () => void;
}

// Current terms version - update this when terms change
const CURRENT_TERMS_VERSION = "v1.0";
const TERMS_EFFECTIVE_DATE = "December 2025";

export default function TermsAcceptance({ onAccept, onDecline }: TermsAcceptanceProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const allAccepted = termsAccepted && privacyAccepted && disclaimerAccepted;

  // Track scroll progress
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const totalScrollable = scrollHeight - clientHeight;
      const progress = totalScrollable > 0 ? (scrollTop / totalScrollable) * 100 : 100;
      
      setScrollProgress(progress);
      
      // Hide scroll hint after scrolling past 20%
      if (progress > 20) {
        setShowScrollHint(false);
      }
    };

    container.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter key to accept if all checkboxes are checked
      if (e.key === "Enter" && allAccepted) {
        e.preventDefault();
        onAccept();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [allAccepted, onAccept]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background z-50 flex flex-col"
      >
        {/* Scroll Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted z-20">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${scrollProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex-1 flex flex-col overflow-y-auto"
        >
          {/* Header - Sticky */}
          <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10 p-4 md:p-6">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold">Welcome to VENTURR VALIDT</h2>
                  <p className="text-xs text-muted-foreground">
                    Terms {CURRENT_TERMS_VERSION} • Effective {TERMS_EFFECTIVE_DATE}
                  </p>
                </div>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                Before you start, please review and accept our terms.
              </p>
            </div>
          </div>

          {/* Scroll Hint - Animated */}
          <AnimatePresence>
            {showScrollHint && scrollProgress < 50 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="sticky top-[120px] z-10 flex justify-center pointer-events-none"
              >
                <div className="bg-primary/90 text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm">
                  <ChevronDown className="h-4 w-4 animate-bounce" />
                  <span>Scroll to continue</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content - Scrollable */}
          <div className="flex-1 p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Key Points Summary */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50">
                  <FileText className="h-5 w-5 text-primary mb-2" />
                  <h3 className="font-medium mb-1 text-sm md:text-base">AI Analysis</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Our AI provides assessments, not professional certifications
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <Lock className="h-5 w-5 text-primary mb-2" />
                  <h3 className="font-medium mb-1 text-sm md:text-base">Your Data</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Securely stored and never sold to third parties
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mb-2" />
                  <h3 className="font-medium mb-1 text-sm md:text-base">Important</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Always seek professional advice for major decisions
                  </p>
                </div>
              </div>

              {/* Disclaimer Box */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <h3 className="font-medium text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2 text-sm md:text-base">
                  <AlertTriangle className="h-4 w-4" />
                  Important Disclaimer
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  VENTURR VALIDT provides AI-powered analysis of construction quotes for informational purposes only. 
                  Our assessments are not professional certifications, endorsements, or guarantees. We do not verify 
                  contractor licenses, insurance, or qualifications. Market rate comparisons are estimates based on 
                  available data. Users should always seek independent professional advice before making significant 
                  financial decisions based on our analysis.
                </p>
              </div>

              {/* Acceptance Checkboxes - Keyboard navigable */}
              <div className="space-y-3" role="group" aria-label="Terms acceptance checkboxes">
                <div className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    className="mt-1 h-6 w-6 flex-shrink-0"
                    aria-describedby="terms-description"
                  />
                  <label htmlFor="terms" className="cursor-pointer flex-1 select-none">
                    <span className="font-medium text-sm md:text-base block">Terms of Service</span>
                    <p id="terms-description" className="text-xs md:text-sm text-muted-foreground mt-1">
                      I have read and agree to the{" "}
                      <Link href="/terms" className="text-primary hover:underline" target="_blank">
                        Terms of Service
                      </Link>
                    </p>
                  </label>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
                  <Checkbox
                    id="privacy"
                    checked={privacyAccepted}
                    onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                    className="mt-1 h-6 w-6 flex-shrink-0"
                    aria-describedby="privacy-description"
                  />
                  <label htmlFor="privacy" className="cursor-pointer flex-1 select-none">
                    <span className="font-medium text-sm md:text-base block">Privacy Policy</span>
                    <p id="privacy-description" className="text-xs md:text-sm text-muted-foreground mt-1">
                      I have read and agree to the{" "}
                      <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                        Privacy Policy
                      </Link>
                    </p>
                  </label>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
                  <Checkbox
                    id="disclaimer"
                    checked={disclaimerAccepted}
                    onCheckedChange={(checked) => setDisclaimerAccepted(checked === true)}
                    className="mt-1 h-6 w-6 flex-shrink-0"
                    aria-describedby="disclaimer-description"
                  />
                  <label htmlFor="disclaimer" className="cursor-pointer flex-1 select-none">
                    <span className="font-medium text-sm md:text-base block">AI Analysis Disclaimer</span>
                    <p id="disclaimer-description" className="text-xs md:text-sm text-muted-foreground mt-1">
                      I understand that VENTURR VALIDT provides AI-generated assessments, not professional 
                      certifications, and I will seek independent advice for significant decisions
                    </p>
                  </label>
                </div>
              </div>

              {/* Keyboard hint */}
              {allAccepted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm text-muted-foreground"
                >
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to continue
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="mt-auto bg-background/95 backdrop-blur-sm border-t p-4 md:p-6">
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
              {onDecline && (
                <Button
                  variant="outline"
                  onClick={onDecline}
                  className="sm:flex-1 min-h-[48px]"
                  size="lg"
                  tabIndex={allAccepted ? 0 : -1}
                >
                  Decline
                </Button>
              )}
              <Button
                onClick={onAccept}
                disabled={!allAccepted}
                className="sm:flex-1 min-h-[48px]"
                size="lg"
                tabIndex={allAccepted ? 0 : -1}
              >
                {allAccepted ? "Accept & Continue" : "Please accept all terms"}
              </Button>
            </div>
            <div className="max-w-3xl mx-auto mt-3 text-center text-xs text-muted-foreground">
              By accepting, you agree to version {CURRENT_TERMS_VERSION} of our terms
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Export version for tracking
export { CURRENT_TERMS_VERSION };
