import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Loader2, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

/**
 * Dedicated Login Page
 * Separate from the main platform - handles authentication only
 */
export default function Login() {
  const [, setLocation] = useLocation();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    
    try {
      const response = await fetch("/api/auth/simple-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Successful sign-in - wait a moment then redirect to dashboard
        setTimeout(() => {
          setLocation("/dashboard");
        }, 500);
      } else {
        setError(data.error || "Sign-in failed. Please try again.");
        setIsSigningIn(false);
      }
    } catch (err) {
      console.error("Sign-in error:", err);
      setError("Network error. Please check your connection and try again.");
      setIsSigningIn(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      
      <div className="w-full max-w-md px-6">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-blue-500/10 p-8 border border-slate-200/50">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {APP_LOGO && (
                <img 
                  src={APP_LOGO} 
                  alt={APP_TITLE} 
                  className="h-16 w-16 object-contain"
                />
              )}
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {APP_TITLE}
            </h1>
            <p className="text-slate-600 text-sm">
              AI-Powered Operating System for Trade Businesses
            </p>
          </div>

          {/* Sign In Section */}
          <div className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {isSigningIn ? (
              <div className="text-center py-8">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-blue-600 animate-pulse" />
                  </div>
                </div>
                <p className="text-slate-700 font-medium">Signing you in...</p>
                <p className="text-sm text-slate-500 mt-1">Please wait</p>
              </div>
            ) : (
              <>
                <Button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In to Platform
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    onClick={() => setLocation("/")}
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    ← Back to Home
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-center text-slate-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Need help? <a href="mailto:support@venturr.app" className="text-blue-600 hover:text-blue-700 font-medium">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}

