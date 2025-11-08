import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Send,
} from "lucide-react";

export default function FinancialManagement() {
  const { user } = useAuth();
  const [organizationId] = useState(user?.organizationId || "");
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  // Fetch financial data
  const { data: statsData } = trpc.financial.stats.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );

  const { data: invoicesData, isLoading: invoicesLoading } = trpc.financial.invoices.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );

  const { data: expensesData, isLoading: expensesLoading } = trpc.financial.expenses.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );

  const { data: reportsData } = trpc.financial.reports.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );

  const { data: insightsData } = trpc.financial.insights.list.useQuery(
    { organizationId },
    { enabled: !!organizationId }
  );

  const stats = statsData?.data;
  const invoices = invoicesData?.data || [];
  const expenses = expensesData?.data || [];
  const reports = reportsData?.data || [];
  const insights = insightsData?.data || [];

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getExpenseCategoryColor = (category: string) => {
    switch (category) {
      case "materials":
        return "bg-orange-100 text-orange-800";
      case "labor":
        return "bg-purple-100 text-purple-800";
      case "equipment":
        return "bg-blue-100 text-blue-800";
      case "travel":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Financial Management</h1>
          <p className="text-slate-600">Track invoices, expenses, and financial health</p>
        </div>

        {/* KEY METRICS */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">${stats.totalRevenue}</p>
                <p className="text-xs text-green-600 mt-1">↑ All invoices</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">${stats.totalExpenses}</p>
                <p className="text-xs text-slate-500 mt-1">{expenses.length} expenses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${parseInt(stats.netProfit) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${stats.netProfit}
                </p>
                <p className="text-xs text-slate-500 mt-1">{stats.profitMargin}% margin</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Unpaid Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">${stats.unpaidAmount}</p>
                <p className="text-xs text-slate-500 mt-1">Outstanding invoices</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Avg Invoice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">${stats.avgInvoiceValue}</p>
                <p className="text-xs text-slate-500 mt-1">{stats.invoiceCount} invoices</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
            <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
            <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
            <TabsTrigger value="insights">Insights ({insights.length})</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          {/* INVOICES TAB */}
          <TabsContent value="invoices" className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Invoices</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Invoice
              </Button>
            </div>

            <div className="space-y-4">
              {invoicesLoading ? (
                <p className="text-slate-600">Loading invoices...</p>
              ) : invoices.length === 0 ? (
                <Card className="bg-slate-50">
                  <CardContent className="pt-6">
                    <p className="text-slate-600">No invoices yet. Create your first invoice!</p>
                  </CardContent>
                </Card>
              ) : (
                invoices.map((invoice) => (
                  <Card
                    key={invoice.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedInvoice === invoice.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setSelectedInvoice(invoice.id)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{invoice.invoiceNumber}</CardTitle>
                          <CardDescription>Created {new Date(invoice.createdAt).toLocaleDateString()}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getInvoiceStatusColor(invoice.status)}>{invoice.status}</Badge>
                          <span className="text-lg font-bold text-slate-900">${invoice.total}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Subtotal</p>
                          <p className="text-lg font-semibold text-slate-900">${invoice.subtotal}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Tax</p>
                          <p className="text-lg font-semibold text-slate-900">${invoice.tax}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Due Date</p>
                          <p className="text-lg font-semibold text-slate-900">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Amount Paid</p>
                          <p className="text-lg font-semibold text-slate-900">${invoice.amountPaid}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="gap-2">
                          <Send className="w-4 h-4" />
                          Send
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* EXPENSES TAB */}
          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Expenses</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Expense
              </Button>
            </div>

            <div className="space-y-4">
              {expensesLoading ? (
                <p className="text-slate-600">Loading expenses...</p>
              ) : expenses.length === 0 ? (
                <Card className="bg-slate-50">
                  <CardContent className="pt-6">
                    <p className="text-slate-600">No expenses recorded yet</p>
                  </CardContent>
                </Card>
              ) : (
                expenses.map((expense) => (
                  <Card key={expense.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{expense.description}</CardTitle>
                          <CardDescription>{new Date(expense.date).toLocaleDateString()}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getExpenseCategoryColor(expense.category)}>
                            {expense.category}
                          </Badge>
                          <span className="text-lg font-bold text-slate-900">${expense.amount}</span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* REPORTS TAB */}
          <TabsContent value="reports" className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Financial Reports</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Generate Report
              </Button>
            </div>

            <div className="space-y-4">
              {reports.length === 0 ? (
                <Card className="bg-slate-50">
                  <CardContent className="pt-6">
                    <p className="text-slate-600">No reports generated yet</p>
                  </CardContent>
                </Card>
              ) : (
                reports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg capitalize">{report.reportType.replace(/_/g, " ")}</CardTitle>
                          <CardDescription>Period: {report.period}</CardDescription>
                        </div>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Revenue</p>
                          <p className="text-2xl font-bold text-green-600">${report.totalRevenue}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Expenses</p>
                          <p className="text-2xl font-bold text-orange-600">${report.totalExpenses}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Net Profit</p>
                          <p className={`text-2xl font-bold ${parseInt(report.netProfit) >= 0 ? "text-green-600" : "text-red-600"}`}>
                            ${report.netProfit}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* INSIGHTS TAB */}
          <TabsContent value="insights" className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">AI-Powered Financial Insights</h2>

            {insights.length === 0 ? (
              <Card className="bg-slate-50">
                <CardContent className="pt-6">
                  <p className="text-slate-600">No insights at this time. Keep your financial data up to date!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <Card
                    key={insight.id}
                    className={`border-l-4 ${
                      insight.severity === "critical"
                        ? "border-l-red-500 bg-red-50"
                        : insight.severity === "warning"
                          ? "border-l-yellow-500 bg-yellow-50"
                          : "border-l-blue-500 bg-blue-50"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {insight.severity === "critical" ? (
                            <AlertCircle className="w-5 h-5 text-red-600 mt-1" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-blue-600 mt-1" />
                          )}
                          <div>
                            <CardTitle className="text-lg">{insight.title}</CardTitle>
                            <CardDescription>{insight.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {insight.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 mb-4">{insight.recommendation}</p>
                      {insight.isActionable === "true" && (
                        <Button size="sm">Take Action</Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* AUTOMATION TAB */}
          <TabsContent value="automation" className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Financial Automation</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Auto-Generate Invoices
                  </CardTitle>
                  <CardDescription>Automatically create invoices from completed projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 mb-4">
                    When a project is marked complete, an invoice is automatically generated from the quote.
                  </p>
                  <Button size="sm" variant="outline">
                    Configure
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    Payment Reminders
                  </CardTitle>
                  <CardDescription>Automatic reminders for overdue invoices</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 mb-4">
                    Send automatic reminders 5 days before due date and when overdue.
                  </p>
                  <Button size="sm" variant="outline">
                    Configure
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    Expense Categorization
                  </CardTitle>
                  <CardDescription>AI-powered automatic expense categorization</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 mb-4">
                    Automatically categorize expenses based on description and history.
                  </p>
                  <Button size="sm" variant="outline">
                    Configure
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    Monthly Reports
                  </CardTitle>
                  <CardDescription>Automatic monthly financial report generation</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 mb-4">
                    Generate and email monthly P&L reports automatically.
                  </p>
                  <Button size="sm" variant="outline">
                    Configure
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

