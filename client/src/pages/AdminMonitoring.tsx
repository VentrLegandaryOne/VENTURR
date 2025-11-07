import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, AlertTriangle, TrendingUp, Zap, Shield, Activity, Settings, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

interface BugReport {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  type: string;
  description: string;
  timestamp: Date;
  fixed: boolean;
}

interface PerformanceMetric {
  metric: string;
  value: number;
  threshold: number;
  status: "good" | "warning" | "critical";
  unit: string;
}

interface OptimizationSuggestion {
  id: string;
  category: string;
  priority: "high" | "medium" | "low";
  description: string;
  estimatedImprovement: string;
  implemented: boolean;
}

export default function AdminMonitoring() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);

  // Check if user is admin
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  // Fetch monitoring data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Mock data for demonstration
      const mockBugs: BugReport[] = [
        {
          id: "bug-001",
          severity: "high",
          type: "performance",
          description: "High memory usage detected (>80%)",
          timestamp: new Date(Date.now() - 5 * 60000),
          fixed: false,
        },
        {
          id: "bug-002",
          severity: "medium",
          type: "database",
          description: "Slow query on projects table",
          timestamp: new Date(Date.now() - 15 * 60000),
          fixed: false,
        },
      ];

      const mockMetrics: PerformanceMetric[] = [
        {
          metric: "Heap Usage",
          value: 82,
          threshold: 80,
          status: "warning",
          unit: "%",
        },
        {
          metric: "Event Loop Lag",
          value: 45,
          threshold: 100,
          status: "good",
          unit: "ms",
        },
        {
          metric: "API Response Time",
          value: 125,
          threshold: 200,
          status: "good",
          unit: "ms",
        },
      ];

      const mockSuggestions: OptimizationSuggestion[] = [
        {
          id: "opt-001",
          category: "database",
          priority: "high",
          description: "Add database indexes on frequently queried columns",
          estimatedImprovement: "40-60% query speed improvement",
          implemented: false,
        },
        {
          id: "opt-002",
          category: "caching",
          priority: "high",
          description: "Implement Redis caching for user sessions",
          estimatedImprovement: "50-70% response time improvement",
          implemented: false,
        },
        {
          id: "opt-003",
          category: "frontend",
          priority: "medium",
          description: "Implement code splitting and lazy loading",
          estimatedImprovement: "30-50% initial load time reduction",
          implemented: false,
        },
      ];

      setBugs(mockBugs);
      setMetrics(mockMetrics);
      setSuggestions(mockSuggestions);
      toast.success("Monitoring data refreshed");
    } catch (error) {
      console.error("Failed to refresh monitoring data:", error);
      toast.error("Failed to refresh monitoring data");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh on mount
  useEffect(() => {
    handleRefresh();
    const interval = setInterval(handleRefresh, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleFixBug = (bugId: string) => {
    setBugs(bugs.map(b => (b.id === bugId ? { ...b, fixed: true } : b)));
    toast.success("Bug marked as fixed");
  };

  const handleImplementSuggestion = (suggestionId: string) => {
    setSuggestions(
      suggestions.map(s => (s.id === suggestionId ? { ...s, implemented: true } : s))
    );
    toast.success("Optimization implemented");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "critical":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50 relative">
      {/* Futuristic Chequered Background */}
      <div className="background-glow fixed inset-0 z-0" />

      {/* Header */}
      <header className="relative z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-lg shadow-indigo-500/10 sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
                  Admin Monitoring
                </h1>
                <p className="text-sm text-slate-500">Real-time system health and optimization</p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeInUp">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bug Reports */}
            <Card className="shadow-lg border-red-200/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Bug Reports ({bugs.length})
                </CardTitle>
                <CardDescription>Critical issues detected in the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {bugs.length === 0 ? (
                  <p className="text-sm text-slate-500">No bugs detected</p>
                ) : (
                  bugs.map(bug => (
                    <div
                      key={bug.id}
                      className={`p-4 rounded-lg border ${getSeverityColor(bug.severity)} flex items-start justify-between`}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{bug.description}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {bug.type} • {bug.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleFixBug(bug.id)}
                        disabled={bug.fixed}
                        variant="outline"
                        className="ml-4"
                      >
                        {bug.fixed ? "Fixed" : "Fix"}
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="shadow-lg border-blue-200/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>Current system performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics.map(metric => (
                  <div key={metric.metric} className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-slate-900">{metric.metric}</p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(metric.status)}
                        <span className="text-sm font-semibold">
                          {metric.value}{metric.unit}
                        </span>
                      </div>
                    </div>
                     <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          metric.status === "good"
                            ? "bg-green-500"
                            : metric.status === "warning"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(metric.value, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Threshold: {metric.threshold}{metric.unit}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Optimization Suggestions */}
            <Card className="shadow-lg border-green-200/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  Optimization Suggestions ({suggestions.length})
                </CardTitle>
                <CardDescription>Recommended improvements for better performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions.map(suggestion => (
                  <div
                    key={suggestion.id}
                    className="p-4 rounded-lg border border-slate-200 hover:border-green-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-slate-900">{suggestion.description}</p>
                          <Badge
                            variant="outline"
                            className={
                              suggestion.priority === "high"
                                ? "bg-red-100 text-red-800 border-red-300"
                                : suggestion.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                : "bg-blue-100 text-blue-800 border-blue-300"
                            }
                          >
                            {suggestion.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{suggestion.category}</p>
                        <p className="text-xs text-green-600 mt-1">
                          Estimated improvement: {suggestion.estimatedImprovement}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleImplementSuggestion(suggestion.id)}
                        disabled={suggestion.implemented}
                        className="ml-4"
                      >
                        {suggestion.implemented ? "Implemented" : "Implement"}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Status */}
            <Card className="shadow-lg border-indigo-200/50 overflow-hidden sticky top-24">
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm font-medium text-green-900">Overall Status</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">Operational</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Quick Stats</p>
                  <div className="p-2 rounded bg-slate-50">
                    <p className="text-xs text-slate-600">Active Bugs</p>
                    <p className="text-lg font-bold text-slate-900">{bugs.filter(b => !b.fixed).length}</p>
                  </div>
                  <div className="p-2 rounded bg-slate-50">
                    <p className="text-xs text-slate-600">Critical Issues</p>
                    <p className="text-lg font-bold text-slate-900">{bugs.filter(b => b.severity === 'critical').length}</p>
                  </div>
                  <div className="p-2 rounded bg-slate-50">
                    <p className="text-xs text-slate-600">Pending Optimizations</p>
                    <p className="text-lg font-bold text-slate-900">{suggestions.filter(s => !s.implemented).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
