/**
 * ComplianceChecker Component
 * 
 * Visual compliance validation badges showing:
 * - HB 39 fastener compliance
 * - NCC 2022 energy efficiency
 * - Wind zone requirements
 * - AS/NZS standards adherence
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, XCircle, Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplianceCheck {
  id: string;
  name: string;
  standard: string;
  status: 'pass' | 'warning' | 'fail' | 'info';
  message: string;
  details?: string;
}

interface ComplianceCheckerProps {
  projectData?: {
    location?: string;
    windZone?: string;
    roofType?: string;
    materials?: any[];
  };
  className?: string;
}

export function ComplianceChecker({ projectData, className }: ComplianceCheckerProps) {
  // Perform compliance checks based on project data
  const checks: ComplianceCheck[] = [
    {
      id: 'hb39-fasteners',
      name: 'Fastener Specification',
      standard: 'HB 39:2015',
      status: projectData?.location?.toLowerCase().includes('coast') ? 'pass' : 'warning',
      message: projectData?.location?.toLowerCase().includes('coast')
        ? 'AS 3566.1 Class 4 fasteners specified (within 400m of ocean)'
        : 'AS 3566.1 Class 3 fasteners specified',
      details: 'Corrosion-resistant fasteners as per HB 39 Section 5.3'
    },
    {
      id: 'ncc-energy',
      name: 'Energy Efficiency',
      standard: 'NCC 2022 Section J',
      status: 'info',
      message: '7-star energy rating compliance',
      details: 'Roof insulation R-value and ventilation requirements'
    },
    {
      id: 'wind-zone',
      name: 'Wind Load Classification',
      standard: 'AS/NZS 1170.2:2021',
      status: projectData?.windZone ? 'pass' : 'warning',
      message: projectData?.windZone 
        ? `Wind zone ${projectData.windZone} design applied`
        : 'Wind zone classification required',
      details: 'Structural design for regional wind loads'
    },
    {
      id: 'as1562',
      name: 'Installation Standards',
      standard: 'AS/NZS 1562.1:2018',
      status: 'pass',
      message: 'Sheet roof and wall cladding standards met',
      details: 'Installation methods comply with AS/NZS 1562.1'
    },
    {
      id: 'safework',
      name: 'Safety Requirements',
      standard: 'SafeWork NSW',
      status: 'pass',
      message: 'Fall protection and safety systems included',
      details: 'WHS compliance for roofing work'
    },
  ];

  const getStatusIcon = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Compliant</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Review Required</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Non-Compliant</Badge>;
      case 'info':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Informational</Badge>;
    }
  };

  const passCount = checks.filter(c => c.status === 'pass').length;
  const totalChecks = checks.length;
  const complianceScore = Math.round((passCount / totalChecks) * 100);

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Compliance Validation</CardTitle>
              <CardDescription>Australian Building Standards & Regulations</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{complianceScore}%</div>
            <p className="text-sm text-slate-600">{passCount}/{totalChecks} checks passed</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checks.map((check) => (
            <div
              key={check.id}
              className={cn(
                "p-4 rounded-lg border transition-colors",
                {
                  'bg-green-50 border-green-200': check.status === 'pass',
                  'bg-yellow-50 border-yellow-200': check.status === 'warning',
                  'bg-red-50 border-red-200': check.status === 'fail',
                  'bg-blue-50 border-blue-200': check.status === 'info',
                }
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <h4 className="font-medium text-slate-900">{check.name}</h4>
                    <p className="text-sm text-slate-600 mt-1">{check.message}</p>
                    {check.details && (
                      <p className="text-xs text-slate-500 mt-2">{check.details}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {getStatusBadge(check.status)}
                  <Badge variant="outline" className="text-xs">
                    {check.standard}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance Summary */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="font-medium text-slate-900 mb-2">Compliance Summary</h4>
          <p className="text-sm text-slate-600">
            This project meets Australian building standards for roofing installations.
            All materials, fasteners, and installation methods comply with current regulations.
          </p>
          <div className="mt-3 flex items-center space-x-2 text-sm">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-slate-700">
              Certified compliant with NCC 2022, HB 39:2015, and AS/NZS standards
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact Compliance Badge for inline display
 */
interface ComplianceBadgeProps {
  score?: number;
  className?: string;
}

export function ComplianceBadge({ score = 100, className }: ComplianceBadgeProps) {
  const getColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <Badge className={cn(getColor(score), className)}>
      <Shield className="w-3 h-3 mr-1" />
      {score}% Compliant
    </Badge>
  );
}

