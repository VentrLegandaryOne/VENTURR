import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  variant?: "card" | "list" | "table" | "text" | "circle";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ variant = "card", count = 1, className = "" }: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return (
          <div className={`bg-card rounded-lg border border-border p-6 space-y-4 ${className}`}>
            <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-full animate-pulse" />
            <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
            <div className="flex gap-2 mt-4">
              <div className="h-10 bg-muted rounded w-24 animate-pulse" />
              <div className="h-10 bg-muted rounded w-24 animate-pulse" />
            </div>
          </div>
        );

      case "list":
        return (
          <div className={`flex items-center gap-4 p-4 bg-card rounded-lg border border-border ${className}`}>
            <div className="w-12 h-12 bg-muted rounded-full animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
            </div>
            <div className="w-20 h-8 bg-muted rounded animate-pulse" />
          </div>
        );

      case "table":
        return (
          <div className={`space-y-2 ${className}`}>
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        );

      case "text":
        return (
          <div className={`space-y-2 ${className}`}>
            <div className="h-4 bg-muted rounded w-full animate-pulse" />
            <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-muted rounded w-4/6 animate-pulse" />
          </div>
        );

      case "circle":
        return (
          <div className={`w-16 h-16 bg-muted rounded-full animate-pulse ${className}`} />
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {skeletons.map((i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </motion.div>
  );
}

// Specialized skeletons for common use cases
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LoadingSkeleton variant="card" count={3} />
      </div>
      
      {/* Recent quotes list */}
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
        <LoadingSkeleton variant="list" count={5} />
      </div>
    </div>
  );
}

export function QuoteListSkeleton() {
  return (
    <div className="space-y-4">
      <LoadingSkeleton variant="list" count={6} />
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="h-10 bg-muted rounded w-64 mx-auto animate-pulse" />
        <div className="h-6 bg-muted rounded w-96 mx-auto animate-pulse" />
      </div>

      {/* Score circle */}
      <div className="flex justify-center">
        <LoadingSkeleton variant="circle" className="w-40 h-40" />
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <LoadingSkeleton variant="circle" className="w-28 h-28" />
            <div className="h-4 bg-muted rounded w-20 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Analysis sections */}
      <div className="space-y-4">
        <LoadingSkeleton variant="card" count={4} />
      </div>
    </div>
  );
}
