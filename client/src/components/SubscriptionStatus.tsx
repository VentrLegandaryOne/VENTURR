import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Clock, Crown } from "lucide-react";
import { useLocation } from "wouter";

interface SubscriptionStatus {
  status: string;
  plan: string;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export function SubscriptionStatus() {
  const [, setLocation] = useLocation();

  const { data: subscription, isLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/trpc/subscriptions.getStatus"],
  });

  if (isLoading) {
    return null;
  }

  if (!subscription) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-lg">No Active Subscription</CardTitle>
          </div>
          <CardDescription>
            Start your 14-day free trial to access all features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setLocation("/pricing")} className="w-full">
            View Pricing Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isTrialing = subscription.status === 'trialing';
  const isActive = subscription.status === 'active';
  const isCanceled = subscription.status === 'canceled' || subscription.cancelAtPeriodEnd;

  const getPlanName = (plan: string) => {
    const names: Record<string, string> = {
      starter: 'Starter',
      pro: 'Pro',
      growth: 'Growth',
      enterprise: 'Enterprise',
    };
    return names[plan] || plan;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusIcon = () => {
    if (isTrialing) return <Clock className="h-5 w-5 text-blue-600" />;
    if (isActive) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (isCanceled) return <AlertCircle className="h-5 w-5 text-red-600" />;
    return <Crown className="h-5 w-5 text-purple-600" />;
  };

  const getStatusColor = () => {
    if (isTrialing) return 'border-blue-200 bg-blue-50';
    if (isActive) return 'border-green-200 bg-green-50';
    if (isCanceled) return 'border-red-200 bg-red-50';
    return 'border-purple-200 bg-purple-50';
  };

  const getStatusText = () => {
    if (isTrialing) return 'Free Trial Active';
    if (isActive) return 'Active Subscription';
    if (isCanceled) return 'Subscription Canceled';
    return subscription.status;
  };

  return (
    <Card className={getStatusColor()}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">{getStatusText()}</CardTitle>
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {getPlanName(subscription.plan)} Plan
          </span>
        </div>
        <CardDescription>
          {isTrialing && subscription.trialEnd && (
            <>Trial ends {formatDate(subscription.trialEnd)}</>
          )}
          {isActive && subscription.currentPeriodEnd && !isCanceled && (
            <>Renews {formatDate(subscription.currentPeriodEnd)}</>
          )}
          {isCanceled && subscription.currentPeriodEnd && (
            <>Access until {formatDate(subscription.currentPeriodEnd)}</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        {subscription.plan !== 'enterprise' && !isCanceled && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/pricing")}
            className="flex-1"
          >
            Upgrade Plan
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Open Stripe Customer Portal
            fetch("/api/trpc/subscriptions.createPortal", {
              method: "POST",
              credentials: "include",
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.result?.data?.url) {
                  window.location.href = data.result.data.url;
                }
              });
          }}
          className="flex-1"
        >
          Manage Billing
        </Button>
      </CardContent>
    </Card>
  );
}

