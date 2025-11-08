/**
 * Advanced Reporting UI
 * Report builder, scheduled delivery, export functionality, custom dashboard widgets
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Report {
  id: string;
  name: string;
  type: 'revenue' | 'team' | 'sales' | 'operational';
  lastGenerated: Date;
  schedule: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'never';
  recipients: string[];
  status: 'scheduled' | 'draft' | 'generated';
}

interface ReportData {
  revenue: Array<{ month: string; value: number }>;
  team: Array<{ name: string; hours: number; projects: number }>;
  sales: Array<{ category: string; value: number }>;
  operational: Array<{ metric: string; target: number; actual: number }>;
}

export default function AdvancedReportingUI() {
  const [activeTab, setActiveTab] = useState('reports');
  const [showBuilder, setShowBuilder] = useState(false);

  const [reports] = useState<Report[]>([
    {
      id: '1',
      name: 'Monthly Revenue Report',
      type: 'revenue',
      lastGenerated: new Date(Date.now() - 24 * 60 * 60 * 1000),
      schedule: 'monthly',
      recipients: ['manager@company.com', 'owner@company.com'],
      status: 'scheduled',
    },
    {
      id: '2',
      name: 'Team Performance Report',
      type: 'team',
      lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      schedule: 'weekly',
      recipients: ['manager@company.com'],
      status: 'scheduled',
    },
    {
      id: '3',
      name: 'Sales Analysis Report',
      type: 'sales',
      lastGenerated: new Date(),
      schedule: 'never',
      recipients: [],
      status: 'draft',
    },
  ]);

  const [reportData] = useState<ReportData>({
    revenue: [
      { month: 'Jan', value: 85000 },
      { month: 'Feb', value: 92000 },
      { month: 'Mar', value: 78000 },
      { month: 'Apr', value: 105000 },
      { month: 'May', value: 125000 },
      { month: 'Jun', value: 118000 },
    ],
    team: [
      { name: 'John Smith', hours: 160, projects: 8 },
      { name: 'Sarah Johnson', hours: 155, projects: 7 },
      { name: 'Mike Davis', hours: 150, projects: 6 },
      { name: 'Lisa Anderson', hours: 165, projects: 9 },
    ],
    sales: [
      { category: 'Residential', value: 45 },
      { category: 'Commercial', value: 30 },
      { category: 'Industrial', value: 15 },
      { category: 'Other', value: 10 },
    ],
    operational: [
      { metric: 'On-time Delivery', target: 95, actual: 92 },
      { metric: 'Quality Score', target: 90, actual: 88 },
      { metric: 'Customer Satisfaction', target: 4.5, actual: 4.6 },
    ],
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Advanced Reporting</h1>
            <p className="text-slate-600 mt-2">Create, schedule, and export custom reports</p>
          </div>
          <Button onClick={() => setShowBuilder(!showBuilder)} className="bg-blue-600 hover:bg-blue-700">
            {showBuilder ? '✕ Close' : '+ New Report'}
          </Button>
        </div>

        {/* Report Builder */}
        {showBuilder && (
          <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>Report Builder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Report Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Q3 Performance Report"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Report Type</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option>Revenue</option>
                    <option>Team Performance</option>
                    <option>Sales Analysis</option>
                    <option>Operational</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Schedule</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option>Never</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Recipients</label>
                  <input
                    type="text"
                    placeholder="email@company.com"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Select Widgets</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Revenue Chart', 'Team Performance', 'Sales Breakdown', 'Metrics Summary', 'Trend Analysis', 'Forecasts', 'Alerts', 'Custom Metrics'].map((widget) => (
                    <label key={widget} className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-white cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm text-slate-700">{widget}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowBuilder(false)}>
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Create Report</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="reports">My Reports</TabsTrigger>
            <TabsTrigger value="preview">Report Preview</TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="capitalize">
                          {report.type}
                        </Badge>
                        <Badge className={report.status === 'scheduled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Schedule</p>
                      <p className="font-semibold capitalize">{report.schedule}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Recipients</p>
                      <p className="font-semibold">{report.recipients.length} email(s)</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Last Generated</p>
                      <p className="font-semibold">{report.lastGenerated.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Status</p>
                      <p className="font-semibold capitalize">{report.status}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Edit
                    </Button>
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Download
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend (6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sales Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={reportData.sales} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                        {reportData.sales.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.team}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="hours" fill="#3b82f6" name="Hours" />
                      <Bar dataKey="projects" fill="#10b981" name="Projects" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Operational Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Operational Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.operational.map((metric, idx) => (
                    <div key={idx} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                      <div>
                        <p className="font-medium text-slate-900">{metric.metric}</p>
                        <p className="text-sm text-slate-600">Target: {metric.target}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">{metric.actual}</p>
                        <p className={`text-sm font-medium ${metric.actual >= metric.target ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.actual >= metric.target ? '✓ On Target' : '✗ Below Target'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle>Export Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button className="bg-blue-600 hover:bg-blue-700">📄 Download as PDF</Button>
                  <Button variant="outline">📊 Download as Excel</Button>
                  <Button variant="outline">📧 Email Report</Button>
                  <Button variant="outline">🔗 Share Link</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

