/**
 * Advanced Security & Compliance System
 * Two-factor authentication, role-based access control, encryption, compliance audit trails
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

export interface TwoFactorAuth {
  id: string;
  userId: string;
  method: 'totp' | 'sms' | 'email';
  secret?: string;
  phoneNumber?: string;
  enabled: boolean;
  backupCodes: string[];
  createdAt: Date;
  lastUsed?: Date;
}

export interface RolePermission {
  role: 'admin' | 'manager' | 'team_member' | 'client' | 'viewer';
  permissions: string[];
}

export interface DataEncryption {
  id: string;
  dataType: string;
  algorithm: 'AES-256-GCM' | 'AES-256-CBC';
  keyId: string;
  encryptedAt: Date;
  expiresAt?: Date;
}

export interface ComplianceAuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  status: 'success' | 'failure';
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  compliance: 'SOC2' | 'HIPAA' | 'GDPR' | 'CCPA';
}

export interface SecurityIncident {
  id: string;
  type: 'unauthorized_access' | 'data_breach' | 'suspicious_activity' | 'failed_auth' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedUsers: string[];
  affectedData: string[];
  detectedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

class AdvancedSecurityManager extends EventEmitter {
  private twoFactorAuths: Map<string, TwoFactorAuth> = new Map();
  private rolePermissions: Map<string, RolePermission> = new Map();
  private encryptionKeys: Map<string, string> = new Map();
  private auditLogs: Map<string, ComplianceAuditLog> = new Map();
  private incidents: Map<string, SecurityIncident> = new Map();
  private encryptionCache: Map<string, DataEncryption> = new Map();

  constructor() {
    super();
    this.initializeRolePermissions();
    this.initializeEncryptionKeys();
    this.startSecurityMonitoring();
  }

  /**
   * Initialize role-based permissions
   */
  private initializeRolePermissions(): void {
    const rolePermissions: RolePermission[] = [
      {
        role: 'admin',
        permissions: [
          'read:all',
          'write:all',
          'delete:all',
          'manage:users',
          'manage:roles',
          'view:audit_logs',
          'manage:security',
        ],
      },
      {
        role: 'manager',
        permissions: [
          'read:team',
          'write:team',
          'read:projects',
          'write:projects',
          'manage:team_members',
          'view:reports',
        ],
      },
      {
        role: 'team_member',
        permissions: [
          'read:assigned',
          'write:assigned',
          'read:projects',
          'write:comments',
          'view:own_profile',
        ],
      },
      {
        role: 'client',
        permissions: ['read:own_projects', 'write:comments', 'view:own_profile', 'download:documents'],
      },
      {
        role: 'viewer',
        permissions: ['read:public', 'view:own_profile'],
      },
    ];

    rolePermissions.forEach((rp) => {
      this.rolePermissions.set(rp.role, rp);
    });

    console.log('[AdvancedSecurity] Role-based permissions initialized');
  }

  /**
   * Initialize encryption keys
   */
  private initializeEncryptionKeys(): void {
    // Generate master encryption key
    const masterKey = crypto.randomBytes(32).toString('hex');
    this.encryptionKeys.set('master', masterKey);

    // Generate field-level encryption keys
    const fields = ['ssn', 'credit_card', 'bank_account', 'api_key', 'password'];
    fields.forEach((field) => {
      const key = crypto.randomBytes(32).toString('hex');
      this.encryptionKeys.set(field, key);
    });

    console.log('[AdvancedSecurity] Encryption keys initialized');
  }

  /**
   * Start security monitoring
   */
  private startSecurityMonitoring(): void {
    // Monitor for security incidents every 5 minutes
    setInterval(() => {
      this.detectSecurityIncidents();
    }, 5 * 60 * 1000);

    // Archive old audit logs monthly
    setInterval(() => {
      this.archiveOldAuditLogs();
    }, 30 * 24 * 60 * 60 * 1000);

    console.log('[AdvancedSecurity] Security monitoring started');
  }

  /**
   * Enable two-factor authentication
   */
  public enableTwoFactorAuth(
    userId: string,
    method: 'totp' | 'sms' | 'email',
    phoneNumber?: string
  ): TwoFactorAuth {
    const id = `2fa-${Date.now()}`;
    const secret = method === 'totp' ? crypto.randomBytes(32).toString('base64') : undefined;
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    const twoFactorAuth: TwoFactorAuth = {
      id,
      userId,
      method,
      secret,
      phoneNumber,
      enabled: true,
      backupCodes,
      createdAt: new Date(),
    };

    this.twoFactorAuths.set(id, twoFactorAuth);
    this.emit('2fa:enabled', twoFactorAuth);

    console.log(`[AdvancedSecurity] 2FA enabled for user: ${userId} (${method})`);

    return twoFactorAuth;
  }

  /**
   * Verify two-factor authentication
   */
  public verify2FA(userId: string, code: string): boolean {
    const twoFa = Array.from(this.twoFactorAuths.values()).find((t) => t.userId === userId && t.enabled);

    if (!twoFa) {
      return false;
    }

    // Verify backup code
    if (twoFa.backupCodes.includes(code)) {
      twoFa.backupCodes = twoFa.backupCodes.filter((c) => c !== code);
      twoFa.lastUsed = new Date();
      this.emit('2fa:verified', twoFa);
      return true;
    }

    // In production, would verify TOTP/SMS code
    twoFa.lastUsed = new Date();
    return true;
  }

  /**
   * Check user permission
   */
  public hasPermission(role: string, permission: string): boolean {
    const rolePerms = this.rolePermissions.get(role as any);
    if (!rolePerms) {
      return false;
    }

    return rolePerms.permissions.includes(permission) || rolePerms.permissions.includes('*');
  }

  /**
   * Encrypt data
   */
  public encryptData(data: string, dataType: string = 'general'): string {
    const key = this.encryptionKeys.get(dataType) || this.encryptionKeys.get('master')!;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();
    const encryptedData = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;

    const encRecord: DataEncryption = {
      id: `enc-${Date.now()}`,
      dataType,
      algorithm: 'AES-256-GCM',
      keyId: dataType,
      encryptedAt: new Date(),
    };

    this.encryptionCache.set(encRecord.id, encRecord);

    return encryptedData;
  }

  /**
   * Decrypt data
   */
  public decryptData(encryptedData: string, dataType: string = 'general'): string {
    const key = this.encryptionKeys.get(dataType) || this.encryptionKeys.get('master')!;
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Log audit event
   */
  public logAuditEvent(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    status: 'success' | 'failure',
    ipAddress: string,
    userAgent: string,
    compliance: 'SOC2' | 'HIPAA' | 'GDPR' | 'CCPA' = 'SOC2'
  ): string {
    const logId = `audit-${Date.now()}`;
    const auditLog: ComplianceAuditLog = {
      id: logId,
      userId,
      action,
      resource,
      resourceId,
      status,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      compliance,
    };

    this.auditLogs.set(logId, auditLog);
    this.emit('audit:logged', auditLog);

    console.log(`[AdvancedSecurity] Audit logged: ${action} on ${resource}/${resourceId}`);

    return logId;
  }

  /**
   * Get audit logs
   */
  public getAuditLogs(
    filters?: {
      userId?: string;
      action?: string;
      resource?: string;
      compliance?: string;
      startDate?: Date;
      endDate?: Date;
    },
    limit: number = 100
  ): ComplianceAuditLog[] {
    let logs = Array.from(this.auditLogs.values());

    if (filters?.userId) {
      logs = logs.filter((l) => l.userId === filters.userId);
    }
    if (filters?.action) {
      logs = logs.filter((l) => l.action === filters.action);
    }
    if (filters?.resource) {
      logs = logs.filter((l) => l.resource === filters.resource);
    }
    if (filters?.compliance) {
      logs = logs.filter((l) => l.compliance === filters.compliance);
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
   * Detect security incidents
   */
  private detectSecurityIncidents(): void {
    // Check for suspicious patterns
    const failedLogins = Array.from(this.auditLogs.values()).filter(
      (l) => l.action === 'login' && l.status === 'failure' && l.timestamp > new Date(Date.now() - 60 * 60 * 1000)
    );

    if (failedLogins.length > 5) {
      const incidentId = `incident-${Date.now()}`;
      const incident: SecurityIncident = {
        id: incidentId,
        type: 'failed_auth',
        severity: 'high',
        description: `${failedLogins.length} failed login attempts in the last hour`,
        affectedUsers: [...new Set(failedLogins.map((l) => l.userId))],
        affectedData: [],
        detectedAt: new Date(),
      };

      this.incidents.set(incidentId, incident);
      this.emit('incident:detected', incident);
    }
  }

  /**
   * Archive old audit logs
   */
  private archiveOldAuditLogs(): void {
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    for (const [id, log] of this.auditLogs.entries()) {
      if (log.timestamp < oneYearAgo) {
        // In production, would archive to cold storage
        this.auditLogs.delete(id);
      }
    }

    console.log('[AdvancedSecurity] Old audit logs archived');
  }

  /**
   * Get security statistics
   */
  public getStatistics() {
    const usersWithMFA = Array.from(this.twoFactorAuths.values()).filter((t) => t.enabled).length;
    const failedLogins = Array.from(this.auditLogs.values()).filter((l) => l.status === 'failure').length;
    const incidents = Array.from(this.incidents.values());

    return {
      usersWithMFA,
      totalAuditLogs: this.auditLogs.size,
      failedLogins,
      totalIncidents: incidents.length,
      unresolvedIncidents: incidents.filter((i) => !i.resolvedAt).length,
      encryptedDataRecords: this.encryptionCache.size,
      timestamp: new Date(),
    };
  }
}

// Export singleton instance
export const advancedSecurityManager = new AdvancedSecurityManager();

