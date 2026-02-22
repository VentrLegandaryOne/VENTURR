import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Activity, ChevronLeft, RefreshCw, Shield, Database, 
  Server, Wifi, Clock, AlertTriangle, CheckCircle2, 
  XCircle, BarChart3, Zap, HardDrive, FileText, Webhook, ChevronRight
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
    healthy: { variant: "default", icon: <CheckCircle2 className="w-3 h-3" /> },
    up: { variant: "default", icon: <CheckCircle2 className="w-3 h-3" /> },
    degraded: { variant: "secondary", icon: <AlertTriangle className="w-3 h-3" /> },
    critical: { variant: "destructive", icon: <XCircle className="w-3 h-3" /> },
    down: { variant: "destructive", icon: <XCircle className="w-3 h-3" /> },
  };
  const c = config[status] || config.degraded;
  return (
    <Badge variant={c.variant} className="gap-1">
      {c.icon}
      {status.toUpperCase()}
    </Badge>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, color }: { 
  title: string; value: string | number; subtitle?: string; icon: React.ComponentType<{ className?: string }>; color: string 
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

export default function AdminMetrics() {
  const { isAuthenticated, user, loading } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch health check data
  const healthQuery = trpc.health.check.useQuery(undefined, {
    refetchInterval: 30000, // Auto-refresh every 30s, retry: 2,
    staleTime: 10000,
  });

  // Fetch admin metrics
  const metricsQuery = trpc.metrics.snapshot.useQuery(undefined, {
    refetchInterval: 30000,
    staleTime: 10000,
    retry: 1,
  });

  const healthScoreQuery = trpc.metrics.health.useQuery(undefined, {
    refetchInterval: 30000,
    staleTime: 10000,
    retry: 1,
  });

  if (!loading && !isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check admin access
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">Admin privileges are required to view system metrics.</p>
            <Link href="/dashboard">
              <Button>Return to Dashboard</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        healthQuery.refetch(),
        metricsQuery.refetch(),
        healthScoreQuery.refetch(),
      ]);
      setLastRefresh(new Date());
      toast.success("Metrics refreshed");
    } catch {
      toast.error("Failed to refresh metrics");
    } finally {
      setIsRefreshing(false);
    }
  };

  const health = healthQuery.data;
  const metrics = metricsQuery.data;
  const healthScore = healthScoreQuery.data;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container py-8">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">System Metrics</h1>
                <p className="text-muted-foreground">
                  Real-time platform health and performance monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                Last refresh: {lastRefresh.toLocaleTimeString('en-AU')}
              </span>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Health Score Banner */}
        {healthScore && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Card className={`p-4 ${
              (healthScore as any).score >= 90 ? "border-green-500/30 bg-green-500/5" :
              (healthScore as any).score >= 70 ? "border-yellow-500/30 bg-yellow-500/5" :
              "border-red-500/30 bg-red-500/5"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`text-4xl font-bold ${
                    (healthScore as any).score >= 90 ? "text-green-500" :
                    (healthScore as any).score >= 70 ? "text-yellow-500" :
                    "text-red-500"
                  }`}>
                    {(healthScore as any).score}%
                  </div>
                  <div>
                    <h3 className="font-semibold">Overall Health Score</h3>
                    <p className="text-sm text-muted-foreground">
                      {(healthScore as any).score >= 90 ? "All systems operating normally" :
                       (healthScore as any).score >= 70 ? "Some services degraded" :
                       "Critical issues detected"}
                    </p>
                  </div>
                </div>
                <StatusBadge status={
                  (healthScore as any).score >= 90 ? "healthy" :
                  (healthScore as any).score >= 70 ? "degraded" : "critical"
                } />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Service Status Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Service Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {health && (
              <>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-500" />
                        <h3 className="font-medium">Database</h3>
                      </div>
                      <StatusBadge status={(health as any).services?.database?.status || "unknown"} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Latency: {(health as any).services?.database?.latencyMs || "N/A"}ms</p>
                      {(health as any).services?.database?.error && (
                        <p className="text-destructive mt-1">{(health as any).services.database.error}</p>
                      )}
                    </div>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <h3 className="font-medium">Redis Cache</h3>
                      </div>
                      <StatusBadge status={(health as any).services?.redis?.status || "unknown"} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Latency: {(health as any).services?.redis?.latencyMs || "N/A"}ms</p>
                      <p className="text-xs">(Optional service)</p>
                    </div>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-5 h-5 text-green-500" />
                        <h3 className="font-medium">S3 Storage</h3>
                      </div>
                      <StatusBadge status={(health as any).services?.storage?.status || "unknown"} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Latency: {(health as any).services?.storage?.latencyMs || "N/A"}ms</p>
                    </div>
                  </Card>
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Platform Metrics */}
        {metrics && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Platform Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Total Requests"
                value={(metrics as any).requestCount || 0}
                subtitle="Since last restart"
                icon={BarChart3}
                color="bg-blue-500/10 text-blue-500"
              />
              <MetricCard
                title="Avg Response Time"
                value={`${(metrics as any).avgResponseTime || 0}ms`}
                subtitle="Across all endpoints"
                icon={Clock}
                color="bg-amber-500/10 text-amber-500"
              />
              <MetricCard
                title="Error Rate"
                value={`${(metrics as any).errorRate || 0}%`}
                subtitle="5xx responses"
                icon={AlertTriangle}
                color="bg-red-500/10 text-red-500"
              />
              <MetricCard
                title="Active Users"
                value={(metrics as any).activeUsers || 0}
                subtitle="Last 24 hours"
                icon={Wifi}
                color="bg-green-500/10 text-green-500"
              />
            </div>
          </div>
        )}

        {/* S3 Retry Statistics */}
        {metrics && (metrics as any).s3RetryStats && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">S3 Upload Reliability</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Total Uploads"
                value={(metrics as any).s3RetryStats?.totalAttempts || 0}
                icon={HardDrive}
                color="bg-indigo-500/10 text-indigo-500"
              />
              <MetricCard
                title="Success Rate"
                value={`${(metrics as any).s3RetryStats?.successRate || 100}%`}
                icon={CheckCircle2}
                color="bg-green-500/10 text-green-500"
              />
              <MetricCard
                title="Avg Retries"
                value={(metrics as any).s3RetryStats?.avgRetries || 0}
                subtitle="Per upload"
                icon={RefreshCw}
                color="bg-amber-500/10 text-amber-500"
              />
              <MetricCard
                title="Failed Uploads"
                value={(metrics as any).s3RetryStats?.failures || 0}
                icon={XCircle}
                color="bg-red-500/10 text-red-500"
              />
            </div>
          </div>
        )}

        {/* Rate Limiting Stats */}
        {metrics && (metrics as any).rateLimitStats && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Rate Limiting</h2>
            <Card className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests Checked</p>
                  <p className="text-2xl font-bold">{(metrics as any).rateLimitStats?.totalChecked || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requests Blocked (429)</p>
                  <p className="text-2xl font-bold text-destructive">{(metrics as any).rateLimitStats?.blocked || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Block Rate</p>
                  <p className="text-2xl font-bold">{(metrics as any).rateLimitStats?.blockRate || "0"}%</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Links */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Admin Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/request-logs">
              <Card className="p-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Request Logs</h3>
                      <p className="text-xs text-muted-foreground">View real-time API request history with filtering</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Card>
            </Link>
            <Link href="/admin/webhooks">
              <Card className="p-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Webhook className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Webhook Configuration</h3>
                      <p className="text-xs text-muted-foreground">Configure Slack/Discord health alert webhooks</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* System Info */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">System Information</h2>
          <Card className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Platform</p>
                <p className="font-medium">VENTURR VALDT</p>
              </div>
              <div>
                <p className="text-muted-foreground">Environment</p>
                <p className="font-medium">Production</p>
              </div>
              <div>
                <p className="text-muted-foreground">Server Status</p>
                <p className="font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                  Running
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Latency</p>
                <p className="font-medium">{(health as any)?.totalLatencyMs || "N/A"}ms</p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
