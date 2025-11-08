/**
 * Advanced Marketplace & Ecosystem
 * Partner marketplace with app store, API marketplace, plugin system, revenue sharing
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MarketplaceApp {
  id: string;
  name: string;
  category: string;
  developer: string;
  rating: number;
  reviews: number;
  installs: number;
  price: number | 'free';
  status: 'published' | 'pending' | 'rejected' | 'suspended';
  icon: string;
  description: string;
}

interface APIEndpoint {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  status: 'active' | 'deprecated' | 'beta';
  calls: number;
  avgResponseTime: number;
  errorRate: number;
  documentation: string;
}

interface Plugin {
  id: string;
  name: string;
  version: string;
  author: string;
  enabled: boolean;
  installs: number;
  rating: number;
  lastUpdated: string;
  compatibility: string;
}

interface Partner {
  id: string;
  name: string;
  type: 'developer' | 'reseller' | 'integrator';
  status: 'active' | 'inactive' | 'pending';
  revenue: number;
  commission: number;
  apps: number;
  joinedDate: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface RevenueShare {
  id: string;
  partner: string;
  period: string;
  grossRevenue: number;
  commission: number;
  payoutDate: string;
  status: 'pending' | 'processing' | 'completed';
}

interface IntegrationRequest {
  id: string;
  appName: string;
  developer: string;
  integrationPoints: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  reviewedDate?: string;
}

export default function AdvancedMarketplaceEcosystem() {
  const [activeTab, setActiveTab] = useState('apps');
  const [selectedApp, setSelectedApp] = useState<MarketplaceApp | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const [apps] = useState<MarketplaceApp[]>([
    {
      id: '1',
      name: 'Advanced Analytics Pro',
      category: 'Analytics',
      developer: 'DataViz Inc',
      rating: 4.8,
      reviews: 342,
      installs: 8234,
      price: 29.99,
      status: 'published',
      icon: '📊',
      description: 'Advanced analytics and reporting with AI insights',
    },
    {
      id: '2',
      name: 'CRM Integration Suite',
      category: 'Integration',
      developer: 'CloudSync Labs',
      rating: 4.6,
      reviews: 218,
      installs: 5847,
      price: 'free',
      status: 'published',
      icon: '🔗',
      description: 'Seamless CRM integration with Salesforce and HubSpot',
    },
    {
      id: '3',
      name: 'Payment Gateway Pro',
      category: 'Payments',
      developer: 'FinTech Solutions',
      rating: 4.9,
      reviews: 521,
      installs: 12456,
      price: 49.99,
      status: 'published',
      icon: '💳',
      description: 'Multi-currency payment processing and reconciliation',
    },
    {
      id: '4',
      name: 'Inventory Optimizer',
      category: 'Inventory',
      developer: 'Supply Chain AI',
      rating: 4.5,
      reviews: 156,
      installs: 3421,
      price: 39.99,
      status: 'pending',
      icon: '📦',
      description: 'AI-powered inventory optimization and forecasting',
    },
  ]);

  const [apiEndpoints] = useState<APIEndpoint[]>([
    {
      id: '1',
      name: 'Projects API',
      endpoint: '/api/v1/projects',
      method: 'GET/POST/PUT/DELETE',
      status: 'active',
      calls: 2847392,
      avgResponseTime: 145,
      errorRate: 0.02,
      documentation: '/docs/projects-api',
    },
    {
      id: '2',
      name: 'Users API',
      endpoint: '/api/v1/users',
      method: 'GET/POST/PUT',
      status: 'active',
      calls: 1923847,
      avgResponseTime: 98,
      errorRate: 0.01,
      documentation: '/docs/users-api',
    },
    {
      id: '3',
      name: 'Reports API',
      endpoint: '/api/v1/reports',
      method: 'GET/POST',
      status: 'beta',
      calls: 234892,
      avgResponseTime: 234,
      errorRate: 0.05,
      documentation: '/docs/reports-api',
    },
    {
      id: '4',
      name: 'Webhooks API',
      endpoint: '/api/v1/webhooks',
      method: 'GET/POST/DELETE',
      status: 'active',
      calls: 1847293,
      avgResponseTime: 87,
      errorRate: 0.01,
      documentation: '/docs/webhooks-api',
    },
  ]);

  const [plugins] = useState<Plugin[]>([
    {
      id: '1',
      name: 'Slack Integration',
      version: '2.3.1',
      author: 'Venturr Team',
      enabled: true,
      installs: 5234,
      rating: 4.7,
      lastUpdated: '2025-01-28',
      compatibility: '1.0+',
    },
    {
      id: '2',
      name: 'Google Drive Sync',
      version: '1.8.0',
      author: 'CloudSync Labs',
      enabled: true,
      installs: 3847,
      rating: 4.5,
      lastUpdated: '2025-01-25',
      compatibility: '1.5+',
    },
    {
      id: '3',
      name: 'Zapier Connector',
      version: '3.1.2',
      author: 'Integration Partners',
      enabled: false,
      installs: 2156,
      rating: 4.3,
      lastUpdated: '2025-01-20',
      compatibility: '1.0+',
    },
  ]);

  const [partners] = useState<Partner[]>([
    {
      id: '1',
      name: 'DataViz Inc',
      type: 'developer',
      status: 'active',
      revenue: 487234,
      commission: 97447,
      apps: 3,
      joinedDate: '2024-06-15',
      tier: 'gold',
    },
    {
      id: '2',
      name: 'CloudSync Labs',
      type: 'integrator',
      status: 'active',
      revenue: 234567,
      commission: 46913,
      apps: 5,
      joinedDate: '2024-08-20',
      tier: 'silver',
    },
    {
      id: '3',
      name: 'FinTech Solutions',
      type: 'developer',
      status: 'active',
      revenue: 623456,
      commission: 124691,
      apps: 2,
      joinedDate: '2024-05-10',
      tier: 'platinum',
    },
    {
      id: '4',
      name: 'Supply Chain AI',
      type: 'developer',
      status: 'pending',
      revenue: 0,
      commission: 0,
      apps: 1,
      joinedDate: '2025-01-15',
      tier: 'bronze',
    },
  ]);

  const [revenueShares] = useState<RevenueShare[]>([
    {
      id: '1',
      partner: 'DataViz Inc',
      period: 'January 2025',
      grossRevenue: 45234,
      commission: 9047,
      payoutDate: '2025-02-05',
      status: 'completed',
    },
    {
      id: '2',
      partner: 'CloudSync Labs',
      period: 'January 2025',
      grossRevenue: 23456,
      commission: 4691,
      payoutDate: '2025-02-05',
      status: 'processing',
    },
    {
      id: '3',
      partner: 'FinTech Solutions',
      period: 'January 2025',
      grossRevenue: 62345,
      commission: 12469,
      payoutDate: '2025-02-05',
      status: 'pending',
    },
  ]);

  const [integrationRequests] = useState<IntegrationRequest[]>([
    {
      id: '1',
      appName: 'Advanced Analytics Pro',
      developer: 'DataViz Inc',
      integrationPoints: 8,
      status: 'approved',
      submittedDate: '2025-01-20',
      reviewedDate: '2025-01-25',
    },
    {
      id: '2',
      appName: 'Inventory Optimizer',
      developer: 'Supply Chain AI',
      integrationPoints: 5,
      status: 'pending',
      submittedDate: '2025-01-28',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
      case 'active':
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'beta':
      case 'deprecated':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'bg-amber-100 text-amber-800';
      case 'silver':
        return 'bg-slate-100 text-slate-800';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'platinum':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAppInstalls = apps.reduce((sum, app) => sum + app.installs, 0);
  const totalAPIcalls = apiEndpoints.reduce((sum, api) => sum + api.calls, 0);
  const activePartners = partners.filter((p) => p.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Marketplace & Ecosystem</h1>
              <p className="text-slate-600 mt-2">Partner marketplace, app store, API marketplace, plugin system</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">+ Submit App</Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Published Apps</p>
              <p className="text-3xl font-bold text-slate-900">{apps.filter((a) => a.status === 'published').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Total Installs</p>
              <p className="text-3xl font-bold text-slate-900">{(totalAppInstalls / 1000).toFixed(1)}K</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Active Partners</p>
              <p className="text-3xl font-bold text-slate-900">{activePartners}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">API Calls (Month)</p>
              <p className="text-3xl font-bold text-slate-900">{(totalAPIcalls / 1000000).toFixed(1)}M</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="apps">Apps</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="plugins">Plugins</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          {/* Apps Tab */}
          <TabsContent value="apps" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apps.map((app) => (
                <Card
                  key={app.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedApp(app)}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{app.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{app.name}</h3>
                          <p className="text-sm text-slate-600">{app.developer}</p>
                        </div>
                        <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                      </div>

                      <p className="text-sm text-slate-600">{app.description}</p>

                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-slate-600">Rating</p>
                          <p className="font-semibold text-yellow-600">⭐ {app.rating}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Reviews</p>
                          <p className="font-semibold text-slate-900">{app.reviews}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Installs</p>
                          <p className="font-semibold text-slate-900">{(app.installs / 1000).toFixed(1)}K</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <p className="font-semibold text-slate-900">
                          {typeof app.price === 'number' ? `$${app.price}/mo` : 'Free'}
                        </p>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          {app.status === 'published' ? 'Install' : 'View'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedApp && (
              <Card>
                <CardHeader className="flex justify-between items-start">
                  <CardTitle>{selectedApp.name}</CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedApp(null)}>
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Rating</p>
                      <p className="text-2xl font-bold text-yellow-600">⭐ {selectedApp.rating}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Reviews</p>
                      <p className="text-2xl font-bold text-slate-900">{selectedApp.reviews}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Installs</p>
                      <p className="text-2xl font-bold text-slate-900">{(selectedApp.installs / 1000).toFixed(1)}K</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Price</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {typeof selectedApp.price === 'number' ? `$${selectedApp.price}` : 'Free'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      {selectedApp.status === 'published' ? 'Install' : 'Submit Review'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-slate-600">Name</th>
                    <th className="text-left py-3 px-4 text-slate-600">Endpoint</th>
                    <th className="text-left py-3 px-4 text-slate-600">Method</th>
                    <th className="text-right py-3 px-4 text-slate-600">Calls</th>
                    <th className="text-right py-3 px-4 text-slate-600">Avg Response</th>
                    <th className="text-right py-3 px-4 text-slate-600">Error Rate</th>
                    <th className="text-left py-3 px-4 text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {apiEndpoints.map((api) => (
                    <tr key={api.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{api.name}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">{api.endpoint}</td>
                      <td className="py-3 px-4 text-slate-700">{api.method}</td>
                      <td className="text-right py-3 px-4 text-slate-900">{(api.calls / 1000000).toFixed(2)}M</td>
                      <td className="text-right py-3 px-4 text-slate-900">{api.avgResponseTime}ms</td>
                      <td className="text-right py-3 px-4 text-red-600">{(api.errorRate * 100).toFixed(2)}%</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(api.status)}>{api.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Plugins Tab */}
          <TabsContent value="plugins" className="space-y-4">
            {plugins.map((plugin) => (
              <Card key={plugin.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{plugin.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">by {plugin.author}</p>
                      <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-slate-600">Version</p>
                          <p className="font-semibold text-slate-900">{plugin.version}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Installs</p>
                          <p className="font-semibold text-slate-900">{(plugin.installs / 1000).toFixed(1)}K</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Rating</p>
                          <p className="font-semibold text-yellow-600">⭐ {plugin.rating}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Updated</p>
                          <p className="font-semibold text-slate-900">{plugin.lastUpdated}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant={plugin.enabled ? 'default' : 'outline'}>
                        {plugin.enabled ? '✓ Enabled' : 'Disabled'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        {plugin.enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partners.map((partner) => (
                <Card
                  key={partner.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedPartner(partner)}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-slate-900">{partner.name}</h3>
                          <p className="text-sm text-slate-600 capitalize">{partner.type}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(partner.status)}>{partner.status}</Badge>
                          <Badge className={getTierColor(partner.tier)}>{partner.tier.toUpperCase()}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-slate-600">Revenue</p>
                          <p className="font-semibold text-slate-900">${(partner.revenue / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Commission</p>
                          <p className="font-semibold text-green-600">${(partner.commission / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Apps</p>
                          <p className="font-semibold text-slate-900">{partner.apps}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600">Joined: {partner.joinedDate}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedPartner && (
              <Card>
                <CardHeader className="flex justify-between items-start">
                  <CardTitle>{selectedPartner.name}</CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedPartner(null)}>
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Status</p>
                      <Badge className={getStatusColor(selectedPartner.status)}>
                        {selectedPartner.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Tier</p>
                      <Badge className={getTierColor(selectedPartner.tier)}>
                        {selectedPartner.tier.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Revenue</p>
                      <p className="text-lg font-bold text-slate-900">${(selectedPartner.revenue / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Commission Earned</p>
                      <p className="text-lg font-bold text-green-600">${(selectedPartner.commission / 1000).toFixed(0)}K</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Manage Partnership
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            {revenueShares.map((share) => (
              <Card key={share.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{share.partner}</h3>
                      <p className="text-sm text-slate-600 mt-1">{share.period}</p>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-slate-600">Gross Revenue</p>
                          <p className="font-semibold text-slate-900">${(share.grossRevenue / 1000).toFixed(1)}K</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Commission (20%)</p>
                          <p className="font-semibold text-green-600">${(share.commission / 1000).toFixed(1)}K</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Payout Date</p>
                          <p className="font-semibold text-slate-900">{share.payoutDate}</p>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(share.status)}>{share.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            {integrationRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{request.appName}</h3>
                        <p className="text-sm text-slate-600">by {request.developer}</p>
                      </div>
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Integration Points</p>
                        <p className="font-semibold text-slate-900">{request.integrationPoints}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Submitted</p>
                        <p className="font-semibold text-slate-900">{request.submittedDate}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Reviewed</p>
                        <p className="font-semibold text-slate-900">{request.reviewedDate || 'Pending'}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {request.status === 'pending' && (
                        <>
                          <Button variant="outline" className="flex-1">
                            Request Info
                          </Button>
                          <Button className="flex-1 bg-green-600 hover:bg-green-700">
                            Approve
                          </Button>
                          <Button variant="destructive" className="flex-1">
                            Reject
                          </Button>
                        </>
                      )}
                      {request.status === 'approved' && (
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          View Integration
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

