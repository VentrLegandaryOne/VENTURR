/**
 * Haptic Feedback Utility
 * Provides tactile feedback using the Vibration API
 * 
 * Supports iOS and Android with fallback for unsupported devices
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

interface HapticConfig {
  pattern: number | number[];
  enabled: boolean;
}

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [20, 100, 20],
  error: [30, 100, 30, 100, 30],
};

/**
 * Check if haptic feedback is supported
 */
export function isHapticsSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Check if haptics are enabled in user preferences
 */
function isHapticsEnabled(): boolean {
  const preference = localStorage.getItem('haptics-enabled');
  return preference !== 'false'; // Enabled by default
}

/**
 * Enable or disable haptic feedback
 */
export function setHapticsEnabled(enabled: boolean): void {
  localStorage.setItem('haptics-enabled', enabled.toString());
}

/**
 * Trigger haptic feedback
 */
export function haptic(pattern: HapticPattern = 'light'): void {
  if (!isHapticsSupported() || !isHapticsEnabled()) {
    return;
  }

  try {
    const vibrationPattern = HAPTIC_PATTERNS[pattern];
    navigator.vibrate(vibrationPattern);
  } catch (error) {
    console.warn('[Haptics] Vibration failed:', error);
  }
}

/**
 * Stop any ongoing vibration
 */
export function stopHaptic(): void {
  if (!isHapticsSupported()) {
    return;
  }

  try {
    navigator.vibrate(0);
  } catch (error) {
    console.warn('[Haptics] Stop vibration failed:', error);
  }
}

/**
 * Haptic feedback for specific UI interactions
 */
export const haptics = {
  // Pull-to-refresh
  pullThreshold: () => haptic('medium'),
  refreshComplete: () => haptic('success'),
  
  // Swipe gestures
  swipeStart: () => haptic('light'),
  swipeThreshold: () => haptic('medium'),
  swipeComplete: () => haptic('success'),
  
  // Button interactions
  buttonPress: () => haptic('light'),
  buttonSuccess: () => haptic('success'),
  buttonError: () => haptic('error'),
  
  // Form interactions
  inputFocus: () => haptic('light'),
  inputError: () => haptic('error'),
  formSubmit: () => haptic('success'),
  
  // Notifications
  notificationReceived: () => haptic('medium'),
  notificationSuccess: () => haptic('success'),
  notificationWarning: () => haptic('warning'),
  notificationError: () => haptic('error'),
  
  // General
  success: () => haptic('success'),
  warning: () => haptic('warning'),
  error: () => haptic('error'),
  light: () => haptic('light'),
  medium: () => haptic('medium'),
  heavy: () => haptic('heavy'),
};

/**
 * Custom haptic pattern
 */
export function customHaptic(pattern: number | number[]): void {
  if (!isHapticsSupported() || !isHapticsEnabled()) {
    return;
  }

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.warn('[Haptics] Custom vibration failed:', error);
  }
}

/**
 * React hook for haptic feedback
 */
export function useHaptics() {
  return {
    haptic,
    haptics,
    customHaptic,
    stopHaptic,
    isSupported: isHapticsSupported(),
    isEnabled: isHapticsEnabled(),
    setEnabled: setHapticsEnabled,
  };
}
