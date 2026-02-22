import { useState } from "react";
import { motion } from "framer-motion";
import {
  Palette,
  Image,
  Globe,
  Building2,
  Eye,
  Save,
  RefreshCw,
  CheckCircle,
  Upload,
  Loader2,
  Settings,
  Monitor,
  Smartphone,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

interface BrandingConfig {
  companyName: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  customDomain: string;
  headerText: string;
  footerText: string;
  supportEmail: string;
  supportPhone: string;
  privacyPolicyUrl: string;
  termsUrl: string;
  hideVenturBranding: boolean;
  customCss: string;
}

const defaultConfig: BrandingConfig = {
  companyName: "Acme Construction Group",
  logoUrl: "",
  faviconUrl: "",
  primaryColor: "#0891b2",
  secondaryColor: "#06b6d4",
  accentColor: "#22d3ee",
  customDomain: "quotes.acmeconstruction.com.au",
  headerText: "Quote Verification Portal",
  footerText: "© 2024 Acme Construction Group. All rights reserved.",
  supportEmail: "support@acmeconstruction.com.au",
  supportPhone: "1300 123 456",
  privacyPolicyUrl: "https://acmeconstruction.com.au/privacy",
  termsUrl: "https://acmeconstruction.com.au/terms",
  hideVenturBranding: false,
  customCss: "",
};

export default function WhiteLabelConfig() {
  const [config, setConfig] = useState<BrandingConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState("branding");

  const updateConfig = (updates: Partial<BrandingConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success("White-label configuration saved successfully");
    setIsSaving(false);
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    toast.info("Configuration reset to defaults");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 triangle-pattern opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4">
              <Building2 className="w-3 h-3 mr-1" />
              Enterprise
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              White-Label Configuration
            </h1>
            <p className="text-muted-foreground">
              Customize the platform with your company branding. Add your logo, colors, and custom domain for a seamless experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="branding">
                    <Palette className="w-4 h-4 mr-2" />
                    Branding
                  </TabsTrigger>
                  <TabsTrigger value="domain">
                    <Globe className="w-4 h-4 mr-2" />
                    Domain
                  </TabsTrigger>
                  <TabsTrigger value="content">
                    <Settings className="w-4 h-4 mr-2" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="advanced">
                    <Settings className="w-4 h-4 mr-2" />
                    Advanced
                  </TabsTrigger>
                </TabsList>

                {/* Branding Tab */}
                <TabsContent value="branding">
                  <Card>
                    <CardHeader>
                      <CardTitle>Brand Identity</CardTitle>
                      <CardDescription>
                        Upload your logo and set your brand colors
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={config.companyName}
                          onChange={(e) => updateConfig({ companyName: e.target.value })}
                          placeholder="Your Company Name"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Logo</Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Upload logo (PNG, SVG)
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Recommended: 200x50px
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Favicon</Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Upload favicon (ICO, PNG)
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Recommended: 32x32px
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label>Brand Colors</Label>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Primary</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={config.primaryColor}
                                onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                                className="w-12 h-10 p-1 cursor-pointer"
                              />
                              <Input
                                value={config.primaryColor}
                                onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                                className="flex-1 font-mono text-sm"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Secondary</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={config.secondaryColor}
                                onChange={(e) => updateConfig({ secondaryColor: e.target.value })}
                                className="w-12 h-10 p-1 cursor-pointer"
                              />
                              <Input
                                value={config.secondaryColor}
                                onChange={(e) => updateConfig({ secondaryColor: e.target.value })}
                                className="flex-1 font-mono text-sm"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Accent</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={config.accentColor}
                                onChange={(e) => updateConfig({ accentColor: e.target.value })}
                                className="w-12 h-10 p-1 cursor-pointer"
                              />
                              <Input
                                value={config.accentColor}
                                onChange={(e) => updateConfig({ accentColor: e.target.value })}
                                className="flex-1 font-mono text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Domain Tab */}
                <TabsContent value="domain">
                  <Card>
                    <CardHeader>
                      <CardTitle>Custom Domain</CardTitle>
                      <CardDescription>
                        Configure your custom domain for a branded experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="customDomain">Custom Domain</Label>
                        <Input
                          id="customDomain"
                          value={config.customDomain}
                          onChange={(e) => updateConfig({ customDomain: e.target.value })}
                          placeholder="quotes.yourcompany.com"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter your custom domain (e.g., quotes.yourcompany.com)
                        </p>
                      </div>

                      <Alert>
                        <Globe className="w-4 h-4" />
                        <AlertTitle>DNS Configuration Required</AlertTitle>
                        <AlertDescription className="space-y-2">
                          <p>Add the following DNS records to your domain:</p>
                          <div className="mt-2 p-3 bg-muted rounded-lg font-mono text-xs space-y-1">
                            <div className="flex justify-between items-center">
                              <span>CNAME: {config.customDomain} → proxy.venturr.com.au</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(`${config.customDomain} CNAME proxy.venturr.com.au`)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>

                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">SSL Certificate</p>
                          <p className="text-sm text-muted-foreground">
                            Automatic SSL provisioning via Let's Encrypt
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content">
                  <Card>
                    <CardHeader>
                      <CardTitle>Content & Support</CardTitle>
                      <CardDescription>
                        Customize text content and support information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="headerText">Header Text</Label>
                        <Input
                          id="headerText"
                          value={config.headerText}
                          onChange={(e) => updateConfig({ headerText: e.target.value })}
                          placeholder="Quote Verification Portal"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="footerText">Footer Text</Label>
                        <Input
                          id="footerText"
                          value={config.footerText}
                          onChange={(e) => updateConfig({ footerText: e.target.value })}
                          placeholder="© 2024 Your Company. All rights reserved."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="supportEmail">Support Email</Label>
                          <Input
                            id="supportEmail"
                            type="email"
                            value={config.supportEmail}
                            onChange={(e) => updateConfig({ supportEmail: e.target.value })}
                            placeholder="support@yourcompany.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supportPhone">Support Phone</Label>
                          <Input
                            id="supportPhone"
                            value={config.supportPhone}
                            onChange={(e) => updateConfig({ supportPhone: e.target.value })}
                            placeholder="1300 123 456"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="privacyUrl">Privacy Policy URL</Label>
                          <Input
                            id="privacyUrl"
                            value={config.privacyPolicyUrl}
                            onChange={(e) => updateConfig({ privacyPolicyUrl: e.target.value })}
                            placeholder="https://yourcompany.com/privacy"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="termsUrl">Terms of Service URL</Label>
                          <Input
                            id="termsUrl"
                            value={config.termsUrl}
                            onChange={(e) => updateConfig({ termsUrl: e.target.value })}
                            placeholder="https://yourcompany.com/terms"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Advanced Tab */}
                <TabsContent value="advanced">
                  <Card>
                    <CardHeader>
                      <CardTitle>Advanced Settings</CardTitle>
                      <CardDescription>
                        Additional customization options for enterprise clients
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Hide VENTURR Branding</p>
                          <p className="text-sm text-muted-foreground">
                            Remove "Powered by VENTURR" from the footer
                          </p>
                        </div>
                        <Switch
                          checked={config.hideVenturBranding}
                          onCheckedChange={(checked) => updateConfig({ hideVenturBranding: checked })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customCss">Custom CSS</Label>
                        <textarea
                          id="customCss"
                          value={config.customCss}
                          onChange={(e) => updateConfig({ customCss: e.target.value })}
                          placeholder="/* Add custom CSS here */"
                          className="w-full h-32 p-3 rounded-lg border bg-muted font-mono text-sm resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          Advanced: Add custom CSS to further customize the appearance
                        </p>
                      </div>

                      <Alert>
                        <Settings className="w-4 h-4" />
                        <AlertTitle>Enterprise Features</AlertTitle>
                        <AlertDescription>
                          Contact our enterprise team for additional customization options including custom integrations, SSO, and dedicated support.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-6">
                <Button variant="outline" onClick={handleReset}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Configuration
                </Button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Preview</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant={previewMode === "desktop" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setPreviewMode("desktop")}
                      >
                        <Monitor className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={previewMode === "mobile" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setPreviewMode("mobile")}
                      >
                        <Smartphone className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border rounded-lg overflow-hidden transition-all ${
                      previewMode === "mobile" ? "max-w-[320px] mx-auto" : ""
                    }`}
                  >
                    {/* Preview Header */}
                    <div
                      className="p-3 flex items-center justify-between"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      <div className="flex items-center gap-2">
                        {config.logoUrl ? (
                          <img src={config.logoUrl} alt="Logo" className="h-6" />
                        ) : (
                          <div className="w-24 h-6 bg-white/20 rounded" />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <div className="w-16 h-6 bg-white/20 rounded" />
                      </div>
                    </div>

                    {/* Preview Content */}
                    <div className="p-4 bg-background min-h-[200px]">
                      <div className="text-center mb-4">
                        <h3 className="font-bold" style={{ color: config.primaryColor }}>
                          {config.headerText || "Quote Verification Portal"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {config.companyName}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="h-8 bg-muted rounded" />
                        <div className="h-8 bg-muted rounded" />
                        <Button
                          className="w-full"
                          style={{ backgroundColor: config.primaryColor }}
                        >
                          Verify Quote
                        </Button>
                      </div>
                    </div>

                    {/* Preview Footer */}
                    <div className="p-2 bg-muted text-center">
                      <p className="text-xs text-muted-foreground">
                        {config.footerText || "© 2024 Your Company"}
                      </p>
                      {!config.hideVenturBranding && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Powered by VENTURR VALDT
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground text-center">
                      Preview URL: <span className="font-mono">{config.customDomain || "yourcompany.venturr.com.au"}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Enterprise Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>For small teams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$299<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Custom logo & colors
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Subdomain (company.venturr.com.au)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Up to 100 quotes/month
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Get Started</Button>
              </CardFooter>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <Badge className="w-fit mb-2">Most Popular</Badge>
                <CardTitle>Professional</CardTitle>
                <CardDescription>For growing businesses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">$599<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Everything in Starter
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Custom domain
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Remove VENTURR branding
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Up to 500 quotes/month
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Get Started</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>For large organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">Custom</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Everything in Professional
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Custom integrations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    SSO / SAML
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Dedicated support
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
