import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calculator, FileText, Loader2, Ruler, Edit } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function ProjectDetail() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/projects/:id");
  const projectId = params?.id;

  const { data: project, isLoading } = trpc.projects.get.useQuery(
    { id: projectId! },
    { enabled: !!projectId }
  );

  const { data: takeoffs } = trpc.takeoffs.list.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const { data: quotes } = trpc.quotes.list.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const updateProjectMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success("Project updated successfully");
    },
    onError: () => {
      toast.error("Failed to update project");
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  const handleStatusChange = async (status: string) => {
    if (!projectId) return;
    
    await updateProjectMutation.mutateAsync({
      id: projectId,
      status: status as any,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "quoted":
        return "bg-purple-100 text-purple-700";
      case "approved":
        return "bg-teal-100 text-teal-700";
      case "canceled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Project Not Found</h2>
          <p className="text-slate-600 mb-4">The project you're looking for doesn't exist</p>
          <Button onClick={() => setLocation("/projects")}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/projects")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit Project
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{project.title}</h1>
              <p className="text-slate-600">{project.address || "No address specified"}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={project.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for this project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center space-y-2"
                    onClick={() => setLocation(`/projects/${projectId}/measure`)}
                  >
                    <Ruler className="w-6 h-6 text-orange-500" />
                    <span>Site Measure</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center space-y-2"
                    onClick={() => setLocation(`/projects/${projectId}/calculator`)}
                  >
                    <Calculator className="w-6 h-6 text-green-500" />
                    <span>Takeoff Calculator</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center space-y-2"
                    onClick={() => setLocation(`/projects/${projectId}/quote`)}
                  >
                    <FileText className="w-6 h-6 text-pink-500" />
                    <span>Generate Quote</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Takeoffs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Takeoff Calculations</CardTitle>
                    <CardDescription>Material and cost calculations</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setLocation(`/projects/${projectId}/calculator`)}>
                    <Calculator className="w-4 h-4 mr-2" />
                    New Calculation
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {takeoffs && takeoffs.length > 0 ? (
                  <div className="space-y-3">
                    {takeoffs.map((takeoff) => (
                      <div key={takeoff.id} className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{takeoff.roofType || "Calculation"}</div>
                            <div className="text-sm text-slate-600">
                              Area: {takeoff.roofArea || "N/A"} m²
                            </div>
                          </div>
                          <div className="text-sm text-slate-500">
                            {new Date(takeoff.createdAt!).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600">
                    <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p>No calculations yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quotes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quotes</CardTitle>
                    <CardDescription>Generated quotes for this project</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setLocation(`/projects/${projectId}/quote`)}>
                    <FileText className="w-4 h-4 mr-2" />
                    New Quote
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {quotes && quotes.length > 0 ? (
                  <div className="space-y-3">
                    {quotes.map((quote) => (
                      <div key={quote.id} className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Quote #{quote.quoteNumber}</div>
                            <div className="text-sm text-slate-600">
                              Total: ${quote.total}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              quote.status === "accepted" ? "bg-green-100 text-green-700" :
                              quote.status === "sent" ? "bg-blue-100 text-blue-700" :
                              quote.status === "rejected" ? "bg-red-100 text-red-700" :
                              "bg-slate-100 text-slate-700"
                            }`}>
                              {quote.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p>No quotes yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-slate-600 mb-1">Property Type</div>
                  <div className="text-sm capitalize">{project.propertyType}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-600 mb-1">Status</div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                    {project.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-600 mb-1">Created</div>
                  <div className="text-sm">{new Date(project.createdAt!).toLocaleDateString()}</div>
                </div>
              </CardContent>
            </Card>

            {/* Client Info */}
            {(project.clientName || project.clientEmail || project.clientPhone) && (
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.clientName && (
                    <div>
                      <div className="text-sm font-medium text-slate-600 mb-1">Name</div>
                      <div className="text-sm">{project.clientName}</div>
                    </div>
                  )}
                  {project.clientEmail && (
                    <div>
                      <div className="text-sm font-medium text-slate-600 mb-1">Email</div>
                      <div className="text-sm">{project.clientEmail}</div>
                    </div>
                  )}
                  {project.clientPhone && (
                    <div>
                      <div className="text-sm font-medium text-slate-600 mb-1">Phone</div>
                      <div className="text-sm">{project.clientPhone}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

