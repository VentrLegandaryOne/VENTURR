/**
 * Mobile-Optimized Admin Dashboard
 * Responsive interface for monitoring metrics, managing team, reviewing reports, handling approvals
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdminMetrics {
  activeProjects: number;
  teamMembers: number;
  pendingApprovals: number;
  revenue: number;
  teamUtilization: number;
  projectCompletion: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'available' | 'busy' | 'on_leave';
  workload: number;
  projects: number;
}

interface PendingApproval {
  id: string;
  type: 'quote' | 'project' | 'expense' | 'document';
  title: string;
  requestedBy: string;
  amount?: number;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface AdminNotification {
  id: string;
  type: 'alert' | 'approval' | 'update' | 'warning';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export default function MobileAdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics>({
    activeProjects: 12,
    teamMembers: 8,
    pendingApprovals: 5,
    revenue: 45230,
    teamUtilization: 87,
    projectCompletion: 78,
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Smith',
      role: 'Lead Roofer',
      status: 'busy',
      workload: 95,
      projects: 3,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      role: 'Estimator',
      status: 'available',
      workload: 75,
      projects: 2,
    },
    {
      id: '3',
      name: 'Mike Chen',
      role: 'Project Manager',
      status: 'busy',
      workload: 85,
      projects: 4,
    },
    {
      id: '4',
      name: 'Lisa Anderson',
      role: 'Safety Officer',
      status: 'available',
      workload: 60,
      projects: 1,
    },
  ]);

  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([
    {
      id: '1',
      type: 'quote',
      title: 'Smith Residence - Roof Replacement',
      requestedBy: 'Sarah Johnson',
      amount: 15000,
      createdAt: new Date(Date.now() - 3600000),
      priority: 'high',
    },
    {
      id: '2',
      type: 'project',
      title: 'Johnson Commercial Building',
      requestedBy: 'Mike Chen',
      createdAt: new Date(Date.now() - 7200000),
      priority: 'medium',
    },
    {
      id: '3',
      type: 'expense',
      title: 'Equipment Purchase',
      requestedBy: 'John Smith',
      amount: 2500,
      createdAt: new Date(Date.now() - 10800000),
      priority: 'low',
    },
  ]);

  const [notifications, setNotifications] = useState<AdminNotification[]>([
    {
      id: '1',
      type: 'alert',
      title: 'Team Overload Alert',
      message: 'John Smith is overallocated (95% workload)',
      read: false,
      createdAt: new Date(Date.now() - 1800000),
    },
    {
      id: '2',
      type: 'approval',
      title: 'New Quote Pending',
      message: 'Quote #2024-001 awaiting approval',
      read: false,
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: '3',
      type: 'update',
      title: 'Project Completed',
      message: 'Williams Residential project marked complete',
      read: true,
      createdAt: new Date(Date.now() - 86400000),
    },
  ]);

  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-blue-100 text-blue-800';
      case 'on_leave':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = (id: string) => {
    setPendingApprovals(pendingApprovals.filter((a) => a.id !== id));
  };

  const handleReject = (id: string) => {
    setPendingApprovals(pendingApprovals.filter((a) => a.id !== id));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <div className="relative">
              <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                🔔
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full" />
                )}
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-600">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <p className="text-xs text-slate-600 mb-1">Active Projects</p>
            <p className="text-2xl font-bold text-slate-900">{metrics.activeProjects}</p>
            <p className="text-xs text-green-600 mt-1">↑ 2 this week</p>
          </Card>

          <Card className="p-4">
            <p className="text-xs text-slate-600 mb-1">Team Members</p>
            <p className="text-2xl font-bold text-slate-900">{metrics.teamMembers}</p>
            <p className="text-xs text-slate-600 mt-1">87% utilized</p>
          </Card>

          <Card className="p-4">
            <p className="text-xs text-slate-600 mb-1">Pending Approvals</p>
            <p className="text-2xl font-bold text-orange-600">{metrics.pendingApprovals}</p>
            <p className="text-xs text-orange-600 mt-1">Needs attention</p>
          </Card>

          <Card className="p-4">
            <p className="text-xs text-slate-600 mb-1">Monthly Revenue</p>
            <p className="text-2xl font-bold text-slate-900">${(metrics.revenue / 1000).toFixed(0)}K</p>
            <p className="text-xs text-green-600 mt-1">↑ 12% growth</p>
          </Card>
        </div>

        {/* Progress Bars */}
        <Card className="p-4 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-slate-900">Team Utilization</p>
              <span className="text-sm font-bold text-slate-900">{metrics.teamUtilization}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${metrics.teamUtilization}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-slate-900">Project Completion</p>
              <span className="text-sm font-bold text-slate-900">{metrics.projectCompletion}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${metrics.projectCompletion}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full rounded-none border-b border-slate-200 bg-white px-4 py-0">
          <TabsTrigger value="overview" className="flex-1">
            Overview
          </TabsTrigger>
          <TabsTrigger value="team" className="flex-1">
            Team
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex-1">
            Approvals
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex-1">
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="px-4 py-6 space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                📊 View Reports
              </Button>
              <Button className="w-full justify-start" variant="outline">
                👥 Manage Team
              </Button>
              <Button className="w-full justify-start" variant="outline">
                📋 Review Quotes
              </Button>
              <Button className="w-full justify-start" variant="outline">
                📅 View Schedule
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm">
                  ✓
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Project Completed</p>
                  <p className="text-xs text-slate-600">Williams Residential</p>
                </div>
                <span className="text-xs text-slate-500">2h ago</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-sm">
                  ⚠
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Overallocation Alert</p>
                  <p className="text-xs text-slate-600">John Smith - 95% workload</p>
                </div>
                <span className="text-xs text-slate-500">30m ago</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-sm">
                  💰
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Quote Accepted</p>
                  <p className="text-xs text-slate-600">Smith Residence - $15,000</p>
                </div>
                <span className="text-xs text-slate-500">1h ago</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="px-4 py-6 space-y-3">
          {teamMembers.map((member) => (
            <Card key={member.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-slate-900">{member.name}</h4>
                  <p className="text-sm text-slate-600">{member.role}</p>
                </div>
                <Badge className={getStatusColor(member.status)}>
                  {member.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-slate-600">Workload</span>
                    <span className="text-xs font-bold text-slate-900">{member.workload}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        member.workload > 90
                          ? 'bg-red-500'
                          : member.workload > 75
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${member.workload}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-600">{member.projects} active projects</p>
              </div>

              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="flex-1">
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="px-4 py-6 space-y-3">
          {pendingApprovals.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-slate-600">No pending approvals</p>
            </Card>
          ) : (
            pendingApprovals.map((approval) => (
              <Card key={approval.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">{approval.title}</h4>
                      <Badge className={getPriorityColor(approval.priority)}>
                        {approval.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">by {approval.requestedBy}</p>
                  </div>
                  {approval.amount && (
                    <p className="text-lg font-bold text-slate-900">
                      ${(approval.amount / 1000).toFixed(1)}K
                    </p>
                  )}
                </div>

                <p className="text-xs text-slate-500 mb-3">
                  {approval.createdAt.toLocaleTimeString()}
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(approval.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleReject(approval.id)}
                  >
                    Reject
                  </Button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="px-4 py-6 space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 cursor-pointer transition ${
                notif.read ? 'bg-slate-50' : 'bg-blue-50 border-blue-200'
              }`}
              onClick={() => markNotificationAsRead(notif.id)}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">
                  {notif.type === 'alert' && '⚠️'}
                  {notif.type === 'approval' && '📋'}
                  {notif.type === 'update' && '✓'}
                  {notif.type === 'warning' && '🔴'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{notif.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {notif.createdAt.toLocaleTimeString()}
                  </p>
                </div>
                {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />}
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

