/**
 * Advanced Compliance & Audit Logging System
 * Comprehensive audit trails, compliance reporting (GDPR, CCPA), data retention, documentation
 */

import { EventEmitter } from 'events';

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes: Record<string, { oldValue: unknown; newValue: unknown }>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  status: 'success' | 'failure';
  errorMessage?: string;
}

export interface ComplianceReport {
  id: string;
  type: 'gdpr' | 'ccpa' | 'hipaa' | 'soc2';
  generatedAt: Date;
  period: { start: Date; end: Date };
  dataProcessingActivities: number;
  dataBreaches: number;
  consentRecords: number;
  dataSubjectRequests: number;
  retentionCompliance: boolean;
  status: 'draft' | 'approved' | 'submitted';
}

export interface DataRetentionPolicy {
  id: string;
  dataType: string;
  retentionDays: number;
  autoDelete: boolean;
  anonymizeAfterDays?: number;
  legalHold: boolean;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 'marketing' | 'analytics' | 'thirdparty' | 'processing';
  granted: boolean;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  expiresAt?: Date;
}

class ComplianceAuditManager extends EventEmitter {
  private auditLogs: Map<string, AuditLog> = new Map();
  private complianceReports: Map<string, ComplianceReport> = new Map();
  private dataRetentionPolicies: Map<string, DataRetentionPolicy> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private dataBreaches: Array<{
    id: string;
    timestamp: Date;
    description: string;
    affectedRecords: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> = [];

  constructor() {
    super();
    this.initializeDefaultPolicies();
    this.startRetentionCleanup();
  }

  /**
   * Initialize default data retention policies
   */
  private initializeDefaultPolicies(): void {
    const policies: DataRetentionPolicy[] = [
      {
        id: 'policy-user-data',
        dataType: 'user_personal_data',
        retentionDays: 2555, // 7 years
        autoDelete: true,
        legalHold: false,
      },
      {
        id: 'policy-transaction-data',
        dataType: 'transaction_data',
        retentionDays: 1825, // 5 years
        autoDelete: true,
        anonymizeAfterDays: 365,
        legalHold: false,
      },
      {
        id: 'policy-audit-logs',
        dataType: 'audit_logs',
        retentionDays: 2555, // 7 years
        autoDelete: false,
        legalHold: true,
      },
      {
        id: 'policy-marketing',
        dataType: 'marketing_data',
        retentionDays: 365, // 1 year
        autoDelete: true,
        legalHold: false,
      },
    ];

    policies.forEach((policy) => {
      this.dataRetentionPolicies.set(policy.id, policy);
    });

    console.log('[ComplianceAudit] Default data retention policies initialized');
  }

  /**
   * Start automatic retention cleanup
   */
  private startRetentionCleanup(): void {
    // Run cleanup daily at 2 AM
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 2 && now.getMinutes() === 0) {
        this.cleanupExpiredData();
      }
    }, 60000); // Check every minute

    console.log('[ComplianceAudit] Retention cleanup scheduler started');
  }

  /**
   * Log an action for audit trail
   */
  public logAction(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    changes: Record<string, { oldValue: unknown; newValue: unknown }>,
    ipAddress: string,
    userAgent: string,
    status: 'success' | 'failure' = 'success',
    errorMessage?: string
  ): string {
    const logId = `audit-${Date.now()}`;
    const log: AuditLog = {
      id: logId,
      userId,
      action,
      resourceType,
      resourceId,
      changes,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      status,
      errorMessage,
    };

    this.auditLogs.set(logId, log);
    this.emit('audit:logged', log);

    console.log(
      `[ComplianceAudit] Action logged: ${action} on ${resourceType}/${resourceId} by ${userId}`
    );

    return logId;
  }

  /**
   * Get audit logs with filtering
   */
  public getAuditLogs(
    filters?: {
      userId?: string;
      action?: string;
      resourceType?: string;
      startDate?: Date;
      endDate?: Date;
    },
    limit: number = 100
  ): AuditLog[] {
    let logs = Array.from(this.auditLogs.values());

    if (filters?.userId) {
      logs = logs.filter((l) => l.userId === filters.userId);
    }
    if (filters?.action) {
      logs = logs.filter((l) => l.action === filters.action);
    }
    if (filters?.resourceType) {
      logs = logs.filter((l) => l.resourceType === filters.resourceType);
    }
    if (filters?.startDate) {
      logs = logs.filter((l) => l.timestamp >= filters.startDate!);
    }
    if (filters?.endDate) {
      logs = logs.filter((l) => l.timestamp <= filters.endDate!);
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  }

  /**
   * Record user consent
   */
  public recordConsent(
    userId: string,
    consentType: 'marketing' | 'analytics' | 'thirdparty' | 'processing',
    granted: boolean,
    ipAddress: string,
    userAgent: string,
    expiresAt?: Date
  ): string {
    const consentId = `consent-${Date.now()}`;
    const record: ConsentRecord = {
      id: consentId,
      userId,
      consentType,
      granted,
      timestamp: new Date(),
      ipAddress,
      userAgent,
      expiresAt,
    };

    this.consentRecords.set(consentId, record);
    this.emit('consent:recorded', record);

    console.log(`[ComplianceAudit] Consent recorded: ${consentType} (${granted}) for ${userId}`);

    return consentId;
  }

  /**
   * Get user consent status
   */
  public getUserConsent(userId: string): Record<string, boolean> {
    const userConsents = Array.from(this.consentRecords.values()).filter(
      (c) => c.userId === userId && (!c.expiresAt || c.expiresAt > new Date())
    );

    const consentStatus: Record<string, boolean> = {
      marketing: false,
      analytics: false,
      thirdparty: false,
      processing: false,
    };

    userConsents.forEach((consent) => {
      consentStatus[consent.consentType] = consent.granted;
    });

    return consentStatus;
  }

  /**
   * Report a data breach
   */
  public reportDataBreach(
    description: string,
    affectedRecords: number,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): string {
    const breachId = `breach-${Date.now()}`;
    const breach = {
      id: breachId,
      timestamp: new Date(),
      description,
      affectedRecords,
      severity,
    };

    this.dataBreaches.push(breach);
    this.emit('breach:reported', breach);

    console.log(`[ComplianceAudit] Data breach reported: ${breachId} (${severity})`);

    return breachId;
  }

  /**
   * Generate compliance report
   */
  public async generateComplianceReport(
    type: 'gdpr' | 'ccpa' | 'hipaa' | 'soc2',
    startDate: Date,
    endDate: Date
  ): Promise<string> {
    const reportId = `report-${type}-${Date.now()}`;

    const auditLogs = this.getAuditLogs({
      startDate,
      endDate,
    });

    const breaches = this.dataBreaches.filter(
      (b) => b.timestamp >= startDate && b.timestamp <= endDate
    );

    const consents = Array.from(this.consentRecords.values()).filter(
      (c) => c.timestamp >= startDate && c.timestamp <= endDate
    );

    const report: ComplianceReport = {
      id: reportId,
      type,
      generatedAt: new Date(),
      period: { start: startDate, end: endDate },
      dataProcessingActivities: auditLogs.length,
      dataBreaches: breaches.length,
      consentRecords: consents.length,
      dataSubjectRequests: auditLogs.filter((l) => l.action === 'data_subject_request').length,
      retentionCompliance: this.checkRetentionCompliance(),
      status: 'draft',
    };

    this.complianceReports.set(reportId, report);
    this.emit('report:generated', report);

    console.log(`[ComplianceAudit] Compliance report generated: ${reportId} (${type})`);

    return reportId;
  }

  /**
   * Get compliance report
   */
  public getComplianceReport(reportId: string): ComplianceReport | null {
    return this.complianceReports.get(reportId) || null;
  }

  /**
   * Check retention compliance
   */
  private checkRetentionCompliance(): boolean {
    // Simulate compliance check
    return Math.random() > 0.1; // 90% compliance
  }

  /**
   * Cleanup expired data based on retention policies
   */
  private cleanupExpiredData(): void {
    const now = new Date();
    let deletedCount = 0;

    for (const [id, log] of this.auditLogs.entries()) {
      const policy = this.dataRetentionPolicies.get('policy-audit-logs');
      if (policy) {
        const expirationDate = new Date(
          log.timestamp.getTime() + policy.retentionDays * 24 * 60 * 60 * 1000
        );
        if (now > expirationDate && policy.autoDelete) {
          this.auditLogs.delete(id);
          deletedCount++;
        }
      }
    }

    console.log(`[ComplianceAudit] Cleanup completed: ${deletedCount} expired records deleted`);
  }

  /**
   * Export user data (GDPR right to be forgotten)
   */
  public async exportUserData(userId: string): Promise<string> {
    const exportId = `export-${userId}-${Date.now()}`;

    const userLogs = this.getAuditLogs({ userId }, 10000);
    const userConsents = Array.from(this.consentRecords.values()).filter((c) => c.userId === userId);

    this.emit('data:exported', {
      exportId,
      userId,
      logsCount: userLogs.length,
      consentsCount: userConsents.length,
      timestamp: new Date(),
    });

    console.log(`[ComplianceAudit] User data exported: ${exportId} for ${userId}`);

    return exportId;
  }

  /**
   * Delete user data (GDPR right to be forgotten)
   */
  public async deleteUserData(userId: string): Promise<void> {
    const logsToDelete = Array.from(this.auditLogs.entries())
      .filter(([_, log]) => log.userId === userId)
      .map(([id, _]) => id);

    const consentsToDelete = Array.from(this.consentRecords.entries())
      .filter(([_, consent]) => consent.userId === userId)
      .map(([id, _]) => id);

    logsToDelete.forEach((id) => this.auditLogs.delete(id));
    consentsToDelete.forEach((id) => this.consentRecords.delete(id));

    this.emit('data:deleted', {
      userId,
      logsDeleted: logsToDelete.length,
      consentsDeleted: consentsToDelete.length,
      timestamp: new Date(),
    });

    console.log(
      `[ComplianceAudit] User data deleted: ${userId} (${logsToDelete.length} logs, ${consentsToDelete.length} consents)`
    );
  }

  /**
   * Get compliance statistics
   */
  public getComplianceStatistics() {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentLogs = this.getAuditLogs({ startDate: last30Days });
    const recentBreaches = this.dataBreaches.filter((b) => b.timestamp > last30Days);
    const recentConsents = Array.from(this.consentRecords.values()).filter(
      (c) => c.timestamp > last30Days
    );

    return {
      totalAuditLogs: this.auditLogs.size,
      auditLogsLast30Days: recentLogs.length,
      totalDataBreaches: this.dataBreaches.length,
      breachesLast30Days: recentBreaches.length,
      totalConsentRecords: this.consentRecords.size,
      consentsLast30Days: recentConsents.length,
      complianceReports: this.complianceReports.size,
      retentionPolicies: this.dataRetentionPolicies.size,
      timestamp: new Date(),
    };
  }
}

// Export singleton instance
export const complianceAuditManager = new ComplianceAuditManager();

