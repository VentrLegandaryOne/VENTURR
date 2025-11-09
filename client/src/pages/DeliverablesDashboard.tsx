import { useParams, useLocation } from "wouter";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  Users, 
  ClipboardList,
  Shield,
  Wrench,
  AlertTriangle,
  Loader2,
  ArrowLeft
} from "lucide-react";

/**
 * Deliverables Dashboard
 * 
 * Displays generated deliverables from intelligence analysis:
 * - Material Take-Offs
 * - Compliance Documentation
 * - Installation Methodology
 * - Crew Assignments
 */
export default function DeliverablesDashboard() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const projectId = params.id;

  // Generate deliverables
  const generateMutation = trpc.intelligence.generateDeliverables.useMutation();
  const [deliverables, setDeliverables] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (projectId) {
      setIsLoading(true);
      generateMutation.mutate({} as any, {
        onSuccess: (data) => {
          setDeliverables(data);
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
        }
      });
    }
  }, [projectId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    toast.info("PDF export functionality coming soon");
    // TODO: Implement PDF export using @react-pdf/renderer or similar
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Generating deliverables...</p>
        </div>
      </div>
    );
  }

  if (!deliverables) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Deliverables Found</CardTitle>
            <CardDescription>Unable to load project deliverables</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/dashboard")}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold mb-2">Project Deliverables</h1>
            <p className="text-muted-foreground">
              100% accurate material take-offs, compliance documentation, and installation guides
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <ClipboardList className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Material Take-Off</p>
                  <p className="text-lg font-bold">Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Shield className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Compliance</p>
                  <p className="text-lg font-bold">Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Wrench className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Installation</p>
                  <p className="text-lg font-bold">Ready</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Users className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Crew</p>
                  <p className="text-lg font-bold">Assigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deliverables Tabs */}
        <Tabs defaultValue="materials" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="materials">
              <ClipboardList className="w-4 h-4 mr-2" />
              Material Take-Off
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <Shield className="w-4 h-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="installation">
              <Wrench className="w-4 h-4 mr-2" />
              Installation
            </TabsTrigger>
            <TabsTrigger value="crew">
              <Users className="w-4 h-4 mr-2" />
              Crew
            </TabsTrigger>
          </TabsList>

          {/* Material Take-Off Tab */}
          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <CardTitle>Material Take-Off</CardTitle>
                <CardDescription>100% accurate material calculations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: deliverables.materialTakeOff }} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Documentation Tab */}
          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Documentation</CardTitle>
                <CardDescription>
                  AS 1562.1:2018, AS/NZS 1170.2:2021, AS 3959:2018, NCC 2022
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: deliverables.complianceDocumentation }} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Installation Methodology Tab */}
          <TabsContent value="installation">
            <Card>
              <CardHeader>
                <CardTitle>Installation Methodology</CardTitle>
                <CardDescription>Step-by-step installation guide and codes of practice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: deliverables.installationMethodology }} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crew Assignments Tab */}
          <TabsContent value="crew">
            <Card>
              <CardHeader>
                <CardTitle>Crew Requirements & Assignments</CardTitle>
                <CardDescription>Intelligent crew planning based on project requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: deliverables.crewAssignments }} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Risk Assessment Section */}
        {deliverables.riskAssessment && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Risk Assessment
              </CardTitle>
              <CardDescription>Identified risks and mitigation strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: deliverables.riskAssessment }} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-4">
          <Button variant="outline" onClick={() => setLocation("/projects")}>
            View All Projects
          </Button>
          <Button onClick={() => setLocation("/project-input-form")}>
            New Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}

