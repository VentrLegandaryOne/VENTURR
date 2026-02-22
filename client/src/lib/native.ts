/**
 * Native Bridge - Capacitor Plugin Utilities
 * 
 * This module provides a unified interface for native device features
 * that work on both web (PWA) and native (iOS/Android) platforms.
 */

import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Keyboard } from '@capacitor/keyboard';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Share } from '@capacitor/share';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

// Check if running on native platform
export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'web', 'ios', 'android'

/**
 * Camera utilities
 */
export const camera = {
  /**
   * Take a photo using the device camera
   */
  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });
      return { success: true, uri: image.webPath, format: image.format };
    } catch (error) {
      console.error('Camera error:', error);
      return { success: false, error };
    }
  },

  /**
   * Pick an image from the gallery
   */
  async pickFromGallery() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });
      return { success: true, uri: image.webPath, format: image.format };
    } catch (error) {
      console.error('Gallery error:', error);
      return { success: false, error };
    }
  },

  /**
   * Pick a document (PDF, etc.)
   */
  async pickDocument() {
    try {
      const image = await Camera.pickImages({
        quality: 90,
        limit: 1,
      });
      if (image.photos.length > 0) {
        return { success: true, uri: image.photos[0].webPath, format: image.photos[0].format };
      }
      return { success: false, error: 'No image selected' };
    } catch (error) {
      console.error('Document picker error:', error);
      return { success: false, error };
    }
  },
};

/**
 * Filesystem utilities
 */
export const filesystem = {
  /**
   * Save a file to the device
   */
  async saveFile(filename: string, data: string, directory = Directory.Documents) {
    try {
      const result = await Filesystem.writeFile({
        path: filename,
        data,
        directory,
        encoding: Encoding.UTF8,
      });
      return { success: true, uri: result.uri };
    } catch (error) {
      console.error('Filesystem write error:', error);
      return { success: false, error };
    }
  },

  /**
   * Read a file from the device
   */
  async readFile(filename: string, directory = Directory.Documents) {
    try {
      const result = await Filesystem.readFile({
        path: filename,
        directory,
        encoding: Encoding.UTF8,
      });
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Filesystem read error:', error);
      return { success: false, error };
    }
  },

  /**
   * Delete a file from the device
   */
  async deleteFile(filename: string, directory = Directory.Documents) {
    try {
      await Filesystem.deleteFile({
        path: filename,
        directory,
      });
      return { success: true };
    } catch (error) {
      console.error('Filesystem delete error:', error);
      return { success: false, error };
    }
  },
};

/**
 * Haptics utilities
 */
export const haptics = {
  /**
   * Trigger impact haptic feedback
   */
  async impact(style: 'light' | 'medium' | 'heavy' = 'medium') {
    if (!isNative) return;
    try {
      const styleMap = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      };
      await Haptics.impact({ style: styleMap[style] });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  },

  /**
   * Trigger notification haptic feedback
   */
  async notification(type: 'success' | 'warning' | 'error' = 'success') {
    if (!isNative) return;
    try {
      const typeMap = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error,
      };
      await Haptics.notification({ type: typeMap[type] });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  },

  /**
   * Trigger selection haptic feedback
   */
  async selection() {
    if (!isNative) return;
    try {
      await Haptics.selectionStart();
      await Haptics.selectionEnd();
    } catch (error) {
      console.error('Haptics error:', error);
    }
  },

  /**
   * Vibrate the device
   */
  async vibrate(duration = 300) {
    if (!isNative) return;
    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  },
};

/**
 * Keyboard utilities
 */
export const keyboard = {
  /**
   * Show the keyboard
   */
  async show() {
    if (!isNative) return;
    try {
      await Keyboard.show();
    } catch (error) {
      console.error('Keyboard error:', error);
    }
  },

  /**
   * Hide the keyboard
   */
  async hide() {
    if (!isNative) return;
    try {
      await Keyboard.hide();
    } catch (error) {
      console.error('Keyboard error:', error);
    }
  },

  /**
   * Add keyboard event listeners
   */
  addListeners(callbacks: {
    onShow?: () => void;
    onHide?: () => void;
  }) {
    if (!isNative) return { remove: () => {} };
    
    const showListener = callbacks.onShow ? Keyboard.addListener('keyboardWillShow', callbacks.onShow) : null;
    const hideListener = callbacks.onHide ? Keyboard.addListener('keyboardWillHide', callbacks.onHide) : null;
    
    return {
      remove: async () => {
        if (showListener) await (await showListener).remove();
        if (hideListener) await (await hideListener).remove();
      },
    };
  },
};

/**
 * Local notifications utilities
 */
export const localNotifications = {
  /**
   * Request permission for local notifications
   */
  async requestPermission() {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  },

  /**
   * Schedule a local notification
   */
  async schedule(options: {
    id: number;
    title: string;
    body: string;
    schedule?: { at: Date };
  }) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: options.id,
            title: options.title,
            body: options.body,
            schedule: options.schedule,
            sound: 'default',
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#0891b2',
          },
        ],
      });
      return { success: true };
    } catch (error) {
      console.error('Notification schedule error:', error);
      return { success: false, error };
    }
  },

  /**
   * Cancel a scheduled notification
   */
  async cancel(id: number) {
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
      return { success: true };
    } catch (error) {
      console.error('Notification cancel error:', error);
      return { success: false, error };
    }
  },
};

/**
 * Push notifications utilities
 */
export const pushNotifications = {
  /**
   * Register for push notifications
   */
  async register() {
    if (!isNative) return { success: false, error: 'Not on native platform' };
    
    try {
      const permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        const result = await PushNotifications.requestPermissions();
        if (result.receive !== 'granted') {
          return { success: false, error: 'Permission denied' };
        }
      }
      
      await PushNotifications.register();
      return { success: true };
    } catch (error) {
      console.error('Push notification registration error:', error);
      return { success: false, error };
    }
  },

  /**
   * Add push notification listeners
   */
  addListeners(callbacks: {
    onRegistration?: (token: string) => void;
    onRegistrationError?: (error: any) => void;
    onNotificationReceived?: (notification: any) => void;
    onNotificationAction?: (notification: any) => void;
  }) {
    if (!isNative) return { remove: () => {} };
    
    const listeners: any[] = [];
    
    if (callbacks.onRegistration) {
      listeners.push(PushNotifications.addListener('registration', (token) => {
        callbacks.onRegistration!(token.value);
      }));
    }
    
    if (callbacks.onRegistrationError) {
      listeners.push(PushNotifications.addListener('registrationError', callbacks.onRegistrationError));
    }
    
    if (callbacks.onNotificationReceived) {
      listeners.push(PushNotifications.addListener('pushNotificationReceived', callbacks.onNotificationReceived));
    }
    
    if (callbacks.onNotificationAction) {
      listeners.push(PushNotifications.addListener('pushNotificationActionPerformed', callbacks.onNotificationAction));
    }
    
    return {
      remove: async () => {
        for (const listener of listeners) {
          await (await listener).remove();
        }
      },
    };
  },
};

/**
 * Share utilities
 */
export const share = {
  /**
   * Share content using native share sheet
   */
  async share(options: {
    title?: string;
    text?: string;
    url?: string;
    dialogTitle?: string;
  }) {
    try {
      await Share.share({
        title: options.title,
        text: options.text,
        url: options.url,
        dialogTitle: options.dialogTitle || 'Share',
      });
      return { success: true };
    } catch (error) {
      console.error('Share error:', error);
      return { success: false, error };
    }
  },

  /**
   * Check if sharing is available
   */
  async canShare() {
    try {
      const result = await Share.canShare();
      return result.value;
    } catch {
      return false;
    }
  },
};

/**
 * App utilities
 */
export const app = {
  /**
   * Get app info
   */
  async getInfo() {
    try {
      const info = await App.getInfo();
      return { success: true, info };
    } catch (error) {
      console.error('App info error:', error);
      return { success: false, error };
    }
  },

  /**
   * Get app state
   */
  async getState() {
    try {
      const state = await App.getState();
      return { success: true, isActive: state.isActive };
    } catch (error) {
      console.error('App state error:', error);
      return { success: false, error };
    }
  },

  /**
   * Add app state listeners
   */
  addListeners(callbacks: {
    onStateChange?: (isActive: boolean) => void;
    onBackButton?: () => void;
    onUrlOpen?: (url: string) => void;
  }) {
    const listeners: any[] = [];
    
    if (callbacks.onStateChange) {
      listeners.push(App.addListener('appStateChange', (state) => {
        callbacks.onStateChange!(state.isActive);
      }));
    }
    
    if (callbacks.onBackButton && isNative && platform === 'android') {
      listeners.push(App.addListener('backButton', callbacks.onBackButton));
    }
    
    if (callbacks.onUrlOpen) {
      listeners.push(App.addListener('appUrlOpen', (data) => {
        callbacks.onUrlOpen!(data.url);
      }));
    }
    
    return {
      remove: async () => {
        for (const listener of listeners) {
          await (await listener).remove();
        }
      },
    };
  },

  /**
   * Exit the app (Android only)
   */
  async exitApp() {
    if (isNative && platform === 'android') {
      await App.exitApp();
    }
  },
};

/**
 * Browser utilities
 */
export const browser = {
  /**
   * Open a URL in the in-app browser
   */
  async open(url: string) {
    try {
      await Browser.open({ url });
      return { success: true };
    } catch (error) {
      console.error('Browser error:', error);
      return { success: false, error };
    }
  },

  /**
   * Close the in-app browser
   */
  async close() {
    try {
      await Browser.close();
      return { success: true };
    } catch (error) {
      console.error('Browser close error:', error);
      return { success: false, error };
    }
  },
};

/**
 * Splash screen utilities
 */
export const splashScreen = {
  /**
   * Show the splash screen
   */
  async show() {
    if (!isNative) return;
    try {
      await SplashScreen.show({
        autoHide: false,
      });
    } catch (error) {
      console.error('Splash screen error:', error);
    }
  },

  /**
   * Hide the splash screen
   */
  async hide() {
    if (!isNative) return;
    try {
      await SplashScreen.hide();
    } catch (error) {
      console.error('Splash screen error:', error);
    }
  },
};

/**
 * Status bar utilities
 */
export const statusBar = {
  /**
   * Set status bar style
   */
  async setStyle(style: 'light' | 'dark') {
    if (!isNative) return;
    try {
      await StatusBar.setStyle({
        style: style === 'light' ? Style.Light : Style.Dark,
      });
    } catch (error) {
      console.error('Status bar error:', error);
    }
  },

  /**
   * Set status bar background color
   */
  async setBackgroundColor(color: string) {
    if (!isNative || platform !== 'android') return;
    try {
      await StatusBar.setBackgroundColor({ color });
    } catch (error) {
      console.error('Status bar error:', error);
    }
  },

  /**
   * Show the status bar
   */
  async show() {
    if (!isNative) return;
    try {
      await StatusBar.show();
    } catch (error) {
      console.error('Status bar error:', error);
    }
  },

  /**
   * Hide the status bar
   */
  async hide() {
    if (!isNative) return;
    try {
      await StatusBar.hide();
    } catch (error) {
      console.error('Status bar error:', error);
    }
  },
};

// Export all utilities
export default {
  isNative,
  platform,
  camera,
  filesystem,
  haptics,
  keyboard,
  localNotifications,
  pushNotifications,
  share,
  app,
  browser,
  splashScreen,
  statusBar,
};
