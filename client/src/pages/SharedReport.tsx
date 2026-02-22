import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  Clock,
  Eye,
  Lock,
  MessageSquare,
  HandshakeIcon,
  DollarSign,
  Package,
  Scale,
  FileCheck,
} from "lucide-react";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

export default function SharedReport() {
  const { token } = useParams<{ token: string }>();

  const { data: sharedData, isLoading, error } = trpc.sharing.getShared.useQuery(
    { shareToken: token || "" },
    { enabled: !!token, retry: 2 }
  );

  if (isLoading) {
    return <SharedReportSkeleton />;
  }

  if (error || !sharedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-800/50 border-slate-700">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Link Expired or Invalid</h2>
            <p className="text-slate-400 text-sm">
              This share link may have expired or been revoked. Please contact the person who shared this report with you.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { quote, verification, accessLevel, viewCount, expiresAt } = sharedData;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-500/20";
    if (score >= 70) return "bg-amber-500/20";
    return "bg-red-500/20";
  };

  const getAccessIcon = () => {
    switch (accessLevel) {
      case "view":
        return <Eye className="h-4 w-4" />;
      case "comment":
        return <MessageSquare className="h-4 w-4" />;
      case "negotiate":
        return <HandshakeIcon className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Banner */}
      <div className="bg-[#00A8FF]/10 border-b border-[#00A8FF]/20">
        <div className="container max-w-5xl py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00A8FF]/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-[#00A8FF]" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">VENTURR VALDT</h1>
                <p className="text-xs text-slate-400">Shared Verification Report</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="outline" className="border-primary/30 text-primary">
                {getAccessIcon()}
                <span className="ml-1 capitalize">{accessLevel} Access</span>
              </Badge>
              <span className="text-slate-400 flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {viewCount} views
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl py-8">
        {/* Quote Info */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-[#00A8FF]" />
                  <h2 className="text-xl font-semibold text-white">{quote.fileName}</h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Uploaded: {formatDate(quote.uploadedAt)}
                  </span>
                  {expiresAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Link expires: {formatDate(expiresAt)}
                    </span>
                  )}
                </div>
              </div>
              {verification && (
                <div className={`text-center p-4 rounded-xl ${getScoreBg(verification.overallScore)}`}>
                  <div className={`text-4xl font-bold ${getScoreColor(verification.overallScore)}`}>
                    {verification.overallScore}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Overall Score</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {verification ? (
          <>
            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <ScoreCard
                icon={<DollarSign className="h-5 w-5" />}
                label="Pricing"
                score={verification.pricingScore}
              />
              <ScoreCard
                icon={<Package className="h-5 w-5" />}
                label="Materials"
                score={verification.materialsScore}
              />
              <ScoreCard
                icon={<Scale className="h-5 w-5" />}
                label="Compliance"
                score={verification.complianceScore}
              />
              <ScoreCard
                icon={<FileCheck className="h-5 w-5" />}
                label="Warranty"
                score={verification.warrantyScore}
              />
            </div>

            {/* Findings */}
            {verification.flags && verification.flags.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                    Key Findings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {verification.flags.map((flag: { category: string; severity: string; message: string }, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20"
                      >
                        <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-sm text-slate-300">{flag.message}</span>
                          <span className="text-xs text-slate-500 ml-2 capitalize">({flag.severity})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {verification.recommendations && verification.recommendations.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {verification.recommendations.map((rec: { title: string; description: string; priority: string }, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                      >
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-slate-200">{rec.title}</div>
                          <div className="text-sm text-slate-400">{rec.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Potential Savings */}
            {verification.potentialSavings && verification.potentialSavings > 0 && (
              <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Potential Savings Identified</h3>
                      <p className="text-sm text-slate-400">Based on market analysis and pricing comparison</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-400">
                        ${(verification.potentialSavings / 100).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400">estimated savings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Verification In Progress</h2>
              <p className="text-slate-400 text-sm">
                This quote is still being analyzed. Check back soon for the full verification report.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>This report was shared via VENTURR VALDT</p>
          <p className="mt-1">AI-powered quote verification for the construction industry</p>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ icon, label, score }: { icon: React.ReactNode; label: string; score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-amber-400";
    return "text-red-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-3 text-slate-400">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
        <div className={`text-2xl font-bold mb-2 ${getScoreColor(score)}`}>{score}</div>
        <Progress value={score} className="h-1.5 bg-slate-700">
          <div
            className={`h-full rounded-full transition-all ${getProgressColor(score)}`}
            style={{ width: `${score}%` }}
          />
        </Progress>
      </CardContent>
    </Card>
  );
}

function SharedReportSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-[#00A8FF]/10 border-b border-[#00A8FF]/20">
        <div className="container max-w-5xl py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg bg-slate-700" />
              <div>
                <Skeleton className="h-5 w-32 bg-slate-700 mb-1" />
                <Skeleton className="h-3 w-24 bg-slate-700" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 bg-slate-700" />
          </div>
        </div>
      </div>
      <div className="container max-w-5xl py-8">
        <Skeleton className="h-32 w-full bg-slate-800 rounded-lg mb-6" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 bg-slate-800 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-48 w-full bg-slate-800 rounded-lg" />
      </div>
    </div>
  );
}
