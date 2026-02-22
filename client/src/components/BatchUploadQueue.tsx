import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export interface UploadQueueItem {
  id: string;
  fileName: string;
  fileSize: number;
  status: "pending" | "uploading" | "processing" | "completed" | "failed";
  progress: number; // 0-100
  error?: string;
  startTime?: number;
  endTime?: number;
  file?: File; // Original file reference for retry support
  quoteId?: number; // ID of the uploaded quote
}

interface BatchUploadQueueProps {
  items: UploadQueueItem[];
  onRetry?: (itemId: string) => void;
  onCancel?: (itemId: string) => void;
  onClearCompleted?: () => void;
}

/**
 * Batch Upload Queue Component
 * 
 * Shows multiple uploads in progress simultaneously with individual progress bars,
 * upload speed, and estimated time remaining for each file.
 */
export function BatchUploadQueue({
  items,
  onRetry,
  onCancel,
  onClearCompleted,
}: BatchUploadQueueProps) {
  const [uploadSpeeds, setUploadSpeeds] = useState<Record<string, number>>({});

  // Calculate upload speed for each item
  useEffect(() => {
    const interval = setInterval(() => {
      const speeds: Record<string, number> = {};
      
      items.forEach((item) => {
        if (item.status === "uploading" && item.startTime) {
          const elapsed = (Date.now() - item.startTime) / 1000; // seconds
          const uploaded = (item.progress / 100) * item.fileSize;
          speeds[item.id] = uploaded / elapsed; // bytes per second
        }
      });
      
      setUploadSpeeds(speeds);
    }, 1000);

    return () => clearInterval(interval);
  }, [items]);

  const completedCount = items.filter((i) => i.status === "completed").length;
  const failedCount = items.filter((i) => i.status === "failed").length;
  const inProgressCount = items.filter(
    (i) => i.status === "uploading" || i.status === "processing"
  ).length;

  const overallProgress =
    items.length > 0
      ? Math.round(
          items.reduce((sum, item) => sum + item.progress, 0) / items.length
        )
      : 0;

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Overall progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Uploading {items.length} file{items.length > 1 ? "s" : ""}
          </span>
          <span className="text-muted-foreground">
            {completedCount} completed, {failedCount} failed, {inProgressCount}{" "}
            in progress
          </span>
        </div>
        <Progress value={overallProgress} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{overallProgress}% complete</span>
          {onClearCompleted && completedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearCompleted}
              className="h-auto p-0 text-xs"
            >
              Clear completed
            </Button>
          )}
        </div>
      </div>

      {/* Individual upload items */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="border rounded-lg p-3 space-y-2"
            >
              {/* File info and status */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {item.status === "completed" && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                  {item.status === "failed" && (
                    <XCircle className="w-5 h-5 text-destructive" />
                  )}
                  {(item.status === "uploading" ||
                    item.status === "processing") && (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  )}
                  {item.status === "pending" && (
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(item.fileSize)}
                  </p>
                </div>

                <div className="flex-shrink-0 text-right">
                  {item.status === "uploading" && (
                    <div className="text-xs space-y-0.5">
                      <p className="font-medium">{item.progress}%</p>
                      {uploadSpeeds[item.id] && (
                        <p className="text-muted-foreground">
                          {formatSpeed(uploadSpeeds[item.id])}
                        </p>
                      )}
                    </div>
                  )}
                  {item.status === "processing" && (
                    <p className="text-xs text-muted-foreground">
                      AI analyzing...
                    </p>
                  )}
                  {item.status === "completed" && (
                    <p className="text-xs text-green-600 font-medium">Done</p>
                  )}
                  {item.status === "failed" && onRetry && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRetry(item.id)}
                      className="h-7 text-xs"
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {(item.status === "uploading" || item.status === "processing") && (
                <Progress value={item.progress} className="h-1.5" />
              )}

              {/* Error message */}
              {item.status === "failed" && item.error && (
                <p className="text-xs text-destructive">{item.error}</p>
              )}

              {/* ETA */}
              {item.status === "uploading" &&
                uploadSpeeds[item.id] &&
                item.progress < 100 && (
                  <p className="text-xs text-muted-foreground">
                    {formatETA(
                      item.fileSize,
                      item.progress,
                      uploadSpeeds[item.id]
                    )}
                  </p>
                )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 10) / 10 + " " + sizes[i];
}

function formatSpeed(bytesPerSecond: number): string {
  return `${formatFileSize(bytesPerSecond)}/s`;
}

function formatETA(
  totalBytes: number,
  progressPercent: number,
  bytesPerSecond: number
): string {
  const remaining = totalBytes * (1 - progressPercent / 100);
  const seconds = Math.ceil(remaining / bytesPerSecond);

  if (seconds < 60) {
    return `${seconds}s remaining`;
  }

  const minutes = Math.ceil(seconds / 60);
  return `${minutes}m remaining`;
}
