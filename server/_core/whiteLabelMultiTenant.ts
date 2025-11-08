/**
 * White-Label & Multi-Tenant Support System
 * Custom branding, custom domains, multi-org support, isolated data, separate billing
 */

import { EventEmitter } from 'events';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  customDomain?: string;
  whiteLabel: {
    enabled: boolean;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    faviconUrl?: string;
    companyName?: string;
  };
  billing: {
    plan: 'starter' | 'pro' | 'enterprise';
    monthlyUsers: number;
    customDomainEnabled: boolean;
    whitelabelEnabled: boolean;
    apiAccessEnabled: boolean;
    status: 'active' | 'suspended' | 'cancelled';
  };
  members: Array<{
    userId: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantData {
  organizationId: string;
  dataType: string;
  recordCount: number;
  sizeBytes: number;
  lastModified: Date;
}

export interface BillingAccount {
  id: string;
  organizationId: string;
  stripeCustomerId: string;
  plan: 'starter' | 'pro' | 'enterprise';
  monthlyPrice: number;
  billingCycle: 'monthly' | 'annual';
  nextBillingDate: Date;
  paymentMethod: {
    type: 'card' | 'bank_transfer';
    last4: string;
  };
  invoices: Array<{
    id: string;
    amount: number;
    date: Date;
    status: 'paid' | 'pending' | 'failed';
  }>;
}

class WhiteLabelMultiTenantManager extends EventEmitter {
  private organizations: Map<string, Organization> = new Map();
  private tenantData: Map<string, TenantData[]> = new Map();
  private billingAccounts: Map<string, BillingAccount> = new Map();
  private domainMapping: Map<string, string> = new Map(); // domain -> organizationId

  constructor() {
    super();
  }

  /**
   * Create a new organization
   */
  public createOrganization(
    name: string,
    slug: string,
    ownerId: string,
    plan: 'starter' | 'pro' | 'enterprise' = 'starter'
  ): string {
    const orgId = `org-${Date.now()}`;

    const organization: Organization = {
      id: orgId,
      name,
      slug,
      ownerId,
      whiteLabel: {
        enabled: false,
      },
      billing: {
        plan,
        monthlyUsers: plan === 'starter' ? 5 : plan === 'pro' ? 20 : 100,
        customDomainEnabled: plan === 'enterprise',
        whitelabelEnabled: plan !== 'starter',
        apiAccessEnabled: plan !== 'starter',
        status: 'active',
      },
      members: [
        {
          userId: ownerId,
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.organizations.set(orgId, organization);
    this.emit('organization:created', organization);

    console.log(`[WhiteLabel] Organization created: ${orgId} (${name})`);

    return orgId;
  }

  /**
   * Get organization
   */
  public getOrganization(orgId: string): Organization | null {
    return this.organizations.get(orgId) || null;
  }

  /**
   * Get organization by slug
   */
  public getOrganizationBySlug(slug: string): Organization | null {
    for (const org of this.organizations.values()) {
      if (org.slug === slug) {
        return org;
      }
    }
    return null;
  }

  /**
   * Get organization by custom domain
   */
  public getOrganizationByDomain(domain: string): Organization | null {
    const orgId = this.domainMapping.get(domain);
    if (!orgId) return null;
    return this.organizations.get(orgId) || null;
  }

  /**
   * Update white-label settings
   */
  public updateWhiteLabel(
    orgId: string,
    whiteLabel: Partial<Organization['whiteLabel']>
  ): void {
    const org = this.organizations.get(orgId);
    if (!org) {
      throw new Error(`Organization not found: ${orgId}`);
    }

    if (!org.billing.whitelabelEnabled && whiteLabel.enabled) {
      throw new Error('White-label not enabled for this plan');
    }

    org.whiteLabel = { ...org.whiteLabel, ...whiteLabel };
    org.updatedAt = new Date();

    this.emit('whitelabel:updated', org);
    console.log(`[WhiteLabel] White-label settings updated: ${orgId}`);
  }

  /**
   * Set custom domain
   */
  public setCustomDomain(orgId: string, domain: string): void {
    const org = this.organizations.get(orgId);
    if (!org) {
      throw new Error(`Organization not found: ${orgId}`);
    }

    if (!org.billing.customDomainEnabled) {
      throw new Error('Custom domains not enabled for this plan');
    }

    // Remove old domain mapping
    if (org.customDomain) {
      this.domainMapping.delete(org.customDomain);
    }

    org.customDomain = domain;
    this.domainMapping.set(domain, orgId);
    org.updatedAt = new Date();

    this.emit('domain:updated', { orgId, domain });
    console.log(`[WhiteLabel] Custom domain set: ${orgId} -> ${domain}`);
  }

  /**
   * Add member to organization
   */
  public addMember(orgId: string, userId: string, role: 'admin' | 'member' = 'member'): void {
    const org = this.organizations.get(orgId);
    if (!org) {
      throw new Error(`Organization not found: ${orgId}`);
    }

    // Check if member already exists
    if (org.members.some((m) => m.userId === userId)) {
      throw new Error(`User already member of organization: ${userId}`);
    }

    org.members.push({
      userId,
      role,
      joinedAt: new Date(),
    });

    org.updatedAt = new Date();
    this.emit('member:added', { orgId, userId, role });

    console.log(`[WhiteLabel] Member added: ${orgId} -> ${userId} (${role})`);
  }

  /**
   * Remove member from organization
   */
  public removeMember(orgId: string, userId: string): void {
    const org = this.organizations.get(orgId);
    if (!org) {
      throw new Error(`Organization not found: ${orgId}`);
    }

    org.members = org.members.filter((m) => m.userId !== userId);
    org.updatedAt = new Date();

    this.emit('member:removed', { orgId, userId });
    console.log(`[WhiteLabel] Member removed: ${orgId} -> ${userId}`);
  }

  /**
   * Update member role
   */
  public updateMemberRole(orgId: string, userId: string, role: 'admin' | 'member'): void {
    const org = this.organizations.get(orgId);
    if (!org) {
      throw new Error(`Organization not found: ${orgId}`);
    }

    const member = org.members.find((m) => m.userId === userId);
    if (!member) {
      throw new Error(`Member not found: ${userId}`);
    }

    member.role = role;
    org.updatedAt = new Date();

    this.emit('member:updated', { orgId, userId, role });
    console.log(`[WhiteLabel] Member role updated: ${orgId} -> ${userId} (${role})`);
  }

  /**
   * Upgrade organization plan
   */
  public upgradePlan(orgId: string, newPlan: 'starter' | 'pro' | 'enterprise'): void {
    const org = this.organizations.get(orgId);
    if (!org) {
      throw new Error(`Organization not found: ${orgId}`);
    }

    const oldPlan = org.billing.plan;
    org.billing.plan = newPlan;
    org.billing.monthlyUsers = newPlan === 'starter' ? 5 : newPlan === 'pro' ? 20 : 100;
    org.billing.customDomainEnabled = newPlan === 'enterprise';
    org.billing.whitelabelEnabled = newPlan !== 'starter';
    org.billing.apiAccessEnabled = newPlan !== 'starter';
    org.updatedAt = new Date();

    this.emit('plan:upgraded', { orgId, oldPlan, newPlan });
    console.log(`[WhiteLabel] Plan upgraded: ${orgId} (${oldPlan} -> ${newPlan})`);
  }

  /**
   * Create billing account
   */
  public createBillingAccount(
    orgId: string,
    stripeCustomerId: string,
    plan: 'starter' | 'pro' | 'enterprise'
  ): string {
    const billingId = `billing-${Date.now()}`;

    const monthlyPrices = {
      starter: 29.99,
      pro: 79.99,
      enterprise: 299.99,
    };

    const account: BillingAccount = {
      id: billingId,
      organizationId: orgId,
      stripeCustomerId,
      plan,
      monthlyPrice: monthlyPrices[plan],
      billingCycle: 'monthly',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paymentMethod: {
        type: 'card',
        last4: '****',
      },
      invoices: [],
    };

    this.billingAccounts.set(billingId, account);
    this.emit('billing:created', account);

    console.log(`[WhiteLabel] Billing account created: ${billingId} for ${orgId}`);

    return billingId;
  }

  /**
   * Get billing account
   */
  public getBillingAccount(billingId: string): BillingAccount | null {
    return this.billingAccounts.get(billingId) || null;
  }

  /**
   * Get billing account by organization
   */
  public getBillingAccountByOrganization(orgId: string): BillingAccount | null {
    for (const account of this.billingAccounts.values()) {
      if (account.organizationId === orgId) {
        return account;
      }
    }
    return null;
  }

  /**
   * Record tenant data
   */
  public recordTenantData(
    orgId: string,
    dataType: string,
    recordCount: number,
    sizeBytes: number
  ): void {
    if (!this.tenantData.has(orgId)) {
      this.tenantData.set(orgId, []);
    }

    const data: TenantData = {
      organizationId: orgId,
      dataType,
      recordCount,
      sizeBytes,
      lastModified: new Date(),
    };

    const tenantDataList = this.tenantData.get(orgId)!;
    const existingIndex = tenantDataList.findIndex((d) => d.dataType === dataType);

    if (existingIndex >= 0) {
      tenantDataList[existingIndex] = data;
    } else {
      tenantDataList.push(data);
    }

    console.log(`[WhiteLabel] Tenant data recorded: ${orgId} -> ${dataType}`);
  }

  /**
   * Get tenant data usage
   */
  public getTenantDataUsage(orgId: string) {
    const data = this.tenantData.get(orgId) || [];
    const totalSize = data.reduce((sum, d) => sum + d.sizeBytes, 0);
    const totalRecords = data.reduce((sum, d) => sum + d.recordCount, 0);

    return {
      organizationId: orgId,
      totalSize,
      totalRecords,
      byType: data,
      timestamp: new Date(),
    };
  }

  /**
   * Get organization statistics
   */
  public getStatistics() {
    const totalOrganizations = this.organizations.size;
    const byPlan = {
      starter: 0,
      pro: 0,
      enterprise: 0,
    };

    let totalMembers = 0;
    let customDomainsCount = 0;
    let whitelabelCount = 0;

    for (const org of this.organizations.values()) {
      byPlan[org.billing.plan]++;
      totalMembers += org.members.length;
      if (org.customDomain) customDomainsCount++;
      if (org.whiteLabel.enabled) whitelabelCount++;
    }

    return {
      totalOrganizations,
      byPlan,
      totalMembers,
      customDomainsCount,
      whitelabelCount,
      billingAccounts: this.billingAccounts.size,
      timestamp: new Date(),
    };
  }
}

// Export singleton instance
export const whiteLabelMultiTenantManager = new WhiteLabelMultiTenantManager();

