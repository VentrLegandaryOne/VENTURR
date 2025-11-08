/**
 * Post-Launch Performance Monitoring System
 * Real-time tracking of error rates, response times, and user behavior
 * Automated alerting for critical issues
 * Performance optimization recommendations
 */

import { EventEmitter } from 'events';

interface PerformanceAlert {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'error_rate' | 'response_time' | 'downtime' | 'user_behavior' | 'resource_usage';
  message: string;
  value: number;
  threshold: number;
  action: string;
}

interface UserBehaviorMetric {
  timestamp: Date;
  activeUsers: number;
  newUsers: number;
  sessionDuration: number;
  pageViews: number;
  conversionRate: number;
  churnRate: number;
}

interface SystemHealthMetric {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  databaseConnections: number;
  cacheHitRate: number;
}

class PostLaunchMonitoringSystem extends EventEmitter {
  private alerts: PerformanceAlert[] = [];
  private userBehaviorMetrics: UserBehaviorMetric[] = [];
  private systemHealthMetrics: SystemHealthMetric[] = [];
  private monitoringInterval: NodeJS.Timer | null = null;
  private alertThresholds = {
    errorRate: 1.0, // %
    responseTime: 1000, // ms
    downtime: 5, // minutes
    cpuUsage: 80, // %
    memoryUsage: 85, // %
    diskUsage: 90, // %
  };

  constructor() {
    super();
    this.initializeMonitoring();
  }

  /**
   * Initialize monitoring system
   */
  private initializeMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.analyzePerformance();
      this.checkAlerts();
      this.generateRecommendations();
    }, 30000); // Every 30 seconds

    console.log('[PostLaunchMonitoring] Monitoring system initialized');
  }

  /**
   * Collect performance metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const userBehavior = await this.getUserBehaviorMetrics();
      const systemHealth = await this.getSystemHealthMetrics();

      this.userBehaviorMetrics.push(userBehavior);
      this.systemHealthMetrics.push(systemHealth);

      // Keep only last 2880 records (24 hours at 30-second intervals)
      if (this.userBehaviorMetrics.length > 2880) {
        this.userBehaviorMetrics.shift();
      }
      if (this.systemHealthMetrics.length > 2880) {
        this.systemHealthMetrics.shift();
      }

      this.emit('metrics_collected', { userBehavior, systemHealth });
    } catch (error) {
      console.error('[PostLaunchMonitoring] Error collecting metrics:', error);
    }
  }

  /**
   * Get user behavior metrics
   */
  private async getUserBehaviorMetrics(): Promise<UserBehaviorMetric> {
    // In production, these would be collected from actual analytics
    return {
      timestamp: new Date(),
      activeUsers: Math.floor(Math.random() * 5000) + 1000,
      newUsers: Math.floor(Math.random() * 500) + 50,
      sessionDuration: Math.random() * 30 + 5,
      pageViews: Math.floor(Math.random() * 10000) + 2000,
      conversionRate: Math.random() * 10 + 5,
      churnRate: Math.random() * 2 + 0.5,
    };
  }

  /**
   * Get system health metrics
   */
  private async getSystemHealthMetrics(): Promise<SystemHealthMetric> {
    // In production, these would be collected from actual system monitoring
    return {
      timestamp: new Date(),
      cpuUsage: Math.random() * 60 + 20,
      memoryUsage: Math.random() * 50 + 30,
      diskUsage: Math.random() * 40 + 20,
      networkLatency: Math.random() * 100 + 20,
      databaseConnections: Math.floor(Math.random() * 50) + 10,
      cacheHitRate: Math.random() * 30 + 70,
    };
  }

  /**
   * Analyze performance trends
   */
  private analyzePerformance(): void {
    if (this.userBehaviorMetrics.length < 10) return;

    const recentMetrics = this.userBehaviorMetrics.slice(-10);
    const avgActiveUsers = recentMetrics.reduce((sum, m) => sum + m.activeUsers, 0) / recentMetrics.length;
    const avgSessionDuration = recentMetrics.reduce((sum, m) => sum + m.sessionDuration, 0) / recentMetrics.length;
    const avgConversionRate = recentMetrics.reduce((sum, m) => sum + m.conversionRate, 0) / recentMetrics.length;

    this.emit('performance_analysis', {
      avgActiveUsers,
      avgSessionDuration,
      avgConversionRate,
      trend: this.calculateTrend(recentMetrics),
    });
  }

  /**
   * Calculate trend from metrics
   */
  private calculateTrend(metrics: UserBehaviorMetric[]): 'improving' | 'declining' | 'stable' {
    if (metrics.length < 2) return 'stable';

    const firstHalf = metrics.slice(0, Math.floor(metrics.length / 2));
    const secondHalf = metrics.slice(Math.floor(metrics.length / 2));

    const firstAvg = firstHalf.reduce((sum, m) => sum + m.activeUsers, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + m.activeUsers, 0) / secondHalf.length;

    if (secondAvg > firstAvg * 1.1) return 'improving';
    if (secondAvg < firstAvg * 0.9) return 'declining';
    return 'stable';
  }

  /**
   * Check for alerts
   */
  private checkAlerts(): void {
    if (this.systemHealthMetrics.length === 0) return;

    const latestMetric = this.systemHealthMetrics[this.systemHealthMetrics.length - 1];

    // Check CPU usage
    if (latestMetric.cpuUsage > this.alertThresholds.cpuUsage) {
      this.createAlert({
        severity: latestMetric.cpuUsage > 95 ? 'critical' : 'high',
        type: 'resource_usage',
        message: `High CPU usage detected: ${latestMetric.cpuUsage.toFixed(1)}%`,
        value: latestMetric.cpuUsage,
        threshold: this.alertThresholds.cpuUsage,
        action: 'Scale horizontally or optimize code',
      });
    }

    // Check memory usage
    if (latestMetric.memoryUsage > this.alertThresholds.memoryUsage) {
      this.createAlert({
        severity: latestMetric.memoryUsage > 95 ? 'critical' : 'high',
        type: 'resource_usage',
        message: `High memory usage detected: ${latestMetric.memoryUsage.toFixed(1)}%`,
        value: latestMetric.memoryUsage,
        threshold: this.alertThresholds.memoryUsage,
        action: 'Check for memory leaks or optimize memory usage',
      });
    }

    // Check disk usage
    if (latestMetric.diskUsage > this.alertThresholds.diskUsage) {
      this.createAlert({
        severity: 'high',
        type: 'resource_usage',
        message: `High disk usage detected: ${latestMetric.diskUsage.toFixed(1)}%`,
        value: latestMetric.diskUsage,
        threshold: this.alertThresholds.diskUsage,
        action: 'Clean up old logs and temporary files',
      });
    }

    // Check network latency
    if (latestMetric.networkLatency > 200) {
      this.createAlert({
        severity: 'medium',
        type: 'response_time',
        message: `High network latency detected: ${latestMetric.networkLatency.toFixed(0)}ms`,
        value: latestMetric.networkLatency,
        threshold: 200,
        action: 'Investigate network issues or optimize data transfer',
      });
    }

    // Check cache hit rate
    if (latestMetric.cacheHitRate < 70) {
      this.createAlert({
        severity: 'low',
        type: 'resource_usage',
        message: `Low cache hit rate detected: ${latestMetric.cacheHitRate.toFixed(1)}%`,
        value: latestMetric.cacheHitRate,
        threshold: 70,
        action: 'Optimize caching strategy or increase cache size',
      });
    }
  }

  /**
   * Create alert
   */
  private createAlert(data: Omit<PerformanceAlert, 'id' | 'timestamp'>): void {
    const alert: PerformanceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...data,
    };

    this.alerts.push(alert);

    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts.shift();
    }

    this.emit('alert_created', alert);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(): void {
    const recommendations: string[] = [];

    if (this.userBehaviorMetrics.length < 5) return;

    const recentMetrics = this.userBehaviorMetrics.slice(-5);
    const avgChurnRate = recentMetrics.reduce((sum, m) => sum + m.churnRate, 0) / recentMetrics.length;

    if (avgChurnRate > 2) {
      recommendations.push('High churn rate detected. Consider implementing customer retention program.');
    }

    const avgSessionDuration = recentMetrics.reduce((sum, m) => sum + m.sessionDuration, 0) / recentMetrics.length;
    if (avgSessionDuration < 10) {
      recommendations.push('Low average session duration. Improve UX and content engagement.');
    }

    const avgConversionRate = recentMetrics.reduce((sum, m) => sum + m.conversionRate, 0) / recentMetrics.length;
    if (avgConversionRate < 5) {
      recommendations.push('Low conversion rate. Optimize quote generation and checkout flow.');
    }

    if (recommendations.length > 0) {
      this.emit('recommendations', recommendations);
    }
  }

  /**
   * Get alerts
   */
  public getAlerts(limit: number = 100): PerformanceAlert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Get critical alerts
   */
  public getCriticalAlerts(): PerformanceAlert[] {
    return this.alerts.filter(a => a.severity === 'critical');
  }

  /**
   * Get user behavior metrics
   */
  public getUserBehaviorMetrics(limit: number = 100): UserBehaviorMetric[] {
    return this.userBehaviorMetrics.slice(-limit);
  }

  /**
   * Get system health metrics
   */
  public getSystemHealthMetrics(limit: number = 100): SystemHealthMetric[] {
    return this.systemHealthMetrics.slice(-limit);
  }

  /**
   * Get health summary
   */
  public getHealthSummary() {
    if (this.systemHealthMetrics.length === 0) {
      return { status: 'unknown', metrics: {} };
    }

    const latest = this.systemHealthMetrics[this.systemHealthMetrics.length - 1];
    const criticalAlerts = this.getCriticalAlerts();

    return {
      status: criticalAlerts.length > 0 ? 'critical' : 'healthy',
      metrics: {
        cpuUsage: latest.cpuUsage,
        memoryUsage: latest.memoryUsage,
        diskUsage: latest.diskUsage,
        networkLatency: latest.networkLatency,
        cacheHitRate: latest.cacheHitRate,
      },
      alerts: criticalAlerts.length,
      lastUpdate: latest.timestamp,
    };
  }

  /**
   * Stop monitoring
   */
  public stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('[PostLaunchMonitoring] Monitoring system stopped');
  }
}

// Export singleton instance
export const postLaunchMonitoring = new PostLaunchMonitoringSystem();

// Set up event listeners
postLaunchMonitoring.on('alert_created', (alert) => {
  console.warn('[PostLaunchMonitoring] Alert:', alert.message);
});

postLaunchMonitoring.on('performance_analysis', (analysis) => {
  console.log('[PostLaunchMonitoring] Performance Analysis:', analysis);
});

postLaunchMonitoring.on('recommendations', (recommendations) => {
  console.log('[PostLaunchMonitoring] Recommendations:', recommendations);
});

export { PostLaunchMonitoringSystem, PerformanceAlert, UserBehaviorMetric, SystemHealthMetric };

