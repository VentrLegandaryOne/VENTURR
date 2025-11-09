import React, { useEffect, useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface MetricData {
  timestamp: string;
  value: number;
}

export default function ContinuousValidationDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'cycles' | 'improvements' | 'health'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Queries
  const statusQuery = trpc.continuousValidation.getStatus.useQuery(undefined, {
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const metricsQuery = trpc.continuousValidation.getMetrics.useQuery(undefined, {
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const cycleHistoryQuery = trpc.continuousValidation.getCycleHistory.useQuery(undefined, {
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const improvementHistoryQuery = trpc.continuousValidation.getImprovementHistory.useQuery(undefined, {
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const componentHealthQuery = trpc.componentHealing.getComponentHealth.useQuery(undefined, {
    refetchInterval: autoRefresh ? 5000 : false,
  });

  // Mutations
  const startMutation = trpc.continuousValidation.start.useMutation();
  const stopMutation = trpc.continuousValidation.stop.useMutation();
  const pauseMutation = trpc.continuousValidation.pause.useMutation();
  const resumeMutation = trpc.continuousValidation.resume.useMutation();

  const status = statusQuery.data;
  const metrics = metricsQuery.data;
  const cycles = cycleHistoryQuery.data || [];
  const improvements = improvementHistoryQuery.data || [];
  const componentHealth = Array.isArray(componentHealthQuery.data) ? componentHealthQuery.data : [];

  // Prepare chart data
  const metricsChartData: MetricData[] = [
    { timestamp: 'Workflow', value: metrics ? parseFloat(metrics.workflowSuccessRate) : 0 },
    { timestamp: 'Validation', value: metrics ? parseFloat(metrics.validationPassRate) : 0 },
    { timestamp: 'QA Pass', value: metrics ? parseFloat(metrics.outputQAPassRate) : 0 },
    { timestamp: 'Refinement', value: metrics ? parseFloat(metrics.refinementSuccessRate) : 0 },
  ];

  const healthChartData = componentHealth.map((h: any) => ({
    name: h.component,
    score: parseFloat(h.healthScore),
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to access the dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Continuous Validation Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring of system validation, healing, and improvements</p>
        </div>

        {/* Control Panel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Control Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Button
                onClick={() => startMutation.mutate()}
                disabled={status?.running}
                variant={status?.running ? 'secondary' : 'default'}
              >
                Start Loop
              </Button>
              <Button
                onClick={() => stopMutation.mutate()}
                disabled={!status?.running}
                variant="destructive"
              >
                Stop Loop
              </Button>
              <Button
                onClick={() => pauseMutation.mutate()}
                disabled={!status?.running || status?.paused}
                variant="outline"
              >
                Pause
              </Button>
              <Button
                onClick={() => resumeMutation.mutate()}
                disabled={!status?.paused}
                variant="outline"
              >
                Resume
              </Button>

              <div className="ml-auto flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoRefresh"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="autoRefresh" className="text-sm font-medium">
                    Auto Refresh
                  </label>
                </div>

                <Badge variant={status?.running ? 'default' : 'secondary'}>
                  {status?.running ? 'Running' : 'Stopped'}
                </Badge>
                <Badge variant={status?.paused ? 'secondary' : 'outline'}>
                  {status?.paused ? 'Paused' : 'Active'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cycles Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{status?.cycleCount || 0}</div>
              <p className="text-xs text-gray-500 mt-1">5-minute intervals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">All Metrics Met</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{status?.allMetricsMet ? '✓' : '✗'}</div>
              <p className="text-xs text-gray-500 mt-1">Success threshold</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics?.systemUptime || '0'}%</div>
              <p className="text-xs text-gray-500 mt-1">Target: 99.9%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics?.errorRate || '0'}%</div>
              <p className="text-xs text-gray-500 mt-1">Target: &lt;0.01%</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {(['overview', 'metrics', 'cycles', 'improvements', 'health'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Cycle Status</CardTitle>
              </CardHeader>
              <CardContent>
                {status?.currentCycle ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Cycle ID</p>
                      <p className="font-mono text-sm">{status.currentCycle.cycleId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phase</p>
                      <Badge>{status.currentCycle.phase}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge variant={status.currentCycle.status === 'completed' ? 'default' : 'secondary'}>
                        {status.currentCycle.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-mono text-sm">{status.currentCycle.duration}ms</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Faults Detected</p>
                      <p className="font-bold text-lg">{status.currentCycle.faultsDetected}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Faults Healed</p>
                      <p className="font-bold text-lg text-green-600">{status.currentCycle.faultsHealed}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No active cycle</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Workflow Success Rate</span>
                        <span className="font-bold">{metrics.workflowSuccessRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Validation Pass Rate</span>
                        <span className="font-bold">{metrics.validationPassRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Perception Acceptance</span>
                        <span className="font-bold">{metrics.perceptionAcceptance}/10</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Output QA Pass Rate</span>
                        <span className="font-bold">{metrics.outputQAPassRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Data Integrity</span>
                        <span className="font-bold">{metrics.dataIntegrity}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Response Latency</span>
                        <span className="font-bold">{metrics.responseLatency}ms</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics Comparison</CardTitle>
              <CardDescription>Success rates across validation phases</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metricsChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Cycles Tab */}
        {activeTab === 'cycles' && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Cycles</CardTitle>
              <CardDescription>Last 20 validation cycles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-4">Cycle ID</th>
                      <th className="text-left py-2 px-4">Status</th>
                      <th className="text-left py-2 px-4">Duration</th>
                      <th className="text-left py-2 px-4">Faults</th>
                      <th className="text-left py-2 px-4">Healed</th>
                      <th className="text-left py-2 px-4">Patched</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cycles.map((cycle: any) => (
                      <tr key={cycle.cycleId} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4 font-mono text-xs">{cycle.cycleId.slice(-8)}</td>
                        <td className="py-2 px-4">
                          <Badge variant={cycle.status === 'completed' ? 'default' : 'secondary'}>
                            {cycle.status}
                          </Badge>
                        </td>
                        <td className="py-2 px-4">{cycle.duration}ms</td>
                        <td className="py-2 px-4">{cycle.faultsDetected}</td>
                        <td className="py-2 px-4 text-green-600 font-bold">{cycle.faultsHealed}</td>
                        <td className="py-2 px-4">{cycle.componentsPatched}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Improvements Tab */}
        {activeTab === 'improvements' && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Improvements</CardTitle>
              <CardDescription>Last 50 system improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-4">Type</th>
                      <th className="text-left py-2 px-4">Component</th>
                      <th className="text-left py-2 px-4">Issue</th>
                      <th className="text-left py-2 px-4">Result</th>
                      <th className="text-left py-2 px-4">Improvement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {improvements.slice(0, 20).map((imp: any) => (
                      <tr key={imp.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">
                          <Badge variant="outline">{imp.type}</Badge>
                        </td>
                        <td className="py-2 px-4 font-mono text-xs">{imp.component}</td>
                        <td className="py-2 px-4 text-xs">{imp.issue}</td>
                        <td className="py-2 px-4">
                          <Badge variant={imp.result === 'success' ? 'default' : 'destructive'}>
                            {imp.result}
                          </Badge>
                        </td>
                        <td className="py-2 px-4 font-bold text-green-600">{imp.improvement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Health Tab */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Component Health Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={healthChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Component Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {componentHealth.map((comp: any) => (
                    <div key={comp.component} className="border rounded p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{comp.component}</h3>
                        <Badge className={getStatusColor(comp.status)}>
                          {comp.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Health Score</span>
                          <span className="font-bold">{comp.healthScore}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Success Rate</span>
                          <span className="font-bold">{comp.successRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Healing Attempts</span>
                          <span className="font-bold">{comp.healingAttempts}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

