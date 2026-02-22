import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { toast } from "sonner";
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  TrendingDown,
  Shield,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Loader2,
  Download,
  Share2,
  Award,
  Clock,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

function PdfExportButton({ comparisonId }: { comparisonId: number }) {
  const exportPdf = trpc.comparisons.exportPdf.useMutation({
    onSuccess: (data) => {
      // Trigger download
      const link = document.createElement("a");
      link.href = data.url;
      link.download = data.fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("PDF report downloaded successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate PDF");
    },
  });

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => exportPdf.mutate({ id: comparisonId })}
      disabled={exportPdf.isPending}
    >
      {exportPdf.isPending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      {exportPdf.isPending ? "Generating..." : "Export PDF"}
    </Button>
  );
}

export default function ComparisonResult() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const comparisonId = parseInt(params.id || "0");

  const { data: comparison, isLoading, refetch, error: errorComparison } = trpc.comparisons.getById.useQuery(
    { id: comparisonId },
    { 
      enabled: comparisonId > 0, retry: 2,
      refetchInterval: (query) => {
        // Poll while analyzing
        if ((query.state.data as any)?.status === "analyzing") return 2000;
        return false;
      },
    }
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "green":
        return "bg-green-100 text-green-800 border-green-300";
      case "amber":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "red":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading comparison...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="container max-w-4xl">
            <Card className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-destructive" />
              <h2 className="text-2xl font-bold mb-2">Comparison Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The comparison you're looking for doesn't exist or you don't have access.
              </p>
              <Button onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const { quotes, verifications, recommendation, status, name } = comparison;
  // Type assertion for extended recommendation properties from AI analysis
  const rec = recommendation as any;
  const isAnalyzing = status === "analyzing";
  const bestQuoteId = recommendation?.bestQuoteId;

  // Sort quotes by overall score
  const sortedQuotes = [...quotes].sort((a: any, b: any) => {
    const verA = verifications.find((v: any) => v.quoteId === a.id);
    const verB = verifications.find((v: any) => v.quoteId === b.id);
    return (verB?.overallScore || 0) - (verA?.overallScore || 0);
  });

  // Calculate comparison metrics
  const amounts = quotes
    .map((q: any) => q.extractedData?.totalAmount || 0)
    .filter((a: number) => a > 0);
  const minAmount = amounts.length > 0 ? Math.min(...amounts) : 0;
  const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{name || "Quote Comparison"}</h1>
                  {isAnalyzing ? (
                    <Badge variant="secondary" className="animate-pulse">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Analyzing
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-success text-success-foreground">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Complete
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  Comparing {quotes.length} quotes side-by-side
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `VENTURR VALDT - ${comparison.name}`,
                      text: `Quote comparison: ${comparison.name}`,
                      url: window.location.href,
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard");
                  }
                }}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <PdfExportButton comparisonId={comparisonId} />
              </div>
            </div>
          </motion.div>

          {/* Analyzing State */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Analysis in Progress</h3>
                <p className="text-muted-foreground mb-4">
                  Our AI is comparing your quotes across pricing, materials, compliance, and warranty...
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">This usually takes 10-30 seconds</span>
                </div>
              </Card>
            </motion.div>
          )}

          {/* AI Recommendation */}
          {!isAnalyzing && recommendation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-7 h-7 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-bold text-green-800 dark:text-green-200">
                        AI Recommendation
                      </h2>
                      <Badge className="bg-green-600 text-white">Best Value</Badge>
                    </div>
                    <p className="text-lg text-green-700 dark:text-green-300 mb-4">
                      {recommendation.reasoning}
                    </p>
                    
                    {(recommendation.estimatedSavings || 0) > 0 && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/50 rounded-lg border border-green-200 dark:border-green-700">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-700 dark:text-green-300">
                          Potential Savings: {formatCurrency(recommendation.estimatedSavings || 0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Key Differences */}
          {!isAnalyzing && recommendation?.keyDifferences && recommendation.keyDifferences.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Key Differences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendation.keyDifferences.map((diff: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {diff.category === "pricing" && <DollarSign className="w-4 h-4 text-primary" />}
                        {diff.category === "materials" && <Shield className="w-4 h-4 text-primary" />}
                        {diff.category === "compliance" && <CheckCircle2 className="w-4 h-4 text-primary" />}
                        {diff.category === "warranty" && <Award className="w-4 h-4 text-primary" />}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{diff.category}</p>
                        <p className="text-sm text-muted-foreground">{diff.difference}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Side-by-Side Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="side-by-side">Side-by-Side</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="scores">Scores</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedQuotes.map((quote: any, index: number) => {
                    const verification = verifications.find((v: any) => v.quoteId === quote.id);
                    const isBest = quote.id === bestQuoteId;
                    const amount = quote.extractedData?.totalAmount || 0;
                    const isCheapest = amount === minAmount && amount > 0;
                    const isMostExpensive = amount === maxAmount && amount > 0;

                    return (
                      <motion.div
                        key={quote.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card
                          className={`p-6 relative ${
                            isBest
                              ? "ring-2 ring-green-500 border-green-500 bg-green-50/50 dark:bg-green-950/20"
                              : ""
                          }`}
                        >
                          {/* Best badge */}
                          {isBest && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <Badge className="bg-green-600 text-white shadow-lg">
                                <Trophy className="w-3 h-3 mr-1" />
                                BEST VALUE
                              </Badge>
                            </div>
                          )}

                          {/* Header */}
                          <div className="mb-4 pt-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                Option {String.fromCharCode(65 + index)}
                              </span>
                              {verification && (
                                <Badge
                                  variant="outline"
                                  className={getStatusBadgeStyle(verification.statusBadge)}
                                >
                                  {verification.statusBadge.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-bold text-lg line-clamp-2">
                              {quote.extractedData?.contractor || 
                               (quote.fileName ? quote.fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") : `Quote ${index + 1}`)}
                            </h3>
                            {/* Additional contractor details or file info */}
                            <div className="mt-2 space-y-1">
                              {quote.extractedData?.abn ? (
                                <p className="text-xs text-muted-foreground">
                                  ABN: {quote.extractedData.abn}
                                </p>
                              ) : quote.fileName && (
                                <p className="text-xs text-muted-foreground truncate" title={quote.fileName}>
                                  File: {quote.fileName}
                                </p>
                              )}
                              {quote.extractedData?.licenseNumber && (
                                <p className="text-xs text-muted-foreground">
                                  License: {quote.extractedData.licenseNumber}
                                </p>
                              )}
                              {quote.extractedData?.quoteDate ? (
                                <p className="text-xs text-muted-foreground">
                                  Quote Date: {new Date(quote.extractedData.quoteDate).toLocaleDateString('en-AU')}
                                </p>
                              ) : quote.createdAt && (
                                <p className="text-xs text-muted-foreground">
                                  Uploaded: {new Date(quote.createdAt).toLocaleDateString('en-AU')}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Price */}
                          <div className="mb-6">
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold">
                                {amount > 0 ? formatCurrency(amount) : "N/A"}
                              </span>
                              {isCheapest && (
                                <Badge variant="secondary" className="bg-success/10 text-success">
                                  <TrendingDown className="w-3 h-3 mr-1" />
                                  Lowest
                                </Badge>
                              )}
                              {isMostExpensive && (
                                <Badge variant="secondary" className="bg-warning/10 text-warning">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Highest
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Overall Score */}
                          {verification && (
                            <div className="mb-6">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Overall Score</span>
                                <span className={`text-lg font-bold ${getScoreColor(verification.overallScore)}`}>
                                  {verification.overallScore}/100
                                </span>
                              </div>
                              <div className="h-3 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${getScoreBgColor(verification.overallScore)}`}
                                  style={{ width: `${verification.overallScore}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Score breakdown */}
                          {verification && (
                            <div className="grid grid-cols-2 gap-3 mb-6">
                              <div className="p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">Pricing</span>
                                </div>
                                <span className={`font-bold ${getScoreColor(verification.pricingScore)}`}>
                                  {verification.pricingScore}
                                </span>
                              </div>
                              <div className="p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <Shield className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">Materials</span>
                                </div>
                                <span className={`font-bold ${getScoreColor(verification.materialsScore)}`}>
                                  {verification.materialsScore}
                                </span>
                              </div>
                              <div className="p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">Compliance</span>
                                </div>
                                <span className={`font-bold ${getScoreColor(verification.complianceScore)}`}>
                                  {verification.complianceScore}
                                </span>
                              </div>
                              <div className="p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <Award className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">Warranty</span>
                                </div>
                                <span className={`font-bold ${getScoreColor(verification.warrantyScore)}`}>
                                  {verification.warrantyScore}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* View Report Button */}
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setLocation(`/quote/${quote.id}`)}
                          >
                            View Full Report
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="pricing">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Pricing Comparison</h3>
                  <div className="space-y-4">
                    {sortedQuotes.map((quote: any, index: number) => {
                      const amount = quote.extractedData?.totalAmount || 0;
                      const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                      const isBest = quote.id === bestQuoteId;

                      return (
                        <div key={quote.id} className="flex items-center gap-4">
                          <div className="w-32 flex-shrink-0">
                            <span className="font-medium">
                              {quote.extractedData?.contractor || 
                               (quote.fileName ? quote.fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") : `Option ${String.fromCharCode(65 + index)}`)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="h-8 bg-muted rounded-full overflow-hidden relative">
                              <div
                                className={`h-full transition-all ${
                                  isBest ? "bg-green-500" : "bg-primary"
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                              <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                                {amount > 0 ? formatCurrency(amount) : "N/A"}
                              </span>
                            </div>
                          </div>
                          {isBest && (
                            <Badge className="bg-green-600 text-white flex-shrink-0">
                              Best
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {rec?.detailedAnalysis?.pricing && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        AI Analysis
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {rec?.detailedAnalysis?.pricing}
                      </p>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="scores">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Score Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Quote</th>
                          <th className="text-center py-3 px-4">Overall</th>
                          <th className="text-center py-3 px-4">Pricing</th>
                          <th className="text-center py-3 px-4">Materials</th>
                          <th className="text-center py-3 px-4">Compliance</th>
                          <th className="text-center py-3 px-4">Warranty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedQuotes.map((quote: any, index: number) => {
                          const verification = verifications.find((v: any) => v.quoteId === quote.id);
                          const isBest = quote.id === bestQuoteId;

                          return (
                            <tr
                              key={quote.id}
                              className={`border-b ${isBest ? "bg-green-50 dark:bg-green-950/20" : ""}`}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  {isBest && <Trophy className="w-4 h-4 text-green-600" />}
                                  <span className="font-medium">
                                    {quote.extractedData?.contractor || 
                                     (quote.fileName ? quote.fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") : `Option ${String.fromCharCode(65 + index)}`)}
                                  </span>
                                </div>
                              </td>
                              <td className="text-center py-3 px-4">
                                <span className={`font-bold ${getScoreColor(verification?.overallScore || 0)}`}>
                                  {verification?.overallScore || "-"}
                                </span>
                              </td>
                              <td className="text-center py-3 px-4">
                                <span className={getScoreColor(verification?.pricingScore || 0)}>
                                  {verification?.pricingScore || "-"}
                                </span>
                              </td>
                              <td className="text-center py-3 px-4">
                                <span className={getScoreColor(verification?.materialsScore || 0)}>
                                  {verification?.materialsScore || "-"}
                                </span>
                              </td>
                              <td className="text-center py-3 px-4">
                                <span className={getScoreColor(verification?.complianceScore || 0)}>
                                  {verification?.complianceScore || "-"}
                                </span>
                              </td>
                              <td className="text-center py-3 px-4">
                                <span className={getScoreColor(verification?.warrantyScore || 0)}>
                                  {verification?.warrantyScore || "-"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>

              {/* Side-by-Side Comparison Tab */}
              <TabsContent value="side-by-side">
                <div className="space-y-6">
                  {/* Pricing Side-by-Side */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      Pricing Comparison
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 w-40">Metric</th>
                            {sortedQuotes.map((q: any, i: number) => {
                              const isBest = q.id === bestQuoteId;
                              return (
                                <th key={q.id} className={`text-center py-3 px-4 ${isBest ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
                                  <div className="flex items-center justify-center gap-1">
                                    {isBest && <Trophy className="w-3 h-3 text-green-600" />}
                                    <span>{q.extractedData?.contractor || `Option ${String.fromCharCode(65 + i)}`}</span>
                                  </div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-3 px-4 font-medium">Total Amount</td>
                            {sortedQuotes.map((q: any) => {
                              const amount = q.extractedData?.totalAmount || 0;
                              const isCheapest = amount === minAmount && amount > 0;
                              const isMostExpensive = amount === maxAmount && amount > 0;
                              return (
                                <td key={q.id} className={`text-center py-3 px-4 font-semibold ${
                                  isCheapest ? 'text-green-600 bg-green-50 dark:bg-green-950/20' : 
                                  isMostExpensive ? 'text-red-600 bg-red-50 dark:bg-red-950/20' : ''
                                }`}>
                                  {amount > 0 ? formatCurrency(amount) : 'N/A'}
                                  {isCheapest && <span className="block text-xs mt-1">Lowest</span>}
                                  {isMostExpensive && <span className="block text-xs mt-1">Highest</span>}
                                </td>
                              );
                            })}
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-4 font-medium">Price vs Average</td>
                            {(() => {
                              const avg = amounts.length > 0 ? amounts.reduce((a: number, b: number) => a + b, 0) / amounts.length : 0;
                              return sortedQuotes.map((q: any) => {
                                const amount = q.extractedData?.totalAmount || 0;
                                const diff = amount > 0 ? ((amount - avg) / avg * 100) : 0;
                                return (
                                  <td key={q.id} className={`text-center py-3 px-4 ${
                                    diff < -5 ? 'text-green-600' : diff > 5 ? 'text-red-600' : 'text-muted-foreground'
                                  }`}>
                                    {amount > 0 ? `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%` : 'N/A'}
                                  </td>
                                );
                              });
                            })()}
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-4 font-medium">Potential Savings</td>
                            {sortedQuotes.map((q: any) => {
                              const ver = verifications.find((v: any) => v.quoteId === q.id);
                              const savings = ver?.potentialSavings || 0;
                              return (
                                <td key={q.id} className={`text-center py-3 px-4 ${savings > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                                  {savings > 0 ? formatCurrency(savings) : 'None identified'}
                                </td>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Materials & Quality Side-by-Side */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Materials & Quality
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 w-40">Metric</th>
                            {sortedQuotes.map((q: any, i: number) => (
                              <th key={q.id} className={`text-center py-3 px-4 ${q.id === bestQuoteId ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
                                {q.extractedData?.contractor || `Option ${String.fromCharCode(65 + i)}`}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-3 px-4 font-medium">Materials Score</td>
                            {sortedQuotes.map((q: any) => {
                              const ver = verifications.find((v: any) => v.quoteId === q.id);
                              const score = ver?.materialsScore || 0;
                              const isHighest = sortedQuotes.every((oq: any) => {
                                const ov = verifications.find((v: any) => v.quoteId === oq.id);
                                return (ov?.materialsScore || 0) <= score;
                              });
                              return (
                                <td key={q.id} className={`text-center py-3 px-4 font-bold ${getScoreColor(score)} ${isHighest ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
                                  {score}/100
                                  {isHighest && score > 0 && <span className="block text-xs text-green-600 mt-1">Best</span>}
                                </td>
                              );
                            })}
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-4 font-medium">ABN Listed</td>
                            {sortedQuotes.map((q: any) => (
                              <td key={q.id} className="text-center py-3 px-4">
                                {q.extractedData?.abn ? (
                                  <span className="text-green-600 font-medium">{q.extractedData.abn}</span>
                                ) : (
                                  <span className="text-red-500">Not provided</span>
                                )}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-4 font-medium">License Number</td>
                            {sortedQuotes.map((q: any) => (
                              <td key={q.id} className="text-center py-3 px-4">
                                {q.extractedData?.licenseNumber ? (
                                  <span className="text-green-600 font-medium">{q.extractedData.licenseNumber}</span>
                                ) : (
                                  <span className="text-red-500">Not provided</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Compliance Side-by-Side */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Compliance & Warranty
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 w-40">Metric</th>
                            {sortedQuotes.map((q: any, i: number) => (
                              <th key={q.id} className={`text-center py-3 px-4 ${q.id === bestQuoteId ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
                                {q.extractedData?.contractor || `Option ${String.fromCharCode(65 + i)}`}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-3 px-4 font-medium">Compliance Score</td>
                            {sortedQuotes.map((q: any) => {
                              const ver = verifications.find((v: any) => v.quoteId === q.id);
                              const score = ver?.complianceScore || 0;
                              const isHighest = sortedQuotes.every((oq: any) => {
                                const ov = verifications.find((v: any) => v.quoteId === oq.id);
                                return (ov?.complianceScore || 0) <= score;
                              });
                              return (
                                <td key={q.id} className={`text-center py-3 px-4 font-bold ${getScoreColor(score)} ${isHighest ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
                                  {score}/100
                                  {isHighest && score > 0 && <span className="block text-xs text-green-600 mt-1">Best</span>}
                                </td>
                              );
                            })}
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-4 font-medium">Warranty Score</td>
                            {sortedQuotes.map((q: any) => {
                              const ver = verifications.find((v: any) => v.quoteId === q.id);
                              const score = ver?.warrantyScore || 0;
                              const isHighest = sortedQuotes.every((oq: any) => {
                                const ov = verifications.find((v: any) => v.quoteId === oq.id);
                                return (ov?.warrantyScore || 0) <= score;
                              });
                              return (
                                <td key={q.id} className={`text-center py-3 px-4 font-bold ${getScoreColor(score)} ${isHighest ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
                                  {score}/100
                                  {isHighest && score > 0 && <span className="block text-xs text-green-600 mt-1">Best</span>}
                                </td>
                              );
                            })}
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-4 font-medium">Status</td>
                            {sortedQuotes.map((q: any) => {
                              const ver = verifications.find((v: any) => v.quoteId === q.id);
                              return (
                                <td key={q.id} className="text-center py-3 px-4">
                                  <Badge variant="outline" className={getStatusBadgeStyle(ver?.statusBadge || 'gray')}>
                                    {(ver?.statusBadge || 'N/A').toUpperCase()}
                                  </Badge>
                                </td>
                              );
                            })}
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-4 font-medium">Red Flags</td>
                            {sortedQuotes.map((q: any) => {
                              const ver = verifications.find((v: any) => v.quoteId === q.id);
                              const flags = ver?.flags || [];
                              const criticalFlags = flags.filter((f: any) => f.severity === 'critical' || f.severity === 'high');
                              return (
                                <td key={q.id} className={`text-center py-3 px-4 ${
                                  criticalFlags.length > 0 ? 'text-red-600 bg-red-50 dark:bg-red-950/20' : 'text-green-600'
                                }`}>
                                  {criticalFlags.length > 0 ? (
                                    <div>
                                      <AlertTriangle className="w-4 h-4 mx-auto mb-1" />
                                      <span className="text-xs">{criticalFlags.length} issue{criticalFlags.length > 1 ? 's' : ''}</span>
                                    </div>
                                  ) : (
                                    <div>
                                      <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                                      <span className="text-xs">Clear</span>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Overall Verdict */}
                  <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Overall Verdict
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-primary/20">
                            <th className="text-left py-3 px-4 w-40">Category</th>
                            {sortedQuotes.map((q: any, i: number) => (
                              <th key={q.id} className={`text-center py-3 px-4 ${q.id === bestQuoteId ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
                                {q.extractedData?.contractor || `Option ${String.fromCharCode(65 + i)}`}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {['pricing', 'materials', 'compliance', 'warranty'].map((category) => {
                            const scoreKey = `${category}Score` as string;
                            const scores = sortedQuotes.map((q: any) => {
                              const ver = verifications.find((v: any) => v.quoteId === q.id);
                              return { id: q.id, score: (ver as any)?.[scoreKey] || 0 };
                            });
                            const maxScore = Math.max(...scores.map(s => s.score));
                            const winnerId = scores.find(s => s.score === maxScore)?.id;

                            return (
                              <tr key={category} className="border-b border-primary/10">
                                <td className="py-3 px-4 font-medium capitalize">{category}</td>
                                {sortedQuotes.map((q: any) => {
                                  const ver = verifications.find((v: any) => v.quoteId === q.id);
                                  const score = (ver as any)?.[scoreKey] || 0;
                                  const isWinner = q.id === winnerId && score > 0;
                                  return (
                                    <td key={q.id} className={`text-center py-3 px-4 ${isWinner ? 'bg-green-50 dark:bg-green-950/20 font-bold' : ''}`}>
                                      <span className={getScoreColor(score)}>{score}</span>
                                      {isWinner && <Trophy className="w-3 h-3 inline ml-1 text-green-600" />}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                          <tr className="bg-muted/30">
                            <td className="py-3 px-4 font-bold">Overall</td>
                            {sortedQuotes.map((q: any) => {
                              const ver = verifications.find((v: any) => v.quoteId === q.id);
                              const isBest = q.id === bestQuoteId;
                              return (
                                <td key={q.id} className={`text-center py-3 px-4 ${isBest ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
                                  <span className={`text-lg font-bold ${getScoreColor(ver?.overallScore || 0)}`}>
                                    {ver?.overallScore || 0}
                                  </span>
                                  {isBest && (
                                    <Badge className="ml-2 bg-green-600 text-white text-xs">
                                      Winner
                                    </Badge>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="details">
                <div className="space-y-6">
                  {rec?.detailedAnalysis && (
                    <>
                      <Card className="p-6">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-primary" />
                          Pricing Analysis
                        </h4>
                        <p className="text-muted-foreground">
                          {rec?.detailedAnalysis?.pricing}
                        </p>
                      </Card>

                      <Card className="p-6">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-primary" />
                          Materials Analysis
                        </h4>
                        <p className="text-muted-foreground">
                          {rec?.detailedAnalysis?.materials}
                        </p>
                      </Card>

                      <Card className="p-6">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                          Compliance Analysis
                        </h4>
                        <p className="text-muted-foreground">
                          {rec?.detailedAnalysis?.compliance}
                        </p>
                      </Card>

                      <Card className="p-6">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Award className="w-5 h-5 text-primary" />
                          Warranty Analysis
                        </h4>
                        <p className="text-muted-foreground">
                          {rec?.detailedAnalysis?.warranty}
                        </p>
                      </Card>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Disclaimer */}
          <div className="mt-8">
            <Disclaimer variant="compact" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
