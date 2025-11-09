import { useAuth } from "@/_core/hooks/useAuth";
// Import/Export functionality temporarily disabled
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Folder, Loader2, Plus, Search, Download, Upload, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select as SelectUI, SelectContent as SelectContentUI, SelectItem as SelectItemUI, SelectTrigger as SelectTriggerUI, SelectValue as SelectValueUI } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { ImportResult } from '../../../shared/importExportTypes';
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Projects() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const { data: organizations } = trpc.organizations.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: projects, isLoading, refetch } = trpc.projects.list.useQuery(
    { organizationId: selectedOrg! },
    { enabled: !!selectedOrg }
  );

  // const exportMutation = trpc.projects.export.useMutation();
  // const importMutation = trpc.projects.import.useMutation();
  // const downloadTemplateMutation = trpc.projects.downloadTemplate.useMutation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedOrg) {
      setSelectedOrg(organizations[0].id);
    }
  }, [organizations, selectedOrg]);

  const filteredProjects = projects?.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  const getStatusLabel = (status: string) => {
    return status.replace("_", " ").toUpperCase();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
      {/* Futuristic Chequered Background */}
      <div className="background-glow fixed inset-0 z-0" />
      
      {/* Header */}
      <header className="relative z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-lg shadow-blue-500/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
            </div>
            <Button onClick={() => setLocation("/projects/new")} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-2">
        {/* Import/Export Section - Temporarily Disabled */}
        {/* Filters */}
        <Card className="mb-6 bg-white/95 backdrop-blur border-slate-200/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all animate-fadeInUp">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredProjects && filteredProjects.length > 0 ? (
          <div className="grid gap-4">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setLocation(`/projects/${project.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                      <CardDescription>
                        {project.address && (
                          <div className="mb-1">{project.address}</div>
                        )}
                        {project.clientName && (
                          <div>Client: {project.clientName}</div>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                      <span className="text-xs text-slate-500 uppercase">
                        {project.propertyType}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                {(project.clientEmail || project.clientPhone) && (
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      {project.clientEmail && (
                        <div>📧 {project.clientEmail}</div>
                      )}
                      {project.clientPhone && (
                        <div>📞 {project.clientPhone}</div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Folder className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchQuery || statusFilter !== "all" ? "No projects found" : "No projects yet"}
              </h3>
              <p className="text-slate-600 mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first project to get started"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button onClick={() => setLocation("/projects/new")} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

