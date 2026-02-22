import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { User, ChevronLeft, Save, Building2, MapPin, Phone, Mail, Globe, Briefcase, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

const AUSTRALIAN_STATES = [
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
];

const TRADE_TYPES = [
  "Roofing", "Plumbing", "Electrical", "Building", "HVAC",
  "Painting", "Tiling", "Concreting", "Landscaping", "Glazing",
  "Carpentry", "Demolition", "Fencing", "Flooring", "Other",
];

interface ProfileData {
  displayName: string;
  email: string;
  phone: string;
  company: string;
  abn: string;
  website: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  tradeType: string;
  licenseNumber: string;
  bio: string;
  emailOnVerificationComplete: boolean;
  emailOnComparisonComplete: boolean;
  emailOnPricingAlert: boolean;
  emailOnComplianceAlert: boolean;
  emailWeeklyDigest: boolean;
}

export default function SettingsProfile() {
  const { isAuthenticated, user, loading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    displayName: "",
    email: "",
    phone: "",
    company: "",
    abn: "",
    emailOnVerificationComplete: true,
    emailOnComparisonComplete: true,
    emailOnPricingAlert: true,
    emailOnComplianceAlert: true,
    emailWeeklyDigest: false,
    website: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    tradeType: "",
    licenseNumber: "",
    bio: "",
  });

  // Load profile from user data and localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`venturr_profile_${user.id}`);
      const savedData = saved ? JSON.parse(saved) : {};
      setProfile({
        displayName: savedData.displayName || user.name || "",
        email: savedData.email || user.email || "",
        phone: savedData.phone || "",
        company: savedData.company || "",
        abn: savedData.abn || "",
        website: savedData.website || "",
        address: savedData.address || "",
        city: savedData.city || "",
        state: savedData.state || "",
        postcode: savedData.postcode || "",
        tradeType: savedData.tradeType || "",
        licenseNumber: savedData.licenseNumber || "",
        bio: savedData.bio || "",
        emailOnVerificationComplete: savedData.emailOnVerificationComplete !== undefined ? savedData.emailOnVerificationComplete : true,
        emailOnComparisonComplete: savedData.emailOnComparisonComplete !== undefined ? savedData.emailOnComparisonComplete : true,
        emailOnPricingAlert: savedData.emailOnPricingAlert !== undefined ? savedData.emailOnPricingAlert : true,
        emailOnComplianceAlert: savedData.emailOnComplianceAlert !== undefined ? savedData.emailOnComplianceAlert : true,
        emailWeeklyDigest: savedData.emailWeeklyDigest !== undefined ? savedData.emailWeeklyDigest : false,
      });
    }
  }, [user]);

  if (!loading && !isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const updateField = (field: keyof ProfileData, value: string | boolean) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate required fields
      if (!profile.displayName.trim()) {
        toast.error("Display name is required");
        setIsSaving(false);
        return;
      }

      // Validate email format
      if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
        toast.error("Please enter a valid email address");
        setIsSaving(false);
        return;
      }

      // Validate ABN format (11 digits)
      if (profile.abn && !/^\d{2}\s?\d{3}\s?\d{3}\s?\d{3}$/.test(profile.abn.replace(/\s/g, ''))) {
        toast.error("ABN must be 11 digits");
        setIsSaving(false);
        return;
      }

      // Validate postcode (4 digits for Australia)
      if (profile.postcode && !/^\d{4}$/.test(profile.postcode)) {
        toast.error("Postcode must be 4 digits");
        setIsSaving(false);
        return;
      }

      // Save to localStorage
      if (user) {
        localStorage.setItem(`venturr_profile_${user.id}`, JSON.stringify(profile));
      }

      setHasChanges(false);
      toast.success("Profile saved successfully");
    } catch (error) {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container py-8">
        <div className="mb-8">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <User className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="text-muted-foreground">Update your personal and business information</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="max-w-3xl space-y-8">
          {/* Personal Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={profile.displayName}
                    onChange={(e) => updateField("displayName", e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="0400 000 000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Website
                  </Label>
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  placeholder="Tell us about yourself and your experience..."
                  rows={3}
                />
              </div>
            </Card>
          </motion.div>

          {/* Business Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Business Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => updateField("company", e.target.value)}
                    placeholder="Your business name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abn">ABN</Label>
                  <Input
                    id="abn"
                    value={profile.abn}
                    onChange={(e) => updateField("abn", e.target.value.replace(/[^\d\s]/g, ""))}
                    placeholder="12 345 678 901"
                    maxLength={14}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tradeType" className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Trade Type
                  </Label>
                  <Select value={profile.tradeType} onValueChange={(v) => updateField("tradeType", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your trade" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRADE_TYPES.map((trade) => (
                        <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={profile.licenseNumber}
                    onChange={(e) => updateField("licenseNumber", e.target.value)}
                    placeholder="Enter your license number"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Address */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Address
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City / Suburb</Label>
                    <Input
                      id="city"
                      value={profile.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="Sydney"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select value={profile.state} onValueChange={(v) => updateField("state", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {AUSTRALIAN_STATES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input
                      id="postcode"
                      value={profile.postcode}
                      onChange={(e) => updateField("postcode", e.target.value.replace(/\D/g, ""))}
                      placeholder="2000"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Email Notification Preferences */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Email Notifications
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Choose which email notifications you'd like to receive. In-app notifications are always enabled.
              </p>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Verification Complete</Label>
                    <p className="text-xs text-muted-foreground">Get notified when your quote verification finishes with score breakdown and report link</p>
                  </div>
                  <Switch
                    checked={profile.emailOnVerificationComplete}
                    onCheckedChange={(checked) => updateField("emailOnVerificationComplete", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Comparison Complete</Label>
                    <p className="text-xs text-muted-foreground">Get notified when your quote comparison analysis is ready with recommendations</p>
                  </div>
                  <Switch
                    checked={profile.emailOnComparisonComplete}
                    onCheckedChange={(checked) => updateField("emailOnComparisonComplete", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Pricing Alerts</Label>
                    <p className="text-xs text-muted-foreground">Get alerted when unusual pricing is detected in your quotes</p>
                  </div>
                  <Switch
                    checked={profile.emailOnPricingAlert}
                    onCheckedChange={(checked) => updateField("emailOnPricingAlert", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Compliance Alerts</Label>
                    <p className="text-xs text-muted-foreground">Get alerted when compliance issues are found in your quotes</p>
                  </div>
                  <Switch
                    checked={profile.emailOnComplianceAlert}
                    onCheckedChange={(checked) => updateField("emailOnComplianceAlert", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Weekly Digest</Label>
                    <p className="text-xs text-muted-foreground">Receive a weekly summary of your quote activity and market insights</p>
                  </div>
                  <Switch
                    checked={profile.emailWeeklyDigest}
                    onCheckedChange={(checked) => updateField("emailWeeklyDigest", checked)}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Account Info (read-only) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-6 bg-muted/30">
              <h2 className="text-lg font-semibold mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Account ID:</span>
                  <span className="ml-2 font-mono">{user?.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Role:</span>
                  <span className="ml-2 capitalize">{user?.role}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Registered:</span>
                  <span className="ml-2">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-AU') : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Auth Provider:</span>
                  <span className="ml-2">Manus OAuth</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
