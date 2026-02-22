import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Shield, ChevronLeft, Save, Eye, Lock, Database, Trash2, Download, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PrivacySettings {
  shareAnalytics: boolean;
  shareUsageData: boolean;
  showProfilePublicly: boolean;
  allowContractorContact: boolean;
  twoFactorEnabled: boolean;
  sessionTimeout: string;
  dataRetentionDays: string;
}

export default function SettingsPrivacy() {
  const { isAuthenticated, user, loading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [settings, setSettings] = useState<PrivacySettings>({
    shareAnalytics: false,
    shareUsageData: false,
    showProfilePublicly: false,
    allowContractorContact: true,
    twoFactorEnabled: false,
    sessionTimeout: "30",
    dataRetentionDays: "365",
  });

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`venturr_privacy_${user.id}`);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
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

  const updateSetting = <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (user) {
        localStorage.setItem(`venturr_privacy_${user.id}`, JSON.stringify(settings));
      }
      setHasChanges(false);
      toast.success("Privacy settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    try {
      const exportData = {
        profile: localStorage.getItem(`venturr_profile_${user?.id}`),
        privacy: JSON.stringify(settings),
        exportedAt: new Date().toISOString(),
        userId: user?.id,
        userName: user?.name,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `venturr-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } catch {
      toast.error("Failed to export data");
    }
  };

  const handleClearLocalData = () => {
    if (user) {
      const keys = Object.keys(localStorage).filter(k => k.includes(`${user.id}`) || k.startsWith("venturr_"));
      keys.forEach(k => localStorage.removeItem(k));
      toast.success(`Cleared ${keys.length} local data entries`);
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
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Privacy & Security</h1>
                <p className="text-muted-foreground">Manage your data and security preferences</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="max-w-3xl space-y-8">
          {/* Privacy Controls */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Privacy Controls
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Share Analytics Data</Label>
                    <p className="text-sm text-muted-foreground">Help improve VENTURR by sharing anonymous usage analytics</p>
                  </div>
                  <Switch
                    checked={settings.shareAnalytics}
                    onCheckedChange={(v) => updateSetting("shareAnalytics", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Share Usage Data</Label>
                    <p className="text-sm text-muted-foreground">Allow aggregated usage patterns to improve platform features</p>
                  </div>
                  <Switch
                    checked={settings.shareUsageData}
                    onCheckedChange={(v) => updateSetting("shareUsageData", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">Allow other users to view your profile information</p>
                  </div>
                  <Switch
                    checked={settings.showProfilePublicly}
                    onCheckedChange={(v) => updateSetting("showProfilePublicly", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Contractor Contact</Label>
                    <p className="text-sm text-muted-foreground">Allow verified contractors to contact you about quotes</p>
                  </div>
                  <Switch
                    checked={settings.allowContractorContact}
                    onCheckedChange={(v) => updateSetting("allowContractorContact", v)}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Security Settings */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Security
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account (managed via Manus OAuth)</p>
                  </div>
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onCheckedChange={(v) => updateSetting("twoFactorEnabled", v)}
                  />
                </div>
                <div>
                  <Label className="text-base">Session Timeout</Label>
                  <p className="text-sm text-muted-foreground mb-2">Automatically log out after period of inactivity</p>
                  <div className="flex gap-2 flex-wrap">
                    {["15", "30", "60", "120"].map((mins) => (
                      <Button
                        key={mins}
                        variant={settings.sessionTimeout === mins ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting("sessionTimeout", mins)}
                      >
                        {parseInt(mins) < 60 ? `${mins} min` : `${parseInt(mins) / 60} hr`}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-medium text-sm mb-2">Active Sessions</h3>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-muted-foreground">
                        {navigator.userAgent.includes("Chrome") ? "Chrome" :
                         navigator.userAgent.includes("Firefox") ? "Firefox" :
                         navigator.userAgent.includes("Safari") ? "Safari" : "Browser"} 
                        {" "}&mdash; Active now
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Data Management */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Data Management
              </h2>
              <div className="space-y-6">
                <div>
                  <Label className="text-base">Data Retention</Label>
                  <p className="text-sm text-muted-foreground mb-2">How long to keep your verification history</p>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: "90", label: "90 days" },
                      { value: "180", label: "6 months" },
                      { value: "365", label: "1 year" },
                      { value: "730", label: "2 years" },
                      { value: "0", label: "Forever" },
                    ].map((opt) => (
                      <Button
                        key={opt.value}
                        variant={settings.dataRetentionDays === opt.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting("dataRetentionDays", opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <h3 className="font-medium">Export Your Data</h3>
                    <p className="text-sm text-muted-foreground">Download a copy of all your data in JSON format</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportData} className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                  <div>
                    <h3 className="font-medium text-destructive">Clear Local Data</h3>
                    <p className="text-sm text-muted-foreground">Remove all locally stored preferences and cache</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                        Clear
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          Clear Local Data
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove all locally stored preferences, cached data, and settings from this browser.
                          Your account data stored on the server will not be affected. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearLocalData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Clear Data
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
