/**
 * Service Worker Registration and Management
 * 
 * Handles PWA service worker registration, updates, and lifecycle
 */

export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(config: ServiceWorkerConfig = {}): Promise<void> {
  // Only register in production and if service workers are supported
  if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) {
    console.log('[SW] Service worker not registered (dev mode or unsupported)');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[SW] Service worker registered:', registration.scope);

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000); // Check every hour

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          console.log('[SW] New version available');
          config.onUpdate?.(registration);
        } else if (newWorker.state === 'activated') {
          // Service worker activated
          console.log('[SW] Service worker activated');
          config.onSuccess?.(registration);
        }
      });
    });

    // Handle offline/online events
    window.addEventListener('offline', () => {
      console.log('[SW] App is offline');
      config.onOffline?.();
    });

    window.addEventListener('online', () => {
      console.log('[SW] App is online');
      config.onOnline?.();
    });

  } catch (error) {
    console.error('[SW] Service worker registration failed:', error);
  }
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    return registration.unregister();
  }
  return false;
}

/**
 * Check if app is running in standalone mode (installed as PWA)
 */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Check if service worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('[SW] All caches cleared');
  }
}

/**
 * Send message to service worker
 */
export function sendMessageToSW(message: any): void {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
}

/**
 * Force service worker to skip waiting and activate
 */
export function skipWaiting(): void {
  sendMessageToSW({ type: 'SKIP_WAITING' });
}

/**
 * Get current service worker state
 */
export async function getServiceWorkerState(): Promise<string | null> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.active) {
      return registration.active.state;
    }
  }
  return null;
}

