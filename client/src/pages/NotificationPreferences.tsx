/**
 * Notification Preferences Dashboard
 * Manage email frequency, notification channels, and granular notification types
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface NotificationPreference {
  id: string;
  category: string;
  name: string;
  description: string;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
}

interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  createdAt: Date;
}

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: '1',
      category: 'Projects',
      name: 'New Project Created',
      description: 'Receive notifications when a new project is created',
      channels: { email: true, sms: false, push: true },
      frequency: 'immediate',
    },
    {
      id: '2',
      category: 'Projects',
      name: 'Project Status Changed',
      description: 'Get notified when a project status is updated',
      channels: { email: true, sms: false, push: true },
      frequency: 'immediate',
    },
    {
      id: '3',
      category: 'Quotes',
      name: 'Quote Sent',
      description: 'Receive notifications when a quote is sent to a client',
      channels: { email: true, sms: true, push: false },
      frequency: 'immediate',
    },
    {
      id: '4',
      category: 'Quotes',
      name: 'Quote Accepted',
      description: 'Get notified when a client accepts a quote',
      channels: { email: true, sms: true, push: true },
      frequency: 'immediate',
    },
    {
      id: '5',
      category: 'Payments',
      name: 'Payment Received',
      description: 'Receive notifications when a payment is received',
      channels: { email: true, sms: true, push: true },
      frequency: 'immediate',
    },
    {
      id: '6',
      category: 'Payments',
      name: 'Payment Reminder',
      description: 'Get reminded about pending payments',
      channels: { email: true, sms: false, push: false },
      frequency: 'daily',
    },
    {
      id: '7',
      category: 'Team',
      name: 'Team Member Added',
      description: 'Receive notifications when a team member is added',
      channels: { email: true, sms: false, push: false },
      frequency: 'immediate',
    },
    {
      id: '8',
      category: 'Reports',
      name: 'Weekly Report',
      description: 'Receive weekly summary reports',
      channels: { email: true, sms: false, push: false },
      frequency: 'weekly',
    },
  ]);

  const [emailFrequency, setEmailFrequency] = useState('daily');
  const [unsubscribeAll, setUnsubscribeAll] = useState(false);

  const handleChannelChange = (id: string, channel: 'email' | 'sms' | 'push', value: boolean) => {
    setPreferences((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              channels: { ...p.channels, [channel]: value },
            }
          : p
      )
    );
  };

  const handleFrequencyChange = (id: string, frequency: NotificationPreference['frequency']) => {
    setPreferences((prev) =>
      prev.map((p) => (p.id === id ? { ...p, frequency } : p))
    );
  };

  const handleSavePreferences = () => {
    console.log('Saving preferences:', preferences);
    // Call API to save preferences
  };

  const groupedPreferences = preferences.reduce(
    (acc, pref) => {
      if (!acc[pref.category]) {
        acc[pref.category] = [];
      }
      acc[pref.category].push(pref);
      return acc;
    },
    {} as Record<string, NotificationPreference[]>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Notification Preferences</h1>
          <p className="text-slate-600">
            Manage how and when you receive notifications across all channels
          </p>
        </div>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="notifications">Notification Settings</TabsTrigger>
            <TabsTrigger value="channels">Channels & Frequency</TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                  <Checkbox checked={unsubscribeAll} onCheckedChange={(checked) => setUnsubscribeAll(checked as boolean)} />
                  <div>
                    <p className="font-medium text-slate-900">Unsubscribe from all notifications</p>
                    <p className="text-sm text-slate-600">You won't receive any notifications</p>
                  </div>
                </label>
              </div>
            </Card>

            {/* Notification Categories */}
            {Object.entries(groupedPreferences).map(([category, prefs]) => (
              <Card key={category} className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">{category}</h3>
                <div className="space-y-4">
                  {prefs.map((pref) => (
                    <div key={pref.id} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-slate-900">{pref.name}</h4>
                          <p className="text-sm text-slate-600">{pref.description}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {pref.frequency === 'immediate' ? '⚡ Immediate' : `📅 ${pref.frequency}`}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={pref.channels.email}
                            onCheckedChange={(checked) =>
                              handleChannelChange(pref.id, 'email', checked as boolean)
                            }
                          />
                          <span className="text-sm text-slate-700">📧 Email</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={pref.channels.sms}
                            onCheckedChange={(checked) =>
                              handleChannelChange(pref.id, 'sms', checked as boolean)
                            }
                          />
                          <span className="text-sm text-slate-700">💬 SMS</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={pref.channels.push}
                            onCheckedChange={(checked) =>
                              handleChannelChange(pref.id, 'push', checked as boolean)
                            }
                          />
                          <span className="text-sm text-slate-700">🔔 Push</span>
                        </label>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                          Frequency
                        </label>
                        <select
                          value={pref.frequency}
                          onChange={(e) =>
                            handleFrequencyChange(pref.id, e.target.value as NotificationPreference['frequency'])
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="immediate">Immediate</option>
                          <option value="daily">Daily Digest</option>
                          <option value="weekly">Weekly Digest</option>
                          <option value="never">Never</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}

            {/* Save Button */}
            <div className="flex gap-3">
              <Button
                onClick={handleSavePreferences}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg"
              >
                Save Preferences
              </Button>
              <Button variant="outline" className="flex-1">
                Reset to Defaults
              </Button>
            </div>
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="channels" className="space-y-6">
            {/* Email Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">📧 Email Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Email Frequency
                  </label>
                  <select
                    value={emailFrequency}
                    onChange={(e) => setEmailFrequency(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="immediate">Immediate (as they happen)</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Digest</option>
                    <option value="never">Never</option>
                  </select>
                  <p className="text-sm text-slate-600 mt-2">
                    Choose how often you want to receive email notifications
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Critical notifications (payments, urgent alerts) will always be sent immediately
                  </p>
                </div>
              </div>
            </Card>

            {/* SMS Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">💬 SMS Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox defaultChecked />
                  <span className="text-sm text-slate-700">Enable SMS notifications</span>
                </label>

                <p className="text-sm text-slate-600">
                  Standard SMS rates may apply. You can disable SMS notifications at any time.
                </p>
              </div>
            </Card>

            {/* Push Notifications */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">🔔 Push Notifications</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox defaultChecked />
                  <span className="text-sm text-slate-700">Enable browser push notifications</span>
                </label>

                <Button variant="outline" className="w-full">
                  Test Push Notification
                </Button>

                <p className="text-sm text-slate-600">
                  Push notifications are sent to your browser when you're using Venturr
                </p>
              </div>
            </Card>

            {/* Unsubscribe */}
            <Card className="p-6 border-red-200 bg-red-50">
              <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-100">
                Unsubscribe from all notifications
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

