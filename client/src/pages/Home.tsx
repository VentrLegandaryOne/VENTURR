import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE } from "@/const";
import { ArrowRight, CheckCircle2, Zap, Shield, TrendingUp, Rocket, Target, Award, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const response = await fetch("/api/auth/simple-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        // Reload to get the session cookie
        window.location.href = "/dashboard";
      } else {
        console.error("Sign-in failed");
        setIsSigningIn(false);
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setIsSigningIn(false);
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      handleSignIn();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && (
              <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
            )}
            <span className="text-xl font-semibold text-gray-900">{APP_TITLE}</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              How It Works
            </a>
            {isAuthenticated ? (
              <Button
                onClick={() => setLocation("/dashboard")}
                variant="default"
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button
                onClick={handleSignIn}
                disabled={isSigningIn}
                variant="default"
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                {isSigningIn ? "Signing In..." : "Sign In"}
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            AI-Powered Trade Business Platform
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Your Complete
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Roofing Business
            </span>
            <br />
            Operating System
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            From lead to invoice in minutes. Automate site measurements, generate accurate quotes, 
            and manage projects with AI-powered intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleGetStarted}
              disabled={isSigningIn}
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {isSigningIn ? "Signing In..." : (isAuthenticated ? "Go to Dashboard" : "Access Platform")}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>No setup required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>Instant access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to run your business
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for roofing contractors who want to work smarter, not harder
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                AI Site Measurement
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Measure roofs from satellite imagery with AI precision. Get accurate measurements 
                in seconds without climbing a ladder.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
              <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Smart Quote Generation
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Generate professional quotes instantly with AI-powered material calculations 
                and pricing optimization.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Compliance & Safety
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Automatic compliance checking for Australian standards. Stay safe and compliant 
                on every job.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple workflow, powerful results
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From inquiry to invoice in four simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Add Client", desc: "Create client profile and project details" },
              { step: "02", title: "Measure Site", desc: "AI-powered measurements from satellite imagery" },
              { step: "03", title: "Generate Quote", desc: "Smart calculations with material optimization" },
              { step: "04", title: "Win Job", desc: "Client portal for easy quote acceptance" }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="text-5xl font-bold text-gray-200 mb-4">{item.step}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to transform your business?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join leading roofing contractors using Venturr to grow their business
          </p>
          <Button
            onClick={handleGetStarted}
            disabled={isSigningIn}
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {isSigningIn ? "Signing In..." : (isAuthenticated ? "Go to Dashboard" : "Get Started Now")}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              {APP_LOGO && (
                <img src={APP_LOGO} alt={APP_TITLE} className="h-6 w-6" />
              )}
              <span className="text-sm text-gray-600">
                © 2025 {APP_TITLE}. All rights reserved.
              </span>
            </div>
            <div className="flex gap-8 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

