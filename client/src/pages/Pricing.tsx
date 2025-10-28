import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface Plan {
  id: string;
  name: string;
  amount: number;
  interval: string;
  features: string[];
}

export default function Pricing() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Hardcoded plans for display (since getPlans requires auth)
  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      amount: 4900,
      interval: 'month',
      features: [
        'Up to 10 projects/month',
        'Basic takeoff calculator',
        'Quote generation',
        'Email support',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      amount: 14900,
      interval: 'month',
      features: [
        'Unlimited projects',
        'Advanced takeoff with AI',
        'Site measurement integration',
        'Compliance documentation',
        'Priority support',
        'Team collaboration',
      ],
    },
    {
      id: 'growth',
      name: 'Growth',
      amount: 29900,
      interval: 'month',
      features: [
        'Everything in Pro',
        'Multi-team support',
        'Advanced analytics',
        'API access',
        'Custom workflows',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      amount: 0,
      interval: 'month',
      features: [
        'Everything in Growth',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
        'White-label options',
      ],
    },
  ];

  const plansLoading = false;

  // Create checkout session
  const createCheckoutMutation = useMutation({
    mutationFn: async (planType: string) => {
      const response = await fetch("/api/trpc/subscriptions.createCheckout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create checkout session");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.result?.data?.url) {
        window.location.href = data.result.data.url;
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to start checkout");
    },
  });

  const handleSelectPlan = (planId: string) => {
    if (!isAuthenticated) {
      // Redirect to login/signup
      setLocation("/?signup=true");
      return;
    }

    if (planId === "enterprise") {
      // Contact sales for enterprise
      toast.info("Please contact sales@venturr.com for Enterprise pricing");
      return;
    }

    createCheckoutMutation.mutate(planId);
  };

  const formatPrice = (amount: number) => {
    if (amount === 0) return "Custom";
    return `$${(amount / 100).toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900">Pricing</h1>
            <Button variant="ghost" onClick={() => setLocation("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold text-slate-900 mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl text-slate-600 mb-2">
          Choose the plan that fits your business
        </p>
        <p className="text-lg text-blue-600 font-semibold">
          14-day free trial on all plans • No credit card required
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans?.map((plan) => {
            const isPopular = plan.id === "pro";
            const isEnterprise = plan.id === "enterprise";

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  isPopular
                    ? "border-blue-500 border-2 shadow-lg scale-105"
                    : "border-slate-200"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-slate-900">
                      {formatPrice(plan.amount)}
                    </span>
                    {plan.amount > 0 && (
                      <span className="text-slate-600">/{plan.interval}</span>
                    )}
                  </div>
                  <CardDescription>
                    {plan.id === "starter" && "Perfect for individual contractors"}
                    {plan.id === "pro" && "For growing trade businesses"}
                    {plan.id === "growth" && "For established companies"}
                    {plan.id === "enterprise" && "For large organizations"}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Button
                    className="w-full mb-6"
                    variant={isPopular ? "default" : "outline"}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={createCheckoutMutation.isPending}
                  >
                    {createCheckoutMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : isEnterprise ? (
                      "Contact Sales"
                    ) : (
                      "Start Free Trial"
                    )}
                  </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">
          Frequently Asked Questions
        </h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">
              What happens after the 14-day trial?
            </h4>
            <p className="text-slate-600">
              After your trial ends, you'll be charged for your selected plan. You can
              cancel anytime during the trial with no charges.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">
              Can I change plans later?
            </h4>
            <p className="text-slate-600">
              Yes! You can upgrade or downgrade your plan at any time. Changes take
              effect immediately, and we'll prorate the charges.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">
              What payment methods do you accept?
            </h4>
            <p className="text-slate-600">
              We accept all major credit cards (Visa, Mastercard, American Express) via
              Stripe's secure payment processing.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">
              Is there a setup fee?
            </h4>
            <p className="text-slate-600">
              No setup fees, no hidden charges. You only pay the monthly subscription
              price for your selected plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

