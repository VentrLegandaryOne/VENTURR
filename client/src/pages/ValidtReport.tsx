/**
 * VENTURR VALIDT Court-Defensible Report Page
 * 
 * Displays the full court-defensible verification report
 * following the template pack structure.
 */

import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { ValidtReportView } from "@/components/ValidtReportView";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { ReportDisclaimer } from "@/components/Disclaimer";
import { DisclaimerAcknowledgment, useDisclaimerAcknowledgment } from "@/components/DisclaimerAcknowledgment";
import { toast } from "sonner";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

export default function ValidtReportPage() {
  const [, params] = useRoute("/validt-report/:quoteId");
  const quoteId = params?.quoteId ? parseInt(params.quoteId) : 0;
  const acknowledgment = useDisclaimerAcknowledgment();
  const [isDownloadingBrandedPdf, setIsDownloadingBrandedPdf] = useState(false);

  const { data: report, isLoading, error } = trpc.reports.generateValidtReport.useQuery(
    { quoteId },
    { enabled: quoteId > 0, retry: 2 }
  );

  const downloadBrandedPdfMutation = trpc.reports.downloadBrandedPdf.useMutation({
    onSuccess: (data) => {
      // Download the PDF
      const link = document.createElement('a');
      link.href = data.pdfUrl;
      link.download = data.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Legal PDF downloaded successfully', {
        description: `Report ID: ${data.reportId}`,
      });
    },
    onError: (error) => {
      toast.error('Failed to generate PDF', {
        description: error.message,
      });
    },
    onSettled: () => {
      setIsDownloadingBrandedPdf(false);
    },
  });

  const handleDownloadPdf = () => {
    // Quick PDF - just print to PDF
    window.print();
  };

  const handleDownloadBrandedPdf = () => {
    setIsDownloadingBrandedPdf(true);
    downloadBrandedPdfMutation.mutate({ quoteId });
  };

  const handlePrint = () => {
    window.print();
  };

  // Wrapped handlers that require acknowledgment
  const handleDownloadWithAcknowledgment = () => {
    acknowledgment.requestAcknowledgment("download", handleDownloadPdf);
  };

  const handleBrandedPdfWithAcknowledgment = () => {
    acknowledgment.requestAcknowledgment("download", handleDownloadBrandedPdf);
  };

  const handlePrintWithAcknowledgment = () => {
    acknowledgment.requestAcknowledgment("download", handlePrint);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-teal-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Generating court-defensible report...</p>
            <p className="text-sm text-muted-foreground mt-2">
              This may take a few moments as we compile all evidence and findings.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive font-medium mb-2">Failed to generate report</p>
            <p className="text-muted-foreground text-sm mb-4">
              {error?.message || "The verification may not exist or you may not have access."}
            </p>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* Back button */}
      <div className="container py-4 print:hidden">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Report content */}
      <main className="flex-1 container pb-12 print:pb-0">
        <ValidtReportView 
          report={report}
          onDownloadPdf={handleDownloadWithAcknowledgment}
          onDownloadBrandedPdf={handleBrandedPdfWithAcknowledgment}
          onPrint={handlePrintWithAcknowledgment}
          isDownloadingBrandedPdf={isDownloadingBrandedPdf}
        />
        
        {/* Disclaimer - hidden in print */}
        <div className="mt-8 print:hidden">
          <ReportDisclaimer />
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>

      {/* Disclaimer Acknowledgment Dialog */}
      <DisclaimerAcknowledgment
        isOpen={acknowledgment.isOpen}
        onClose={acknowledgment.handleClose}
        onConfirm={acknowledgment.handleConfirm}
        actionType={acknowledgment.actionType}
        reportType="validt"
      />
    </div>
  );
}
