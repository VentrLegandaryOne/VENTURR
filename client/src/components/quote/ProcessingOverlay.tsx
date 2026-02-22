import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { TriangleLoader } from "@/components/branding/TriangleLoader";
import { useEffect, useState } from "react";

interface ProcessingOverlayProps {
  isProcessing: boolean;
  progress: number; // 0-100
  currentStep: string;
}

const processingSteps = [
  { label: "Uploading quote...", progress: 10 },
  { label: "Extracting data...", progress: 25 },
  { label: "Analyzing pricing...", progress: 40 },
  { label: "Checking materials...", progress: 60 },
  { label: "Verifying compliance...", progress: 80 },
  { label: "Generating report...", progress: 95 },
  { label: "Complete!", progress: 100 },
];

export default function ProcessingOverlay({ isProcessing, progress, currentStep }: ProcessingOverlayProps) {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isProcessing]);

  return (
    <AnimatePresence>
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-lg"
        >
          <div className="max-w-2xl w-full px-6">
            {/* VENTURR Triangle Loading Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-12"
            >
              <TriangleLoader size={120} text="" />
            </motion.div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary via-accent to-success rounded-full relative"
                >
                  {/* Shimmer effect */}
                  <motion.div
                    animate={{
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">{progress}% complete</p>
                <p className="text-sm text-muted-foreground font-mono">{countdown}s remaining</p>
              </div>
            </div>

            {/* Current step */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-12"
            >
              <h3 className="text-2xl font-semibold mb-2 text-foreground">{currentStep}</h3>
              <p className="text-muted-foreground">
                Our AI is analyzing your quote against industry standards
              </p>
            </motion.div>

            {/* Processing steps */}
            <div className="space-y-3">
              {processingSteps.map((step, index) => {
                const isComplete = progress >= step.progress;
                const isCurrent = progress >= (processingSteps[index - 1]?.progress || 0) && progress < step.progress;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    {/* Status indicator */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isComplete
                        ? "bg-success"
                        : isCurrent
                        ? "bg-primary"
                        : "bg-muted"
                    }`}>
                      {isComplete ? (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-4 h-4 text-success-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </motion.svg>
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>

                    {/* Step label */}
                    <p className={`text-sm transition-colors ${
                      isComplete || isCurrent
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}>
                      {step.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Fun fact */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-12 p-4 rounded-lg bg-primary/5 border border-primary/10 text-center"
            >
              <p className="text-sm text-muted-foreground">
                💡 <span className="font-medium">Did you know?</span> The average homeowner saves $8,500 by verifying their quotes with VENTURR
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
