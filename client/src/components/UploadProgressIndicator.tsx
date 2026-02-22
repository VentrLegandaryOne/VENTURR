import { motion } from "framer-motion";
import { Upload, Sparkles, CheckCircle2, Clock, XCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export type UploadStep = "upload" | "analysis" | "results";

interface UploadProgressIndicatorProps {
  currentStep: UploadStep;
  estimatedTimeRemaining?: number; // in seconds
  fileName?: string;
  onComplete?: () => void;
  error?: {
    step: UploadStep;
    message: string;
  };
  onRetry?: () => void;
}

const steps = [
  {
    id: "upload" as UploadStep,
    label: "Upload",
    icon: Upload,
    description: "Uploading your quote",
    estimatedDuration: 5,
  },
  {
    id: "analysis" as UploadStep,
    label: "AI Analysis",
    icon: Sparkles,
    description: "Analyzing pricing & compliance",
    estimatedDuration: 45,
  },
  {
    id: "results" as UploadStep,
    label: "Results",
    icon: CheckCircle2,
    description: "Preparing your report",
    estimatedDuration: 5,
  },
];

export function UploadProgressIndicator({
  currentStep,
  estimatedTimeRemaining,
  fileName,
  onComplete,
  error,
  onRetry,
}: UploadProgressIndicatorProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Call onComplete when reaching results step
  useEffect(() => {
    if (currentStep === "results" && onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Processing Your Quote</h3>
        {fileName && (
          <p className="text-sm text-muted-foreground">{fileName}</p>
        )}
      </div>

      {/* Steps */}
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-muted mx-12 sm:mx-16">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{
              width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* Step indicators */}
        <div className="relative grid grid-cols-3 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;
            const hasError = error && error.step === step.id;

            return (
              <div key={step.id} className="flex flex-col items-center gap-3">
                {/* Icon circle */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    opacity: 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                    hasError
                      ? "bg-destructive/10 border-destructive text-destructive"
                      : isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-primary/10 border-primary text-primary animate-pulse"
                      : "bg-muted border-border text-muted-foreground"
                  }`}
                >
                  {hasError ? (
                    <XCircle className="w-7 h-7" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <Icon className="w-7 h-7" />
                  )}

                  {/* Animated ring for current step */}
                  {isCurrent && !hasError && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </motion.div>

                {/* Label */}
                <div className="text-center space-y-1">
                  <p
                    className={`text-sm font-medium ${
                      hasError
                        ? "text-destructive"
                        : isCurrent
                        ? "text-primary"
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-muted-foreground hidden sm:block"
                    >
                      {step.description}
                    </motion.p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time info */}
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Elapsed: {formatTime(elapsedTime)}</span>
        </div>
        {estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0 && (
          <div className="flex items-center gap-2">
            <span>•</span>
            <span>~{formatTime(estimatedTimeRemaining)} remaining</span>
          </div>
        )}
      </div>

      {/* Current step description (mobile) */}
      {currentStepIndex >= 0 && !error && (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-muted-foreground sm:hidden"
        >
          {steps[currentStepIndex].description}
        </motion.div>
      )}

      {/* Error message and retry */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-destructive">Upload Failed</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error.message}
              </p>
            </div>
          </div>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Retry Upload
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}
