import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Bell,
  Mail,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Scale,
  BarChart3,
  Star,
  Shield,
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";
import QuietHoursSettings from "@/components/QuietHoursSettings";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

interface NotificationCategory {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const notificationCategories: NotificationCategory[] = [
  {
    key: "verification_complete",
    label: "Verification Complete",
    description: "Get notified when your quote verification is finished",
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
  },
  {
    key: "unusual_pricing",
    label: "Unusual Pricing Alerts",
    description: "Alerts when pricing seems significantly above or below market rates",
    icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  },
  {
    key: "compliance_warning",
    label: "Compliance Warnings",
    description: "Notifications about potential compliance issues in quotes",
    icon: <Scale className="h-5 w-5 text-red-500" />,
  },
  {
    key: "comparison_ready",
    label: "Comparison Ready",
    description: "When your quote comparison analysis is complete",
    icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
  },
  {
    key: "contractor_review",
    label: "Contractor Reviews",
    description: "Updates about contractor reviews and responses",
    icon: <Star className="h-5 w-5 text-yellow-500" />,
  },
  {
    key: "system_alert",
    label: "System Alerts",
    description: "Important system updates and announcements",
    icon: <Shield className="h-5 w-5 text-purple-500" />,
  },
];

export default function NotificationSettings() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [hasChanges, setHasChanges] = useState(false);

  // Local state for form
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [emailDigestFrequency, setEmailDigestFrequency] = useState<"instant" | "daily" | "weekly" | "never">("instant");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [categories, setCategories] = useState<Record<string, boolean>>({
    verification_complete: true,
    unusual_pricing: true,
    compliance_warning: true,
    comparison_ready: true,
    contractor_review: true,
    system_alert: true,
  });
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("08:00");
  const [quietHoursDays, setQuietHoursDays] = useState<string[]>([
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
  ]);

  const { data: preferences, isLoading: prefsLoading, error: errorPreferences } = trpc.notifications.getPreferences.useQuery(
    undefined,
    { enabled: !!user, retry: 2 }
  );

  const updatePreferences = trpc.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Notification preferences saved!");
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save preferences");
    },
  });

  // Sync local state with fetched preferences
  useEffect(() => {
    if (preferences) {
      setEmailEnabled(preferences.emailEnabled);
      setEmailDigestFrequency(preferences.emailDigestFrequency);
      setPushEnabled(preferences.pushEnabled);
      if (preferences.categories) {
        setCategories(preferences.categories as Record<string, boolean>);
      }
      // Quiet hours settings
      const prefs = preferences as any;
      if (prefs.quietHoursEnabled !== undefined) {
        setQuietHoursEnabled(prefs.quietHoursEnabled);
      }
      if (prefs.quietHoursStart) {
        setQuietHoursStart(prefs.quietHoursStart);
      }
      if (prefs.quietHoursEnd) {
        setQuietHoursEnd(prefs.quietHoursEnd);
      }
      if (prefs.quietHoursDays) {
        setQuietHoursDays(prefs.quietHoursDays);
      }
    }
  }, [preferences]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [authLoading, user, navigate]);

  const handleSave = () => {
    updatePreferences.mutate({
      emailEnabled,
      emailDigestFrequency,
      pushEnabled,
      categories: categories as any,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
      quietHoursDays,
    } as any);
  };

  const handleQuietHoursUpdate = (settings: {
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
    quietHoursDays: string[];
  }) => {
    setQuietHoursEnabled(settings.quietHoursEnabled);
    setQuietHoursStart(settings.quietHoursStart);
    setQuietHoursEnd(settings.quietHoursEnd);
    setQuietHoursDays(settings.quietHoursDays);
    setHasChanges(true);
  };

  const handleCategoryToggle = (key: string, enabled: boolean) => {
    setCategories((prev) => ({ ...prev, [key]: enabled }));
    setHasChanges(true);
  };

  if (authLoading || prefsLoading) {
    return <NotificationSettingsSkeleton />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container max-w-3xl py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bell className="h-6 w-6 text-[#00A8FF]" />
              Notification Settings
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Customize how and when you receive notifications
            </p>
          </div>
        </div>

        {/* Delivery Methods */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-lg">Delivery Methods</CardTitle>
            <CardDescription className="text-slate-400">
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <Label className="text-white font-medium">Email Notifications</Label>
                  <p className="text-sm text-slate-400">Receive notifications via email</p>
                </div>
              </div>
              <Switch
                checked={emailEnabled}
                onCheckedChange={(checked) => {
                  setEmailEnabled(checked);
                  setHasChanges(true);
                }}
              />
            </div>

            {/* Email Frequency */}
            {emailEnabled && (
              <div className="ml-13 pl-13 border-l-2 border-slate-700 ml-5 pl-8">
                <Label className="text-slate-300 text-sm mb-2 block">Email Frequency</Label>
                <Select
                  value={emailDigestFrequency}
                  onValueChange={(value) => {
                    setEmailDigestFrequency(value as typeof emailDigestFrequency);
                    setHasChanges(true);
                  }}
                >
                  <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="instant" className="text-white">Instant</SelectItem>
                    <SelectItem value="daily" className="text-white">Daily Digest</SelectItem>
                    <SelectItem value="weekly" className="text-white">Weekly Digest</SelectItem>
                    <SelectItem value="never" className="text-white">Never</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-2">
                  {emailDigestFrequency === "instant" && "Receive emails immediately when events occur"}
                  {emailDigestFrequency === "daily" && "Receive a daily summary of all notifications"}
                  {emailDigestFrequency === "weekly" && "Receive a weekly summary of all notifications"}
                  {emailDigestFrequency === "never" && "Email notifications are disabled"}
                </p>
              </div>
            )}

            {/* Push Notifications */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <Label className="text-white font-medium">Push Notifications</Label>
                  <p className="text-sm text-slate-400">Receive browser push notifications</p>
                </div>
              </div>
              <Switch
                checked={pushEnabled}
                onCheckedChange={(checked) => {
                  setPushEnabled(checked);
                  setHasChanges(true);
                  if (checked && "Notification" in window) {
                    Notification.requestPermission();
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Categories */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-lg">Notification Types</CardTitle>
            <CardDescription className="text-slate-400">
              Choose which types of notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificationCategories.map((category) => (
              <div
                key={category.key}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                    {category.icon}
                  </div>
                  <div>
                    <Label className="text-white font-medium">{category.label}</Label>
                    <p className="text-sm text-slate-400">{category.description}</p>
                  </div>
                </div>
                <Switch
                  checked={categories[category.key] !== false}
                  onCheckedChange={(checked) => handleCategoryToggle(category.key, checked)}
                  disabled={!emailEnabled && !pushEnabled}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <div className="mb-6">
          <QuietHoursSettings
            enabled={quietHoursEnabled}
            startTime={quietHoursStart}
            endTime={quietHoursEnd}
            days={quietHoursDays}
            onUpdate={handleQuietHoursUpdate}
            isLoading={updatePreferences.isPending}
          />
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            {hasChanges ? "You have unsaved changes" : "All changes saved"}
          </p>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updatePreferences.isPending}
            className="bg-[#00A8FF] hover:bg-[#00A8FF]/80 text-white"
          >
            {updatePreferences.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function NotificationSettingsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container max-w-3xl py-8">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="w-10 h-10 rounded-lg bg-slate-700" />
          <div>
            <Skeleton className="h-7 w-48 bg-slate-700 mb-2" />
            <Skeleton className="h-4 w-64 bg-slate-700" />
          </div>
        </div>
        <Skeleton className="h-64 w-full bg-slate-800 rounded-lg mb-6" />
        <Skeleton className="h-96 w-full bg-slate-800 rounded-lg" />
      </div>
    </div>
  );
}
