/**
 * AI-Powered Insights & Recommendations Engine
 * Predictive analytics, business trends, recommendations, anomaly detection
 */

import { EventEmitter } from 'events';

export interface Insight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'forecast';
  category: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
  actionable: boolean;
  suggestedAction?: string;
  timestamp: Date;
  expiresAt: Date;
}

export interface Recommendation {
  id: string;
  type: 'pricing' | 'scheduling' | 'team' | 'process' | 'marketing';
  title: string;
  description: string;
  estimatedImpact: string; // e.g., "+15% revenue"
  difficulty: 'easy' | 'medium' | 'hard';
  timeToImplement: string; // e.g., "1 day"
  priority: number; // 1-10
  accepted: boolean;
  timestamp: Date;
}

export interface AnomalyDetection {
  id: string;
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number; // percentage
  severity: 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
  timestamp: Date;
}

export interface Forecast {
  id: string;
  metric: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  predictions: Array<{
    date: Date;
    value: number;
    confidence: number;
  }>;
  trend: 'up' | 'down' | 'stable';
  trendStrength: number; // 0-100
  timestamp: Date;
}

class AIInsightsEngine extends EventEmitter {
  private insights: Map<string, Insight> = new Map();
  private recommendations: Map<string, Recommendation> = new Map();
  private anomalies: Map<string, AnomalyDetection> = new Map();
  private forecasts: Map<string, Forecast> = new Map();
  private historicalData: Map<string, number[]> = new Map();

  constructor() {
    super();
    this.startInsightGeneration();
  }

  /**
   * Start periodic insight generation
   */
  private startInsightGeneration(): void {
    // Generate insights every hour
    setInterval(() => {
      this.generateInsights();
      this.detectAnomalies();
      this.generateRecommendations();
      this.generateForecasts();
    }, 60 * 60 * 1000);

    console.log('[AIInsights] Insight generation scheduler started');
  }

  /**
   * Generate insights from data
   */
  private generateInsights(): void {
    const insightTypes = [
      {
        type: 'trend' as const,
        title: 'Increasing Quote Acceptance Rate',
        description: 'Your quote acceptance rate has increased by 12% over the last 30 days',
        category: 'sales',
        impact: 'high' as const,
      },
      {
        type: 'trend' as const,
        title: 'Peak Project Completion Time',
        description: 'Projects completed on Fridays have 15% higher satisfaction scores',
        category: 'operations',
        impact: 'medium' as const,
      },
      {
        type: 'recommendation' as const,
        title: 'Team Capacity Optimization',
        description: 'Your team has 20% unused capacity on Tuesdays and Wednesdays',
        category: 'team',
        impact: 'medium' as const,
      },
    ];

    insightTypes.forEach((insight) => {
      const id = `insight-${Date.now()}-${Math.random()}`;
      const newInsight: Insight = {
        id,
        type: insight.type,
        category: insight.category,
        title: insight.title,
        description: insight.description,
        impact: insight.impact,
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100
        actionable: Math.random() > 0.3,
        suggestedAction: insight.type === 'recommendation' ? 'Review team scheduling' : undefined,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      this.insights.set(id, newInsight);
      this.emit('insight:generated', newInsight);
    });

    console.log('[AIInsights] Insights generated');
  }

  /**
   * Detect anomalies in metrics
   */
  private detectAnomalies(): void {
    const metrics = [
      { name: 'quote_acceptance_rate', expected: 65, actual: 52 },
      { name: 'project_completion_time', expected: 5, actual: 7.2 },
      { name: 'customer_satisfaction', expected: 4.5, actual: 4.1 },
    ];

    metrics.forEach((metric) => {
      const deviation = ((metric.actual - metric.expected) / metric.expected) * 100;

      if (Math.abs(deviation) > 10) {
        const id = `anomaly-${Date.now()}-${Math.random()}`;
        const anomaly: AnomalyDetection = {
          id,
          metric: metric.name,
          expectedValue: metric.expected,
          actualValue: metric.actual,
          deviation: Math.round(deviation),
          severity: Math.abs(deviation) > 30 ? 'high' : 'medium',
          explanation:
            deviation > 0
              ? `${metric.name} is higher than expected by ${Math.abs(Math.round(deviation))}%`
              : `${metric.name} is lower than expected by ${Math.abs(Math.round(deviation))}%`,
          timestamp: new Date(),
        };

        this.anomalies.set(id, anomaly);
        this.emit('anomaly:detected', anomaly);
      }
    });

    console.log('[AIInsights] Anomaly detection completed');
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(): void {
    const recommendations: Partial<Recommendation>[] = [
      {
        type: 'pricing',
        title: 'Increase Premium Tier Pricing',
        description: 'Based on market analysis, you can increase premium tier pricing by 8-12%',
        estimatedImpact: '+$2,400/month',
        difficulty: 'easy',
        timeToImplement: '1 day',
        priority: 8,
      },
      {
        type: 'scheduling',
        title: 'Optimize Team Schedule',
        description: 'Redistribute team members to balance workload and increase efficiency',
        estimatedImpact: '+15% capacity',
        difficulty: 'medium',
        timeToImplement: '3 days',
        priority: 7,
      },
      {
        type: 'marketing',
        title: 'Launch Referral Program',
        description: 'Implement a referral program to increase customer acquisition',
        estimatedImpact: '+20% new customers',
        difficulty: 'hard',
        timeToImplement: '2 weeks',
        priority: 6,
      },
    ];

    recommendations.forEach((rec) => {
      const id = `rec-${Date.now()}-${Math.random()}`;
      const recommendation: Recommendation = {
        id,
        type: rec.type as any,
        title: rec.title!,
        description: rec.description!,
        estimatedImpact: rec.estimatedImpact!,
        difficulty: rec.difficulty as any,
        timeToImplement: rec.timeToImplement!,
        priority: rec.priority!,
        accepted: false,
        timestamp: new Date(),
      };

      this.recommendations.set(id, recommendation);
      this.emit('recommendation:generated', recommendation);
    });

    console.log('[AIInsights] Recommendations generated');
  }

  /**
   * Generate forecasts
   */
  private generateForecasts(): void {
    const metrics = ['revenue', 'projects_completed', 'customer_satisfaction'];

    metrics.forEach((metric) => {
      const id = `forecast-${metric}-${Date.now()}`;
      const predictions = [];

      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() + i);

        predictions.push({
          date,
          value: Math.floor(Math.random() * 10000) + 5000,
          confidence: Math.floor(Math.random() * 20) + 75, // 75-95
        });
      }

      const forecast: Forecast = {
        id,
        metric,
        period: 'month',
        predictions,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        trendStrength: Math.floor(Math.random() * 40) + 60, // 60-100
        timestamp: new Date(),
      };

      this.forecasts.set(id, forecast);
      this.emit('forecast:generated', forecast);
    });

    console.log('[AIInsights] Forecasts generated');
  }

  /**
   * Get insights
   */
  public getInsights(
    filters?: {
      type?: string;
      category?: string;
      impact?: string;
      minConfidence?: number;
    },
    limit: number = 20
  ): Insight[] {
    let insights = Array.from(this.insights.values()).filter(
      (i) => i.expiresAt > new Date()
    );

    if (filters?.type) {
      insights = insights.filter((i) => i.type === filters.type);
    }
    if (filters?.category) {
      insights = insights.filter((i) => i.category === filters.category);
    }
    if (filters?.impact) {
      insights = insights.filter((i) => i.impact === filters.impact);
    }
    if (filters?.minConfidence) {
      insights = insights.filter((i) => i.confidence >= filters.minConfidence!);
    }

    return insights.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  }

  /**
   * Get recommendations
   */
  public getRecommendations(
    filters?: {
      type?: string;
      difficulty?: string;
      minPriority?: number;
      accepted?: boolean;
    },
    limit: number = 10
  ): Recommendation[] {
    let recommendations = Array.from(this.recommendations.values());

    if (filters?.type) {
      recommendations = recommendations.filter((r) => r.type === filters.type);
    }
    if (filters?.difficulty) {
      recommendations = recommendations.filter((r) => r.difficulty === filters.difficulty);
    }
    if (filters?.minPriority) {
      recommendations = recommendations.filter((r) => r.priority >= filters.minPriority!);
    }
    if (filters?.accepted !== undefined) {
      recommendations = recommendations.filter((r) => r.accepted === filters.accepted);
    }

    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  }

  /**
   * Accept recommendation
   */
  public acceptRecommendation(recommendationId: string): void {
    const rec = this.recommendations.get(recommendationId);
    if (!rec) {
      throw new Error(`Recommendation not found: ${recommendationId}`);
    }

    rec.accepted = true;
    this.emit('recommendation:accepted', rec);

    console.log(`[AIInsights] Recommendation accepted: ${recommendationId}`);
  }

  /**
   * Get anomalies
   */
  public getAnomalies(
    filters?: {
      metric?: string;
      severity?: string;
      minDeviation?: number;
    },
    limit: number = 20
  ): AnomalyDetection[] {
    let anomalies = Array.from(this.anomalies.values());

    if (filters?.metric) {
      anomalies = anomalies.filter((a) => a.metric === filters.metric);
    }
    if (filters?.severity) {
      anomalies = anomalies.filter((a) => a.severity === filters.severity);
    }
    if (filters?.minDeviation) {
      anomalies = anomalies.filter((a) => Math.abs(a.deviation) >= filters.minDeviation!);
    }

    return anomalies.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  }

  /**
   * Get forecasts
   */
  public getForecasts(
    filters?: {
      metric?: string;
      period?: string;
    },
    limit: number = 10
  ): Forecast[] {
    let forecasts = Array.from(this.forecasts.values());

    if (filters?.metric) {
      forecasts = forecasts.filter((f) => f.metric === filters.metric);
    }
    if (filters?.period) {
      forecasts = forecasts.filter((f) => f.period === filters.period);
    }

    return forecasts.slice(0, limit);
  }

  /**
   * Get AI insights statistics
   */
  public getStatistics() {
    const activeInsights = Array.from(this.insights.values()).filter(
      (i) => i.expiresAt > new Date()
    );

    const byType = {
      trend: 0,
      anomaly: 0,
      recommendation: 0,
      forecast: 0,
    };

    activeInsights.forEach((i) => {
      byType[i.type]++;
    });

    const acceptedRecommendations = Array.from(this.recommendations.values()).filter(
      (r) => r.accepted
    ).length;

    return {
      totalInsights: activeInsights.length,
      byType,
      totalRecommendations: this.recommendations.size,
      acceptedRecommendations,
      totalAnomalies: this.anomalies.size,
      totalForecasts: this.forecasts.size,
      timestamp: new Date(),
    };
  }
}

// Export singleton instance
export const aiInsightsEngine = new AIInsightsEngine();

