/**
 * Mobile Native Apps Configuration
 * iOS/Android native applications with offline-first, biometric auth, push notifications
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AppBuild {
  id: string;
  platform: 'ios' | 'android';
  version: string;
  buildNumber: number;
  status: 'success' | 'failed' | 'in-progress' | 'pending';
  releaseDate: string;
  downloads: number;
  rating: number;
  features: string[];
}

interface BiometricConfig {
  type: 'fingerprint' | 'face' | 'both';
  enabled: boolean;
  enforced: boolean;
  fallbackOption: string;
  timeout: number;
}

interface PushNotificationConfig {
  enabled: boolean;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  types: string[];
  deliveryRate: number;
  engagement: number;
}

interface OfflineFeature {
  name: string;
  enabled: boolean;
  syncStrategy: 'automatic' | 'manual' | 'hybrid';
  storageUsage: number;
  lastSync: string;
}

interface DeviceMetric {
  metric: string;
  ios: number;
  android: number;
  average: number;
}

export default function MobileNativeAppsConfig() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBuild, setSelectedBuild] = useState<AppBuild | null>(null);

  const [appBuilds] = useState<AppBuild[]>([
    {
      id: '1',
      platform: 'ios',
      version: '2.1.0',
      buildNumber: 245,
      status: 'success',
      releaseDate: '2025-01-31',
      downloads: 12847,
      rating: 4.8,
      features: ['Offline Mode', 'Biometric Auth', 'Push Notifications', 'Real-time Sync'],
    },
    {
      id: '2',
      platform: 'android',
      version: '2.1.0',
      buildNumber: 246,
      status: 'success',
      releaseDate: '2025-01-31',
      downloads: 18923,
      rating: 4.7,
      features: ['Offline Mode', 'Biometric Auth', 'Push Notifications', 'Real-time Sync'],
    },
    {
      id: '3',
      platform: 'ios',
      version: '2.0.5',
      buildNumber: 244,
      status: 'success',
      releaseDate: '2025-01-24',
      downloads: 9234,
      rating: 4.6,
      features: ['Offline Mode', 'Biometric Auth', 'Push Notifications'],
    },
    {
      id: '4',
      platform: 'android',
      version: '2.0.5',
      buildNumber: 243,
      status: 'success',
      releaseDate: '2025-01-24',
      downloads: 14567,
      rating: 4.5,
      features: ['Offline Mode', 'Biometric Auth', 'Push Notifications'],
    },
  ]);

  const [biometricConfig] = useState<BiometricConfig>({
    type: 'both',
    enabled: true,
    enforced: false,
    fallbackOption: 'PIN Code',
    timeout: 15,
  });

  const [pushConfig] = useState<PushNotificationConfig>({
    enabled: true,
    frequency: 'realtime',
    types: ['Project Updates', 'Quote Notifications', 'Team Messages', 'System Alerts'],
    deliveryRate: 98.7,
    engagement: 76.3,
  });

  const [offlineFeatures] = useState<OfflineFeature[]>([
    {
      name: 'Project Data',
      enabled: true,
      syncStrategy: 'automatic',
      storageUsage: 245,
      lastSync: '2 minutes ago',
    },
    {
      name: 'Measurements',
      enabled: true,
      syncStrategy: 'hybrid',
      storageUsage: 128,
      lastSync: '5 minutes ago',
    },
    {
      name: 'Photos & Media',
      enabled: true,
      syncStrategy: 'manual',
      storageUsage: 512,
      lastSync: '1 hour ago',
    },
    {
      name: 'Team Chat',
      enabled: true,
      syncStrategy: 'automatic',
      storageUsage: 64,
      lastSync: '30 seconds ago',
    },
  ]);

  const [deviceMetrics] = useState<DeviceMetric[]>([
    { metric: 'Avg Session Duration', ios: 18.5, android: 16.2, average: 17.4 },
    { metric: 'Daily Active Users', ios: 3847, android: 5234, average: 4541 },
    { metric: 'Crash Rate (%)', ios: 0.12, android: 0.18, average: 0.15 },
    { metric: 'Battery Usage (mAh/hr)', ios: 45, android: 52, average: 48.5 },
    { metric: 'Network Usage (MB/session)', ios: 8.3, android: 9.7, average: 9.0 },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalDownloads = appBuilds.reduce((sum, build) => sum + build.downloads, 0);
  const avgRating = (appBuilds.reduce((sum, build) => sum + build.rating, 0) / appBuilds.length).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Mobile Native Apps</h1>
              <p className="text-slate-600 mt-2">iOS/Android with offline-first, biometric auth, push notifications</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">📱 Build New Version</Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Total Downloads</p>
              <p className="text-3xl font-bold text-slate-900">{(totalDownloads / 1000).toFixed(1)}K</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Average Rating</p>
              <p className="text-3xl font-bold text-yellow-600">⭐ {avgRating}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Active Users (Daily)</p>
              <p className="text-3xl font-bold text-slate-900">9.1K</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Crash Rate</p>
              <p className="text-3xl font-bold text-green-600">0.15%</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="builds">Builds</TabsTrigger>
            <TabsTrigger value="biometric">Biometric</TabsTrigger>
            <TabsTrigger value="push">Push Notifications</TabsTrigger>
            <TabsTrigger value="offline">Offline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-slate-600">Metric</th>
                        <th className="text-right py-3 px-4 text-slate-600">iOS</th>
                        <th className="text-right py-3 px-4 text-slate-600">Android</th>
                        <th className="text-right py-3 px-4 text-slate-600">Average</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deviceMetrics.map((metric) => (
                        <tr key={metric.metric} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4 font-semibold text-slate-900">{metric.metric}</td>
                          <td className="text-right py-3 px-4 text-slate-900">
                            {typeof metric.ios === 'number' && metric.ios > 100 ? metric.ios.toLocaleString() : metric.ios}
                          </td>
                          <td className="text-right py-3 px-4 text-slate-900">
                            {typeof metric.android === 'number' && metric.android > 100 ? metric.android.toLocaleString() : metric.android}
                          </td>
                          <td className="text-right py-3 px-4 font-semibold text-blue-600">
                            {typeof metric.average === 'number' && metric.average > 100 ? metric.average.toLocaleString() : metric.average}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-semibold text-green-900">✓ Offline-First Architecture</p>
                  <p className="text-sm text-green-800">Full functionality without internet connection</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-semibold text-green-900">✓ Biometric Authentication</p>
                  <p className="text-sm text-green-800">Fingerprint & Face ID support on iOS & Android</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-semibold text-green-900">✓ Push Notifications</p>
                  <p className="text-sm text-green-800">Real-time alerts with 98.7% delivery rate</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-semibold text-green-900">✓ Real-time Sync</p>
                  <p className="text-sm text-green-800">Automatic data synchronization when online</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Builds Tab */}
          <TabsContent value="builds" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appBuilds.map((build) => (
                <Card
                  key={build.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedBuild(build)}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-slate-600 capitalize">{build.platform}</p>
                          <p className="text-2xl font-bold text-slate-900 mt-1">v{build.version}</p>
                          <p className="text-xs text-slate-600">Build #{build.buildNumber}</p>
                        </div>
                        <Badge className={getStatusColor(build.status)}>{build.status}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-slate-600">Downloads</p>
                          <p className="font-semibold text-slate-900">{(build.downloads / 1000).toFixed(1)}K</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Rating</p>
                          <p className="font-semibold text-yellow-600">⭐ {build.rating}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-slate-600 mb-2">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {build.features.map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600">Released: {build.releaseDate}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedBuild && (
              <Card>
                <CardHeader className="flex justify-between items-start">
                  <CardTitle>
                    {selectedBuild.platform.toUpperCase()} v{selectedBuild.version}
                  </CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedBuild(null)}>
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Build Number</p>
                      <p className="text-2xl font-bold text-slate-900">#{selectedBuild.buildNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Downloads</p>
                      <p className="text-2xl font-bold text-slate-900">{(selectedBuild.downloads / 1000).toFixed(1)}K</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Rating</p>
                      <p className="text-2xl font-bold text-yellow-600">⭐ {selectedBuild.rating}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Status</p>
                      <Badge className={getStatusColor(selectedBuild.status)}>{selectedBuild.status}</Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      View Changelog
                    </Button>
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Promote to Production
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Biometric Tab */}
          <TabsContent value="biometric" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Biometric Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Authentication Type</label>
                    <select defaultValue={biometricConfig.type} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                      <option value="fingerprint">Fingerprint Only</option>
                      <option value="face">Face ID Only</option>
                      <option value="both">Both Fingerprint & Face</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Timeout (minutes)</label>
                    <input
                      type="number"
                      defaultValue={biometricConfig.timeout}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked={biometricConfig.enabled} className="w-4 h-4" />
                    <span className="text-sm text-slate-700">Enable Biometric Authentication</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked={biometricConfig.enforced} className="w-4 h-4" />
                    <span className="text-sm text-slate-700">Enforce Biometric (Require for all users)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Fallback Option</label>
                  <select defaultValue={biometricConfig.fallbackOption} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                    <option value="PIN Code">PIN Code</option>
                    <option value="Password">Password</option>
                    <option value="None">None (Biometric Only)</option>
                  </select>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">Save Configuration</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Push Notifications Tab */}
          <TabsContent value="push" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Push Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Frequency</label>
                    <select defaultValue={pushConfig.frequency} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                      <option value="realtime">Real-time</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Delivery Rate</label>
                    <p className="text-2xl font-bold text-green-600">{pushConfig.deliveryRate}%</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Notification Types</label>
                  <div className="space-y-2">
                    {pushConfig.types.map((type) => (
                      <label key={type} className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="w-4 h-4" />
                        <span className="text-sm text-slate-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm font-semibold text-blue-900">📊 Engagement Rate</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{pushConfig.engagement}%</p>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">Save Configuration</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offline Tab */}
          <TabsContent value="offline" className="space-y-4">
            {offlineFeatures.map((feature) => (
              <Card key={feature.name}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{feature.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">Sync: {feature.syncStrategy}</p>
                      </div>
                      <Badge className={feature.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {feature.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Storage Used</p>
                        <p className="font-semibold text-slate-900">{feature.storageUsage} MB</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Last Sync</p>
                        <p className="font-semibold text-slate-900">{feature.lastSync}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Sync Strategy</p>
                        <p className="font-semibold text-slate-900 capitalize">{feature.syncStrategy}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader>
                <CardTitle>Offline Storage Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Total Storage Used</p>
                    <p className="text-2xl font-bold text-slate-900">949 MB</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Available Space</p>
                    <p className="text-2xl font-bold text-slate-900">2.1 GB</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Utilization</p>
                    <p className="text-2xl font-bold text-blue-600">31%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

