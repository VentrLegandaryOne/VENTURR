/**
 * Mobile App UI Pages
 * Quote generation, measurements, team chat, and project tracking for mobile
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MobileProject {
  id: string;
  name: string;
  client: string;
  status: 'quote' | 'accepted' | 'in_progress' | 'completed';
  progress: number;
  dueDate: Date;
  amount: number;
}

interface Measurement {
  id: string;
  type: 'length' | 'area' | 'angle' | 'height';
  value: number;
  unit: string;
  timestamp: Date;
  location: string;
}

interface MobileMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
}

export default function MobileAppUI() {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects] = useState<MobileProject[]>([
    {
      id: '1',
      name: 'Residential Roof Replacement',
      client: 'John Smith',
      status: 'in_progress',
      progress: 65,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      amount: 8500,
    },
    {
      id: '2',
      name: 'Commercial Gutter Installation',
      client: 'ABC Corp',
      status: 'accepted',
      progress: 30,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      amount: 3200,
    },
    {
      id: '3',
      name: 'Roof Inspection',
      client: 'Sarah Johnson',
      status: 'quote',
      progress: 0,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      amount: 450,
    },
  ]);

  const [measurements] = useState<Measurement[]>([
    { id: '1', type: 'area', value: 2500, unit: 'sq ft', timestamp: new Date(), location: '123 Main St' },
    { id: '2', type: 'length', value: 85, unit: 'ft', timestamp: new Date(Date.now() - 60 * 60 * 1000), location: 'Roof edge' },
    { id: '3', type: 'angle', value: 35, unit: 'degrees', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), location: 'Roof pitch' },
  ]);

  const [messages] = useState<MobileMessage[]>([
    { id: '1', sender: 'You', content: 'Can you confirm the measurements?', timestamp: new Date(), type: 'text' },
    { id: '2', sender: 'John Smith', content: 'Yes, those look correct!', timestamp: new Date(Date.now() - 5 * 60 * 1000), type: 'text' },
    { id: '3', sender: 'You', content: '[Photo: Roof condition]', timestamp: new Date(Date.now() - 10 * 60 * 1000), type: 'image' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quote':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Mobile Header */}
        <div className="mb-6 pt-2">
          <h1 className="text-2xl font-bold text-slate-900">Venturr Mobile</h1>
          <p className="text-sm text-slate-600">On-site project management</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="measurements">Measurements</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">+ New Quote</Button>
              <Button variant="outline" className="flex-1">
                Sync
              </Button>
            </div>

            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">{project.client}</p>
                    </div>
                    <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-700">Progress</span>
                      <span className="text-sm text-slate-600">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-slate-600">Amount</p>
                      <p className="font-semibold text-slate-900">${project.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Due Date</p>
                      <p className="font-semibold text-slate-900">{project.dueDate.toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      View
                    </Button>
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Measurements Tab */}
          <TabsContent value="measurements" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">📷 Take Photo</Button>
              <Button variant="outline" className="flex-1">
                📏 Measure
              </Button>
            </div>

            {measurements.map((measurement) => (
              <Card key={measurement.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 capitalize">{measurement.type}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {measurement.value}
                        <span className="text-lg text-slate-600 ml-1">{measurement.unit}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-2">{measurement.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-600">{measurement.timestamp.toLocaleTimeString()}</p>
                      <Button size="sm" variant="ghost" className="mt-2">
                        ✓
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-blue-600 font-medium">+ Add New Measurement</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4 h-96 flex flex-col">
            {/* Chat Header */}
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardContent className="pt-6">
                <h3 className="font-semibold">John Smith</h3>
                <p className="text-sm text-blue-100">Residential Roof Replacement</p>
              </CardContent>
            </Card>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender === 'You'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-200 text-slate-900 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.sender === 'You' ? 'text-blue-100' : 'text-gray-600'}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type message..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <Button className="bg-blue-600 hover:bg-blue-700 px-4">Send</Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Offline Indicator */}
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-xs text-yellow-800 font-medium">📡 Offline Mode - Changes will sync when online</p>
        </div>
      </div>
    </div>
  );
}

