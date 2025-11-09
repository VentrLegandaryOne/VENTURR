/**
 * CI VALIDATION DASHBOARD
 * 
 * Real-time monitoring of Continuous Integration, Validation & Refinement Environment
 * Shows workflow execution, validation results, perception analysis, watchdog status
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/lib/trpc';
import { AlertTriangle, CheckCircle, Clock, RefreshCw, AlertCircle } from 'lucide-react';

interface WorkflowResult {
  role: string;
  totalDuration: number;
  stepsCompleted: number;
  stepsFailed: number;
  successRate: string;
}

interface ValidationResult {
  total: number;
  passed: number;
  failed: number;
  criticalFailures: number;
  passRate: string;
}

interface PerceptionAnalysis {
  archetype: string;
  clarity: number;
  professionalism: number;
  complianceVisibility: number;
  acceptanceProbability: number;
  overall: number;
}

interface WatchdogStatus {
  active: boolean;
  recoveryInProgress: boolean;
  recoveryAttempts: number;
  lastCycle: {
    cycleId: string;
    timestamp: string;
    status: string;
    issues: string[];
    recommendations: string[];
  } | null;
  lastStableState: {
    id: string;
    timestamp: string;
    status: string;
  } | null;
}

export default function CIDashboard() {
  const [workflows, setWorkflows] = useState<WorkflowResult[]>([]);
  const [validations, setValidations] = useState<ValidationResult | null>(null);
  const [perceptions, setPerceptions] = useState<PerceptionAnalysis[]>([]);
  const [watchdogStatus, setWatchdogStatus] = useState<WatchdogStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Execute all workflows
  const executeWorkflows = async () => {
    setLoading(true);
    try {
      const result = await trpc.ci.executeAllWorkflows.mutate();
      setWorkflows(result);
    } catch (error) {
      console.error('Failed to execute workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  // Run validations
  const runValidations = async () => {
    setLoading(true);
    try {
      const result = await trpc.ci.validateAll.mutate();
      setValidations(result);
    } catch (error) {
      console.error('Failed to run validations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get watchdog status
  const getWatchdogStatus = async () => {
    try {
      const result = await trpc.ci.getWatchdogStatus.query();
      setWatchdogStatus(result);
    } catch (error) {
      console.error('Failed to get watchdog status:', error);
    }
  };

  // Auto-refresh watchdog status
  useEffect(() => {
    if (autoRefresh) {
      getWatchdogStatus();
      const interval = setInterval(getWatchdogStatus, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'recovering':
        return 'bg-blue-100 text-blue-800';
      case 'recovered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'recovered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'recovering':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">CI Validation Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring of Continuous Integration, Validation & Refinement Environment
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto-Refresh: ON' : 'Auto-Refresh: OFF'}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              executeWorkflows();
              runValidations();
              getWatchdogStatus();
            }}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Watchdog Status */}
      {watchdogStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(watchdogStatus.lastCycle?.status || 'unknown')}
              Watchdog Monitor
            </CardTitle>
            <CardDescription>
              System health monitoring and auto-healing status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={getStatusColor(watchdogStatus.lastCycle?.status || 'unknown')}>
                  {watchdogStatus.lastCycle?.status || 'Unknown'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monitoring</p>
                <Badge variant={watchdogStatus.active ? 'default' : 'secondary'}>
                  {watchdogStatus.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Recovery In Progress</p>
                <Badge variant={watchdogStatus.recoveryInProgress ? 'destructive' : 'outline'}>
                  {watchdogStatus.recoveryInProgress ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Recovery Attempts</p>
                <p className="text-2xl font-bold">{watchdogStatus.recoveryAttempts}</p>
              </div>
            </div>

            {watchdogStatus.lastCycle && (
              <div className="space-y-2">
                <h4 className="font-semibold">Last Cycle</h4>
                <p className="text-sm text-gray-600">
                  {new Date(watchdogStatus.lastCycle.timestamp).toLocaleString()}
                </p>
                {watchdogStatus.lastCycle.issues.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold mb-2">Issues Detected:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {watchdogStatus.lastCycle.issues.map((issue, i) => (
                          <li key={i} className="text-sm">
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {validations && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Checkpoints</CardTitle>
            <CardDescription>
              Functionality validation results (zero errors, ≤1s latency, 100% data continuity)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Checkpoints</p>
                <p className="text-3xl font-bold text-blue-600">{validations.total}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Passed</p>
                <p className="text-3xl font-bold text-green-600">{validations.passed}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-3xl font-bold text-red-600">{validations.failed}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Critical Failures</p>
                <p className="text-3xl font-bold text-orange-600">
                  {validations.criticalFailures}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">Pass Rate</p>
                <p className="text-2xl font-bold text-green-600">{validations.passRate}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${validations.passRate}%` }}
                />
              </div>
            </div>
            <Button className="mt-4 w-full" onClick={runValidations} disabled={loading}>
              Run Validations
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Workflow Results */}
      {workflows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Workflow Execution Results</CardTitle>
            <CardDescription>
              Complete day-to-day workflow simulation for all 10 roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <div key={workflow.role} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold capitalize">{workflow.role.replace('_', ' ')}</h4>
                    <Badge
                      className={
                        workflow.stepsFailed === 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {workflow.successRate}% Success
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Steps Completed</p>
                      <p className="text-lg font-bold">{workflow.stepsCompleted}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Steps Failed</p>
                      <p className="text-lg font-bold text-red-600">{workflow.stepsFailed}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Duration</p>
                      <p className="text-lg font-bold">{workflow.totalDuration}ms</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-4 w-full" onClick={executeWorkflows} disabled={loading}>
              Execute All Workflows
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Perception Analysis */}
      {perceptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Perception Analysis</CardTitle>
            <CardDescription>
              How outputs are perceived by all 10 stakeholder archetypes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {perceptions.map((perception) => (
                <div key={perception.archetype} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold capitalize">
                      {perception.archetype.replace('_', ' ')}
                    </h4>
                    <Badge
                      className={
                        perception.overall >= 8
                          ? 'bg-green-100 text-green-800'
                          : perception.overall >= 6
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }
                    >
                      {perception.overall.toFixed(1)}/10
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Clarity</p>
                      <p className="text-lg font-bold">{perception.clarity.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Professional</p>
                      <p className="text-lg font-bold">{perception.professionalism.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Compliance</p>
                      <p className="text-lg font-bold">
                        {perception.complianceVisibility.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Acceptance</p>
                      <p className="text-lg font-bold">
                        {perception.acceptanceProbability.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

