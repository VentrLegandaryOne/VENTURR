/**
 * Advanced Analytics Export System
 * PDF/Excel report generation with charts, tables, and custom branding
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  format: 'pdf' | 'excel' | 'both';
  estimatedSize: string;
}

interface ExportJob {
  id: string;
  name: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  completedAt?: Date;
  fileSize?: string;
  downloadUrl?: string;
}

export default function AnalyticsExportSystem() {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');

  const [templates] = useState<ReportTemplate[]>([
    {
      id: '1',
      name: 'Executive Summary',
      description: 'High-level overview with key metrics and trends',
      sections: ['Key Metrics', 'Revenue Trends', 'Team Performance', 'Recommendations'],
      format: 'both',
      estimatedSize: '2.4 MB',
    },
    {
      id: '2',
      name: 'Financial Report',
      description: 'Detailed financial analysis with profitability breakdown',
      sections: ['Revenue', 'Expenses', 'Profit Margins', 'Cash Flow', 'Forecasts'],
      format: 'both',
      estimatedSize: '3.8 MB',
    },
    {
      id: '3',
      name: 'Team Performance',
      description: 'Individual and team metrics with productivity analysis',
      sections: ['Team Metrics', 'Individual Performance', 'Productivity', 'Goals Progress'],
      format: 'both',
      estimatedSize: '2.1 MB',
    },
    {
      id: '4',
      name: 'Project Analysis',
      description: 'Detailed project metrics and completion analysis',
      sections: ['Project Overview', 'Timeline Analysis', 'Resource Utilization', 'Quality Metrics'],
      format: 'both',
      estimatedSize: '2.9 MB',
    },
    {
      id: '5',
      name: 'Client Report',
      description: 'Client-facing report with project progress and deliverables',
      sections: ['Project Status', 'Timeline', 'Deliverables', 'Next Steps'],
      format: 'pdf',
      estimatedSize: '1.8 MB',
    },
    {
      id: '6',
      name: 'Custom Report',
      description: 'Build your own report with selected sections',
      sections: ['Custom Sections'],
      format: 'both',
      estimatedSize: 'Variable',
    },
  ]);

  const [exportJobs] = useState<ExportJob[]>([
    {
      id: '1',
      name: 'Executive Summary - November 2025',
      format: 'PDF',
      status: 'completed',
      progress: 100,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      fileSize: '2.4 MB',
      downloadUrl: '#',
    },
    {
      id: '2',
      name: 'Financial Report - Q4 2025',
      format: 'Excel',
      status: 'completed',
      progress: 100,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 23.5 * 60 * 60 * 1000),
      fileSize: '3.8 MB',
      downloadUrl: '#',
    },
    {
      id: '3',
      name: 'Team Performance - October 2025',
      format: 'PDF',
      status: 'completed',
      progress: 100,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 6.9 * 24 * 60 * 60 * 1000),
      fileSize: '2.1 MB',
      downloadUrl: '#',
    },
    {
      id: '4',
      name: 'Project Analysis - November 2025',
      format: 'Excel',
      status: 'processing',
      progress: 65,
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
    },
  ]);

  const [chartData] = useState([
    { month: 'Jan', revenue: 85000, expenses: 52000, profit: 33000 },
    { month: 'Feb', revenue: 92000, expenses: 55000, profit: 37000 },
    { month: 'Mar', revenue: 78000, expenses: 48000, profit: 30000 },
    { month: 'Apr', revenue: 105000, expenses: 62000, profit: 43000 },
    { month: 'May', revenue: 125000, expenses: 72000, profit: 53000 },
    { month: 'Jun', revenue: 118000, expenses: 70000, profit: 48000 },
  ]);

  const [pieData] = useState([
    { name: 'Labor', value: 45 },
    { name: 'Materials', value: 30 },
    { name: 'Equipment', value: 15 },
    { name: 'Other', value: 10 },
  ]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const handleGenerateReport = (templateId: string) => {
    setSelectedTemplate(templateId);
    // Simulate report generation
    console.log(`Generating ${exportFormat} report from template ${templateId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Analytics Export System</h1>
          <p className="text-slate-600 mt-2">Generate professional reports in PDF or Excel format</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="templates">Report Templates</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="jobs">Export Jobs</TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-600 mb-2">Sections:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.sections.map((section, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {section}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-xs text-slate-600">Estimated Size: {template.estimatedSize}</p>
                    </div>

                    <div className="flex gap-2">
                      {(template.format === 'both' || template.format === 'pdf') && (
                        <Button
                          size="sm"
                          className="flex-1 bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            setExportFormat('pdf');
                            handleGenerateReport(template.id);
                          }}
                        >
                          📄 PDF
                        </Button>
                      )}
                      {(template.format === 'both' || template.format === 'excel') && (
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setExportFormat('excel');
                            handleGenerateReport(template.id);
                          }}
                        >
                          📊 Excel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Preview - Financial Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Revenue Chart */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Revenue vs Expenses</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                      <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                      <Bar dataKey="profit" fill="#10b981" name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Profit Trend */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Profit Trend</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                      <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Expense Breakdown */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Expense Breakdown</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary Table */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Monthly Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-4 py-2 text-left">Month</th>
                          <th className="px-4 py-2 text-right">Revenue</th>
                          <th className="px-4 py-2 text-right">Expenses</th>
                          <th className="px-4 py-2 text-right">Profit</th>
                          <th className="px-4 py-2 text-right">Margin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.map((row, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="px-4 py-2">{row.month}</td>
                            <td className="px-4 py-2 text-right">${(row.revenue / 1000).toFixed(0)}K</td>
                            <td className="px-4 py-2 text-right">${(row.expenses / 1000).toFixed(0)}K</td>
                            <td className="px-4 py-2 text-right font-semibold text-green-600">${(row.profit / 1000).toFixed(0)}K</td>
                            <td className="px-4 py-2 text-right">{((row.profit / row.revenue) * 100).toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 bg-red-600 hover:bg-red-700">📄 Download PDF</Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">📊 Download Excel</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4">
            {exportJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{job.name}</h3>
                        <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">Format: {job.format}</p>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-600">Progress</span>
                          <span className="text-xs font-semibold text-slate-900">{job.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              job.status === 'completed'
                                ? 'bg-green-600'
                                : job.status === 'failed'
                                  ? 'bg-red-600'
                                  : 'bg-blue-600'
                            }`}
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Created: {job.createdAt.toLocaleString()}</span>
                        {job.completedAt && <span>Completed: {job.completedAt.toLocaleString()}</span>}
                        {job.fileSize && <span>Size: {job.fileSize}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {job.status === 'completed' && (
                        <>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            ⬇ Download
                          </Button>
                          <Button size="sm" variant="outline">
                            📧 Email
                          </Button>
                        </>
                      )}
                      {job.status === 'processing' && (
                        <Button size="sm" variant="outline" disabled>
                          Processing...
                        </Button>
                      )}
                      {job.status === 'failed' && (
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          🔄 Retry
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        ✕ Delete
                      </Button>
                    </div>
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

