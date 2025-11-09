/**
 * AUTONOMOUS CYCLE MONITORING DASHBOARD
 * 
 * Real-time monitoring of continuous autonomous validation cycles
 */

import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AutonomousCycleDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'cycles' | 'metrics' | 'executions'>('overview');

  // Queries
  const cycleStatusQuery = trpc.autonomousCycle.getCycleStatus.useQuery(undefined, {
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const cycleStatsQuery = trpc.autonomousCycle.getCycleStatistics.useQuery(undefined, {
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const cycleExecutionsQuery = trpc.autonomousCycle.getCycleExecutions.useQuery({ limit: 20 }, {
    refetchInterval: autoRefresh ? 15000 : false,
  });

  const autoCorrectionQuery = trpc.autonomousCycle.getAutoCorrectionActions.useQuery({ limit: 10 }, {
    refetchInterval: autoRefresh ? 15000 : false,
  });

  // Mutations
  const startCycleMutation = trpc.autonomousCycle.startContinuousCycle.useMutation({
    onSuccess: () => {
      cycleStatusQuery.refetch();
    },
  });

  const stopCycleMutation = trpc.autonomousCycle.stopContinuousCycle.useMutation({
    onSuccess: () => {
      cycleStatusQuery.refetch();
    },
  });

  const executeManualCycleMutation = trpc.autonomousCycle.executeAutonomousCycle.useMutation({
    onSuccess: () => {
      cycleStatusQuery.refetch();
      cycleStatsQuery.refetch();
      cycleExecutionsQuery.refetch();
    },
  });

  // Prepare chart data
  const metricsData = cycleExecutionsQuery.data
    ? cycleExecutionsQuery.data.map((cycle) => ({
        cycle: `#${cycle.cycleNumber}`,
        score: parseFloat(cycle.overallScore),
        acceptance: parseFloat(cycle.acceptanceRate),
      }))
    : [];

  const statusBadge = (status: string) => {
    const statusMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      in_progress: 'secondary',
      completed: 'default',
      failed: 'destructive',
    };
    return statusMap[status] || 'outline';
  };

  const severityColor = (severity: string) => {
    const colorMap: Record<string, string> = {
      critical: 'text-red-600',
      high: 'text-orange-600',
      medium: 'text-yellow-600',
      low: 'text-blue-600',
    };
    return colorMap[severity] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Autonomous Cycle Dashboard</h1>
            <p className="text-muted-foreground mt-2">Real-time monitoring of continuous validation cycles</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? '⏸ Auto-Refresh' : '▶ Auto-Refresh'}
            </Button>
            {cycleStatusQuery.data?.isRunning ? (
              <Button
                variant="destructive"
                onClick={() => stopCycleMutation.mutate()}
                disabled={stopCycleMutation.isPending}
              >
                Stop Cycle
              </Button>
            ) : (
              <Button
                onClick={() => startCycleMutation.mutate()}
                disabled={startCycleMutation.isPending}
              >
                Start Cycle
              </Button>
            )}
            <Button
              onClick={() => executeManualCycleMutation.mutate()}
              disabled={executeManualCycleMutation.isPending}
            >
              Execute Now
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cycleStatusQuery.data?.isRunning ? (
                    <Badge>Running</Badge>
                  ) : (
                    <Badge variant="outline">Stopped</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Cycle #{cycleStatusQuery.data?.cycleCount || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Production Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cycleStatusQuery.data?.productionReady ? (
                    <span className="text-green-600">✓ Yes</span>
                  ) : (
                    <span className="text-yellow-600">⚠ No</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">System readiness status</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cycleStatsQuery.data?.averageScore || '0.00'}/10</div>
                <p className="text-xs text-muted-foreground mt-2">Across all cycles</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cycleStatsQuery.data?.averageAcceptance || '0.0'}%</div>
                <p className="text-xs text-muted-foreground mt-2">Average acceptance</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {(['overview', 'cycles', 'metrics', 'executions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 font-medium text-sm ${
                selectedTab === tab
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cycle Statistics</CardTitle>
                <CardDescription>Overall performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Cycles</span>
                  <span className="font-bold">{cycleStatsQuery.data?.totalCycles || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed</span>
                  <span className="font-bold text-green-600">{cycleStatsQuery.data?.completedCycles || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Failed</span>
                  <span className="font-bold text-red-600">{cycleStatsQuery.data?.failedCycles || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Production Ready</span>
                  <span className="font-bold">{cycleStatsQuery.data?.productionReadyCycles || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Iterations</span>
                  <span className="font-bold">{cycleStatsQuery.data?.averageIterations || '0.0'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Corrections</span>
                  <span className="font-bold">{cycleStatsQuery.data?.totalCorrections || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Auto-Corrections</CardTitle>
                <CardDescription>Last 5 corrections applied</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {autoCorrectionQuery.data && autoCorrectionQuery.data.length > 0 ? (
                    autoCorrectionQuery.data.slice(0, 5).map((action) => (
                      <div key={action.id} className="text-sm border-l-2 border-blue-500 pl-3">
                        <div className={`font-medium ${severityColor(action.severity)}`}>
                          {action.issueType}
                        </div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                        <div className="text-xs mt-1">
                          {action.success ? '✓ Success' : '✗ Failed'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No corrections yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cycles Tab */}
        {selectedTab === 'cycles' && (
          <Card>
            <CardHeader>
              <CardTitle>Cycle Executions</CardTitle>
              <CardDescription>Recent cycle execution history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Cycle #</th>
                      <th className="text-left py-2 px-2">Status</th>
                      <th className="text-left py-2 px-2">Score</th>
                      <th className="text-left py-2 px-2">Acceptance</th>
                      <th className="text-left py-2 px-2">Ready</th>
                      <th className="text-left py-2 px-2">Iterations</th>
                      <th className="text-left py-2 px-2">Corrections</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cycleExecutionsQuery.data?.map((cycle) => (
                      <tr key={cycle.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2 font-medium">#{cycle.cycleNumber}</td>
                        <td className="py-2 px-2">
                          <Badge variant={statusBadge(cycle.status)}>
                            {cycle.status}
                          </Badge>
                        </td>
                        <td className="py-2 px-2">{cycle.overallScore}/10</td>
                        <td className="py-2 px-2">{cycle.acceptanceRate}%</td>
                        <td className="py-2 px-2">
                          {cycle.productionReady ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-yellow-600">⚠</span>
                          )}
                        </td>
                        <td className="py-2 px-2">{cycle.iterationCount}</td>
                        <td className="py-2 px-2">{cycle.correctionsApplied}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics Tab */}
        {selectedTab === 'metrics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Score Trend</CardTitle>
                <CardDescription>Overall score over recent cycles</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cycle" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" name="Score" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acceptance Rate Trend</CardTitle>
                <CardDescription>Acceptance rate over recent cycles</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cycle" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="acceptance" fill="#10b981" name="Acceptance %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Executions Tab */}
        {selectedTab === 'executions' && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Executions</CardTitle>
              <CardDescription>Complete execution history with timestamps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cycleExecutionsQuery.data?.map((cycle) => (
                  <div key={cycle.id} className="border rounded-lg p-4 hover:bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">Cycle #{cycle.cycleNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          {cycle.startTime && new Date(cycle.startTime).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={statusBadge(cycle.status)}>
                        {cycle.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Score</span>
                        <p className="font-bold">{cycle.overallScore}/10</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Acceptance</span>
                        <p className="font-bold">{cycle.acceptanceRate}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Iterations</span>
                        <p className="font-bold">{cycle.iterationCount}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Corrections</span>
                        <p className="font-bold">{cycle.correctionsApplied}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

