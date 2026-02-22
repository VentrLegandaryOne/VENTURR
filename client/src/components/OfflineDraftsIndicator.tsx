import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Upload, AlertCircle, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useState } from "react";

/**
 * OfflineDraftsIndicator - Shows offline status and pending drafts
 * 
 * Features:
 * - Displays offline indicator when connection is lost
 * - Shows count of pending drafts
 * - Manual sync button
 * - Expandable list of drafts
 */
export function OfflineDraftsIndicator() {
  const {
    isOnline,
    drafts,
    pendingCount,
    isSyncing,
    syncAllDrafts,
    removeDraft,
  } = useOfflineSync();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if online and no pending drafts
  if (isOnline && pendingCount === 0) {
    return null;
  }

  // Don't show if dismissed
  if (isDismissed) {
    return null;
  }

  const pendingDrafts = drafts.filter(d => d.status === 'pending' || d.status === 'error');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-4"
      >
        <Card className="p-4 border-l-4 border-l-warning bg-warning/5">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0">
              {!isOnline ? (
                <WifiOff className="w-5 h-5 text-warning" />
              ) : isSyncing ? (
                <Upload className="w-5 h-5 text-primary animate-pulse" />
              ) : (
                <AlertCircle className="w-5 h-5 text-warning" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-sm">
                  {!isOnline ? "You're offline" : "Pending uploads"}
                </h4>
                <button
                  onClick={() => setIsDismissed(true)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground mb-3">
                {!isOnline
                  ? `${pendingCount} quote${pendingCount !== 1 ? 's' : ''} saved locally. They'll sync when you're back online.`
                  : `${pendingCount} quote${pendingCount !== 1 ? 's' : ''} waiting to upload.`
                }
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                {isOnline && pendingCount > 0 && (
                  <Button
                    size="sm"
                    onClick={syncAllDrafts}
                    disabled={isSyncing}
                    className="h-8 text-xs"
                  >
                    {isSyncing ? (
                      <>
                        <Upload className="w-3 h-3 mr-1 animate-pulse" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3 mr-1" />
                        Sync Now
                      </>
                    )}
                  </Button>
                )}
                
                {pendingDrafts.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-8 text-xs"
                  >
                    {isExpanded ? 'Hide' : 'Show'} Details
                  </Button>
                )}
              </div>

              {/* Expanded draft list */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 space-y-2 overflow-hidden"
                  >
                    {pendingDrafts.map((draft) => (
                      <div
                        key={draft.id}
                        className="flex items-center justify-between p-2 rounded bg-background/50 border"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {draft.fileName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(draft.fileSize / 1024).toFixed(1)} KB
                            {draft.status === 'error' && draft.errorMessage && (
                              <span className="text-destructive ml-2">
                                • {draft.errorMessage}
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 ml-2">
                          {draft.status === 'error' && (
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          )}
                          {draft.status === 'synced' && (
                            <CheckCircle className="w-4 h-4 text-success" />
                          )}
                          <button
                            onClick={() => removeDraft(draft.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Delete draft"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
