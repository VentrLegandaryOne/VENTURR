import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowDown } from "lucide-react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  enabled?: boolean;
}

/**
 * PullToRefresh - Native mobile pull-to-refresh component
 * 
 * Wraps content and provides visual feedback for pull-to-refresh gesture
 */
export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
  enabled = true,
}: PullToRefreshProps) {
  const { isRefreshing, pullDistance, progress, containerRef } = usePullToRefresh({
    onRefresh,
    threshold,
    enabled,
  });

  const showIndicator = pullDistance > 0 || isRefreshing;
  const isReady = progress >= 1;

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={cn("relative overflow-y-auto", className)}
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {showIndicator && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              height: pullDistance 
            }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 left-0 right-0 flex items-end justify-center pb-4 z-50"
            style={{ height: `${pullDistance}px` }}
          >
            <div className="flex flex-col items-center gap-2">
              {/* Spinner or arrow */}
              {isRefreshing ? (
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              ) : (
                <motion.div
                  animate={{ 
                    rotate: isReady ? 180 : 0,
                    scale: isReady ? 1.1 : 1
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowDown 
                    className={cn(
                      "h-6 w-6 transition-colors",
                      isReady ? "text-primary" : "text-muted-foreground"
                    )} 
                  />
                </motion.div>
              )}
              
              {/* Status text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-medium text-muted-foreground"
              >
                {isRefreshing 
                  ? "Refreshing..." 
                  : isReady 
                    ? "Release to refresh" 
                    : "Pull to refresh"
                }
              </motion.p>

              {/* Progress indicator */}
              {!isRefreshing && (
                <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content with pull offset */}
      <motion.div
        animate={{ 
          y: pullDistance,
          transition: { 
            type: isRefreshing ? "spring" : "tween",
            duration: 0.2 
          }
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
