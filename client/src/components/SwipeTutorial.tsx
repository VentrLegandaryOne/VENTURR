import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ArrowLeft, ArrowRight, Trash2, Share2, CheckCircle2 } from "lucide-react";
import { haptics } from "@/lib/haptics";

const TUTORIAL_DISMISSED_KEY = "venturr_swipe_tutorial_dismissed";

interface SwipeTutorialProps {
  onDismiss?: () => void;
}

export function SwipeTutorial({ onDismiss }: SwipeTutorialProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const dismissed = localStorage.getItem(TUTORIAL_DISMISSED_KEY);
    if (!dismissed) {
      // Show tutorial after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
        haptics.light();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(TUTORIAL_DISMISSED_KEY, "true");
    setIsVisible(false);
    haptics.light();
    onDismiss?.();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      haptics.light();
    } else {
      handleDismiss();
    }
  };

  const handleSkip = () => {
    handleDismiss();
  };

  const steps = [
    {
      title: "Swipe to Delete",
      description: "Swipe left on any quote card to quickly delete it",
      icon: Trash2,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      direction: "left" as const,
    },
    {
      title: "Swipe to Share",
      description: "Swipe right on any quote card to generate a shareable link",
      icon: Share2,
      color: "text-primary",
      bgColor: "bg-primary/10",
      direction: "right" as const,
    },
    {
      title: "Feel the Feedback",
      description: "Haptic feedback lets you feel when actions trigger",
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
      direction: null,
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          {/* Tutorial Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
          >
            <Card className="p-6 shadow-2xl">
              {/* Close Button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Step Indicator */}
              <div className="flex items-center gap-2 mb-6">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      index <= currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className={`w-20 h-20 rounded-full ${currentStepData.bgColor} flex items-center justify-center`}>
                  <currentStepData.icon className={`w-10 h-10 ${currentStepData.color}`} />
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{currentStepData.title}</h3>
                <p className="text-muted-foreground">{currentStepData.description}</p>
              </div>

              {/* Animation Demo */}
              {currentStepData.direction && (
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    {/* Demo Card */}
                    <motion.div
                      animate={{
                        x: currentStepData.direction === "left" ? [-100, 0] : [100, 0],
                      }}
                      transition={{
                        duration: 1.5,
                                repeat: Infinity,
                                repeatDelay: 0.5,
                                ease: "easeInOut",
                              }}
                              className="w-64 h-20 bg-card border rounded-lg shadow-sm flex items-center justify-center"
                            >
                              <p className="text-sm text-muted-foreground">Quote Card</p>
                            </motion.div>

                            {/* Arrow Indicator */}
                            <motion.div
                              animate={{
                                x: currentStepData.direction === "left" ? [-20, 0] : [20, 0],
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatDelay: 0.5,
                                ease: "easeInOut",
                              }}
                              className={`absolute top-1/2 -translate-y-1/2 ${
                                currentStepData.direction === "left" ? "left-0 -translate-x-12" : "right-0 translate-x-12"
                              }`}
                            >
                              {currentStepData.direction === "left" ? (
                                <ArrowLeft className={`w-8 h-8 ${currentStepData.color}`} />
                              ) : (
                                <ArrowRight className={`w-8 h-8 ${currentStepData.color}`} />
                              )}
                            </motion.div>
                          </div>
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="flex items-center gap-3">
                        {currentStep < steps.length - 1 ? (
                          <>
                            <Button
                              variant="ghost"
                              onClick={handleSkip}
                              className="flex-1"
                            >
                              Skip
                            </Button>
                            <Button
                              onClick={handleNext}
                              className="flex-1"
                            >
                              Next
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={handleDismiss}
                            className="w-full"
                          >
                            Got it!
                          </Button>
                        )}
                      </div>

                      {/* Step Counter */}
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        {currentStep + 1} of {steps.length}
                      </p>
                    </Card>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          );
        }

        // Hook to check if tutorial should be shown
        export function useShouldShowTutorial() {
          const [shouldShow, setShouldShow] = useState(false);

          useEffect(() => {
            const dismissed = localStorage.getItem(TUTORIAL_DISMISSED_KEY);
            setShouldShow(!dismissed);
          }, []);

          return shouldShow;
        }

        // Function to reset tutorial (for testing or user request)
        export function resetSwipeTutorial() {
          localStorage.removeItem(TUTORIAL_DISMISSED_KEY);
        }
        
