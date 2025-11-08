/**
 * White-Label Reseller Portal
 * Partner portal for resellers to manage clients, customize branding, track revenue
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Reseller {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'starter' | 'professional' | 'enterprise';
  monthlyRevenue: number;
  clientCount: number;
  joinDate: string;
}

interface ResellerClient {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  projects: number;
  revenue: number;
  joinDate: string;
}

interface BrandingSettings {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain: string;
  supportEmail: string;
}

interface RevenueShare {
  month: string;
  grossRevenue: number;
  resellerShare: number;
  platformFee: number;
  payoutAmount: number;
}

export default function WhiteLabelResellerPortal() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(null);
  const [editingBranding, setEditingBranding] = useState(false);

  const [resellers] = useState<Reseller[]>([
    {
      id: '1',
      name: 'TechRoof Solutions',
      email: 'contact@techroof.com',
      status: 'active',
      plan: 'enterprise',
      monthlyRevenue: 45000,
      clientCount: 28,
      joinDate: '2024-06-15',
    },
    {
      id: '2',
      name: 'BuildRight Contractors',
      email: 'info@buildright.com',
      status: 'active',
      plan: 'professional',
      monthlyRevenue: 28500,
      clientCount: 15,
      joinDate: '2024-08-20',
    },
    {
      id: '3',
      name: 'Quality Roofing Co',
      email: 'support@qualityroofing.com',
      status: 'active',
      plan: 'starter',
      monthlyRevenue: 12000,
      clientCount: 6,
      joinDate: '2024-10-01',
    },
  ]);

  const [resellerClients] = useState<ResellerClient[]>([
    {
      id: '1',
      name: 'ABC Construction',
      email: 'contact@abcconstruction.com',
      status: 'active',
      projects: 5,
      revenue: 42000,
      joinDate: '2024-07-10',
    },
    {
      id: '2',
      name: 'XYZ Builders',
      email: 'info@xyzbuilders.com',
      status: 'active',
      projects: 3,
      revenue: 28500,
      joinDate: '2024-08-15',
    },
    {
      id: '3',
      name: 'Premier Contractors',
      email: 'support@premier.com',
      status: 'inactive',
      projects: 2,
      revenue: 15000,
      joinDate: '2024-09-01',
    },
  ]);

  const [revenueShares] = useState<RevenueShare[]>([
    {
      month: 'January 2025',
      grossRevenue: 45000,
      resellerShare: 36000,
      platformFee: 9000,
      payoutAmount: 36000,
    },
    {
      month: 'December 2024',
      grossRevenue: 42000,
      resellerShare: 33600,
      platformFee: 8400,
      payoutAmount: 33600,
    },
    {
      month: 'November 2024',
      grossRevenue: 38500,
      resellerShare: 30800,
      platformFee: 7700,
      payoutAmount: 30800,
    },
  ]);

  const [brandingSettings] = useState<BrandingSettings>({
    companyName: 'TechRoof Solutions',
    logoUrl: 'https://example.com/logo.png',
    primaryColor: '#3b82f6',
    secondaryColor: '#f97316',
    customDomain: 'techroof.venturr.io',
    supportEmail: 'support@techroof.com',
  });

  const totalRevenue = resellers.reduce((sum, r) => sum + r.monthlyRevenue, 0);
  const totalClients = resellers.reduce((sum, r) => sum + r.clientCount, 0);
  const activeResellers = resellers.filter((r) => r.status === 'active').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter':
        return 'bg-blue-100 text-blue-800';
      case 'professional':
        return 'bg-purple-100 text-purple-800';
      case 'enterprise':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">White-Label Reseller Portal</h1>
              <p className="text-slate-600 mt-2">Manage partners, track revenue, and customize branding</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">+ Invite Reseller</Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Active Resellers</p>
              <p className="text-3xl font-bold text-slate-900">{activeResellers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Total Clients</p>
              <p className="text-3xl font-bold text-slate-900">{totalClients}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Monthly Revenue</p>
              <p className="text-3xl font-bold text-green-600">${(totalRevenue / 1000).toFixed(0)}K</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Platform Fee (20%)</p>
              <p className="text-3xl font-bold text-slate-900">${(totalRevenue * 0.2 / 1000).toFixed(0)}K</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resellers">Resellers</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reseller Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resellers.map((reseller) => (
                    <div key={reseller.id} className="p-4 bg-slate-50 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">{reseller.name}</h3>
                          <p className="text-sm text-slate-600">{reseller.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(reseller.status)}>{reseller.status}</Badge>
                          <Badge className={getPlanColor(reseller.plan)}>{reseller.plan}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                        <div>
                          <p className="text-xs text-slate-600">Monthly Revenue</p>
                          <p className="font-semibold text-slate-900">${reseller.monthlyRevenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Clients</p>
                          <p className="font-semibold text-slate-900">{reseller.clientCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Member Since</p>
                          <p className="font-semibold text-slate-900">{reseller.joinDate}</p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => setSelectedReseller(reseller)}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resellers Tab */}
          <TabsContent value="resellers" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-slate-600">Company</th>
                    <th className="text-left py-3 px-4 text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 text-slate-600">Plan</th>
                    <th className="text-right py-3 px-4 text-slate-600">Revenue</th>
                    <th className="text-right py-3 px-4 text-slate-600">Clients</th>
                    <th className="text-left py-3 px-4 text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resellers.map((reseller) => (
                    <tr key={reseller.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-slate-900">{reseller.name}</p>
                          <p className="text-xs text-slate-600">{reseller.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(reseller.status)}>{reseller.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getPlanColor(reseller.plan)}>{reseller.plan}</Badge>
                      </td>
                      <td className="text-right py-3 px-4 font-semibold text-slate-900">
                        ${reseller.monthlyRevenue.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4 font-semibold text-slate-900">
                        {reseller.clientCount}
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reseller Clients */}
            {selectedReseller && (
              <Card>
                <CardHeader>
                  <CardTitle>Clients of {selectedReseller.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {resellerClients.map((client) => (
                      <div key={client.id} className="p-3 bg-slate-50 rounded border flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-slate-900">{client.name}</p>
                          <p className="text-xs text-slate-600">{client.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {client.status}
                          </Badge>
                          <p className="text-xs text-slate-600 mt-1">{client.projects} projects</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Share History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-slate-600">Month</th>
                        <th className="text-right py-3 px-4 text-slate-600">Gross Revenue</th>
                        <th className="text-right py-3 px-4 text-slate-600">Reseller Share (80%)</th>
                        <th className="text-right py-3 px-4 text-slate-600">Platform Fee (20%)</th>
                        <th className="text-right py-3 px-4 text-slate-600">Payout Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueShares.map((share) => (
                        <tr key={share.month} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4 font-semibold text-slate-900">{share.month}</td>
                          <td className="text-right py-3 px-4 text-slate-900">
                            ${share.grossRevenue.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4 text-green-600 font-semibold">
                            ${share.resellerShare.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4 text-slate-900">
                            ${share.platformFee.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4 text-blue-600 font-semibold">
                            ${share.payoutAmount.toLocaleString()}
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
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Total Gross Revenue</p>
                    <p className="text-2xl font-bold text-slate-900">$125,500</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Reseller Payouts</p>
                    <p className="text-2xl font-bold text-green-600">$100,400</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Platform Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">$25,100</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Branding Settings</CardTitle>
                  <Button
                    onClick={() => setEditingBranding(!editingBranding)}
                    className={editingBranding ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                  >
                    {editingBranding ? 'Save Changes' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Company Name</label>
                  <input
                    type="text"
                    defaultValue={brandingSettings.companyName}
                    disabled={!editingBranding}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Logo URL</label>
                  <input
                    type="url"
                    defaultValue={brandingSettings.logoUrl}
                    disabled={!editingBranding}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Primary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        defaultValue={brandingSettings.primaryColor}
                        disabled={!editingBranding}
                        className="h-10 w-20 border border-slate-300 rounded cursor-pointer disabled:cursor-not-allowed"
                      />
                      <input
                        type="text"
                        defaultValue={brandingSettings.primaryColor}
                        disabled={!editingBranding}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Secondary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        defaultValue={brandingSettings.secondaryColor}
                        disabled={!editingBranding}
                        className="h-10 w-20 border border-slate-300 rounded cursor-pointer disabled:cursor-not-allowed"
                      />
                      <input
                        type="text"
                        defaultValue={brandingSettings.secondaryColor}
                        disabled={!editingBranding}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Custom Domain</label>
                  <input
                    type="text"
                    defaultValue={brandingSettings.customDomain}
                    disabled={!editingBranding}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Support Email</label>
                  <input
                    type="email"
                    defaultValue={brandingSettings.supportEmail}
                    disabled={!editingBranding}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Multi-Tenant Isolation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-semibold text-green-900">✓ Data Isolation</p>
                  <p className="text-sm text-green-800">Each reseller's data is completely isolated</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-semibold text-green-900">✓ Custom Branding</p>
                  <p className="text-sm text-green-800">Full white-label support with custom domains</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-semibold text-green-900">✓ Secure Access</p>
                  <p className="text-sm text-green-800">Role-based access control and audit logging</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

