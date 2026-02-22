import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star, MapPin, Phone, Mail, Globe, Shield, Award, Calendar, User } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PortfolioGallery } from "@/components/PortfolioGallery";
import { CertificationsList } from "@/components/CertificationsList";
import { format } from "date-fns";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

export default function ContractorProfile() {
  const [, params] = useRoute("/contractor/:id");
  const contractorId = params?.id ? parseInt(params.id) : 0;
  const { user } = useAuth();
  // Toast notifications will be handled via browser alerts for now
  const toast = ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    if (variant === "destructive") {
      alert(`Error: ${title}\n${description}`);
    } else {
      alert(`${title}\n${description}`);
    }
  };

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const MAX_COMMENT_LENGTH = 500;

  const { data: contractor, isLoading, error: errorContractor } = trpc.contractors.getById.useQuery({ id: contractorId });
  const { data: reviews = [], error: errorReviews } = trpc.contractors.getReviews.useQuery({ contractorId, limit: 50 });
  const { data: projects = [], error: errorProjects } = trpc.contractors.getProjects.useQuery({ contractorId });
  const { data: portfolioProjects = [], error: errorPortfolioProjects } = trpc.contractors.getPortfolioProjects.useQuery({ contractorId });
  const { data: certifications = [], error: errorCertifications } = trpc.contractors.getCertifications.useQuery({ contractorId });
  const { data: hasReviewed = false, error: errorHasReviewed } = trpc.contractors.hasReviewed.useQuery(
    { contractorId },
    { enabled: !!user, retry: 2 }
  );

  const utils = trpc.useUtils();
  const rateMutation = trpc.contractors.rate.useMutation({
    onSuccess: () => {
      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback!",
      });
      setIsRatingModalOpen(false);
      setRating(0);
      setComment("");
      utils.contractors.getById.invalidate({ id: contractorId });
      utils.contractors.getReviews.invalidate({ contractorId });
      utils.contractors.hasReviewed.invalidate({ contractorId });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit rating",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitRating = () => {
    // Validate rating
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating (1-5 stars)",
        variant: "destructive",
      });
      return;
    }

    // Validate comment length
    if (comment.trim().length > MAX_COMMENT_LENGTH) {
      setCommentError(`Comment must be ${MAX_COMMENT_LENGTH} characters or less`);
      return;
    }

    setCommentError(null);
    rateMutation.mutate({
      contractorId,
      rating,
      comment: comment.trim() || undefined,
    });
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setComment(value);
    
    // Real-time validation
    if (value.length > MAX_COMMENT_LENGTH) {
      setCommentError(`Comment exceeds maximum length by ${value.length - MAX_COMMENT_LENGTH} characters`);
    } else {
      setCommentError(null);
    }
  };

  const renderStars = (score: number, size: "sm" | "lg" = "sm") => {
    const starRating = score / 20; // Convert 0-100 to 0-5
    const fullStars = Math.floor(starRating);
    const hasHalfStar = starRating % 1 >= 0.5;
    const starSize = size === "lg" ? "h-8 w-8" : "h-4 w-4";

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${starSize} ${
              i < fullStars
                ? "fill-[#F97316] text-[#F97316]"
                : i === fullStars && hasHalfStar
                ? "fill-[#F97316]/50 text-[#F97316]"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderInteractiveStars = () => {
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 cursor-pointer ${
                star <= (hoverRating || rating)
                  ? "fill-[#F97316] text-[#F97316]"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-sm text-muted-foreground ml-2">
            {rating} {rating === 1 ? "star" : "stars"}
          </span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container">
          <LoadingSkeleton variant="card" />
        </div>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Contractor not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const avgRating = contractor.avgScore / 20;

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{contractor.name}</h1>
                {contractor.isVerified && (
                  <Badge variant="default" className="bg-success text-success-foreground gap-1">
                    <Shield className="h-4 w-4" />
                    Verified
                  </Badge>
                )}
              </div>
              {contractor.businessName && (
                <p className="text-xl text-muted-foreground">{contractor.businessName}</p>
              )}
            </div>
            {user && !hasReviewed && (
              <Dialog open={isRatingModalOpen} onOpenChange={setIsRatingModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Star className="h-4 w-4" />
                    Rate This Contractor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rate {contractor.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Rating <span className="text-[#EF4444]">*</span>
                      </label>
                      {rating === 0 && (
                        <p className="text-xs text-slate-400 mb-2">
                          Please select a rating (1-5 stars)
                        </p>
                      )}
                      {renderInteractiveStars()}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">
                          Comment (Optional)
                        </label>
                        <span className={`text-xs ${
                          comment.length > MAX_COMMENT_LENGTH 
                            ? "text-[#EF4444] font-semibold" 
                            : comment.length > MAX_COMMENT_LENGTH * 0.9
                              ? "text-[#F97316]"
                              : "text-muted-foreground"
                        }`}>
                          {comment.length} / {MAX_COMMENT_LENGTH}
                        </span>
                      </div>
                      <Textarea
                        placeholder="Share your experience with this contractor..."
                        value={comment}
                        onChange={handleCommentChange}
                        rows={4}
                        className={commentError ? "border-[#EF4444] focus-visible:ring-[#EF4444]" : ""}
                      />
                      {commentError && (
                        <p className="text-xs text-[#EF4444] mt-1 flex items-center gap-1">
                          <span>⚠️</span>
                          {commentError}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleSubmitRating}
                      disabled={rateMutation.isPending}
                      className="w-full"
                    >
                      {rateMutation.isPending ? "Submitting..." : "Submit Rating"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rating Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Rating & Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">{avgRating.toFixed(1)}</div>
                    {renderStars(contractor.avgScore, "lg")}
                    <p className="text-sm text-muted-foreground mt-2">
                      {contractor.totalReviews} {contractor.totalReviews === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviews.filter((r) => r.rating === stars).length;
                      const percentage = contractor.totalReviews > 0
                        ? (count / contractor.totalReviews) * 100
                        : 0;
                      return (
                        <div key={stars} className="flex items-center gap-2 mb-1">
                          <span className="text-sm w-12">{stars} stars</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#F97316]"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No reviews yet. Be the first to rate this contractor!
                    </p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="border-t pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">User #{review.userId}</span>
                            {review.isVerified && (
                              <Badge variant="outline" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {renderStars(review.rating * 20)}
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(review.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground">{review.comment}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Gallery */}
            <PortfolioGallery projects={portfolioProjects} />

            {/* Certifications */}
            <CertificationsList certifications={certifications} />
          </div>

          {/* Right Column - Contact & Stats */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contractor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${contractor.phone}`} className="hover:underline">
                      {contractor.phone}
                    </a>
                  </div>
                )}
                {contractor.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${contractor.email}`} className="hover:underline truncate">
                      {contractor.email}
                    </a>
                  </div>
                )}
                {contractor.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={contractor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline truncate"
                    >
                      {contractor.website}
                    </a>
                  </div>
                )}
                {contractor.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <span className="text-sm">{contractor.address}</span>
                  </div>
                )}
                {contractor.licenseNumber && (
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      License: <span className="font-medium">{contractor.licenseNumber}</span>
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Projects</span>
                  <span className="text-2xl font-bold">{contractor.totalProjects}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Reviews</span>
                  <span className="text-2xl font-bold">{contractor.totalReviews}</span>
                </div>
                {contractor.totalValue > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Value</span>
                    <span className="text-2xl font-bold">
                      ${(contractor.totalValue / 100).toLocaleString()}
                    </span>
                  </div>
                )}
                {contractor.insuranceVerified && (
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Shield className="h-4 w-4 text-[#10B981]" />
                    <span className="text-sm text-[#10B981]">Insurance Verified</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
