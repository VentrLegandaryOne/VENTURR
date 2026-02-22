import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  setNotificationPreference,
} from "@/lib/pushNotifications";

/**
 * Banner component that prompts users to enable push notifications
 * Shows only once and can be dismissed
 */
export function NotificationPermissionBanner() {
  const [show, setShow] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check if we should show the banner
    const dismissed = localStorage.getItem("notification_banner_dismissed");
    const permission = getNotificationPermission();

    // Show if:
    // 1. Notifications are supported
    // 2. Permission is default (not granted or denied)
    // 3. User hasn't dismissed the banner
    if (
      isNotificationSupported() &&
      permission === "default" &&
      !dismissed
    ) {
      // Show after a short delay to avoid overwhelming the user
      setTimeout(() => setShow(true), 3000);
    }
  }, []);

  const handleEnable = async () => {
    setIsRequesting(true);
    try {
      const permission = await requestNotificationPermission();
      if (permission === "granted") {
        setNotificationPreference(true);
        setShow(false);
        localStorage.setItem("notification_banner_dismissed", "true");
      } else {
        // User denied permission
        setShow(false);
        localStorage.setItem("notification_banner_dismissed", "true");
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("notification_banner_dismissed", "true");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-primary/10 border border-primary/20 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">
                Get notified when your quotes are ready
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Receive push notifications when quote verification completes,
                so you don't have to wait on the page.
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleEnable}
                  disabled={isRequesting}
                  className="h-8"
                >
                  {isRequesting ? "Requesting..." : "Enable Notifications"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="h-8"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
