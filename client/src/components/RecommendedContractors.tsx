import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  Star, 
  MapPin, 
  Briefcase, 
  Award, 
  CheckCircle2, 
  TrendingUp,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

interface RecommendedContractorsProps {
  projectType?: string;
  location?: string;
  budget?: number;
  quoteId?: number;
  limit?: number;
  title?: string;
  showFilters?: boolean;
}

export default function RecommendedContractors({
  projectType,
  location,
  budget,
  quoteId,
  limit = 5,
  title = "Recommended Contractors",
  showFilters = false,
}: RecommendedContractorsProps) {
  // Use quote-based recommendations if quoteId is provided
  const { data: recommendations, isLoading } = quoteId
    ? trpc.contractors.getRecommendationsForQuote.useQuery({ quoteId, limit })
    : trpc.contractors.getRecommendations.useQuery({
        projectType,
        location,
        budget,
        limit,
      });

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    return "text-muted-foreground";
  };

  const getMatchScoreBg = (score: number) => {
    if (score >= 80) return "bg-success/10 border-success/20";
    if (score >= 60) return "bg-warning/10 border-warning/20";
    return "bg-muted/50 border-border";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="font-semibold mb-2">No Recommendations Yet</h3>
        <p className="text-sm text-muted-foreground">
          We'll find the best contractors for your project once we have more information.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <Link href="/contractors">
          <Button variant="ghost" size="sm">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.contractor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-4 hover:shadow-md transition-all ${getMatchScoreBg(rec.matchScore)}`}>
              <div className="flex items-start gap-4">
                {/* Match Score Circle */}
                <div className={`flex-shrink-0 w-14 h-14 rounded-full border-2 flex items-center justify-center ${getMatchScoreColor(rec.matchScore)}`}>
                  <div className="text-center">
                    <div className="text-lg font-bold">{rec.matchScore}</div>
                    <div className="text-[10px] uppercase tracking-wide">Match</div>
                  </div>
                </div>

                {/* Contractor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold truncate">
                          {rec.contractor.businessName || rec.contractor.name}
                        </h4>
                        {rec.contractor.isVerified && (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-2 mt-1">
                        {rec.avgRating > 0 ? (
                          <>
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium">{rec.avgRating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">
                              ({rec.contractor.totalReviews} reviews)
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">No reviews yet</span>
                        )}
                      </div>
                    </div>

                    <Link href={`/contractor/${rec.contractor.id}`}>
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </Link>
                  </div>

                  {/* Match Reasons */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rec.matchReasons.slice(0, 3).map((reason, i) => (
                      <Badge key={i} variant="outline" className="text-xs font-normal">
                        {reason}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats Row */}
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    {rec.portfolioCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{rec.portfolioCount} projects</span>
                      </div>
                    )}
                    {rec.certificationCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        <span>{rec.certificationCount} certs</span>
                      </div>
                    )}
                    {rec.recentProjectValue && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>
                          Recent: ${(rec.recentProjectValue / 100).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
