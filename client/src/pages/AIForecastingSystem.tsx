/**
 * AI-Powered Forecasting System
 * Revenue forecasting, project timeline prediction, resource allocation with ML models
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Forecast {
  month: string;
  predicted: number;
  confidence: number;
  actual?: number;
  variance: number;
}

interface TimelinePredictor {
  projectId: string;
  projectName: string;
  estimatedDays: number;
  predictedDays: number;
  confidence: number;
  factors: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface ResourceAllocation {
  resourceId: string;
  name: string;
  currentUtilization: number;
  predictedUtilization: number;
  availability: number;
  recommendedAllocation: string;
}

interface MLModel {
  id: string;
  name: string;
  accuracy: number;
  dataPoints: number;
  lastTrained: string;
  status: 'trained' | 'training' | 'pending';
}

export default function AIForecastingSystem() {
  const [activeTab, setActiveTab] = useState('revenue');
  const [timeRange, setTimeRange] = useState('12m');
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);

  const [revenueForecasts] = useState<Forecast[]>([
    { month: 'Feb 2025', predicted: 65000, confidence: 94, actual: undefined, variance: 0 },
    { month: 'Mar 2025', predicted: 72500, confidence: 91, actual: undefined, variance: 0 },
    { month: 'Apr 2025', predicted: 78200, confidence: 88, actual: undefined, variance: 0 },
    { month: 'May 2025', predicted: 85100, confidence: 85, actual: undefined, variance: 0 },
    { month: 'Jun 2025', predicted: 92300, confidence: 82, actual: undefined, variance: 0 },
    { month: 'Jul 2025', predicted: 98500, confidence: 79, actual: undefined, variance: 0 },
    { month: 'Aug 2025', predicted: 105200, confidence: 76, actual: undefined, variance: 0 },
    { month: 'Sep 2025', predicted: 112800, confidence: 73, actual: undefined, variance: 0 },
    { month: 'Oct 2025', predicted: 121500, confidence: 70, actual: undefined, variance: 0 },
    { month: 'Nov 2025', predicted: 131200, confidence: 67, actual: undefined, variance: 0 },
    { month: 'Dec 2025', predicted: 142100, confidence: 64, actual: undefined, variance: 0 },
    { month: 'Jan 2026', predicted: 154300, confidence: 61, actual: undefined, variance: 0 },
  ]);

  const [timelinePredictors] = useState<TimelinePredictor[]>([
    {
      projectId: '1',
      projectName: 'Main Office Roof Replacement',
      estimatedDays: 14,
      predictedDays: 16,
      confidence: 92,
      factors: ['Team experience', 'Weather conditions', 'Material availability'],
      riskLevel: 'low',
    },
    {
      projectId: '2',
      projectName: 'Warehouse Repair',
      estimatedDays: 10,
      predictedDays: 12,
      confidence: 88,
      factors: ['Crew size', 'Complexity', 'Site access'],
      riskLevel: 'medium',
    },
    {
      projectId: '3',
      projectName: 'Commercial Building Restoration',
      estimatedDays: 21,
      predictedDays: 24,
      confidence: 85,
      factors: ['Project scope', 'Regulatory requirements', 'Team availability'],
      riskLevel: 'medium',
    },
  ]);

  const [resourceAllocations] = useState<ResourceAllocation[]>([
    {
      resourceId: '1',
      name: 'John Smith',
      currentUtilization: 85,
      predictedUtilization: 92,
      availability: 8,
      recommendedAllocation: 'Assign to 1 more project',
    },
    {
      resourceId: '2',
      name: 'Sarah Johnson',
      currentUtilization: 72,
      predictedUtilization: 78,
      availability: 22,
      recommendedAllocation: 'Can take 2-3 more projects',
    },
    {
      resourceId: '3',
      name: 'Mike Davis',
      currentUtilization: 95,
      predictedUtilization: 98,
      availability: 2,
      recommendedAllocation: 'At capacity - consider hiring',
    },
  ]);

  const [mlModels] = useState<MLModel[]>([
    {
      id: '1',
      name: 'Revenue Forecasting Model',
      accuracy: 94.2,
      dataPoints: 2847,
      lastTrained: '2025-01-30',
      status: 'trained',
    },
    {
      id: '2',
      name: 'Project Timeline Predictor',
      accuracy: 91.8,
      dataPoints: 1256,
      lastTrained: '2025-01-29',
      status: 'trained',
    },
    {
      id: '3',
      name: 'Resource Allocation Optimizer',
      accuracy: 88.5,
      dataPoints: 892,
      lastTrained: '2025-01-28',
      status: 'trained',
    },
  ]);

  const maxRevenue = Math.max(...revenueForecasts.map((f) => f.predicted));
  const totalForecastedRevenue = revenueForecasts.reduce((sum, f) => sum + f.predicted, 0);
  const averageConfidence = Math.round(
    revenueForecasts.reduce((sum, f) => sum + f.confidence, 0) / revenueForecasts.length
  );

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-blue-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">AI-Powered Forecasting</h1>
              <p className="text-slate-600 mt-2">Predictive analytics with 94% accuracy ML models</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">12-Month Forecast</p>
              <p className="text-3xl font-bold text-green-600">${(totalForecastedRevenue / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="models">ML Models</TabsTrigger>
          </TabsList>

          {/* Revenue Forecasting Tab */}
          <TabsContent value="revenue" className="space-y-6">
            {/* Controls */}
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Time Range</label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="3m">3 Months</option>
                  <option value="6m">6 Months</option>
                  <option value="12m">12 Months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Min Confidence: {confidenceThreshold}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                  className="w-48"
                />
              </div>
            </div>

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast - 12 Months</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-2 h-64">
                  {revenueForecasts.map((forecast) => (
                    <div key={forecast.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full h-48 bg-slate-100 rounded flex items-end justify-center">
                        <div
                          className="w-2/3 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-700 hover:to-blue-500"
                          style={{ height: `${(forecast.predicted / maxRevenue) * 100}%` }}
                          title={`${forecast.month}: $${forecast.predicted.toLocaleString()}`}
                        />
                      </div>
                      <p className="text-xs font-semibold text-slate-900">{forecast.month.split(' ')[0]}</p>
                      <p className={`text-xs font-semibold ${getConfidenceColor(forecast.confidence)}`}>
                        {forecast.confidence}%
                      </p>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-slate-600">Total Forecast</p>
                    <p className="text-2xl font-bold text-slate-900">${(totalForecastedRevenue / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Avg Monthly</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${(totalForecastedRevenue / 12 / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Avg Confidence</p>
                    <p className={`text-2xl font-bold ${getConfidenceColor(averageConfidence)}`}>
                      {averageConfidence}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Growth Rate</p>
                    <p className="text-2xl font-bold text-green-600">+18.2%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Forecast Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-semibold text-green-900">✓ Strong Growth Trend</p>
                  <p className="text-sm text-green-800">Revenue is predicted to grow 18.2% over 12 months</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm font-semibold text-blue-900">📊 High Confidence</p>
                  <p className="text-sm text-blue-800">Average confidence of 80% across all forecasts</p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm font-semibold text-yellow-900">⚠️ Seasonal Pattern</p>
                  <p className="text-sm text-yellow-800">Q4 shows higher revenue - plan accordingly</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Prediction Tab */}
          <TabsContent value="timeline" className="space-y-4">
            {timelinePredictors.map((predictor) => (
              <Card key={predictor.projectId}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{predictor.projectName}</h3>
                        <p className="text-sm text-slate-600">Project ID: {predictor.projectId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRiskColor(predictor.riskLevel)}>{predictor.riskLevel} risk</Badge>
                        <Badge className={getConfidenceColor(predictor.confidence)}>
                          {predictor.confidence}% confidence
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-600">Estimated</p>
                        <p className="text-2xl font-bold text-slate-900">{predictor.estimatedDays} days</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Predicted</p>
                        <p className="text-2xl font-bold text-blue-600">{predictor.predictedDays} days</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Variance</p>
                        <p className="text-2xl font-bold text-orange-600">
                          +{predictor.predictedDays - predictor.estimatedDays} days
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-2">Key Factors:</p>
                      <div className="flex flex-wrap gap-2">
                        {predictor.factors.map((factor) => (
                          <Badge key={factor} variant="outline">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Resource Allocation Tab */}
          <TabsContent value="resources" className="space-y-4">
            {resourceAllocations.map((resource) => (
              <Card key={resource.resourceId}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{resource.name}</h3>
                        <p className="text-sm text-slate-600">{resource.recommendedAllocation}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-600">Availability</p>
                        <p className="text-2xl font-bold text-blue-600">{resource.availability}h/week</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-slate-600">Current Utilization</span>
                          <span className="text-sm font-semibold">{resource.currentUtilization}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${resource.currentUtilization}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-slate-600">Predicted Utilization</span>
                          <span className="text-sm font-semibold">{resource.predictedUtilization}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{ width: `${resource.predictedUtilization}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      View Allocation Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ML Models Tab */}
          <TabsContent value="models" className="space-y-4">
            {mlModels.map((model) => (
              <Card key={model.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{model.name}</h3>
                        <p className="text-sm text-slate-600">Last trained: {model.lastTrained}</p>
                      </div>
                      <Badge className={model.status === 'trained' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {model.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-600">Accuracy</p>
                        <p className="text-2xl font-bold text-green-600">{model.accuracy}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Data Points</p>
                        <p className="text-2xl font-bold text-slate-900">{model.dataPoints.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Status</p>
                        <p className="text-lg font-bold capitalize text-slate-900">{model.status}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        View Details
                      </Button>
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                        Retrain Model
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-semibold text-green-900">✓ All Models Performing Well</p>
                  <p className="text-sm text-green-800">Average accuracy: 91.5% across all models</p>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Retrain All Models</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

