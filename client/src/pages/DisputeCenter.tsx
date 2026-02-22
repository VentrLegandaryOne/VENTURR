import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  AlertTriangle,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Send,
  ChevronRight,
  Scale,
  Shield,
  HelpCircle,
  Eye,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Dispute types
const disputeTypes = [
  {
    value: "review_accuracy",
    label: "Inaccurate Review",
    description: "The review contains factually incorrect information",
    icon: FileText,
  },
  {
    value: "review_fake",
    label: "Fake/Fraudulent Review",
    description: "The reviewer was never a customer or the review is fabricated",
    icon: AlertTriangle,
  },
  {
    value: "rating_unfair",
    label: "Unfair Rating",
    description: "The rating doesn't reflect the actual work performed",
    icon: Scale,
  },
  {
    value: "credential_error",
    label: "Credential Error",
    description: "My credentials are displayed incorrectly",
    icon: Shield,
  },
  {
    value: "profile_claim",
    label: "Profile Ownership",
    description: "I want to claim or dispute ownership of a profile",
    icon: MessageSquare,
  },
  {
    value: "other",
    label: "Other Issue",
    description: "My issue doesn't fit the categories above",
    icon: HelpCircle,
  },
];

// Sample existing disputes for demo
const sampleDisputes = [
  {
    id: "DSP-2024-001",
    type: "review_accuracy",
    status: "under_review",
    submittedAt: "2024-12-15T10:30:00Z",
    subject: "Review by John D. - Electrical Work",
    lastUpdate: "2024-12-18T14:00:00Z",
  },
  {
    id: "DSP-2024-002",
    type: "credential_error",
    status: "resolved",
    submittedAt: "2024-12-01T09:00:00Z",
    subject: "License number displayed incorrectly",
    lastUpdate: "2024-12-05T16:30:00Z",
    resolution: "License number has been corrected",
  },
];

interface DisputeFormData {
  type: string;
  subject: string;
  description: string;
  reviewId?: string;
  evidenceDescription: string;
  contactEmail: string;
  contactPhone: string;
  acknowledgePolicy: boolean;
}

const initialFormData: DisputeFormData = {
  type: "",
  subject: "",
  description: "",
  reviewId: "",
  evidenceDescription: "",
  contactEmail: "",
  contactPhone: "",
  acknowledgePolicy: false,
};

export default function DisputeCenter() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("new");
  const [formData, setFormData] = useState<DisputeFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [disputeId, setDisputeId] = useState<string | null>(null);

  const updateFormData = (updates: Partial<DisputeFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const canSubmit = () => {
    return (
      formData.type &&
      formData.subject &&
      formData.description.length >= 50 &&
      formData.contactEmail &&
      formData.acknowledgePolicy
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;

    setSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newDisputeId = `DSP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
    setDisputeId(newDisputeId);
    setSubmitted(true);
    setSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending Review</Badge>;
      case "under_review":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Under Review</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Resolved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (submitted && disputeId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Dispute Submitted</h1>
            <p className="text-muted-foreground mb-6">
              Your dispute has been submitted successfully. Our team will review it within 5 business days.
            </p>
            <Card className="text-left mb-6">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dispute ID:</span>
                    <span className="font-mono font-medium">{disputeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span>{disputeTypes.find((t) => t.value === formData.type)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    {getStatusBadge("pending")}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Response:</span>
                    <span>Within 5 business days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => setActiveTab("history")}>
                View My Disputes
              </Button>
              <Button onClick={() => navigate("/contractors")}>
                Back to Profile
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

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
              <Scale className="w-3 h-3 mr-1" />
              Dispute Center
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Submit a Dispute or Appeal
            </h1>
            <p className="text-muted-foreground">
              If you believe a review, rating, or credential is incorrect, you can submit a dispute for our team to review.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="new">
                <FileText className="w-4 h-4 mr-2" />
                New Dispute
              </TabsTrigger>
              <TabsTrigger value="history">
                <Clock className="w-4 h-4 mr-2" />
                My Disputes
              </TabsTrigger>
            </TabsList>

            {/* New Dispute Tab */}
            <TabsContent value="new">
              <Card>
                <CardHeader>
                  <CardTitle>Submit a New Dispute</CardTitle>
                  <CardDescription>
                    Please provide as much detail as possible to help us investigate your dispute.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Dispute Type */}
                  <div className="space-y-3">
                    <Label>What type of dispute is this?</Label>
                    <RadioGroup
                      value={formData.type}
                      onValueChange={(value) => updateFormData({ type: value })}
                      className="grid grid-cols-1 md:grid-cols-2 gap-3"
                    >
                      {disputeTypes.map((type) => (
                        <div key={type.value}>
                          <RadioGroupItem
                            value={type.value}
                            id={type.value}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={type.value}
                            className="flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50"
                          >
                            <type.icon className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-muted-foreground">
                                {type.description}
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief summary of your dispute"
                      value={formData.subject}
                      onChange={(e) => updateFormData({ subject: e.target.value })}
                    />
                  </div>

                  {/* Review ID (if applicable) */}
                  {(formData.type === "review_accuracy" || formData.type === "review_fake" || formData.type === "rating_unfair") && (
                    <div className="space-y-2">
                      <Label htmlFor="reviewId">Review ID (if known)</Label>
                      <Input
                        id="reviewId"
                        placeholder="e.g., REV-12345"
                        value={formData.reviewId}
                        onChange={(e) => updateFormData({ reviewId: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        You can find the Review ID on the review details page
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Detailed Description
                      <span className="text-muted-foreground font-normal ml-1">
                        (minimum 50 characters)
                      </span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Please describe your dispute in detail. Include specific facts, dates, and any relevant context that will help us investigate."
                      value={formData.description}
                      onChange={(e) => updateFormData({ description: e.target.value })}
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.description.length}/50 characters minimum
                    </p>
                  </div>

                  {/* Evidence */}
                  <div className="space-y-2">
                    <Label htmlFor="evidence">Supporting Evidence</Label>
                    <Textarea
                      id="evidence"
                      placeholder="Describe any evidence you have to support your dispute (contracts, communications, photos, etc.)"
                      value={formData.evidenceDescription}
                      onChange={(e) => updateFormData({ evidenceDescription: e.target.value })}
                      rows={3}
                    />
                    <Alert>
                      <Upload className="w-4 h-4" />
                      <AlertTitle>Evidence Upload</AlertTitle>
                      <AlertDescription>
                        After submitting, you'll receive an email with instructions to upload supporting documents securely.
                      </AlertDescription>
                    </Alert>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Contact Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.contactEmail}
                        onChange={(e) => updateFormData({ contactEmail: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Contact Phone (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="0400 000 000"
                        value={formData.contactPhone}
                        onChange={(e) => updateFormData({ contactPhone: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Policy Acknowledgment */}
                  <div className="flex items-start space-x-3 pt-4 border-t">
                    <Checkbox
                      id="policy"
                      checked={formData.acknowledgePolicy}
                      onCheckedChange={(checked) => updateFormData({ acknowledgePolicy: checked as boolean })}
                    />
                    <Label htmlFor="policy" className="text-sm leading-relaxed cursor-pointer">
                      I confirm that the information provided is accurate and truthful. I understand that submitting false or misleading disputes may result in account suspension. I have read and agree to the{" "}
                      <a href="/terms" className="text-primary hover:underline">
                        Dispute Resolution Policy
                      </a>
                      .
                    </Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={!canSubmit() || submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Dispute
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* Process Timeline */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Dispute Resolution Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          1
                        </div>
                        <div className="w-0.5 h-full bg-border mt-2" />
                      </div>
                      <div className="pb-6">
                        <h4 className="font-medium">Submit Dispute</h4>
                        <p className="text-sm text-muted-foreground">
                          Provide details and evidence for your dispute
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          2
                        </div>
                        <div className="w-0.5 h-full bg-border mt-2" />
                      </div>
                      <div className="pb-6">
                        <h4 className="font-medium">Initial Review (1-2 days)</h4>
                        <p className="text-sm text-muted-foreground">
                          Our team reviews your submission and may request additional information
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          3
                        </div>
                        <div className="w-0.5 h-full bg-border mt-2" />
                      </div>
                      <div className="pb-6">
                        <h4 className="font-medium">Investigation (3-5 days)</h4>
                        <p className="text-sm text-muted-foreground">
                          We investigate the dispute and contact relevant parties if needed
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          4
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium">Resolution</h4>
                        <p className="text-sm text-muted-foreground">
                          You'll receive our decision via email with any actions taken
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dispute History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>My Disputes</CardTitle>
                  <CardDescription>
                    Track the status of your submitted disputes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sampleDisputes.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Disputes Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't submitted any disputes yet.
                      </p>
                      <Button onClick={() => setActiveTab("new")}>
                        Submit a Dispute
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sampleDisputes.map((dispute) => (
                        <Card key={dispute.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-medium">
                                    {dispute.id}
                                  </span>
                                  {getStatusBadge(dispute.status)}
                                </div>
                                <h4 className="font-medium">{dispute.subject}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Submitted: {new Date(dispute.submittedAt).toLocaleDateString("en-AU")}
                                </p>
                                {dispute.resolution && (
                                  <p className="text-sm text-green-600">
                                    Resolution: {dispute.resolution}
                                  </p>
                                )}
                              </div>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">How long does the process take?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Most disputes are resolved within 5 business days. Complex cases may take up to 10 business days.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">What evidence should I provide?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Contracts, invoices, photos, email communications, and any documentation that supports your case.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Can I appeal a decision?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Yes, you can request a secondary review within 14 days of the initial decision by replying to the resolution email.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Will the reviewer be notified?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                For review disputes, we may contact the reviewer to gather additional information. Your identity is protected during this process.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
