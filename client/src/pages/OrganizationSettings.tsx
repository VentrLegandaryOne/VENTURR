import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Building2, CreditCard, Loader2, Save, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function OrganizationSettings() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: organizations, isLoading } = trpc.organizations.list.useQuery();
  const organization = organizations?.[0]; // Get first organization

  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/";
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || "",
      });
    }
  }, [organization]);

  const handleSave = () => {
    // TODO: Implement organization update API
    toast.success("Organization settings updated successfully");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 relative">
      {/* Futuristic Chequered Background */}
      <div className="background-glow fixed inset-0 z-0" />
      
      {/* Header */}
      <header className="relative z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-lg shadow-cyan-500/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-slate-900">Organization Settings</h1>
            </div>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl relative z-2">
        <div className="space-y-6">
          {/* Organization Information */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>Manage your organization details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{organization?.name || "Organization"}</p>
                  <p className="text-sm text-slate-600">
                    Plan: <span className="font-semibold capitalize">{organization?.subscriptionPlan}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Status: <span className={`font-semibold ${organization?.subscriptionStatus === 'active' ? 'text-green-600' : 'text-orange-600'}`}>
                      {organization?.subscriptionStatus}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter organization name"
                />
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-slate-600">
                  <strong>Organization ID:</strong> {organization?.id}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  <strong>Created:</strong> {organization?.createdAt ? new Date(organization.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Subscription & Billing</CardTitle>
                  <CardDescription>Manage your subscription plan</CardDescription>
                </div>
                <CreditCard className="w-6 h-6 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Plan */}
              <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg capitalize">{organization?.subscriptionPlan} Plan</h3>
                  <span className="text-2xl font-bold text-blue-600">
                    ${organization?.subscriptionPlan === 'starter' ? '49' : organization?.subscriptionPlan === 'pro' ? '149' : 'Custom'}/mo
                  </span>
                </div>
                <p className="text-sm text-slate-700 mb-4">
                  {organization?.subscriptionPlan === 'starter' && 'Perfect for individual contractors'}
                  {organization?.subscriptionPlan === 'pro' && 'For growing trade businesses'}
                  {organization?.subscriptionPlan === 'enterprise' && 'Custom solution for large organizations'}
                </p>
                {organization?.currentPeriodEnd && (
                  <p className="text-xs text-slate-600">
                    Renews on: {new Date(organization.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Plan Features */}
              <div className="space-y-2">
                <p className="font-semibold text-sm">Current Plan Features:</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  {organization?.subscriptionPlan === 'starter' && (
                    <>
                      <li>✓ Up to 10 projects/month</li>
                      <li>✓ Basic takeoff calculator</li>
                      <li>✓ Quote generation</li>
                      <li>✓ Email support</li>
                    </>
                  )}
                  {organization?.subscriptionPlan === 'pro' && (
                    <>
                      <li>✓ Unlimited projects</li>
                      <li>✓ Advanced takeoff with AI</li>
                      <li>✓ Site measurement integration</li>
                      <li>✓ Compliance documentation</li>
                      <li>✓ Priority support</li>
                      <li>✓ Team collaboration</li>
                    </>
                  )}
                  {organization?.subscriptionPlan === 'enterprise' && (
                    <>
                      <li>✓ Everything in Pro</li>
                      <li>✓ Custom integrations</li>
                      <li>✓ Dedicated account manager</li>
                      <li>✓ SLA guarantee</li>
                      <li>✓ White-label options</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Change Plan
                </Button>
                <Button variant="outline" className="flex-1">
                  Billing History
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage organization members</CardDescription>
                </div>
                <Users className="w-6 h-6 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Team management coming soon</p>
                <p className="text-xs mt-1">Upgrade to Pro plan to add team members</p>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Invite Team Member
              </Button>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>Current month usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Projects Created</p>
                  <p className="text-3xl font-bold text-blue-600">0</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {organization?.subscriptionPlan === 'starter' ? 'of 10 limit' : 'Unlimited'}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Quotes Generated</p>
                  <p className="text-3xl font-bold text-green-600">0</p>
                  <p className="text-xs text-slate-500 mt-1">This month</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Storage Used</p>
                  <p className="text-3xl font-bold text-purple-600">0 MB</p>
                  <p className="text-xs text-slate-500 mt-1">of 5 GB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Access */}
          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>Manage API keys and integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">API access available on Pro and Enterprise plans</p>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Generate API Key
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

