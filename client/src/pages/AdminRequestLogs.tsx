import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  ChevronLeft, RefreshCw, Shield, Search, Download,
  AlertTriangle, CheckCircle2, XCircle, Clock, Filter,
  FileJson, FileSpreadsheet, ArrowUpDown
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

type SortField = "timestamp" | "durationMs" | "status" | "path";
type SortDir = "asc" | "desc";

function StatusBadge({ status }: { status: number }) {
  if (status >= 500) return <Badge variant="destructive" className="gap-1 font-mono text-xs"><XCircle className="w-3 h-3" />{status}</Badge>;
  if (status >= 400) return <Badge variant="secondary" className="gap-1 font-mono text-xs"><AlertTriangle className="w-3 h-3" />{status}</Badge>;
  if (status >= 300) return <Badge variant="outline" className="gap-1 font-mono text-xs">{status}</Badge>;
  return <Badge variant="default" className="gap-1 font-mono text-xs"><CheckCircle2 className="w-3 h-3" />{status}</Badge>;
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    POST: "bg-green-500/10 text-green-600 border-green-500/20",
    PUT: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    DELETE: "bg-red-500/10 text-red-600 border-red-500/20",
    PATCH: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    ERROR: "bg-red-500/10 text-red-600 border-red-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${colors[method] || "bg-muted text-muted-foreground border-border"}`}>
      {method}
    </span>
  );
}

export default function AdminRequestLogs() {
  const { isAuthenticated, user, loading } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterPath, setFilterPath] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterMethod, setFilterMethod] = useState<string>("");
  const [showErrors, setShowErrors] = useState(false);
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [logLimit, setLogLimit] = useState(200);

  const { data: logsData, error: logsError, isLoading: logsLoading, refetch: refetchLogs } = trpc.metrics.requestLogs.useQuery(
    { limit: logLimit },
    { refetchInterval: 15000, staleTime: 5000, retry: 2 }
  );

  const { data: errorLogsData, error: errorLogsError, isLoading: errorLogsLoading, refetch: refetchErrorLogs } = trpc.metrics.errorLogs.useQuery(
    { limit: logLimit },
    { enabled: showErrors, refetchInterval: 15000, staleTime: 5000, retry: 2 }
  );

  const rawLogs = showErrors ? (errorLogsData || []) : (logsData || []);

  const filteredLogs = useMemo(() => {
    let logs = [...rawLogs];

    if (filterPath) {
      const lowerPath = filterPath.toLowerCase();
      logs = logs.filter(l => l.path.toLowerCase().includes(lowerPath));
    }

    if (filterStatus) {
      const statusNum = parseInt(filterStatus, 10);
      if (!isNaN(statusNum)) {
        if (filterStatus.length <= 1) {
          logs = logs.filter(l => Math.floor(l.status / 100) === statusNum);
        } else {
          logs = logs.filter(l => l.status.toString().startsWith(filterStatus));
        }
      }
    }

    if (filterMethod) {
      logs = logs.filter(l => l.method === filterMethod);
    }

    logs.sort((a, b) => {
      let cmp = 0;
      if (sortField === "timestamp") cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      else if (sortField === "durationMs") cmp = a.durationMs - b.durationMs;
      else if (sortField === "status") cmp = a.status - b.status;
      else if (sortField === "path") cmp = a.path.localeCompare(b.path);
      return sortDir === "desc" ? -cmp : cmp;
    });

    return logs;
  }, [rawLogs, filterPath, filterStatus, filterMethod, sortField, sortDir]);

  const stats = useMemo(() => {
    const total = filteredLogs.length;
    const errors = filteredLogs.filter(l => l.status >= 400).length;
    const avgDuration = total > 0 ? Math.round(filteredLogs.reduce((s, l) => s + l.durationMs, 0) / total) : 0;
    const maxDuration = total > 0 ? Math.max(...filteredLogs.map(l => l.durationMs)) : 0;
    return { total, errors, avgDuration, maxDuration };
  }, [filteredLogs]);

  const uniqueMethods = useMemo(() => {
    return Array.from(new Set(rawLogs.map((l: { method: string }) => l.method))).sort();
  }, [rawLogs]);

  // Early returns AFTER all hooks
  if (!loading && !isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">Admin privileges required.</p>
            <Link href="/dashboard"><Button>Return to Dashboard</Button></Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchLogs();
      if (showErrors) await refetchErrorLogs();
      toast.success("Logs refreshed");
    } catch {
      toast.error("Failed to refresh logs");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const handleExportCsv = () => {
    const headers = "id,timestamp,method,path,userId,status,durationMs,userAgent,ipAddress";
    const rows = filteredLogs.map(l =>
      [l.id, l.timestamp, l.method, l.path, l.userId || "", l.status, l.durationMs, (l.userAgent || "").replace(/,/g, ";"), l.ipAddress].join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `request-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const handleExportJson = () => {
    const json = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `request-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON exported");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/metrics">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Metrics
            </Button>
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold">Request Logs</h1>
              <p className="text-sm text-muted-foreground">
                Real-time API request history with filtering and export
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5">
                <FileSpreadsheet className="w-4 h-4" />CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportJson} className="gap-1.5">
                <FileJson className="w-4 h-4" />JSON
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-1.5">
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Total Requests</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Errors (4xx/5xx)</p>
            <p className="text-xl font-bold text-destructive">{stats.errors}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Avg Duration</p>
            <p className="text-xl font-bold">{stats.avgDuration}ms</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Max Duration</p>
            <p className="text-xl font-bold">{stats.maxDuration}ms</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Filter by endpoint..."
                value={filterPath}
                onChange={e => setFilterPath(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Input
              placeholder="Status code (e.g. 4, 404, 500)"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="h-9 text-sm"
            />
            <select
              value={filterMethod}
              onChange={e => setFilterMethod(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All Methods</option>
              {uniqueMethods.map((m: string) => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <Button
                variant={showErrors ? "default" : "outline"}
                size="sm"
                onClick={() => setShowErrors(!showErrors)}
                className="gap-1.5 h-9 flex-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {showErrors ? "Showing Errors" : "Errors Only"}
              </Button>
              <select
                value={logLimit}
                onChange={e => setLogLimit(Number(e.target.value))}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm w-20"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Log Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">
                    <button onClick={() => handleSort("timestamp")} className="flex items-center gap-1 hover:text-foreground text-muted-foreground">
                      Timestamp <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Method</th>
                  <th className="text-left p-3 font-medium">
                    <button onClick={() => handleSort("path")} className="flex items-center gap-1 hover:text-foreground text-muted-foreground">
                      Endpoint <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-3 font-medium">
                    <button onClick={() => handleSort("status")} className="flex items-center gap-1 hover:text-foreground text-muted-foreground">
                      Status <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-3 font-medium">
                    <button onClick={() => handleSort("durationMs")} className="flex items-center gap-1 hover:text-foreground text-muted-foreground">
                      Duration <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">IP</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      {logsLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                          Loading logs...
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Clock className="w-8 h-8 text-muted-foreground/50" />
                          <p>No request logs match your filters</p>
                          <p className="text-xs">Logs are captured in real-time as API requests are processed</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, i) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.01, 0.5) }}
                      className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                        log.status >= 500 ? "bg-red-500/5" : log.status >= 400 ? "bg-amber-500/5" : ""
                      }`}
                    >
                      <td className="p-3 font-mono text-xs whitespace-nowrap text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString("en-AU", {
                          hour: "2-digit", minute: "2-digit", second: "2-digit",
                          day: "2-digit", month: "short", hour12: false
                        })}
                      </td>
                      <td className="p-3"><MethodBadge method={log.method} /></td>
                      <td className="p-3 font-mono text-xs max-w-[300px] truncate" title={log.path}>{log.path}</td>
                      <td className="p-3"><StatusBadge status={log.status} /></td>
                      <td className="p-3 font-mono text-xs whitespace-nowrap">
                        <span className={log.durationMs > 1000 ? "text-red-500 font-semibold" : log.durationMs > 500 ? "text-amber-500" : ""}>
                          {log.durationMs}ms
                        </span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{log.userId || "—"}</td>
                      <td className="p-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{log.ipAddress || "—"}</td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredLogs.length > 0 && (
            <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
              <span>Showing {filteredLogs.length} of {rawLogs.length} logs</span>
              <span>Auto-refreshing every 15s</span>
            </div>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
}
