import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Loader2, Zap, Sparkles, CheckCircle2, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

/**
 * Enhanced Login Page with World-Class UI/UX
 * - Smooth animations and transitions
 * - Psychological trust signals
 * - Delightful loading states
 * - Professional branding
 */
export default function LoginEnhanced() {
  const [, setLocation] = useLocation();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    setProgress(0);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 100);
    
    try {
      const response = await fetch("/api/auth/simple-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setProgress(100);
        clearInterval(progressInterval);
        
        // Successful sign-in - wait a moment for smooth transition
        setTimeout(() => {
          setLocation("/dashboard");
        }, 500);
      } else {
        clearInterval(progressInterval);
        setError(data.error || "Sign-in failed. Please try again.");
        setIsSigningIn(false);
        setProgress(0);
      }
    } catch (err) {
      clearInterval(progressInterval);
      console.error("Sign-in error:", err);
      setError("Network error. Please check your connection and try again.");
      setIsSigningIn(false);
      setProgress(0);
    }
  };

  // Auto-sign-in on page load for demo purposes
  // Add slight delay to ensure page is fully loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSignIn();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-100/30 via-transparent to-transparent pointer-events-none" />
      
      {/* Floating shapes */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      
      <div className="w-full max-w-md px-6 relative z-10">
        {/* Login Card with glassmorphism */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 p-8 border border-slate-200/50 transform transition-all duration-500 hover:shadow-3xl">
          {/* Logo & Title with animation */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex justify-center mb-4">
              {APP_LOGO && (
                <div className="relative">
                  <img 
                    src={APP_LOGO} 
                    alt={APP_TITLE} 
                    className="h-16 w-16 object-contain transition-transform duration-500 hover:scale-110 hover:rotate-3"
                  />
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl -z-10 animate-pulse" />
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {APP_TITLE}
            </h1>
            <p className="text-slate-600 text-sm flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              AI-Powered Operating System for Trade Businesses
            </p>
          </div>

          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-4 mb-6 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-green-600" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-blue-600" />
              <span>Compliant</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-indigo-600" />
              <span>Fast</span>
            </div>
          </div>

          {/* Sign In Section */}
          <div className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-shake">
                <p className="text-sm text-red-700 text-center">{error}</p>
              </div>
            )}

            {isSigningIn ? (
              <div className="text-center py-8">
                {/* Enhanced loading animation */}
                <div className="relative w-20 h-20 mx-auto mb-4">
                  {/* Outer ring */}
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                  {/* Spinning ring */}
                  <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  {/* Inner icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-blue-600 animate-pulse" />
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl -z-10 animate-pulse" />
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 mb-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="text-slate-700 font-medium mb-1">Signing you in...</p>
                <p className="text-sm text-slate-500">Preparing your workspace</p>

                {/* Loading steps */}
                <div className="mt-6 space-y-2 text-left max-w-xs mx-auto">
                  {[
                    { label: "Authenticating", done: progress > 30 },
                    { label: "Loading workspace", done: progress > 60 },
                    { label: "Almost ready", done: progress > 90 },
                  ].map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {step.done ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 animate-scale-in" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-slate-300 rounded-full" />
                      )}
                      <span className={step.done ? "text-slate-700" : "text-slate-400"}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <Button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                      Sign In to Platform
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    onClick={() => setLocation("/")}
                    className="text-sm text-slate-600 hover:text-blue-600 transition-colors duration-200 font-medium group"
                  >
                    <span className="inline-flex items-center gap-1">
                      <span className="group-hover:-translate-x-1 transition-transform">←</span>
                      Back to Home
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-center text-slate-500">
              By signing in, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Need help?{" "}
            <a 
              href="mailto:support@venturr.app" 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

