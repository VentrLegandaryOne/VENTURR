/**
 * Team Calendar & Gantt Chart
 * Interactive calendar view and Gantt chart visualization for project timelines
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
}

interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  type: 'milestone' | 'meeting' | 'deadline' | 'project';
  color: string;
}

export default function TeamCalendarGantt() {
  const [tasks] = useState<GanttTask[]>([
    {
      id: '1',
      name: 'Roof Inspection',
      startDate: new Date(Date.now()),
      endDate: new Date(Date.now() + 2 * 86400000),
      progress: 100,
      assignedTo: 'John Smith',
      status: 'completed',
      priority: 'high',
      dependencies: [],
    },
    {
      id: '2',
      name: 'Material Procurement',
      startDate: new Date(Date.now() + 2 * 86400000),
      endDate: new Date(Date.now() + 7 * 86400000),
      progress: 60,
      assignedTo: 'Sarah Johnson',
      status: 'in_progress',
      priority: 'high',
      dependencies: ['1'],
    },
    {
      id: '3',
      name: 'Roof Installation',
      startDate: new Date(Date.now() + 7 * 86400000),
      endDate: new Date(Date.now() + 14 * 86400000),
      progress: 0,
      assignedTo: 'Mike Chen',
      status: 'pending',
      priority: 'critical',
      dependencies: ['2'],
    },
    {
      id: '4',
      name: 'Final Inspection',
      startDate: new Date(Date.now() + 14 * 86400000),
      endDate: new Date(Date.now() + 15 * 86400000),
      progress: 0,
      assignedTo: 'Lisa Anderson',
      status: 'pending',
      priority: 'high',
      dependencies: ['3'],
    },
  ]);

  const [events] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Project Kickoff',
      startDate: new Date(Date.now() - 7 * 86400000),
      endDate: new Date(Date.now() - 7 * 86400000),
      type: 'milestone',
      color: 'bg-blue-500',
    },
    {
      id: '2',
      title: 'Team Meeting',
      startDate: new Date(Date.now() + 3 * 86400000),
      endDate: new Date(Date.now() + 3 * 86400000),
      type: 'meeting',
      color: 'bg-purple-500',
    },
    {
      id: '3',
      title: 'Material Deadline',
      startDate: new Date(Date.now() + 7 * 86400000),
      endDate: new Date(Date.now() + 7 * 86400000),
      type: 'deadline',
      color: 'bg-orange-500',
    },
  ]);

  const [view, setView] = useState<'calendar' | 'gantt'>('gantt');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
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

  const calculateDays = (start: Date, end: Date) => {
    return Math.ceil((end.getTime() - start.getTime()) / 86400000);
  };

  const calculatePosition = (taskStart: Date, taskEnd: Date, minDate: Date, maxDate: Date) => {
    const totalDays = calculateDays(minDate, maxDate);
    const offsetDays = calculateDays(minDate, taskStart);
    const taskDays = calculateDays(taskStart, taskEnd);

    return {
      left: (offsetDays / totalDays) * 100,
      width: (taskDays / totalDays) * 100,
    };
  };

  const minDate = new Date(Math.min(...tasks.map((t) => t.startDate.getTime())));
  const maxDate = new Date(Math.max(...tasks.map((t) => t.endDate.getTime())));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Team Calendar & Scheduling</h1>
          <p className="text-slate-600">Manage project timelines and team resources</p>
        </div>

        {/* View Selector */}
        <Tabs value={view} onValueChange={(v) => setView(v as 'calendar' | 'gantt')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          {/* Gantt Chart View */}
          <TabsContent value="gantt" className="space-y-4">
            <Card className="p-6">
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  {/* Header with dates */}
                  <div className="flex mb-4">
                    <div className="w-48 flex-shrink-0 font-semibold text-slate-900">Task</div>
                    <div className="flex-1 flex gap-1 px-4">
                      {Array.from({ length: calculateDays(minDate, maxDate) }).map((_, i) => (
                        <div key={i} className="flex-1 text-center text-xs text-slate-600 border-l border-slate-200">
                          {new Date(minDate.getTime() + i * 86400000).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tasks */}
                  {tasks.map((task) => {
                    const position = calculatePosition(task.startDate, task.endDate, minDate, maxDate);
                    return (
                      <div
                        key={task.id}
                        className={`flex mb-3 p-2 rounded-lg cursor-pointer transition ${
                          selectedTask === task.id ? 'bg-blue-50 border-2 border-blue-500' : 'hover:bg-slate-50'
                        }`}
                        onClick={() => setSelectedTask(task.id)}
                      >
                        <div className="w-48 flex-shrink-0">
                          <p className="font-medium text-slate-900 text-sm">{task.name}</p>
                          <p className="text-xs text-slate-600">{task.assignedTo}</p>
                        </div>
                        <div className="flex-1 relative h-12 bg-slate-100 rounded-lg mx-4">
                          {/* Gantt bar */}
                          <div
                            className={`absolute top-1 bottom-1 rounded-md flex items-center justify-center text-white text-xs font-semibold ${getStatusColor(
                              task.status
                            )}`}
                            style={{
                              left: `${position.left}%`,
                              width: `${position.width}%`,
                            }}
                          >
                            {task.progress}%
                          </div>
                        </div>
                        <div className="w-24 flex-shrink-0 flex items-center">
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-6 pt-6 border-t border-slate-200 flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span className="text-sm text-slate-600">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500" />
                  <span className="text-sm text-slate-600">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-400" />
                  <span className="text-sm text-slate-600">Pending</span>
                </div>
              </div>
            </Card>

            {/* Task Details */}
            {selectedTask && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Task Details</h3>
                {tasks
                  .filter((t) => t.id === selectedTask)
                  .map((task) => (
                    <div key={task.id} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Task Name</p>
                          <p className="font-semibold text-slate-900">{task.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Assigned To</p>
                          <p className="font-semibold text-slate-900">{task.assignedTo}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Start Date</p>
                          <p className="font-semibold text-slate-900">
                            {task.startDate.toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">End Date</p>
                          <p className="font-semibold text-slate-900">
                            {task.endDate.toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Progress</p>
                          <p className="font-semibold text-slate-900">{task.progress}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Status</p>
                          <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Edit Task</Button>
                        <Button variant="outline" className="flex-1">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
              </Card>
            )}
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className={`w-4 h-4 rounded ${event.color}`} />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{event.title}</p>
                      <p className="text-sm text-slate-600">
                        {event.startDate.toLocaleDateString()} {event.startDate.toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="outline">{event.type}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Mini Calendar */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">November 2025</h3>
              <div className="grid grid-cols-7 gap-2 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="font-semibold text-slate-600 text-sm py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-2 text-sm rounded-lg hover:bg-blue-100 cursor-pointer transition"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

