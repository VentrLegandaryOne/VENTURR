import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
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
  Plus,
  X,
  ChevronRight,
  Star,
  Award,
} from "lucide-react";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

interface QuoteWithVerification {
  id: number;
  fileName: string;
  extractedData: {
    contractor?: string;
    totalAmount?: number;
    projectAddress?: string;
  } | null;
  verification?: {
    overallScore: number;
    pricingScore: number;
    materialsScore: number;
    complianceScore: number;
    warrantyScore: number;
    statusBadge: "green" | "amber" | "red";
    potentialSavings: number;
  };
}

export default function QuoteCompare() {
  const [, setLocation] = useLocation();
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<number[]>([]);
  const [comparisonName, setComparisonName] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch user's completed quotes
  const { data: quotes, isLoading: quotesLoading, error: errorQuotes } = trpc.quotes.list.useQuery(undefined, { retry: 2 });

  // Filter to only show completed quotes with verifications
  const completedQuotes = useMemo(() => {
    if (!quotes) return [];
    return quotes.filter((q: any) => q.status === "completed");
  }, [quotes]);

  // Create comparison mutation
  const createComparisonMutation = trpc.comparisons.create.useMutation({
    onSuccess: (data) => {
      toast.success("Comparison created! Analyzing quotes...");
      setLocation(`/comparison/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create comparison");
      setIsCreating(false);
    },
  });

  const toggleQuoteSelection = (quoteId: number) => {
    setSelectedQuoteIds((prev) => {
      if (prev.includes(quoteId)) {
        return prev.filter((id) => id !== quoteId);
      }
      if (prev.length >= 4) {
        toast.error("Maximum 4 quotes can be compared at once");
        return prev;
      }
      return [...prev, quoteId];
    });
  };

  const handleCreateComparison = () => {
    if (selectedQuoteIds.length < 2) {
      toast.error("Please select at least 2 quotes to compare");
      return;
    }
    setShowCreateDialog(true);
  };

  const confirmCreateComparison = () => {
    if (!comparisonName.trim()) {
      toast.error("Please enter a name for the comparison");
      return;
    }
    setIsCreating(true);
    createComparisonMutation.mutate({
      name: comparisonName,
      quoteIds: selectedQuoteIds,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "green":
        return "bg-green-100 text-green-800 border-green-200";
      case "amber":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "red":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate comparison preview stats
  const comparisonPreview = useMemo(() => {
    if (selectedQuoteIds.length < 2) return null;

    const selectedQuotes = completedQuotes.filter((q: any) =>
      selectedQuoteIds.includes(q.id)
    );

    const amounts = selectedQuotes
      .map((q: any) => q.extractedData?.totalAmount || 0)
      .filter((a: number) => a > 0);

    if (amounts.length === 0) return null;

    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);
    const potentialSavings = maxAmount - minAmount;

    const scores = selectedQuotes
      .map((q: any) => q.verification?.overallScore || 0)
      .filter((s: number) => s > 0);

    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
      : 0;

    return {
      quotesCount: selectedQuoteIds.length,
      potentialSavings,
      priceRange: { min: minAmount, max: maxAmount },
      avgScore,
    };
  }, [selectedQuoteIds, completedQuotes]);

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
                <h1 className="text-3xl font-bold mb-2">Compare Quotes</h1>
                <p className="text-muted-foreground">
                  Select 2-4 verified quotes to compare side-by-side and find the best value
                </p>
              </div>

              {selectedQuoteIds.length >= 2 && (
                <Button
                  size="lg"
                  onClick={handleCreateComparison}
                  className="shadow-lg"
                >
                  <Scale className="w-5 h-5 mr-2" />
                  Compare {selectedQuoteIds.length} Quotes
                </Button>
              )}
            </div>
          </motion.div>

          {/* Comparison Preview Card */}
          <AnimatePresence>
            {comparisonPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <Card className="p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Comparison Preview</h3>
                      <p className="text-sm text-muted-foreground">
                        {comparisonPreview.quotesCount} quotes selected
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Potential Savings</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(comparisonPreview.potentialSavings)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Price Range</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(comparisonPreview.priceRange.min)} -{" "}
                          {formatCurrency(comparisonPreview.priceRange.max)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Score</p>
                        <p className="text-lg font-semibold">
                          {comparisonPreview.avgScore}/100
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quotes Grid */}
          {quotesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-6 bg-muted rounded mb-4" />
                  <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                  <div className="h-8 bg-muted rounded w-1/2" />
                </Card>
              ))}
            </div>
          ) : completedQuotes.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">No Verified Quotes Yet</h3>
              <p className="text-muted-foreground mb-6">
                Upload and verify at least 2 quotes to start comparing
              </p>
              <Button onClick={() => setLocation("/quote/upload")}>
                <Plus className="w-4 h-4 mr-2" />
                Upload Quote
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedQuotes.map((quote: any, index: number) => {
                const isSelected = selectedQuoteIds.includes(quote.id);
                const verification = quote.verification;

                return (
                  <motion.div
                    key={quote.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        isSelected
                          ? "ring-2 ring-primary border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => toggleQuoteSelection(quote.id)}
                    >
                      {/* Selection checkbox */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleQuoteSelection(quote.id)}
                          />
                          <div>
                            <h3 className="font-semibold line-clamp-1">
                              {quote.extractedData?.contractor || "Unknown Contractor"}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {quote.fileName}
                            </p>
                          </div>
                        </div>
                        {verification && (
                          <Badge
                            variant="outline"
                            className={getStatusBadgeColor(verification.statusBadge)}
                          >
                            {verification.statusBadge.toUpperCase()}
                          </Badge>
                        )}
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <p className="text-3xl font-bold">
                          {quote.extractedData?.totalAmount
                            ? formatCurrency(quote.extractedData.totalAmount)
                            : "N/A"}
                        </p>
                        {quote.extractedData?.projectAddress && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {quote.extractedData.projectAddress}
                          </p>
                        )}
                      </div>

                      {/* Scores */}
                      {verification && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Overall Score</span>
                            <span className={`font-bold ${getScoreColor(verification.overallScore)}`}>
                              {verification.overallScore}/100
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                verification.overallScore >= 80
                                  ? "bg-green-500"
                                  : verification.overallScore >= 60
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${verification.overallScore}%` }}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span className={getScoreColor(verification.pricingScore)}>
                                {verification.pricingScore}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Shield className="w-4 h-4 text-muted-foreground" />
                              <span className={getScoreColor(verification.materialsScore)}>
                                {verification.materialsScore}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                              <span className={getScoreColor(verification.complianceScore)}>
                                {verification.complianceScore}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Award className="w-4 h-4 text-muted-foreground" />
                              <span className={getScoreColor(verification.warrantyScore)}>
                                {verification.warrantyScore}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="mt-4 pt-4 border-t flex items-center justify-center gap-2 text-primary">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Selected for comparison</span>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Selection hint */}
          {completedQuotes.length > 0 && selectedQuoteIds.length < 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-center"
            >
              <p className="text-muted-foreground">
                Select at least 2 quotes to start comparing
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />

      {/* Create Comparison Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Comparison</DialogTitle>
            <DialogDescription>
              Give your comparison a name to help you identify it later
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="comparison-name">Comparison Name</Label>
            <Input
              id="comparison-name"
              placeholder="e.g., Roof Replacement Quotes"
              value={comparisonName}
              onChange={(e) => setComparisonName(e.target.value)}
              className="mt-2"
            />

            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Comparing {selectedQuoteIds.length} quotes:
              </p>
              <ul className="space-y-1">
                {selectedQuoteIds.map((id) => {
                  const quote = completedQuotes.find((q: any) => q.id === id);
                  return (
                    <li key={id} className="text-sm flex items-center gap-2">
                      <ChevronRight className="w-3 h-3" />
                      {quote?.extractedData?.contractor || quote?.fileName || `Quote #${id}`}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={confirmCreateComparison} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4 mr-2" />
                  Create Comparison
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
