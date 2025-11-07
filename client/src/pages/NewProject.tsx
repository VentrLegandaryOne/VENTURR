import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AddressInput, formatAddress } from "@/components/AddressInput";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { nanoid } from "nanoid";

export default function NewProject() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedOrg, setSelectedOrg] = useState<string>("");

  const { data: organizations } = trpc.organizations.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createOrgMutation = trpc.organizations.create.useMutation();
  const createProjectMutation = trpc.projects.create.useMutation();

  const [formData, setFormData] = useState({
    title: "",
    address: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    propertyType: "residential" as "residential" | "commercial" | "industrial",
  });

  const [addressComponents, setAddressComponents] = useState<{
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
  }>({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedOrg) {
      setSelectedOrg(organizations[0].id);
    }
  }, [organizations, selectedOrg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let orgId = selectedOrg;

      // Create organization if none exists
      if (!orgId && user) {
        const newOrg = await createOrgMutation.mutateAsync({
          name: `${user.name || user.email}'s Organization`,
        });
        orgId = newOrg.id;
      }

      if (!orgId) {
        toast.error("Please select or create an organization");
        return;
      }

      // Create project with formatted address
      const result = await createProjectMutation.mutateAsync({
        organizationId: orgId,
        ...formData,
        address: formatAddress(addressComponents),
      });

      toast.success("Project created successfully!");
      setLocation(`/projects/${result.id}`);
    } catch (error) {
      toast.error("Failed to create project");
      console.error(error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50 relative">
      {/* Futuristic Chequered Background */}
      <div className="background-glow fixed inset-0 z-0" />
      
      {/* Header */}
      <header className="relative z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-lg shadow-rose-500/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-slate-900">New Project</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl relative z-2 animate-fadeInUp">
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
            <CardDescription>Enter project details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Residential Roof Replacement - 123 Main St"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type *</Label>
                <Select
                  value={formData.propertyType}
                  onValueChange={(value) => handleChange("propertyType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold mb-2">Property Address</h3>
                <AddressInput
                  value={addressComponents}
                  onChange={setAddressComponents}
                  required={false}
                />
              </div>

              {/* Client Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Client Information</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      placeholder="John Smith"
                      value={formData.clientName}
                      onChange={(e) => handleChange("clientName", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Client Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      placeholder="john.smith@example.com"
                      value={formData.clientEmail}
                      onChange={(e) => handleChange("clientEmail", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Client Phone</Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      placeholder="0412 345 678"
                      value={formData.clientPhone}
                      onChange={(e) => handleChange("clientPhone", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createProjectMutation.isPending || createOrgMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {(createProjectMutation.isPending || createOrgMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Create Project
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

