import { ReactNode } from "react";
import { AlertCircle, RefreshCw, WifiOff, ServerCrash } from "lucide-react";
import { Button } from "./button";
import { LoadingSkeleton } from "./LoadingSkeleton";
import type { LucideIcon } from "lucide-react";

interface QueryWrapperProps {
  /** tRPC query isLoading state */
  isLoading: boolean;
  /** tRPC query error object */
  error: { message: string; data?: { code?: string } | null } | null;
  /** The data returned from the query */
  data: unknown;
  /** Content to render when data is available */
  children: ReactNode;
  /** Loading skeleton variant */
  loadingVariant?: "card" | "list" | "table" | "text" | "circle";
  /** Number of skeleton items to show */
  loadingCount?: number;
  /** Custom loading component */
  loadingComponent?: ReactNode;
  /** Custom empty state */
  emptyComponent?: ReactNode;
  /** Whether to check for empty arrays/objects */
  checkEmpty?: boolean;
  /** Retry function (usually refetch from tRPC) */
  onRetry?: () => void;
  /** Custom className for the wrapper */
  className?: string;
}

function getErrorInfo(error: { message: string; data?: { code?: string } | null }): {
  icon: LucideIcon;
  title: string;
  description: string;
} {
  const code = error.data?.code;
  
  switch (code) {
    case "UNAUTHORIZED":
      return {
        icon: AlertCircle,
        title: "Authentication Required",
        description: "Please sign in to access this content.",
      };
    case "FORBIDDEN":
      return {
        icon: AlertCircle,
        title: "Access Denied",
        description: "You don't have permission to view this content.",
      };
    case "NOT_FOUND":
      return {
        icon: AlertCircle,
        title: "Not Found",
        description: "The requested resource could not be found.",
      };
    case "TOO_MANY_REQUESTS":
      return {
        icon: AlertCircle,
        title: "Rate Limited",
        description: "Too many requests. Please wait a moment and try again.",
      };
    case "INTERNAL_SERVER_ERROR":
      return {
        icon: ServerCrash,
        title: "Server Error",
        description: "Something went wrong on our end. Please try again.",
      };
    default:
      if (error.message?.includes("fetch") || error.message?.includes("network")) {
        return {
          icon: WifiOff,
          title: "Connection Error",
          description: "Unable to connect to the server. Check your internet connection.",
        };
      }
      return {
        icon: AlertCircle,
        title: "Something Went Wrong",
        description: error.message || "An unexpected error occurred.",
      };
  }
}

function isEmpty(data: unknown): boolean {
  if (data === null || data === undefined) return true;
  if (Array.isArray(data) && data.length === 0) return true;
  if (typeof data === "object" && Object.keys(data as object).length === 0) return true;
  return false;
}

export function QueryWrapper({
  isLoading,
  error,
  data,
  children,
  loadingVariant = "card",
  loadingCount = 3,
  loadingComponent,
  emptyComponent,
  checkEmpty = false,
  onRetry,
  className = "",
}: QueryWrapperProps) {
  // Loading state
  if (isLoading) {
    if (loadingComponent) return <>{loadingComponent}</>;
    return (
      <div className={className}>
        <LoadingSkeleton variant={loadingVariant} count={loadingCount} />
      </div>
    );
  }

  // Error state
  if (error) {
    const errorInfo = getErrorInfo(error);
    const Icon = errorInfo.icon;
    
    return (
      <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {errorInfo.title}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          {errorInfo.description}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // Empty state
  if (checkEmpty && isEmpty(data)) {
    if (emptyComponent) return <>{emptyComponent}</>;
    return null;
  }

  // Success state
  return <>{children}</>;
}

/**
 * Lightweight inline error display for mutations
 */
export function MutationError({ error, className = "" }: { error: { message: string } | null; className?: string }) {
  if (!error) return null;
  return (
    <div className={`flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 ${className}`}>
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{error.message}</span>
    </div>
  );
}
