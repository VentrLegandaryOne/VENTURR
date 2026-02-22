import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Upload, 
  FileCheck, 
  BarChart3, 
  Shield, 
  Users, 
  ArrowRight, 
  X,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to VENTURR VALDT',
    description: 'Your AI-powered quote verification platform. Get instant insights on pricing, materials, and compliance for any construction quote.',
    icon: <Sparkles className="h-8 w-8 text-primary" />,
  },
  {
    id: 'upload',
    title: 'Upload Your Quote',
    description: 'Simply drag and drop your quote PDF, take a photo, or upload from your device. Our AI will analyze it in under 60 seconds.',
    icon: <Upload className="h-8 w-8 text-blue-500" />,
    highlight: '/upload',
  },
  {
    id: 'verify',
    title: 'AI Verification',
    description: 'Our AI checks your quote against 24 Australian Standards, verifies contractor credentials, and compares pricing to market rates.',
    icon: <FileCheck className="h-8 w-8 text-green-500" />,
  },
  {
    id: 'compare',
    title: 'Compare Quotes',
    description: 'Upload multiple quotes to compare them side-by-side. See which offers the best value and compliance.',
    icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
    highlight: '/compare',
  },
  {
    id: 'contractors',
    title: 'Verified Contractors',
    description: 'Browse our directory of verified contractors with real ratings, credentials, and performance history.',
    icon: <Users className="h-8 w-8 text-orange-500" />,
    highlight: '/contractors',
  },
  {
    id: 'compliance',
    title: 'Compliance Reports',
    description: 'Download detailed PDF reports showing compliance status, pricing analysis, and recommendations.',
    icon: <Shield className="h-8 w-8 text-teal-500" />,
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
  isOpen: boolean;
}

export function OnboardingTour({ onComplete, isOpen }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('venturr_onboarding_complete', 'true');
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg"
        >
          <Card className="relative overflow-hidden border-0 shadow-2xl">
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Skip tour"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            <CardContent className="pt-10 pb-6 px-6">
              {/* Step indicator */}
              <div className="flex justify-center gap-2 mb-6">
                {tourSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentStep 
                        ? 'w-8 bg-primary' 
                        : index < currentStep 
                          ? 'w-2 bg-primary/50' 
                          : 'w-2 bg-muted'
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="text-center"
                >
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-muted">
                      {step.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold mb-3">{step.title}</h2>

                  {/* Description */}
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="min-w-[100px]"
                >
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                  {currentStep + 1} of {tourSteps.length}
                </span>

                <Button
                  onClick={handleNext}
                  className="min-w-[100px] gap-2"
                >
                  {currentStep === tourSteps.length - 1 ? (
                    <>
                      Get Started
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* Skip link */}
              {currentStep < tourSteps.length - 1 && (
                <div className="text-center mt-4">
                  <button
                    onClick={handleSkip}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip tour
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [showTour, setShowTour] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(true);

  useEffect(() => {
    const completed = localStorage.getItem('venturr_onboarding_complete');
    if (!completed) {
      setHasCompletedTour(false);
      // Delay showing tour to let page load
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeTour = () => {
    setShowTour(false);
    setHasCompletedTour(true);
  };

  const resetTour = () => {
    localStorage.removeItem('venturr_onboarding_complete');
    setHasCompletedTour(false);
    setShowTour(true);
  };

  return {
    showTour,
    hasCompletedTour,
    completeTour,
    resetTour,
  };
}
