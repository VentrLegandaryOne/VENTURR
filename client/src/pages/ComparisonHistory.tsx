import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { 
  Download, 
  Eye, 
  Search,
  Filter,
  Calendar,
  TrendingDown,
  FileText,
  ChevronRight
} from "lucide-react";
import { useLocation } from "wouter";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

export default function ComparisonHistory() {
  const { isAuthenticated, user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Fetch user's comparisons
  const { data: comparisons, isLoading: comparisonsLoading, error: errorComparisons } = trpc.comparisons.list.useQuery(undefined, {
    enabled: isAuthenticated, retry: 2,
  });

  // Filter and sort comparisons
  const filteredAndSortedComparisons = useMemo(() => {
    if (!comparisons) return [];
    
    let filtered = [...comparisons];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(comparison => 
        comparison.name?.toLowerCase().includes(query) ||
        (typeof comparison.recommendation === 'object' && comparison.recommendation?.reasoning?.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "savings-high":
          return (b.recommendation?.estimatedSavings || 0) - (a.recommendation?.estimatedSavings || 0);
        case "savings-low":
          return (a.recommendation?.estimatedSavings || 0) - (b.recommendation?.estimatedSavings || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [comparisons, searchQuery, sortBy]);

  const handleExportCSV = (comparisonId: number) => {
    try {
      const comparison = comparisons?.find(c => c.id === comparisonId);
      if (!comparison) {
        toast.error("Comparison not found");
        return;
      }

      // Build CSV headers
      const headers = [
        "Comparison Name",
        "Created Date",
        "Status",
        "Number of Quotes",
        "Recommendation",
        "Estimated Savings",
        "Reasoning"
      ];

      // Build CSV row
      const row = [
        comparison.name || `Comparison #${comparison.id}`,
        new Date(comparison.createdAt).toLocaleDateString('en-AU'),
        comparison.status || "completed",
        String(comparison.id),
        typeof comparison.recommendation === 'object' ? (comparison.recommendation?.reasoning || "N/A") : "N/A",
        comparison.recommendation?.estimatedSavings ? formatCurrency(comparison.recommendation.estimatedSavings) : "$0.00",
        typeof comparison.recommendation === 'object' ? (comparison.recommendation?.reasoning || "N/A").replace(/[\n\r,]/g, ' ') : "N/A"
      ];

      // Create CSV content
      const csvContent = [headers.join(','), row.map(v => `"${v}"`).join(',')].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comparison-${comparisonId}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("CSV exported successfully");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  const handleExportPDF = (comparisonId: number) => {
    // Navigate to comparison page which has PDF export
    setLocation(`/comparison/${comparisonId}`);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="mb-4">Comparison History</h1>
            <p className="text-lg text-muted-foreground">
              Review all your past quote comparisons, recommendations, and savings
            </p>
          </motion.div>

          {/* Search and Filter Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search comparisons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="savings-high">Highest Savings</SelectItem>
                    <SelectItem value="savings-low">Lowest Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </motion.div>

          {/* Comparisons List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {comparisonsLoading ? (
              <Card className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading comparisons...</p>
              </Card>
            ) : filteredAndSortedComparisons && filteredAndSortedComparisons.length > 0 ? (
              filteredAndSortedComparisons.map((comparison, index) => (
                <motion.div
                  key={comparison.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">
                            {comparison.name || `Comparison #${comparison.id}`}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(comparison.createdAt)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              Comparison #{comparison.id}
                            </span>
                          </div>
                        </div>

                        {comparison.recommendation && typeof comparison.recommendation === 'object' && comparison.recommendation.reasoning && (
                          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                            <p className="text-sm font-medium text-primary mb-1">Recommendation:</p>
                            <p className="text-sm">{comparison.recommendation.reasoning}</p>
                          </div>
                        )}

                        {comparison.recommendation?.estimatedSavings && comparison.recommendation.estimatedSavings > 0 && (
                          <div className="flex items-center gap-2 text-green-600">
                            <TrendingDown className="w-5 h-5" />
                            <span className="font-semibold">
                              Potential Savings: {formatCurrency(comparison.recommendation.estimatedSavings)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/comparison/${comparison.id}`)}
                          className="w-full sm:w-auto"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportPDF(comparison.id)}
                          className="w-full sm:w-auto"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export PDF
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Comparisons Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start by uploading multiple quotes to create your first comparison
                  </p>
                  <Button onClick={() => setLocation("/upload")}>
                    Upload Quotes
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
