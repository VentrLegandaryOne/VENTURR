/**
 * Push Notification Service
 * 
 * Handles browser push notifications for upload completion and other events.
 * Uses the Web Notifications API for desktop and mobile browsers.
 */

export type NotificationPermission = "default" | "granted" | "denied";

/**
 * Check if push notifications are supported in this browser
 */
export function isNotificationSupported(): boolean {
  return "Notification" in window && "serviceWorker" in navigator;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return "denied";
  }
  return Notification.permission as NotificationPermission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn("Push notifications are not supported in this browser");
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermission;
  } catch (error) {
    console.error("Failed to request notification permission:", error);
    return "denied";
  }
}

/**
 * Show a notification
 */
export async function showNotification(
  title: string,
  options?: NotificationOptions & { onClick?: () => void }
): Promise<void> {
  const permission = getNotificationPermission();

  if (permission !== "granted") {
    console.warn("Notification permission not granted");
    return;
  }

  try {
    // If service worker is available, use it for better reliability
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, options);
    } else {
      // Fallback to direct notification
      const notification = new Notification(title, options);
      
      if (options?.onClick) {
        notification.onclick = () => {
          options.onClick?.();
          notification.close();
        };
      }
    }
  } catch (error) {
    console.error("Failed to show notification:", error);
  }
}

/**
 * Show upload completion notification
 */
export async function notifyUploadComplete(
  fileName: string,
  quoteId: string,
  score?: number
): Promise<void> {
  const title = "Quote Verification Complete ✅";
  const body = score
    ? `${fileName} analyzed with score ${score}/100. Tap to view results.`
    : `${fileName} has been analyzed. Tap to view results.`;

  await showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: `quote-${quoteId}`,
    requireInteraction: false,
    onClick: () => {
      window.focus();
      window.location.href = `/quote/report/${quoteId}`;
    },
  });
}

/**
 * Show upload failed notification
 */
export async function notifyUploadFailed(
  fileName: string,
  error: string
): Promise<void> {
  const title = "Quote Upload Failed ❌";
  const body = `${fileName} - ${error}. Tap to retry.`;

  await showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "upload-failed",
    requireInteraction: true,
    onClick: () => {
      window.focus();
      window.location.href = "/quote/upload";
    },
  });
}

/**
 * Show batch upload progress notification
 */
export async function notifyBatchProgress(
  completed: number,
  total: number
): Promise<void> {
  const title = "Batch Upload Progress";
  const body = `${completed} of ${total} quotes completed`;

  await showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "batch-progress",
    requireInteraction: false,
  });
}

/**
 * Check if user has enabled notifications in preferences
 */
export function shouldShowNotifications(): boolean {
  const prefs = localStorage.getItem("notification_preferences");
  if (!prefs) return true; // Default to enabled
  
  try {
    const parsed = JSON.parse(prefs);
    return parsed.pushEnabled !== false;
  } catch {
    return true;
  }
}

/**
 * Save notification preference
 */
export function setNotificationPreference(enabled: boolean): void {
  const prefs = {
    pushEnabled: enabled,
    timestamp: Date.now(),
  };
  localStorage.setItem("notification_preferences", JSON.stringify(prefs));
}
