import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle, 
  RefreshCw, 
  MessageCircle, 
  ArrowLeft, 
  FileQuestion,
  Upload,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface ErrorRecoveryProps {
  errorType: "extraction" | "analysis" | "processing" | "network" | "unknown";
  errorMessage?: string;
  quoteId?: number;
  onRetry?: () => void;
  isRetrying?: boolean;
}

const errorConfigs = {
  extraction: {
    icon: FileQuestion,
    title: "Unable to Extract Quote Data",
    description: "We couldn't extract the necessary information from your uploaded document.",
    suggestions: [
      "Ensure the document is a clear, readable PDF or image",
      "Check that the quote contains pricing, materials, and contractor details",
      "Try uploading a higher quality scan or photo",
      "Ensure text is not handwritten or in an unusual format",
    ],
    canRetry: true,
    canReupload: true,
  },
  analysis: {
    icon: AlertTriangle,
    title: "Analysis Could Not Be Completed",
    description: "Our AI system encountered an issue while analyzing your quote.",
    suggestions: [
      "The quote may contain unusual formatting or terminology",
      "Some required information may be missing from the document",
      "Try again in a few minutes - the issue may be temporary",
      "Contact support if the problem persists",
    ],
    canRetry: true,
    canReupload: true,
  },
  processing: {
    icon: RefreshCw,
    title: "Processing Interrupted",
    description: "The verification process was interrupted before completion.",
    suggestions: [
      "This may be due to a temporary server issue",
      "Your quote data has been saved - you can retry the analysis",
      "Check your internet connection and try again",
    ],
    canRetry: true,
    canReupload: false,
  },
  network: {
    icon: XCircle,
    title: "Connection Error",
    description: "We couldn't connect to our verification servers.",
    suggestions: [
      "Check your internet connection",
      "Try refreshing the page",
      "The service may be temporarily unavailable",
    ],
    canRetry: true,
    canReupload: false,
  },
  unknown: {
    icon: HelpCircle,
    title: "Something Went Wrong",
    description: "An unexpected error occurred during the verification process.",
    suggestions: [
      "Please try again in a few minutes",
      "If the problem persists, contact our support team",
      "Your uploaded files are safe and can be re-processed",
    ],
    canRetry: true,
    canReupload: true,
  },
};

export function ErrorRecovery({ 
  errorType, 
  errorMessage, 
  quoteId,
  onRetry,
  isRetrying = false
}: ErrorRecoveryProps) {
  const [showDetails, setShowDetails] = useState(false);
  const config = errorConfigs[errorType] || errorConfigs.unknown;
  const Icon = config.icon;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full"
      >
        <Card className="border-destructive/20">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4"
            >
              <Icon className="w-8 h-8 text-destructive" />
            </motion.div>
            <CardTitle className="text-xl">{config.title}</CardTitle>
            <CardDescription className="text-base mt-2">
              {config.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Suggestions */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                What you can try:
              </h4>
              <ul className="space-y-2">
                {config.suggestions.map((suggestion, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="text-primary mt-1">•</span>
                    {suggestion}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Error details (collapsible) */}
            {errorMessage && (
              <div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  {showDetails ? "Hide" : "Show"} technical details
                </button>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-2 p-3 bg-muted rounded-lg text-xs font-mono text-muted-foreground overflow-x-auto"
                  >
                    {errorMessage}
                  </motion.div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              {config.canRetry && onRetry && (
                <Button 
                  onClick={onRetry} 
                  disabled={isRetrying}
                  className="w-full"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </>
                  )}
                </Button>
              )}

              {config.canReupload && (
                <Link href="/upload">
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload a Different File
                  </Button>
                </Link>
              )}

              <div className="flex gap-3">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>

                <Button 
                  variant="ghost" 
                  className="flex-1"
                  onClick={() => window.open('mailto:support@venturr.com?subject=Quote Verification Error&body=Error Type: ' + errorType + '%0AQuote ID: ' + (quoteId || 'N/A') + '%0AError: ' + encodeURIComponent(errorMessage || 'Unknown'), '_blank')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>

            {/* Reassurance message */}
            <p className="text-xs text-center text-muted-foreground">
              Your uploaded files are safe. You won't be charged for failed verifications.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Inline error banner for partial failures
export function ErrorBanner({ 
  message, 
  onRetry,
  onDismiss 
}: { 
  message: string; 
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-destructive">An error occurred</p>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
        <div className="flex gap-2">
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              <XCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
