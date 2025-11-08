import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Fetch analytics data
  const { data: analyticsData, isLoading } = trpc.analytics.getMetrics.useQuery({
    timeRange,
    metrics: ['revenue', 'quotes', 'conversion', 'team_performance', 'customer_satisfaction']
  });

  const { data: forecastData } = trpc.analytics.getForecast.useQuery({
    metric: selectedMetric,
    days: parseInt(timeRange)
  });

  const { data: teamMetrics } = trpc.analytics.getTeamMetrics.useQuery({});

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Chequered Background */}
      <div className="background-glow fixed inset-0 z-0 opacity-30"></div>

      {/* Main Content */}
      <div className="relative z-2 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Real-time insights and predictive analytics for your business</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-4 mb-8">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                onClick={() => setTimeRange(range)}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : 'Last Year'}
              </Button>
            ))}
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="backdrop-blur-md bg-white/80 border-white/20 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">${analyticsData?.revenue?.total?.toLocaleString()}</div>
                <p className="text-xs text-green-600 mt-2">+{analyticsData?.revenue?.growth}% vs last period</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-white/80 border-white/20 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Quotes Generated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{analyticsData?.quotes?.total}</div>
                <p className="text-xs text-green-600 mt-2">+{analyticsData?.quotes?.growth}% vs last period</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-white/80 border-white/20 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{analyticsData?.conversion?.rate}%</div>
                <p className="text-xs text-green-600 mt-2">+{analyticsData?.conversion?.improvement}% improvement</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-white/80 border-white/20 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Project Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">${analyticsData?.avgProjectValue?.toLocaleString()}</div>
                <p className="text-xs text-green-600 mt-2">+${analyticsData?.avgProjectValueGrowth?.toLocaleString()} vs last period</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Trend */}
            <Card className="backdrop-blur-md bg-white/80 border-white/20">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData?.revenueTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quote Conversion Funnel */}
            <Card className="backdrop-blur-md bg-white/80 border-white/20">
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Quote to project conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData?.conversionFunnel || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" />
                    <Bar dataKey="conversion" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Team Performance */}
            <Card className="backdrop-blur-md bg-white/80 border-white/20">
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Revenue per team member</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMetrics?.map((member: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">${member.revenue?.toLocaleString()}</p>
                        <p className="text-sm text-green-600">+{member.growth}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Satisfaction */}
            <Card className="backdrop-blur-md bg-white/80 border-white/20">
              <CardHeader>
                <CardTitle>Customer Satisfaction</CardTitle>
                <CardDescription>Satisfaction by project type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData?.satisfactionBreakdown || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData?.satisfactionBreakdown?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Predictive Insights */}
          <Card className="backdrop-blur-md bg-white/80 border-white/20">
            <CardHeader>
              <CardTitle>Predictive Insights</CardTitle>
              <CardDescription>AI-powered forecasts and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Revenue Forecast</h4>
                  <p className="text-2xl font-bold text-blue-600">${forecastData?.revenueForecast?.toLocaleString()}</p>
                  <p className="text-sm text-blue-700 mt-2">Projected for next {timeRange}</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Churn Risk</h4>
                  <p className="text-2xl font-bold text-green-600">{forecastData?.churnRisk}%</p>
                  <p className="text-sm text-green-700 mt-2">Low risk - stable customer base</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">Upsell Opportunities</h4>
                  <p className="text-2xl font-bold text-purple-600">{forecastData?.upsellOpportunities}</p>
                  <p className="text-sm text-purple-700 mt-2">Potential revenue: ${forecastData?.potentialRevenue?.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">🤖 AI Recommendations</h4>
                <ul className="space-y-2 text-sm text-amber-800">
                  {forecastData?.recommendations?.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

