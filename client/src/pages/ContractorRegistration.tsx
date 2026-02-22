import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  Building2,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  FileText,
  Phone,
  Mail,
  MapPin,
  Globe,
  Award,
  BadgeCheck,
  ArrowRight,
  ArrowLeft,
  Info,
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
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

// Australian states for license selection
const australianStates = [
  { value: "NSW", label: "New South Wales", authority: "NSW Fair Trading" },
  { value: "VIC", label: "Victoria", authority: "Victorian Building Authority (VBA)" },
  { value: "QLD", label: "Queensland", authority: "QBCC" },
  { value: "SA", label: "South Australia", authority: "Consumer and Business Services" },
  { value: "WA", label: "Western Australia", authority: "WA Building Commission" },
  { value: "TAS", label: "Tasmania", authority: "Consumer, Building and Occupational Services" },
  { value: "NT", label: "Northern Territory", authority: "NT Building Practitioners Board" },
  { value: "ACT", label: "Australian Capital Territory", authority: "ACT Planning and Land Authority" },
];

// Trade categories
const tradeCategories = [
  { value: "electrician", label: "Electrician" },
  { value: "plumber", label: "Plumber" },
  { value: "roofer", label: "Roofer" },
  { value: "builder", label: "Builder" },
  { value: "landscaper", label: "Landscaper" },
  { value: "carpenter", label: "Carpenter" },
  { value: "painter", label: "Painter" },
  { value: "tiler", label: "Tiler" },
  { value: "concreter", label: "Concreter" },
  { value: "other", label: "Other Trade" },
];

type RegistrationStep = "abn" | "license" | "business" | "insurance" | "review";

interface FormData {
  // ABN Step
  abn: string;
  abnVerified: boolean;
  businessName: string;
  gstRegistered: boolean;
  
  // License Step
  licenseNumber: string;
  licenseState: string;
  licenseExpiry: string;
  tradeCategory: string;
  
  // Business Step
  contactName: string;
  email: string;
  phone: string;
  address: string;
  suburb: string;
  postcode: string;
  state: string;
  website: string;
  description: string;
  
  // Insurance Step
  publicLiabilityInsurer: string;
  publicLiabilityAmount: string;
  publicLiabilityExpiry: string;
  workersCompInsurer: string;
  workersCompExpiry: string;
  
  // Agreements
  termsAccepted: boolean;
  privacyAccepted: boolean;
  accuracyConfirmed: boolean;
}

const initialFormData: FormData = {
  abn: "",
  abnVerified: false,
  businessName: "",
  gstRegistered: false,
  licenseNumber: "",
  licenseState: "",
  licenseExpiry: "",
  tradeCategory: "",
  contactName: "",
  email: "",
  phone: "",
  address: "",
  suburb: "",
  postcode: "",
  state: "",
  website: "",
  description: "",
  publicLiabilityInsurer: "",
  publicLiabilityAmount: "",
  publicLiabilityExpiry: "",
  workersCompInsurer: "",
  workersCompExpiry: "",
  termsAccepted: false,
  privacyAccepted: false,
  accuracyConfirmed: false,
};

export default function ContractorRegistration() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("abn");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [abnLoading, setAbnLoading] = useState(false);
  const [abnError, setAbnError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ABN verification mutation
  // Use query for ABN verification
  const verifyAbnQuery = trpc.credentials.verifyABN.useQuery(
    { abn: formData.abn },
    { enabled: false, retry: 2 }
  );

  const steps: { id: RegistrationStep; title: string; icon: React.ElementType }[] = [
    { id: "abn", title: "ABN Verification", icon: Building2 },
    { id: "license", title: "License Details", icon: Award },
    { id: "business", title: "Business Info", icon: MapPin },
    { id: "insurance", title: "Insurance", icon: Shield },
    { id: "review", title: "Review & Submit", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const verifyAbn = async () => {
    if (!formData.abn || formData.abn.length !== 11) {
      setAbnError("Please enter a valid 11-digit ABN");
      return;
    }

    setAbnLoading(true);
    setAbnError(null);

    try {
      const result = await verifyAbnQuery.refetch();
      
      if (result.data?.isValid) {
        updateFormData({
          abnVerified: true,
          businessName: result.data.entityName || "",
          gstRegistered: result.data.gstRegistered || false,
        });
      } else {
        setAbnError(result.data?.message || "ABN verification failed. Please check the number and try again.");
      }
    } catch (error) {
      setAbnError("Unable to verify ABN. Please try again later.");
    } finally {
      setAbnLoading(false);
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case "abn":
        return formData.abnVerified;
      case "license":
        return !!(formData.licenseNumber && formData.licenseState && formData.licenseExpiry && formData.tradeCategory);
      case "business":
        return !!(formData.contactName && formData.email && formData.phone && formData.address && formData.suburb && formData.postcode && formData.state);
      case "insurance":
        return !!(formData.publicLiabilityInsurer && formData.publicLiabilityAmount && formData.publicLiabilityExpiry);
      case "review":
        return formData.termsAccepted && formData.privacyAccepted && formData.accuracyConfirmed;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const idx = currentStepIndex;
    if (idx < steps.length - 1) {
      setCurrentStep(steps[idx + 1].id);
    }
  };

  const prevStep = () => {
    const idx = currentStepIndex;
    if (idx > 0) {
      setCurrentStep(steps[idx - 1].id);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    
    setSubmitting(true);
    setSubmitError(null);

    try {
      // In a real implementation, this would call a tRPC mutation to create the contractor
      // For now, we'll simulate success
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Navigate to success page or contractor dashboard
      navigate("/contractors");
    } catch (error) {
      setSubmitError("Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge variant="secondary" className="mb-4">
            <Building2 className="w-3 h-3 mr-1" />
            Contractor Registration
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Register Your Business
          </h1>
          <p className="text-muted-foreground">
            Join VENTURR VALDT to showcase your credentials and connect with verified homeowners.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  index <= currentStepIndex ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                    index < currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : index === currentStepIndex
                      ? "bg-primary/20 border-2 border-primary"
                      : "bg-muted"
                  }`}
                >
                  {index < currentStepIndex ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs hidden md:block">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const StepIcon = steps[currentStepIndex].icon;
                return <StepIcon className="w-5 h-5" />;
              })()}
              {steps[currentStepIndex].title}
            </CardTitle>
            <CardDescription>
              {currentStep === "abn" && "Verify your Australian Business Number to get started"}
              {currentStep === "license" && "Enter your trade license details for verification"}
              {currentStep === "business" && "Provide your business contact information"}
              {currentStep === "insurance" && "Add your insurance details for verification"}
              {currentStep === "review" && "Review your information and submit your registration"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* ABN Step */}
            {currentStep === "abn" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="abn">Australian Business Number (ABN)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="abn"
                      placeholder="12 345 678 901"
                      value={formData.abn}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 11);
                        updateFormData({ abn: value, abnVerified: false });
                        setAbnError(null);
                      }}
                      className="font-mono"
                      disabled={formData.abnVerified}
                    />
                    <Button
                      onClick={verifyAbn}
                      disabled={abnLoading || formData.abnVerified || formData.abn.length !== 11}
                    >
                      {abnLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : formData.abnVerified ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>
                  {abnError && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {abnError}
                    </p>
                  )}
                </div>

                {formData.abnVerified && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Alert className="bg-green-500/10 border-green-500/20">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <AlertTitle className="text-green-700">ABN Verified</AlertTitle>
                      <AlertDescription className="text-green-600">
                        <div className="mt-2 space-y-1">
                          <p><strong>Business Name:</strong> {formData.businessName}</p>
                          <p><strong>GST Registered:</strong> {formData.gstRegistered ? "Yes" : "No"}</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertTitle>Why do we need your ABN?</AlertTitle>
                  <AlertDescription>
                    We verify your ABN against the Australian Business Register to confirm your business is legitimate and active. This helps build trust with homeowners.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* License Step */}
            {currentStep === "license" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tradeCategory">Trade Category</Label>
                    <Select
                      value={formData.tradeCategory}
                      onValueChange={(value) => updateFormData({ tradeCategory: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your trade" />
                      </SelectTrigger>
                      <SelectContent>
                        {tradeCategories.map((trade) => (
                          <SelectItem key={trade.value} value={trade.value}>
                            {trade.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseState">License State</Label>
                    <Select
                      value={formData.licenseState}
                      onValueChange={(value) => updateFormData({ licenseState: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {australianStates.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    placeholder="Enter your license number"
                    value={formData.licenseNumber}
                    onChange={(e) => updateFormData({ licenseNumber: e.target.value })}
                  />
                  {formData.licenseState && (
                    <p className="text-xs text-muted-foreground">
                      Verified against: {australianStates.find((s) => s.value === formData.licenseState)?.authority}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseExpiry">License Expiry Date</Label>
                  <Input
                    id="licenseExpiry"
                    type="date"
                    value={formData.licenseExpiry}
                    onChange={(e) => updateFormData({ licenseExpiry: e.target.value })}
                  />
                </div>
              </motion.div>
            )}

            {/* Business Info Step */}
            {currentStep === "business" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name</Label>
                    <Input
                      id="contactName"
                      placeholder="John Smith"
                      value={formData.contactName}
                      onChange={(e) => updateFormData({ contactName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0400 000 000"
                      value={formData.phone}
                      onChange={(e) => updateFormData({ phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://www.example.com"
                      value={formData.website}
                      onChange={(e) => updateFormData({ website: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={(e) => updateFormData({ address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="suburb">Suburb</Label>
                    <Input
                      id="suburb"
                      placeholder="Sydney"
                      value={formData.suburb}
                      onChange={(e) => updateFormData({ suburb: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => updateFormData({ state: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        {australianStates.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input
                      id="postcode"
                      placeholder="2000"
                      value={formData.postcode}
                      onChange={(e) => updateFormData({ postcode: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about your business, specialties, and experience..."
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    rows={4}
                  />
                </div>
              </motion.div>
            )}

            {/* Insurance Step */}
            {currentStep === "insurance" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="font-medium">Public Liability Insurance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="publicLiabilityInsurer">Insurance Provider</Label>
                      <Input
                        id="publicLiabilityInsurer"
                        placeholder="e.g., QBE, Allianz"
                        value={formData.publicLiabilityInsurer}
                        onChange={(e) => updateFormData({ publicLiabilityInsurer: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="publicLiabilityAmount">Coverage Amount</Label>
                      <Select
                        value={formData.publicLiabilityAmount}
                        onValueChange={(value) => updateFormData({ publicLiabilityAmount: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select amount" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5000000">$5 Million</SelectItem>
                          <SelectItem value="10000000">$10 Million</SelectItem>
                          <SelectItem value="20000000">$20 Million</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="publicLiabilityExpiry">Policy Expiry Date</Label>
                    <Input
                      id="publicLiabilityExpiry"
                      type="date"
                      value={formData.publicLiabilityExpiry}
                      onChange={(e) => updateFormData({ publicLiabilityExpiry: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Workers Compensation (if applicable)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workersCompInsurer">Insurance Provider</Label>
                      <Input
                        id="workersCompInsurer"
                        placeholder="e.g., icare, WorkSafe"
                        value={formData.workersCompInsurer}
                        onChange={(e) => updateFormData({ workersCompInsurer: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workersCompExpiry">Policy Expiry Date</Label>
                      <Input
                        id="workersCompExpiry"
                        type="date"
                        value={formData.workersCompExpiry}
                        onChange={(e) => updateFormData({ workersCompExpiry: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <Alert>
                  <Shield className="w-4 h-4" />
                  <AlertTitle>Insurance Verification</AlertTitle>
                  <AlertDescription>
                    We'll verify your insurance details with your provider. You may be asked to upload a Certificate of Currency later.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Review Step */}
            {currentStep === "review" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Business Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p><strong>ABN:</strong> {formData.abn}</p>
                      <p><strong>Business:</strong> {formData.businessName}</p>
                      <p><strong>GST:</strong> {formData.gstRegistered ? "Registered" : "Not Registered"}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        License Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p><strong>Trade:</strong> {tradeCategories.find((t) => t.value === formData.tradeCategory)?.label}</p>
                      <p><strong>License:</strong> {formData.licenseNumber}</p>
                      <p><strong>State:</strong> {formData.licenseState}</p>
                      <p><strong>Expiry:</strong> {formData.licenseExpiry}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p><strong>Contact:</strong> {formData.contactName}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>Phone:</strong> {formData.phone}</p>
                      <p><strong>Address:</strong> {formData.address}, {formData.suburb} {formData.state} {formData.postcode}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Insurance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p><strong>Public Liability:</strong> {formData.publicLiabilityInsurer}</p>
                      <p><strong>Coverage:</strong> ${parseInt(formData.publicLiabilityAmount || "0").toLocaleString()}</p>
                      <p><strong>Expiry:</strong> {formData.publicLiabilityExpiry}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => updateFormData({ termsAccepted: checked as boolean })}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      I agree to the <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and understand that my profile will be publicly visible to homeowners.
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="privacy"
                      checked={formData.privacyAccepted}
                      onCheckedChange={(checked) => updateFormData({ privacyAccepted: checked as boolean })}
                    />
                    <Label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer">
                      I have read and accept the <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> and consent to the collection and use of my business information.
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="accuracy"
                      checked={formData.accuracyConfirmed}
                      onCheckedChange={(checked) => updateFormData({ accuracyConfirmed: checked as boolean })}
                    />
                    <Label htmlFor="accuracy" className="text-sm leading-relaxed cursor-pointer">
                      I confirm that all information provided is accurate and up-to-date. I understand that providing false information may result in account suspension.
                    </Label>
                  </div>
                </div>

                {submitError && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertTitle>Registration Failed</AlertTitle>
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep === "review" ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="min-w-[150px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Registration
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="text-xl font-bold mb-4 text-center">Why Register with VENTURR VALDT?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <BadgeCheck className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-medium mb-1">Verified Badge</h3>
                <p className="text-sm text-muted-foreground">
                  Stand out with a verified contractor badge that builds trust with homeowners.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Globe className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-medium mb-1">Increased Visibility</h3>
                <p className="text-sm text-muted-foreground">
                  Get discovered by homeowners searching for trusted contractors in your area.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Award className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-medium mb-1">Build Your Reputation</h3>
                <p className="text-sm text-muted-foreground">
                  Collect verified reviews and showcase your track record of quality work.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
