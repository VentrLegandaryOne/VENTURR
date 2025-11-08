/**
 * Client Portal Home Page
 * Public-facing portal for clients to view projects, quotes, payments, and documents
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ClientProject {
  id: string;
  title: string;
  address: string;
  status: 'draft' | 'quoted' | 'approved' | 'in_progress' | 'completed';
  progress: number;
  startDate: Date;
  estimatedCompletion: Date;
  image?: string;
}

interface ClientQuote {
  id: string;
  quoteNumber: string;
  projectTitle: string;
  amount: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
  createdAt: Date;
  validUntil: Date;
}

interface ClientPayment {
  id: string;
  projectTitle: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
}

export default function ClientPortalHome() {
  const [projects] = useState<ClientProject[]>([
    {
      id: '1',
      title: 'Smith Residence - Roof Replacement',
      address: '123 Main St, Sydney NSW 2000',
      status: 'in_progress',
      progress: 65,
      startDate: new Date(Date.now() - 14 * 86400000),
      estimatedCompletion: new Date(Date.now() + 16 * 86400000),
    },
    {
      id: '2',
      title: 'Johnson Commercial Building',
      address: '456 Business Ave, Sydney NSW 2001',
      status: 'approved',
      progress: 0,
      startDate: new Date(Date.now() + 7 * 86400000),
      estimatedCompletion: new Date(Date.now() + 60 * 86400000),
    },
  ]);

  const [quotes] = useState<ClientQuote[]>([
    {
      id: '1',
      quoteNumber: '#2024-001',
      projectTitle: 'Smith Residence - Roof Replacement',
      amount: 15000,
      status: 'accepted',
      createdAt: new Date(Date.now() - 7 * 86400000),
      validUntil: new Date(Date.now() + 23 * 86400000),
    },
    {
      id: '2',
      quoteNumber: '#2024-002',
      projectTitle: 'Johnson Commercial Building',
      amount: 45000,
      status: 'sent',
      createdAt: new Date(Date.now() - 2 * 86400000),
      validUntil: new Date(Date.now() + 28 * 86400000),
    },
  ]);

  const [payments] = useState<ClientPayment[]>([
    {
      id: '1',
      projectTitle: 'Smith Residence - Roof Replacement',
      amount: 7500,
      dueDate: new Date(Date.now() + 5 * 86400000),
      status: 'pending',
    },
    {
      id: '2',
      projectTitle: 'Smith Residence - Roof Replacement',
      amount: 7500,
      dueDate: new Date(Date.now() + 35 * 86400000),
      status: 'pending',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-purple-100 text-purple-800';
      case 'quoted':
        return 'bg-orange-100 text-orange-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Your Projects</h1>
          <p className="text-slate-600">Manage your projects, quotes, and payments in one place</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-slate-600 mb-2">Active Projects</p>
            <p className="text-3xl font-bold text-slate-900">
              {projects.filter((p) => p.status === 'in_progress').length}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-600 mb-2">Pending Quotes</p>
            <p className="text-3xl font-bold text-slate-900">
              {quotes.filter((q) => q.status === 'sent').length}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-600 mb-2">Payments Due</p>
            <p className="text-3xl font-bold text-orange-600">
              ${payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) / 1000}K
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-600 mb-2">Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {projects.filter((p) => p.status === 'completed').length}
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            {projects.map((project) => (
              <Card key={project.id} className="p-6 hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-900">{project.title}</h3>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-slate-600">📍 {project.address}</p>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">View Details</Button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Progress</span>
                    <span className="text-sm font-bold text-slate-900">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className={`${getProgressColor(project.progress)} h-3 rounded-full transition-all`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Start Date</p>
                    <p className="font-semibold text-slate-900">
                      {project.startDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Est. Completion</p>
                    <p className="font-semibold text-slate-900">
                      {project.estimatedCompletion.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes" className="space-y-4">
            {quotes.map((quote) => (
              <Card key={quote.id} className="p-6 hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{quote.quoteNumber}</h3>
                      <Badge className={getStatusColor(quote.status)}>
                        {quote.status}
                      </Badge>
                    </div>
                    <p className="text-slate-600 mb-2">{quote.projectTitle}</p>
                    <p className="text-sm text-slate-500">
                      Valid until {quote.validUntil.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-slate-900">
                      ${(quote.amount / 1000).toFixed(1)}K
                    </p>
                    <Button className="mt-3 bg-blue-600 hover:bg-blue-700">View Quote</Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id} className="p-6 hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {payment.projectTitle}
                    </h3>
                    <p className="text-slate-600 mb-2">
                      Due: {payment.dueDate.toLocaleDateString()}
                    </p>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-slate-900 mb-3">
                      ${(payment.amount / 100).toFixed(2)}
                    </p>
                    {payment.status === 'pending' && (
                      <Button className="bg-green-600 hover:bg-green-700">Pay Now</Button>
                    )}
                    {payment.status === 'paid' && (
                      <Button disabled className="bg-gray-400">
                        Paid
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Documents</h3>
              <div className="space-y-3">
                {[
                  { name: 'Smith Residence - Quote.pdf', type: 'quote', size: '2.4 MB' },
                  { name: 'Smith Residence - Contract.pdf', type: 'contract', size: '1.8 MB' },
                  { name: 'Project Photos - Week 1.zip', type: 'photos', size: '45 MB' },
                  { name: 'Safety Report.pdf', type: 'report', size: '3.2 MB' },
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {doc.type === 'quote' && '📄'}
                        {doc.type === 'contract' && '📋'}
                        {doc.type === 'photos' && '📸'}
                        {doc.type === 'report' && '📊'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{doc.name}</p>
                        <p className="text-sm text-slate-600">{doc.size}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
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

