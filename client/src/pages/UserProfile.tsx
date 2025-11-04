import React, { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Settings, Activity, LogOut } from 'lucide-react';

export default function UserProfile() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    emailOnComment: true,
    emailOnMention: true,
    emailOnProjectUpdate: true,
    emailOnQuoteSent: true,
  });

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [notifs, acts] = await Promise.all([
          trpc.notifications.list.query(),
          trpc.activity.list.query(),
        ]);
        setNotifications(notifs);
        setActivity(acts);
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    };

    loadData();
  }, [user]);

  const handleNotificationSettingChange = (key: string) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const handleSaveSettings = async () => {
    try {
      await trpc.user.updateNotificationSettings.mutate(notificationSettings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  if (!user) {
    return <div className="text-center py-10">Please log in to view your profile</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name || 'User'}</h1>
              <p className="text-gray-600 mt-1">{user.email}</p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="notifications" className="bg-white rounded-lg shadow-lg">
          <TabsList className="w-full border-b">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell size={18} />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity size={18} />
              Activity
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings size={18} />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Notifications</h2>
            {notifications.length === 0 ? (
              <p className="text-gray-500">No notifications yet</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif: any) => (
                  <div
                    key={notif.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-3 h-3 bg-blue-600 rounded-full mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            {activity.length === 0 ? (
              <p className="text-gray-500">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {activity.map((act: any) => (
                  <div
                    key={act.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <p className="text-gray-900">{act.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(act.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Settings</h2>
            <div className="space-y-4">
              {Object.entries(notificationSettings).map(([key, value]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handleNotificationSettingChange(key)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
            <Button
              onClick={handleSaveSettings}
              className="mt-6 bg-blue-600 hover:bg-blue-700"
            >
              Save Settings
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
