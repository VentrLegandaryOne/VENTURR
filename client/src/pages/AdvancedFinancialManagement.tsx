/**
 * Advanced Financial Management
 * Invoicing, expense tracking, tax compliance, multi-currency, accounting integrations
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  items: number;
  tax: number;
}

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  vendor: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  receipt: boolean;
  taxDeductible: boolean;
}

interface TaxCompliance {
  id: string;
  type: string;
  jurisdiction: string;
  dueDate: string;
  status: 'pending' | 'filed' | 'paid' | 'overdue';
  amount: number;
  lastFiled: string;
  nextDue: string;
}

interface FinancialReport {
  id: string;
  name: string;
  period: string;
  type: string;
  generatedDate: string;
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
}

interface AccountingIntegration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  syncFrequency: string;
  dataSync: string[];
}

interface CurrencyExchange {
  from: string;
  to: string;
  rate: number;
  lastUpdated: string;
}

export default function AdvancedFinancialManagement() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      number: 'INV-2025-001',
      client: 'ABC Construction',
      amount: 15000,
      currency: 'USD',
      status: 'paid',
      issueDate: '2025-01-15',
      dueDate: '2025-02-15',
      items: 5,
      tax: 1500,
    },
    {
      id: '2',
      number: 'INV-2025-002',
      client: 'XYZ Builders',
      amount: 22500,
      currency: 'USD',
      status: 'sent',
      issueDate: '2025-01-25',
      dueDate: '2025-02-25',
      items: 8,
      tax: 2250,
    },
    {
      id: '3',
      number: 'INV-2025-003',
      client: 'Global Contractors',
      amount: 18750,
      currency: 'EUR',
      status: 'overdue',
      issueDate: '2025-01-10',
      dueDate: '2025-01-31',
      items: 6,
      tax: 1875,
    },
    {
      id: '4',
      number: 'INV-2025-004',
      client: 'Tech Solutions Inc',
      amount: 12000,
      currency: 'USD',
      status: 'draft',
      issueDate: '2025-01-31',
      dueDate: '2025-02-28',
      items: 4,
      tax: 1200,
    },
  ]);

  const [expenses] = useState<Expense[]>([
    {
      id: '1',
      description: 'Equipment Rental',
      category: 'Equipment',
      amount: 2500,
      currency: 'USD',
      date: '2025-01-30',
      vendor: 'Equipment Plus',
      status: 'approved',
      receipt: true,
      taxDeductible: true,
    },
    {
      id: '2',
      description: 'Fuel',
      category: 'Transportation',
      amount: 450,
      currency: 'USD',
      date: '2025-01-31',
      vendor: 'Shell Gas Station',
      status: 'pending',
      receipt: true,
      taxDeductible: true,
    },
    {
      id: '3',
      description: 'Office Supplies',
      category: 'Supplies',
      amount: 350,
      currency: 'USD',
      date: '2025-01-28',
      vendor: 'Office Depot',
      status: 'reimbursed',
      receipt: true,
      taxDeductible: false,
    },
    {
      id: '4',
      description: 'Training Course',
      category: 'Professional Development',
      amount: 1200,
      currency: 'USD',
      date: '2025-01-25',
      vendor: 'Online Academy',
      status: 'rejected',
      receipt: true,
      taxDeductible: false,
    },
  ]);

  const [taxCompliance] = useState<TaxCompliance[]>([
    {
      id: '1',
      type: 'Quarterly Tax Payment',
      jurisdiction: 'USA - Federal',
      dueDate: '2025-04-15',
      status: 'pending',
      amount: 8500,
      lastFiled: '2024-10-15',
      nextDue: '2025-04-15',
    },
    {
      id: '2',
      type: 'Sales Tax Filing',
      jurisdiction: 'California',
      dueDate: '2025-02-20',
      status: 'pending',
      amount: 3200,
      lastFiled: '2025-01-20',
      nextDue: '2025-02-20',
    },
    {
      id: '3',
      type: 'Annual Income Tax',
      jurisdiction: 'USA - Federal',
      dueDate: '2025-04-15',
      status: 'pending',
      amount: 45000,
      lastFiled: '2024-04-15',
      nextDue: '2025-04-15',
    },
    {
      id: '4',
      type: 'VAT Filing',
      jurisdiction: 'UK',
      dueDate: '2025-02-07',
      status: 'filed',
      amount: 5600,
      lastFiled: '2025-01-31',
      nextDue: '2025-04-07',
    },
  ]);

  const [financialReports] = useState<FinancialReport[]>([
    {
      id: '1',
      name: 'January 2025 Summary',
      period: 'January 2025',
      type: 'Monthly',
      generatedDate: '2025-01-31',
      revenue: 68250,
      expenses: 12500,
      profit: 55750,
      profitMargin: 81.7,
    },
    {
      id: '2',
      name: 'Q4 2024 Report',
      period: 'Oct-Dec 2024',
      type: 'Quarterly',
      generatedDate: '2024-12-31',
      revenue: 185000,
      expenses: 42000,
      profit: 143000,
      profitMargin: 77.3,
    },
    {
      id: '3',
      name: 'Year 2024 Summary',
      period: 'January-December 2024',
      type: 'Annual',
      generatedDate: '2024-12-31',
      revenue: 650000,
      expenses: 145000,
      profit: 505000,
      profitMargin: 77.7,
    },
  ]);

  const [accountingIntegrations] = useState<AccountingIntegration[]>([
    {
      id: '1',
      name: 'QuickBooks Online',
      type: 'Accounting Software',
      status: 'connected',
      lastSync: '2025-01-31 14:32',
      syncFrequency: 'Real-time',
      dataSync: ['Invoices', 'Expenses', 'Payments', 'Reports'],
    },
    {
      id: '2',
      name: 'Xero',
      type: 'Accounting Software',
      status: 'connected',
      lastSync: '2025-01-31 14:30',
      syncFrequency: 'Hourly',
      dataSync: ['Invoices', 'Expenses', 'Bank Transactions'],
    },
    {
      id: '3',
      name: 'Stripe',
      type: 'Payment Gateway',
      status: 'connected',
      lastSync: '2025-01-31 14:28',
      syncFrequency: 'Real-time',
      dataSync: ['Payments', 'Refunds', 'Fees'],
    },
    {
      id: '4',
      name: 'Wave',
      type: 'Accounting Software',
      status: 'disconnected',
      lastSync: '2024-12-15 10:00',
      syncFrequency: 'N/A',
      dataSync: [],
    },
  ]);

  const [currencyRates] = useState<CurrencyExchange[]>([
    { from: 'USD', to: 'EUR', rate: 0.92, lastUpdated: '2025-01-31 14:00' },
    { from: 'USD', to: 'GBP', rate: 0.79, lastUpdated: '2025-01-31 14:00' },
    { from: 'USD', to: 'CAD', rate: 1.36, lastUpdated: '2025-01-31 14:00' },
    { from: 'USD', to: 'AUD', rate: 1.54, lastUpdated: '2025-01-31 14:00' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'filed':
      case 'approved':
      case 'reimbursed':
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'sent':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
      case 'rejected':
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'draft':
      case 'cancelled':
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const paidInvoices = invoices.filter((i) => i.status === 'paid').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Financial Management</h1>
              <p className="text-slate-600 mt-2">Invoicing, expenses, tax compliance, multi-currency, accounting integrations</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">+ New Invoice</Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Total Invoiced</p>
              <p className="text-3xl font-bold text-slate-900">${(totalInvoiced / 1000).toFixed(1)}K</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Total Expenses</p>
              <p className="text-3xl font-bold text-slate-900">${(totalExpenses / 1000).toFixed(1)}K</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Paid Invoices</p>
              <p className="text-3xl font-bold text-green-600">{paidInvoices}/{invoices.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Accounting Synced</p>
              <p className="text-3xl font-bold text-slate-900">{accountingIntegrations.filter((a) => a.status === 'connected').length}/4</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="tax">Tax</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="accounting">Accounting</TabsTrigger>
            <TabsTrigger value="currency">Currency</TabsTrigger>
          </TabsList>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <Card
                  key={invoice.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">{invoice.number}</h3>
                          <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">{invoice.client}</p>
                        <div className="grid grid-cols-5 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-slate-600">Amount</p>
                            <p className="font-semibold text-slate-900">
                              {invoice.currency} ${invoice.amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-600">Tax</p>
                            <p className="font-semibold text-slate-900">${invoice.tax.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Items</p>
                            <p className="font-semibold text-slate-900">{invoice.items}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Issued</p>
                            <p className="font-semibold text-slate-900">{invoice.issueDate}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Due</p>
                            <p className="font-semibold text-slate-900">{invoice.dueDate}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedInvoice && (
              <Card>
                <CardHeader className="flex justify-between items-start">
                  <CardTitle>{selectedInvoice.number}</CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedInvoice(null)}>
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Status</p>
                      <Badge className={getStatusColor(selectedInvoice.status)}>
                        {selectedInvoice.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Amount</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {selectedInvoice.currency} ${selectedInvoice.amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Tax</p>
                      <p className="text-2xl font-bold text-slate-900">${selectedInvoice.tax.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${(selectedInvoice.amount + selectedInvoice.tax).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      View PDF
                    </Button>
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      {selectedInvoice.status === 'draft' ? 'Send' : 'Edit'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            {expenses.map((expense) => (
              <Card key={expense.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{expense.description}</h3>
                      <p className="text-sm text-slate-600">{expense.vendor}</p>
                      <div className="grid grid-cols-5 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-slate-600">Amount</p>
                          <p className="font-semibold text-slate-900">
                            {expense.currency} ${expense.amount}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Category</p>
                          <p className="font-semibold text-slate-900">{expense.category}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Date</p>
                          <p className="font-semibold text-slate-900">{expense.date}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Receipt</p>
                          <p className="font-semibold text-slate-900">{expense.receipt ? '✓' : '✗'}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Tax Deductible</p>
                          <p className="font-semibold text-slate-900">{expense.taxDeductible ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(expense.status)}>{expense.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Tax Tab */}
          <TabsContent value="tax" className="space-y-4">
            {taxCompliance.map((tax) => (
              <Card key={tax.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{tax.type}</h3>
                        <p className="text-sm text-slate-600">{tax.jurisdiction}</p>
                      </div>
                      <Badge className={getStatusColor(tax.status)}>{tax.status}</Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Amount Due</p>
                        <p className="font-semibold text-slate-900">${tax.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Due Date</p>
                        <p className="font-semibold text-slate-900">{tax.dueDate}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Last Filed</p>
                        <p className="font-semibold text-slate-900">{tax.lastFiled}</p>
                      </div>
                      <div>
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            {financialReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{report.name}</h3>
                        <p className="text-sm text-slate-600">{report.period}</p>
                      </div>
                      <Badge variant="outline">{report.type}</Badge>
                    </div>

                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Revenue</p>
                        <p className="font-semibold text-green-600">${(report.revenue / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Expenses</p>
                        <p className="font-semibold text-red-600">${(report.expenses / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Profit</p>
                        <p className="font-semibold text-blue-600">${(report.profit / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Margin</p>
                        <p className="font-semibold text-slate-900">{report.profitMargin}%</p>
                      </div>
                      <div>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Accounting Tab */}
          <TabsContent value="accounting" className="space-y-4">
            {accountingIntegrations.map((integration) => (
              <Card key={integration.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{integration.name}</h3>
                        <p className="text-sm text-slate-600">{integration.type}</p>
                      </div>
                      <Badge className={getStatusColor(integration.status)}>{integration.status}</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Last Sync</p>
                        <p className="font-semibold text-slate-900">{integration.lastSync}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Frequency</p>
                        <p className="font-semibold text-slate-900">{integration.syncFrequency}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Data Synced</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {integration.dataSync.map((data) => (
                            <Badge key={data} variant="outline" className="text-xs">
                              {data}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      {integration.status === 'connected' ? 'Manage' : 'Connect'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Currency Tab */}
          <TabsContent value="currency" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-slate-600">From</th>
                    <th className="text-left py-3 px-4 text-slate-600">To</th>
                    <th className="text-right py-3 px-4 text-slate-600">Exchange Rate</th>
                    <th className="text-left py-3 px-4 text-slate-600">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {currencyRates.map((rate, idx) => (
                    <tr key={idx} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{rate.from}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{rate.to}</td>
                      <td className="text-right py-3 px-4 font-mono text-slate-900">1 {rate.from} = {rate.rate} {rate.to}</td>
                      <td className="py-3 px-4 text-slate-600">{rate.lastUpdated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

