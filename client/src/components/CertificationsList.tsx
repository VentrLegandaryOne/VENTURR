import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Award, FileCheck, Users, Trophy, Calendar, ExternalLink } from "lucide-react";
import { format, isPast } from "date-fns";

interface Certification {
  id: number;
  name: string;
  issuingBody: string;
  certificateNumber?: string | null;
  issueDate?: Date | null;
  expiryDate?: Date | null;
  certificateUrl?: string | null;
  isVerified: boolean;
  category: "license" | "insurance" | "qualification" | "membership" | "award";
}

interface CertificationsListProps {
  certifications: Certification[];
}

const categoryIcons = {
  license: Shield,
  insurance: FileCheck,
  qualification: Award,
  membership: Users,
  award: Trophy,
};

const categoryColors = {
  license: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
  insurance: "bg-[#00A8FF]/10 text-[#00A8FF] border-[#00A8FF]/20",
  qualification: "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20",
  membership: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
  award: "bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/20",
};

export function CertificationsList({ certifications }: CertificationsListProps) {
  if (certifications.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#10B981]" />
          <span>Certifications & Licenses</span>
          <Badge variant="secondary">{certifications.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {certifications.map((cert) => {
            const Icon = categoryIcons[cert.category];
            const isExpired = cert.expiryDate && isPast(new Date(cert.expiryDate));
            
            return (
              <div
                key={cert.id}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  categoryColors[cert.category]
                } ${isExpired ? "opacity-50" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-background/50">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold">{cert.name}</h4>
                        {cert.isVerified && (
                          <Badge className="bg-[#10B981] text-xs">
                            ✓ Verified
                          </Badge>
                        )}
                        {isExpired && (
                          <Badge variant="destructive" className="text-xs">
                            Expired
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {cert.issuingBody}
                      </p>
                      
                      {cert.certificateNumber && (
                        <p className="text-xs text-muted-foreground font-mono">
                          #{cert.certificateNumber}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        {cert.issueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Issued: {format(new Date(cert.issueDate), "MMM yyyy")}
                          </div>
                        )}
                        {cert.expiryDate && (
                          <div className={`flex items-center gap-1 ${
                            isExpired ? "text-[#EF4444]" : ""
                          }`}>
                            <Calendar className="h-3 w-3" />
                            {isExpired ? "Expired" : "Expires"}: {format(new Date(cert.expiryDate), "MMM yyyy")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {cert.certificateUrl && (
                    <a
                      href={cert.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                    >
                      View Certificate
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-6 border-t">
          {Object.entries(categoryIcons).map(([category, Icon]) => {
            const count = certifications.filter((c) => c.category === category).length;
            if (count === 0) return null;
            
            return (
              <div key={category} className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground capitalize">{category}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
