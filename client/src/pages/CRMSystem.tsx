/**
 * Customer Relationship Management (CRM) System
 * Contact management, interaction history, communication timeline, customer lifecycle tracking
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  status: 'prospect' | 'customer' | 'inactive' | 'vip';
  lastContact: Date;
  totalValue: number;
  projects: number;
  notes: string;
}

interface Interaction {
  id: string;
  contactId: string;
  contactName: string;
  type: 'call' | 'email' | 'meeting' | 'quote' | 'proposal' | 'contract';
  date: Date;
  duration?: number;
  subject: string;
  notes: string;
  outcome: string;
}

interface CustomerLifecycle {
  stage: string;
  count: number;
  value: number;
  percentage: number;
}

export default function CRMSystem() {
  const [activeTab, setActiveTab] = useState('contacts');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '(555) 123-4567',
      company: 'Smith Construction',
      role: 'Owner',
      status: 'vip',
      lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      totalValue: 125000,
      projects: 8,
      notes: 'Long-time customer, prefers phone calls',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@buildingco.com',
      phone: '(555) 234-5678',
      company: 'Building Solutions Inc',
      role: 'Project Manager',
      status: 'customer',
      lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      totalValue: 45000,
      projects: 3,
      notes: 'Responsive, good communication',
    },
    {
      id: '3',
      name: 'Mike Davis',
      email: 'mike@homerepair.net',
      phone: '(555) 345-6789',
      company: 'Home Repair Specialists',
      role: 'Sales Manager',
      status: 'prospect',
      lastContact: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      totalValue: 0,
      projects: 0,
      notes: 'Interested in bulk pricing',
    },
    {
      id: '4',
      name: 'Lisa Chen',
      email: 'lisa.chen@contractor.com',
      phone: '(555) 456-7890',
      company: 'Premier Contractors',
      role: 'Owner',
      status: 'customer',
      lastContact: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      totalValue: 78000,
      projects: 5,
      notes: 'Seasonal work, peaks in spring/fall',
    },
    {
      id: '5',
      name: 'Tom Wilson',
      email: 'tom@oldclient.com',
      phone: '(555) 567-8901',
      company: 'Wilson Roofing',
      role: 'Owner',
      status: 'inactive',
      lastContact: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      totalValue: 32000,
      projects: 2,
      notes: 'No activity for 3 months',
    },
  ]);

  const [interactions] = useState<Interaction[]>([
    {
      id: '1',
      contactId: '1',
      contactName: 'John Smith',
      type: 'call',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      duration: 25,
      subject: 'Follow-up on Q4 project',
      notes: 'Discussed timeline and budget for Oak Street project',
      outcome: 'Agreed to proceed with proposal',
    },
    {
      id: '2',
      contactId: '2',
      contactName: 'Sarah Johnson',
      type: 'email',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      subject: 'Quote for new commercial project',
      notes: 'Sent detailed quote for 3-building complex',
      outcome: 'Awaiting response',
    },
    {
      id: '3',
      contactId: '1',
      contactName: 'John Smith',
      type: 'meeting',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      duration: 60,
      subject: 'In-person site visit',
      notes: 'Walked through project site, reviewed specifications',
      outcome: 'Client satisfied with proposal',
    },
    {
      id: '4',
      contactId: '4',
      contactName: 'Lisa Chen',
      type: 'quote',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      subject: 'Spring project quote',
      notes: 'Provided 3 options for residential complex',
      outcome: 'Selected mid-range option',
    },
  ]);

  const [lifecycleData] = useState<CustomerLifecycle[]>([
    { stage: 'Prospect', count: 12, value: 0, percentage: 20 },
    { stage: 'Lead', count: 8, value: 25000, percentage: 13 },
    { stage: 'Customer', count: 28, value: 450000, percentage: 47 },
    { stage: 'VIP', count: 12, value: 320000, percentage: 20 },
  ]);

  const [revenueData] = useState([
    { month: 'Aug', revenue: 45000, target: 50000 },
    { month: 'Sep', revenue: 52000, target: 50000 },
    { month: 'Oct', revenue: 48000, target: 50000 },
    { month: 'Nov', revenue: 61000, target: 50000 },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip':
        return 'bg-purple-100 text-purple-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      case 'prospect':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInteractionTypeColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'bg-blue-100 text-blue-800';
      case 'email':
        return 'bg-green-100 text-green-800';
      case 'meeting':
        return 'bg-purple-100 text-purple-800';
      case 'quote':
        return 'bg-yellow-100 text-yellow-800';
      case 'proposal':
        return 'bg-orange-100 text-orange-800';
      case 'contract':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalCustomers = contacts.length;
  const totalValue = contacts.reduce((sum, c) => sum + c.totalValue, 0);
  const activeCustomers = contacts.filter((c) => c.status !== 'inactive').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Customer Relationship Management</h1>
            <p className="text-slate-600 mt-2">Manage contacts, interactions, and customer lifecycle</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">➕ Add Contact</Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Total Customers</p>
                <div className="text-3xl font-bold text-blue-600">{totalCustomers}</div>
                <p className="text-xs text-slate-600 mt-1">In database</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Total Value</p>
                <div className="text-3xl font-bold text-green-600">${(totalValue / 1000).toFixed(0)}K</div>
                <p className="text-xs text-slate-600 mt-1">Lifetime value</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Active Customers</p>
                <div className="text-3xl font-bold text-yellow-600">{activeCustomers}</div>
                <p className="text-xs text-slate-600 mt-1">Engaged</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Avg Value</p>
                <div className="text-3xl font-bold text-purple-600">${(totalValue / totalCustomers / 1000).toFixed(1)}K</div>
                <p className="text-xs text-slate-600 mt-1">Per customer</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
            <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Company</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-left font-semibold">Phone</th>
                    <th className="px-4 py-3 text-center font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Total Value</th>
                    <th className="px-4 py-3 text-right font-semibold">Projects</th>
                    <th className="px-4 py-3 text-left font-semibold">Last Contact</th>
                    <th className="px-4 py-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedContact(contact)}>
                      <td className="px-4 py-3 font-semibold">{contact.name}</td>
                      <td className="px-4 py-3 text-slate-600">{contact.company}</td>
                      <td className="px-4 py-3 text-slate-600">{contact.email}</td>
                      <td className="px-4 py-3 text-slate-600">{contact.phone}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={getStatusColor(contact.status)}>{contact.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">${contact.totalValue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{contact.projects}</td>
                      <td className="px-4 py-3 text-slate-600">{contact.lastContact.toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-center">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Contact Details Panel */}
            {selectedContact && (
              <Card className="mt-6 border-2 border-blue-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedContact.name}</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        {selectedContact.role} at {selectedContact.company}
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setSelectedContact(null)}>
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-semibold">{selectedContact.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Phone</p>
                      <p className="font-semibold">{selectedContact.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Value</p>
                      <p className="font-semibold text-green-600">${selectedContact.totalValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Projects</p>
                      <p className="font-semibold">{selectedContact.projects}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Notes</p>
                    <p className="text-slate-700">{selectedContact.notes}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-blue-600 hover:bg-blue-700">📞 Call</Button>
                    <Button className="bg-green-600 hover:bg-green-700">✉️ Email</Button>
                    <Button variant="outline">📅 Schedule Meeting</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Interactions Tab */}
          <TabsContent value="interactions" className="space-y-4">
            {interactions.map((interaction) => (
              <Card key={interaction.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{interaction.contactName}</h3>
                        <Badge className={getInteractionTypeColor(interaction.type)}>{interaction.type}</Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-700 mb-1">{interaction.subject}</p>
                      <p className="text-sm text-slate-600 mb-2">{interaction.notes}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-slate-600">{interaction.date.toLocaleDateString()}</span>
                        {interaction.duration && <span className="text-slate-600">Duration: {interaction.duration} min</span>}
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{interaction.outcome}</span>
                      </div>
                    </div>

                    <Button variant="outline">Edit</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Lifecycle Tab */}
          <TabsContent value="lifecycle" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Lifecycle Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lifecycleData.map((stage, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-900">{stage.stage}</span>
                        <span className="text-sm text-slate-600">
                          {stage.count} customers • ${stage.value.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stage.percentage}%` }} />
                      </div>
                      <p className="text-xs text-slate-600">{stage.percentage}% of total</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue vs Target</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Bar dataKey="target" fill="#10b981" name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

