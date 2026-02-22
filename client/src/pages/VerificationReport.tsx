import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  Share2, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  DollarSign,
  Package,
  Shield,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Scale
} from "lucide-react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useEffect, useRef } from "react";
import { triggerConfettiCannon } from "@/lib/confetti";
import ShareReportDialog from "@/components/collaboration/ShareReportDialog";
import { ReportDisclaimer, InlineDisclaimer } from "@/components/Disclaimer";
import { DisclaimerAcknowledgment, useDisclaimerAcknowledgment } from "@/components/DisclaimerAcknowledgment";
import { QuoteAnnotations } from "@/components/QuoteAnnotations";
import { toast } from "sonner";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

interface ExpandableSectionProps {
  title: string;
  icon: React.ElementType;
  score: number;
  statusBadge: "verified" | "flagged" | "needs-review";
  children: React.ReactNode;
}

function ExpandableSection({ title, icon: Icon, score, statusBadge, children }: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const badgeConfig = {
    verified: { color: "text-success", bg: "bg-success/10", border: "border-success/20", label: "Looks Good" },
    flagged: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20", label: "Review Needed" },
    "needs-review": { color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", label: "Needs Review" },
  };

  const config = badgeConfig[statusBadge];

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${config.color}`} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm font-mono font-semibold text-card-foreground">{score}/100</span>
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 border-t border-border/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function VerificationReport() {
  const [, params] = useRoute("/quote/:id");
  const quoteId = parseInt(params?.id || "0");
  const confettiTriggered = useRef(false);
  const acknowledgment = useDisclaimerAcknowledgment();

  // Fetch real verification data
  const { data: quote, isLoading: quoteLoading, error: errorQuote } = trpc.quotes.getById.useQuery(
    { quoteId },
    { enabled: quoteId > 0, retry: 2 }
  );

  const { data: verification, isLoading: verificationLoading, error: errorVerification } = trpc.verifications.getByQuoteId.useQuery(
    { quoteId },
    { enabled: quoteId > 0, retry: 2 }
  );

  // Move useMutation hook BEFORE any early returns to comply with React hooks rules
  const exportPDFMutation = trpc.quotes.exportPDF.useMutation();

  // Move useEffect BEFORE any early returns to comply with React hooks rules
  // Trigger confetti for green status (only once)
  useEffect(() => {
    if (!confettiTriggered.current && verification?.statusBadge === "green") {
      confettiTriggered.current = true;
      setTimeout(() => {
        triggerConfettiCannon();
      }, 500);
    }
  }, [verification?.statusBadge]);

  const isLoading = quoteLoading || verificationLoading;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading verification report...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error if quote or verification not found
  if (!quote || !verification) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Verification report not found.</p>
            <Link href="/dashboard">
              <Button className="mt-4">Back to Dashboard</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleDownloadPdf = async () => {
    if (!quoteId) return;
    
    try {
      const result = await exportPDFMutation.mutateAsync({ quoteId });
      
      // Download the PDF
      const link = document.createElement('a');
      link.href = result.pdfUrl;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to generate PDF report. Please try again.');
    }
  };

  // Use verification data (already checked for null above)
  const reportData = {
    overallScore: verification.overallScore || 0,
    statusBadge: verification.statusBadge || "amber",
    pricingScore: verification.pricingScore || 0,
    materialsScore: verification.materialsScore || 0,
    complianceScore: verification.complianceScore || 0,
    warrantyScore: verification.warrantyScore || 0,
    pricingDetails: verification.pricingDetails || {
      marketRate: 45000,
      quotedRate: 52000,
      variance: 15.6,
      findings: [
        { item: "Labor costs", status: "flagged" as const, message: "18% above market average" },
        { item: "Material markup", status: "verified" as const, message: "Within industry standard (12%)" },
        { item: "Project complexity factor", status: "verified" as const, message: "Appropriate for scope" },
      ],
    },
    materialsDetails: verification.materialsDetails || {
      findings: [
        { 
          material: "Roofing sheets", 
          specified: "Colorbond 0.42mm BMT", 
          status: "verified" as const, 
          message: "Meets AS 1397 standards",
          supplier: "Lysaght"
        },
        { 
          material: "Flashing", 
          specified: "Zincalume", 
          status: "verified" as const, 
          message: "Compliant with HB-39 requirements",
          supplier: "Metroll"
        },
      ],
    },
    complianceDetails: verification.complianceDetails || {
      findings: [
        { 
          requirement: "Fall protection", 
          status: "compliant" as const, 
          message: "Meets SafeWork NSW guidelines",
          reference: "HB-39 Section 4.2"
        },
        { 
          requirement: "Structural adequacy", 
          status: "compliant" as const, 
          message: "Engineer certification included",
          reference: "NCC 2022 Section B1"
        },
      ],
    },
    warrantyDetails: verification.warrantyDetails || {
      findings: [
        { 
          item: "Workmanship warranty", 
          warrantyTerm: "5 years", 
          status: "flagged" as const, 
          message: "Below industry standard (typically 7-10 years)"
        },
        { 
          item: "Material warranty", 
          warrantyTerm: "15 years", 
          status: "verified" as const, 
          message: "Manufacturer warranty included"
        },
      ],
    },
    flags: verification.flags || [
      { category: "pricing" as const, severity: "medium" as "high" | "medium" | "low", message: "Quote is 15.6% above market rate" },
      { category: "warranty" as const, severity: "low" as "high" | "medium" | "low", message: "Workmanship warranty below industry standard" },
    ],
    australianStandardsCompliance: (verification as any).australianStandardsCompliance || {
      overallCompliance: "partial" as const,
      confidenceScore: 75,
      verifiedStandards: [
        {
          standardId: "NCC-2022-Vol2",
          title: "National Construction Code 2022 - Volume Two (Residential)",
          status: "compliant" as const,
          findings: ["Building classification correctly specified", "Fire safety requirements addressed"],
        },
        {
          standardId: "HB-39-2015",
          title: "Installation Code for Metal Roof and Wall Cladding",
          status: "non-compliant" as const,
          findings: ["Fastening/installation method not specified (HB-39 requires fixing details)"],
        },
        {
          standardId: "WHS-ACT-2011",
          title: "Work Health and Safety Act 2011",
          status: "non-compliant" as const,
          findings: ["Fall protection measures not specified for roofing work (WHS Act requires fall prevention)"],
        },
      ],
      findings: [
        {
          category: "compliance",
          severity: "high" as const,
          message: "Fall protection measures not specified for roofing work (WHS Act requires fall prevention)",
          standardReference: "WHS-ACT-2011: Work Health and Safety Act 2011",
        },
        {
          category: "compliance",
          severity: "medium" as const,
          message: "Fastening/installation method not specified (HB-39 requires fixing details)",
          standardReference: "HB-39-2015: Installation Code for Metal Roof and Wall Cladding",
        },
      ],
    },
    recommendations: verification.recommendations || [
      { title: "Negotiate pricing", description: "Request itemized breakdown and negotiate labor costs", priority: "high" as const },
      { title: "Extend warranty", description: "Ask for extended workmanship warranty (7-10 years)", priority: "medium" as const },
    ],
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  const getBadgeConfig = (badge: "green" | "amber" | "red") => {
    const configs = {
      green: { label: "Excellent", color: "text-success", bg: "bg-success/10", border: "border-success/20" },
      amber: { label: "Good with Notes", color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
      red: { label: "Issues Found", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
    };
    return configs[badge];
  };

  const badgeConfig = getBadgeConfig(reportData.statusBadge);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Sticky header with overall score */}
      <div className="sticky top-16 md:top-20 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Circular progress */}
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-muted/30"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - reportData.overallScore / 100) }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={getScoreColor(reportData.overallScore)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-lg font-bold font-mono ${getScoreColor(reportData.overallScore)}`}>
                    {reportData.overallScore}
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground">Analysis Report</h2>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${badgeConfig.bg} border ${badgeConfig.border} mt-1`}>
                  <span className={`text-sm font-medium ${badgeConfig.color}`}>{badgeConfig.label}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <Link href={`/validt-report/${quoteId}`}>
                <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  <Scale className="w-4 h-4 mr-2" />
                  Court Report
                </Button>
              </Link>
              <ShareReportDialog quoteId={quoteId} />
              <Button size="sm" onClick={() => acknowledgment.requestAcknowledgment("download", handleDownloadPdf)}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 pt-8 pb-16">
        <div className="container max-w-5xl">
          {/* Flags and recommendations */}
          {reportData.flags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="p-6 bg-warning/5 border-warning/20">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Key Findings
                </h3>
                <div className="space-y-3">
                  {reportData.flags.map((flag, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        flag.severity === "high" ? "bg-destructive" : 
                        flag.severity === "medium" ? "bg-warning" : "bg-muted-foreground"
                      }`} />
                      <p className="text-sm text-foreground">{flag.message}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Expandable sections */}
          <div className="space-y-4">
            {/* Pricing Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ExpandableSection
                title="Pricing Analysis"
                icon={DollarSign}
                score={reportData.pricingScore}
                statusBadge={reportData.pricingScore >= 85 ? "verified" : reportData.pricingScore >= 70 ? "needs-review" : "flagged"}
              >
                <div className="space-y-6">
                  {/* Price comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Market Rate</p>
                      <p className="text-2xl font-bold font-mono text-foreground">
                        ${(reportData.pricingDetails.marketRate || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Quoted Rate</p>
                      <p className="text-2xl font-bold font-mono text-foreground">
                        ${(reportData.pricingDetails.quotedRate || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Variance */}
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                    <TrendingUp className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="font-semibold text-destructive">
                        {reportData.pricingDetails.variance}% above market rate
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Potential savings: ${((reportData.pricingDetails.quotedRate || 0) - (reportData.pricingDetails.marketRate || 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Findings */}
                  <div className="space-y-3">
                    {(reportData.pricingDetails.findings || []).map((finding, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border/50">
                        {finding.status === "verified" ? (
                          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium text-card-foreground">{finding.item}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{finding.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ExpandableSection>
            </motion.div>

            {/* Materials Verification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ExpandableSection
                title="Materials Verification"
                icon={Package}
                score={reportData.materialsScore}
                statusBadge="verified"
              >
                <div className="space-y-3">
                  {(reportData.materialsDetails.findings || []).map((finding, index) => (
                    <div key={index} className="p-4 rounded-lg bg-card border border-border/50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-card-foreground">{finding.material}</p>
                          <p className="text-sm text-muted-foreground">Specified: {finding.specified}</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{finding.message}</p>
                      <p className="text-xs text-muted-foreground">Supplier: {finding.supplier}</p>
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            </motion.div>

            {/* Compliance Intelligence */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ExpandableSection
                title="Compliance Intelligence"
                icon={Shield}
                score={reportData.complianceScore}
                statusBadge="verified"
              >
                <div className="space-y-3">
                  {(reportData.complianceDetails.findings || []).map((finding, index) => (
                    <div key={index} className="p-4 rounded-lg bg-success/5 border border-success/20">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-foreground">{finding.requirement}</p>
                        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{finding.message}</p>
                      <p className="text-xs text-muted-foreground font-mono">{finding.reference}</p>
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            </motion.div>

            {/* Australian Standards Compliance */}
            {reportData.australianStandardsCompliance && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Card className="overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Shield className="w-5 h-5 text-primary" />
                          Australian Standards Compliance
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Verified against NCC 2022, HB-39, AS/NZS, and WHS Act 2011
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                          reportData.australianStandardsCompliance?.overallCompliance === "compliant" 
                            ? "bg-success/10 border border-success/20" 
                            : reportData.australianStandardsCompliance?.overallCompliance === "partial"
                            ? "bg-warning/10 border border-warning/20"
                            : "bg-destructive/10 border border-destructive/20"
                        }`}>
                          <span className={`text-sm font-medium ${
                            reportData.australianStandardsCompliance?.overallCompliance === "compliant" 
                              ? "text-success" 
                              : reportData.australianStandardsCompliance?.overallCompliance === "partial"
                              ? "text-warning"
                              : "text-destructive"
                          }`}>
                            {reportData.australianStandardsCompliance?.overallCompliance === "compliant" ? "Compliant" : 
                             reportData.australianStandardsCompliance?.overallCompliance === "partial" ? "Partial Compliance" : "Non-Compliant"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Confidence: {reportData.australianStandardsCompliance?.confidenceScore}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Verified Standards */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">Verified Standards</h4>
                      <div className="space-y-2">
                        {reportData.australianStandardsCompliance?.verifiedStandards.map((standard: any, index: number) => (
                          <div key={index} className={`p-3 rounded-lg border ${
                            standard.status === "compliant" 
                              ? "bg-success/5 border-success/20" 
                              : standard.status === "non-compliant"
                              ? "bg-destructive/5 border-destructive/20"
                              : "bg-muted/50 border-border"
                          }`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-mono text-xs text-primary">{standard.standardId}</p>
                                  {standard.status === "compliant" ? (
                                    <CheckCircle2 className="w-4 h-4 text-success" />
                                  ) : standard.status === "non-compliant" ? (
                                    <XCircle className="w-4 h-4 text-destructive" />
                                  ) : (
                                    <Minus className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </div>
                                <p className="text-sm font-medium text-foreground mt-1">{standard.title}</p>
                                {standard.findings.length > 0 && (
                                  <ul className="mt-2 space-y-1">
                                    {standard.findings.map((finding: string, fIndex: number) => (
                                      <li key={fIndex} className="text-xs text-muted-foreground flex items-start gap-2">
                                        <span className="text-muted-foreground">•</span>
                                        <span>{finding}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Compliance Findings */}
                    {reportData.australianStandardsCompliance && reportData.australianStandardsCompliance.findings.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-warning" />
                          Compliance Issues
                        </h4>
                        <div className="space-y-2">
                          {reportData.australianStandardsCompliance?.findings.map((finding: any, index: number) => (
                            <div key={index} className={`p-3 rounded-lg border ${
                              finding.severity === "high" 
                                ? "bg-destructive/5 border-destructive/20" 
                                : finding.severity === "medium"
                                ? "bg-warning/5 border-warning/20"
                                : "bg-muted/50 border-border"
                            }`}>
                              <div className="flex items-start gap-2">
                                <div className={`w-2 h-2 rounded-full mt-1.5 ${
                                  finding.severity === "high" ? "bg-destructive" : 
                                  finding.severity === "medium" ? "bg-warning" : "bg-muted-foreground"
                                }`} />
                                <div className="flex-1">
                                  <p className="text-sm text-foreground">{finding.message}</p>
                                  <p className="text-xs text-muted-foreground mt-1 font-mono">{finding.standardReference}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Warranty Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ExpandableSection
                title="Warranty Analysis"
                icon={FileText}
                score={reportData.warrantyScore}
                statusBadge="needs-review"
              >
                <div className="space-y-3">
                  {(reportData.warrantyDetails.findings || []).map((finding, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      finding.status === "verified" 
                        ? "bg-success/5 border-success/20" 
                        : "bg-warning/5 border-warning/20"
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-foreground">{finding.item}</p>
                          <p className="text-sm text-muted-foreground">Term: {finding.warrantyTerm}</p>
                        </div>
                        {finding.status === "verified" ? (
                          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{finding.message}</p>
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            </motion.div>
          </div>

          {/* Recommendations */}
          {reportData.recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recommendations</h3>
                <div className="space-y-4">
                  {reportData.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        rec.priority === "high" ? "bg-destructive" : 
                        rec.priority === "medium" ? "bg-warning" : "bg-muted-foreground"
                      }`} />
                      <div>
                        <p className="font-semibold text-foreground">{rec.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
          {/* Disclaimer Section */}
          <ReportDisclaimer />

          {/* Quote Annotations */}
          {quoteId && (
            <div className="mt-6">
              <QuoteAnnotations quoteId={quoteId} />
            </div>
          )}
        </div>
      </main>

      {/* Bottom sticky CTA */}
      <div className="sticky bottom-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border/50 shadow-lg">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Need help negotiating? Our experts can assist you.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share with Contractor
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Download Full Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Disclaimer Acknowledgment Dialog */}
      <DisclaimerAcknowledgment
        isOpen={acknowledgment.isOpen}
        onClose={acknowledgment.handleClose}
        onConfirm={acknowledgment.handleConfirm}
        actionType={acknowledgment.actionType}
        reportType="analysis"
      />
    </div>
  );
}
