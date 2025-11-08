/**
 * Developer Portal Dashboard
 * API usage, rate limits, request logs, and API key management
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed?: Date;
  isActive: boolean;
}

interface RequestLog {
  id: string;
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  timestamp: Date;
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

export default function DeveloperPortal() {
  const [apiKeys] = useState<APIKey[]>([
    {
      id: 'key-1',
      name: 'Production API Key',
      key: 'pk_live_51234567890abcdef',
      createdAt: new Date(Date.now() - 30 * 86400000),
      lastUsed: new Date(Date.now() - 2 * 3600000),
      isActive: true,
    },
    {
      id: 'key-2',
      name: 'Development API Key',
      key: 'pk_test_98765432109fedcba',
      createdAt: new Date(Date.now() - 60 * 86400000),
      lastUsed: new Date(Date.now() - 24 * 3600000),
      isActive: true,
    },
  ]);

  const [requestLogs] = useState<RequestLog[]>([
    {
      id: '1',
      endpoint: 'GET /api/v1/projects',
      method: 'GET',
      status: 200,
      responseTime: 145,
      timestamp: new Date(Date.now() - 5 * 60000),
    },
    {
      id: '2',
      endpoint: 'POST /api/v1/quotes',
      method: 'POST',
      status: 201,
      responseTime: 320,
      timestamp: new Date(Date.now() - 15 * 60000),
    },
    {
      id: '3',
      endpoint: 'GET /api/v1/projects/123',
      method: 'GET',
      status: 200,
      responseTime: 98,
      timestamp: new Date(Date.now() - 25 * 60000),
    },
    {
      id: '4',
      endpoint: 'PATCH /api/v1/projects/123/status',
      method: 'PATCH',
      status: 200,
      responseTime: 210,
      timestamp: new Date(Date.now() - 45 * 60000),
    },
    {
      id: '5',
      endpoint: 'POST /api/v1/payments',
      method: 'POST',
      status: 400,
      responseTime: 87,
      timestamp: new Date(Date.now() - 60 * 60000),
    },
  ]);

  const [rateLimit] = useState<RateLimitInfo>({
    limit: 10000,
    remaining: 8234,
    reset: new Date(Date.now() + 24 * 3600000),
  });

  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800';
    if (status >= 400 && status < 500) return 'bg-orange-100 text-orange-800';
    if (status >= 500) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  const usagePercentage = ((rateLimit.limit - rateLimit.remaining) / rateLimit.limit) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Developer Portal</h1>
          <p className="text-slate-600">Manage your API keys, monitor usage, and view request logs</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-slate-600 mb-2">API Requests (This Month)</p>
            <p className="text-3xl font-bold text-slate-900">
              {(rateLimit.limit - rateLimit.remaining).toLocaleString()}
            </p>
            <p className="text-sm text-slate-600 mt-2">
              {usagePercentage.toFixed(1)}% of limit used
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-600 mb-2">Requests Remaining</p>
            <p className="text-3xl font-bold text-green-600">
              {rateLimit.remaining.toLocaleString()}
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Resets {rateLimit.reset.toLocaleDateString()}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-600 mb-2">Active API Keys</p>
            <p className="text-3xl font-bold text-slate-900">
              {apiKeys.filter((k) => k.isActive).length}
            </p>
            <p className="text-sm text-slate-600 mt-2">
              {apiKeys.length} total keys
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-600 mb-2">Avg Response Time</p>
            <p className="text-3xl font-bold text-slate-900">
              {(
                requestLogs.reduce((sum, log) => sum + log.responseTime, 0) / requestLogs.length
              ).toFixed(0)}
              ms
            </p>
            <p className="text-sm text-slate-600 mt-2">Last 24 hours</p>
          </Card>
        </div>

        {/* Rate Limit Progress */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Rate Limit Usage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">Monthly Quota</span>
                <span className="text-sm text-slate-600">
                  {(rateLimit.limit - rateLimit.remaining).toLocaleString()} / {rateLimit.limit.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Resets on {rateLimit.reset.toLocaleDateString()} at {rateLimit.reset.toLocaleTimeString()}
            </p>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="keys" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="logs">Request Logs</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <TabsContent value="keys" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Your API Keys</h3>
              <Button
                onClick={() => setShowNewKeyForm(!showNewKeyForm)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                + Create New Key
              </Button>
            </div>

            {showNewKeyForm && (
              <Card className="p-6 mb-4">
                <h4 className="font-semibold text-slate-900 mb-4">Create New API Key</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Key Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Production API Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Create Key</Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowNewKeyForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {apiKeys.map((key) => (
              <Card key={key.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-slate-900">{key.name}</h4>
                    <p className="text-sm text-slate-600">
                      Created {key.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={key.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {key.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-4 font-mono text-sm break-all">
                  {key.key}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-slate-600">Created</p>
                    <p className="font-semibold text-slate-900">
                      {key.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Last Used</p>
                    <p className="font-semibold text-slate-900">
                      {key.lastUsed ? key.lastUsed.toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyKey(key.key)}
                    className="flex-1"
                  >
                    {copiedKey === key.key ? '✓ Copied' : 'Copy Key'}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Rotate
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-red-600">
                    Revoke
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Request Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Recent Requests</h3>
              <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Last 24 hours</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Endpoint
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Response Time
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestLogs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-mono text-slate-900">
                          {log.endpoint}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          {log.responseTime}ms
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {log.timestamp.toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="documentation" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">API Documentation</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Getting Started</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Learn how to authenticate your requests and start using the Venturr API.
                  </p>
                  <Button variant="outline" size="sm">
                    View Guide →
                  </Button>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">API Reference</h4>
                  <p className="text-sm text-purple-800 mb-3">
                    Complete reference for all available API endpoints and parameters.
                  </p>
                  <Button variant="outline" size="sm">
                    View Reference →
                  </Button>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Code Examples</h4>
                  <p className="text-sm text-green-800 mb-3">
                    Code examples in JavaScript, Python, Go, and Ruby.
                  </p>
                  <Button variant="outline" size="sm">
                    View Examples →
                  </Button>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">Webhooks</h4>
                  <p className="text-sm text-orange-800 mb-3">
                    Set up webhooks to receive real-time notifications of events.
                  </p>
                  <Button variant="outline" size="sm">
                    View Webhooks →
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

