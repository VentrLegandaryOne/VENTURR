/**
 * SYSTEM HEALTH DASHBOARD
 * 
 * Real-time monitoring of system health, watchdog status, and recovery operations
 * Shows metrics, alerts, recovery checkpoints, and system status
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Server,
  Database,
  Zap,
} from 'lucide-react';

interface WatchdogCycle {
  cycleId: string;
  timestamp: string;
  duration: number;
  status: string;
  diagnosticsCount: number;
  criticalIssues: number;
  healingActionsCount: number;
  issues: string[];
  recommendations: string[];
}

interface RecoveryCheckpoint {
  id: string;
  timestamp: string;
  status: string;
  metrics: {
    uptime: string;
    errorRate: string;
    responseTime: string;
    dataIntegrity: string;
  };
}

export default function SystemHealthDashboard() {
  const [cycles, setCycles] = useState<WatchdogCycle[]>([]);
  const [checkpoints, setCheckpoints] = useState<RecoveryCheckpoint[]>([]);
  const [watchdogStatus, setWatchdogStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Get watchdog cycles
  const getWatchdogCycles = async () => {
    try {
      const result = await trpc.ci.getWatchdogCycles.query();
      setCycles(result);
    } catch (error) {
      console.error('Failed to get watchdog cycles:', error);
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

  // Get recovery checkpoints
  const getRecoveryCheckpoints = async () => {
    try {
      const result = await trpc.ci.getRecoveryCheckpoints.query();
      setCheckpoints(result);
    } catch (error) {
      console.error('Failed to get recovery checkpoints:', error);
    }
  };

  // Start watchdog
  const startWatchdog = async () => {
    setLoading(true);
    try {
      await trpc.ci.startWatchdog.mutate();
      getWatchdogStatus();
    } catch (error) {
      console.error('Failed to start watchdog:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stop watchdog
  const stopWatchdog = async () => {
    setLoading(true);
    try {
      await trpc.ci.stopWatchdog.mutate();
      getWatchdogStatus();
    } catch (error) {
      console.error('Failed to stop watchdog:', error);
    } finally {
      setLoading(false);
    }
  };

  // Restore to last stable state
  const restoreLastStableState = async () => {
    setLoading(true);
    try {
      await trpc.ci.restoreToLastStableState.mutate();
      getWatchdogStatus();
      getRecoveryCheckpoints();
    } catch (error) {
      console.error('Failed to restore:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      getWatchdogStatus();
      getWatchdogCycles();
      getRecoveryCheckpoints();

      const interval = setInterval(() => {
        getWatchdogStatus();
        getWatchdogCycles();
        getRecoveryCheckpoints();
      }, 30000); // Refresh every 30 seconds

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
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Health Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time monitoring of system health and recovery</p>
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
              getWatchdogStatus();
              getWatchdogCycles();
              getRecoveryCheckpoints();
            }}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Watchdog Status */}
      {watchdogStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(watchdogStatus.lastCycle?.status || 'unknown')}
              Watchdog Monitor Status
            </CardTitle>
            <CardDescription>System health monitoring and auto-healing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Status</p>
                <Badge className={getStatusColor(watchdogStatus.lastCycle?.status || 'unknown')}>
                  {watchdogStatus.lastCycle?.status || 'Unknown'}
                </Badge>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Monitoring</p>
                <Badge variant={watchdogStatus.active ? 'default' : 'secondary'}>
                  {watchdogStatus.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Recovery</p>
                <Badge variant={watchdogStatus.recoveryInProgress ? 'destructive' : 'outline'}>
                  {watchdogStatus.recoveryInProgress ? 'In Progress' : 'Idle'}
                </Badge>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Recovery Attempts</p>
                <p className="text-2xl font-bold">{watchdogStatus.recoveryAttempts}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Last Check</p>
                <p className="text-sm font-semibold">
                  {watchdogStatus.lastCycle
                    ? new Date(watchdogStatus.lastCycle.timestamp).toLocaleTimeString()
                    : 'Never'}
                </p>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              {watchdogStatus.active ? (
                <Button
                  variant="destructive"
                  onClick={stopWatchdog}
                  disabled={loading}
                >
                  Stop Watchdog
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={startWatchdog}
                  disabled={loading}
                >
                  Start Watchdog
                </Button>
              )}
              <Button
                variant="outline"
                onClick={restoreLastStableState}
                disabled={loading || !watchdogStatus.lastStableState}
              >
                Restore Last Stable State
              </Button>
            </div>

            {/* Last Cycle Issues */}
            {watchdogStatus.lastCycle && watchdogStatus.lastCycle.issues.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">Recent Issues:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {watchdogStatus.lastCycle.issues.map((issue: string, i: number) => (
                      <li key={i} className="text-sm">
                        {issue}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* System Metrics */}
      {checkpoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              System Metrics
            </CardTitle>
            <CardDescription>Latest system health metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {checkpoints.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-2">Uptime</p>
                  <p className="text-2xl font-bold">{checkpoints[0].metrics.uptime}m</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-2">Error Rate</p>
                  <p className="text-2xl font-bold">{checkpoints[0].metrics.errorRate}%</p>
                  <Progress value={parseFloat(checkpoints[0].metrics.errorRate)} className="mt-2" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-2">Response Time</p>
                  <p className="text-2xl font-bold">{checkpoints[0].metrics.responseTime}ms</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-2">Data Integrity</p>
                  <p className="text-2xl font-bold">{checkpoints[0].metrics.dataIntegrity}%</p>
                  <Progress value={parseFloat(checkpoints[0].metrics.dataIntegrity)} className="mt-2" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Cycles */}
      {cycles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Monitoring Cycles
            </CardTitle>
            <CardDescription>Last 10 watchdog monitoring cycles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cycles.slice(0, 10).map((cycle) => (
                <div key={cycle.cycleId} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(cycle.status)}
                      <div>
                        <p className="font-semibold text-sm">{cycle.cycleId}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(cycle.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(cycle.status)}>{cycle.status}</Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                    <div>
                      <p className="text-gray-600">Diagnostics</p>
                      <p className="font-bold">{cycle.diagnosticsCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Critical Issues</p>
                      <p className="font-bold text-red-600">{cycle.criticalIssues}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Healing Actions</p>
                      <p className="font-bold">{cycle.healingActionsCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-bold">{cycle.duration}ms</p>
                    </div>
                  </div>

                  {cycle.issues.length > 0 && (
                    <div className="text-xs bg-red-50 p-2 rounded mb-2">
                      <p className="font-semibold text-red-700 mb-1">Issues:</p>
                      {cycle.issues.slice(0, 2).map((issue, i) => (
                        <p key={i} className="text-red-600 text-xs">
                          • {issue}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recovery Checkpoints */}
      {checkpoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Recovery Checkpoints
            </CardTitle>
            <CardDescription>Saved system states for recovery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checkpoints.slice(0, 5).map((checkpoint) => (
                <div key={checkpoint.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">{checkpoint.id}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(checkpoint.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={checkpoint.status === 'stable' ? 'default' : 'secondary'}>
                      {checkpoint.status}
                    </Badge>
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

