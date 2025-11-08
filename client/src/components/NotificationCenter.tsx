/**
 * Notification Center Component
 * Real-time toast notifications for chatbot escalations, app installations, pricing alerts
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Bell, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationCenterProps {
  onNotificationReceived?: (notification: Notification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onNotificationReceived,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulate real-time notifications from various sources
  useEffect(() => {
    // Listen for chatbot escalations
    const handleChatbotEscalation = () => {
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'warning',
        title: 'Chat Escalated',
        message: 'A customer support chat has been escalated to the support team.',
        timestamp: new Date(),
        read: false,
        actionUrl: '/chatbot',
        actionLabel: 'View Chat',
      };
      addNotification(notification);
    };

    // Listen for app installations
    const handleAppInstalled = () => {
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'success',
        title: 'App Installed',
        message: 'New app has been successfully installed and is ready to use.',
        timestamp: new Date(),
        read: false,
        actionUrl: '/marketplace',
        actionLabel: 'View Apps',
      };
      addNotification(notification);
    };

    // Listen for pricing alerts
    const handlePricingAlert = () => {
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'info',
        title: 'Pricing Recommendation',
        message: 'New pricing recommendation available based on market analysis.',
        timestamp: new Date(),
        read: false,
        actionUrl: '/pricing-dashboard',
        actionLabel: 'View Pricing',
      };
      addNotification(notification);
    };

    // Set up event listeners (in a real app, these would be WebSocket events)
    const timer1 = setInterval(() => {
      if (Math.random() > 0.7) handleChatbotEscalation();
    }, 30000);

    const timer2 = setInterval(() => {
      if (Math.random() > 0.8) handleAppInstalled();
    }, 45000);

    const timer3 = setInterval(() => {
      if (Math.random() > 0.75) handlePricingAlert();
    }, 60000);

    return () => {
      clearInterval(timer1);
      clearInterval(timer2);
      clearInterval(timer3);
    };
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }

    // Auto-remove notification after 10 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 10000);
  }, [onNotificationReceived]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Notification Bell */}
      <div className="relative">
        <Button
          onClick={() => setShowPanel(!showPanel)}
          variant="outline"
          size="icon"
          className="relative rounded-full shadow-lg bg-white hover:bg-gray-50"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center p-0">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Notification Panel */}
        {showPanel && (
          <Card className="absolute bottom-16 right-0 w-96 max-h-96 overflow-hidden shadow-2xl border border-gray-200 bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  Mark all as read
                </Button>
              )}
            </div>

            {/* Notifications List */}
            {notifications.length > 0 ? (
              <div className="overflow-y-auto max-h-80">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 ${getNotificationColor(
                      notification.type
                    )} ${!notification.read ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {notification.title}
                          </h4>
                          <Button
                            onClick={() => removeNotification(notification.id)}
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {notification.timestamp.toLocaleTimeString()}
                          </span>
                          {notification.actionUrl && (
                            <a
                              href={notification.actionUrl}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                              onClick={() => {
                                markAsRead(notification.id);
                                setShowPanel(false);
                              }}
                            >
                              {notification.actionLabel || 'View'}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-8 right-8 space-y-2 pointer-events-none">
        {notifications.slice(0, 3).map((notification) => (
          <div
            key={notification.id}
            className={`${getNotificationColor(
              notification.type
            )} border rounded-lg p-4 shadow-lg max-w-sm pointer-events-auto animate-in fade-in slide-in-from-right`}
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
              </div>
              <Button
                onClick={() => removeNotification(notification.id)}
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationCenter;

