import { useState } from "react";
import { useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Award,
  CheckCircle2,
  Clock,
  Target,
  Star,
  BarChart3,
  Activity
} from "lucide-react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

export default function ContractorPerformance() {
  const params = useParams();
  const contractorId = params.id ? parseInt(params.id) : 0;
  const [timeRange, setTimeRange] = useState<number>(6); // months

  // Fetch contractor details
  const { data: contractor, error: errorContractor } = trpc.contractors.getById.useQuery({ id: contractorId }, {
    enabled: contractorId > 0, retry: 2,
  });

  // Fetch performance trends
  const { data: performanceTrends, isLoading: trendsLoading, error: errorPerformanceTrends } = trpc.contractors.getPerformanceTrends.useQuery({
    contractorId,
    months: timeRange,
  }, {
    enabled: contractorId > 0, retry: 2,
  });

  // Get latest performance metrics
  const latestMetrics = performanceTrends && performanceTrends.length > 0
    ? performanceTrends[performanceTrends.length - 1]
    : null;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-AU', {
      month: 'short',
      year: 'numeric'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-50 border-green-200";
    if (score >= 75) return "bg-blue-50 border-blue-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  // Prepare chart data
  const chartData = performanceTrends?.map((metric: any) => ({
    period: formatDate(metric.periodEnd),
    compliance: metric.complianceScore,
    accuracy: metric.quoteAccuracyScore,
    completion: metric.completionRate,
    onTime: metric.onTimeDeliveryRate,
  })) || [];

  const metricsCards = [
    {
      title: "Compliance Score",
      value: latestMetrics?.complianceScore || 0,
      icon: CheckCircle2,
      description: "Based on verification results",
      trend: "+5%",
      trendUp: true,
    },
    {
      title: "Quote Accuracy",
      value: latestMetrics?.quoteAccuracyScore || 0,
      icon: Target,
      description: "Quote vs actual cost variance",
      trend: "+3%",
      trendUp: true,
    },
    {
      title: "Completion Rate",
      value: latestMetrics?.completionRate || 0,
      icon: Award,
      description: "Projects completed successfully",
      trend: "-2%",
      trendUp: false,
    },
    {
      title: "On-Time Delivery",
      value: latestMetrics?.onTimeDeliveryRate || 0,
      icon: Clock,
      description: "Projects delivered on schedule",
      trend: "+7%",
      trendUp: true,
    },
  ];

  if (!contractor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="mb-2">{contractor.name}</h1>
                <p className="text-lg text-muted-foreground">Performance Analytics & Trends</p>
              </div>
              
              <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(parseInt(v))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Last 3 Months</SelectItem>
                  <SelectItem value="6">Last 6 Months</SelectItem>
                  <SelectItem value="12">Last 12 Months</SelectItem>
                  <SelectItem value="24">Last 24 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Key Metrics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {metricsCards.map((metric, index) => (
              <Card key={index} className={`p-6 border-2 ${getScoreBg(metric.value)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-white/50`}>
                    <metric.icon className={`w-6 h-6 ${getScoreColor(metric.value)}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${metric.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="font-medium">{metric.trend}</span>
                  </div>
                </div>
                <h3 className={`text-3xl font-bold mb-1 ${getScoreColor(metric.value)}`}>
                  {metric.value}%
                </h3>
                <p className="text-sm font-medium text-foreground mb-1">{metric.title}</p>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </Card>
            ))}
          </motion.div>

          {/* Performance Trends Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Performance Trends</h2>
              </div>
              
              {trendsLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="compliance" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Compliance Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Quote Accuracy"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completion" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Completion Rate"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="onTime" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name="On-Time Delivery"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <p>No performance data available for the selected period</p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Additional Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Project Volume</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Quotes Submitted</span>
                  <span className="font-semibold">{latestMetrics?.totalQuotesSubmitted || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Projects Completed</span>
                  <span className="font-semibold">{latestMetrics?.totalProjectsCompleted || 0}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-yellow-100">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold">Customer Satisfaction</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Rating</span>
                  <span className="font-semibold">
                    {latestMetrics ? (latestMetrics.averageRating / 100).toFixed(2) : "0.00"} ⭐
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Reviews</span>
                  <span className="font-semibold">{latestMetrics?.totalReviews || 0}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-red-100">
                  <CheckCircle2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-semibold">Compliance Issues</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Issues</span>
                  <span className="font-semibold">{latestMetrics?.complianceIssuesCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Response Time</span>
                  <span className="font-semibold">{latestMetrics?.averageResponseTime || 0}h</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
