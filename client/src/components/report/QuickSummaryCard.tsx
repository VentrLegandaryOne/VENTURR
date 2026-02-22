import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  DollarSign,
  Shield,
  FileCheck,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  HelpCircle
} from "lucide-react";

interface QuickSummaryCardProps {
  overallStatus: 'Green' | 'Amber' | 'Red';
  contractorName: string;
  quoteTotal: number;
  marketComparison?: {
    isAboveMarket: boolean;
    percentageDiff: number;
    potentialSavings?: number;
  };
  complianceStatus?: {
    licenseVerified: boolean;
    standardsCompliant: boolean;
    insuranceVerified: boolean;
  };
  hiddenCostsDetected?: number;
  onViewFullReport?: () => void;
  onDownloadPdf?: () => void;
}

export default function QuickSummaryCard({
  overallStatus,
  contractorName,
  quoteTotal,
  marketComparison,
  complianceStatus,
  hiddenCostsDetected = 0,
  onViewFullReport,
  onDownloadPdf
}: QuickSummaryCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusConfig = () => {
    switch (overallStatus) {
      case 'Green':
        return {
          icon: CheckCircle2,
          color: 'success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/30',
          title: 'Quote Looks Good',
          description: 'This quote appears fair and compliant'
        };
      case 'Amber':
        return {
          icon: AlertTriangle,
          color: 'warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/30',
          title: 'Review Recommended',
          description: 'Some items need clarification before proceeding'
        };
      case 'Red':
        return {
          icon: XCircle,
          color: 'destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/30',
          title: 'Significant Concerns',
          description: 'Major issues detected - proceed with caution'
        };
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`p-6 ${status.bgColor} border-2 ${status.borderColor}`}>
        {/* Header with Status */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-${status.color}/20 flex items-center justify-center`}>
              <StatusIcon className={`w-8 h-8 text-${status.color}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold text-${status.color}`}>{status.title}</h2>
              <p className="text-muted-foreground">{status.description}</p>
            </div>
          </div>
        </div>

        {/* Quick Facts Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Contractor */}
          <div className="p-4 bg-card/50 rounded-xl">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Contractor</p>
            <p className="font-semibold text-foreground truncate">{contractorName}</p>
          </div>

          {/* Quote Total */}
          <div className="p-4 bg-card/50 rounded-xl">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Quote Total</p>
            <p className="font-semibold font-mono text-foreground">{formatCurrency(quoteTotal)}</p>
          </div>

          {/* Market Comparison */}
          <div className="p-4 bg-card/50 rounded-xl">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">vs Market</p>
            {marketComparison ? (
              <div className="flex items-center gap-2">
                {marketComparison.isAboveMarket ? (
                  <>
                    <ThumbsDown className="w-4 h-4 text-warning" />
                    <span className="font-semibold text-warning">
                      +{marketComparison.percentageDiff}%
                    </span>
                  </>
                ) : (
                  <>
                    <ThumbsUp className="w-4 h-4 text-success" />
                    <span className="font-semibold text-success">
                      Fair Price
                    </span>
                  </>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">Analyzing...</span>
            )}
          </div>

          {/* Hidden Costs */}
          <div className="p-4 bg-card/50 rounded-xl">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Hidden Costs</p>
            {hiddenCostsDetected > 0 ? (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="font-semibold text-warning">{hiddenCostsDetected} Found</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="font-semibold text-success">None Detected</span>
              </div>
            )}
          </div>
        </div>

        {/* Compliance Checks */}
        {complianceStatus && (
          <div className="mb-6">
            <p className="text-sm font-medium text-foreground mb-3">Verification Status</p>
            <div className="flex flex-wrap gap-3">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                complianceStatus.licenseVerified ? 'bg-success/10' : 'bg-warning/10'
              }`}>
                {complianceStatus.licenseVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <HelpCircle className="w-4 h-4 text-warning" />
                )}
                <span className="text-sm font-medium">
                  License {complianceStatus.licenseVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                complianceStatus.standardsCompliant ? 'bg-success/10' : 'bg-warning/10'
              }`}>
                {complianceStatus.standardsCompliant ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <HelpCircle className="w-4 h-4 text-warning" />
                )}
                <span className="text-sm font-medium">
                  AS/NZS {complianceStatus.standardsCompliant ? 'Compliant' : 'Review Needed'}
                </span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                complianceStatus.insuranceVerified ? 'bg-success/10' : 'bg-warning/10'
              }`}>
                {complianceStatus.insuranceVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <HelpCircle className="w-4 h-4 text-warning" />
                )}
                <span className="text-sm font-medium">
                  Insurance {complianceStatus.insuranceVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Potential Savings Callout */}
        {marketComparison?.potentialSavings && marketComparison.potentialSavings > 0 && (
          <div className="p-4 bg-success/10 border border-success/20 rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-success" />
              <div>
                <p className="font-semibold text-success">
                  Potential Savings: {formatCurrency(marketComparison.potentialSavings)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Based on current market rates for similar work
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {onViewFullReport && (
            <Button 
              size="lg" 
              className="flex-1"
              onClick={onViewFullReport}
            >
              View Full Report
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
          {onDownloadPdf && (
            <Button 
              size="lg" 
              variant="outline"
              className="flex-1"
              onClick={onDownloadPdf}
            >
              <FileCheck className="w-5 h-5 mr-2" />
              Download Legal PDF
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
