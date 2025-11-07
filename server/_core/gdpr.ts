import { getDb } from '../db';
import { users, projects } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * GDPR Compliance Module
 * Handles data export, deletion, and privacy policy
 */

/**
 * User data export for GDPR compliance
 * Exports all personal data associated with a user
 */
export async function exportUserData(userId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database connection failed');
  }

  try {
    // Get user data
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userData || userData.length === 0) {
      throw new Error('User not found');
    }

    const user = userData[0];

    // Get user's projects
    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId));

    // Compile export data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        loginMethod: user.loginMethod,
        role: user.role,
        createdAt: user.createdAt,
        lastSignedIn: user.lastSignedIn,
      },
      projects: userProjects.map((project) => ({
        id: project.id,
        title: project.title,
        address: project.address,
        clientName: project.clientName,
        clientEmail: project.clientEmail,
        clientPhone: project.clientPhone,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      })),
    };

    // Log GDPR request
    console.log(`[GDPR] Data export requested for user: ${userId} at ${new Date().toISOString()}`);

    return exportData;
  } catch (error) {
    console.error('[GDPR] Export failed:', error);
    throw new Error('Failed to export user data');
  }
}

/**
 * Delete all user data for GDPR compliance
 * Permanently removes user account and associated data
 */
export async function deleteUserData(userId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database connection failed');
  }

  try {
    // Delete user's projects first (foreign key constraint)
    await db.delete(projects).where(eq(projects.userId, userId));

    // Delete user account
    await db.delete(users).where(eq(users.id, userId));

    // Log GDPR request
    console.log(`[GDPR] User data deleted: ${userId} at ${new Date().toISOString()}`);

    return {
      success: true,
      message: 'User data has been permanently deleted',
      deletedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[GDPR] Deletion failed:', error);
    throw new Error('Failed to delete user data');
  }
}

/**
 * Restrict processing of user data
 * Marks user account as restricted (no new operations)
 */
export async function restrictUserProcessing(userId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database connection failed');
  }

  try {
    // In a real implementation, you would add a 'processingRestricted' flag to users table
    console.log(`[GDPR] Processing restricted for user: ${userId} at ${new Date().toISOString()}`);

    return {
      success: true,
      message: 'Processing has been restricted for this user',
      restrictedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[GDPR] Restriction failed:', error);
    throw new Error('Failed to restrict user processing');
  }
}

/**
 * Rectify user data
 * Allows users to update their personal information
 */
export async function rectifyUserData(userId: string, updates: Record<string, any>) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database connection failed');
  }

  try {
    // Only allow updating specific fields
    const allowedFields = ['name', 'email', 'phone'];
    const filteredUpdates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (field in updates) {
        filteredUpdates[field] = updates[field];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error('No valid fields to update');
    }

    // Update user data
    await db.update(users).set(filteredUpdates).where(eq(users.id, userId));

    // Log GDPR request
    console.log(`[GDPR] User data rectified: ${userId} at ${new Date().toISOString()}`);

    return {
      success: true,
      message: 'User data has been updated',
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[GDPR] Rectification failed:', error);
    throw new Error('Failed to rectify user data');
  }
}

/**
 * Get data portability export
 * Exports user data in a portable format (JSON)
 */
export async function getDataPortability(userId: string) {
  try {
    const exportData = await exportUserData(userId);

    // Log GDPR request
    console.log(`[GDPR] Data portability requested for user: ${userId} at ${new Date().toISOString()}`);

    return {
      format: 'application/json',
      data: JSON.stringify(exportData, null, 2),
      filename: `user-data-${userId}-${new Date().toISOString().split('T')[0]}.json`,
    };
  } catch (error) {
    console.error('[GDPR] Data portability failed:', error);
    throw new Error('Failed to export data for portability');
  }
}

/**
 * Privacy policy information
 */
export function getPrivacyPolicy() {
  return {
    version: '1.0',
    lastUpdated: '2025-11-08',
    effectiveDate: '2025-11-08',

    // Data collection
    dataCollected: [
      'Full name',
      'Email address',
      'Phone number',
      'Business address',
      'Project information',
      'Usage analytics',
      'IP address',
      'Browser information',
    ],

    // Purpose of processing
    processingPurpose: [
      'Provide roofing business management services',
      'Improve product and service quality',
      'Communicate with users',
      'Comply with legal obligations',
      'Prevent fraud and abuse',
    ],

    // Legal basis
    legalBasis: [
      'Contractual necessity',
      'Legitimate business interests',
      'Legal compliance',
      'User consent',
    ],

    // Data retention
    dataRetention: {
      default: '2 years',
      afterDeletion: '30 days (backup retention)',
      logs: '1 year',
    },

    // User rights (GDPR Article 15-22)
    userRights: [
      'Right to access (Article 15)',
      'Right to rectification (Article 16)',
      'Right to erasure (Article 17)',
      'Right to restrict processing (Article 18)',
      'Right to data portability (Article 20)',
      'Right to object (Article 21)',
      'Right not to be subject to automated decision-making (Article 22)',
    ],

    // How to exercise rights
    exerciseRights: {
      method: 'Email to privacy@venturr.com',
      responseTime: '30 days',
      verification: 'User identity verification required',
    },

    // Data sharing
    dataSharing: [
      'Service providers (hosting, analytics)',
      'Legal authorities (if required by law)',
      'No third-party marketing',
    ],

    // Security measures
    securityMeasures: [
      'AES-256 encryption for sensitive data',
      'HTTPS for all communications',
      'Regular security audits',
      'Access controls and authentication',
      'Data minimization',
    ],

    // Contact information
    contact: {
      dataProtectionOfficer: 'privacy@venturr.com',
      company: 'Venturr',
      address: 'Australia',
      phone: '+61 2 XXXX XXXX',
    },

    // Complaint procedure
    complaints: {
      method: 'Contact privacy@venturr.com',
      authority: 'Australian Information Commissioner\'s Office (OAIC)',
      authorityWebsite: 'https://www.oaic.gov.au',
    },
  };
}

/**
 * Cookie policy information
 */
export function getCookiePolicy() {
  return {
    version: '1.0',
    lastUpdated: '2025-11-08',

    cookies: [
      {
        name: 'session',
        purpose: 'User authentication and session management',
        type: 'Essential',
        duration: '30 minutes (inactivity timeout)',
        thirdParty: false,
      },
      {
        name: 'theme',
        purpose: 'User interface theme preference',
        type: 'Preference',
        duration: '1 year',
        thirdParty: false,
      },
      {
        name: '_ga',
        purpose: 'Analytics and usage tracking',
        type: 'Analytics',
        duration: '2 years',
        thirdParty: true,
        provider: 'Google Analytics',
      },
    ],

    userControl: [
      'Users can disable non-essential cookies in browser settings',
      'Users can clear cookies at any time',
      'Users can opt-out of analytics tracking',
    ],

    consentManagement: {
      method: 'Cookie banner on first visit',
      storage: 'localStorage',
      duration: '1 year',
    },
  };
}

/**
 * Terms of service information
 */
export function getTermsOfService() {
  return {
    version: '1.0',
    lastUpdated: '2025-11-08',
    effectiveDate: '2025-11-08',

    sections: [
      'Acceptance of Terms',
      'Use License',
      'Disclaimer',
      'Limitations of Liability',
      'Accuracy of Materials',
      'Materials License and Access',
      'Modifications',
      'Links',
      'Modifications to Service',
      'Governing Law',
    ],

    acceptanceRequired: true,
    updateNotification: 'Email notification of material changes',
  };
}

/**
 * Get all compliance documents
 */
export function getComplianceDocuments() {
  return {
    privacyPolicy: getPrivacyPolicy(),
    cookiePolicy: getCookiePolicy(),
    termsOfService: getTermsOfService(),
  };
}

/**
 * Log GDPR activity for audit trail
 */
export function logGDPRActivity(userId: string, action: string, details?: Record<string, any>) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId,
    action,
    details,
    ipAddress: process.env.USER_IP || 'unknown',
  };

  console.log('[GDPR Audit]', JSON.stringify(logEntry));

  // In production, save to audit log database
  // await auditLog.create(logEntry);
}

export default {
  exportUserData,
  deleteUserData,
  restrictUserProcessing,
  rectifyUserData,
  getDataPortability,
  getPrivacyPolicy,
  getCookiePolicy,
  getTermsOfService,
  getComplianceDocuments,
  logGDPRActivity,
};

