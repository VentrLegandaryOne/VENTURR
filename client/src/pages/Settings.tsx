import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Vibrate, 
  User, 
  Shield, 
  HelpCircle,
  ChevronRight,
  LogOut,
  ChevronLeft
} from "lucide-react";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

export default function Settings() {
  const { isAuthenticated, user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();

  // Redirect to login if not authenticated
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

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  const settingsSections = [
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          label: "Notifications",
          description: "Manage push notifications and email alerts",
          href: "/settings/notifications",
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
        },
        {
          icon: Vibrate,
          label: "Haptic Feedback",
          description: "Customize tactile responses for gestures",
          href: "/settings/haptics",
          color: "text-purple-500",
          bgColor: "bg-purple-500/10",
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Profile",
          description: "Update your personal information",
          href: "/settings/profile",
          color: "text-green-500",
          bgColor: "bg-green-500/10",
        },
        {
          icon: Shield,
          label: "Privacy & Security",
          description: "Manage data and security preferences",
          href: "/settings/privacy",
          color: "text-orange-500",
          bgColor: "bg-orange-500/10",
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          label: "Help & Support",
          description: "Get help and contact support",
          href: "/help",
          color: "text-cyan-500",
          bgColor: "bg-cyan-500/10",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl">
          {/* User Info Card */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{user.name}</h2>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {user.role} Account
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Settings Sections */}
          {settingsSections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-8">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                    >
                        <Link href={item.href}>
                          <Card className="p-4 hover:bg-accent transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                                  <Icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                                <div>
                                  <h4 className="font-semibold">{item.label}</h4>
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </Card>
                        </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* App Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center text-sm text-muted-foreground"
          >
            <p>VENTURR VALDT v1.0.0</p>
            <p className="mt-1">© 2025 VENTURR. All rights reserved.</p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <Link href="/terms">
                <Button variant="link" size="sm" className="text-xs">
                  Terms of Service
                </Button>
              </Link>
              <Link href="/privacy">
                <Button variant="link" size="sm" className="text-xs">
                  Privacy Policy
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
