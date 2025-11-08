/**
 * Advanced Analytics Engine
 * Real-time KPI dashboards, anomaly detection, automated alerts for business intelligence
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface KPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  status: 'on-track' | 'at-risk' | 'critical';
  lastUpdated: string;
}

interface Anomaly {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: string;
  affectedMetric: string;
  impact: string;
  status: 'new' | 'investigating' | 'resolved';
}

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
}

interface AnalyticsInsight {
  id: string;
  title: string;
  description: string;
  dataPoints: number;
  confidence: number;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
}

export default function AdvancedAnalyticsEngine() {
  const [activeTab, setActiveTab] = useState('kpis');
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);

  const [kpis] = useState<KPI[]>([
    {
      id: '1',
      name: 'Total Revenue',
      value: 485000,
      unit: '$',
      target: 500000,
      trend: 'up',
      trendPercent: 12.5,
      status: 'on-track',
      lastUpdated: '2 minutes ago',
    },
    {
      id: '2',
      name: 'Project Completion Rate',
      value: 94.2,
      unit: '%',
      target: 95,
      trend: 'stable',
      trendPercent: 0.8,
      status: 'on-track',
      lastUpdated: '5 minutes ago',
    },
    {
      id: '3',
      name: 'Customer Satisfaction',
      value: 4.7,
      unit: '/5',
      target: 4.8,
      trend: 'down',
      trendPercent: -2.1,
      status: 'at-risk',
      lastUpdated: '1 minute ago',
    },
    {
      id: '4',
      name: 'Average Project Duration',
      value: 12.3,
      unit: 'days',
      target: 11.5,
      trend: 'up',
      trendPercent: 6.9,
      status: 'critical',
      lastUpdated: '3 minutes ago',
    },
    {
      id: '5',
      name: 'Resource Utilization',
      value: 87.5,
      unit: '%',
      target: 85,
      trend: 'up',
      trendPercent: 3.2,
      status: 'on-track',
      lastUpdated: '1 minute ago',
    },
    {
      id: '6',
      name: 'Quote-to-Close Ratio',
      value: 68.5,
      unit: '%',
      target: 70,
      trend: 'down',
      trendPercent: -4.3,
      status: 'at-risk',
      lastUpdated: '4 minutes ago',
    },
  ]);

  const [anomalies] = useState<Anomaly[]>([
    {
      id: '1',
      type: 'Revenue Spike',
      severity: 'high',
      description: 'Unusual spike in revenue detected on Jan 31',
      detectedAt: '2025-01-31 14:32',
      affectedMetric: 'Total Revenue',
      impact: '+$45,000 (11.6% above average)',
      status: 'investigating',
    },
    {
      id: '2',
      type: 'Performance Drop',
      severity: 'critical',
      description: 'Project completion rate dropped significantly',
      detectedAt: '2025-01-31 13:15',
      affectedMetric: 'Project Completion Rate',
      impact: '-5.8% (below 2-week average)',
      status: 'investigating',
    },
    {
      id: '3',
      type: 'Resource Bottleneck',
      severity: 'medium',
      description: 'High utilization detected in roofing team',
      detectedAt: '2025-01-31 12:45',
      affectedMetric: 'Resource Utilization',
      impact: '95% utilization (above 85% threshold)',
      status: 'new',
    },
    {
      id: '4',
      type: 'Satisfaction Decline',
      severity: 'high',
      description: 'Customer satisfaction score trending down',
      detectedAt: '2025-01-31 11:20',
      affectedMetric: 'Customer Satisfaction',
      impact: '-0.3 points (from 5.0 to 4.7)',
      status: 'resolved',
    },
  ]);

  const [alerts] = useState<Alert[]>([
    {
      id: '1',
      title: 'Critical: Project Duration Alert',
      message: 'Average project duration exceeded target by 6.9%',
      severity: 'critical',
      timestamp: '2025-01-31 14:35',
      read: false,
      actionRequired: true,
    },
    {
      id: '2',
      title: 'Warning: Quote-to-Close Ratio Low',
      message: 'Quote-to-close ratio dropped 4.3% below target',
      severity: 'warning',
      timestamp: '2025-01-31 14:20',
      read: false,
      actionRequired: true,
    },
    {
      id: '3',
      title: 'Info: Revenue Target Achieved',
      message: 'Monthly revenue target reached at 97% of goal',
      severity: 'info',
      timestamp: '2025-01-31 14:00',
      read: true,
      actionRequired: false,
    },
  ]);

  const [insights] = useState<AnalyticsInsight[]>([
    {
      id: '1',
      title: 'Optimize Resource Allocation',
      description: 'Roofing team is at 95% utilization - consider hiring or redistributing workload',
      dataPoints: 847,
      confidence: 94,
      recommendation: 'Hire 1-2 additional team members to reduce bottleneck',
      impact: 'high',
    },
    {
      id: '2',
      title: 'Improve Quote Conversion',
      description: 'Quote-to-close ratio declining - analyze lost deals',
      dataPoints: 523,
      confidence: 88,
      recommendation: 'Review pricing strategy and competitor analysis',
      impact: 'high',
    },
    {
      id: '3',
      title: 'Customer Satisfaction Drivers',
      description: 'Satisfaction declining - likely due to project delays',
      dataPoints: 612,
      confidence: 91,
      recommendation: 'Focus on reducing project duration to 11.5 days target',
      impact: 'high',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
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
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadAlerts = alerts.filter((a) => !a.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Advanced Analytics Engine</h1>
              <p className="text-slate-600 mt-2">Real-time KPI tracking, anomaly detection, and automated alerts</p>
            </div>
            <div className="flex gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="1h">Last 1 Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <Button className="bg-blue-600 hover:bg-blue-700">⚙️ Configure</Button>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        {unreadAlerts > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-semibold text-red-900">🔔 {unreadAlerts} Unread Alert(s)</p>
              <p className="text-sm text-red-800">Action required on critical metrics</p>
            </div>
            <Button className="bg-red-600 hover:bg-red-700">View Alerts</Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="kpis">KPIs</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* KPIs Tab */}
          <TabsContent value="kpis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kpis.map((kpi) => (
                <Card
                  key={kpi.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedKPI(kpi)}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-slate-600">{kpi.name}</p>
                          <p className="text-3xl font-bold text-slate-900 mt-1">
                            {kpi.value.toLocaleString()}
                            <span className="text-lg text-slate-600 ml-1">{kpi.unit}</span>
                          </p>
                        </div>
                        <Badge className={getStatusColor(kpi.status)}>{kpi.status}</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Target</span>
                          <span className="font-semibold">{kpi.target.toLocaleString()}{kpi.unit}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <div className={`text-sm font-semibold ${kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-slate-600'}`}>
                          {kpi.trend === 'up' ? '📈' : kpi.trend === 'down' ? '📉' : '➡️'} {Math.abs(kpi.trendPercent)}%
                        </div>
                        <span className="text-xs text-slate-600">{kpi.lastUpdated}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* KPI Detail */}
            {selectedKPI && (
              <Card>
                <CardHeader className="flex justify-between items-start">
                  <CardTitle>{selectedKPI.name}</CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedKPI(null)}>
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Current Value</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {selectedKPI.value.toLocaleString()}{selectedKPI.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Target</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {selectedKPI.target.toLocaleString()}{selectedKPI.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Variance</p>
                      <p className={`text-2xl font-bold ${selectedKPI.value >= selectedKPI.target ? 'text-green-600' : 'text-red-600'}`}>
                        {((selectedKPI.value / selectedKPI.target - 1) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Trend</p>
                      <p className={`text-2xl font-bold ${selectedKPI.trend === 'up' ? 'text-green-600' : selectedKPI.trend === 'down' ? 'text-red-600' : 'text-slate-600'}`}>
                        {selectedKPI.trend === 'up' ? '📈' : selectedKPI.trend === 'down' ? '📉' : '➡️'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Anomalies Tab */}
          <TabsContent value="anomalies" className="space-y-4">
            {anomalies.map((anomaly) => (
              <Card key={anomaly.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{anomaly.type}</h3>
                        <p className="text-sm text-slate-600 mt-1">{anomaly.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getSeverityColor(anomaly.severity)}>{anomaly.severity}</Badge>
                        <Badge
                          className={
                            anomaly.status === 'new'
                              ? 'bg-blue-100 text-blue-800'
                              : anomaly.status === 'investigating'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }
                        >
                          {anomaly.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-3 border-y">
                      <div>
                        <p className="text-xs text-slate-600">Affected Metric</p>
                        <p className="font-semibold text-slate-900">{anomaly.affectedMetric}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Impact</p>
                        <p className="font-semibold text-slate-900">{anomaly.impact}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Detected</p>
                        <p className="font-semibold text-slate-900">{anomaly.detectedAt}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        Investigate
                      </Button>
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className={alert.read ? 'opacity-75' : ''}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{alert.title}</h3>
                        {alert.actionRequired && <Badge className="bg-red-100 text-red-800">Action Required</Badge>}
                      </div>
                      <p className="text-sm text-slate-600">{alert.message}</p>
                      <p className="text-xs text-slate-500 mt-2">{alert.timestamp}</p>
                    </div>
                    <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{insight.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{insight.description}</p>
                      </div>
                      <Badge
                        className={
                          insight.impact === 'high'
                            ? 'bg-red-100 text-red-800'
                            : insight.impact === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }
                      >
                        {insight.impact} impact
                      </Badge>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm font-semibold text-blue-900">💡 Recommendation</p>
                      <p className="text-sm text-blue-800 mt-1">{insight.recommendation}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-slate-600">Data Points Analyzed</p>
                        <p className="font-semibold text-slate-900">{insight.dataPoints.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Confidence Level</p>
                        <p className="font-semibold text-slate-900">{insight.confidence}%</p>
                      </div>
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Take Action</Button>
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

