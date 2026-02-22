import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Star, 
  Award, 
  Shield, 
  Clock, 
  DollarSign, 
  MessageSquare,
  Briefcase,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Trash2,
  Crown,
  Share2,
  Download
} from "lucide-react";
import ShareComparisonDialog from "@/components/ShareComparisonDialog";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

export default function ContractorComparison() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: comparison, isLoading, refetch, error: errorComparison } = trpc.contractors.getDetailedComparison.useQuery(
    undefined,
    { enabled: !!user, retry: 2 }
  );

  // All hooks must be called before any early returns to comply with React hooks rules
  const clearComparison = trpc.contractors.clearComparison.useMutation({
    onSuccess: () => {
      toast.success("Comparison cleared");
      setLocation("/contractors");
    },
  });

  const removeFromComparison = trpc.contractors.removeFromComparison.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Removed from comparison");
    },
  });

  // Early returns after all hooks are called
  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[600px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to compare contractors</h1>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  if (!comparison || comparison.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">No contractors to compare</h1>
        <p className="text-muted-foreground mb-6">
          Add contractors to your comparison list to see them side by side.
        </p>
        <Button asChild>
          <Link href="/contractors">Browse Contractors</Link>
        </Button>
      </div>
    );
  }

  if (comparison.length < 2) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Add more contractors</h1>
        <p className="text-muted-foreground mb-6">
          You need at least 2 contractors to compare. Currently you have {comparison.length}.
        </p>
        <Button asChild>
          <Link href="/contractors">Browse Contractors</Link>
        </Button>
      </div>
    );
  }

  // Find the best contractor for each metric
  const getBest = (metric: keyof typeof comparison[0]["stats"]) => {
    const values = comparison.map(c => ({ id: c.contractor.id, value: c.stats[metric] }));
    const max = Math.max(...values.map(v => v.value));
    return values.filter(v => v.value === max && v.value > 0).map(v => v.id);
  };

  const bestOverall = getBest("avgRating");
  const bestQuality = getBest("avgQuality");
  const bestValue = getBest("avgValue");
  const bestCommunication = getBest("avgCommunication");
  const bestTimeliness = getBest("avgTimeliness");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/contractors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Compare Contractors</h1>
              <p className="text-muted-foreground">
                Side-by-side comparison of {comparison.length} contractors
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <ShareComparisonDialog
              contractorIds={comparison.map(c => c.contractor.id)}
              contractorNames={comparison.map(c => c.contractor.businessName).filter((name): name is string => name !== null)}
              trigger={
                <Button variant="outline" disabled={comparison.length < 2}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              }
            />
            <Button 
              variant="outline" 
              onClick={() => clearComparison.mutate()}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className={`grid gap-6 ${
          comparison.length === 2 ? "grid-cols-1 md:grid-cols-2" :
          comparison.length === 3 ? "grid-cols-1 md:grid-cols-3" :
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        }`}>
          {comparison.map((item) => {
            const isTopRated = bestOverall.includes(item.contractor.id);
            
            return (
              <Card key={item.contractor.id} className={`relative overflow-hidden ${
                isTopRated ? "ring-2 ring-primary" : ""
              }`}>
                {/* Top Rated Badge */}
                {isTopRated && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Top Rated
                  </div>
                )}

                {/* Remove Button */}
                <button
                  onClick={() => removeFromComparison.mutate({ contractorId: item.contractor.id })}
                  className="absolute top-2 left-2 p-1.5 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>

                <div className="p-6">
                  {/* Contractor Header */}
                  <div className="text-center mb-6 pt-4">
                    <h2 className="text-lg font-bold mb-1">{item.contractor.name}</h2>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{item.stats.avgRating || "N/A"}</span>
                      <span className="text-muted-foreground text-sm">
                        ({item.stats.totalReviews} reviews)
                      </span>
                    </div>
                    {item.contractor.isVerified && (
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {/* Score Breakdown */}
                  <div className="space-y-4 mb-6">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Scores
                    </h3>
                    
                    <ScoreBar 
                      label="Quality" 
                      value={item.stats.avgQuality} 
                      icon={<Award className="w-4 h-4" />}
                      isBest={bestQuality.includes(item.contractor.id)}
                    />
                    <ScoreBar 
                      label="Value" 
                      value={item.stats.avgValue} 
                      icon={<DollarSign className="w-4 h-4" />}
                      isBest={bestValue.includes(item.contractor.id)}
                    />
                    <ScoreBar 
                      label="Communication" 
                      value={item.stats.avgCommunication} 
                      icon={<MessageSquare className="w-4 h-4" />}
                      isBest={bestCommunication.includes(item.contractor.id)}
                    />
                    <ScoreBar 
                      label="Timeliness" 
                      value={item.stats.avgTimeliness} 
                      icon={<Clock className="w-4 h-4" />}
                      isBest={bestTimeliness.includes(item.contractor.id)}
                    />
                  </div>

                  {/* Portfolio Stats */}
                  <div className="space-y-3 mb-6">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Portfolio
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span>{item.portfolio.projectCount} completed projects</span>
                    </div>
                    {item.portfolio.recentProjects.length > 0 && (
                      <div className="space-y-2">
                        {item.portfolio.recentProjects.slice(0, 2).map((project: any) => (
                          <div key={project.id} className="text-xs bg-accent/50 rounded p-2">
                            <div className="font-medium truncate">{project.title}</div>
                            <div className="text-muted-foreground">
                              ${(project.projectCost / 100).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Certifications */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Certifications
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(item.certifications).map(([category, count]) => (
                        <Badge key={category} variant="outline" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          {count} {category}
                        </Badge>
                      ))}
                      {Object.keys(item.certifications).length === 0 && (
                        <span className="text-xs text-muted-foreground">No certifications</span>
                      )}
                    </div>
                  </div>

                  {/* View Profile Button */}
                  <div className="mt-6">
                    <Button asChild className="w-full">
                      <Link href={`/contractor/${item.contractor.id}`}>
                        View Full Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Best in category</span>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary" />
            <span>Top rated overall</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ 
  label, 
  value, 
  icon, 
  isBest 
}: { 
  label: string; 
  value: number; 
  icon: React.ReactNode;
  isBest: boolean;
}) {
  const getColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
          {isBest && value > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs px-1.5 py-0">
              Best
            </Badge>
          )}
        </div>
        <span className="font-medium">{value || "N/A"}</span>
      </div>
      <div className="h-2 bg-accent rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor(value)} transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
