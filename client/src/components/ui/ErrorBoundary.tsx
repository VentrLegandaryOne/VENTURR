import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-2xl w-full p-8">
            <div className="flex flex-col items-center text-center">
              {/* Error icon */}
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>

              {/* Error message */}
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Something went wrong
              </h1>
              <p className="text-muted-foreground mb-8 max-w-md">
                We encountered an unexpected error. Don't worry, your data is safe. 
                Please try refreshing the page or contact support if the problem persists.
              </p>

              {/* Error details (development only) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="w-full text-left mb-6">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground mb-2">
                    Technical Details (Development Only)
                  </summary>
                  <div className="bg-muted/50 rounded-lg p-4 overflow-auto max-h-64">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                      <strong>Error:</strong> {this.state.error.toString()}
                      {"\n\n"}
                      <strong>Stack Trace:</strong>
                      {"\n"}
                      {this.state.error.stack}
                      {this.state.errorInfo && (
                        <>
                          {"\n\n"}
                          <strong>Component Stack:</strong>
                          {"\n"}
                          {this.state.errorInfo.componentStack}
                        </>
                      )}
                    </pre>
                  </div>
                </details>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button onClick={this.handleReset} size="lg">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.location.href = "/"}
                >
                  Go to Homepage
                </Button>
              </div>

              {/* Support link */}
              <p className="text-sm text-muted-foreground mt-8">
                Need help?{" "}
                <a
                  href="mailto:support@venturr.com"
                  className="text-primary hover:underline"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
