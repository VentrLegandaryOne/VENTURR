import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Loading States Components for Venturr
 * 
 * Provides consistent loading indicators throughout the application
 * to improve perceived performance and user experience.
 */

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  return (
    <Loader2
      className={cn("animate-spin text-blue-600", sizeClasses[size], className)}
    />
  );
}

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({ message, fullScreen = false }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm",
        fullScreen ? "fixed inset-0 z-50" : "absolute inset-0"
      )}
    >
      <LoadingSpinner size="xl" />
      {message && (
        <p className="text-lg font-medium text-slate-700">{message}</p>
      )}
    </div>
  );
}

interface LoadingCardProps {
  title?: string;
  description?: string;
}

export function LoadingCard({ title, description }: LoadingCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <LoadingSpinner size="lg" />
        {title && (
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        )}
        {description && (
          <p className="text-sm text-slate-600 max-w-sm">{description}</p>
        )}
      </div>
    </div>
  );
}

export function LoadingButton({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <LoadingSpinner size="sm" />
      <span>{children || "Loading..."}</span>
    </div>
  );
}

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ progress, className, showLabel = false }: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("w-full", className)}>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-slate-600 mt-1 text-right">
          {clampedProgress.toFixed(0)}%
        </p>
      )}
    </div>
  );
}

interface PulseLoaderProps {
  count?: number;
  className?: string;
}

export function PulseLoader({ count = 3, className }: PulseLoaderProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
          style={{
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200 rounded animate-pulse"
          style={{
            width: i === lines - 1 ? "70%" : "100%",
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-6 shadow-sm", className)}>
      <div className="space-y-4">
        <div className="h-6 bg-slate-200 rounded animate-pulse w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 bg-slate-200 rounded animate-pulse w-20" />
          <div className="h-8 bg-slate-200 rounded animate-pulse w-20" />
        </div>
      </div>
    </div>
  );
}

