/**
 * Advanced Reporting Dashboard
 * Executive dashboard with KPIs, revenue trends, team performance, custom reports
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface KPI {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  trend: number;
  target: number | string;
  status: 'on-track' | 'at-risk' | 'exceeded';
}

interface RevenueData {
  month: string;
  revenue: number;
  target: number;
  growth: number;
}

interface TeamPerformance {
  name: string;
  projects: number;
  revenue: number;
  satisfaction: number;
  efficiency: number;
}

export default function ExecutiveReportingDashboard() {
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const [kpis] = useState<KPI[]>([
    {
      id: '1',
      name: 'Total Revenue',
      value: '$487,250',
      unit: 'USD',
      trend: 12.5,
      target: '$500,000',
      status: 'on-track',
    },
    {
      id: '2',
      name: 'Active Projects',
      value: 24,
      unit: 'projects',
      trend: 8.3,
      target: 25,
      status: 'on-track',
    },
    {
      id: '3',
      name: 'Customer Satisfaction',
      value: '4.8',
      unit: '/5.0',
      trend: 5.2,
      target: '4.5',
      status: 'exceeded',
    },
    {
      id: '4',
      name: 'Team Utilization',
      value: '87%',
      unit: 'capacity',
      trend: -2.1,
      target: '85%',
      status: 'on-track',
    },
  ]);

  const [revenueData] = useState<RevenueData[]>([
    { month: 'Aug', revenue: 42000, target: 45000, growth: 5.2 },
    { month: 'Sep', revenue: 48500, target: 45000, growth: 15.3 },
    { month: 'Oct', revenue: 51200, target: 50000, growth: 5.6 },
    { month: 'Nov', revenue: 54800, target: 52000, growth: 7.0 },
    { month: 'Dec', revenue: 58300, target: 55000, growth: 6.4 },
    { month: 'Jan', revenue: 62100, target: 60000, growth: 6.5 },
  ]);

  const [teamPerformance] = useState<TeamPerformance[]>([
    { name: 'John Smith', projects: 8, revenue: 125000, satisfaction: 4.9, efficiency: 92 },
    { name: 'Sarah Johnson', projects: 7, revenue: 118500, satisfaction: 4.8, efficiency: 88 },
    { name: 'Mike Davis', projects: 6, revenue: 105200, satisfaction: 4.7, efficiency: 85 },
    { name: 'Emily Wilson', projects: 5, revenue: 92500, satisfaction: 4.6, efficiency: 82 },
    { name: 'David Brown', projects: 4, revenue: 78000, satisfaction: 4.5, efficiency: 80 },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-blue-100 text-blue-800';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'exceeded':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendColor = (trend: number) => {
    return trend > 0 ? 'text-green-600' : 'text-red-600';
  };

  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Executive Dashboard</h1>
              <p className="text-slate-600 mt-2">Real-time business intelligence and performance metrics</p>
            </div>
            <div className="flex gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button className="bg-blue-600 hover:bg-blue-700">📊 Export Report</Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
            <TabsTrigger value="reports">Custom Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map((kpi) => (
                <Card key={kpi.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-slate-600">{kpi.name}</p>
                        <Badge className={getStatusColor(kpi.status)}>{kpi.status}</Badge>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-slate-900">{kpi.value}</p>
                        <p className="text-sm text-slate-600">{kpi.unit}</p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <div>
                          <p className="text-xs text-slate-600">Trend</p>
                          <p className={`text-sm font-semibold ${getTrendColor(kpi.trend)}`}>
                            {kpi.trend > 0 ? '↑' : '↓'} {Math.abs(kpi.trend)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-600">Target</p>
                          <p className="text-sm font-semibold text-slate-900">{kpi.target}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Projects Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Completed</span>
                    <span className="font-semibold">18</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">In Progress</span>
                    <span className="font-semibold">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Pending</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-slate-600">Completion Rate</p>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Monthly Target</span>
                    <span className="font-semibold">$60,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Current Month</span>
                    <span className="font-semibold text-green-600">$62,100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">vs Target</span>
                    <span className="font-semibold text-green-600">+3.5%</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-slate-600">YTD Revenue</p>
                    <p className="text-2xl font-bold text-slate-900">$487.2K</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Team Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Active Team</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Avg Satisfaction</span>
                    <span className="font-semibold">4.8/5.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Utilization</span>
                    <span className="font-semibold">87%</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-slate-600">Avg Projects/Person</p>
                    <p className="text-2xl font-bold text-slate-900">6.0</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Chart */}
                <div className="space-y-4">
                  <div className="flex items-end gap-2 h-64">
                    {revenueData.map((data) => (
                      <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative w-full h-48 bg-slate-100 rounded flex items-end justify-center">
                          <div
                            className="w-1/3 bg-blue-600 rounded-t transition-all hover:bg-blue-700"
                            style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                            title={`${data.month}: $${data.revenue}`}
                          />
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{data.month}</p>
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex gap-4 justify-center pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-600 rounded" />
                      <span className="text-sm text-slate-600">Actual Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-slate-300 rounded" />
                      <span className="text-sm text-slate-600">Target</span>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 text-slate-600">Month</th>
                        <th className="text-right py-2 px-4 text-slate-600">Revenue</th>
                        <th className="text-right py-2 px-4 text-slate-600">Target</th>
                        <th className="text-right py-2 px-4 text-slate-600">vs Target</th>
                        <th className="text-right py-2 px-4 text-slate-600">Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueData.map((data) => (
                        <tr key={data.month} className="border-b hover:bg-slate-50">
                          <td className="py-2 px-4 font-semibold">{data.month}</td>
                          <td className="text-right py-2 px-4">${data.revenue.toLocaleString()}</td>
                          <td className="text-right py-2 px-4">${data.target.toLocaleString()}</td>
                          <td className={`text-right py-2 px-4 font-semibold ${data.revenue >= data.target ? 'text-green-600' : 'text-red-600'}`}>
                            {data.revenue >= data.target ? '+' : ''}{((data.revenue / data.target - 1) * 100).toFixed(1)}%
                          </td>
                          <td className="text-right py-2 px-4 text-green-600">+{data.growth}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Performance Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamPerformance.map((member, index) => (
                    <div key={member.name} className="p-4 bg-slate-50 rounded-lg border">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            #{index + 1} {member.name}
                          </p>
                          <p className="text-sm text-slate-600">{member.projects} active projects</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900">${(member.revenue / 1000).toFixed(0)}K</p>
                          <p className="text-xs text-slate-600">revenue</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-slate-600">Satisfaction</p>
                          <div className="flex items-center gap-1">
                            <p className="font-semibold">{member.satisfaction}</p>
                            <p className="text-yellow-500">★</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Efficiency</p>
                          <div className="flex items-center gap-1">
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${member.efficiency}%` }} />
                            </div>
                            <p className="text-sm font-semibold">{member.efficiency}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Report Builder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Report Type</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                      <option>Executive Summary</option>
                      <option>Financial Report</option>
                      <option>Team Performance</option>
                      <option>Project Analysis</option>
                      <option>Customer Analytics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Date Range</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                      <option>Last year</option>
                      <option>Custom range</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Include Sections</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm text-slate-700">Executive Summary</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm text-slate-700">Key Metrics & KPIs</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm text-slate-700">Revenue Analysis</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-sm text-slate-700">Team Performance</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-sm text-slate-700">Recommendations</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">📊 Generate Report</Button>
                  <Button variant="outline" className="flex-1">
                    📧 Schedule Delivery
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { name: 'Executive Summary - January 2025', date: '2025-01-31', size: '2.4 MB' },
                    { name: 'Financial Report - Q4 2024', date: '2025-01-15', size: '3.1 MB' },
                    { name: 'Team Performance - December 2024', date: '2024-12-31', size: '1.8 MB' },
                  ].map((report) => (
                    <div key={report.name} className="flex justify-between items-center p-3 bg-slate-50 rounded border">
                      <div>
                        <p className="font-semibold text-slate-900">{report.name}</p>
                        <p className="text-xs text-slate-600">{report.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600">{report.size}</span>
                        <Button variant="outline" size="sm">
                          ⬇️ Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

