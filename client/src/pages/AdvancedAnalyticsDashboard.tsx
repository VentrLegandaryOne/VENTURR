/**
 * Advanced Analytics & Reporting Dashboard
 * Revenue trends, team productivity metrics, project profitability analysis
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RevenueData {
  month: string;
  revenue: number;
  target: number;
  projects: number;
}

interface ProductivityMetric {
  teamMember: string;
  projectsCompleted: number;
  averageCompletion: number;
  efficiency: number;
  satisfaction: number;
}

interface ProjectProfitability {
  projectName: string;
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
  status: string;
}

export default function AdvancedAnalyticsDashboard() {
  const [revenueData] = useState<RevenueData[]>([
    { month: 'Jan', revenue: 45000, target: 40000, projects: 3 },
    { month: 'Feb', revenue: 52000, target: 40000, projects: 4 },
    { month: 'Mar', revenue: 48000, target: 40000, projects: 3 },
    { month: 'Apr', revenue: 61000, target: 50000, projects: 5 },
    { month: 'May', revenue: 58000, target: 50000, projects: 4 },
    { month: 'Jun', revenue: 72000, target: 50000, projects: 6 },
  ]);

  const [productivityMetrics] = useState<ProductivityMetric[]>([
    {
      teamMember: 'John Smith',
      projectsCompleted: 12,
      averageCompletion: 18,
      efficiency: 94,
      satisfaction: 4.8,
    },
    {
      teamMember: 'Sarah Johnson',
      projectsCompleted: 8,
      averageCompletion: 22,
      efficiency: 87,
      satisfaction: 4.6,
    },
    {
      teamMember: 'Mike Chen',
      projectsCompleted: 10,
      averageCompletion: 20,
      efficiency: 91,
      satisfaction: 4.7,
    },
    {
      teamMember: 'Lisa Anderson',
      projectsCompleted: 6,
      projectsCompleted: 6,
      averageCompletion: 25,
      efficiency: 85,
      satisfaction: 4.5,
    },
  ]);

  const [projectProfitability] = useState<ProjectProfitability[]>([
    {
      projectName: 'Smith Residence',
      revenue: 15000,
      costs: 8500,
      profit: 6500,
      margin: 43.3,
      status: 'completed',
    },
    {
      projectName: 'Johnson Commercial',
      revenue: 45000,
      costs: 28000,
      profit: 17000,
      margin: 37.8,
      status: 'in_progress',
    },
    {
      projectName: 'Williams Industrial',
      revenue: 52000,
      costs: 31000,
      profit: 21000,
      margin: 40.4,
      status: 'completed',
    },
    {
      projectName: 'Davis Residential',
      revenue: 18000,
      costs: 9500,
      profit: 8500,
      margin: 47.2,
      status: 'completed',
    },
  ]);

  const [timeRange, setTimeRange] = useState('6m');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const averageRevenue = totalRevenue / revenueData.length;
  const totalProfit = projectProfitability.reduce((sum, p) => sum + p.profit, 0);
  const averageMargin =
    projectProfitability.reduce((sum, p) => sum + p.margin, 0) / projectProfitability.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Analytics & Reporting</h1>
          <p className="text-slate-600">Comprehensive business intelligence and insights</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          {['1m', '3m', '6m', '1y', 'all'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              onClick={() => setTimeRange(range)}
              className="capitalize"
            >
              {range === '1m' && '1 Month'}
              {range === '3m' && '3 Months'}
              {range === '6m' && '6 Months'}
              {range === '1y' && '1 Year'}
              {range === 'all' && 'All Time'}
            </Button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-slate-600 mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-slate-900">
              ${(totalRevenue / 1000).toFixed(0)}K
            </p>
            <p className="text-sm text-green-600 mt-2">↑ 18% vs last period</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-600 mb-2">Total Profit</p>
            <p className="text-3xl font-bold text-green-600">
              ${(totalProfit / 1000).toFixed(0)}K
            </p>
            <p className="text-sm text-slate-600 mt-2">
              {averageMargin.toFixed(1)}% average margin
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-600 mb-2">Avg Monthly Revenue</p>
            <p className="text-3xl font-bold text-slate-900">
              ${(averageRevenue / 1000).toFixed(0)}K
            </p>
            <p className="text-sm text-slate-600 mt-2">
              {revenueData.filter((d) => d.revenue > d.target).length} months above target
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-600 mb-2">Projects Completed</p>
            <p className="text-3xl font-bold text-slate-900">
              {revenueData.reduce((sum, d) => sum + d.projects, 0)}
            </p>
            <p className="text-sm text-slate-600 mt-2">
              {(
                revenueData.reduce((sum, d) => sum + d.projects, 0) / revenueData.length
              ).toFixed(1)} per month
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
            <TabsTrigger value="productivity">Team Productivity</TabsTrigger>
            <TabsTrigger value="profitability">Project Profitability</TabsTrigger>
          </TabsList>

          {/* Revenue Trends */}
          <TabsContent value="revenue" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Revenue vs Target</h3>

              {/* Chart */}
              <div className="flex items-end justify-between h-64 gap-2 mb-6">
                {revenueData.map((data) => {
                  const revenueHeight = (data.revenue / maxRevenue) * 100;
                  const targetHeight = (data.target / maxRevenue) * 100;

                  return (
                    <div key={data.month} className="flex-1 flex flex-col items-center">
                      <div className="relative w-full h-48 flex items-end justify-center gap-1 mb-2">
                        {/* Target bar */}
                        <div
                          className="w-2 bg-orange-300 rounded-t opacity-50"
                          style={{ height: `${targetHeight}%` }}
                        />
                        {/* Revenue bar */}
                        <div
                          className={`w-4 rounded-t ${
                            data.revenue >= data.target ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ height: `${revenueHeight}%` }}
                        />
                      </div>
                      <p className="text-sm font-medium text-slate-900">{data.month}</p>
                      <p className="text-xs text-slate-600">
                        ${(data.revenue / 1000).toFixed(0)}K
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex gap-6 justify-center pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500" />
                  <span className="text-sm text-slate-600">Actual Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-300" />
                  <span className="text-sm text-slate-600">Target</span>
                </div>
              </div>
            </Card>

            {/* Monthly Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Monthly Breakdown</h3>
              <div className="space-y-3">
                {revenueData.map((data) => (
                  <div key={data.month} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{data.month}</p>
                      <p className="text-sm text-slate-600">{data.projects} projects</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        ${(data.revenue / 1000).toFixed(0)}K
                      </p>
                      <p
                        className={`text-sm ${
                          data.revenue >= data.target ? 'text-green-600' : 'text-orange-600'
                        }`}
                      >
                        {data.revenue >= data.target ? '+' : ''}
                        {(((data.revenue - data.target) / data.target) * 100).toFixed(0)}% vs target
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Team Productivity */}
          <TabsContent value="productivity" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Team Performance Metrics</h3>

              <div className="space-y-4">
                {productivityMetrics.map((metric) => (
                  <div
                    key={metric.teamMember}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedMetric === metric.teamMember
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() =>
                      setSelectedMetric(
                        selectedMetric === metric.teamMember ? null : metric.teamMember
                      )
                    }
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-900">{metric.teamMember}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⭐</span>
                        <span className="font-bold text-slate-900">{metric.satisfaction}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-slate-600">Projects Completed</p>
                        <p className="text-lg font-bold text-slate-900">
                          {metric.projectsCompleted}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Avg Completion</p>
                        <p className="text-lg font-bold text-slate-900">
                          {metric.averageCompletion} days
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Efficiency</p>
                        <p className="text-lg font-bold text-slate-900">{metric.efficiency}%</p>
                      </div>
                    </div>

                    {/* Efficiency bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${metric.efficiency}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Productivity Insights */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Insights</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900">
                    ✓ John Smith is the top performer with 94% efficiency
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    ℹ Average team efficiency is 89%
                  </p>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm font-medium text-orange-900">
                    ⚠ Lisa Anderson could benefit from additional training
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Project Profitability */}
          <TabsContent value="profitability" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Project Profitability Analysis</h3>

              <div className="space-y-3">
                {projectProfitability.map((project) => (
                  <div key={project.projectName} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">{project.projectName}</h4>
                        <Badge variant="outline">{project.status}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          ${(project.profit / 1000).toFixed(1)}K
                        </p>
                        <p className="text-sm text-slate-600">{project.margin.toFixed(1)}% margin</p>
                      </div>
                    </div>

                    {/* Profit breakdown */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 bg-blue-500 h-3 rounded" style={{ width: `${(project.revenue / (project.revenue + project.costs)) * 100}%` }} />
                      <div className="flex-1 bg-red-500 h-3 rounded" style={{ width: `${(project.costs / (project.revenue + project.costs)) * 100}%` }} />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Revenue</p>
                        <p className="font-semibold text-slate-900">
                          ${(project.revenue / 1000).toFixed(1)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Costs</p>
                        <p className="font-semibold text-slate-900">
                          ${(project.costs / 1000).toFixed(1)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Profit</p>
                        <p className="font-semibold text-green-600">
                          ${(project.profit / 1000).toFixed(1)}K
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Export Reports */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Generate Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button className="bg-blue-600 hover:bg-blue-700">📊 Export as PDF</Button>
                <Button className="bg-green-600 hover:bg-green-700">📈 Export as Excel</Button>
                <Button className="bg-purple-600 hover:bg-purple-700">📧 Email Report</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

