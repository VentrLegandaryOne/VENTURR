/**
 * Advanced Forecasting UI Dashboard
 * ML predictions, confidence intervals, trend analysis, scenario planning
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

interface Forecast {
  month: string;
  actual?: number;
  predicted: number;
  lower: number;
  upper: number;
  confidence: number;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  probability: number;
  impact: 'high' | 'medium' | 'low';
  forecast: Forecast[];
}

interface Insight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk';
  title: string;
  description: string;
  confidence: number;
  action?: string;
}

export default function ForecastingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedScenario, setSelectedScenario] = useState('baseline');

  const [forecastData] = useState<Forecast[]>([
    { month: 'Jan', actual: 85000, predicted: 87000, lower: 75000, upper: 99000, confidence: 92 },
    { month: 'Feb', actual: 92000, predicted: 94000, lower: 82000, upper: 106000, confidence: 91 },
    { month: 'Mar', actual: 78000, predicted: 89000, lower: 77000, upper: 101000, confidence: 88 },
    { month: 'Apr', predicted: 105000, lower: 90000, upper: 120000, confidence: 85 },
    { month: 'May', predicted: 125000, lower: 108000, upper: 142000, confidence: 82 },
    { month: 'Jun', predicted: 118000, lower: 100000, upper: 136000, confidence: 80 },
    { month: 'Jul', predicted: 132000, lower: 112000, upper: 152000, confidence: 78 },
    { month: 'Aug', predicted: 145000, lower: 123000, upper: 167000, confidence: 76 },
    { month: 'Sep', predicted: 138000, lower: 115000, upper: 161000, confidence: 75 },
    { month: 'Oct', predicted: 152000, lower: 128000, upper: 176000, confidence: 74 },
    { month: 'Nov', predicted: 168000, lower: 142000, upper: 194000, confidence: 73 },
    { month: 'Dec', predicted: 185000, lower: 157000, upper: 213000, confidence: 72 },
  ]);

  const [scenarios] = useState<Scenario[]>([
    {
      id: 'baseline',
      name: 'Baseline Forecast',
      description: 'Current trend continuation',
      probability: 100,
      impact: 'medium',
      forecast: forecastData,
    },
    {
      id: 'optimistic',
      name: 'Optimistic Scenario',
      description: 'Strong market growth + team expansion',
      probability: 35,
      impact: 'high',
      forecast: forecastData.map((d) => ({
        ...d,
        predicted: d.predicted * 1.25,
        upper: d.upper * 1.25,
        lower: d.lower * 1.15,
      })),
    },
    {
      id: 'pessimistic',
      name: 'Pessimistic Scenario',
      description: 'Market slowdown + team constraints',
      probability: 20,
      impact: 'high',
      forecast: forecastData.map((d) => ({
        ...d,
        predicted: d.predicted * 0.8,
        upper: d.upper * 0.85,
        lower: d.lower * 0.75,
      })),
    },
  ]);

  const [insights] = useState<Insight[]>([
    {
      id: '1',
      type: 'trend',
      title: 'Strong Upward Trend',
      description: 'Revenue showing consistent growth with 92% confidence',
      confidence: 92,
      action: 'Prepare for scaling',
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'Peak Season Approaching',
      description: 'Q4 typically shows 35% higher revenue',
      confidence: 88,
      action: 'Hire seasonal staff',
    },
    {
      id: '3',
      type: 'risk',
      title: 'Seasonal Volatility',
      description: 'March shows historical dips',
      confidence: 85,
      action: 'Plan marketing campaign',
    },
    {
      id: '4',
      type: 'anomaly',
      title: 'Unexpected Spike',
      description: 'May forecast 15% higher than trend',
      confidence: 78,
      action: 'Investigate drivers',
    },
  ]);

  const selectedForecast = scenarios.find((s) => s.id === selectedScenario)?.forecast || forecastData;

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'opportunity':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'risk':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'anomaly':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Forecasting Dashboard</h1>
          <p className="text-slate-600 mt-2">ML-powered predictions with confidence intervals and scenario planning</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">12-Month Revenue Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">$1.47M</p>
              <p className="text-sm text-green-600 mt-2">↑ 18% vs last year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Average Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">81%</p>
              <p className="text-sm text-slate-600 mt-2">Based on 12 months</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Peak Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">Dec</p>
              <p className="text-sm text-slate-600 mt-2">$185K predicted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Risk Level</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">Medium</p>
              <p className="text-sm text-slate-600 mt-2">3 identified risks</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Revenue Forecast with Confidence Intervals</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Export
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Adjust
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={selectedForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                    <Legend />
                    <Area type="monotone" dataKey="upper" fill="#dbeafe" stroke="none" name="Upper Bound" />
                    <Area type="monotone" dataKey="lower" fill="#ffffff" stroke="none" name="Lower Bound" />
                    <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={3} name="Forecast" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" strokeDasharray="5 5" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Confidence Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Forecast Confidence Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={selectedForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Line type="monotone" dataKey="confidence" stroke="#f59e0b" strokeWidth={2} name="Confidence %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {scenarios.map((scenario) => (
                <Card
                  key={scenario.id}
                  className={`cursor-pointer transition ${selectedScenario === scenario.id ? 'ring-2 ring-blue-600' : 'hover:shadow-lg'}`}
                  onClick={() => setSelectedScenario(scenario.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{scenario.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Probability</span>
                      <Badge className="bg-blue-100 text-blue-800">{scenario.probability}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Impact</span>
                      <Badge
                        className={
                          scenario.impact === 'high'
                            ? 'bg-red-100 text-red-800'
                            : scenario.impact === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }
                      >
                        {scenario.impact}
                      </Badge>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium text-slate-900">12-Month Total</p>
                      <p className="text-2xl font-bold text-slate-900">
                        ${(scenario.forecast.reduce((sum, f) => sum + f.predicted, 0) / 1000000).toFixed(2)}M
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Scenario Comparison Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={selectedForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                    <Legend />
                    <Bar dataKey="predicted" fill="#3b82f6" name="Forecast" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id} className={`border-l-4 ${getInsightColor(insight.type)}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{insight.title}</h3>
                        <Badge
                          variant="outline"
                          className={`capitalize ${getConfidenceColor(insight.confidence)}`}
                        >
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-3">{insight.description}</p>
                      {insight.action && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-600">Suggested Action:</span>
                          <Badge variant="outline">{insight.action}</Badge>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900 mb-2">
                        {insight.confidence}%
                      </div>
                      <Button size="sm" variant="outline">
                        Learn More
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

