/**
 * Advanced Integrations
 * Connect with Xero, QuickBooks, Salesforce, HubSpot, Slack, Teams for workflow automation
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Integration {
  id: string;
  name: string;
  category: string;
  status: 'connected' | 'disconnected' | 'error';
  icon: string;
  description: string;
  features: string[];
  lastSync?: string;
  syncFrequency: string;
}

interface SyncLog {
  id: string;
  integration: string;
  action: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  recordsProcessed: number;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  lastRun?: string;
  status: 'active' | 'inactive' | 'error';
}

export default function AdvancedIntegrations() {
  const [activeTab, setActiveTab] = useState('integrations');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const [integrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'Xero',
      category: 'Accounting',
      status: 'connected',
      icon: '📊',
      description: 'Sync invoices, expenses, and financial data',
      features: ['Invoice Sync', 'Expense Tracking', 'Financial Reports', 'Tax Reporting'],
      lastSync: '2 minutes ago',
      syncFrequency: 'Real-time',
    },
    {
      id: '2',
      name: 'QuickBooks',
      category: 'Accounting',
      status: 'disconnected',
      icon: '💰',
      description: 'Connect QuickBooks for accounting integration',
      features: ['Invoice Management', 'Expense Tracking', 'Financial Reports'],
      syncFrequency: 'Hourly',
    },
    {
      id: '3',
      name: 'Salesforce',
      category: 'CRM',
      status: 'connected',
      icon: '👥',
      description: 'Sync customer data and opportunities',
      features: ['Contact Sync', 'Opportunity Tracking', 'Activity Logging', 'Pipeline Management'],
      lastSync: '5 minutes ago',
      syncFrequency: 'Real-time',
    },
    {
      id: '4',
      name: 'HubSpot',
      category: 'CRM',
      status: 'connected',
      icon: '🎯',
      description: 'Integrate with HubSpot CRM',
      features: ['Contact Management', 'Deal Tracking', 'Email Integration', 'Analytics'],
      lastSync: '1 minute ago',
      syncFrequency: 'Real-time',
    },
    {
      id: '5',
      name: 'Slack',
      category: 'Communication',
      status: 'connected',
      icon: '💬',
      description: 'Send notifications and updates to Slack',
      features: ['Project Updates', 'Quote Notifications', 'Team Alerts', 'Custom Workflows'],
      lastSync: '30 seconds ago',
      syncFrequency: 'Real-time',
    },
    {
      id: '6',
      name: 'Microsoft Teams',
      category: 'Communication',
      status: 'disconnected',
      icon: '🤝',
      description: 'Integrate with Microsoft Teams',
      features: ['Team Notifications', 'Channel Updates', 'File Sharing', 'Meeting Integration'],
      syncFrequency: 'Real-time',
    },
  ]);

  const [syncLogs] = useState<SyncLog[]>([
    {
      id: '1',
      integration: 'Xero',
      action: 'Invoice Sync',
      status: 'success',
      timestamp: '2025-01-31 14:30',
      recordsProcessed: 12,
    },
    {
      id: '2',
      integration: 'Salesforce',
      action: 'Contact Sync',
      status: 'success',
      timestamp: '2025-01-31 14:25',
      recordsProcessed: 8,
    },
    {
      id: '3',
      integration: 'HubSpot',
      action: 'Deal Update',
      status: 'success',
      timestamp: '2025-01-31 14:20',
      recordsProcessed: 5,
    },
    {
      id: '4',
      integration: 'Slack',
      action: 'Notification',
      status: 'success',
      timestamp: '2025-01-31 14:15',
      recordsProcessed: 1,
    },
  ]);

  const [automationRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Auto-sync Invoices to Xero',
      trigger: 'Quote Accepted',
      action: 'Create Invoice in Xero',
      enabled: true,
      lastRun: '2 minutes ago',
      status: 'active',
    },
    {
      id: '2',
      name: 'Slack Notification on Quote',
      trigger: 'New Quote Created',
      action: 'Send Slack Message',
      enabled: true,
      lastRun: '5 minutes ago',
      status: 'active',
    },
    {
      id: '3',
      name: 'Salesforce Opportunity Update',
      trigger: 'Project Completed',
      action: 'Update Opportunity in Salesforce',
      enabled: true,
      lastRun: '1 hour ago',
      status: 'active',
    },
    {
      id: '4',
      name: 'HubSpot Deal Sync',
      trigger: 'Quote Status Changed',
      action: 'Update HubSpot Deal',
      enabled: false,
      status: 'inactive',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'success':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const connectedCount = integrations.filter((i) => i.status === 'connected').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Advanced Integrations</h1>
              <p className="text-slate-600 mt-2">Connect your favorite tools for seamless workflow automation</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Connected Integrations</p>
              <p className="text-3xl font-bold text-blue-600">{connectedCount}/6</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="sync-logs">Sync Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((integration) => (
                <Card
                  key={integration.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedIntegration(integration)}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{integration.icon}</span>
                          <div>
                            <h3 className="font-semibold text-slate-900">{integration.name}</h3>
                            <p className="text-xs text-slate-600">{integration.category}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-slate-600">{integration.description}</p>

                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-900">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {integration.features.slice(0, 2).map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {integration.features.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{integration.features.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {integration.lastSync && (
                        <p className="text-xs text-slate-600">Last sync: {integration.lastSync}</p>
                      )}

                      <Button
                        className={`w-full ${
                          integration.status === 'connected'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Integration Detail Modal */}
            {selectedIntegration && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-2xl">
                  <CardHeader className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{selectedIntegration.icon}</span>
                      <div>
                        <CardTitle>{selectedIntegration.name}</CardTitle>
                        <p className="text-sm text-slate-600">{selectedIntegration.category}</p>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => setSelectedIntegration(null)}>
                      ✕
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-sm text-slate-600 mb-2">Description</p>
                      <p className="font-semibold text-slate-900">{selectedIntegration.description}</p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-600 mb-2">Features</p>
                      <div className="space-y-1">
                        {selectedIntegration.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-slate-900">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-y">
                      <div>
                        <p className="text-xs text-slate-600">Status</p>
                        <Badge className={getStatusColor(selectedIntegration.status)}>
                          {selectedIntegration.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Sync Frequency</p>
                        <p className="font-semibold text-slate-900">{selectedIntegration.syncFrequency}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                        {selectedIntegration.status === 'connected' ? 'Manage' : 'Setup'}
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Documentation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button className="bg-blue-600 hover:bg-blue-700">+ Create Automation Rule</Button>
            </div>

            <div className="space-y-3">
              {automationRules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{rule.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          When: <span className="font-semibold">{rule.trigger}</span>
                        </p>
                        <p className="text-sm text-slate-600">
                          Then: <span className="font-semibold">{rule.action}</span>
                        </p>
                      </div>
                      <Badge className={getStatusColor(rule.status)}>{rule.status}</Badge>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t">
                      <div className="text-xs text-slate-600">
                        {rule.lastRun && `Last run: ${rule.lastRun}`}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          {rule.enabled ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sync Logs Tab */}
          <TabsContent value="sync-logs" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-slate-600">Integration</th>
                    <th className="text-left py-3 px-4 text-slate-600">Action</th>
                    <th className="text-left py-3 px-4 text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 text-slate-600">Records</th>
                    <th className="text-left py-3 px-4 text-slate-600">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {syncLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{log.integration}</td>
                      <td className="py-3 px-4 text-slate-700">{log.action}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-900">{log.recordsProcessed}</td>
                      <td className="py-3 px-4 text-slate-600">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Default Sync Frequency
                  </label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                    <option>Real-time</option>
                    <option>Hourly</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Error Notification
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm text-slate-700">Email on sync failure</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm text-slate-700">Slack notification on error</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Data Retention
                  </label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                    <option>30 days</option>
                    <option>90 days</option>
                    <option>1 year</option>
                    <option>Indefinite</option>
                  </select>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

