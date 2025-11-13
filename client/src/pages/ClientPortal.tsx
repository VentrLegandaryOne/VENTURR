/**
 * Client Portal
 * 
 * Public-facing portal where clients can:
 * - View quotes sent to them
 * - Accept/decline quotes
 * - Track project progress
 * - View compliance documentation
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Download, 
  Eye,
  Shield,
  Calendar,
  DollarSign
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { APP_TITLE } from "@/const";

export default function ClientPortal() {
  const { user } = useAuth();
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);

  // Fetch quotes for current user's organization
  // Note: This requires a projectId - for now showing empty state
  const { data: quotes, isLoading } = trpc.quotes.list.useQuery(
    { projectId: "" },
    { enabled: false } // Disable until we have proper project context
  );

  const acceptQuoteMutation = trpc.quotes.update.useMutation({
    onSuccess: () => {
      toast.success("Quote accepted successfully!");
    },
    onError: () => {
      toast.error("Failed to accept quote");
    },
  });

  const handleAcceptQuote = async (quoteId: string) => {
    await acceptQuoteMutation.mutateAsync({
      id: quoteId,
      status: "accepted" as any,
    });
  };

  const handleDeclineQuote = async (quoteId: string) => {
    await acceptQuoteMutation.mutateAsync({
      id: quoteId,
      status: "declined" as any,
    });
    toast.info("Quote declined");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case "declined":
        return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Declined</Badge>;
      case "sent":
        return <Badge className="bg-blue-100 text-blue-700"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your quotes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{APP_TITLE} Client Portal</h1>
              <p className="text-slate-600 mt-1">Welcome back, {user?.name || 'Guest'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                {quotes?.length || 0} {quotes?.length === 1 ? 'Quote' : 'Quotes'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="quotes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Quotes Tab */}
          <TabsContent value="quotes">
            {quotes && quotes.length > 0 ? (
              <div className="grid gap-6">
                {quotes.map((quote: any) => (
                  <Card key={quote.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">Quote #{quote.quoteNumber || quote.id.slice(0, 8)}</CardTitle>
                          <CardDescription className="mt-2">
                            {quote.projectTitle || 'Roofing Project'}
                          </CardDescription>
                        </div>
                        {getStatusBadge(quote.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* Quote Details */}
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <DollarSign className="w-4 h-4 mr-2 text-slate-500" />
                            <span className="font-medium">Total:</span>
                            <span className="ml-2 text-lg font-bold text-primary">
                              {formatCurrency(quote.total || 0)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Valid until: {new Date(quote.validUntil || Date.now()).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <Shield className="w-4 h-4 mr-2" />
                            <span>Includes compliance documentation</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-3">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setSelectedQuote(quote.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              // TODO: Implement PDF download
                              toast.info("PDF download coming soon");
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                          {quote.status === "sent" && (
                            <>
                              <Button
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => handleAcceptQuote(quote.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Accept Quote
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleDeclineQuote(quote.id)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Decline
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Quote Items Preview */}
                      {quote.items && quote.items.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-medium text-slate-700 mb-3">Items Included:</h4>
                          <div className="space-y-2">
                            {quote.items.slice(0, 3).map((item: any, index: number) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">{item.description}</span>
                                <span className="font-medium">{formatCurrency(item.total || 0)}</span>
                              </div>
                            ))}
                            {quote.items.length > 3 && (
                              <p className="text-sm text-slate-500 italic">
                                +{quote.items.length - 3} more items
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No quotes yet</h3>
                  <p className="text-slate-600">
                    Your quotes will appear here once they're sent to you
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Project Tracking</h3>
                <p className="text-slate-600">
                  Track your active projects and their progress
                </p>
                <p className="text-sm text-slate-500 mt-2">Coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Compliance Documents</h3>
                <p className="text-slate-600">
                  Access your compliance certificates and documentation
                </p>
                <p className="text-sm text-slate-500 mt-2">Coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

