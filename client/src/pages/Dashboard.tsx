import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { QuickProjectModal } from "@/components/QuickProjectModal";
import { SubscriptionStatus } from "@/components/SubscriptionStatus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Folder, Plus, Ruler, Calculator, FileText, TrendingUp, Settings, Users, Sparkles, Zap, Target, Award } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-lg font-medium text-slate-700">Loading your workspace...</p>
          <p className="text-sm text-slate-500 mt-2">Preparing your projects</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Active Projects",
      value: projects?.filter(p => p.status === "in_progress").length || 0,
      icon: Folder,
      gradient: "from-blue-500 to-blue-600",
      shadowColor: "shadow-blue-500/30",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Quotes Sent",
      value: projects?.filter(p => p.status === "quoted").length || 0,
      icon: FileText,
      gradient: "from-orange-500 to-orange-600",
      shadowColor: "shadow-orange-500/30",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      title: "Completed",
      value: projects?.filter(p => p.status === "completed").length || 0,
      icon: Award,
      gradient: "from-green-500 to-green-600",
      shadowColor: "shadow-green-500/30",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Total Projects",
      value: projects?.length || 0,
      icon: TrendingUp,
      gradient: "from-purple-500 to-purple-600",
      shadowColor: "shadow-purple-500/30",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  const quickActions = [
    {
      title: "Site Measurement",
      description: "Measure roofs using satellite imagery",
      icon: Ruler,
      gradient: "from-blue-500 to-cyan-500",
      action: () => {
        setQuickProjectModal({
          isOpen: true,
          defaultTitle: "Site Measurement",
          action: "measure",
          onComplete: (projectId) => {
            setLocation(`/projects/${projectId}/measure`);
          },
        });
      },
    },
    {
      title: "Roofing Takeoff",
      description: "Calculate materials and costs",
      icon: Calculator,
      gradient: "from-orange-500 to-red-500",
      action: () => {
        setQuickProjectModal({
          isOpen: true,
          defaultTitle: "Roofing Takeoff",
          action: "calculate",
          onComplete: (projectId) => {
            setLocation(`/projects/${projectId}/calculator`);
          },
        });
      },
    },
    {
      title: "Generate Quote",
      description: "Create professional quotes",
      icon: FileText,
      gradient: "from-green-500 to-emerald-500",
      action: () => {
        setQuickProjectModal({
          isOpen: true,
          defaultTitle: "New Quote",
          action: "quote",
          onComplete: (projectId) => {
            setLocation(`/projects/${projectId}/quote`);
          },
        });
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/30">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[16px] border-b-white"></div>
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Venturr</span>
                <p className="text-xs text-slate-500">Roofing Operating System</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Welcome, {user?.name || user?.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setLocation("/clients")} className="hover:border-blue-300 hover:bg-blue-50 transition-all">  
                <Users className="w-4 h-4 mr-2" />
                Clients
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation("/settings")} className="hover:border-orange-300 hover:bg-orange-50 transition-all">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Subscription Status */}
        <div className="mb-8">
          <SubscriptionStatus />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                {/* Content */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.iconBg} p-3 rounded-xl shadow-sm group-hover:shadow-md transition-shadow`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                    <div className={`text-3xl font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{stat.title}</h3>
                </div>

                {/* Decorative Element */}
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-6 h-6 text-orange-500" />
                Quick Actions
              </h2>
              <p className="text-sm text-slate-500 mt-1">Start a new project workflow</p>
            </div>
            <Button 
              onClick={() => setLocation("/projects/new")}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={action.action}
                  className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-left overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient Border on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className="absolute inset-[2px] bg-white rounded-2xl"></div>

                  {/* Content */}
                  <div className="relative">
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{action.title}</h3>
                    <p className="text-sm text-slate-600">{action.description}</p>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-6 h-6 text-green-500" />
                Recent Projects
              </h2>
              <p className="text-sm text-slate-500 mt-1">Your latest work</p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/projects")} className="hover:border-green-300 hover:bg-green-50 transition-all">
              View All
            </Button>
          </div>

          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 6).map((project, index) => (
                <div
                  key={project.id}
                  onClick={() => setLocation(`/projects/${project.id}`)}
                  className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-slate-100 hover:border-blue-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{project.title}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-1">{project.address || "No address"}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === "completed" ? "bg-green-100 text-green-700" :
                      project.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                      project.status === "quoted" ? "bg-orange-100 text-orange-700" :
                      "bg-slate-100 text-slate-700"
                    }`}>
                      {project.status.replace("_", " ")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Folder className="w-3 h-3" />
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-slate-100">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Folder className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No projects yet</h3>
              <p className="text-slate-600 mb-6">Create your first project to get started</p>
              <Button 
                onClick={() => setLocation("/projects/new")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Project Modal */}
      {quickProjectModal && (
        <QuickProjectModal
          isOpen={quickProjectModal.isOpen}
          onClose={() => setQuickProjectModal(null)}
          defaultTitle={quickProjectModal.defaultTitle}
          action={quickProjectModal.action}
          onComplete={quickProjectModal.onComplete}
        />
      )}
    </div>
  );
}

