import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE } from "@/const";
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Shield, 
  TrendingUp, 
  Rocket, 
  Target, 
  Award, 
  Users,
  MapPin,
  Calculator,
  FileText,
  Clock,
  DollarSign,
  BarChart3
} from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  const handleSignIn = () => {
    // Redirect to dedicated login page
    setLocation("/login");
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      setLocation("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && (
              <img src={APP_LOGO} alt={APP_TITLE} className="h-9 w-9 object-contain" />
            )}
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              VENTURR
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Pricing
            </a>
            {isAuthenticated ? (
              <Button
                onClick={() => setLocation("/dashboard")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Dashboard
              </Button>
            ) : (
              <Button
                onClick={handleSignIn}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign In
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              AI-Powered Operating System for Trade Businesses
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
              Run Your Roofing Business
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Like a Pro
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              From satellite measurements to invoices in minutes. 
              AI-powered quoting, compliance, and project management—all in one platform.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                {isAuthenticated ? (
                  <>
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                ) : (
                  <>
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
              <Button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg rounded-xl border-2 border-slate-300 hover:border-slate-400"
              >
                See How It Works
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Australian standards compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Purpose-built for Australian roofing contractors
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                AI Site Measurement
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Measure roofs from satellite imagery. Draw, calculate areas, and extract measurements automatically—no ladders required.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-orange-600 flex items-center justify-center mb-6">
                <Calculator className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                Smart Takeoff Calculator
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Auto-calculate materials, labor, and plant. AI suggests optimal quantities with waste factors and compliance notes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-green-600 flex items-center justify-center mb-6">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                Professional Quotes
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Generate branded PDF quotes in seconds. Include compliance docs, method statements, and HBCF automatically.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-purple-600 flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                Compliance Built-In
              </h3>
              <p className="text-slate-600 leading-relaxed">
                AS 1562.1, AS/NZS 1170.2, AS 3959, NCC 2022. All Australian standards integrated—stay compliant effortlessly.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-pink-600 flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                10x Faster Workflow
              </h3>
              <p className="text-slate-600 leading-relaxed">
                What used to take hours now takes minutes. Automated workflows eliminate repetitive data entry and calculations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-cyan-600 flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                Project Insights
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Track profitability, monitor progress, and manage budgets. Real-time dashboards keep you in control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Simple 4-Step Process
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From lead to invoice in under 10 minutes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Create Project</h3>
              <p className="text-slate-600">
                Enter client details and project address. System auto-loads satellite imagery.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-orange-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Measure Site</h3>
              <p className="text-slate-600">
                Draw roof outline on satellite map. AI calculates area, perimeter, and pitch.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Calculate Takeoff</h3>
              <p className="text-slate-600">
                Select materials and crew size. System auto-calculates quantities and costs.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                4
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Generate Quote</h3>
              <p className="text-slate-600">
                One-click PDF generation with your branding. Email directly to client.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join Australian roofing contractors who've already made the switch to smarter workflows.
          </p>
          <Button
            onClick={handleGetStarted}
            disabled={isSigningIn || loading}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-6 text-lg rounded-xl shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1"
          >
            {isSigningIn ? "Signing In..." : isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-blue-100 text-sm mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 bg-slate-900 text-slate-400">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              {APP_LOGO && (
                <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8 object-contain" />
              )}
              <span className="text-xl font-bold text-white">VENTURR</span>
            </div>
            <p className="text-sm text-center md:text-left">
              © 2025 Venturr. AI-Powered Operating System for Trade Businesses.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

