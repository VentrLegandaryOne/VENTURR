import { useState, useEffect, useCallback } from "react";
import { Bell, BellRing, Settings, Check, X, AlertTriangle, FileCheck, BarChart3, Shield, Info } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  verification_complete: <FileCheck className="w-4 h-4 text-green-500" />,
  unusual_pricing: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  compliance_warning: <Shield className="w-4 h-4 text-red-500" />,
  comparison_ready: <BarChart3 className="w-4 h-4 text-blue-500" />,
  system_alert: <Info className="w-4 h-4 text-primary" />,
};

function formatTimeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-AU", { day: "2-digit", month: "short" });
}

export default function NotificationBell() {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // Poll for unread count every 30 seconds
  const { data: unreadCount = 0, refetch: refetchCount } = trpc.notifications.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
    retry: 1,
  });

  // Get notifications list when dropdown opens
  const { data: notifications = [], refetch } = trpc.notifications.list.useQuery(
    { limit: 10 },
    {
      enabled: isOpen,
      refetchOnMount: true,
      retry: 1,
    }
  );

  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      refetch();
      refetchCount();
    },
  });

  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      refetch();
      refetchCount();
      toast.success("All notifications marked as read");
    },
  });

  const subscribePushMutation = trpc.notifications.subscribePush.useMutation({
    onSuccess: () => {
      toast.success("Push notifications enabled");
      setShowPermissionPrompt(false);
    },
    onError: () => {
      // Silently handle - the in-app notifications still work
      setShowPermissionPrompt(false);
    },
  });

  // Check push notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      setPushPermission(Notification.permission);
      // Show prompt after a delay if user hasn't decided yet
      if (Notification.permission === "default") {
        const timer = setTimeout(() => setShowPermissionPrompt(true), 8000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleEnablePush = useCallback(async () => {
    if (!("Notification" in window)) {
      toast.error("Your browser does not support notifications");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === "granted") {
        // Register subscription with server for polling-based push
        subscribePushMutation.mutate({
          endpoint: `${window.location.origin}/push-poll/${Date.now()}`,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(32)))),
            auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(16)))),
          },
        });

        // Show a confirmation notification
        try {
          new Notification("VENTURR VALDT", {
            body: "Notifications enabled. You'll be alerted when quotes are verified.",
            icon: "/icon-192.png",
          });
        } catch {
          // Notification constructor may fail in some contexts
        }
      } else if (permission === "denied") {
        toast.error("Notifications blocked. Enable them in your browser settings.");
        setShowPermissionPrompt(false);
      }
    } catch (err) {
      console.error("Failed to request notification permission:", err);
      toast.error("Failed to enable notifications");
    }
  }, [subscribePushMutation]);

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markReadMutation.mutate({ id: notification.id });
    }
    if (notification.link) {
      setLocation(notification.link);
      setIsOpen(false);
    } else if (notification.actionUrl) {
      setLocation(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const unreadNum = typeof unreadCount === "object" ? (unreadCount as any)?.count ?? 0 : unreadCount;

  return (
    <div className="relative">
      {/* Push Permission Prompt - floating above the bell */}
      <AnimatePresence>
        {showPermissionPrompt && pushPermission === "default" && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute right-0 top-full mt-2 z-[60] w-72 sm:w-80"
          >
            <div className="bg-background border border-border rounded-lg shadow-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <BellRing className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold mb-1">Enable Notifications</p>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    Get instant alerts when quote verifications complete, pricing issues are detected, or compliance warnings arise.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleEnablePush} className="h-7 text-xs gap-1">
                      <Check className="w-3 h-3" />
                      Enable
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowPermissionPrompt(false)} className="h-7 text-xs text-muted-foreground">
                      Not now
                    </Button>
                  </div>
                </div>
                <button
                  onClick={() => setShowPermissionPrompt(false)}
                  className="text-muted-foreground hover:text-foreground p-0.5 -mt-1 -mr-1"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Arrow pointer */}
              <div className="absolute -top-1.5 right-4 w-3 h-3 bg-background border-l border-t border-border rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-accent/10"
            aria-label={`Notifications${unreadNum > 0 ? ` (${unreadNum} unread)` : ""}`}
          >
            {unreadNum > 0 ? (
              <BellRing className="h-5 w-5" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
            {unreadNum > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center"
              >
                {unreadNum > 99 ? "99+" : unreadNum}
              </motion.span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 sm:w-96 max-h-[500px] overflow-y-auto p-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b sticky top-0 bg-background z-10">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <div className="flex items-center gap-1">
              {unreadNum > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-xs h-7"
                >
                  Mark all read
                </Button>
              )}
              {pushPermission !== "granted" && "Notification" in window && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEnablePush}
                  className="text-xs h-7 gap-1 text-primary"
                >
                  <BellRing className="w-3 h-3" />
                  Push
                </Button>
              )}
            </div>
          </div>

          {/* Notification List */}
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1 text-muted-foreground/70">
                You'll see alerts here when quotes are verified
              </p>
            </div>
          ) : (
            notifications.map((notification: any) => (
              <DropdownMenuItem
                key={notification.id}
                className={`px-4 py-3 cursor-pointer focus:bg-muted/50 ${
                  !notification.isRead ? "bg-primary/5" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {CATEGORY_ICONS[notification.type] || <Bell className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notification.isRead ? "font-semibold" : "font-medium"} line-clamp-1`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {formatTimeAgo(new Date(notification.createdAt))}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}

          {/* Footer */}
          {notifications.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="px-4 py-2 text-center text-sm text-primary hover:text-primary/80 cursor-pointer justify-center"
                onClick={() => {
                  setLocation("/settings/notifications");
                  setIsOpen(false);
                }}
              >
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                Notification Settings
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
