/**
 * Real-Time Dashboard with Live Updates
 * WebSocket-powered dashboards showing live metrics, notifications, and team activity
 */

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LiveMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface TeamActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: Date;
  status: 'active' | 'idle' | 'offline';
}

interface DashboardData {
  metrics: LiveMetric[];
  activities: TeamActivity[];
  chartData: Array<{
    time: string;
    revenue: number;
    projects: number;
    team: number;
  }>;
  alerts: Array<{
    id: string;
    type: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: Date;
  }>;
}

export default function RealtimeDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    metrics: [
      {
        id: '1',
        name: 'Active Projects',
        value: 24,
        target: 20,
        unit: 'projects',
        trend: 'up',
        trendPercent: 12,
        status: 'healthy',
      },
      {
        id: '2',
        name: 'Team Utilization',
        value: 87,
        target: 85,
        unit: '%',
        trend: 'up',
        trendPercent: 3,
        status: 'healthy',
      },
      {
        id: '3',
        name: 'Revenue (This Month)',
        value: 125000,
        target: 120000,
        unit: '$',
        trend: 'up',
        trendPercent: 8,
        status: 'healthy',
      },
      {
        id: '4',
        name: 'Customer Satisfaction',
        value: 4.7,
        target: 4.5,
        unit: '/5',
        trend: 'stable',
        trendPercent: 0,
        status: 'healthy',
      },
    ],
    activities: [
      {
        id: '1',
        userId: 'user1',
        userName: 'John Smith',
        action: 'Completed project quote',
        timestamp: new Date(),
        status: 'active',
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Sarah Johnson',
        action: 'Updated project timeline',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: 'active',
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Mike Davis',
        action: 'Approved payment',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        status: 'idle',
      },
    ],
    chartData: Array.from({ length: 12 }, (_, i) => ({
      time: `${i}:00`,
      revenue: Math.floor(Math.random() * 50000) + 80000,
      projects: Math.floor(Math.random() * 10) + 15,
      team: Math.floor(Math.random() * 20) + 60,
    })),
    alerts: [
      {
        id: '1',
        type: 'info',
        message: 'New project quote pending approval',
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'warning',
        message: 'Team member utilization above 90%',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
      },
    ],
  });

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds

  // Simulate WebSocket connection and live updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Update metrics with slight variations
      setDashboardData((prev) => ({
        ...prev,
        metrics: prev.metrics.map((m) => ({
          ...m,
          value: m.value + (Math.random() - 0.5) * 10,
          trendPercent: Math.random() * 10 - 5,
        })),
        chartData: [
          ...prev.chartData.slice(1),
          {
            time: new Date().getHours() + ':00',
            revenue: Math.floor(Math.random() * 50000) + 80000,
            projects: Math.floor(Math.random() * 10) + 15,
            team: Math.floor(Math.random() * 20) + 60,
          },
        ],
      }));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Real-Time Dashboard</h1>
            <p className="text-slate-600 mt-2">Live metrics and team activity</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                autoRefresh
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {autoRefresh ? '⏸ Pause' : '▶ Resume'}
            </button>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white"
            >
              <option value={1000}>1 second</option>
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
            </select>
          </div>
        </div>

        {/* Alerts */}
        {dashboardData.alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {dashboardData.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg flex items-center gap-3 ${
                  alert.type === 'critical'
                    ? 'bg-red-50 border border-red-200'
                    : alert.type === 'warning'
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    alert.type === 'critical'
                      ? 'bg-red-500'
                      : alert.type === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                  }`}
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{alert.message}</p>
                  <p className="text-sm text-slate-600">{alert.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {dashboardData.metrics.map((metric) => (
            <Card key={metric.id} className="hover:shadow-lg transition">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm font-medium text-slate-600">{metric.name}</CardTitle>
                  <Badge className={getStatusColor(metric.status)}>{metric.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">{metric.value.toFixed(0)}</span>
                  <span className="text-sm text-slate-600">{metric.unit}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-slate-600">Target: {metric.target}</span>
                  <span
                    className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}
                  >
                    {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'} {Math.abs(metric.trendPercent).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="team" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Team Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Team Activity Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                      {activity.userName.charAt(0)}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getActivityStatusColor(activity.status)}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{activity.userName}</p>
                    <p className="text-sm text-slate-600">{activity.action}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {Math.round((Date.now() - activity.timestamp.getTime()) / 60000)} minutes ago
                    </p>
                  </div>
                  <Badge variant="outline">{activity.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

