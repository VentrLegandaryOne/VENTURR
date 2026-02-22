import React, { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TriangularShield, TriangularZap, TriangularTrendingUp, TriangularCheck } from "@/components/branding/TriangularIcons";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ArrowLeft, Download, Share2, AlertTriangle } from "lucide-react";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

export default function ComparisonView() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const comparisonId = parseInt(params.id || "0");

  const { data: comparison, isLoading, error: errorComparison } = trpc.comparisons.getById.useQuery(
    { id: comparisonId },
    { enabled: comparisonId > 0, retry: 2 }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-fib-8">
          <LoadingSkeleton variant="card" count={3} />
        </div>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-fib-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Comparison Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The comparison you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const { quotes, verifications, recommendation, status } = comparison;
  const bestQuoteId = recommendation?.bestQuoteId;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-fib-5 flex items-center justify-between">
          <div className="flex items-center gap-fib-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-venturr">{comparison.name}</h1>
              {comparison.description && (
                <p className="text-sm text-muted-foreground">{comparison.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-fib-2">
            {status === "analyzing" && (
              <Badge variant="secondary" className="animate-pulse">
                <TriangularZap className="w-3 h-3 mr-1" />
                Analyzing...
              </Badge>
            )}
            {status === "completed" && (
              <Badge variant="default" className="bg-success text-success-foreground">
                <TriangularCheck className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container py-fib-8">
        {/* AI Recommendation Card */}
        {status === "completed" && recommendation && (
          <Card className="p-fib-8 mb-fib-8 border-2 border-cyber-green bg-gradient-to-br from-cyber-green/5 to-transparent">
            <div className="flex items-start gap-fib-5">
              <div className="w-12 h-12 rounded-full bg-cyber-green/20 flex items-center justify-center flex-shrink-0">
                <TriangularCheck className="w-6 h-6 text-cyber-green" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2 tracking-venturr">AI Recommendation</h2>
                <p className="text-lg mb-fib-3">{recommendation.reasoning}</p>
                {(recommendation.estimatedSavings ?? 0) > 0 && (
                  <div className="inline-flex items-center gap-2 px-fib-3 py-fib-2 bg-cyber-green/10 rounded-lg border border-cyber-green/20">
                    <TriangularTrendingUp className="w-5 h-5 text-cyber-green" />
                    <span className="font-semibold text-cyber-green">
                      Potential Savings: ${(recommendation.estimatedSavings ?? 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-fib-5 mb-fib-8">
          {quotes.map((quote: any, index: number) => {
            const verification = verifications.find((v: any) => v.quoteId === quote.id);
            const isBest = quote.id === bestQuoteId;
            const label = String.fromCharCode(65 + index);

            return (
              <Card
                key={quote.id}
                className={`p-fib-5 relative ${
                  isBest ? "border-2 border-cyber-green ring-2 ring-cyber-green/20" : ""
                }`}
              >
                {isBest && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-cyber-green text-white px-fib-3 py-1 shadow-lg">
                      <TriangularCheck className="w-3 h-3 mr-1" />
                      Best Option
                    </Badge>
                  </div>
                )}

                <div className="mb-fib-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Option {label}</span>
                    {verification && (
                      <Badge
                        variant={
                          verification.statusBadge === "green"
                            ? "default"
                            : verification.statusBadge === "amber"
                            ? "secondary"
                            : "destructive"
                        }
                        className={
                          verification.statusBadge === "green"
                            ? "bg-cyber-green"
                            : ""
                        }
                      >
                        {verification.statusBadge.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-1">
                    {quote.extractedData?.contractor || "Unknown Contractor"}
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    ${(quote.extractedData?.totalAmount || 0).toLocaleString()}
                  </p>
                </div>

                {verification && (
                  <div className="space-y-fib-3 mb-fib-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Overall Score</span>
                      <span className="text-lg font-bold">{verification.overallScore}/100</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-electric-blue to-cyber-green transition-all"
                        style={{ width: `${verification.overallScore}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-fib-2 pt-fib-3 border-t">
                      <div className="flex items-center gap-2">
                        <TriangularTrendingUp className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Pricing</div>
                          <div className="text-sm font-semibold">{verification.pricingScore}/100</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TriangularShield className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Materials</div>
                          <div className="text-sm font-semibold">{verification.materialsScore}/100</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TriangularCheck className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Compliance</div>
                          <div className="text-sm font-semibold">{verification.complianceScore}/100</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TriangularZap className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Warranty</div>
                          <div className="text-sm font-semibold">{verification.warrantyScore}/100</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setLocation(`/report/${verification?.id}`)}
                >
                  View Report
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
