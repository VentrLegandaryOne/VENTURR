/**
 * Advanced Compliance & Audit System
 * GDPR, HIPAA, SOC 2 compliance with audit trails, data retention policies, regulatory documentation
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ComplianceFramework {
  id: string;
  name: string;
  status: 'compliant' | 'non-compliant' | 'in-progress' | 'not-applicable';
  coverage: number;
  lastAudit: string;
  requirements: number;
  completed: number;
  certifications: string[];
}

interface AuditTrail {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  resource: string;
  changes: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'pending';
}

interface DataRetentionPolicy {
  id: string;
  dataType: string;
  retentionPeriod: string;
  autoDelete: boolean;
  archiveAfter: string;
  lastReview: string;
  status: 'active' | 'inactive' | 'pending-review';
}

interface RegulatoryDocument {
  id: string;
  name: string;
  framework: string;
  generatedDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring-soon' | 'expired';
  downloadUrl: string;
}

interface ComplianceIncident {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: string;
  status: 'open' | 'investigating' | 'resolved';
  affectedRecords: number;
  remediationPlan: string;
}

export default function AdvancedComplianceAudit() {
  const [activeTab, setActiveTab] = useState('frameworks');
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);

  const [frameworks] = useState<ComplianceFramework[]>([
    {
      id: '1',
      name: 'GDPR',
      status: 'compliant',
      coverage: 100,
      lastAudit: '2025-01-30',
      requirements: 99,
      completed: 99,
      certifications: ['Data Protection Officer', 'Privacy Policy Certified'],
    },
    {
      id: '2',
      name: 'HIPAA',
      status: 'compliant',
      coverage: 98,
      lastAudit: '2025-01-28',
      requirements: 164,
      completed: 161,
      certifications: ['Business Associate Agreement', 'Security Rule Compliant'],
    },
    {
      id: '3',
      name: 'SOC 2 Type II',
      status: 'in-progress',
      coverage: 92,
      lastAudit: '2025-01-25',
      requirements: 76,
      completed: 70,
      certifications: ['Security', 'Availability', 'Processing Integrity'],
    },
    {
      id: '4',
      name: 'ISO 27001',
      status: 'compliant',
      coverage: 96,
      lastAudit: '2025-01-20',
      requirements: 114,
      completed: 109,
      certifications: ['Information Security Management'],
    },
  ]);

  const [auditTrails] = useState<AuditTrail[]>([
    {
      id: '1',
      action: 'User Login',
      user: 'john.smith@company.com',
      timestamp: '2025-01-31 14:32:15',
      resource: 'Dashboard',
      changes: 'Successful authentication',
      ipAddress: '192.168.1.100',
      status: 'success',
    },
    {
      id: '2',
      action: 'Data Export',
      user: 'sarah.johnson@company.com',
      timestamp: '2025-01-31 14:28:42',
      resource: 'Projects (245 records)',
      changes: 'Exported to CSV',
      ipAddress: '192.168.1.105',
      status: 'success',
    },
    {
      id: '3',
      action: 'Permission Change',
      user: 'admin@company.com',
      timestamp: '2025-01-31 14:15:08',
      resource: 'User: mike.davis@company.com',
      changes: 'Role changed from User to Admin',
      ipAddress: '192.168.1.110',
      status: 'success',
    },
    {
      id: '4',
      action: 'Unauthorized Access Attempt',
      user: 'unknown@external.com',
      timestamp: '2025-01-31 13:45:22',
      resource: 'Financial Reports',
      changes: 'Access denied',
      ipAddress: '203.0.113.42',
      status: 'failed',
    },
  ]);

  const [dataRetentionPolicies] = useState<DataRetentionPolicy[]>([
    {
      id: '1',
      dataType: 'User Account Data',
      retentionPeriod: '7 years',
      autoDelete: true,
      archiveAfter: '2 years',
      lastReview: '2025-01-30',
      status: 'active',
    },
    {
      id: '2',
      dataType: 'Project Records',
      retentionPeriod: '5 years',
      autoDelete: true,
      archiveAfter: '1 year',
      lastReview: '2025-01-28',
      status: 'active',
    },
    {
      id: '3',
      dataType: 'Financial Transactions',
      retentionPeriod: '10 years',
      autoDelete: false,
      archiveAfter: '3 years',
      lastReview: '2025-01-25',
      status: 'active',
    },
    {
      id: '4',
      dataType: 'Audit Logs',
      retentionPeriod: '3 years',
      autoDelete: true,
      archiveAfter: '6 months',
      lastReview: '2025-01-20',
      status: 'active',
    },
  ]);

  const [regulatoryDocuments] = useState<RegulatoryDocument[]>([
    {
      id: '1',
      name: 'GDPR Compliance Report 2025',
      framework: 'GDPR',
      generatedDate: '2025-01-30',
      expiryDate: '2026-01-30',
      status: 'valid',
      downloadUrl: '/docs/gdpr-2025.pdf',
    },
    {
      id: '2',
      name: 'HIPAA Security Assessment',
      framework: 'HIPAA',
      generatedDate: '2025-01-28',
      expiryDate: '2026-01-28',
      status: 'valid',
      downloadUrl: '/docs/hipaa-assessment.pdf',
    },
    {
      id: '3',
      name: 'SOC 2 Type II Audit Report',
      framework: 'SOC 2',
      generatedDate: '2024-12-15',
      expiryDate: '2025-06-15',
      status: 'expiring-soon',
      downloadUrl: '/docs/soc2-audit.pdf',
    },
    {
      id: '4',
      name: 'Privacy Policy',
      framework: 'GDPR',
      generatedDate: '2025-01-15',
      expiryDate: '2026-01-15',
      status: 'valid',
      downloadUrl: '/docs/privacy-policy.pdf',
    },
  ]);

  const [complianceIncidents] = useState<ComplianceIncident[]>([
    {
      id: '1',
      type: 'Unauthorized Access Attempt',
      severity: 'high',
      description: 'Multiple failed login attempts from external IP',
      detectedAt: '2025-01-31 13:45',
      status: 'resolved',
      affectedRecords: 0,
      remediationPlan: 'IP blocked, password reset enforced',
    },
    {
      id: '2',
      type: 'Data Retention Violation',
      severity: 'medium',
      description: 'Legacy user data not deleted after retention period',
      detectedAt: '2025-01-30 09:20',
      status: 'investigating',
      affectedRecords: 12,
      remediationPlan: 'Automated deletion process implemented',
    },
    {
      id: '3',
      type: 'Missing Encryption',
      severity: 'critical',
      description: 'Sensitive data transmission without TLS encryption',
      detectedAt: '2025-01-29 15:30',
      status: 'resolved',
      affectedRecords: 0,
      remediationPlan: 'TLS 1.3 enforced on all endpoints',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'valid':
      case 'success':
      case 'active':
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'non-compliant':
      case 'expired':
      case 'failed':
      case 'inactive':
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
      case 'pending':
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800';
      case 'expiring-soon':
        return 'bg-orange-100 text-orange-800';
      case 'not-applicable':
        return 'bg-gray-100 text-gray-800';
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
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const compliantFrameworks = frameworks.filter((f) => f.status === 'compliant').length;
  const averageCoverage = Math.round(frameworks.reduce((sum, f) => sum + f.coverage, 0) / frameworks.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Compliance & Audit System</h1>
              <p className="text-slate-600 mt-2">GDPR, HIPAA, SOC 2 compliance with audit trails and regulatory documentation</p>
            </div>
            <div className="flex gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <Button className="bg-blue-600 hover:bg-blue-700">📋 Generate Report</Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Compliant Frameworks</p>
              <p className="text-3xl font-bold text-green-600">{compliantFrameworks}/4</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Average Coverage</p>
              <p className="text-3xl font-bold text-slate-900">{averageCoverage}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Open Incidents</p>
              <p className="text-3xl font-bold text-orange-600">1</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            <TabsTrigger value="retention">Data Retention</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
          </TabsList>

          {/* Frameworks Tab */}
          <TabsContent value="frameworks" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {frameworks.map((framework) => (
                <Card
                  key={framework.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedFramework(framework)}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-slate-900">{framework.name}</h3>
                          <p className="text-sm text-slate-600 mt-1">Last audit: {framework.lastAudit}</p>
                        </div>
                        <Badge className={getStatusColor(framework.status)}>{framework.status}</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Compliance Coverage</span>
                          <span className="font-semibold">{framework.coverage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${framework.coverage}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-slate-600">Requirements</p>
                          <p className="font-semibold text-slate-900">{framework.completed}/{framework.requirements}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Certifications</p>
                          <p className="font-semibold text-slate-900">{framework.certifications.length}</p>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedFramework && (
              <Card>
                <CardHeader className="flex justify-between items-start">
                  <CardTitle>{selectedFramework.name} Compliance Details</CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedFramework(null)}>
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Status</p>
                      <Badge className={getStatusColor(selectedFramework.status)}>
                        {selectedFramework.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Coverage</p>
                      <p className="text-2xl font-bold text-slate-900">{selectedFramework.coverage}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Requirements Met</p>
                      <p className="text-2xl font-bold text-green-600">{selectedFramework.completed}/{selectedFramework.requirements}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Last Audit</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedFramework.lastAudit}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900 mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedFramework.certifications.map((cert) => (
                        <Badge key={cert} variant="outline">
                          ✓ {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      Schedule Audit
                    </Button>
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-slate-600">Action</th>
                    <th className="text-left py-3 px-4 text-slate-600">User</th>
                    <th className="text-left py-3 px-4 text-slate-600">Resource</th>
                    <th className="text-left py-3 px-4 text-slate-600">Changes</th>
                    <th className="text-left py-3 px-4 text-slate-600">IP Address</th>
                    <th className="text-left py-3 px-4 text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 text-slate-600">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditTrails.map((trail) => (
                    <tr key={trail.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{trail.action}</td>
                      <td className="py-3 px-4 text-slate-700">{trail.user}</td>
                      <td className="py-3 px-4 text-slate-700">{trail.resource}</td>
                      <td className="py-3 px-4 text-slate-700">{trail.changes}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">{trail.ipAddress}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(trail.status)}>{trail.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{trail.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Data Retention Tab */}
          <TabsContent value="retention" className="space-y-4">
            {dataRetentionPolicies.map((policy) => (
              <Card key={policy.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{policy.dataType}</h3>
                        <p className="text-sm text-slate-600 mt-1">Last reviewed: {policy.lastReview}</p>
                      </div>
                      <Badge className={getStatusColor(policy.status)}>{policy.status}</Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Retention Period</p>
                        <p className="font-semibold text-slate-900">{policy.retentionPeriod}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Archive After</p>
                        <p className="font-semibold text-slate-900">{policy.archiveAfter}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Auto-Delete</p>
                        <p className="font-semibold text-slate-900">{policy.autoDelete ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            {regulatoryDocuments.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{doc.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{doc.framework}</p>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-slate-600">Generated</p>
                          <p className="font-semibold text-slate-900">{doc.generatedDate}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Expires</p>
                          <p className="font-semibold text-slate-900">{doc.expiryDate}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Status</p>
                          <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                        </div>
                      </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">Download</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Incidents Tab */}
          <TabsContent value="incidents" className="space-y-4">
            {complianceIncidents.map((incident) => (
              <Card key={incident.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{incident.type}</h3>
                        <p className="text-sm text-slate-600 mt-1">{incident.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getSeverityColor(incident.severity)}>{incident.severity}</Badge>
                        <Badge className={getStatusColor(incident.status)}>{incident.status}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm py-3 border-y">
                      <div>
                        <p className="text-slate-600">Detected</p>
                        <p className="font-semibold text-slate-900">{incident.detectedAt}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Affected Records</p>
                        <p className="font-semibold text-slate-900">{incident.affectedRecords}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Remediation</p>
                        <p className="font-semibold text-slate-900">{incident.remediationPlan}</p>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
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

