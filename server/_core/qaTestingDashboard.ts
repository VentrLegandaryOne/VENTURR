/**
 * Quality Assurance & Testing Dashboard
 * Quality metrics, customer satisfaction, defect tracking, automated alerts
 */

import { EventEmitter } from 'events';

export interface QualityMetric {
  id: string;
  projectId: string;
  metric: 'defect_rate' | 'customer_satisfaction' | 'on_time_delivery' | 'rework_rate' | 'quality_score';
  value: number;
  target: number;
  threshold: number; // Alert threshold
  status: 'healthy' | 'warning' | 'critical';
  timestamp: Date;
}

export interface Defect {
  id: string;
  projectId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reportedAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  rootCause?: string;
}

export interface CustomerSatisfactionScore {
  id: string;
  projectId: string;
  score: number; // 1-5
  category: 'quality' | 'timeliness' | 'communication' | 'value' | 'overall';
  feedback: string;
  submittedAt: Date;
}

export interface QAAlert {
  id: string;
  type: 'metric_threshold' | 'defect_spike' | 'satisfaction_drop' | 'rework_increase';
  severity: 'warning' | 'critical';
  title: string;
  description: string;
  affectedMetrics: string[];
  createdAt: Date;
  acknowledged: boolean;
}

class QATestingDashboard extends EventEmitter {
  private qualityMetrics: Map<string, QualityMetric> = new Map();
  private defects: Map<string, Defect> = new Map();
  private satisfactionScores: Map<string, CustomerSatisfactionScore> = new Map();
  private alerts: Map<string, QAAlert> = new Map();
  private metricHistory: Map<string, number[]> = new Map();

  constructor() {
    super();
    this.startQualityMonitoring();
  }

  /**
   * Start quality monitoring
   */
  private startQualityMonitoring(): void {
    // Check quality metrics every hour
    setInterval(() => {
      this.checkQualityThresholds();
      this.detectAnomalies();
    }, 60 * 60 * 1000);

    console.log('[QATesting] Quality monitoring started');
  }

  /**
   * Record quality metric
   */
  public recordMetric(
    projectId: string,
    metric: QualityMetric['metric'],
    value: number,
    target: number,
    threshold: number = target * 0.9
  ): string {
    const metricId = `metric-${Date.now()}`;
    const status = value >= threshold ? 'healthy' : value >= threshold * 0.8 ? 'warning' : 'critical';

    const qualityMetric: QualityMetric = {
      id: metricId,
      projectId,
      metric,
      value,
      target,
      threshold,
      status,
      timestamp: new Date(),
    };

    this.qualityMetrics.set(metricId, qualityMetric);

    // Track history
    const historyKey = `${projectId}-${metric}`;
    if (!this.metricHistory.has(historyKey)) {
      this.metricHistory.set(historyKey, []);
    }
    this.metricHistory.get(historyKey)!.push(value);

    if (status !== 'healthy') {
      this.emit('metric:threshold_exceeded', qualityMetric);
    }

    console.log(`[QATesting] Metric recorded: ${metric} = ${value} (target: ${target})`);

    return metricId;
  }

  /**
   * Get quality metric
   */
  public getMetric(metricId: string): QualityMetric | null {
    return this.qualityMetrics.get(metricId) || null;
  }

  /**
   * List project metrics
   */
  public listProjectMetrics(projectId: string): QualityMetric[] {
    return Array.from(this.qualityMetrics.values())
      .filter((m) => m.projectId === projectId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Report defect
   */
  public reportDefect(
    projectId: string,
    title: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): string {
    const defectId = `defect-${Date.now()}`;
    const defect: Defect = {
      id: defectId,
      projectId,
      title,
      description,
      severity,
      status: 'open',
      reportedAt: new Date(),
    };

    this.defects.set(defectId, defect);
    this.emit('defect:reported', defect);

    console.log(`[QATesting] Defect reported: ${defectId} (${severity})`);

    return defectId;
  }

  /**
   * Get defect
   */
  public getDefect(defectId: string): Defect | null {
    return this.defects.get(defectId) || null;
  }

  /**
   * List project defects
   */
  public listProjectDefects(projectId: string, status?: string): Defect[] {
    let defects = Array.from(this.defects.values()).filter((d) => d.projectId === projectId);

    if (status) {
      defects = defects.filter((d) => d.status === status);
    }

    return defects.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Update defect status
   */
  public updateDefectStatus(defectId: string, newStatus: Defect['status'], rootCause?: string): void {
    const defect = this.defects.get(defectId);
    if (!defect) {
      throw new Error(`Defect not found: ${defectId}`);
    }

    defect.status = newStatus;
    if (newStatus === 'resolved' || newStatus === 'closed') {
      defect.resolvedAt = new Date();
    }
    if (rootCause) {
      defect.rootCause = rootCause;
    }

    this.emit('defect:updated', defect);

    console.log(`[QATesting] Defect updated: ${defectId} (${newStatus})`);
  }

  /**
   * Submit satisfaction score
   */
  public submitSatisfactionScore(
    projectId: string,
    score: number,
    category: 'quality' | 'timeliness' | 'communication' | 'value' | 'overall',
    feedback: string
  ): string {
    const scoreId = `score-${Date.now()}`;
    const satisfactionScore: CustomerSatisfactionScore = {
      id: scoreId,
      projectId,
      score: Math.min(5, Math.max(1, score)),
      category,
      feedback,
      submittedAt: new Date(),
    };

    this.satisfactionScores.set(scoreId, satisfactionScore);
    this.emit('satisfaction:submitted', satisfactionScore);

    console.log(`[QATesting] Satisfaction score submitted: ${scoreId} (${score}/5)`);

    return scoreId;
  }

  /**
   * Get project satisfaction scores
   */
  public getProjectSatisfactionScores(projectId: string): CustomerSatisfactionScore[] {
    return Array.from(this.satisfactionScores.values())
      .filter((s) => s.projectId === projectId)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  /**
   * Check quality thresholds
   */
  private checkQualityThresholds(): void {
    for (const metric of this.qualityMetrics.values()) {
      if (metric.status !== 'healthy') {
        const alertId = `alert-${Date.now()}`;
        const alert: QAAlert = {
          id: alertId,
          type: 'metric_threshold',
          severity: metric.status === 'critical' ? 'critical' : 'warning',
          title: `${metric.metric} threshold exceeded`,
          description: `${metric.metric} is at ${metric.value}, below threshold of ${metric.threshold}`,
          affectedMetrics: [metric.metric],
          createdAt: new Date(),
          acknowledged: false,
        };

        this.alerts.set(alertId, alert);
        this.emit('alert:created', alert);
      }
    }
  }

  /**
   * Detect anomalies in metrics
   */
  private detectAnomalies(): void {
    for (const [key, history] of this.metricHistory.entries()) {
      if (history.length < 3) continue;

      const recent = history.slice(-3);
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const deviation = Math.abs(recent[recent.length - 1] - avg) / avg;

      if (deviation > 0.3) {
        // 30% deviation
        const alertId = `alert-${Date.now()}`;
        const alert: QAAlert = {
          id: alertId,
          type: 'defect_spike',
          severity: 'warning',
          title: 'Metric anomaly detected',
          description: `${key} shows unusual spike with 30%+ deviation`,
          affectedMetrics: [key],
          createdAt: new Date(),
          acknowledged: false,
        };

        this.alerts.set(alertId, alert);
        this.emit('alert:created', alert);
      }
    }
  }

  /**
   * Get alerts
   */
  public getAlerts(unacknowledgedOnly: boolean = false): QAAlert[] {
    let alerts = Array.from(this.alerts.values());

    if (unacknowledgedOnly) {
      alerts = alerts.filter((a) => !a.acknowledged);
    }

    return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Acknowledge alert
   */
  public acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      this.emit('alert:acknowledged', alert);
    }
  }

  /**
   * Get QA statistics
   */
  public getStatistics(projectId?: string) {
    let metrics = Array.from(this.qualityMetrics.values());
    let defects = Array.from(this.defects.values());
    let scores = Array.from(this.satisfactionScores.values());

    if (projectId) {
      metrics = metrics.filter((m) => m.projectId === projectId);
      defects = defects.filter((d) => d.projectId === projectId);
      scores = scores.filter((s) => s.projectId === projectId);
    }

    const avgSatisfaction = scores.length > 0 ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length : 0;
    const openDefects = defects.filter((d) => d.status === 'open').length;
    const criticalDefects = defects.filter((d) => d.severity === 'critical').length;

    return {
      totalMetrics: metrics.length,
      healthyMetrics: metrics.filter((m) => m.status === 'healthy').length,
      warningMetrics: metrics.filter((m) => m.status === 'warning').length,
      criticalMetrics: metrics.filter((m) => m.status === 'critical').length,
      totalDefects: defects.length,
      openDefects,
      criticalDefects,
      avgResolutionTime: 0, // Would calculate from resolved defects
      totalSatisfactionScores: scores.length,
      avgSatisfaction: avgSatisfaction.toFixed(2),
      totalAlerts: this.alerts.size,
      unacknowledgedAlerts: Array.from(this.alerts.values()).filter((a) => !a.acknowledged).length,
      timestamp: new Date(),
    };
  }
}

// Export singleton instance
export const qaTestingDashboard = new QATestingDashboard();

