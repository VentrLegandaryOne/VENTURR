import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/ui/LoadingSkeleton";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

type TimeRange = "7d" | "30d" | "90d" | "1y";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const { isAuthenticated } = useAuth();

  const daysMap: Record<TimeRange, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "1y": 365,
  };

  // Fetch cost trends
  const { data: costTrends, isLoading: loadingTrends, error: errorTrends, refetch: refetchTrends } =
    trpc.analytics.getCostTrends.useQuery(
      { days: daysMap[timeRange] },
      { enabled: isAuthenticated, retry: 2 }
    );

  // Fetch savings breakdown
  const { data: savingsBreakdown, isLoading: loadingBreakdown, error: errorBreakdown } =
    trpc.analytics.getSavingsBreakdown.useQuery(undefined, {
      enabled: isAuthenticated, retry: 2,
    });

  // Fetch top contractors
  const { data: topContractors, isLoading: loadingContractors, error: errorContractors } =
    trpc.analytics.getTopContractors.useQuery(
      { limit: 10 },
      { enabled: isAuthenticated, retry: 2 }
    );

  // Fetch key metrics
  const { data: keyMetrics, isLoading: loadingMetrics, error: errorMetrics } =
    trpc.analytics.getKeyMetrics.useQuery(undefined, {
      enabled: isAuthenticated, retry: 2,
    });

  const isLoading =
    loadingTrends || loadingBreakdown || loadingContractors || loadingMetrics;
  const hasError = errorTrends || errorBreakdown || errorContractors || errorMetrics;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (hasError) {
    return (
      <QueryWrapper
        isLoading={false}
        error={errorTrends || errorBreakdown || errorContractors || errorMetrics}
        data={null}
        onRetry={() => refetchTrends()}
      >
        <div />
      </QueryWrapper>
    );
  }

  // Prepare cost trends data for Recharts
  const costTrendsData = costTrends?.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-AU", {
      month: "short",
      day: "numeric",
    }),
    avgPrice: Math.round(item.avgPrice),
  })) || [];

  // Prepare savings breakdown data for Recharts
  const savingsData = [
    {
      name: "Materials",
      value: savingsBreakdown?.materials || 0,
      color: "#10B981",
    },
    { name: "Labor", value: savingsBreakdown?.labor || 0, color: "#00A8FF" },
    {
      name: "Compliance",
      value: savingsBreakdown?.compliance || 0,
      color: "#4A90E2",
    },
    { name: "Other", value: savingsBreakdown?.other || 0, color: "#64748B" },
  ];

  const totalSavings = savingsData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 triangle-pattern">
      <div className="container mx-auto px-4 py-12 space-fib-13">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-slate-400 text-lg">
            Comprehensive insights into your quote verification history
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass-strong p-6 border-slate-700/50 hover:glow-primary transition-smooth">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-2">Total Quotes</p>
                <p className="text-4xl font-bold text-white">
                  {keyMetrics?.totalQuotes || 0}
                </p>
              </div>
              <svg
                className="w-12 h-12 text-[#00A8FF]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </Card>

          <Card className="glass-strong p-6 border-slate-700/50 hover:glow-primary transition-smooth">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-2">Average Savings</p>
                <p className="text-4xl font-bold text-[#10B981]">
                  ${keyMetrics?.avgSavings?.toLocaleString() || 0}
                </p>
              </div>
              <svg
                className="w-12 h-12 text-[#10B981]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </Card>

          <Card className="glass-strong p-6 border-slate-700/50 hover:glow-primary transition-smooth">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-2">Top Contractor</p>
                <p className="text-2xl font-bold text-white truncate">
                  {keyMetrics?.topContractor?.businessName || "N/A"}
                </p>
              </div>
              <svg
                className="w-12 h-12 text-[#F59E0B]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          </Card>
        </div>

        {/* Cost Trends Chart */}
        <Card className="glass-strong p-8 border-slate-700/50 mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Cost Trends Over Time
              </h2>
              <p className="text-slate-400">
                Average quote prices across your verification history
              </p>
            </div>
            <div className="flex gap-2">
              {(["7d", "30d", "90d", "1y"] as TimeRange[]).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className={
                    timeRange === range
                      ? "bg-[#00A8FF] hover:bg-[#0096E6] text-white"
                      : "border-slate-600 text-slate-300 hover:bg-slate-800"
                  }
                >
                  {range.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {costTrendsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={costTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  stroke="#94A3B8"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#94A3B8"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [
                    `$${value.toLocaleString()}`,
                    "Avg Price",
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgPrice"
                  stroke="#00A8FF"
                  strokeWidth={3}
                  dot={{ fill: "#00A8FF", r: 5 }}
                  activeDot={{ r: 8 }}
                  name="Average Price"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-slate-400">
              No cost trend data available for the selected period
            </div>
          )}
        </Card>

        {/* Savings Breakdown & Top Contractors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Savings Breakdown Pie Chart */}
          <Card className="glass-strong p-8 border-slate-700/50">
            <h2 className="text-2xl font-bold text-white mb-2">
              Savings Breakdown
            </h2>
            <p className="text-slate-400 mb-8">
              Total savings: ${totalSavings.toLocaleString()}
            </p>

            {totalSavings > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={savingsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {savingsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-slate-400">
                No savings data available yet
              </div>
            )}
          </Card>

          {/* Top Contractors Leaderboard */}
          <Card className="glass-strong p-8 border-slate-700/50">
            <h2 className="text-2xl font-bold text-white mb-2">
              Top Contractors
            </h2>
            <p className="text-slate-400 mb-8">
              Highest-rated contractors based on reviews and performance
            </p>

            {topContractors && topContractors.length > 0 ? (
              <div className="space-y-4">
                {topContractors.map((contractor, index) => (
                  <div
                    key={contractor.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-[#00A8FF]/50 transition-smooth"
                  >
                    {/* Rank Badge */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0
                          ? "bg-[#F59E0B] text-white"
                          : index === 1
                            ? "bg-slate-400 text-slate-900"
                            : index === 2
                              ? "bg-[#CD7F32] text-white"
                              : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Contractor Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-white truncate">
                          {contractor.businessName}
                        </p>
                        {contractor.isVerified && (
                          <svg
                            className="w-5 h-5 text-[#00A8FF] flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4 text-[#F59E0B]"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span className="font-medium text-white">
                            {contractor.avgScore?.toFixed(1) || "N/A"}
                          </span>
                        </div>
                        <span>•</span>
                        <span>{contractor.totalReviews} reviews</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-slate-400 mb-1">Score</p>
                      <p className="text-lg font-bold text-[#10B981]">
                        {Math.round(contractor.compositeScore)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-slate-400">
                No contractor data available yet
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
