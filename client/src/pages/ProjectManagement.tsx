/**
 * Complete Project Management System
 * Full-stack implementation with database integration, tRPC procedures, and real-time updates
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface ProjectParams {
  projectId: string;
}

export default function ProjectManagement({ projectId }: ProjectParams) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  // Fetch project data using tRPC
  const projectOverview = trpc.project.overview.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const projectTasks = trpc.project.tasks.list.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const projectTeamMembers = trpc.project.teamMembers.list.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const projectMilestones = trpc.project.milestones.list.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const projectBudget = trpc.project.budget.get.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const projectDocuments = trpc.project.documents.list.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  // Mutations
  const createTaskMutation = trpc.project.tasks.create.useMutation({
    onSuccess: () => {
      projectTasks.refetch();
      setNewTaskTitle('');
    },
  });

  const updateTaskMutation = trpc.project.tasks.update.useMutation({
    onSuccess: () => {
      projectTasks.refetch();
    },
  });

  const createMilestoneMutation = trpc.project.milestones.create.useMutation({
    onSuccess: () => {
      projectMilestones.refetch();
      setNewMilestoneTitle('');
    },
  });

  const addTeamMemberMutation = trpc.project.teamMembers.add.useMutation({
    onSuccess: () => {
      projectTeamMembers.refetch();
    },
  });

  const createBudgetMutation = trpc.project.budget.create.useMutation({
    onSuccess: () => {
      projectBudget.refetch();
    },
  });

  const addDocumentMutation = trpc.project.documents.add.useMutation({
    onSuccess: () => {
      projectDocuments.refetch();
    },
  });

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    await createTaskMutation.mutateAsync({
      projectId,
      title: newTaskTitle,
      priority: 'medium',
    });
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    await updateTaskMutation.mutateAsync({
      taskId,
      status: newStatus as any,
    });
  };

  const handleCreateMilestone = async () => {
    if (!newMilestoneTitle.trim()) return;
    await createMilestoneMutation.mutateAsync({
      projectId,
      title: newMilestoneTitle,
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      blocked: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800',
      delayed: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!projectOverview.data?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-slate-600">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  const overview = projectOverview.data.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">{overview.project.title}</h1>
          <p className="text-slate-600 mt-2">{overview.project.address}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Tasks</p>
              <p className="text-3xl font-bold text-slate-900">{overview.tasks.total}</p>
              <p className="text-xs text-green-600 mt-1">{overview.tasks.completed} completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">{overview.tasks.inProgress}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Team Members</p>
              <p className="text-3xl font-bold text-slate-900">{overview.teamMembers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Milestones</p>
              <p className="text-3xl font-bold text-slate-900">{overview.milestones.total}</p>
              <p className="text-xs text-green-600 mt-1">{overview.milestones.completed} completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Documents</p>
              <p className="text-3xl font-bold text-slate-900">{overview.documents}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <Badge className="mt-1">{overview.project.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Client</p>
                    <p className="font-semibold text-slate-900">{overview.project.clientName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Property Type</p>
                    <p className="font-semibold text-slate-900">{overview.project.propertyType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Created</p>
                    <p className="font-semibold text-slate-900">
                      {new Date(overview.project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Task</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input
                  type="text"
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <Button
                  onClick={handleCreateTask}
                  disabled={createTaskMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {projectTasks.data?.data?.map((task) => (
                <Card key={task.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                        <Badge
                          className={
                            task.priority === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : task.priority === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                        className="px-2 py-1 border border-slate-300 rounded text-sm"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectTeamMembers.data?.data?.map((member) => (
                <Card key={member.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-900">Member ID: {member.userId}</p>
                      <p className="text-sm text-slate-600">Role: {member.role}</p>
                      <p className="text-xs text-slate-500">Joined: {new Date(member.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Milestone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input
                  type="text"
                  placeholder="Milestone title..."
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <Button
                  onClick={handleCreateMilestone}
                  disabled={createMilestoneMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {createMilestoneMutation.isPending ? 'Creating...' : 'Create Milestone'}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {projectMilestones.data?.data?.map((milestone) => (
                <Card key={milestone.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-slate-900">{milestone.title}</h3>
                        <Badge className={getStatusColor(milestone.status)}>{milestone.status}</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-slate-600">Progress: {milestone.progress}%</p>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${milestone.progress}%` }}
                          />
                        </div>
                        <p className="text-slate-600">
                          Target: {new Date(milestone.targetDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-4">
            {projectBudget.data?.data ? (
              <Card>
                <CardHeader>
                  <CardTitle>Project Budget</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Budgeted</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {projectBudget.data.data.currency} {projectBudget.data.data.budgetedAmount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Spent</p>
                      <p className="text-2xl font-bold text-red-600">{projectBudget.data.data.spentAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Remaining</p>
                      <p className="text-2xl font-bold text-green-600">{projectBudget.data.data.remainingAmount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Create Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() =>
                      createBudgetMutation.mutateAsync({
                        projectId,
                        budgetedAmount: '50000',
                        currency: 'USD',
                      })
                    }
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Initial Budget
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <div className="space-y-3">
              {projectDocuments.data?.data?.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{doc.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{doc.type}</p>
                        {doc.fileSize && <p className="text-xs text-slate-500 mt-1">Size: {doc.fileSize}</p>}
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                      >
                        Download
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

