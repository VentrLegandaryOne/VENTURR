import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Shield, Plus, Trash2, TestTube, Webhook,
  CheckCircle2, XCircle, AlertTriangle, Loader2, ToggleLeft, ToggleRight
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

interface WebhookFormData {
  id: string;
  type: "slack" | "discord";
  url: string;
  enabled: boolean;
  alertOnDegraded: boolean;
  alertOnCritical: boolean;
}

const defaultForm: WebhookFormData = {
  id: "",
  type: "slack",
  url: "",
  enabled: true,
  alertOnDegraded: true,
  alertOnCritical: true,
};

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-sm"
    >
      {checked ? (
        <ToggleRight className="w-5 h-5 text-primary" />
      ) : (
        <ToggleLeft className="w-5 h-5 text-muted-foreground" />
      )}
      <span className={checked ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </button>
  );
}

export default function AdminWebhooks() {
  const { isAuthenticated, user, loading } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<WebhookFormData>({ ...defaultForm });
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; error?: string }>>({});

  const utils = trpc.useUtils();

  const { data: webhooksData, error: webhooksError, isLoading: webhooksLoading, refetch: refetchWebhooks } = trpc.metrics.webhookList.useQuery(undefined, {
    staleTime: 10000,
    retry: 2,
  });

  const { data: webhookStatsData, error: webhookStatsError } = trpc.metrics.webhookStats.useQuery(undefined, {
    staleTime: 10000,
    retry: 2,
  });

  const registerMutation = trpc.metrics.webhookRegister.useMutation({
    onSuccess: () => {
      toast.success("Webhook registered successfully");
      setShowAddForm(false);
      setForm({ ...defaultForm });
      utils.metrics.webhookList.invalidate();
      utils.metrics.webhookStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const unregisterMutation = trpc.metrics.webhookUnregister.useMutation({
    onSuccess: () => {
      toast.success("Webhook removed");
      utils.metrics.webhookList.invalidate();
      utils.metrics.webhookStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const testMutation = trpc.metrics.webhookTest.useMutation({
    onSuccess: (result, variables) => {
      setTestResults(prev => ({ ...prev, [variables.id]: result }));
      setTestingId(null);
      if (result.success) {
        toast.success("Test notification sent successfully");
      } else {
        toast.error(`Test failed: ${result.error || "Unknown error"}`);
      }
    },
    onError: (err) => {
      setTestingId(null);
      toast.error(err.message);
    },
  });

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

  const webhooks = webhooksData || [];
  const stats = webhookStatsData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id.trim() || !form.url.trim()) {
      toast.error("Webhook ID and URL are required");
      return;
    }
    // Validate URL format
    try {
      new URL(form.url);
    } catch {
      toast.error("Invalid webhook URL");
      return;
    }
    registerMutation.mutate(form);
  };

  const handleTest = (id: string) => {
    setTestingId(id);
    setTestResults(prev => { const next = { ...prev }; delete next[id]; return next; });
    testMutation.mutate({ id });
  };

  const handleDelete = (id: string) => {
    if (confirm(`Remove webhook "${id}"? This cannot be undone.`)) {
      unregisterMutation.mutate({ id });
    }
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Webhook className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Webhook Configuration</h1>
                <p className="text-sm text-muted-foreground">
                  Configure Slack and Discord webhooks for health alerts
                </p>
              </div>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-1.5">
              <Plus className="w-4 h-4" />
              Add Webhook
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Total Webhooks</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Enabled</p>
              <p className="text-xl font-bold text-green-500">{stats.enabled}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Disabled</p>
              <p className="text-xl font-bold text-muted-foreground">{stats.disabled}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Types</p>
              <div className="flex gap-2 mt-1">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}: {count as number}
                  </Badge>
                ))}
                {Object.keys(stats.byType).length === 0 && (
                  <span className="text-sm text-muted-foreground">None</span>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Add Webhook Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Add New Webhook</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Webhook ID</label>
                      <Input
                        placeholder="e.g. slack-alerts, discord-ops"
                        value={form.id}
                        onChange={e => setForm(f => ({ ...f, id: e.target.value.replace(/[^a-zA-Z0-9_-]/g, "") }))}
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Alphanumeric, hyphens, underscores only</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Type</label>
                      <select
                        value={form.type}
                        onChange={e => setForm(f => ({ ...f, type: e.target.value as "slack" | "discord" }))}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="slack">Slack</option>
                        <option value="discord">Discord</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Webhook URL</label>
                    <Input
                      placeholder={form.type === "slack"
                        ? "https://hooks.slack.com/services/T.../B.../..."
                        : "https://discord.com/api/webhooks/..."}
                      value={form.url}
                      onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                      className="h-9 font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {form.type === "slack"
                        ? "Create an Incoming Webhook in your Slack workspace settings"
                        : "Create a Webhook in your Discord server's Integrations settings"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    <Toggle checked={form.enabled} onChange={v => setForm(f => ({ ...f, enabled: v }))} label="Enabled" />
                    <Toggle checked={form.alertOnDegraded} onChange={v => setForm(f => ({ ...f, alertOnDegraded: v }))} label="Alert on Degraded" />
                    <Toggle checked={form.alertOnCritical} onChange={v => setForm(f => ({ ...f, alertOnCritical: v }))} label="Alert on Critical" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={registerMutation.isPending} className="gap-1.5">
                      {registerMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                      Register Webhook
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); setForm({ ...defaultForm }); }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Webhook List */}
        <div className="space-y-3">
          {webhooksLoading ? (
            <Card className="p-8 text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading webhooks...
              </div>
            </Card>
          ) : webhooks.length === 0 ? (
            <Card className="p-8 text-center">
              <Webhook className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground mb-1">No webhooks configured</p>
              <p className="text-xs text-muted-foreground mb-4">
                Add a Slack or Discord webhook to receive health alerts when services degrade
              </p>
              <Button size="sm" onClick={() => setShowAddForm(true)} className="gap-1.5">
                <Plus className="w-4 h-4" />
                Add Your First Webhook
              </Button>
            </Card>
          ) : (
            webhooks.map((wh) => {
              const testResult = testResults[wh.id];
              return (
                <motion.div
                  key={wh.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{wh.id}</span>
                          <Badge variant={wh.type === "slack" ? "default" : "secondary"} className="text-xs">
                            {wh.type === "slack" ? "Slack" : "Discord"}
                          </Badge>
                          <Badge variant={wh.enabled ? "default" : "outline"} className="text-xs">
                            {wh.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <p className="text-xs font-mono text-muted-foreground truncate mb-2" title={wh.url}>
                          {wh.url}
                        </p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            {wh.alertOnDegraded ? <CheckCircle2 className="w-3 h-3 text-amber-500" /> : <XCircle className="w-3 h-3" />}
                            Degraded alerts
                          </span>
                          <span className="flex items-center gap-1">
                            {wh.alertOnCritical ? <CheckCircle2 className="w-3 h-3 text-red-500" /> : <XCircle className="w-3 h-3" />}
                            Critical alerts
                          </span>
                        </div>
                        {/* Test result */}
                        {testResult && (
                          <div className={`mt-2 text-xs flex items-center gap-1.5 ${testResult.success ? "text-green-500" : "text-red-500"}`}>
                            {testResult.success ? (
                              <><CheckCircle2 className="w-3.5 h-3.5" /> Test notification sent successfully</>
                            ) : (
                              <><AlertTriangle className="w-3.5 h-3.5" /> Test failed: {testResult.error}</>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTest(wh.id)}
                          disabled={testingId === wh.id}
                          className="gap-1.5"
                        >
                          {testingId === wh.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <TestTube className="w-3.5 h-3.5" />
                          )}
                          Test
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(wh.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
