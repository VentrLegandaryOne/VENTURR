import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  MessageSquarePlus,
  Bug,
  Lightbulb,
  TrendingUp,
  MessageCircle,
  ThumbsUp,
  Star,
  Send,
  X,
} from "lucide-react";

const feedbackTypes = [
  { value: "bug", label: "Bug Report", icon: Bug, color: "text-red-500" },
  { value: "feature", label: "Feature Request", icon: Lightbulb, color: "text-yellow-500" },
  { value: "improvement", label: "Improvement", icon: TrendingUp, color: "text-blue-500" },
  { value: "general", label: "General Feedback", icon: MessageCircle, color: "text-gray-500" },
  { value: "praise", label: "Praise", icon: ThumbsUp, color: "text-green-500" },
] as const;

const feedbackCategories = [
  { value: "quote_upload", label: "Quote Upload" },
  { value: "verification", label: "Verification Process" },
  { value: "comparison", label: "Quote Comparison" },
  { value: "market_rates", label: "Market Rates" },
  { value: "credentials", label: "Credential Verification" },
  { value: "reports", label: "Reports & PDF Export" },
  { value: "dashboard", label: "Dashboard" },
  { value: "mobile", label: "Mobile Experience" },
  { value: "performance", label: "Performance" },
  { value: "other", label: "Other" },
] as const;

type FeedbackType = typeof feedbackTypes[number]["value"];
type FeedbackCategory = typeof feedbackCategories[number]["value"];

interface FeedbackFormProps {
  trigger?: React.ReactNode;
  defaultCategory?: FeedbackCategory;
}

export function FeedbackForm({ trigger, defaultCategory }: FeedbackFormProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("general");
  const [category, setCategory] = useState<FeedbackCategory>(defaultCategory || "other");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const submitFeedback = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your feedback!", {
        description: "We'll review it and get back to you if needed.",
      });
      resetForm();
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to submit feedback", {
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setType("general");
    setCategory(defaultCategory || "other");
    setTitle("");
    setDescription("");
    setRating(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    submitFeedback.mutate({
      type,
      category,
      title: title.trim(),
      description: description.trim(),
      rating: rating || undefined,
      pageUrl: window.location.href,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
    });
  };

  const selectedType = feedbackTypes.find((t) => t.value === type);
  const TypeIcon = selectedType?.icon || MessageCircle;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span className="hidden sm:inline">Feedback</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TypeIcon className={`h-5 w-5 ${selectedType?.color}`} />
            Send Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve VENTURR VALDT. Your feedback is valuable during our beta phase.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Feedback Type Selection */}
          <div className="space-y-2">
            <Label>What type of feedback?</Label>
            <div className="flex flex-wrap gap-2">
              {feedbackTypes.map((feedbackType) => {
                const Icon = feedbackType.icon;
                const isSelected = type === feedbackType.value;
                return (
                  <button
                    key={feedbackType.value}
                    type="button"
                    onClick={() => setType(feedbackType.value)}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                      transition-all duration-200 border
                      ${isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-border"
                      }
                    `}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isSelected ? "" : feedbackType.color}`} />
                    {feedbackType.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as FeedbackCategory)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {feedbackCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Brief summary of your feedback"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={256}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder={
                type === "bug"
                  ? "Please describe the bug, steps to reproduce, and what you expected to happen..."
                  : type === "feature"
                  ? "Describe the feature you'd like to see and how it would help you..."
                  : "Share your thoughts, suggestions, or experiences..."
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Rating (optional) */}
          <div className="space-y-2">
            <Label>Overall Experience (optional)</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(rating === star ? null : star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= (hoveredRating || rating || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              {rating && (
                <button
                  type="button"
                  onClick={() => setRating(null)}
                  className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitFeedback.isPending || !title.trim() || !description.trim()}
              className="gap-2"
            >
              {submitFeedback.isPending ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Send className="h-4 w-4" />
                  </motion.div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Floating feedback button for easy access
export function FloatingFeedbackButton() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <FeedbackForm
        trigger={
          <Button
            size="lg"
            className="rounded-full shadow-lg hover:shadow-xl transition-shadow h-14 w-14 p-0"
          >
            <MessageSquarePlus className="h-6 w-6" />
          </Button>
        }
      />
    </div>
  );
}

export default FeedbackForm;
