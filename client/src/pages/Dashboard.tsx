import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { QuickProjectModal } from "@/components/QuickProjectModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Folder, Plus, Ruler, Calculator, FileText, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [quickProjectModal, setQuickProjectModal] = useState<{
    isOpen: boolean;
    defaultTitle: string;
    action: "measure" | "calculate" | "quote";
    onComplete: (projectId: string) => void;
  } | null>(null);

  const { data: organizations } = trpc.organizations.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: projects } = trpc.projects.list.useQuery(
    { organizationId: selectedOrg! },
    { enabled: !!selectedOrg }
  );

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedOrg) {
      setSelectedOrg(organizations[0].id);
    }
  }, [organizations, selectedOrg]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Active Projects",
      value: projects?.filter(p => p.status === "in_progress").length || 0,
      icon: Folder,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Quotes Sent",
      value: projects?.filter(p => p.status === "quoted").length || 0,
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Completed",
      value: projects?.filter(p => p.status === "completed").length || 0,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center relative">
                <div className="absolute inset-0 bg-blue-500 rounded-lg blur-md opacity-50"></div>
                <div className="relative w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-white"></div>
              </div>
              <span className="text-2xl font-bold text-slate-900">Venturr</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Welcome, {user?.name || user?.email}</span>
              <Button variant="outline" size="sm" onClick={() => setLocation("/")}>
                Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-orange-200" onClick={() => setQuickProjectModal({
              isOpen: true,
              defaultTitle: `Site Measurement - ${new Date().toLocaleDateString()}`,
              action: "measure",
              onComplete: (projectId) => setLocation(`/projects/${projectId}/measure`),
            })}>
              <CardHeader>
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-2">
                  <Ruler className="w-6 h-6 text-orange-500" />
                </div>
                <CardTitle className="text-lg">Site Measure</CardTitle>
                <CardDescription>Capture site measurements</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-green-200" onClick={() => setQuickProjectModal({
              isOpen: true,
              defaultTitle: `Roofing Calculation - ${new Date().toLocaleDateString()}`,
              action: "calculate",
              onComplete: (projectId) => setLocation(`/projects/${projectId}/calculator`),
            })}>
              <CardHeader>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-2">
                  <Calculator className="w-6 h-6 text-green-500" />
                </div>
                <CardTitle className="text-lg">Roofing Takeoff</CardTitle>
                <CardDescription>Calculate materials</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-pink-200" onClick={() => setQuickProjectModal({
              isOpen: true,
              defaultTitle: `Quote - ${new Date().toLocaleDateString()}`,
              action: "quote",
              onComplete: (projectId) => setLocation(`/projects/${projectId}/quote`),
            })}>
              <CardHeader>
                <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center mb-2">
                  <FileText className="w-6 h-6 text-pink-500" />
                </div>
                <CardTitle className="text-lg">Quote Generator</CardTitle>
                <CardDescription>Create professional quotes</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-200" onClick={() => setLocation("/projects/new")}>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-2">
                  <Plus className="w-6 h-6 text-blue-500" />
                </div>
                <CardTitle className="text-lg">New Project</CardTitle>
                <CardDescription>Start a new project</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Recent Projects</h2>
            <Button onClick={() => setLocation("/projects/new")}>
              <Plus className="w-4 h-4 mr-2" /> New Project
            </Button>
          </div>
          {projects && projects.length > 0 ? (
            <div className="grid gap-4">
              {projects.slice(0, 5).map((project) => (
                <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation(`/projects/${project.id}`)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{project.title}</CardTitle>
                        <CardDescription>{project.address || "No address"}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          project.status === "completed" ? "bg-green-100 text-green-700" :
                          project.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                          project.status === "quoted" ? "bg-purple-100 text-purple-700" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {project.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  {project.clientName && (
                    <CardContent>
                      <p className="text-sm text-slate-600">Client: {project.clientName}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Folder className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects yet</h3>
                <p className="text-slate-600 mb-4">Create your first project to get started</p>
                <Button onClick={() => setLocation("/projects/new")}>
                  <Plus className="w-4 h-4 mr-2" /> Create Project
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {quickProjectModal && (
        <QuickProjectModal
          isOpen={quickProjectModal.isOpen}
          onClose={() => setQuickProjectModal(null)}
          onProjectCreated={quickProjectModal.onComplete}
          defaultTitle={quickProjectModal.defaultTitle}
          action={quickProjectModal.action}
        />
      )}
    </div>
  );
}

