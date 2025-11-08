/**
 * Automated Workflow Builder
 * Visual workflow designer for automating repetitive tasks with conditional logic
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  name: string;
  description: string;
  config: Record<string, unknown>;
  order: number;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  steps: WorkflowStep[];
  createdAt: Date;
  lastModified: Date;
  executions: number;
}

export default function WorkflowBuilder() {
  const [activeTab, setActiveTab] = useState('workflows');
  const [showBuilder, setShowBuilder] = useState(false);

  const [workflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Auto-Generate Quote on Project Creation',
      description: 'Automatically generate quote when new project is created',
      enabled: true,
      steps: [
        {
          id: 's1',
          type: 'trigger',
          name: 'Project Created',
          description: 'When a new project is created',
          config: { event: 'project.created' },
          order: 1,
        },
        {
          id: 's2',
          type: 'action',
          name: 'Generate Quote',
          description: 'Generate quote from project details',
          config: { action: 'generateQuote' },
          order: 2,
        },
        {
          id: 's3',
          type: 'action',
          name: 'Send Email',
          description: 'Send quote to client',
          config: { action: 'sendEmail', template: 'quote' },
          order: 3,
        },
      ],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      executions: 247,
    },
    {
      id: '2',
      name: 'Payment Reminder Sequence',
      description: 'Send payment reminders at regular intervals',
      enabled: true,
      steps: [
        {
          id: 's1',
          type: 'trigger',
          name: 'Invoice Created',
          description: 'When an invoice is created',
          config: { event: 'invoice.created' },
          order: 1,
        },
        {
          id: 's2',
          type: 'delay',
          name: 'Wait 7 Days',
          description: 'Wait 7 days before first reminder',
          config: { delay: 7, unit: 'days' },
          order: 2,
        },
        {
          id: 's3',
          type: 'action',
          name: 'Send Reminder',
          description: 'Send payment reminder email',
          config: { action: 'sendEmail', template: 'payment_reminder' },
          order: 3,
        },
        {
          id: 's4',
          type: 'condition',
          name: 'Check Payment Status',
          description: 'If payment not received',
          config: { condition: 'payment_status', value: 'unpaid' },
          order: 4,
        },
      ],
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      lastModified: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      executions: 512,
    },
    {
      id: '3',
      name: 'Project Completion Notification',
      description: 'Notify client and team when project is completed',
      enabled: false,
      steps: [
        {
          id: 's1',
          type: 'trigger',
          name: 'Project Completed',
          description: 'When project status changes to completed',
          config: { event: 'project.completed' },
          order: 1,
        },
        {
          id: 's2',
          type: 'action',
          name: 'Notify Client',
          description: 'Send completion notification to client',
          config: { action: 'sendEmail', template: 'completion' },
          order: 2,
        },
        {
          id: 's3',
          type: 'action',
          name: 'Update CRM',
          description: 'Update project status in CRM',
          config: { action: 'updateCRM', field: 'status' },
          order: 3,
        },
      ],
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      lastModified: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      executions: 89,
    },
  ]);

  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger: '',
  });

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'trigger':
        return '▶';
      case 'action':
        return '⚙';
      case 'condition':
        return '◆';
      case 'delay':
        return '⏱';
      default:
        return '•';
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'trigger':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'action':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'condition':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delay':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Workflow Builder</h1>
            <p className="text-slate-600 mt-2">Automate repetitive tasks with visual workflows</p>
          </div>
          <Button onClick={() => setShowBuilder(!showBuilder)} className="bg-blue-600 hover:bg-blue-700">
            {showBuilder ? '✕ Close' : '+ New Workflow'}
          </Button>
        </div>

        {/* Workflow Builder */}
        {showBuilder && (
          <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>Create New Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Workflow Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Auto-send payment reminders"
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <input
                    type="text"
                    placeholder="What does this workflow do?"
                    value={newWorkflow.description}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Trigger</label>
                <select
                  value={newWorkflow.trigger}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, trigger: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Choose a trigger...</option>
                  <option value="project.created">Project Created</option>
                  <option value="quote.accepted">Quote Accepted</option>
                  <option value="invoice.created">Invoice Created</option>
                  <option value="payment.received">Payment Received</option>
                  <option value="project.completed">Project Completed</option>
                  <option value="scheduled">Scheduled Time</option>
                </select>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <p className="text-sm text-slate-600 mb-3">Workflow Steps (drag to reorder):</p>
                <div className="space-y-2">
                  <div className="p-3 bg-green-50 border border-green-300 rounded text-sm">
                    ▶ Trigger: {newWorkflow.trigger || 'Not selected'}
                  </div>
                  <div className="text-center text-slate-400">↓</div>
                  <div className="p-3 bg-blue-50 border border-blue-300 rounded text-sm text-slate-600">
                    + Click to add action
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowBuilder(false)}>
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Create Workflow</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="workflows">Active Workflows</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">{workflow.description}</p>
                    </div>
                    <Badge className={workflow.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {workflow.enabled ? '✓ Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Workflow Steps */}
                  <div className="space-y-2">
                    {workflow.steps.map((step, index) => (
                      <div key={step.id}>
                        <div className={`p-3 rounded-lg border-l-4 ${getStepColor(step.type)}`}>
                          <div className="flex items-start gap-3">
                            <span className="text-xl">{getStepIcon(step.type)}</span>
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{step.name}</p>
                              <p className="text-sm text-slate-600">{step.description}</p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {step.type}
                            </Badge>
                          </div>
                        </div>
                        {index < workflow.steps.length - 1 && <div className="text-center text-slate-400 py-1">↓</div>}
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-slate-600">Created</p>
                      <p className="font-semibold text-slate-900">{workflow.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Last Modified</p>
                      <p className="font-semibold text-slate-900">{workflow.lastModified.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Executions</p>
                      <p className="font-semibold text-slate-900">{workflow.executions.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Duplicate
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      {workflow.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:text-red-700">
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: 'Quote Generation',
                  description: 'Auto-generate quotes when projects are created',
                  steps: 3,
                },
                {
                  name: 'Payment Reminders',
                  description: 'Send automated payment reminders on schedule',
                  steps: 4,
                },
                {
                  name: 'Project Status Updates',
                  description: 'Notify team and clients of project status changes',
                  steps: 3,
                },
                {
                  name: 'Invoice Generation',
                  description: 'Auto-generate invoices when projects complete',
                  steps: 2,
                },
                {
                  name: 'Team Notifications',
                  description: 'Alert team members of new assignments',
                  steps: 2,
                },
                {
                  name: 'Customer Follow-up',
                  description: 'Schedule follow-up emails after project completion',
                  steps: 4,
                },
              ].map((template, idx) => (
                <Card key={idx} className="hover:shadow-lg transition cursor-pointer">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-slate-900 mb-2">{template.name}</h3>
                    <p className="text-sm text-slate-600 mb-4">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{template.steps} steps</Badge>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Use Template
                      </Button>
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

