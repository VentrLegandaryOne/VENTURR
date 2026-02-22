import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Building2,
  Wrench,
  DollarSign,
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Download,
  ChevronRight,
  Loader2,
  BadgeCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Hash
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";

interface QuoteData {
  id: number;
  fileName: string;
  status: string;
  createdAt: string | Date;
  progressPercentage?: number | null;
  extractedData?: null | {
    contractor?: string;
    totalAmount?: number;
    projectAddress?: string;
    quoteDate?: string;
    abn?: string;
    phone?: string;
    email?: string;
    licenseNumber?: string;
    lineItems?: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
  };
}

interface EnhancedQuoteCardProps {
  quote: QuoteData;
  onDelete?: () => void;
  onShare?: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
  isSelectionMode?: boolean;
}

// Detect work type from filename or line items
function detectWorkType(quote: QuoteData): { type: string; icon: string; color: string } {
  const fileName = quote.fileName.toLowerCase();
  const lineItems = quote.extractedData?.lineItems || [];
  const descriptions = lineItems.map(item => item.description.toLowerCase()).join(" ");
  const combined = `${fileName} ${descriptions}`;

  const workTypes = [
    { keywords: ["roof", "roofing", "tile", "colorbond", "gutter"], type: "Roofing", icon: "🏠", color: "bg-orange-100 text-orange-700" },
    { keywords: ["plumb", "pipe", "drain", "water", "bathroom", "toilet"], type: "Plumbing", icon: "🔧", color: "bg-blue-100 text-blue-700" },
    { keywords: ["electric", "wiring", "switchboard", "power", "light"], type: "Electrical", icon: "⚡", color: "bg-yellow-100 text-yellow-700" },
    { keywords: ["build", "construct", "extension", "deck", "renovation"], type: "Building", icon: "🏗️", color: "bg-gray-100 text-gray-700" },
    { keywords: ["landscape", "garden", "paving", "retaining", "fence"], type: "Landscaping", icon: "🌿", color: "bg-green-100 text-green-700" },
    { keywords: ["paint", "coating", "render"], type: "Painting", icon: "🎨", color: "bg-purple-100 text-purple-700" },
    { keywords: ["hvac", "air con", "heating", "cooling"], type: "HVAC", icon: "❄️", color: "bg-cyan-100 text-cyan-700" },
    { keywords: ["solar", "panel", "inverter"], type: "Solar", icon: "☀️", color: "bg-amber-100 text-amber-700" },
  ];

  for (const wt of workTypes) {
    if (wt.keywords.some(kw => combined.includes(kw))) {
      return { type: wt.type, icon: wt.icon, color: wt.color };
    }
  }

  return { type: "General", icon: "📋", color: "bg-slate-100 text-slate-700" };
}

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0
  }).format(amount);
}

// Format date
function formatDate(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Get status badge config
function getStatusBadge(status: string) {
  const configs: Record<string, { bg: string; color: string; label: string }> = {
    draft: { bg: "bg-slate-100", color: "text-slate-600", label: "Draft" },
    uploaded: { bg: "bg-blue-100", color: "text-blue-600", label: "Uploaded" },
    processing: { bg: "bg-amber-100", color: "text-amber-600", label: "Processing" },
    completed: { bg: "bg-success/10", color: "text-success", label: "Verified" },
    failed: { bg: "bg-destructive/10", color: "text-destructive", label: "Failed" },
  };
  return configs[status] || configs.draft;
}

export function EnhancedQuoteCard({
  quote,
  onDelete,
  onShare,
  isSelected,
  onSelect,
  isSelectionMode,
}: EnhancedQuoteCardProps) {
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [isVerifyingCredentials, setIsVerifyingCredentials] = useState(false);
  const [credentialResults, setCredentialResults] = useState<any>(null);

  // Fetch verification data
  const { data: verification } = trpc.verifications.getByQuoteId.useQuery(
    { quoteId: quote.id },
    { enabled: quote.status === "completed" }
  );

  const workType = detectWorkType(quote);
  const statusBadge = getStatusBadge(quote.status);
  const contractor = quote.extractedData?.contractor || "Unknown Contractor";
  const totalAmount = quote.extractedData?.totalAmount;
  const abn = quote.extractedData?.abn;
  const licenseNumber = quote.extractedData?.licenseNumber;

  // ABN Verification - use refetch pattern for queries
  const utils = trpc.useUtils();

  const handleVerifyCredentials = async () => {
    setIsVerifyingCredentials(true);
    setShowCredentialModal(true);

    try {
      const results: any = {
        abn: null,
        license: null,
        timestamp: new Date().toISOString()
      };

      // Verify ABN if available
      if (abn) {
        try {
          const abnResult = await utils.credentials.verifyABN.fetch({ abn: abn.replace(/\s/g, '') });
          results.abn = abnResult;
        } catch (e) {
          results.abn = { valid: false, error: "Could not verify ABN" };
        }
      }

      // Verify License if available
      if (licenseNumber) {
        try {
          const licenseResult = await utils.credentials.verifyLicense.fetch({
            licenseNumber,
            state: "nsw" // Default to NSW, could be detected from address
          });
          results.license = licenseResult;
        } catch (e) {
          results.license = { valid: false, error: "Could not verify license" };
        }
      }

      setCredentialResults(results);
    } catch (error) {
      console.error("Credential verification failed:", error);
      toast.error("Failed to verify credentials");
    } finally {
      setIsVerifyingCredentials(false);
    }
  };

  return (
    <>
      <Card className={`p-4 sm:p-5 transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        {/* Header Row: Company Name + Work Type Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {isSelectionMode && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onSelect}
                className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-card-foreground truncate text-base">
                {contractor}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${workType.color}`}>
                  <span>{workType.icon}</span>
                  {workType.type}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.color}`}>
                  {statusBadge.label}
                </span>
              </div>
            </div>
          </div>

          {/* Score Badge (if completed) */}
          {quote.status === "completed" && verification && (
            <div className="flex-shrink-0">
              <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${
                verification.overallScore >= 80 ? 'bg-success/10' :
                verification.overallScore >= 60 ? 'bg-amber-100' : 'bg-destructive/10'
              }`}>
                <span className={`text-lg font-bold ${
                  verification.overallScore >= 80 ? 'text-success' :
                  verification.overallScore >= 60 ? 'text-amber-600' : 'text-destructive'
                }`}>
                  {verification.overallScore}
                </span>
                <span className="text-[10px] text-muted-foreground">/100</span>
              </div>
            </div>
          )}
        </div>

        {/* Details Row */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          {/* Quote Amount */}
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="font-semibold text-primary truncate">
              {totalAmount ? formatCurrency(totalAmount) : "Amount pending"}
            </span>
          </div>

          {/* Quote Date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground truncate">
              {formatDate(quote.createdAt)}
            </span>
          </div>

          {/* ABN */}
          {abn && (
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground truncate font-mono text-xs">
                ABN: {abn}
              </span>
            </div>
          )}

          {/* Reference */}
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground truncate text-xs">
              REF-{String(quote.id).padStart(5, '0')}
            </span>
          </div>
        </div>

        {/* Progress Bar (if processing) */}
        {quote.status === "processing" && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Verifying...</span>
              <span className="text-xs font-medium">{quote.progressPercentage || 0}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${quote.progressPercentage || 0}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          {quote.status === "completed" ? (
            <>
              <Link href={`/quote/${quote.id}`} className="flex-1">
                <Button size="sm" variant="outline" className="w-full min-h-[40px]">
                  <Eye className="w-4 h-4 mr-1.5" />
                  View Report
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                className="min-h-[40px]"
                onClick={handleVerifyCredentials}
              >
                <Shield className="w-4 h-4 mr-1.5" />
                Check Credentials
              </Button>
            </>
          ) : quote.status === "processing" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground w-full justify-center py-1">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing quote...</span>
            </div>
          ) : quote.status === "failed" ? (
            <div className="flex items-center gap-2 text-sm text-destructive w-full justify-center py-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Verification failed</span>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="w-full min-h-[40px]">
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>

      {/* Credential Verification Modal */}
      <Dialog open={showCredentialModal} onOpenChange={setShowCredentialModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Credential Verification
            </DialogTitle>
            <DialogDescription>
              Checking contractor credentials for {contractor}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {isVerifyingCredentials ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted-foreground">Verifying credentials...</p>
              </div>
            ) : credentialResults ? (
              <>
                {/* ABN Verification */}
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      ABN Verification
                    </span>
                    {abn ? (
                      credentialResults.abn?.valid ? (
                        <Badge className="bg-success/10 text-success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Invalid
                        </Badge>
                      )
                    ) : (
                      <Badge variant="secondary">Not Provided</Badge>
                    )}
                  </div>
                  {abn && (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-mono">{abn}</p>
                      {credentialResults.abn?.businessName && (
                        <p className="mt-1">Business: {credentialResults.abn.businessName}</p>
                      )}
                      {credentialResults.abn?.gstRegistered !== undefined && (
                        <p>GST Registered: {credentialResults.abn.gstRegistered ? "Yes" : "No"}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* License Verification */}
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4" />
                      License Verification
                    </span>
                    {licenseNumber ? (
                      credentialResults.license?.valid ? (
                        <Badge className="bg-success/10 text-success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Valid
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Invalid
                        </Badge>
                      )
                    ) : (
                      <Badge variant="secondary">Not Provided</Badge>
                    )}
                  </div>
                  {licenseNumber && (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-mono">{licenseNumber}</p>
                      {credentialResults.license?.licenseType && (
                        <p className="mt-1">Type: {credentialResults.license.licenseType}</p>
                      )}
                      {credentialResults.license?.expiryDate && (
                        <p>Expires: {credentialResults.license.expiryDate}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                {(quote.extractedData?.phone || quote.extractedData?.email) && (
                  <div className="p-4 rounded-lg border">
                    <span className="font-medium mb-2 block">Contact Information</span>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {quote.extractedData?.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {quote.extractedData.phone}
                        </p>
                      )}
                      {quote.extractedData?.email && (
                        <p className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {quote.extractedData.email}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Verification Timestamp */}
                <p className="text-xs text-muted-foreground text-center">
                  Verified at {new Date(credentialResults.timestamp).toLocaleString('en-AU')}
                </p>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No credential data available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default EnhancedQuoteCard;
