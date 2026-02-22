import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Award,
  Briefcase,
  Shield,
  ExternalLink,
  Calendar,
  Eye,
  AlertCircle,
} from "lucide-react";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

export default function SharedComparison() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, error, isError, isFetching, status } = trpc.contractors.getSharedComparison.useQuery(
    { shareToken: token || "" },
    { 
      enabled: !!token,
      retry: false,
      staleTime: 0,
    }
  );

  // Debug logging
  console.log("SharedComparison Debug:", { token, isLoading, isFetching, isError, status, error, data });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <Card className="max-w-md bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Comparison Not Found
            </h2>
            <p className="text-slate-400 mb-4">
              This shared comparison link may have expired or been deleted.
            </p>
            <Link href="/">
              <Button>Go to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { title, notes, contractors, viewCount, createdAt, expiresAt } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {title || "Contractor Comparison"}
              </h1>
              {notes && (
                <p className="text-slate-400 max-w-2xl">{notes}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Shared {new Date(createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {viewCount} views
                </span>
                {expiresAt && (
                  <span className="text-amber-500">
                    Expires {new Date(expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <Badge variant="outline" className="text-slate-400 border-slate-600">
              {contractors?.length || 0} Contractors
            </Badge>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className={`grid gap-6 ${
          contractors?.length === 2 
            ? "grid-cols-1 md:grid-cols-2" 
            : contractors?.length === 3 
            ? "grid-cols-1 md:grid-cols-3" 
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        }`}>
          {contractors?.map((contractor: any) => (
            <Card
              key={contractor.id}
              className="bg-slate-800/50 border-slate-700 overflow-hidden"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-white">
                      {contractor.business_name || contractor.businessName}
                    </CardTitle>
                    <p className="text-sm text-slate-400 mt-1">
                      {contractor.category}
                    </p>
                  </div>
                  {contractor.avgRating > 0 && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {Number(contractor.avgRating).toFixed(1)}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  {contractor.location && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="h-4 w-4" />
                      {contractor.location}
                    </div>
                  )}
                  {contractor.phone && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="h-4 w-4" />
                      {contractor.phone}
                    </div>
                  )}
                  {contractor.email && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="h-4 w-4" />
                      {contractor.email}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700">
                  <div className="text-center p-2 rounded bg-slate-700/30">
                    <Briefcase className="h-4 w-4 mx-auto mb-1 text-blue-400" />
                    <p className="text-lg font-semibold text-white">
                      {contractor.portfolio?.length || 0}
                    </p>
                    <p className="text-xs text-slate-500">Projects</p>
                  </div>
                  <div className="text-center p-2 rounded bg-slate-700/30">
                    <Award className="h-4 w-4 mx-auto mb-1 text-green-400" />
                    <p className="text-lg font-semibold text-white">
                      {contractor.certifications?.length || 0}
                    </p>
                    <p className="text-xs text-slate-500">Certifications</p>
                  </div>
                </div>

                {/* Reviews */}
                <div className="flex items-center justify-between text-sm pt-2">
                  <span className="text-slate-400">Reviews</span>
                  <span className="text-white font-medium">
                    {contractor.reviewCount || 0}
                  </span>
                </div>

                {/* Certifications Preview */}
                {contractor.certifications?.length > 0 && (
                  <div className="pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-500 mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-1">
                      {contractor.certifications.slice(0, 3).map((cert: any, idx: number) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs border-green-500/30 text-green-400"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {cert.name || cert.certification_name}
                        </Badge>
                      ))}
                      {contractor.certifications.length > 3 && (
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                          +{contractor.certifications.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Portfolio Preview */}
                {contractor.portfolio?.length > 0 && (
                  <div className="pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-500 mb-2">Recent Projects</p>
                    <div className="space-y-2">
                      {contractor.portfolio.slice(0, 2).map((project: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-slate-300 truncate max-w-[60%]">
                            {project.title || project.project_title}
                          </span>
                          {project.cost && (
                            <span className="text-green-400 font-medium">
                              ${Number(project.cost).toLocaleString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm mb-4">
            Powered by VENTURR VALDT - Quote Verification & Compliance Intelligence
          </p>
          <Link href="/">
            <Button variant="outline" className="border-slate-600 text-slate-300">
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit VENTURR VALDT
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
