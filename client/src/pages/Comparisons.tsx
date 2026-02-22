import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, FileText, DollarSign, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

export default function Comparisons() {
  const [, setLocation] = useLocation();
  const [selectedComparison, setSelectedComparison] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { data: comparisons, isLoading, refetch, error: errorComparisons } = trpc.comparisons.list.useQuery(undefined, { retry: 2 });

  const deleteComparisonMutation = trpc.comparisons.delete.useMutation({
    onSuccess: () => {
      alert("Comparison deleted successfully");
      refetch();
    },
  });

  const handleDelete = (comparisonId: number) => {
    if (confirm("Are you sure you want to delete this comparison?")) {
      deleteComparisonMutation.mutate({ id: comparisonId });
    }
  };

  const handleCompareAgain = () => {
    setDetailModalOpen(false);
    setLocation("/compare");
  };

  // Calculate stats
  const totalComparisons = comparisons?.length || 0;
  const completedComparisons = comparisons?.filter((c) => c.status === "completed").length || 0;
  const totalSavings = comparisons?.reduce((sum, c) => sum + (c.recommendation?.estimatedSavings || 0), 0) || 0;
  const avgSavings = totalComparisons > 0 ? totalSavings / totalComparisons : 0;

  // Prepare trend data (last 10 comparisons)
  const trendData = comparisons
    ?.slice(-10)
    .map((c, index) => ({
      name: `#${index + 1}`,
      savings: (c.recommendation?.estimatedSavings || 0) / 100,
    })) || [];

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: "bg-slate-100 text-slate-700",
      analyzing: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Comparison History</h1>
          <p className="text-xl text-slate-300">
            Track your quote comparisons and savings over time
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-100 rounded-lg">
                <FileText className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Comparisons</p>
                <p className="text-2xl font-bold text-slate-900">{totalComparisons}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Average Savings</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(avgSavings)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-slate-900">{completedComparisons}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Savings Trend Chart */}
        {trendData.length > 0 && (
          <Card className="p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-cyan-600" />
              <h2 className="text-xl font-semibold text-slate-900">Savings Trend</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Savings"]}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#0891b2"
                  strokeWidth={2}
                  dot={{ fill: "#0891b2", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Comparisons List */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Your Comparisons</h2>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-6 bg-slate-200 rounded mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                </Card>
              ))}
            </div>
          ) : comparisons && comparisons.length > 0 ? (
            <div className="space-y-4">
              {comparisons.map((comparison) => (
                <Card
                  key={comparison.id}
                  className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    setSelectedComparison(comparison);
                    setDetailModalOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          Comparison #{comparison.id}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            comparison.status
                          )}`}
                        >
                          {comparison.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-slate-600">
                        <span>Comparison #{comparison.id}</span>
                        <span>
                          {new Date(comparison.createdAt).toLocaleDateString("en-AU")}
                        </span>
                        {comparison.recommendation?.estimatedSavings && comparison.recommendation.estimatedSavings > 0 && (
                          <span className="text-green-600 font-semibold">
                            Save {formatCurrency(comparison.recommendation.estimatedSavings)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(comparison.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No comparisons yet
              </h3>
              <p className="text-slate-500 mb-6">
                Start comparing quotes to see your savings history
              </p>
              <Button onClick={() => setLocation("/compare")}>Compare Quotes</Button>
            </Card>
          )}
        </div>
      </div>

      {/* Comparison Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comparison #{selectedComparison?.id}</DialogTitle>
            <DialogDescription>
              {new Date(selectedComparison?.createdAt || "").toLocaleDateString("en-AU", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </DialogDescription>
          </DialogHeader>

          {selectedComparison && (
            <div className="space-y-6 mt-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <p className="text-2xl font-bold text-slate-900 capitalize">
                    {selectedComparison.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Potential Savings</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedComparison.recommendation?.estimatedSavings || 0)}
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              {selectedComparison.recommendation?.reasoning && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-cyan-600" />
                    Recommendations
                  </h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedComparison.recommendation.reasoning}
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedComparison.description && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    Description
                  </h4>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedComparison.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleCompareAgain} className="flex-1">
                  Compare Again
                </Button>
                <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
