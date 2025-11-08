import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

export default function ProjectProgressDashboard() {
  const [projects, setProjects] = useState([]);
  const [teamActivity, setTeamActivity] = useState([]);
  const [metrics, setMetrics] = useState({
    totalProjects: 0,
    completedProjects: 0,
    activeProjects: 0,
    overdueProjects: 0,
    teamMembers: 0,
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [projectsData, activityData, metricsData] = await Promise.all([
          trpc.projects.list.query(),
          trpc.activity.getTeamActivity.query(),
          trpc.dashboard.getMetrics.query(),
        ]);
        setProjects(projectsData);
        setTeamActivity(activityData);
        setMetrics(metricsData);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (project: any) => {
    const stages = ['measurement', 'takeoff', 'quote', 'approval', 'completion'];
    const currentIndex = stages.indexOf(project.currentStage);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8 relative">
      {/* Futuristic Chequered Background */}
      <div className="background-glow fixed inset-0 z-0" />
      
      <div className="relative z-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Project Dashboard</h1>
          <p className="text-gray-600">Overview of all projects and team activities</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Projects</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.totalProjects}</p>
              </div>
              <TrendingUp className="text-blue-600" size={32} />
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active</p>
                <p className="text-3xl font-bold text-orange-600">{metrics.activeProjects}</p>
              </div>
              <AlertCircle className="text-orange-600" size={32} />
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600">{metrics.completedProjects}</p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Overdue</p>
                <p className="text-3xl font-bold text-red-600">{metrics.overdueProjects}</p>
              </div>
              <AlertCircle className="text-red-600" size={32} />
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Team Members</p>
                <p className="text-3xl font-bold text-purple-600">{metrics.teamMembers}</p>
              </div>
              <Users className="text-purple-600" size={32} />
            </div>
          </Card>
        </div>

        {/* Projects Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Active Projects */}
          <Card className="p-6 bg-white shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Active Projects</h2>
            <div className="space-y-4">
              {projects.slice(0, 5).map((project: any) => (
                <div key={project.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <p className="text-sm text-gray-600">{project.clientName}</p>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <Progress
                    value={getProgressPercentage(project)}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(getProgressPercentage(project))}% Complete
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Team Activity */}
          <Card className="p-6 bg-white shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Team Activity</h2>
            <div className="space-y-3">
              {teamActivity.slice(0, 8).map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Upcoming Deadlines */}
        <Card className="p-6 bg-white shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={24} className="text-blue-600" />
            Upcoming Deadlines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.slice(0, 3).map((project: any) => (
              <div key={project.id} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{project.clientName}</p>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-blue-600" />
                  <span className="text-gray-700">
                    {new Date(project.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      </div>
    </div>
  );
}
