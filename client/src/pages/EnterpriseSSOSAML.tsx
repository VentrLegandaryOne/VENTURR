/**
 * Enterprise SSO & SAML Integration
 * Azure AD, Okta, Google Workspace, SAML 2.0 support with advanced security controls
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oauth' | 'oidc';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  icon: string;
  users: number;
  lastSync: string;
  configuration: {
    enabled: boolean;
    enforced: boolean;
    autoProvisioning: boolean;
  };
}

interface SAMLConfig {
  entityId: string;
  ssoUrl: string;
  certificate: string;
  signatureAlgorithm: string;
  encryptionEnabled: boolean;
  nameIdFormat: string;
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high';
  lastUpdated: string;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  provider: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  ipAddress: string;
}

export default function EnterpriseSSOSAML() {
  const [activeTab, setActiveTab] = useState('providers');
  const [selectedProvider, setSelectedProvider] = useState<SSOProvider | null>(null);
  const [editingConfig, setEditingConfig] = useState(false);

  const [ssoProviders] = useState<SSOProvider[]>([
    {
      id: '1',
      name: 'Azure Active Directory',
      type: 'saml',
      status: 'connected',
      icon: '☁️',
      users: 156,
      lastSync: '2 minutes ago',
      configuration: {
        enabled: true,
        enforced: true,
        autoProvisioning: true,
      },
    },
    {
      id: '2',
      name: 'Okta',
      type: 'oidc',
      status: 'connected',
      icon: '🔐',
      users: 89,
      lastSync: '5 minutes ago',
      configuration: {
        enabled: true,
        enforced: false,
        autoProvisioning: true,
      },
    },
    {
      id: '3',
      name: 'Google Workspace',
      type: 'oauth',
      status: 'connected',
      icon: '🔍',
      users: 234,
      lastSync: '1 minute ago',
      configuration: {
        enabled: true,
        enforced: false,
        autoProvisioning: false,
      },
    },
    {
      id: '4',
      name: 'OneLogin',
      type: 'saml',
      status: 'disconnected',
      icon: '🔑',
      users: 0,
      lastSync: 'Never',
      configuration: {
        enabled: false,
        enforced: false,
        autoProvisioning: false,
      },
    },
  ]);

  const [samlConfig] = useState<SAMLConfig>({
    entityId: 'https://venturr.io/saml',
    ssoUrl: 'https://venturr.io/saml/acs',
    certificate: '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAK...',
    signatureAlgorithm: 'RSA-SHA256',
    encryptionEnabled: true,
    nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  });

  const [securityPolicies] = useState<SecurityPolicy[]>([
    {
      id: '1',
      name: 'Require MFA for SSO',
      description: 'Multi-factor authentication required for all SSO logins',
      enabled: true,
      severity: 'high',
      lastUpdated: '2025-01-30',
    },
    {
      id: '2',
      name: 'IP Whitelist',
      description: 'Restrict SSO access to specific IP ranges',
      enabled: true,
      severity: 'high',
      lastUpdated: '2025-01-28',
    },
    {
      id: '3',
      name: 'Session Timeout',
      description: 'Automatically logout after 30 minutes of inactivity',
      enabled: true,
      severity: 'medium',
      lastUpdated: '2025-01-25',
    },
    {
      id: '4',
      name: 'Device Compliance',
      description: 'Only allow access from compliant devices',
      enabled: false,
      severity: 'medium',
      lastUpdated: '2025-01-20',
    },
    {
      id: '5',
      name: 'Geo-Blocking',
      description: 'Block access from specific geographic regions',
      enabled: false,
      severity: 'low',
      lastUpdated: '2025-01-15',
    },
  ]);

  const [auditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      action: 'SSO Login',
      user: 'john.smith@company.com',
      provider: 'Azure AD',
      timestamp: '2025-01-31 14:32',
      status: 'success',
      ipAddress: '192.168.1.100',
    },
    {
      id: '2',
      action: 'SSO Login',
      user: 'sarah.johnson@company.com',
      provider: 'Google Workspace',
      timestamp: '2025-01-31 14:28',
      status: 'success',
      ipAddress: '192.168.1.105',
    },
    {
      id: '3',
      action: 'MFA Challenge',
      user: 'mike.davis@company.com',
      provider: 'Azure AD',
      timestamp: '2025-01-31 14:15',
      status: 'success',
      ipAddress: '203.0.113.42',
    },
    {
      id: '4',
      action: 'SSO Login Failed',
      user: 'unknown@company.com',
      provider: 'Okta',
      timestamp: '2025-01-31 14:05',
      status: 'failed',
      ipAddress: '198.51.100.89',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const connectedProviders = ssoProviders.filter((p) => p.status === 'connected').length;
  const totalUsers = ssoProviders.reduce((sum, p) => sum + p.users, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Enterprise SSO & SAML</h1>
              <p className="text-slate-600 mt-2">Azure AD, Okta, Google Workspace, SAML 2.0 with advanced security</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">+ Add Provider</Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Connected Providers</p>
              <p className="text-3xl font-bold text-slate-900">{connectedProviders}/4</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">SSO Users</p>
              <p className="text-3xl font-bold text-slate-900">{totalUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Security Policies</p>
              <p className="text-3xl font-bold text-slate-900">{securityPolicies.filter((p) => p.enabled).length}/5</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="saml">SAML Config</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ssoProviders.map((provider) => (
                <Card
                  key={provider.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedProvider(provider)}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{provider.icon}</span>
                          <div>
                            <h3 className="font-semibold text-slate-900">{provider.name}</h3>
                            <p className="text-xs text-slate-600 uppercase">{provider.type}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(provider.status)}>{provider.status}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-slate-600">Users</p>
                          <p className="font-semibold text-slate-900">{provider.users}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Last Sync</p>
                          <p className="font-semibold text-slate-900">{provider.lastSync}</p>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked={provider.configuration.enabled} className="w-3 h-3" />
                          <span className="text-slate-700">Enabled</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked={provider.configuration.enforced} className="w-3 h-3" />
                          <span className="text-slate-700">Enforced</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked={provider.configuration.autoProvisioning} className="w-3 h-3" />
                          <span className="text-slate-700">Auto-Provisioning</span>
                        </label>
                      </div>

                      <Button
                        className={`w-full ${
                          provider.status === 'connected'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {provider.status === 'connected' ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedProvider && (
              <Card>
                <CardHeader className="flex justify-between items-start">
                  <CardTitle>{selectedProvider.name} Configuration</CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedProvider(null)}>
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Status</label>
                      <Badge className={getStatusColor(selectedProvider.status)}>{selectedProvider.status}</Badge>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">Type</label>
                      <Badge variant="outline">{selectedProvider.type.toUpperCase()}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked={selectedProvider.configuration.enabled} className="w-4 h-4" />
                      <span className="text-sm text-slate-700">Enable this provider</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked={selectedProvider.configuration.enforced} className="w-4 h-4" />
                      <span className="text-sm text-slate-700">Enforce SSO for all users</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked={selectedProvider.configuration.autoProvisioning} className="w-4 h-4" />
                      <span className="text-sm text-slate-700">Auto-provision new users</span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      Test Connection
                    </Button>
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Save Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* SAML Config Tab */}
          <TabsContent value="saml" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>SAML 2.0 Configuration</CardTitle>
                  <Button
                    onClick={() => setEditingConfig(!editingConfig)}
                    className={editingConfig ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                  >
                    {editingConfig ? 'Save' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Entity ID</label>
                  <input
                    type="text"
                    defaultValue={samlConfig.entityId}
                    disabled={!editingConfig}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">SSO URL (ACS)</label>
                  <input
                    type="text"
                    defaultValue={samlConfig.ssoUrl}
                    disabled={!editingConfig}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Signature Algorithm</label>
                  <select defaultValue={samlConfig.signatureAlgorithm} disabled={!editingConfig} className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50">
                    <option>RSA-SHA256</option>
                    <option>RSA-SHA512</option>
                    <option>RSA-SHA1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Name ID Format</label>
                  <select defaultValue={samlConfig.nameIdFormat} disabled={!editingConfig} className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50">
                    <option>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</option>
                    <option>urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified</option>
                    <option>urn:oasis:names:tc:SAML:2.0:nameid-format:persistent</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked={samlConfig.encryptionEnabled} disabled={!editingConfig} className="w-4 h-4" />
                    <span className="text-sm text-slate-700">Enable Encryption</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Certificate</label>
                  <textarea
                    defaultValue={samlConfig.certificate}
                    disabled={!editingConfig}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50 font-mono text-xs h-24"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            {securityPolicies.map((policy) => (
              <Card key={policy.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{policy.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{policy.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getSeverityColor(policy.severity)}>{policy.severity}</Badge>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked={policy.enabled} className="w-4 h-4" />
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">Last updated: {policy.lastUpdated}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-slate-600">Action</th>
                    <th className="text-left py-3 px-4 text-slate-600">User</th>
                    <th className="text-left py-3 px-4 text-slate-600">Provider</th>
                    <th className="text-left py-3 px-4 text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 text-slate-600">IP Address</th>
                    <th className="text-left py-3 px-4 text-slate-600">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{log.action}</td>
                      <td className="py-3 px-4 text-slate-700">{log.user}</td>
                      <td className="py-3 px-4 text-slate-700">{log.provider}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">{log.ipAddress}</td>
                      <td className="py-3 px-4 text-slate-600">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

