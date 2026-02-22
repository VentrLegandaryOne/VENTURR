import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getIncompleteUploads,
  clearUploadProgress,
  type UploadProgressData,
} from "@/lib/uploadProgress";
import { useLocation } from "wouter";

/**
 * Banner component that shows incomplete uploads
 * Allows users to resume or dismiss incomplete uploads
 */
export function ResumeUploadBanner() {
  const [incompleteUploads, setIncompleteUploads] = useState<
    UploadProgressData[]
  >([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check for incomplete uploads on mount
    const incomplete = getIncompleteUploads();
    setIncompleteUploads(incomplete);
  }, []);

  const handleResume = (upload: UploadProgressData) => {
    // Navigate to processing page to resume
    setLocation(`/quote/processing/${upload.quoteId}`);
  };

  const handleDismiss = (quoteId: string) => {
    setDismissed((prev) => new Set(prev).add(quoteId));
    clearUploadProgress(quoteId);
  };

  const visibleUploads = incompleteUploads.filter(
    (upload) => !dismissed.has(upload.quoteId)
  );

  if (visibleUploads.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {visibleUploads.map((upload) => (
          <motion.div
            key={upload.quoteId}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">
                  Incomplete Upload
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {upload.fileName} - Started{" "}
                  {formatTimeAgo(upload.startedAt)}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResume(upload)}
                    className="h-8"
                  >
                    <RotateCw className="w-3 h-3 mr-1.5" />
                    Resume
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDismiss(upload.quoteId)}
                    className="h-8"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
              <button
                onClick={() => handleDismiss(upload.quoteId)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
