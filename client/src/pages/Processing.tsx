import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { triggerSuccessConfetti } from "@/lib/confetti";
import { ErrorRecovery } from "@/components/ErrorRecovery";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

export default function Processing() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const quoteId = parseInt(id || "0");

  const [currentStep, setCurrentStep] = useState("Initializing...");
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);

  // Poll for processing status
  const { data: status, isLoading, error: errorStatus } = trpc.quotes.getProcessingStatus.useQuery(
    { quoteId },
    {
      enabled: quoteId > 0 && isProcessing, retry: 2,
      refetchInterval: isProcessing ? 1000 : false,
    }
  );

  // Update local state when status changes
  useEffect(() => {
    if (status) {
      setProgress(status.progress);
      setCurrentStep(status.currentStep);

      // Stop polling if completed or failed
      if (status.status === "completed" || status.status === "failed") {
        setIsProcessing(false);
      }

      // Redirect to report when completed
      if (status.status === "completed") {
        // Trigger confetti for successful verification
        triggerSuccessConfetti();
        
        setTimeout(() => {
          setLocation(`/quote/${quoteId}`);
        }, 2000);
      }
    }
  }, [status, quoteId, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Determine error type from error message
  const getErrorType = (errorMessage?: string): "extraction" | "analysis" | "processing" | "network" | "unknown" => {
    if (!errorMessage) return "unknown";
    const msg = errorMessage.toLowerCase();
    if (msg.includes("extract") || msg.includes("parse") || msg.includes("read")) return "extraction";
    if (msg.includes("analysis") || msg.includes("ai") || msg.includes("verify")) return "analysis";
    if (msg.includes("network") || msg.includes("connection") || msg.includes("timeout")) return "network";
    if (msg.includes("process") || msg.includes("interrupt")) return "processing";
    return "unknown";
  };

  // Retry handler
  const handleRetry = () => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentStep("Retrying...");
    // The polling will automatically restart due to isProcessing being true
  };

  if (status?.status === "failed") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <ErrorRecovery
          errorType={getErrorType(status.error)}
          errorMessage={status.error}
          quoteId={quoteId}
          onRetry={handleRetry}
          isRetrying={isProcessing}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
      </div>

      {/* Processing content */}
      <div className="relative z-10 text-center max-w-md px-6">
        {/* Animated logo with rotating rings */}
        <motion.div
          className="relative w-32 h-32 mx-auto mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 border-4 border-primary/30 border-t-primary rounded-full"
          />
          
          {/* Middle ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-3 border-4 border-accent/30 border-t-accent rounded-full"
          />
          
          {/* Inner circle with shield icon */}
          <div className="absolute inset-6 bg-primary/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg
              className="w-12 h-12 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
        </motion.div>

        {/* Progress text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {status?.status === "completed" ? "Verification Complete!" : "Verifying Your Quote"}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {currentStep}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Progress percentage */}
        <motion.p
          className="text-sm font-mono text-muted-foreground"
          key={progress}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {progress}%
        </motion.p>

        {/* Completion checkmark */}
        {status?.status === "completed" && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="mt-8"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Redirecting to your report...
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
