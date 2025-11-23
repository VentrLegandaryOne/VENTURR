import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Plus,
  TrendingUp,
  Users,
  Zap,
  AlertCircle,
  Target,
  Calendar,
  Sparkles
} from "lucide-react";
import { useLocation } from "wouter";
import { useMemo } from "react";

/**
 * Enhanced Dashboard with World-Class UI/UX
 * - Performance optimized with useMemo
 * - Smooth animations and micro-interactions
 * - Psychological color coding
 * - Clear visual hierarchy
 * - Actionable insights
 */
export default function DashboardEnhanced() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch projects - projects.list doesn't require params (uses ctx.user.id)
  const { data: projects, isLoading } = trpc.projects.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Memoized statistics to avoid recalculation
  const stats = useMemo(() => {
    if (!projects) return null;

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalValue = projects.length * 15000; // Average project value

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalValue,
      completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
    };
  }, [projects]);

  // Quick actions with visual hierarchy
  const quickActions = [
    {
      icon: <Plus className="w-5 h-5" />,
      label: "New Project",
      description: "Start a new roofing project",
      color: "from-blue-600 to-indigo-600",
      hoverColor: "hover:shadow-blue-500/30",
      action: () => setLocation("/projects/new"),
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Generate Quote",
      description: "Create professional quote",
      color: "from-purple-600 to-pink-600",
      hoverColor: "hover:shadow-purple-500/30",
      action: () => setLocation("/projects/new"),
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Manage Clients",
      description: "View and edit clients",
      color: "from-green-600 to-emerald-600",
      hoverColor: "hover:shadow-green-500/30",
      action: () => setLocation("/clients"),
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: "View Reports",
      description: "Analytics and insights",
      color: "from-orange-600 to-red-600",
      hoverColor: "hover:shadow-orange-500/30",
      action: () => setLocation("/projects"),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header with personalization */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-medium text-blue-100">Welcome back</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {user?.name || "User"}
            </h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening with your business today
            </p>
            
            {/* Quick stats in header */}
            {stats && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{stats.activeProjects}</div>
                  <div className="text-sm text-blue-100">Active Projects</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{stats.completedProjects}</div>
                  <div className="text-sm text-blue-100">Completed</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">${(stats.totalValue / 1000).toFixed(0)}k</div>
                  <div className="text-sm text-blue-100">Total Value</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{stats.completionRate.toFixed(0)}%</div>
                  <div className="text-sm text-blue-100">Success Rate</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`group relative bg-white rounded-2xl p-6 shadow-lg ${action.hoverColor} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-slate-200/50 text-left overflow-hidden`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.color} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {action.icon}
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {action.label}
                  </h3>
                  
                  <p className="text-sm text-slate-600 mb-3">
                    {action.description}
                  </p>

                  <div className="flex items-center text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Get started</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Recent Projects
            </h2>
            <Button
              onClick={() => setLocation("/projects")}
              variant="outline"
              className="group"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-shimmer">
                  <div className="h-6 bg-slate-200 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid gap-4">
              {projects.slice(0, 5).map((project, index) => (
                <div
                  key={project.id}
                  onClick={() => setLocation(`/projects/${project.id}`)}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-slate-200/50 cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-3">
                        {project.clientName} • {project.address}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${
                          project.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : project.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {project.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                          {project.status === 'in_progress' && <Clock className="w-3 h-3" />}
                          {project.status}
                        </span>
                        <span className="text-slate-600 flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          $15,000
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-12 text-center border-2 border-dashed border-slate-300">
              <Target className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No projects yet</h3>
              <p className="text-slate-600 mb-6">
                Create your first project to get started
              </p>
              <Button
                onClick={() => setLocation("/projects/new")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          )}
        </div>

        {/* Performance Tips */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-amber-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                💡 Pro Tip: Streamline Your Workflow
              </h3>
              <p className="text-slate-700 mb-3">
                Use the AI Site Measurement tool to measure roofs from satellite imagery—no ladders required. Save hours on every project.
              </p>
              <Button
                onClick={() => setLocation("/projects/new")}
                variant="outline"
                className="border-amber-300 hover:bg-amber-100 group"
              >
                Try It Now
                <Sparkles className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

