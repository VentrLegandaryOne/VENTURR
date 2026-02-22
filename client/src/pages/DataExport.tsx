import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  Calendar,
  Filter,
  CheckCircle,
  Loader2,
  AlertCircle,
  Clock,
  Database,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

interface ExportOptions {
  format: "csv" | "json" | "pdf";
  startDate: string;
  endDate: string;
  status: string;
  includeVerifications: boolean;
}

const initialOptions: ExportOptions = {
  format: "csv",
  startDate: "",
  endDate: "",
  status: "all",
  includeVerifications: true,
};

// Recent exports (sample data)
const recentExports = [
  {
    id: 1,
    format: "csv",
    date: "2024-12-28T14:30:00Z",
    records: 45,
    size: "128 KB",
    status: "completed",
  },
  {
    id: 2,
    format: "json",
    date: "2024-12-25T09:15:00Z",
    records: 32,
    size: "256 KB",
    status: "completed",
  },
  {
    id: 3,
    format: "pdf",
    date: "2024-12-20T16:45:00Z",
    records: 1,
    size: "1.2 MB",
    status: "completed",
  },
];

export default function DataExport() {
  
  const [options, setOptions] = useState<ExportOptions>(initialOptions);
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{
    success: boolean;
    url?: string;
    fileName?: string;
    recordCount?: number;
  } | null>(null);

  const exportCSV = trpc.quotes.exportCSV.useMutation();
  const exportJSON = trpc.quotes.exportJSON.useMutation();

  const updateOptions = (updates: Partial<ExportOptions>) => {
    setOptions((prev) => ({ ...prev, ...updates }));
    setExportResult(null);
  };

  const handleExport = async () => {
    setExporting(true);
    setExportResult(null);

    try {
      const params = {
        startDate: options.startDate || undefined,
        endDate: options.endDate || undefined,
        status: options.status !== "all" ? (options.status as "pending" | "processing" | "completed" | "failed") : undefined,
      };

      let result;
      if (options.format === "csv") {
        result = await exportCSV.mutateAsync(params);
        setExportResult({
          success: true,
          url: result.csvUrl,
          fileName: result.fileName,
          recordCount: result.recordCount,
        });
      } else if (options.format === "json") {
        result = await exportJSON.mutateAsync({
          ...params,
          includeVerifications: options.includeVerifications,
        });
        setExportResult({
          success: true,
          url: result.jsonUrl,
          fileName: result.fileName,
          recordCount: result.recordCount,
        });
      } else {
        // PDF export would be handled differently
        toast.info("Please use the individual quote export for PDF reports.");
      }
    } catch (error) {
toast.error("Unable to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const downloadFile = () => {
    if (exportResult?.url) {
      window.open(exportResult.url, "_blank");
    }
  };

  const formatIcons = {
    csv: FileSpreadsheet,
    json: FileJson,
    pdf: FileText,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 triangle-pattern opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4">
              <Database className="w-3 h-3 mr-1" />
              Data Export
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Export Your Data
            </h1>
            <p className="text-muted-foreground">
              Download your quote verifications and analysis data in CSV, JSON, or PDF format for reporting and integration.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Tabs defaultValue="export">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="export">
                <Download className="w-4 h-4 mr-2" />
                New Export
              </TabsTrigger>
              <TabsTrigger value="history">
                <Clock className="w-4 h-4 mr-2" />
                Export History
              </TabsTrigger>
            </TabsList>

            {/* New Export Tab */}
            <TabsContent value="export">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Export Options */}
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Export Options</CardTitle>
                      <CardDescription>
                        Configure your data export settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Format Selection */}
                      <div className="space-y-3">
                        <Label>Export Format</Label>
                        <div className="grid grid-cols-3 gap-3">
                          {(["csv", "json", "pdf"] as const).map((format) => {
                            const Icon = formatIcons[format];
                            return (
                              <div
                                key={format}
                                className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                  options.format === format
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                                onClick={() => updateOptions({ format })}
                              >
                                <Icon className={`w-8 h-8 mb-2 ${options.format === format ? "text-primary" : "text-muted-foreground"}`} />
                                <span className="font-medium uppercase">{format}</span>
                                <span className="text-xs text-muted-foreground">
                                  {format === "csv" && "Spreadsheet"}
                                  {format === "json" && "API/Dev"}
                                  {format === "pdf" && "Reports"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Date Range */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={options.startDate}
                            onChange={(e) => updateOptions({ startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={options.endDate}
                            onChange={(e) => updateOptions({ endDate: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Status Filter */}
                      <div className="space-y-2">
                        <Label>Quote Status</Label>
                        <Select
                          value={options.status}
                          onValueChange={(value) => updateOptions({ status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Include Verifications (JSON only) */}
                      {options.format === "json" && (
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="includeVerifications"
                            checked={options.includeVerifications}
                            onCheckedChange={(checked) =>
                              updateOptions({ includeVerifications: checked as boolean })
                            }
                          />
                          <Label htmlFor="includeVerifications" className="cursor-pointer">
                            Include full verification details (scores, recommendations, analysis)
                          </Label>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleExport}
                        disabled={exporting || options.format === "pdf"}
                      >
                        {exporting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Export Result */}
                  {exportResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4"
                    >
                      <Alert className="bg-green-500/10 border-green-500/20">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <AlertTitle className="text-green-700">Export Ready</AlertTitle>
                        <AlertDescription className="text-green-600">
                          <div className="mt-2 space-y-2">
                            <p><strong>File:</strong> {exportResult.fileName}</p>
                            <p><strong>Records:</strong> {exportResult.recordCount}</p>
                            <Button
                              size="sm"
                              className="mt-2"
                              onClick={downloadFile}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download File
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </div>

                {/* Format Info */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4" />
                        CSV Format
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <ul className="space-y-1">
                        <li>• Compatible with Excel, Google Sheets</li>
                        <li>• Flat structure, easy to filter</li>
                        <li>• Best for reporting and analysis</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileJson className="w-4 h-4" />
                        JSON Format
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <ul className="space-y-1">
                        <li>• Structured data with nested objects</li>
                        <li>• Full verification details included</li>
                        <li>• Best for API integration</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Data Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <ul className="space-y-1">
                        <li>• Exports contain only your data</li>
                        <li>• Download links expire in 24 hours</li>
                        <li>• All transfers are encrypted</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Export History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Exports</CardTitle>
                  <CardDescription>
                    Your export history from the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentExports.length === 0 ? (
                    <div className="text-center py-12">
                      <Download className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Exports Yet</h3>
                      <p className="text-muted-foreground">
                        Your export history will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentExports.map((exp) => {
                        const Icon = formatIcons[exp.format as keyof typeof formatIcons];
                        return (
                          <div
                            key={exp.id}
                            className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Icon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {exp.format.toUpperCase()} Export
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(exp.date).toLocaleDateString("en-AU", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right text-sm">
                                <div>{exp.records} records</div>
                                <div className="text-muted-foreground">{exp.size}</div>
                              </div>
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {exp.status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* API Integration Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Enterprise Integration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Automated Exports</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Set up scheduled exports to automatically send data to your systems via webhook or SFTP. Contact our enterprise team to enable this feature.
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild>
                  <a href="/api-docs">View API Documentation</a>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bulk Export API</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Use our REST API to programmatically export data in any format. Perfect for integrating with your existing business intelligence tools.
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild>
                  <a href="/api-docs">Get API Access</a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
