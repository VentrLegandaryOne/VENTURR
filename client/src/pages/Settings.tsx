import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ValidatedInput } from "@/components/ValidatedInput";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Building2, FileText, Image, Loader2, Save, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function Settings() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"business" | "branding" | "defaults">("business");

  const { data: organizations } = trpc.organizations.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const selectedOrg = organizations?.[0];

  const updateOrgMutation = trpc.organizations.update.useMutation({
    onSuccess: () => {
      toast.success("Settings updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  const [businessSettings, setBusinessSettings] = useState({
    businessName: "",
    abn: "",
    address: "",
    phone: "",
    email: "",
    website: "",
  });

  const [brandingSettings, setBrandingSettings] = useState({
    logoUrl: "",
    primaryColor: "#2563eb",
    tagline: "Professional Roofing Solutions",
  });

  const [defaultSettings, setDefaultSettings] = useState({
    defaultMarkup: "30",
    defaultLaborRate: "85",
    defaultWarrantyYears: "10",
    defaultPaymentTerms: `Payment Terms:
- 30% deposit upon acceptance
- 40% upon material delivery
- 30% upon completion

Warranty:
- 10 years workmanship warranty
- Manufacturer's warranty on materials`,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (selectedOrg) {
      // Load existing settings from organization metadata
      const metadata = selectedOrg.metadata ? JSON.parse(selectedOrg.metadata) : {};
      
      setBusinessSettings({
        businessName: selectedOrg.name || "",
        abn: metadata.abn || "",
        address: metadata.address || "",
        phone: metadata.phone || "",
        email: metadata.email || "",
        website: metadata.website || "",
      });

      setBrandingSettings({
        logoUrl: metadata.logoUrl || "",
        primaryColor: metadata.primaryColor || "#2563eb",
        tagline: metadata.tagline || "Professional Roofing Solutions",
      });

      setDefaultSettings({
        defaultMarkup: metadata.defaultMarkup || "30",
        defaultLaborRate: metadata.defaultLaborRate || "85",
        defaultWarrantyYears: metadata.defaultWarrantyYears || "10",
        defaultPaymentTerms: metadata.defaultPaymentTerms || defaultSettings.defaultPaymentTerms,
      });
    }
  }, [selectedOrg]);

  const handleSaveSettings = async () => {
    if (!selectedOrg) return;

    const metadata = {
      ...businessSettings,
      ...brandingSettings,
      ...defaultSettings,
    };

    await updateOrgMutation.mutateAsync({
      id: selectedOrg.id,
      name: businessSettings.businessName,
      metadata: JSON.stringify(metadata),
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: Implement S3 upload
    // For now, use a data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setBrandingSettings({ ...brandingSettings, logoUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
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
              <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            </div>
            <Button onClick={handleSaveSettings} disabled={updateOrgMutation.isPending}>
              {updateOrgMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab("business")}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "business"
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="font-medium">Business Info</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("branding")}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "branding"
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Image className="w-5 h-5" />
                    <span className="font-medium">Branding</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("defaults")}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "defaults"
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">Defaults</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "business" && (
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>
                    Update your business details that will appear on quotes and invoices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ValidatedInput
                      label="Business Name"
                      value={businessSettings.businessName}
                      onChange={(value) =>
                        setBusinessSettings({ ...businessSettings, businessName: value })
                      }
                      required
                      placeholder="ThomCo Roofing"
                    />
                    <ValidatedInput
                      label="ABN"
                      type="abn"
                      value={businessSettings.abn}
                      onChange={(value) =>
                        setBusinessSettings({ ...businessSettings, abn: value })
                      }
                      placeholder="12 345 678 901"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea
                      id="address"
                      value={businessSettings.address}
                      onChange={(e) =>
                        setBusinessSettings({ ...businessSettings, address: e.target.value })
                      }
                      placeholder="123 Main Street, Sydney NSW 2000"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ValidatedInput
                      label="Phone"
                      type="phone"
                      value={businessSettings.phone}
                      onChange={(value) =>
                        setBusinessSettings({ ...businessSettings, phone: value })
                      }
                      placeholder="0400 000 000"
                    />
                    <ValidatedInput
                      label="Email"
                      type="email"
                      value={businessSettings.email}
                      onChange={(value) =>
                        setBusinessSettings({ ...businessSettings, email: value })
                      }
                      placeholder="info@business.com.au"
                    />
                  </div>

                  <ValidatedInput
                    label="Website"
                    type="url"
                    value={businessSettings.website}
                    onChange={(value) =>
                      setBusinessSettings({ ...businessSettings, website: value })
                    }
                    placeholder="https://www.business.com.au"
                  />
                </CardContent>
              </Card>
            )}

            {activeTab === "branding" && (
              <Card>
                <CardHeader>
                  <CardTitle>Branding & Design</CardTitle>
                  <CardDescription>
                    Customize your brand appearance on quotes and documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="logo">Business Logo</Label>
                    <div className="flex items-center space-x-4">
                      {brandingSettings.logoUrl && (
                        <img
                          src={brandingSettings.logoUrl}
                          alt="Logo"
                          className="w-24 h-24 object-contain border border-slate-200 rounded-lg p-2"
                        />
                      )}
                      <div>
                        <Input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById("logo")?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </Button>
                        <p className="text-sm text-slate-500 mt-2">
                          Recommended: PNG or SVG, max 500KB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={brandingSettings.tagline}
                      onChange={(e) =>
                        setBrandingSettings({ ...brandingSettings, tagline: e.target.value })
                      }
                      placeholder="Professional Roofing Solutions"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Brand Color</Label>
                    <div className="flex items-center space-x-4">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={brandingSettings.primaryColor}
                        onChange={(e) =>
                          setBrandingSettings({ ...brandingSettings, primaryColor: e.target.value })
                        }
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={brandingSettings.primaryColor}
                        onChange={(e) =>
                          setBrandingSettings({ ...brandingSettings, primaryColor: e.target.value })
                        }
                        placeholder="#2563eb"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "defaults" && (
              <Card>
                <CardHeader>
                  <CardTitle>Default Values</CardTitle>
                  <CardDescription>
                    Set default values for quotes and calculations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
                      <Input
                        id="defaultMarkup"
                        type="number"
                        value={defaultSettings.defaultMarkup}
                        onChange={(e) =>
                          setDefaultSettings({ ...defaultSettings, defaultMarkup: e.target.value })
                        }
                        placeholder="30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultLaborRate">Labor Rate ($/hr)</Label>
                      <Input
                        id="defaultLaborRate"
                        type="number"
                        value={defaultSettings.defaultLaborRate}
                        onChange={(e) =>
                          setDefaultSettings({ ...defaultSettings, defaultLaborRate: e.target.value })
                        }
                        placeholder="85"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultWarrantyYears">Warranty (years)</Label>
                      <Input
                        id="defaultWarrantyYears"
                        type="number"
                        value={defaultSettings.defaultWarrantyYears}
                        onChange={(e) =>
                          setDefaultSettings({
                            ...defaultSettings,
                            defaultWarrantyYears: e.target.value,
                          })
                        }
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultPaymentTerms">Default Payment Terms</Label>
                    <Textarea
                      id="defaultPaymentTerms"
                      value={defaultSettings.defaultPaymentTerms}
                      onChange={(e) =>
                        setDefaultSettings({
                          ...defaultSettings,
                          defaultPaymentTerms: e.target.value,
                        })
                      }
                      rows={12}
                      placeholder="Enter default payment terms..."
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

