/**
 * Advanced Project Templates System
 * Reusable templates, predefined tasks, timelines, budgets, team assignments
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedDuration: number;
  estimatedBudget: number;
  tasks: number;
  teamSize: number;
  usageCount: number;
  lastUsed: Date | null;
  tags: string[];
}

interface TemplateTask {
  id: string;
  name: string;
  description: string;
  duration: number;
  dependencies: string[];
  assignedRole: string;
  priority: 'high' | 'medium' | 'low';
  estimatedCost: number;
}

interface TemplatePhase {
  id: string;
  name: string;
  duration: number;
  tasks: TemplateTask[];
  percentage: number;
}

export default function ProjectTemplates() {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  const [templates] = useState<ProjectTemplate[]>([
    {
      id: '1',
      name: 'Residential Roof Replacement',
      description: 'Complete roof replacement for single-family homes',
      category: 'Residential',
      complexity: 'medium',
      estimatedDuration: 5,
      estimatedBudget: 8500,
      tasks: 12,
      teamSize: 3,
      usageCount: 24,
      lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      tags: ['residential', 'replacement', 'asphalt'],
    },
    {
      id: '2',
      name: 'Commercial Flat Roof Repair',
      description: 'Repair and maintenance for commercial flat roofs',
      category: 'Commercial',
      complexity: 'complex',
      estimatedDuration: 8,
      estimatedBudget: 15000,
      tasks: 18,
      teamSize: 5,
      usageCount: 12,
      lastUsed: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      tags: ['commercial', 'flat-roof', 'repair'],
    },
    {
      id: '3',
      name: 'Metal Roof Installation',
      description: 'Installation of metal roofing systems',
      category: 'Residential',
      complexity: 'complex',
      estimatedDuration: 7,
      estimatedBudget: 12000,
      tasks: 15,
      teamSize: 4,
      usageCount: 8,
      lastUsed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      tags: ['metal', 'installation', 'premium'],
    },
    {
      id: '4',
      name: 'Roof Inspection & Assessment',
      description: 'Comprehensive roof inspection and damage assessment',
      category: 'Inspection',
      complexity: 'simple',
      estimatedDuration: 2,
      estimatedBudget: 500,
      tasks: 6,
      teamSize: 1,
      usageCount: 45,
      lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tags: ['inspection', 'assessment', 'quick'],
    },
    {
      id: '5',
      name: 'Gutter Installation & Repair',
      description: 'Install or repair gutters and downspouts',
      category: 'Accessories',
      complexity: 'simple',
      estimatedDuration: 3,
      estimatedBudget: 2000,
      tasks: 8,
      teamSize: 2,
      usageCount: 18,
      lastUsed: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      tags: ['gutters', 'accessories', 'quick'],
    },
    {
      id: '6',
      name: 'Emergency Roof Repair',
      description: 'Emergency repairs for storm damage or leaks',
      category: 'Emergency',
      complexity: 'medium',
      estimatedDuration: 1,
      estimatedBudget: 3000,
      tasks: 5,
      teamSize: 2,
      usageCount: 32,
      lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tags: ['emergency', 'repair', 'urgent'],
    },
  ]);

  const [templatePhases] = useState<TemplatePhase[]>([
    {
      id: '1',
      name: 'Preparation & Assessment',
      duration: 1,
      percentage: 20,
      tasks: [
        {
          id: '1',
          name: 'Site inspection and measurements',
          description: 'Inspect roof and take detailed measurements',
          duration: 2,
          dependencies: [],
          assignedRole: 'Foreman',
          priority: 'high',
          estimatedCost: 200,
        },
        {
          id: '2',
          name: 'Material estimation',
          description: 'Calculate required materials and quantities',
          duration: 1,
          dependencies: ['1'],
          assignedRole: 'Estimator',
          priority: 'high',
          estimatedCost: 0,
        },
        {
          id: '3',
          name: 'Safety setup',
          description: 'Install safety equipment and barriers',
          duration: 1,
          dependencies: [],
          assignedRole: 'Safety Officer',
          priority: 'high',
          estimatedCost: 150,
        },
      ],
    },
    {
      id: '2',
      name: 'Removal & Preparation',
      duration: 2,
      percentage: 30,
      tasks: [
        {
          id: '4',
          name: 'Remove old roofing',
          description: 'Strip old shingles and underlayment',
          duration: 4,
          dependencies: ['3'],
          assignedRole: 'Roofer',
          priority: 'high',
          estimatedCost: 1200,
        },
        {
          id: '5',
          name: 'Inspect deck',
          description: 'Check for damage and replace as needed',
          duration: 2,
          dependencies: ['4'],
          assignedRole: 'Foreman',
          priority: 'high',
          estimatedCost: 400,
        },
      ],
    },
    {
      id: '3',
      name: 'Installation',
      duration: 2,
      percentage: 35,
      tasks: [
        {
          id: '6',
          name: 'Install underlayment',
          description: 'Apply roofing felt and ice shield',
          duration: 2,
          dependencies: ['5'],
          assignedRole: 'Roofer',
          priority: 'high',
          estimatedCost: 600,
        },
        {
          id: '7',
          name: 'Install shingles',
          description: 'Apply shingles according to specifications',
          duration: 4,
          dependencies: ['6'],
          assignedRole: 'Roofer',
          priority: 'high',
          estimatedCost: 2000,
        },
        {
          id: '8',
          name: 'Install flashing',
          description: 'Install flashing around chimneys and vents',
          duration: 2,
          dependencies: ['7'],
          assignedRole: 'Roofer',
          priority: 'high',
          estimatedCost: 500,
        },
      ],
    },
    {
      id: '4',
      name: 'Cleanup & Inspection',
      duration: 1,
      percentage: 15,
      tasks: [
        {
          id: '9',
          name: 'Final inspection',
          description: 'Inspect all work for quality',
          duration: 1,
          dependencies: ['8'],
          assignedRole: 'Foreman',
          priority: 'high',
          estimatedCost: 0,
        },
        {
          id: '10',
          name: 'Cleanup',
          description: 'Remove debris and clean site',
          duration: 2,
          dependencies: ['9'],
          assignedRole: 'Laborer',
          priority: 'medium',
          estimatedCost: 300,
        },
      ],
    },
  ]);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'complex':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Residential: 'bg-blue-100 text-blue-800',
      Commercial: 'bg-purple-100 text-purple-800',
      Inspection: 'bg-green-100 text-green-800',
      Accessories: 'bg-yellow-100 text-yellow-800',
      Emergency: 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Project Templates</h1>
            <p className="text-slate-600 mt-2">Reusable templates to accelerate project setup and standardize processes</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">➕ Create Template</Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="details">Template Details</TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedTemplate(template)}>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                      </div>
                      <Badge className={getComplexityColor(template.complexity)}>{template.complexity}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Duration</p>
                        <p className="font-semibold">{template.estimatedDuration} days</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Budget</p>
                        <p className="font-semibold">${template.estimatedBudget.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Tasks</p>
                        <p className="font-semibold">{template.tasks}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Team Size</p>
                        <p className="font-semibold">{template.teamSize} people</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-xs text-slate-600">Used {template.usageCount} times</p>
                      {template.lastUsed && <p className="text-xs text-slate-600">Last used: {template.lastUsed.toLocaleDateString()}</p>}
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Use Template</Button>
                      <Button variant="outline" className="flex-1">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Template Details Tab */}
          <TabsContent value="details" className="space-y-6">
            {selectedTemplate ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedTemplate.name}</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">{selectedTemplate.description}</p>
                      </div>
                      <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                        ✕
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Overview */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-3 bg-blue-50 rounded">
                        <p className="text-sm text-slate-600">Duration</p>
                        <p className="text-2xl font-bold text-blue-600">{selectedTemplate.estimatedDuration}</p>
                        <p className="text-xs text-slate-600">days</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded">
                        <p className="text-sm text-slate-600">Budget</p>
                        <p className="text-2xl font-bold text-green-600">${(selectedTemplate.estimatedBudget / 1000).toFixed(1)}K</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded">
                        <p className="text-sm text-slate-600">Tasks</p>
                        <p className="text-2xl font-bold text-purple-600">{selectedTemplate.tasks}</p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded">
                        <p className="text-sm text-slate-600">Team</p>
                        <p className="text-2xl font-bold text-orange-600">{selectedTemplate.teamSize}</p>
                      </div>
                    </div>

                    {/* Phases and Tasks */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Project Phases</h3>
                      {templatePhases.map((phase) => (
                        <Card key={phase.id} className="border-l-4 border-l-blue-600">
                          <CardContent className="pt-6">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-slate-900">{phase.name}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-slate-600">{phase.duration} days</span>
                                  <span className="text-sm font-semibold text-blue-600">{phase.percentage}%</span>
                                </div>
                              </div>

                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${phase.percentage}%` }} />
                              </div>

                              <div className="space-y-2">
                                {phase.tasks.map((task) => (
                                  <div key={task.id} className="p-2 bg-slate-50 rounded border border-slate-200">
                                    <div className="flex justify-between items-start gap-2">
                                      <div className="flex-1">
                                        <p className="font-medium text-slate-900">{task.name}</p>
                                        <p className="text-sm text-slate-600">{task.description}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-semibold">{task.duration}h</p>
                                        <p className="text-xs text-slate-600">${task.estimatedCost}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        {task.assignedRole}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {task.priority}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700">🚀 Create Project from Template</Button>
                      <Button variant="outline" className="flex-1">
                        ✎ Edit Template
                      </Button>
                      <Button variant="outline" className="flex-1">
                        📋 Duplicate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-slate-600 text-lg">Select a template from the Templates tab to view details</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

