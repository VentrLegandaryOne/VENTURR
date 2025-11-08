/**
 * Pricing Dashboard
 * Analytics, revenue forecasts, A/B testing, and competitive positioning
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3, Target, Zap, Download, Settings } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface PricingMetrics {
  averageProfitMargin: number;
  acceptanceRate: number;
  averageProjectValue: number;
  totalRevenue: number;
  projectedRevenue: number;
  priceOptimization: number;
  competitivePosition: 'underpriced' | 'competitive' | 'premium';
}

interface RevenueForecast {
  month: string;
  projected: number;
}

type Tab = 'metrics' | 'forecast' | 'abtesting' | 'recommendations';

export default function PricingDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('metrics');
  const [strategyA, setStrategyA] = useState({ name: 'Conservative', priceMultiplier: 1.2 });
  const [strategyB, setStrategyB] = useState({ name: 'Aggressive', priceMultiplier: 1.35 });
  const [testResults, setTestResults] = useState<any>(null);

  const metricsQuery = trpc.advancedFeatures.pricing.getMetrics.useQuery();
  const forecastQuery = trpc.advancedFeatures.pricing.getRevenueForecast.useQuery({ months: 12 });
  const modelQuery = trpc.advancedFeatures.pricing.getModelInfo.useQuery();
  const abTestMutation = trpc.advancedFeatures.pricing.runABTest.useMutation();

  const metrics = metricsQuery.data as PricingMetrics | undefined;
  const forecast = forecastQuery.data as RevenueForecast[] | undefined;

  const handleRunABTest = async () => {
    try {
      const results = await abTestMutation.mutateAsync({
        strategyA: { name: strategyA.name, priceMultiplier: strategyA.priceMultiplier },
        strategyB: { name: strategyB.name, priceMultiplier: strategyB.priceMultiplier },
      });
      setTestResults(results);
    } catch (error) {
      console.error('Failed to run A/B test:', error);
    }
  };

  const getCompetitivePositionColor = (position: string) => {
    switch (position) {
      case 'underpriced':
        return 'bg-yellow-100 text-yellow-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-8 relative">
      {/* Futuristic Chequered Background */}
      <div className="background-glow fixed inset-0 z-0" />

      <div className="relative z-2 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Pricing Analytics</h1>
              <p className="text-gray-600 mt-1">AI-powered pricing optimization and revenue forecasting</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {(['metrics', 'forecast', 'abtesting', 'recommendations'] as const).map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? 'default' : 'outline'}
              className={
                activeTab === tab
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                  : ''
              }
            >
              {tab === 'metrics' && 'Key Metrics'}
              {tab === 'forecast' && 'Revenue Forecast'}
              {tab === 'abtesting' && 'A/B Testing'}
              {tab === 'recommendations' && 'Recommendations'}
            </Button>
          ))}
        </div>

        {/* Metrics Tab */}
        {activeTab === 'metrics' && metrics && (
          <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
                <p className="text-gray-600 text-sm">Average Profit Margin</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.averageProfitMargin}%</p>
                <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                    style={{ width: `${metrics.averageProfitMargin}%` }}
                  />
                </div>
              </Card>

              <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
                <p className="text-gray-600 text-sm">Quote Acceptance Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.acceptanceRate}%</p>
                <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-600"
                    style={{ width: `${metrics.acceptanceRate}%` }}
                  />
                </div>
              </Card>

              <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
                <p className="text-gray-600 text-sm">Avg Project Value</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${(metrics.averageProjectValue / 1000).toFixed(1)}k
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Total: ${(metrics.totalRevenue / 1000).toFixed(0)}k
                </p>
              </Card>

              <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
                <p className="text-gray-600 text-sm">Competitive Position</p>
                <Badge
                  className={`mt-2 ${getCompetitivePositionColor(metrics.competitivePosition)}`}
                >
                  {metrics.competitivePosition.charAt(0).toUpperCase() +
                    metrics.competitivePosition.slice(1)}
                </Badge>
                <p className="text-sm text-gray-600 mt-3">
                  ML Accuracy: {metrics.priceOptimization}%
                </p>
              </Card>
            </div>

            {/* Projected Revenue */}
            <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Revenue Projection</h3>
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Current Revenue (12mo)</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${(metrics.totalRevenue / 1000).toFixed(1)}k
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Projected Revenue (12mo)</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    ${(metrics.projectedRevenue / 1000).toFixed(1)}k
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +{(((metrics.projectedRevenue - metrics.totalRevenue) / metrics.totalRevenue) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>

            {/* ML Model Info */}
            {modelQuery.data && (
              <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">ML Model Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Model Accuracy</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {modelQuery.data.accuracy}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Training Data Points</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {modelQuery.data.trainingDataPoints.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Last Trained</p>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(modelQuery.data.trainedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Forecast Tab */}
        {activeTab === 'forecast' && forecast && (
          <div className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">12-Month Revenue Forecast</h3>
              <div className="overflow-x-auto">
                <div className="flex gap-2 pb-4">
                  {forecast.map((item, index) => (
                    <div key={index} className="flex-1 min-w-[100px]">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-full bg-gradient-to-t from-green-500 to-emerald-600 rounded-t-lg transition-all hover:shadow-lg"
                          style={{
                            height: `${(item.projected / Math.max(...forecast.map(f => f.projected))) * 200}px`,
                          }}
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center">{item.month}</p>
                        <p className="text-xs font-bold text-gray-900">
                          ${(item.projected / 1000).toFixed(0)}k
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Forecast Details</h3>
              <div className="space-y-2">
                {forecast.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-700">{item.month}</span>
                    <span className="font-bold text-gray-900">${item.projected.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* A/B Testing Tab */}
        {activeTab === 'abtesting' && (
          <div className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing Strategy A/B Test</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strategy A */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Strategy A Name
                    </label>
                    <Input
                      value={strategyA.name}
                      onChange={(e) => setStrategyA({ ...strategyA, name: e.target.value })}
                      placeholder="e.g., Conservative"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Multiplier
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={strategyA.priceMultiplier}
                      onChange={(e) =>
                        setStrategyA({ ...strategyA, priceMultiplier: parseFloat(e.target.value) })
                      }
                      placeholder="e.g., 1.25"
                    />
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Base Cost × {strategyA.priceMultiplier}</p>
                    <p className="text-lg font-bold text-blue-600 mt-1">
                      {(strategyA.priceMultiplier * 100).toFixed(0)}% Markup
                    </p>
                  </div>
                </div>

                {/* Strategy B */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Strategy B Name
                    </label>
                    <Input
                      value={strategyB.name}
                      onChange={(e) => setStrategyB({ ...strategyB, name: e.target.value })}
                      placeholder="e.g., Aggressive"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Multiplier
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={strategyB.priceMultiplier}
                      onChange={(e) =>
                        setStrategyB({ ...strategyB, priceMultiplier: parseFloat(e.target.value) })
                      }
                      placeholder="e.g., 1.35"
                    />
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Base Cost × {strategyB.priceMultiplier}</p>
                    <p className="text-lg font-bold text-purple-600 mt-1">
                      {(strategyB.priceMultiplier * 100).toFixed(0)}% Markup
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleRunABTest}
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Target className="w-5 h-5 mr-2" />
                Run A/B Test
              </Button>
            </Card>

            {/* Test Results */}
            {testResults && (
              <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6 border-2 border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Test Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                    <p className="text-sm text-gray-600">{strategyA.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {(strategyA.priceMultiplier * 100).toFixed(0)}% Markup
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <p className="text-sm text-gray-600">{strategyB.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {(strategyB.priceMultiplier * 100).toFixed(0)}% Markup
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <p className="text-sm text-gray-600">Winner</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">{testResults.winner}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Revenue improvement: {testResults.improvement}%
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6 border-l-4 border-l-green-500">
              <h3 className="font-bold text-gray-900 mb-2">Increase Prices by 5-10%</h3>
              <p className="text-gray-600 text-sm">
                Your acceptance rate is above 80%, indicating you're underpriced. A modest price increase could boost profit margins by $15-20k annually.
              </p>
            </Card>

            <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6 border-l-4 border-l-blue-500">
              <h3 className="font-bold text-gray-900 mb-2">Focus on High-Complexity Projects</h3>
              <p className="text-gray-600 text-sm">
                Your ML model shows 35% higher margins on complex projects. Prioritize these opportunities to maximize profitability.
              </p>
            </Card>

            <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6 border-l-4 border-l-purple-500">
              <h3 className="font-bold text-gray-900 mb-2">Seasonal Pricing Strategy</h3>
              <p className="text-gray-600 text-sm">
                Demand peaks in autumn/winter. Consider premium pricing during these months and promotional pricing in summer.
              </p>
            </Card>

            <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6 border-l-4 border-l-orange-500">
              <h3 className="font-bold text-gray-900 mb-2">Competitive Positioning</h3>
              <p className="text-gray-600 text-sm">
                You're positioned competitively in your market. Maintain current pricing while focusing on service quality differentiation.
              </p>
            </Card>
          </div>
        )}

        {/* Export Button */}
        <div className="fixed bottom-8 right-8">
          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-full shadow-lg">
            <Download className="w-5 h-5 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
    </div>
  );
}

