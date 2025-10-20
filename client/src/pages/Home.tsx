import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Check, Ruler, Calculator, FileText, Shield, Zap, TrendingUp, ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  const features = [
    {
      icon: Ruler,
      title: "Site Measure",
      description: "Precise measurements with Venturr Measure™ device integration for accurate site planning.",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      icon: Calculator,
      title: "Roofing Takeoff",
      description: "AI-powered material calculations with waste tracking and real-time pricing.",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: FileText,
      title: "Quote Generator",
      description: "Professional quotes with ThomCo Roofing branding, PDF export, and email delivery.",
      color: "text-pink-500",
      bgColor: "bg-pink-50",
    },
    {
      icon: Shield,
      title: "Compliance",
      description: "Automated HB-39, NCC 2022, and SafeWork NSW documentation generation.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$49",
      period: "/month",
      description: "Perfect for individual contractors",
      features: [
        "Up to 10 projects/month",
        "Basic takeoff calculator",
        "Quote generation",
        "Email support",
      ],
    },
    {
      name: "Pro",
      price: "$149",
      period: "/month",
      description: "For growing trade businesses",
      features: [
        "Unlimited projects",
        "Advanced takeoff with AI",
        "Site measurement integration",
        "Compliance documentation",
        "Priority support",
        "Team collaboration",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
        "White-label options",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center relative">
                <div className="absolute inset-0 bg-blue-500 rounded-lg blur-md opacity-50"></div>
                <div className="relative w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-white"></div>
              </div>
              <span className="text-2xl font-bold text-slate-900">Venturr</span>
              <span className="px-2 py-0.5 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">BETA</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">Features</a>
              <a href="#pricing" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">Reviews</a>
              {isAuthenticated ? (
                <Button onClick={() => setLocation("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => window.location.href = getLoginUrl()}>Sign In</Button>
                  <Button onClick={handleGetStarted} className="bg-blue-600 hover:bg-blue-700">Start Free Trial</Button>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200 bg-white">
              <nav className="flex flex-col space-y-4">
                <a href="#features" className="text-sm font-medium text-slate-700 hover:text-blue-600">Features</a>
                <a href="#pricing" className="text-sm font-medium text-slate-700 hover:text-blue-600">Pricing</a>
                <a href="#testimonials" className="text-sm font-medium text-slate-700 hover:text-blue-600">Reviews</a>
                {isAuthenticated ? (
                  <Button onClick={() => setLocation("/dashboard")} className="w-full">Go to Dashboard</Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => window.location.href = getLoginUrl()} className="w-full">Sign In</Button>
                    <Button onClick={handleGetStarted} className="w-full">Start Free Trial</Button>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              AI-Powered Operating System for <span className="text-blue-600">Trade Businesses</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Streamline quoting, compliance, scheduling, and material ordering with smart hardware integration. Built for tradespeople, contractors, and project managers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-slate-600">Powerful tools designed for modern trade businesses</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-xl text-slate-600">Simple workflow, powerful results</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Measure Site</h3>
              <p className="text-slate-600">Use Venturr Measure™ device or manual input to capture accurate site dimensions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Calculate Materials</h3>
              <p className="text-slate-600">AI-powered takeoff calculator determines exact materials, labor, and costs</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Generate Quote</h3>
              <p className="text-slate-600">Create professional quotes with compliance docs and send to clients instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-slate-600">Choose the plan that fits your business</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 border-2 shadow-xl' : 'border-2'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-slate-600">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full mt-6 ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={handleGetStarted}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl mb-8 text-blue-100">Join hundreds of trade businesses already using Venturr</p>
          <Button size="lg" variant="secondary" onClick={handleGetStarted} className="text-lg px-8 py-6">
            Start Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-slate-400">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-white"></div>
                </div>
                <span className="text-xl font-bold text-white">Venturr</span>
              </div>
              <p className="text-sm">AI-powered operating system for trade businesses</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 Venturr. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

