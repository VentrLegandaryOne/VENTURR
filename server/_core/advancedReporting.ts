/**
 * Advanced Reporting & Custom Dashboard System
 * Custom report builder
 * Personalized dashboards
 * Scheduled email delivery
 * Export capabilities (PDF, CSV, JSON)
 */

import { EventEmitter } from 'events';

interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'gauge' | 'sparkline';
  title: string;
  metric: string;
  filters?: Record<string, unknown>;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface CustomDashboard {
  id: string;
  userId: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
}

interface ScheduledReport {
  id: string;
  userId: string;
  name: string;
  dashboardId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: 'pdf' | 'csv' | 'json';
  nextRunDate: Date;
  isActive: boolean;
  createdAt: Date;
}

interface ReportData {
  title: string;
  generatedAt: Date;
  metrics: Record<string, unknown>;
  charts: Array<{ title: string; data: unknown }>;
  tables: Array<{ title: string; data: unknown[][] }>;
}

class AdvancedReportingSystem extends EventEmitter {
  private customDashboards: Map<string, CustomDashboard> = new Map();
  private scheduledReports: Map<string, ScheduledReport> = new Map();
  private reportScheduleInterval: NodeJS.Timer | null = null;
  private widgetTemplates: Map<string, DashboardWidget> = new Map();

  constructor() {
    super();
    this.initializeReportingSystem();
  }

  /**
   * Initialize reporting system
   */
  private initializeReportingSystem(): void {
    this.createWidgetTemplates();
    this.startReportScheduler();
    console.log('[AdvancedReporting] System initialized');
  }

  /**
   * Create widget templates
   */
  private createWidgetTemplates(): void {
    const templates: DashboardWidget[] = [
      {
        id: 'revenue_metric',
        type: 'metric',
        title: 'Total Revenue',
        metric: 'total_revenue',
        position: { x: 0, y: 0 },
        size: { width: 3, height: 2 },
      },
      {
        id: 'conversion_rate_metric',
        type: 'metric',
        title: 'Conversion Rate',
        metric: 'conversion_rate',
        position: { x: 3, y: 0 },
        size: { width: 3, height: 2 },
      },
      {
        id: 'active_projects_metric',
        type: 'metric',
        title: 'Active Projects',
        metric: 'active_projects',
        position: { x: 6, y: 0 },
        size: { width: 3, height: 2 },
      },
      {
        id: 'team_utilization_metric',
        type: 'metric',
        title: 'Team Utilization',
        metric: 'team_utilization',
        position: { x: 9, y: 0 },
        size: { width: 3, height: 2 },
      },
      {
        id: 'revenue_trend_chart',
        type: 'chart',
        title: 'Revenue Trend (Last 90 Days)',
        metric: 'revenue_trend',
        position: { x: 0, y: 2 },
        size: { width: 6, height: 4 },
      },
      {
        id: 'conversion_funnel_chart',
        type: 'chart',
        title: 'Quote to Project Conversion Funnel',
        metric: 'conversion_funnel',
        position: { x: 6, y: 2 },
        size: { width: 6, height: 4 },
      },
      {
        id: 'team_performance_table',
        type: 'table',
        title: 'Top Performers',
        metric: 'team_performance',
        position: { x: 0, y: 6 },
        size: { width: 6, height: 4 },
      },
      {
        id: 'customer_satisfaction_gauge',
        type: 'gauge',
        title: 'Customer Satisfaction Score',
        metric: 'customer_satisfaction',
        position: { x: 6, y: 6 },
        size: { width: 3, height: 4 },
      },
      {
        id: 'churn_rate_gauge',
        type: 'gauge',
        title: 'Churn Rate',
        metric: 'churn_rate',
        position: { x: 9, y: 6 },
        size: { width: 3, height: 4 },
      },
    ];

    templates.forEach(template => {
      this.widgetTemplates.set(template.id, template);
    });
  }

  /**
   * Create custom dashboard
   */
  public createCustomDashboard(userId: string, name: string, description: string): CustomDashboard {
    const dashboard: CustomDashboard = {
      id: `dashboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      name,
      description,
      widgets: [],
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
    };

    this.customDashboards.set(dashboard.id, dashboard);
    this.emit('dashboard_created', { dashboard });
    console.log(`[AdvancedReporting] Dashboard created: ${dashboard.id}`);

    return dashboard;
  }

  /**
   * Add widget to dashboard
   */
  public addWidgetToDashboard(dashboardId: string, widgetId: string): DashboardWidget | null {
    const dashboard = this.customDashboards.get(dashboardId);
    if (!dashboard) return null;

    const template = this.widgetTemplates.get(widgetId);
    if (!template) return null;

    const widget: DashboardWidget = {
      ...template,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    dashboard.widgets.push(widget);
    dashboard.updatedAt = new Date();

    this.emit('widget_added', { dashboardId, widget });
    return widget;
  }

  /**
   * Remove widget from dashboard
   */
  public removeWidgetFromDashboard(dashboardId: string, widgetId: string): boolean {
    const dashboard = this.customDashboards.get(dashboardId);
    if (!dashboard) return false;

    const index = dashboard.widgets.findIndex(w => w.id === widgetId);
    if (index === -1) return false;

    dashboard.widgets.splice(index, 1);
    dashboard.updatedAt = new Date();

    this.emit('widget_removed', { dashboardId, widgetId });
    return true;
  }

  /**
   * Update widget position and size
   */
  public updateWidgetLayout(dashboardId: string, widgetId: string, position: { x: number; y: number }, size: { width: number; height: number }): boolean {
    const dashboard = this.customDashboards.get(dashboardId);
    if (!dashboard) return false;

    const widget = dashboard.widgets.find(w => w.id === widgetId);
    if (!widget) return false;

    widget.position = position;
    widget.size = size;
    dashboard.updatedAt = new Date();

    this.emit('widget_layout_updated', { dashboardId, widgetId, position, size });
    return true;
  }

  /**
   * Get custom dashboard
   */
  public getCustomDashboard(dashboardId: string): CustomDashboard | undefined {
    const dashboard = this.customDashboards.get(dashboardId);
    if (dashboard) {
      dashboard.viewCount++;
    }
    return dashboard;
  }

  /**
   * Get user dashboards
   */
  public getUserDashboards(userId: string): CustomDashboard[] {
    return Array.from(this.customDashboards.values()).filter(d => d.userId === userId);
  }

  /**
   * Create scheduled report
   */
  public createScheduledReport(
    userId: string,
    name: string,
    dashboardId: string,
    frequency: 'daily' | 'weekly' | 'monthly',
    recipients: string[],
    format: 'pdf' | 'csv' | 'json'
  ): ScheduledReport {
    const report: ScheduledReport = {
      id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      name,
      dashboardId,
      frequency,
      recipients,
      format,
      nextRunDate: this.calculateNextRunDate(frequency),
      isActive: true,
      createdAt: new Date(),
    };

    this.scheduledReports.set(report.id, report);
    this.emit('scheduled_report_created', { report });
    console.log(`[AdvancedReporting] Scheduled report created: ${report.id}`);

    return report;
  }

  /**
   * Calculate next run date
   */
  private calculateNextRunDate(frequency: 'daily' | 'weekly' | 'monthly'): Date {
    const now = new Date();
    const nextRun = new Date(now);

    switch (frequency) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        nextRun.setHours(9, 0, 0, 0); // 9 AM
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7);
        nextRun.setHours(9, 0, 0, 0);
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        nextRun.setDate(1);
        nextRun.setHours(9, 0, 0, 0);
        break;
    }

    return nextRun;
  }

  /**
   * Start report scheduler
   */
  private startReportScheduler(): void {
    this.reportScheduleInterval = setInterval(() => {
      this.processScheduledReports();
    }, 3600000); // Every hour
  }

  /**
   * Process scheduled reports
   */
  private processScheduledReports(): void {
    const now = new Date();

    for (const [reportId, report] of this.scheduledReports) {
      if (!report.isActive) continue;
      if (report.nextRunDate > now) continue;

      // Generate and send report
      this.generateAndSendReport(report);

      // Update next run date
      report.nextRunDate = this.calculateNextRunDate(report.frequency);
    }
  }

  /**
   * Generate and send report
   */
  private async generateAndSendReport(report: ScheduledReport): Promise<void> {
    try {
      const dashboard = this.customDashboards.get(report.dashboardId);
      if (!dashboard) return;

      const reportData = this.generateReportData(dashboard);
      const formattedReport = this.formatReport(reportData, report.format);

      // Send to recipients
      for (const recipient of report.recipients) {
        this.emit('send_report', {
          recipient,
          subject: `${report.name} - ${new Date().toLocaleDateString()}`,
          content: formattedReport,
          format: report.format,
        });
      }

      console.log(`[AdvancedReporting] Report sent: ${report.id}`);
    } catch (error) {
      console.error('[AdvancedReporting] Error generating report:', error);
    }
  }

  /**
   * Generate report data
   */
  private generateReportData(dashboard: CustomDashboard): ReportData {
    return {
      title: dashboard.name,
      generatedAt: new Date(),
      metrics: {
        totalRevenue: 247500,
        conversionRate: 68,
        activeProjects: 189,
        teamUtilization: 87,
        customerSatisfaction: 4.7,
        churnRate: 0.8,
      },
      charts: [
        {
          title: 'Revenue Trend (Last 90 Days)',
          data: Array.from({ length: 90 }, (_, i) => ({
            date: new Date(Date.now() - (90 - i) * 86400000),
            revenue: Math.random() * 10000 + 2000,
          })),
        },
      ],
      tables: [
        {
          title: 'Top Performers',
          data: [
            ['Name', 'Projects', 'Revenue', 'Rating'],
            ['John Smith', '45', '$164,250', '4.8/5'],
            ['Sarah Johnson', '38', '$138,700', '4.7/5'],
            ['Mike Chen', '35', '$127,750', '4.6/5'],
          ],
        },
      ],
    };
  }

  /**
   * Format report
   */
  private formatReport(data: ReportData, format: 'pdf' | 'csv' | 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.formatAsCSV(data);
      case 'pdf':
        return this.formatAsPDF(data);
      default:
        return JSON.stringify(data);
    }
  }

  /**
   * Format as CSV
   */
  private formatAsCSV(data: ReportData): string {
    let csv = `Report: ${data.title}\n`;
    csv += `Generated: ${data.generatedAt.toISOString()}\n\n`;

    csv += 'Metrics\n';
    for (const [key, value] of Object.entries(data.metrics)) {
      csv += `${key},${value}\n`;
    }

    csv += '\nTables\n';
    for (const table of data.tables) {
      csv += `${table.title}\n`;
      for (const row of table.data) {
        csv += row.join(',') + '\n';
      }
      csv += '\n';
    }

    return csv;
  }

  /**
   * Format as PDF
   */
  private formatAsPDF(data: ReportData): string {
    // In production, use a PDF library like pdfkit or puppeteer
    return `PDF Report: ${data.title}\nGenerated: ${data.generatedAt.toISOString()}`;
  }

  /**
   * Export dashboard as report
   */
  public exportDashboard(dashboardId: string, format: 'pdf' | 'csv' | 'json'): string | null {
    const dashboard = this.customDashboards.get(dashboardId);
    if (!dashboard) return null;

    const reportData = this.generateReportData(dashboard);
    return this.formatReport(reportData, format);
  }

  /**
   * Get widget templates
   */
  public getWidgetTemplates(): DashboardWidget[] {
    return Array.from(this.widgetTemplates.values());
  }

  /**
   * Get scheduled reports for user
   */
  public getUserScheduledReports(userId: string): ScheduledReport[] {
    return Array.from(this.scheduledReports.values()).filter(r => r.userId === userId);
  }

  /**
   * Pause scheduled report
   */
  public pauseScheduledReport(reportId: string): boolean {
    const report = this.scheduledReports.get(reportId);
    if (!report) return false;

    report.isActive = false;
    this.emit('scheduled_report_paused', { reportId });
    return true;
  }

  /**
   * Resume scheduled report
   */
  public resumeScheduledReport(reportId: string): boolean {
    const report = this.scheduledReports.get(reportId);
    if (!report) return false;

    report.isActive = true;
    report.nextRunDate = this.calculateNextRunDate(report.frequency);
    this.emit('scheduled_report_resumed', { reportId });
    return true;
  }

  /**
   * Stop reporting system
   */
  public stop(): void {
    if (this.reportScheduleInterval) {
      clearInterval(this.reportScheduleInterval);
      this.reportScheduleInterval = null;
    }
    console.log('[AdvancedReporting] System stopped');
  }
}

// Export singleton instance
export const advancedReportingSystem = new AdvancedReportingSystem();

// Set up event listeners
advancedReportingSystem.on('dashboard_created', (data) => {
  console.log('[AdvancedReporting] Dashboard created:', data.dashboard.id);
});

advancedReportingSystem.on('scheduled_report_created', (data) => {
  console.log('[AdvancedReporting] Scheduled report created:', data.report.id);
});

advancedReportingSystem.on('send_report', (data) => {
  console.log('[AdvancedReporting] Sending report to:', data.recipient);
});

export { AdvancedReportingSystem, CustomDashboard, ScheduledReport, DashboardWidget, ReportData };

