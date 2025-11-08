/**
 * Export & Reporting Page
 * PDF/CSV export for pricing reports, chatbot transcripts, and marketplace analytics
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Download,
  FileText,
  BarChart3,
  MessageSquare,
  Calendar,
  Filter,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

type ReportType = 'pricing' | 'chatbot' | 'marketplace' | 'compliance';
type ExportFormat = 'pdf' | 'csv' | 'json';

interface ReportConfig {
  type: ReportType;
  format: ExportFormat;
  dateRange: {
    start: Date;
    end: Date;
  };
  includeCharts: boolean;
  includeSummary: boolean;
  includeDetails: boolean;
}

export default function ExportReports() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('pricing');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const metricsQuery = trpc.advancedFeatures.pricing.getMetrics.useQuery();
  const forecastQuery = trpc.advancedFeatures.pricing.getRevenueForecast.useQuery({
    months: 12,
  });

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Simulate export process
      const reportData = {
        type: selectedReport,
        format: exportFormat,
        dateRange: { start: startDate, end: endDate },
        includeCharts,
        includeSummary,
        includeDetails,
        generatedAt: new Date().toISOString(),
      };

      // Create mock data based on report type
      let content = '';

      switch (selectedReport) {
        case 'pricing':
          content = generatePricingReport(reportData);
          break;
        case 'chatbot':
          content = generateChatbotReport(reportData);
          break;
        case 'marketplace':
          content = generateMarketplaceReport(reportData);
          break;
        case 'compliance':
          content = generateComplianceReport(reportData);
          break;
      }

      // Create download
      downloadReport(content, `${selectedReport}-report.${exportFormat}`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const generatePricingReport = (config: any) => {
    const lines = [
      'PRICING ANALYTICS REPORT',
      `Generated: ${new Date().toLocaleDateString()}`,
      `Period: ${config.dateRange.start} to ${config.dateRange.end}`,
      '',
      'EXECUTIVE SUMMARY',
      '================',
      'Average Profit Margin: 28%',
      'Quote Acceptance Rate: 72%',
      'Average Project Value: $18,500',
      'Total Revenue (12mo): $450,000',
      'Projected Revenue (12mo): $517,500',
      '',
      'KEY METRICS',
      '===========',
      'ML Model Accuracy: 94%',
      'Competitive Position: Competitive',
      'Market Demand: High',
      'Seasonal Factor: 1.15x (Autumn/Winter)',
      '',
      'RECOMMENDATIONS',
      '================',
      '1. Increase prices by 5-10% - Acceptance rate indicates underpricing',
      '2. Focus on high-complexity projects - 35% higher margins',
      '3. Implement seasonal pricing strategy',
      '4. Monitor competitor pricing monthly',
      '',
      'REVENUE FORECAST (12 MONTHS)',
      '============================',
      'Month 1: $38,500',
      'Month 2: $39,200',
      'Month 3: $40,100',
      'Month 4: $41,200',
      'Month 5: $42,500',
      'Month 6: $43,800',
      'Month 7: $45,200',
      'Month 8: $46,800',
      'Month 9: $48,500',
      'Month 10: $50,200',
      'Month 11: $52,100',
      'Month 12: $54,100',
    ];

    return lines.join('\n');
  };

  const generateChatbotReport = (config: any) => {
    const lines = [
      'CHATBOT SUPPORT ANALYTICS REPORT',
      `Generated: ${new Date().toLocaleDateString()}`,
      `Period: ${config.dateRange.start} to ${config.dateRange.end}`,
      '',
      'EXECUTIVE SUMMARY',
      '================',
      'Total Conversations: 342',
      'Average Resolution Time: 4.2 minutes',
      'Customer Satisfaction: 4.6/5.0',
      'Escalation Rate: 12%',
      'Support Ticket Reduction: 38%',
      '',
      'CONVERSATION METRICS',
      '====================',
      'Total Messages: 2,847',
      'Average Messages per Chat: 8.3',
      'Peak Hours: 9-11 AM, 2-4 PM',
      'Most Common Topics: Pricing (28%), Features (22%), Technical (18%)',
      '',
      'SENTIMENT ANALYSIS',
      '==================',
      'Positive Sentiment: 65%',
      'Neutral Sentiment: 28%',
      'Negative Sentiment: 7%',
      '',
      'TOP QUESTIONS',
      '==============',
      '1. How much does Venturr cost? (94 times)',
      '2. How do I create a quote? (67 times)',
      '3. Can I integrate with my CRM? (54 times)',
      '4. What is the measurement tool? (48 times)',
      '5. How do I export reports? (42 times)',
      '',
      'RECOMMENDATIONS',
      '================',
      '1. Add FAQ section for top 5 questions',
      '2. Improve chatbot training on pricing topics',
      '3. Create video tutorials for common workflows',
      '4. Implement proactive support for high-value users',
    ];

    return lines.join('\n');
  };

  const generateMarketplaceReport = (config: any) => {
    const lines = [
      'MARKETPLACE ANALYTICS REPORT',
      `Generated: ${new Date().toLocaleDateString()}`,
      `Period: ${config.dateRange.start} to ${config.dateRange.end}`,
      '',
      'MARKETPLACE OVERVIEW',
      '====================',
      'Total Apps: 12',
      'Total Installations: 342',
      'Average App Rating: 4.6/5.0',
      'Total Revenue: $45,000',
      'Monthly Active Users: 890',
      '',
      'APP PERFORMANCE',
      '================',
      'Top Apps by Installs:',
      '1. Zapier - 89 installs',
      '2. Slack - 76 installs',
      '3. Salesforce - 62 installs',
      '4. Xero - 58 installs',
      '5. Microsoft Teams - 45 installs',
      '',
      'Top Apps by Rating:',
      '1. Zapier - 4.9/5.0 (45 reviews)',
      '2. Slack - 4.7/5.0 (38 reviews)',
      '3. Xero - 4.6/5.0 (32 reviews)',
      '',
      'CATEGORY BREAKDOWN',
      '==================',
      'Automation: 4 apps (98 installs)',
      'Communication: 3 apps (121 installs)',
      'CRM: 2 apps (62 installs)',
      'Accounting: 2 apps (58 installs)',
      'Analytics: 1 app (3 installs)',
      '',
      'REVENUE ANALYSIS',
      '=================',
      'Free Apps Revenue: $0',
      'Paid Apps Revenue: $45,000',
      'Average Revenue per App: $3,750',
      'Top Revenue Generator: Zapier ($12,500)',
    ];

    return lines.join('\n');
  };

  const generateComplianceReport = (config: any) => {
    const lines = [
      'COMPLIANCE & AUDIT REPORT',
      `Generated: ${new Date().toLocaleDateString()}`,
      `Period: ${config.dateRange.start} to ${config.dateRange.end}`,
      '',
      'COMPLIANCE CHECKLIST',
      '====================',
      '✓ Data Privacy: GDPR Compliant',
      '✓ Security: SSL/TLS Encryption Enabled',
      '✓ Backup: Daily Automated Backups',
      '✓ Access Control: Role-Based Access',
      '✓ Audit Logging: All Actions Logged',
      '✓ Incident Response: Plan in Place',
      '',
      'DATA SECURITY',
      '=============',
      'Encryption Standard: AES-256',
      'Database Backups: Daily',
      'Backup Retention: 90 days',
      'Disaster Recovery: Tested Monthly',
      'Uptime: 99.98%',
      '',
      'USER MANAGEMENT',
      '================',
      'Total Users: 1,250',
      'Active Users (30d): 890',
      'New Users (30d): 145',
      'Inactive Users: 215',
      '',
      'AUDIT TRAIL',
      '===========',
      'Total Actions Logged: 45,892',
      'User Logins: 12,450',
      'Data Modifications: 8,234',
      'Report Exports: 2,156',
      'Admin Actions: 892',
      '',
      'RECOMMENDATIONS',
      '================',
      '1. Review user access quarterly',
      '2. Conduct security audit annually',
      '3. Update incident response plan',
      '4. Implement multi-factor authentication',
    ];

    return lines.join('\n');
  };

  const downloadReport = (content: string, filename: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8 relative">
      {/* Futuristic Chequered Background */}
      <div className="background-glow fixed inset-0 z-0" />

      <div className="relative z-2 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Export & Reports</h1>
              <p className="text-gray-600 mt-1">Generate and export data in multiple formats</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Selection */}
          <div className="lg:col-span-1">
            <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6 sticky top-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Select Report</h2>
              <div className="space-y-2">
                {(['pricing', 'chatbot', 'marketplace', 'compliance'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedReport(type)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedReport === type
                        ? 'bg-indigo-100 text-indigo-900 border-2 border-indigo-300'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="font-medium capitalize">{type} Report</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {type === 'pricing' && 'Analytics & forecasts'}
                      {type === 'chatbot' && 'Support metrics'}
                      {type === 'marketplace' && 'App analytics'}
                      {type === 'compliance' && 'Audit trail'}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Export Configuration */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Export Configuration</h2>

              {/* Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Export Format
                </label>
                <div className="flex gap-3">
                  {(['pdf', 'csv', 'json'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => setExportFormat(format)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        exportFormat === format
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={includeSummary}
                    onCheckedChange={(checked) =>
                      setIncludeSummary(checked as boolean)
                    }
                  />
                  <span className="text-sm text-gray-700">Include Executive Summary</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={includeCharts}
                    onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                  />
                  <span className="text-sm text-gray-700">Include Charts & Visualizations</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={includeDetails}
                    onCheckedChange={(checked) =>
                      setIncludeDetails(checked as boolean)
                    }
                  />
                  <span className="text-sm text-gray-700">Include Detailed Data</span>
                </label>
              </div>

              {/* Export Button */}
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700"
              >
                {isExporting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Export {selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)}{' '}
                    Report
                  </>
                )}
              </Button>
            </Card>

            {/* Report Preview */}
            <Card className="backdrop-blur-xl bg-white/95 border-white/20 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Report Preview</h2>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                  {selectedReport === 'pricing' &&
                    generatePricingReport({
                      dateRange: { start: startDate, end: endDate },
                    }).split('\n').slice(0, 15).join('\n')}
                  {selectedReport === 'chatbot' &&
                    generateChatbotReport({
                      dateRange: { start: startDate, end: endDate },
                    }).split('\n').slice(0, 15).join('\n')}
                  {selectedReport === 'marketplace' &&
                    generateMarketplaceReport({
                      dateRange: { start: startDate, end: endDate },
                    }).split('\n').slice(0, 15).join('\n')}
                  {selectedReport === 'compliance' &&
                    generateComplianceReport({
                      dateRange: { start: startDate, end: endDate },
                    }).split('\n').slice(0, 15).join('\n')}
                  ...
                </pre>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

