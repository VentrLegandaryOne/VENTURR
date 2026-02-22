/**
 * VENTURR VALIDT Report View Component
 * 
 * Displays court-defensible verification reports with:
 * - Cover page with report metadata
 * - Executive summary with status indicators
 * - Evidence register (supplied, extracted, gaps)
 * - Pillar-based findings (Pricing, Materials, Compliance, Terms)
 * - Scoring logic explanation
 * - Actionable next steps
 * - Assumptions and limitations
 * - Neutral disclaimer
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Scale,
  Shield,
  Wrench,
  DollarSign,
  Package,
  ClipboardList,
  HelpCircle,
  AlertCircle,
  ChevronDown,
  Download,
  Printer,
  Info,
} from "lucide-react";
import { KnowledgeBaseSection } from "@/components/KnowledgeBaseSection";
import { StandardsTooltip, StandardsText } from "@/components/StandardsTooltip";

// Types from shared
type PillarStatus = 'Green' | 'Amber' | 'Red';
type ConfidenceLevel = 'Low' | 'Medium' | 'High';

interface Finding {
  id: string;
  fact: string;
  evidence: string;
  benchmark?: string;
  interpretation: string;
  riskStatement: string;
}

interface ClarifyingQuestion {
  id: number;
  question: string;
  pillar: string;
}

interface ValidtReport {
  coverPage: {
    reportId: string;
    dateGenerated: string;
    contractorName: string;
    clientName: string;
    siteAddress: string;
    quoteTotalIncGst: number;
    quoteDate: string;
    quoteVersion?: string;
    tradeCategory: string;
    engineVersion: string;
    confidenceLabel: ConfidenceLevel;
  };
  executiveSummary: {
    overallStatus: PillarStatus;
    consistentItemsCount: number;
    clarificationItemsCount: number;
    keyDrivers: {
      pricing?: string;
      materials?: string;
      compliance?: string;
      terms?: string;
      evidenceQuality?: string;
    };
    whatThisReportIs: string;
    whatThisReportIsNot: string;
  };
  evidenceRegister: {
    suppliedByUser: Array<{
      id: string;
      type: string;
      source: string;
      filename?: string;
      pageRange?: string;
      timestamp?: string;
      description: string;
      count?: number;
    }>;
    extractedByValidt: Array<{
      id: string;
      type: string;
      source: string;
      description: string;
    }>;
    evidenceGaps: Array<{
      id: string;
      description: string;
      impact: string;
      severity: string;
    }>;
  };
  pillars: {
    pricing: {
      status: PillarStatus;
      method: string;
      findings: Finding[];
      clarifyingQuestions: ClarifyingQuestion[];
      benchmarkSetName?: string;
      region?: string;
      tradeCategory?: string;
    };
    materials: {
      status: PillarStatus;
      method: string;
      findings: Finding[];
      clarifyingQuestions: ClarifyingQuestion[];
    };
    compliance: {
      status: PillarStatus;
      method: string;
      findings: Finding[];
      clarifyingQuestions: ClarifyingQuestion[];
      standardsReferenced?: string[];
    };
    terms: {
      status: PillarStatus;
      method: string;
      findings: Finding[];
      clarifyingQuestions: ClarifyingQuestion[];
    };
  };
  scoringLogic: {
    pillarStatuses: {
      pricing: PillarStatus;
      materials: PillarStatus;
      compliance: PillarStatus;
      terms: PillarStatus;
    };
    overallStatusRule: string;
    reasonForStatus: string;
  };
  actionableNextSteps: {
    topItems: string[];
    potentialStatusImprovement?: string;
  };
  assumptionsAndLimitations: {
    assumptions: Array<{ id: string; description: string }>;
    limitations: string[];
  };
  disclaimer: string;
  appendices: Array<{
    id: string;
    title: string;
    content: string | object;
  }>;
}

interface ValidtReportViewProps {
  report: ValidtReport;
  onDownloadPdf?: () => void;
  onDownloadBrandedPdf?: () => void;
  onPrint?: () => void;
  isDownloadingBrandedPdf?: boolean;
}

// Status badge component
function StatusBadge({ status }: { status: PillarStatus }) {
  const config = {
    Green: { icon: CheckCircle, className: "bg-green-100 text-green-800 border-green-300" },
    Amber: { icon: AlertTriangle, className: "bg-amber-100 text-amber-800 border-amber-300" },
    Red: { icon: XCircle, className: "bg-red-100 text-red-800 border-red-300" },
  };
  
  const { icon: Icon, className } = config[status];
  
  return (
    <Badge variant="outline" className={`${className} font-semibold`}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </Badge>
  );
}

// Confidence badge
function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const config = {
    High: "bg-green-100 text-green-800",
    Medium: "bg-amber-100 text-amber-800",
    Low: "bg-red-100 text-red-800",
  };
  
  return (
    <Badge variant="outline" className={config[level]}>
      Confidence: {level}
    </Badge>
  );
}

// Pillar icon component
function PillarIcon({ pillar }: { pillar: string }) {
  const icons = {
    pricing: DollarSign,
    materials: Package,
    compliance: Shield,
    terms: ClipboardList,
  };
  
  const Icon = icons[pillar as keyof typeof icons] || FileText;
  return <Icon className="w-5 h-5" />;
}

export function ValidtReportView({ report, onDownloadPdf, onDownloadBrandedPdf, onPrint, isDownloadingBrandedPdf }: ValidtReportViewProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["executive-summary"]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:space-y-4">
      {/* Action buttons - Sticky download bar */}
      <div className="sticky top-20 z-40 bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg print:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{report.coverPage.contractorName}</p>
              <p className="text-xs text-muted-foreground font-mono">{report.coverPage.reportId}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {onDownloadBrandedPdf && (
              <Button 
                size="sm" 
                onClick={onDownloadBrandedPdf}
                disabled={isDownloadingBrandedPdf}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isDownloadingBrandedPdf ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download Legal PDF
                  </>
                )}
              </Button>
            )}
            {onDownloadPdf && (
              <Button variant="outline" size="sm" onClick={onDownloadPdf}>
                <Download className="w-4 h-4 mr-2" />
                Quick PDF
              </Button>
            )}
            {onPrint && (
              <Button variant="outline" size="sm" onClick={onPrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Important Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 print:bg-amber-50">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Important Notice</p>
            <p className="text-sm text-amber-700 mt-1">
              This report is AI-generated for informational purposes only. It does not constitute 
              professional, legal, or engineering advice. Consult qualified professionals before 
              making decisions. See full disclaimer at the end of this report.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Cover Page */}
      <Card className="border-2 border-teal-500">
        <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium">VENTURR VALIDT</p>
              <CardTitle className="text-2xl">Quote Verification Report</CardTitle>
            </div>
            <ConfidenceBadge level={report.coverPage.confidenceLabel} />
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Prominent Contractor Identification Banner */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Contractor / Quoter</p>
                <p className="text-xl font-bold text-foreground mt-1">{report.coverPage.contractorName}</p>
                <p className="text-sm text-muted-foreground mt-1">{report.coverPage.tradeCategory}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Quote Total</p>
                <p className="text-2xl font-bold text-teal-600 mt-1">{formatCurrency(report.coverPage.quoteTotalIncGst)}</p>
                <p className="text-xs text-muted-foreground">inc. GST</p>
              </div>
            </div>
          </div>

          {/* Report Reference */}
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Report Reference</p>
              <p className="font-mono font-bold text-sm">{report.coverPage.reportId}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Generated</p>
              <p className="font-medium text-sm">{formatDate(report.coverPage.dateGenerated)}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Quote Date</p>
              <p className="font-medium text-sm">{formatDate(report.coverPage.quoteDate)} (v{report.coverPage.quoteVersion || '1'})</p>
            </div>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-600 uppercase tracking-wider font-medium">Property / Site</p>
              <p className="font-medium text-foreground mt-1">{report.coverPage.clientName}</p>
              <p className="text-muted-foreground text-sm">{report.coverPage.siteAddress}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Engine Version</p>
              <p className="font-mono text-xs">VALIDT-{report.coverPage.engineVersion}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Executive Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-500" />
              Executive Summary
            </CardTitle>
            <StatusBadge status={report.executiveSummary.overallStatus} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border">
            <p className="text-sm">
              Based on the documents provided, VALIDT identified{" "}
              <span className="font-semibold text-green-600">
                {report.executiveSummary.consistentItemsCount} items
              </span>{" "}
              that appear consistent with typical industry practice and{" "}
              <span className="font-semibold text-amber-600">
                {report.executiveSummary.clarificationItemsCount} items
              </span>{" "}
              that require clarification or adjustment before acceptance.
            </p>
          </div>

          {/* Key Drivers */}
          <div>
            <h4 className="font-semibold mb-2">Key Drivers</h4>
            <ul className="space-y-1 text-sm">
              {report.executiveSummary.keyDrivers.pricing && (
                <li className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span><strong>Pricing:</strong> {report.executiveSummary.keyDrivers.pricing}</span>
                </li>
              )}
              {report.executiveSummary.keyDrivers.materials && (
                <li className="flex items-start gap-2">
                  <Package className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span><strong>Materials:</strong> {report.executiveSummary.keyDrivers.materials}</span>
                </li>
              )}
              {report.executiveSummary.keyDrivers.compliance && (
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span><strong>Compliance:</strong> {report.executiveSummary.keyDrivers.compliance}</span>
                </li>
              )}
              {report.executiveSummary.keyDrivers.terms && (
                <li className="flex items-start gap-2">
                  <ClipboardList className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span><strong>Terms:</strong> {report.executiveSummary.keyDrivers.terms}</span>
                </li>
              )}
              {report.executiveSummary.keyDrivers.evidenceQuality && (
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span><strong>Evidence Quality:</strong> {report.executiveSummary.keyDrivers.evidenceQuality}</span>
                </li>
              )}
            </ul>
          </div>

          <Separator />

          {/* What this report is/is not */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="font-semibold text-green-800 mb-1">What this report is:</p>
              <p className="text-green-700">{report.executiveSummary.whatThisReportIs}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <p className="font-semibold text-amber-800 mb-1">What this report is not:</p>
              <p className="text-amber-700">{report.executiveSummary.whatThisReportIsNot}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Evidence Register */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-teal-500" />
            Evidence Register
            <Badge variant="secondary" className="ml-2">Court Spine</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Evidence Supplied */}
          <div>
            <h4 className="font-semibold text-sm mb-2 text-green-700">Evidence Supplied by User</h4>
            <div className="space-y-2">
              {report.evidenceRegister.suppliedByUser.map((item) => (
                <div key={item.id} className="flex items-start gap-3 text-sm bg-green-50 p-2 rounded">
                  <Badge variant="outline" className="bg-green-100 text-green-800 font-mono">
                    {item.id}
                  </Badge>
                  <div>
                    <p>{item.description}</p>
                    {item.filename && (
                      <p className="text-muted-foreground text-xs">
                        {item.filename}{item.pageRange && `, pages ${item.pageRange}`}
                        {item.timestamp && `, received ${formatDate(item.timestamp)}`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Extracted */}
          <div>
            <h4 className="font-semibold text-sm mb-2 text-blue-700">Evidence Extracted by VALIDT</h4>
            <div className="space-y-2">
              {report.evidenceRegister.extractedByValidt.map((item) => (
                <div key={item.id} className="flex items-start gap-3 text-sm bg-blue-50 p-2 rounded">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 font-mono">
                    {item.id}
                  </Badge>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Gaps */}
          {report.evidenceRegister.evidenceGaps.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 text-red-700">Evidence Gaps (Must Be Explicit)</h4>
              <div className="space-y-2">
                {report.evidenceRegister.evidenceGaps.map((gap) => (
                  <div key={gap.id} className="flex items-start gap-3 text-sm bg-red-50 p-2 rounded">
                    <Badge variant="outline" className="bg-red-100 text-red-800 font-mono">
                      {gap.id}
                    </Badge>
                    <div>
                      <p>{gap.description}</p>
                      <p className="text-muted-foreground text-xs">
                        Impact: {gap.impact} | Severity: {gap.severity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Findings by Pillar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-500" />
            Findings by Pillar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={["pricing"]} className="space-y-2">
            {/* Pricing Pillar */}
            <AccordionItem value="pricing" className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <PillarIcon pillar="pricing" />
                  <span className="font-semibold">Pillar A — Pricing Verification</span>
                  <StatusBadge status={report.pillars.pricing.status} />
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <PillarContent pillar={report.pillars.pricing} pillarKey="pricing" />
              </AccordionContent>
            </AccordionItem>

            {/* Materials Pillar */}
            <AccordionItem value="materials" className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <PillarIcon pillar="materials" />
                  <span className="font-semibold">Pillar B — Materials Verification</span>
                  <StatusBadge status={report.pillars.materials.status} />
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <PillarContent pillar={report.pillars.materials} pillarKey="materials" />
              </AccordionContent>
            </AccordionItem>

            {/* Compliance Pillar */}
            <AccordionItem value="compliance" className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <PillarIcon pillar="compliance" />
                  <span className="font-semibold">Pillar C — Compliance Verification</span>
                  <StatusBadge status={report.pillars.compliance.status} />
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <PillarContent pillar={report.pillars.compliance} pillarKey="compliance" />
                {report.pillars.compliance.standardsReferenced && (
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                      Standards Referenced
                      <span className="text-xs font-normal text-muted-foreground">(click for details)</span>
                    </p>
                    <ul className="text-sm space-y-2">
                      {report.pillars.compliance.standardsReferenced.map((std, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-muted-foreground">•</span>
                          <StandardsTooltip standard={std} variant="badge">
                            {std}
                          </StandardsTooltip>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Terms Pillar */}
            <AccordionItem value="terms" className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <PillarIcon pillar="terms" />
                  <span className="font-semibold">Pillar D — Warranty & Terms Verification</span>
                  <StatusBadge status={report.pillars.terms.status} />
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <PillarContent pillar={report.pillars.terms} pillarKey="terms" />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* 4.5 Industry Knowledge Base */}
      {report.coverPage.tradeCategory && (
        <KnowledgeBaseSection 
          trade={report.coverPage.tradeCategory} 
          compactMode={true}
          showInReport={true}
        />
      )}

      {/* 5. Scoring + Decision Logic */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-teal-500" />
            Scoring & Decision Logic
            <Badge variant="secondary">Explainable</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pillar Status Grid */}
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(report.scoringLogic.pillarStatuses).map(([pillar, status]) => (
              <div key={pillar} className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-muted-foreground capitalize mb-1">{pillar}</p>
                <StatusBadge status={status} />
              </div>
            ))}
          </div>

          {/* Overall Status Rule */}
          <div className="bg-slate-50 p-4 rounded-lg text-sm">
            <p className="font-semibold mb-2">Overall Status Rule:</p>
            <p className="text-muted-foreground">{report.scoringLogic.overallStatusRule}</p>
          </div>

          {/* Reason for Status */}
          <div className="p-4 border-l-4 border-teal-500 bg-teal-50">
            <p className="font-medium">{report.scoringLogic.reasonForStatus}</p>
          </div>
        </CardContent>
      </Card>

      {/* 6. Actionable Next Steps */}
      <Card className="border-2 border-amber-300">
        <CardHeader className="bg-amber-50">
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
            Actionable Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="font-semibold mb-3">Before signing, request written confirmation of:</p>
          <ol className="list-decimal list-inside space-y-2">
            {report.actionableNextSteps.topItems.map((item, i) => (
              <li key={i} className="text-sm">{item}</li>
            ))}
          </ol>
          {report.actionableNextSteps.potentialStatusImprovement && (
            <p className="mt-4 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
              {report.actionableNextSteps.potentialStatusImprovement}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 7. Assumptions & Limitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-teal-500" />
            Assumptions & Limitations
            <Badge variant="destructive" className="ml-2">Mandatory</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {report.assumptionsAndLimitations.assumptions.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Assumptions Made (only if unavoidable):</h4>
              <ul className="space-y-1 text-sm">
                {report.assumptionsAndLimitations.assumptions.map((a) => (
                  <li key={a.id} className="flex items-start gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{a.id}</Badge>
                    <span>{a.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-sm mb-2">Limitations:</h4>
            <ul className="space-y-1 text-sm">
              {report.assumptionsAndLimitations.limitations.map((limitation, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 8. Neutral Disclaimer */}
      <Card className="bg-slate-50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground italic text-center">
            {report.disclaimer}
          </p>
        </CardContent>
      </Card>

      {/* 9. Appendices */}
      {report.appendices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-500" />
              Appendices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-2">
              {report.appendices.map((appendix) => (
                <AccordionItem key={appendix.id} value={appendix.id} className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <span className="font-medium">
                      Appendix {appendix.id}: {appendix.title}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    {typeof appendix.content === 'string' ? (
                      <pre className="text-sm bg-slate-50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                        {appendix.content}
                      </pre>
                    ) : (
                      <pre className="text-sm bg-slate-50 p-3 rounded overflow-x-auto">
                        {JSON.stringify(appendix.content, null, 2)}
                      </pre>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Pillar content sub-component
function PillarContent({ pillar, pillarKey }: { pillar: any; pillarKey: string }) {
  return (
    <div className="space-y-4">
      {/* Method */}
      <div className="bg-slate-50 p-3 rounded-lg">
        <p className="font-semibold text-sm mb-1">Method:</p>
        <p className="text-sm text-muted-foreground">{pillar.method}</p>
      </div>

      {/* Findings */}
      <div>
        <p className="font-semibold text-sm mb-2">Findings:</p>
        <div className="space-y-3">
          {pillar.findings.map((finding: Finding) => (
            <div key={finding.id} className="border rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2 mb-2">
                <Badge variant="outline" className="font-mono">{finding.id}</Badge>
                <span className="font-medium">Finding (fact):</span>
              </div>
              <p className="mb-2"><StandardsText text={finding.fact} /></p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <p><strong>Evidence:</strong> <StandardsText text={finding.evidence} /></p>
                {finding.benchmark && <p><strong>Benchmark:</strong> <StandardsText text={finding.benchmark} /></p>}
              </div>
              <p className="mt-2 text-xs">
                <strong>Interpretation:</strong>{" "}
                <span className={
                  finding.interpretation.includes("Within range") || 
                  finding.interpretation.includes("Clear") ||
                  finding.interpretation.includes("Sufficiently")
                    ? "text-green-600"
                    : "text-amber-600"
                }>
                  <StandardsText text={finding.interpretation} />
                </span>
              </p>
              {finding.riskStatement && (
                <p className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                  <strong>Risk Statement:</strong> {finding.riskStatement}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Clarifying Questions */}
      {pillar.clarifyingQuestions.length > 0 && (
        <div className="bg-amber-50 p-3 rounded-lg">
          <p className="font-semibold text-sm mb-2 text-amber-800">Required Clarifying Questions:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            {pillar.clarifyingQuestions.map((q: ClarifyingQuestion) => (
              <li key={q.id}>{q.question}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default ValidtReportView;
