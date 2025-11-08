/**
 * Performance Monitoring Dashboard
 * Real-time monitoring of API response times, error rates, system health, and user activity
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MetricData {
  timestamp: Date;
  value: number;
}

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export default function PerformanceMonitoring() {
  const [timeRange, setTimeRange] = useState('1h');
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      severity: 'warning',
      title: 'High API Response Time',
      message: 'Average response time exceeded 500ms threshold',
      timestamp: new Date(Date.now() - 5 * 60000),
      resolved: false,
    },
    {
      id: '2',
      severity: 'info',
      title: 'Database Backup Completed',
      message: 'Daily backup completed successfully at 2:00 AM',
      timestamp: new Date(Date.now() - 2 * 3600000),
      resolved: true,
    },
    {
      id: '3',
      severity: 'critical',
      title: 'High Error Rate',
      message: 'Error rate increased to 2.5% (threshold: 1%)',
      timestamp: new Date(Date.now() - 10 * 60000),
      resolved: false,
    },
  ]);

  const [metrics] = useState({
    apiResponseTime: [
      { timestamp: new Date(Date.now() - 60 * 60000), value: 145 },
      { timestamp: new Date(Date.now() - 50 * 60000), value: 152 },
      { timestamp: new Date(Date.now() - 40 * 60000), value: 148 },
      { timestamp: new Date(Date.now() - 30 * 60000), value: 165 },
      { timestamp: new Date(Date.now() - 20 * 60000), value: 512 },
      { timestamp: new Date(Date.now() - 10 * 60000), value: 485 },
      { timestamp: new Date(), value: 320 },
    ],
    errorRate: [
      { timestamp: new Date(Date.now() - 60 * 60000), value: 0.3 },
      { timestamp: new Date(Date.now() - 50 * 60000), value: 0.2 },
      { timestamp: new Date(Date.now() - 40 * 60000), value: 0.4 },
      { timestamp: new Date(Date.now() - 30 * 60000), value: 0.5 },
      { timestamp: new Date(Date.now() - 20 * 60000), value: 1.8 },
      { timestamp: new Date(Date.now() - 10 * 60000), value: 2.5 },
      { timestamp: new Date(), value: 1.2 },
    ],
    uptime: 99.97,
    activeUsers: 342,
    totalRequests: 125430,
    databaseSize: 2.4,
  });

  const getStatusColor = (value: number, threshold: number) => {
    if (value > threshold * 1.5) return 'text-red-600';
    if (value > threshold) return 'text-orange-600';
    return 'text-green-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Performance Monitoring</h1>
          <p className="text-slate-600">Real-time system health and performance metrics</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6">
          {['1h', '6h', '24h', '7d', '30d'].map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              variant={timeRange === range ? 'default' : 'outline'}
              className={timeRange === range ? 'bg-blue-600 text-white' : ''}
            >
              {range}
            </Button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-slate-600 mb-2">System Uptime</h3>
            <p className="text-3xl font-bold text-green-600">{metrics.uptime}%</p>
            <p className="text-xs text-slate-500 mt-2">Last 30 days</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-slate-600 mb-2">Active Users</h3>
            <p className="text-3xl font-bold text-blue-600">{metrics.activeUsers}</p>
            <p className="text-xs text-slate-500 mt-2">Currently online</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-slate-600 mb-2">Total Requests</h3>
            <p className="text-3xl font-bold text-purple-600">{(metrics.totalRequests / 1000).toFixed(1)}K</p>
            <p className="text-xs text-slate-500 mt-2">Last 24 hours</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-slate-600 mb-2">Database Size</h3>
            <p className="text-3xl font-bold text-indigo-600">{metrics.databaseSize}GB</p>
            <p className="text-xs text-slate-500 mt-2">Current usage</p>
          </Card>
        </div>

        {/* Alerts */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Active Alerts</h3>
            <Badge className="bg-red-100 text-red-800">
              {alerts.filter((a) => !a.resolved).length} Active
            </Badge>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)} ${
                  alert.resolved ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{alert.title}</h4>
                      {alert.resolved && <Badge className="text-xs">Resolved</Badge>}
                    </div>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs mt-2 opacity-75">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {!alert.resolved && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAlerts(
                          alerts.map((a) =>
                            a.id === alert.id ? { ...a, resolved: true } : a
                          )
                        );
                      }}
                    >
                      Dismiss
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Charts */}
        <Tabs defaultValue="response" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="response">API Response Time</TabsTrigger>
            <TabsTrigger value="errors">Error Rate</TabsTrigger>
            <TabsTrigger value="requests">Request Volume</TabsTrigger>
          </TabsList>

          <TabsContent value="response">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                API Response Time (ms)
              </h3>
              <div className="space-y-4">
                <div className="h-64 bg-slate-50 rounded-lg flex items-end justify-between p-4">
                  {metrics.apiResponseTime.map((data, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 mx-1 rounded-t ${
                        data.value > 500
                          ? 'bg-red-500'
                          : data.value > 300
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                      }`}
                      style={{ height: `${(data.value / 600) * 100}%` }}
                      title={`${data.value}ms`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Average</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {Math.round(
                        metrics.apiResponseTime.reduce((sum, d) => sum + d.value, 0) /
                          metrics.apiResponseTime.length
                      )}
                      ms
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Peak</p>
                    <p className="text-lg font-semibold text-red-600">
                      {Math.max(...metrics.apiResponseTime.map((d) => d.value))}ms
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Target</p>
                    <p className="text-lg font-semibold text-slate-900">200ms</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="errors">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Error Rate (%)</h3>
              <div className="space-y-4">
                <div className="h-64 bg-slate-50 rounded-lg flex items-end justify-between p-4">
                  {metrics.errorRate.map((data, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 mx-1 rounded-t ${
                        data.value > 2
                          ? 'bg-red-500'
                          : data.value > 1
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                      }`}
                      style={{ height: `${Math.max(data.value * 20, 5)}%` }}
                      title={`${data.value}%`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Average</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {(
                        metrics.errorRate.reduce((sum, d) => sum + d.value, 0) /
                        metrics.errorRate.length
                      ).toFixed(2)}
                      %
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Peak</p>
                    <p className="text-lg font-semibold text-red-600">
                      {Math.max(...metrics.errorRate.map((d) => d.value)).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Target</p>
                    <p className="text-lg font-semibold text-slate-900">1%</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Request Volume</h3>
              <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                <p className="text-slate-500">Request volume chart coming soon</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* System Health */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">System Components</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'API Server', status: 'healthy', uptime: 99.99 },
              { name: 'Database', status: 'healthy', uptime: 99.98 },
              { name: 'Cache Server', status: 'healthy', uptime: 99.95 },
              { name: 'Email Service', status: 'healthy', uptime: 99.97 },
              { name: 'WebSocket Server', status: 'warning', uptime: 98.5 },
              { name: 'Storage Service', status: 'healthy', uptime: 99.99 },
            ].map((component) => (
              <div key={component.name} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{component.name}</h4>
                  <Badge
                    className={
                      component.status === 'healthy'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }
                  >
                    {component.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">Uptime: {component.uptime}%</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

