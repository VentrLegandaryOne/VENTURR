import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { 
  Plus, 
  AlertTriangle,
  Download,
  Eye,
  Scale,
  ChevronRight,
  Search,
  Filter,
  SlidersHorizontal
} from "lucide-react";
import { TriangularCheck, TriangularArrowRight } from "@/components/branding/TriangularIcons";
import { DashboardSkeleton, QuoteListSkeleton } from "@/components/ui/LoadingSkeleton";
import RecommendedContractors from "@/components/RecommendedContractors";
import { EmptyState } from "@/components/ui/EmptyState";
import { ResumeUploadBanner } from "@/components/ResumeUploadBanner";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import { OfflineDraftsIndicator } from "@/components/OfflineDraftsIndicator";
import { SwipeableQuoteCard } from "@/components/SwipeableQuoteCard";
import { EnhancedQuoteCard } from "@/components/EnhancedQuoteCard";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { PullToRefresh } from "@/components/PullToRefresh";
import { toast } from "sonner";
import { haptics } from "@/lib/haptics";
import { SwipeTutorial } from "@/components/SwipeTutorial";
import BusinessInsights from "@/components/dashboard/BusinessInsights";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

export default function Dashboard() {
  const { isAuthenticated, user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedQuotes, setSelectedQuotes] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Fetch user's quotes
  const { data: quotes, isLoading: quotesLoading, refetch: refetchQuotes, error: errorQuotes } = trpc.quotes.list.useQuery(undefined, {
    enabled: isAuthenticated, retry: 2,
    refetchInterval: 5000, // Refetch every 5 seconds to update processing status
  });

  // Delete mutation with optimistic update
  const utils = trpc.useUtils();
  const deleteMutation = trpc.quotes.delete.useMutation({
    onMutate: async ({ quoteId }) => {
      // Cancel outgoing refetches
      await utils.quotes.list.cancel();
      
      // Snapshot previous value
      const previousQuotes = utils.quotes.list.getData();
      
      // Optimistically remove quote from list
      utils.quotes.list.setData(undefined, (old) => 
        old ? old.filter(q => q.id !== quoteId) : []
      );
      
      return { previousQuotes };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousQuotes) {
        utils.quotes.list.setData(undefined, context.previousQuotes);
      }
    },
    onSettled: () => {
      // Refetch to ensure sync
      utils.quotes.list.invalidate();
    },
  });

  // Share mutation
  const shareMutation = trpc.quotes.share.useMutation();

  // Branded PDF download mutation
  const [downloadingPdfId, setDownloadingPdfId] = useState<number | null>(null);
  const downloadBrandedPdfMutation = trpc.reports.downloadBrandedPdf.useMutation({
    onSuccess: (data) => {
      const link = document.createElement('a');
      link.href = data.pdfUrl;
      link.download = data.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Legal PDF downloaded', { description: `Report: ${data.reportId}` });
    },
    onError: (error) => {
      toast.error('Download failed', { description: error.message });
    },
    onSettled: () => {
      setDownloadingPdfId(null);
    },
  });

  const handleDownloadPdf = (quoteId: number) => {
    setDownloadingPdfId(quoteId);
    downloadBrandedPdfMutation.mutate({ quoteId });
  };

  // Batch delete handlers
  const handleToggleSelection = (quoteId: number) => {
    setSelectedQuotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(quoteId)) {
        newSet.delete(quoteId);
      } else {
        newSet.add(quoteId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedQuotes.size === filteredAndSortedQuotes.length) {
      setSelectedQuotes(new Set());
    } else {
      setSelectedQuotes(new Set(filteredAndSortedQuotes.map(q => q.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedQuotes.size === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedQuotes.size} quote${selectedQuotes.size > 1 ? 's' : ''}?`
    );
    
    if (!confirmed) return;

    try {
      // Delete all selected quotes
      await Promise.all(
        Array.from(selectedQuotes).map(quoteId => 
          deleteMutation.mutateAsync({ quoteId })
        )
      );
      
      setSelectedQuotes(new Set());
      setIsSelectionMode(false);
      toast.success(`Successfully deleted ${selectedQuotes.size} quote${selectedQuotes.size > 1 ? 's' : ''}`);
      haptics.success();
    } catch (error) {
      console.error('Failed to delete quotes:', error);
      toast.error('Failed to delete some quotes. Please try again.');
      haptics.error();
    }
  };

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    await refetchQuotes();
  };

  // Filter and sort quotes
  const filteredAndSortedQuotes = useMemo(() => {
    if (!quotes) return [];
    
    let filtered = [...quotes];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(quote => 
        quote.fileName.toLowerCase().includes(query) ||
        quote.extractedData?.contractor?.toLowerCase().includes(query) ||
        quote.extractedData?.projectAddress?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name-asc":
          return a.fileName.localeCompare(b.fileName);
        case "name-desc":
          return b.fileName.localeCompare(a.fileName);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [quotes, searchQuery, statusFilter, sortBy]);

  // Fetch user's saved comparisons
  const { data: comparisons, isLoading: comparisonsLoading, error: errorComparisons } = trpc.comparisons.list.useQuery(undefined, {
    enabled: isAuthenticated, retry: 2,
  });

  // Redirect to login if not authenticated
  if (!loading && !isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  // Fetch real analytics data
  const { data: analytics, isLoading: analyticsLoading, error: errorAnalytics } = trpc.analytics.getUserAnalytics.useQuery(
    undefined,
    { enabled: isAuthenticated, retry: 2 }
  );

  const displayAnalytics = {
    totalQuotes: analytics?.totalQuotesVerified || 0,
    totalSavings: analytics?.totalSavings || 0,
    avgProcessingTime: analytics?.averageProcessingTime || 52,
    quotesThisMonth: analytics?.quotesThisMonth || 0,
    accuracyRate: analytics?.accuracyRate || 98,
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      uploaded: { label: "Uploaded", color: "text-muted-foreground", bg: "bg-muted/50" },
      processing: { label: "Processing", color: "text-primary", bg: "bg-primary/10" },
      completed: { label: "Completed", color: "text-success", bg: "bg-success/10" },
      failed: { label: "Failed", color: "text-destructive", bg: "bg-destructive/10" },
    };
    return configs[status as keyof typeof configs] || configs.uploaded;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SwipeTutorial />
      <Navbar />

      <PullToRefresh onRefresh={handleRefresh} enabled={isAuthenticated}>
        <main className="flex-1 pt-24 pb-16 triangle-pattern">
          <div className="container max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="mb-2">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {user?.name || 'User'}! Track your quote verifications and savings.
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/quote/upload">
                  <Button size="lg" className="shadow-md shadow-primary/20">
                    <Plus className="w-5 h-5 mr-2" />
                    Verify New Quote
                  </Button>
                </Link>
                <Link href="/quote-compare">
                  <Button size="lg" variant="outline">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-5-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 3v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M10 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Compare Quotes
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Notification permission banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 }}
            className="mb-6"
          >
            <NotificationPermissionBanner />
          </motion.div>

          {/* Resume incomplete uploads banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6"
          >
            <ResumeUploadBanner />
          </motion.div>

          {/* Offline drafts indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="mb-6"
          >
            <OfflineDraftsIndicator />
          </motion.div>

          {/* Analytics cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8"
          >
            <Card className="p-4 sm:p-6 floating-card glass-strong hover:glow-primary transition-smooth">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 11L9 14L12 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
                  {displayAnalytics.totalQuotes}
                </span>
              </div>
              <p className="text-sm font-medium text-card-foreground">Total Quotes Analyzed</p>
              <p className="text-xs text-muted-foreground mt-1">
                {displayAnalytics.quotesThisMonth} this month
              </p>
            </Card>

            <Card className="p-4 sm:p-6 floating-card glass-strong hover:glow-primary transition-smooth">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-success" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 7H21V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 7L18 10L21 10L21 7Z" fill="currentColor" opacity="0.5"/>
                  </svg>
                </div>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
                  ${(displayAnalytics.totalSavings / 1000).toFixed(0)}k
                </span>
              </div>
              <p className="text-sm font-medium text-card-foreground">Total Savings Identified</p>
              <p className="text-xs text-muted-foreground mt-1">
                Avg ${(displayAnalytics.totalSavings / Math.max(displayAnalytics.totalQuotes, 1)).toFixed(0)} per quote
              </p>
            </Card>

            <Card className="p-4 sm:p-6 floating-card glass-strong hover:glow-primary transition-smooth">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-accent" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
                  {displayAnalytics.avgProcessingTime}s
                </span>
              </div>
              <p className="text-sm font-medium text-card-foreground">Avg Processing Time</p>
              <p className="text-xs text-muted-foreground mt-1">
                Under 60 seconds
              </p>
            </Card>

            <Card className="p-4 sm:p-6 floating-card glass-strong hover:glow-primary transition-smooth">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <TriangularCheck className="w-6 h-6 text-warning" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
                  {displayAnalytics.accuracyRate}%
                </span>
              </div>
              <p className="text-sm font-medium text-card-foreground">Accuracy Rate</p>
              <p className="text-xs text-muted-foreground mt-1">
                Industry-leading precision
              </p>
            </Card>
          </motion.div>

          {/* Business Intelligence Section */}
          <BusinessInsights analytics={displayAnalytics} />

          {/* Recent quotes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-border/50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-card-foreground">Recent Quotes</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      View and manage your quote verifications
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!isSelectionMode ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsSelectionMode(true)}
                      >
                        Select Multiple
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAll}
                        >
                          {selectedQuotes.size === filteredAndSortedQuotes.length ? 'Deselect All' : 'Select All'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleBatchDelete}
                          disabled={selectedQuotes.size === 0}
                        >
                          Delete Selected ({selectedQuotes.size})
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsSelectionMode(false);
                            setSelectedQuotes(new Set());
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by contractor, project type, or filename..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="uploaded">Uploaded</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[140px]">
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Sort" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="name-asc">Name A-Z</SelectItem>
                        <SelectItem value="name-desc">Name Z-A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {quotesLoading ? (
                <div className="p-6">
                  <QuoteListSkeleton />
                </div>
              ) : filteredAndSortedQuotes && filteredAndSortedQuotes.length > 0 ? (
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredAndSortedQuotes.slice(0, 12).map((quote, index) => (
                      <motion.div
                        key={quote.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <SwipeableQuoteCard
                          onDelete={async () => {
                            try {
                              await deleteMutation.mutateAsync({ quoteId: quote.id });
                            } catch (error) {
                              console.error('Failed to delete quote:', error);
                            }
                          }}
                          onShare={async () => {
                            try {
                              const result = await shareMutation.mutateAsync({ quoteId: quote.id });
                              if (navigator.clipboard && result.shareUrl) {
                                await navigator.clipboard.writeText(result.shareUrl);
                                toast.success('Share link copied!', {
                                  duration: 5000,
                                  action: {
                                    label: "View",
                                    onClick: () => window.open(result.shareUrl, '_blank'),
                                  },
                                });
                                haptics.success();
                              }
                            } catch (error) {
                              console.error('Failed to share quote:', error);
                              toast.error('Failed to create share link.');
                              haptics.error();
                            }
                          }}
                        >
                          <EnhancedQuoteCard
                            quote={quote}
                            isSelected={selectedQuotes.has(quote.id)}
                            onSelect={() => handleToggleSelection(quote.id)}
                            isSelectionMode={isSelectionMode}
                          />
                        </SwipeableQuoteCard>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={Plus}
                  title="No quotes yet"
                  description="Upload your first quote to get started with AI-powered verification and unlock instant insights on pricing, materials, and compliance."
                  actionLabel="Verify Your First Quote"
                  onAction={() => setLocation("/quote/upload")}
                />
              )}
            </Card>
          </motion.div>

          {/* Saved Comparisons Section */}
          {comparisons && comparisons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-8"
            >
              <Card className="overflow-hidden">
                <div className="p-6 border-b border-border/50 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-card-foreground flex items-center gap-2">
                      <Scale className="w-5 h-5 text-primary" />
                      Saved Comparisons
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your quote comparisons and best value analyses
                    </p>
                  </div>
                  <Link href="/comparisons">
                    <Button variant="outline" size="sm">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="divide-y divide-border/50">
                  {comparisons.slice(0, 5).map((comparison: any, index: number) => (
                    <motion.div
                      key={comparison.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Scale className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-card-foreground truncate">
                              {comparison.name || `Comparison #${comparison.id}`}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span>{formatDate(comparison.createdAt)}</span>
                              <span>•</span>
                              <span>{comparison.quotes?.length || 0} quotes compared</span>
                              <span>•</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                                comparison.status === 'completed' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                              }`}>
                                <span className="text-xs font-medium">
                                  {comparison.status === 'completed' ? 'Completed' : 'Analyzing'}
                                </span>
                              </span>
                            </div>
                            {comparison.recommendation?.bestQuoteId && (
                              <p className="text-sm text-success mt-2">
                                Best value: {comparison.quotes?.find((q: any) => q.id === comparison.recommendation.bestQuoteId)?.extractedData?.contractor || 'Quote ' + comparison.recommendation.bestQuoteId}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/comparison/${comparison.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View Results
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Recommended Contractors Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="p-6">
              <RecommendedContractors
                title="Recommended Contractors for You"
                limit={3}
              />
            </Card>
          </motion.div>
          </div>
        </main>
      </PullToRefresh>

      <Footer />
    </div>
  );
}
