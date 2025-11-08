/**
 * Advanced Reporting Dashboard
 * Custom report builder, scheduled reports, data visualization, executive intelligence
 */

import { EventEmitter } from 'events';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'sales' | 'team' | 'custom';
  metrics: string[];
  filters: Record<string, unknown>;
  visualization: 'table' | 'chart' | 'combined';
  createdAt: Date;
}

export interface ScheduledReport {
  id: string;
  templateId: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  format: 'pdf' | 'excel' | 'html' | 'email';
  nextRun: Date;
  lastRun?: Date;
  enabled: boolean;
}

export interface ReportExecution {
  id: string;
  templateId: string;
  executedAt: Date;
  completedAt?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  rowsProcessed: number;
  error?: string;
  fileUrl?: string;
}

export interface CustomMetric {
  id: string;
  name: string;
  formula: string;
  dataSource: string;
  unit: string;
  refreshInterval: number; // minutes
  lastUpdated: Date;
  value: number;
}

class AdvancedReportingDashboard extends EventEmitter {
  private reportTemplates: Map<string, ReportTemplate> = new Map();
  private scheduledReports: Map<string, ScheduledReport> = new Map();
  private reportExecutions: Map<string, ReportExecution> = new Map();
  private customMetrics: Map<string, CustomMetric> = new Map();
  private dashboardConfigs: Map<string, any> = new Map();

  constructor() {
    super();
    this.initializeDefaultTemplates();
    this.startScheduledReports();
  }

  /**
   * Initialize default report templates
   */
  private initializeDefaultTemplates(): void {
    const templates: ReportTemplate[] = [
      {
        id: 'template-revenue',
        name: 'Revenue Summary',
        description: 'Monthly revenue, growth, and projections',
        category: 'financial',
        metrics: ['total_revenue', 'revenue_growth', 'projected_revenue'],
        filters: {},
        visualization: 'combined',
        createdAt: new Date(),
      },
      {
        id: 'template-team-performance',
        name: 'Team Performance',
        description: 'Team productivity, efficiency, and satisfaction',
        category: 'team',
        metrics: ['projects_completed', 'avg_project_time', 'team_satisfaction'],
        filters: {},
        visualization: 'chart',
        createdAt: new Date(),
      },
      {
        id: 'template-sales-pipeline',
        name: 'Sales Pipeline',
        description: 'Quote conversion, pipeline value, and forecast',
        category: 'sales',
        metrics: ['quotes_sent', 'acceptance_rate', 'pipeline_value'],
        filters: {},
        visualization: 'combined',
        createdAt: new Date(),
      },
      {
        id: 'template-operational',
        name: 'Operational Metrics',
        description: 'Project efficiency, resource utilization, quality',
        category: 'operational',
        metrics: ['project_efficiency', 'resource_utilization', 'quality_score'],
        filters: {},
        visualization: 'table',
        createdAt: new Date(),
      },
    ];

    templates.forEach((template) => {
      this.reportTemplates.set(template.id, template);
    });

    console.log('[AdvancedReporting] Default report templates initialized');
  }

  /**
   * Start scheduled report execution
   */
  private startScheduledReports(): void {
    // Check schedules every hour
    setInterval(() => {
      this.executeScheduledReports();
    }, 60 * 60 * 1000);

    console.log('[AdvancedReporting] Scheduled report executor started');
  }

  /**
   * Execute scheduled reports
   */
  private executeScheduledReports(): void {
    const now = new Date();

    for (const report of this.scheduledReports.values()) {
      if (!report.enabled || !report.nextRun || report.nextRun > now) {
        continue;
      }

      this.executeReport(report.templateId, report.id);

      // Update next run time
      switch (report.frequency) {
        case 'daily':
          report.nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          report.nextRun = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          report.nextRun = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarterly':
          report.nextRun = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
          break;
      }
    }
  }

  /**
   * Create custom report template
   */
  public createReportTemplate(
    name: string,
    description: string,
    category: 'financial' | 'operational' | 'sales' | 'team' | 'custom',
    metrics: string[],
    visualization: 'table' | 'chart' | 'combined'
  ): string {
    const templateId = `template-${Date.now()}`;
    const template: ReportTemplate = {
      id: templateId,
      name,
      description,
      category,
      metrics,
      filters: {},
      visualization,
      createdAt: new Date(),
    };

    this.reportTemplates.set(templateId, template);
    this.emit('template:created', template);

    console.log(`[AdvancedReporting] Report template created: ${templateId}`);

    return templateId;
  }

  /**
   * Get report template
   */
  public getReportTemplate(templateId: string): ReportTemplate | null {
    return this.reportTemplates.get(templateId) || null;
  }

  /**
   * List report templates
   */
  public listReportTemplates(category?: string): ReportTemplate[] {
    let templates = Array.from(this.reportTemplates.values());

    if (category) {
      templates = templates.filter((t) => t.category === category);
    }

    return templates;
  }

  /**
   * Schedule report execution
   */
  public scheduleReport(
    templateId: string,
    name: string,
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly',
    recipients: string[],
    format: 'pdf' | 'excel' | 'html' | 'email' = 'email'
  ): string {
    const reportId = `scheduled-${Date.now()}`;
    const scheduledReport: ScheduledReport = {
      id: reportId,
      templateId,
      name,
      frequency,
      recipients,
      format,
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
      enabled: true,
    };

    this.scheduledReports.set(reportId, scheduledReport);
    this.emit('report:scheduled', scheduledReport);

    console.log(`[AdvancedReporting] Report scheduled: ${reportId}`);

    return reportId;
  }

  /**
   * Execute report
   */
  public async executeReport(templateId: string, scheduledReportId?: string): Promise<string> {
    const executionId = `exec-${Date.now()}`;
    const template = this.reportTemplates.get(templateId);

    if (!template) {
      throw new Error(`Report template not found: ${templateId}`);
    }

    const execution: ReportExecution = {
      id: executionId,
      templateId,
      executedAt: new Date(),
      status: 'running',
      rowsProcessed: 0,
    };

    this.reportExecutions.set(executionId, execution);
    this.emit('report:started', execution);

    try {
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      execution.status = 'completed';
      execution.completedAt = new Date();
      execution.rowsProcessed = Math.floor(Math.random() * 10000) + 1000;
      execution.fileUrl = `https://reports.example.com/${executionId}.pdf`;

      this.emit('report:completed', execution);

      console.log(
        `[AdvancedReporting] Report executed: ${executionId} (${execution.rowsProcessed} rows)`
      );

      return executionId;
    } catch (error) {
      execution.status = 'failed';
      execution.error = String(error);

      this.emit('report:failed', execution);

      console.error(`[AdvancedReporting] Report execution failed: ${executionId}`, error);

      throw error;
    }
  }

  /**
   * Get report execution
   */
  public getReportExecution(executionId: string): ReportExecution | null {
    return this.reportExecutions.get(executionId) || null;
  }

  /**
   * List report executions
   */
  public listReportExecutions(templateId?: string, limit: number = 50): ReportExecution[] {
    let executions = Array.from(this.reportExecutions.values());

    if (templateId) {
      executions = executions.filter((e) => e.templateId === templateId);
    }

    return executions
      .sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime())
      .slice(0, limit);
  }

  /**
   * Create custom metric
   */
  public createCustomMetric(
    name: string,
    formula: string,
    dataSource: string,
    unit: string,
    refreshInterval: number = 60
  ): string {
    const metricId = `metric-${Date.now()}`;
    const metric: CustomMetric = {
      id: metricId,
      name,
      formula,
      dataSource,
      unit,
      refreshInterval,
      lastUpdated: new Date(),
      value: Math.floor(Math.random() * 10000),
    };

    this.customMetrics.set(metricId, metric);
    this.emit('metric:created', metric);

    console.log(`[AdvancedReporting] Custom metric created: ${metricId}`);

    return metricId;
  }

  /**
   * Get custom metric
   */
  public getCustomMetric(metricId: string): CustomMetric | null {
    return this.customMetrics.get(metricId) || null;
  }

  /**
   * List custom metrics
   */
  public listCustomMetrics(): CustomMetric[] {
    return Array.from(this.customMetrics.values());
  }

  /**
   * Create dashboard configuration
   */
  public createDashboard(
    name: string,
    description: string,
    widgets: Array<{ type: string; templateId?: string; metricId?: string; position: number }>
  ): string {
    const dashboardId = `dashboard-${Date.now()}`;
    const config = {
      id: dashboardId,
      name,
      description,
      widgets,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.dashboardConfigs.set(dashboardId, config);
    this.emit('dashboard:created', config);

    console.log(`[AdvancedReporting] Dashboard created: ${dashboardId}`);

    return dashboardId;
  }

  /**
   * Get dashboard configuration
   */
  public getDashboard(dashboardId: string): any {
    return this.dashboardConfigs.get(dashboardId) || null;
  }

  /**
   * Get reporting statistics
   */
  public getStatistics() {
    const completedReports = Array.from(this.reportExecutions.values()).filter(
      (e) => e.status === 'completed'
    );
    const totalRowsProcessed = completedReports.reduce((sum, e) => sum + e.rowsProcessed, 0);

    return {
      totalTemplates: this.reportTemplates.size,
      scheduledReports: this.scheduledReports.size,
      totalExecutions: this.reportExecutions.size,
      completedExecutions: completedReports.length,
      totalRowsProcessed,
      customMetrics: this.customMetrics.size,
      dashboards: this.dashboardConfigs.size,
      timestamp: new Date(),
    };
  }
}

// Export singleton instance
export const advancedReportingDashboard = new AdvancedReportingDashboard();

