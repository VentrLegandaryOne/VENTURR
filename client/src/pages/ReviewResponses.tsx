import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Star,
  Clock,
  CheckCircle,
  Send,
  Edit,
  Trash2,
  AlertCircle,
  User,
  Calendar,
  ThumbsUp,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Sample reviews data for demonstration
const sampleReviews = [
  {
    id: 1,
    rating: 4,
    title: "Good work overall",
    comment: "The electrical work was completed on time and within budget. Minor issues with cleanup but overall satisfied with the quality.",
    authorName: "John D.",
    projectType: "Electrical Rewiring",
    createdAt: "2024-12-20T10:30:00Z",
    isVerified: true,
    helpfulCount: 5,
    contractorResponse: null,
    contractorResponseAt: null,
  },
  {
    id: 2,
    rating: 2,
    title: "Delays and communication issues",
    comment: "Project took much longer than quoted. Difficult to get updates on progress. Work quality was acceptable but the experience was frustrating.",
    authorName: "Sarah M.",
    projectType: "Switchboard Upgrade",
    createdAt: "2024-12-15T14:00:00Z",
    isVerified: true,
    helpfulCount: 12,
    contractorResponse: "We apologize for the delays experienced. This project encountered unexpected complications with the existing wiring that required additional work. We have since improved our communication processes and now provide daily updates on all projects. We would welcome the opportunity to make this right.",
    contractorResponseAt: "2024-12-16T09:00:00Z",
  },
  {
    id: 3,
    rating: 5,
    title: "Excellent service!",
    comment: "Fantastic work from start to finish. Professional, punctual, and the quality exceeded expectations. Highly recommend!",
    authorName: "Michael T.",
    projectType: "New Installation",
    createdAt: "2024-12-10T08:00:00Z",
    isVerified: false,
    helpfulCount: 8,
    contractorResponse: "Thank you so much for your kind words, Michael! It was a pleasure working on your project. We take pride in delivering quality work and it's wonderful to hear that we met your expectations. Please don't hesitate to reach out for any future electrical needs!",
    contractorResponseAt: "2024-12-11T10:00:00Z",
  },
];

interface ReviewCardProps {
  review: typeof sampleReviews[0];
  onRespond: (reviewId: number, response: string) => void;
  onEdit: (reviewId: number, response: string) => void;
  onDelete: (reviewId: number) => void;
  isSubmitting: boolean;
}

function ReviewCard({ review, onRespond, onEdit, onDelete, isSubmitting }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState(review.contractorResponse || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = () => {
    if (responseText.length < 10) {
      toast.error("Response must be at least 10 characters");
      return;
    }
    if (review.contractorResponse) {
      onEdit(review.id, responseText);
    } else {
      onRespond(review.id, responseText);
    }
    setShowResponseForm(false);
    setIsEditing(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`}
      />
    ));
  };

  return (
    <Card className={`transition-all ${!review.contractorResponse ? "border-amber-500/50 bg-amber-500/5" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{review.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{review.authorName}</span>
                {review.isVerified && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{review.projectType}</span>
                <span>•</span>
                <span>{new Date(review.createdAt).toLocaleDateString("en-AU")}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {renderStars(review.rating)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {review.title && <h4 className="font-medium">{review.title}</h4>}
        <p className="text-muted-foreground">{review.comment}</p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            {review.helpfulCount} found helpful
          </span>
        </div>

        {/* Contractor Response Section */}
        {review.contractorResponse && !isEditing && (
          <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Your Response</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(review.contractorResponseAt!).toLocaleDateString("en-AU")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{review.contractorResponse}</p>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(true);
                  setShowResponseForm(true);
                }}
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(review.id)}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Response Form */}
        {(showResponseForm || (!review.contractorResponse && isExpanded)) && (
          <div className="mt-4 space-y-3">
            <Textarea
              placeholder="Write your professional response to this review..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {responseText.length}/2000 characters
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowResponseForm(false);
                    setIsEditing(false);
                    setResponseText(review.contractorResponse || "");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={responseText.length < 10 || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-1" />
                  )}
                  {review.contractorResponse ? "Update" : "Submit"} Response
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      {!review.contractorResponse && !isExpanded && (
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsExpanded(true)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Respond to Review
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default function ReviewResponses() {
  const [activeTab, setActiveTab] = useState("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In production, these would use actual tRPC mutations
  const handleRespond = async (reviewId: number, response: string) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Response submitted successfully");
    setIsSubmitting(false);
  };

  const handleEdit = async (reviewId: number, response: string) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Response updated successfully");
    setIsSubmitting(false);
  };

  const handleDelete = async (reviewId: number) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Response deleted");
    setIsSubmitting(false);
  };

  const pendingReviews = sampleReviews.filter((r) => !r.contractorResponse);
  const respondedReviews = sampleReviews.filter((r) => r.contractorResponse);

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
              <MessageSquare className="w-3 h-3 mr-1" />
              Review Management
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Respond to Customer Reviews
            </h1>
            <p className="text-muted-foreground">
              Build trust with potential customers by professionally responding to reviews. Address concerns, thank satisfied customers, and showcase your commitment to service.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-4">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-amber-500">{pendingReviews.length}</div>
                <p className="text-sm text-muted-foreground">Pending Response</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-500">{respondedReviews.length}</div>
                <p className="text-sm text-muted-foreground">Responded</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">
                  {Math.round((respondedReviews.length / sampleReviews.length) * 100)}%
                </div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="pending" className="relative">
                <Clock className="w-4 h-4 mr-2" />
                Pending Response
                {pendingReviews.length > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {pendingReviews.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="responded">
                <CheckCircle className="w-4 h-4 mr-2" />
                Responded
              </TabsTrigger>
            </TabsList>

            {/* Pending Reviews Tab */}
            <TabsContent value="pending">
              {pendingReviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">All Caught Up!</h3>
                    <p className="text-muted-foreground">
                      You've responded to all your reviews. Great job maintaining customer engagement!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Alert className="bg-amber-500/10 border-amber-500/20">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <AlertTitle className="text-amber-700">Reviews Awaiting Response</AlertTitle>
                    <AlertDescription className="text-amber-600">
                      Responding to reviews within 48 hours can improve your profile visibility and customer trust.
                    </AlertDescription>
                  </Alert>
                  {pendingReviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onRespond={handleRespond}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isSubmitting={isSubmitting}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Responded Reviews Tab */}
            <TabsContent value="responded">
              {respondedReviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Responses Yet</h3>
                    <p className="text-muted-foreground">
                      Start responding to reviews to build customer trust.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {respondedReviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onRespond={handleRespond}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isSubmitting={isSubmitting}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Best Practices Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Response Best Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Do
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Respond within 24-48 hours</p>
                <p>• Thank customers for their feedback</p>
                <p>• Address specific concerns mentioned</p>
                <p>• Offer solutions or next steps</p>
                <p>• Keep responses professional and courteous</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Don't
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Be defensive or argumentative</p>
                <p>• Share private customer information</p>
                <p>• Use generic copy-paste responses</p>
                <p>• Ignore negative reviews</p>
                <p>• Make promises you can't keep</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
