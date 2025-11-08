/**
 * Advanced Analytics Dashboard
 * Interactive charts, trend analysis, and predictive insights
 */

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Download,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface ChartData {
  label: string;
  value: number;
  trend?: number;
}

interface AnalyticsMetric {
  name: string;
  value: number | string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
}

type TimeRange = '7d' | '30d' | '90d' | '1y';
type MetricType = 'revenue' | 'users' | 'quotes' | 'projects';

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['revenue', 'users']);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const metricsQuery = trpc.advancedFeatures.pricing.getMetrics.useQuery();
  const forecastQuery = trpc.advancedFeatures.pricing.getRevenueForecast.useQuery({ months: 12 });

  // Generate mock analytics data based on time range
  const generateChartData = (range: TimeRange): ChartData[] => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const data: ChartData[] = [];

    for (let i = 0; i < days; i++) {
      const baseValue = 5000 + Math.random() * 3000;
      const trend = Math.random() > 0.5 ? 1 : -1;
      data.push({
        label: new Date(Date.now() - (days - i) * 86400000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        value: Math.round(baseValue + trend * Math.random() * 500),
        trend: trend > 0 ? Math.random() * 5 : -Math.random() * 5,
      });
    }

    return data;
  };

  const revenueData = useMemo(() => generateChartData(timeRange), [timeRange]);

  const metrics: AnalyticsMetric[] = [
    {
      name: 'Total Revenue',
      value: '$45,230',
      change: 12.5,
      changeType: 'increase',
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
    },
    {
      name: 'Active Users',
      value: '1,250',
      change: 8.2,
      changeType: 'increase',
      icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
    },
    {
      name: 'Conversion Rate',
      value: '72%',
      change: 3.1,
      changeType: 'increase',
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
    },
    {
      name: 'Avg. Project Value',
      value: '$18,500',
      change: 2.8,
      changeType: 'decrease',
      icon: <TrendingDown className="w-6 h-6 text-orange-600" />,
    },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const renderChart = (type: 'line' | 'bar' | 'pie') => {
    const maxValue = Math.max(...revenueData.map((d) => d.value));
    const chartHeight = 300;

    if (type === 'line') {
      return (
        <div className="w-full h-80 flex items-end gap-1 px-4 py-8 bg-gradient-to-b from-blue-50 to-transparent rounded-lg">
          {revenueData.slice(-20).map((data, idx) => {
            const height = (data.value / maxValue) * (chartHeight - 40);
            return (
              <div
                key={idx}
                className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t hover:opacity-80 transition-opacity group relative"
                style={{ height: `${height}px`, minHeight: '4px' }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ${data.value.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (type === 'bar') {
      return (
        <div className="w-full space-y-3 p-4">
          {[
            { label: 'Quotes Generated', value: 342, color: 'from-blue-500' },
            { label: 'Projects Completed', value: 287, color: 'from-green-500' },
            { label: 'Active Projects', value: 156, color: 'from-purple-500' },
            { label: 'Pending Approvals', value: 43, color: 'from-orange-500' },
          ].map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-sm font-bold text-gray-900">{item.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-gradient-to-r ${item.color} to-transparent h-2 rounded-full`}
                  style={{ width: `${(item.value / 342) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="relative w-64 h-64">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Pie chart segments */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="20"
              strokeDasharray="62.8 314"
              transform="rotate(-90 50 50)"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#10b981"
              strokeWidth="20"
              strokeDasharray="47.1 314"
              strokeDashoffset="-62.8"
              transform="rotate(-90 50 50)"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#a855f7"
              strokeWidth="20"
              strokeDasharray="47.1 314"
              strokeDashoffset="-109.9"
              transform="rotate(-90 50 50)"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="20"
              strokeDasharray="157 314"
              strokeDashoffset="-157"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">100%</p>
              <p className="text-sm text-gray-600">Total Distribution</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 p-8 relative">
      {/* Futuristic Chequered Background */}
      <div className="background-glow fixed inset-0 z-0" />

      <div className="relative z-2 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Advanced Analytics</h1>
                <p className="text-gray-600 mt-1">Comprehensive insights and predictive analysis</p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              variant={timeRange === range ? 'default' : 'outline'}
              className={
                timeRange === range
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
                  : ''
              }
            >
              {range === '7d' && 'Last 7 Days'}
              {range === '30d' && 'Last 30 Days'}
              {range === '90d' && 'Last 90 Days'}
              {range === '1y' && 'Last Year'}
            </Button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, idx) => (
            <Card
              key={idx}
              className="backdrop-blur-xl bg-white/95 border-white/20 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>{metric.icon}</div>
                <Badge
                  className={
                    metric.changeType === 'increase'
                      ? 'bg-green-100 text-green-800'
                      : metric.changeType === 'decrease'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {metric.changeType === 'increase' ? '+' : ''}
                  {metric.change}%
                </Badge>
              </div>
              <p className="text-gray-600 text-sm mb-2">{metric.name}</p>
              <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend Chart */}
          <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
              <LineChart className="w-5 h-5 text-blue-600" />
            </div>
            {renderChart('line')}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-600">Min</p>
                <p className="text-lg font-bold text-gray-900">
                  ${Math.min(...revenueData.map((d) => d.value)).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Avg</p>
                <p className="text-lg font-bold text-gray-900">
                  ${Math.round(revenueData.reduce((a, b) => a + b.value, 0) / revenueData.length).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Max</p>
                <p className="text-lg font-bold text-gray-900">
                  ${Math.max(...revenueData.map((d) => d.value)).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Activity Distribution */}
          <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Activity Distribution</h2>
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            {renderChart('pie')}
            <div className="mt-4 space-y-2">
              {[
                { label: 'Quotes', color: 'bg-blue-500', percent: 35 },
                { label: 'Projects', color: 'bg-green-500', percent: 30 },
                { label: 'Compliance', color: 'bg-purple-500', percent: 20 },
                { label: 'Other', color: 'bg-orange-500', percent: 15 },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <span className="ml-auto text-sm font-bold text-gray-900">{item.percent}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Performance Metrics</h2>
            <BarChart3 className="w-5 h-5 text-orange-600" />
          </div>
          {renderChart('bar')}
        </Card>

        {/* Predictive Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Predictive Insights</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-900 mb-1">Revenue Forecast</p>
                <p className="text-2xl font-bold text-green-600">+$52,500</p>
                <p className="text-xs text-green-700 mt-1">Projected for next month (↑ 16%)</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-1">User Growth</p>
                <p className="text-2xl font-bold text-blue-600">+185 users</p>
                <p className="text-xs text-blue-700 mt-1">Expected new users next month</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <p className="text-sm font-semibold text-purple-900 mb-1">Conversion Trend</p>
                <p className="text-2xl font-bold text-purple-600">+2.3%</p>
                <p className="text-xs text-purple-700 mt-1">Improvement predicted</p>
              </div>
            </div>
          </Card>

          <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recommendations</h2>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-sm font-semibold text-yellow-900">Increase Pricing</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Market analysis suggests 5-10% price increase is viable
                </p>
              </div>
              <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                <p className="text-sm font-semibold text-blue-900">Focus on High-Value Projects</p>
                <p className="text-xs text-blue-700 mt-1">
                  35% higher margins on complex projects
                </p>
              </div>
              <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                <p className="text-sm font-semibold text-green-900">Expand Team Capacity</p>
                <p className="text-xs text-green-700 mt-1">
                  Projected demand increase requires 2-3 new team members
                </p>
              </div>
              <div className="p-3 bg-purple-50 border-l-4 border-purple-400 rounded">
                <p className="text-sm font-semibold text-purple-900">Seasonal Pricing Strategy</p>
                <p className="text-xs text-purple-700 mt-1">
                  Implement dynamic pricing for peak seasons
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

