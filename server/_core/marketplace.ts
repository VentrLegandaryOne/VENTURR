/**
 * Marketplace for Third-Party Integrations
 * App listing, discovery, OAuth authentication, integration management
 * Developer portal, app ratings, revenue sharing
 */

import { EventEmitter } from 'events';

interface MarketplaceApp {
  id: string;
  name: string;
  description: string;
  category: string;
  developer: string;
  version: string;
  rating: number;
  reviews: number;
  installs: number;
  price: 'free' | 'paid' | 'freemium';
  monthlyPrice?: number;
  icon: string;
  screenshots: string[];
  documentation: string;
  oauthClientId: string;
  oauthClientSecret: string;
  webhookUrl?: string;
  scopes: string[];
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'suspended' | 'deprecated';
  featured: boolean;
}

interface AppInstallation {
  id: string;
  userId: string;
  appId: string;
  accessToken: string;
  refreshToken?: string;
  scopes: string[];
  installDate: Date;
  lastUsed: Date;
  status: 'active' | 'inactive' | 'revoked';
  settings: Record<string, unknown>;
}

interface AppReview {
  id: string;
  appId: string;
  userId: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  notHelpful: number;
  createdAt: Date;
}

interface DeveloperAccount {
  id: string;
  name: string;
  email: string;
  company: string;
  website: string;
  description: string;
  verified: boolean;
  revenue: number;
  apps: string[];
  createdAt: Date;
}

interface MarketplaceAnalytics {
  totalApps: number;
  totalInstalls: number;
  totalRevenue: number;
  topApps: string[];
  categoryBreakdown: Record<string, number>;
  averageRating: number;
}

class MarketplaceSystem extends EventEmitter {
  private apps: Map<string, MarketplaceApp> = new Map();
  private installations: Map<string, AppInstallation> = new Map();
  private reviews: Map<string, AppReview> = new Map();
  private developers: Map<string, DeveloperAccount> = new Map();
  private analytics: MarketplaceAnalytics = {
    totalApps: 0,
    totalInstalls: 0,
    totalRevenue: 0,
    topApps: [],
    categoryBreakdown: {},
    averageRating: 0,
  };

  private integrations = {
    zapier: {
      name: 'Zapier',
      description: 'Connect Venturr to 5000+ apps',
      category: 'automation',
      scopes: ['projects:read', 'quotes:read', 'quotes:write'],
    },
    slack: {
      name: 'Slack',
      description: 'Get Venturr notifications in Slack',
      category: 'communication',
      scopes: ['notifications:read', 'messages:write'],
    },
    teams: {
      name: 'Microsoft Teams',
      description: 'Integrate Venturr with Microsoft Teams',
      category: 'communication',
      scopes: ['notifications:read', 'messages:write'],
    },
    salesforce: {
      name: 'Salesforce',
      description: 'Sync projects and clients with Salesforce',
      category: 'crm',
      scopes: ['projects:read', 'clients:read', 'clients:write'],
    },
    xero: {
      name: 'Xero',
      description: 'Sync invoices and financial data',
      category: 'accounting',
      scopes: ['invoices:read', 'invoices:write', 'accounts:read'],
    },
  };

  constructor() {
    super();
    this.initializeMarketplace();
  }

  /**
   * Initialize marketplace
   */
  private initializeMarketplace(): void {
    this.loadFeaturedApps();
    console.log('[Marketplace] System initialized');
  }

  /**
   * Load featured apps
   */
  private loadFeaturedApps(): void {
    const featuredApps: Partial<MarketplaceApp>[] = [
      {
        name: 'Zapier',
        description: 'Connect Venturr to 5000+ apps including Google Sheets, Airtable, and more',
        category: 'automation',
        developer: 'Zapier Inc.',
        version: '1.0.0',
        rating: 4.8,
        reviews: 324,
        installs: 2847,
        price: 'free',
        icon: '/icons/zapier.svg',
        screenshots: ['/screenshots/zapier-1.png', '/screenshots/zapier-2.png'],
        documentation: 'https://zapier.com/help/venturr',
        scopes: ['projects:read', 'quotes:read', 'quotes:write'],
        status: 'published',
        featured: true,
      },
      {
        name: 'Slack Integration',
        description: 'Receive real-time Venturr notifications in your Slack workspace',
        category: 'communication',
        developer: 'Venturr Team',
        version: '1.2.0',
        rating: 4.9,
        reviews: 456,
        installs: 3421,
        price: 'free',
        icon: '/icons/slack.svg',
        screenshots: ['/screenshots/slack-1.png'],
        documentation: 'https://docs.venturr.com/slack',
        scopes: ['notifications:read', 'messages:write'],
        status: 'published',
        featured: true,
      },
      {
        name: 'Salesforce Connector',
        description: 'Sync Venturr projects and clients with Salesforce CRM',
        category: 'crm',
        developer: 'Venturr Team',
        version: '1.0.0',
        rating: 4.7,
        reviews: 189,
        installs: 1243,
        price: 'paid',
        monthlyPrice: 29,
        icon: '/icons/salesforce.svg',
        screenshots: ['/screenshots/salesforce-1.png', '/screenshots/salesforce-2.png'],
        documentation: 'https://docs.venturr.com/salesforce',
        scopes: ['projects:read', 'clients:read', 'clients:write'],
        status: 'published',
        featured: true,
      },
      {
        name: 'Xero Accounting',
        description: 'Automatically sync invoices and financial data to Xero',
        category: 'accounting',
        developer: 'Venturr Team',
        version: '1.1.0',
        rating: 4.6,
        reviews: 267,
        installs: 1876,
        price: 'paid',
        monthlyPrice: 39,
        icon: '/icons/xero.svg',
        screenshots: ['/screenshots/xero-1.png'],
        documentation: 'https://docs.venturr.com/xero',
        scopes: ['invoices:read', 'invoices:write', 'accounts:read'],
        status: 'published',
        featured: true,
      },
    ];

    featuredApps.forEach((appData, index) => {
      const app: MarketplaceApp = {
        id: `app-${index + 1}`,
        oauthClientId: `client-${Math.random().toString(36).substr(2, 9)}`,
        oauthClientSecret: `secret-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...appData,
      } as MarketplaceApp;

      this.apps.set(app.id, app);
    });

    this.analytics.totalApps = this.apps.size;
  }

  /**
   * Get all apps
   */
  public getAllApps(category?: string, sort: 'rating' | 'installs' | 'newest' = 'rating'): MarketplaceApp[] {
    let apps = Array.from(this.apps.values()).filter(a => a.status === 'published');

    if (category) {
      apps = apps.filter(a => a.category === category);
    }

    switch (sort) {
      case 'rating':
        return apps.sort((a, b) => b.rating - a.rating);
      case 'installs':
        return apps.sort((a, b) => b.installs - a.installs);
      case 'newest':
        return apps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      default:
        return apps;
    }
  }

  /**
   * Get featured apps
   */
  public getFeaturedApps(): MarketplaceApp[] {
    return Array.from(this.apps.values()).filter(a => a.featured && a.status === 'published');
  }

  /**
   * Get app by ID
   */
  public getApp(appId: string): MarketplaceApp | undefined {
    return this.apps.get(appId);
  }

  /**
   * Install app
   */
  public installApp(userId: string, appId: string, settings: Record<string, unknown> = {}): AppInstallation {
    const app = this.apps.get(appId);
    if (!app) {
      throw new Error('App not found');
    }

    const installation: AppInstallation = {
      id: `install-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      appId,
      accessToken: `token-${Math.random().toString(36).substr(2, 9)}`,
      scopes: app.scopes,
      installDate: new Date(),
      lastUsed: new Date(),
      status: 'active',
      settings,
    };

    this.installations.set(installation.id, installation);

    // Update app stats
    app.installs++;
    this.analytics.totalInstalls++;

    this.emit('app_installed', { userId, appId, installationId: installation.id });
    console.log(`[Marketplace] App installed: ${appId} for user ${userId}`);

    return installation;
  }

  /**
   * Uninstall app
   */
  public uninstallApp(installationId: string): boolean {
    const installation = this.installations.get(installationId);
    if (!installation) return false;

    installation.status = 'revoked';

    const app = this.apps.get(installation.appId);
    if (app) {
      app.installs = Math.max(0, app.installs - 1);
      this.analytics.totalInstalls = Math.max(0, this.analytics.totalInstalls - 1);
    }

    this.emit('app_uninstalled', { installationId });
    return true;
  }

  /**
   * Get user installations
   */
  public getUserInstallations(userId: string): AppInstallation[] {
    return Array.from(this.installations.values()).filter(i => i.userId === userId && i.status === 'active');
  }

  /**
   * Add app review
   */
  public addReview(appId: string, userId: string, rating: number, title: string, content: string): AppReview {
    const app = this.apps.get(appId);
    if (!app) {
      throw new Error('App not found');
    }

    const review: AppReview = {
      id: `review-${Date.now()}`,
      appId,
      userId,
      rating,
      title,
      content,
      helpful: 0,
      notHelpful: 0,
      createdAt: new Date(),
    };

    this.reviews.set(review.id, review);

    // Update app rating
    const appReviews = Array.from(this.reviews.values()).filter(r => r.appId === appId);
    const avgRating = appReviews.reduce((sum, r) => sum + r.rating, 0) / appReviews.length;
    app.rating = Math.round(avgRating * 10) / 10;
    app.reviews = appReviews.length;

    this.emit('review_added', { appId, reviewId: review.id });
    return review;
  }

  /**
   * Get app reviews
   */
  public getAppReviews(appId: string): AppReview[] {
    return Array.from(this.reviews.values()).filter(r => r.appId === appId);
  }

  /**
   * Create developer account
   */
  public createDeveloperAccount(name: string, email: string, company: string, website: string, description: string): DeveloperAccount {
    const developer: DeveloperAccount = {
      id: `dev-${Date.now()}`,
      name,
      email,
      company,
      website,
      description,
      verified: false,
      revenue: 0,
      apps: [],
      createdAt: new Date(),
    };

    this.developers.set(developer.id, developer);
    this.emit('developer_registered', { developerId: developer.id });

    return developer;
  }

  /**
   * Submit app for review
   */
  public submitAppForReview(developerId: string, appData: Partial<MarketplaceApp>): MarketplaceApp {
    const developer = this.developers.get(developerId);
    if (!developer) {
      throw new Error('Developer not found');
    }

    const app: MarketplaceApp = {
      id: `app-${Date.now()}`,
      oauthClientId: `client-${Math.random().toString(36).substr(2, 9)}`,
      oauthClientSecret: `secret-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      featured: false,
      rating: 0,
      reviews: 0,
      installs: 0,
      ...appData,
    } as MarketplaceApp;

    this.apps.set(app.id, app);
    developer.apps.push(app.id);

    this.emit('app_submitted', { appId: app.id, developerId });
    return app;
  }

  /**
   * Publish app
   */
  public publishApp(appId: string): boolean {
    const app = this.apps.get(appId);
    if (!app) return false;

    app.status = 'published';
    app.updatedAt = new Date();

    this.emit('app_published', { appId });
    return true;
  }

  /**
   * Get marketplace analytics
   */
  public getAnalytics(): MarketplaceAnalytics {
    const categoryBreakdown: Record<string, number> = {};
    let totalRating = 0;
    let ratingCount = 0;

    const appsArray = Array.from(this.apps.values());
    for (const app of appsArray) {
      if (app.status === 'published') {
        categoryBreakdown[app.category] = (categoryBreakdown[app.category] || 0) + 1;
        totalRating += app.rating;
        ratingCount++;
      }
    }

    return {
      ...this.analytics,
      categoryBreakdown,
      averageRating: ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0,
    };
  }

  /**
   * Get integration details
   */
  public getIntegrationDetails(integrationKey: string): any {
    return this.integrations[integrationKey as keyof typeof this.integrations];
  }

  /**
   * Get all integrations
   */
  public getAllIntegrations(): any[] {
    return Object.values(this.integrations);
  }
}

// Export singleton instance
export const marketplaceSystem = new MarketplaceSystem();

// Set up event listeners
marketplaceSystem.on('app_installed', (data) => {
  console.log('[Marketplace] App installed:', data.appId);
});

marketplaceSystem.on('app_published', (data) => {
  console.log('[Marketplace] App published:', data.appId);
});

export { MarketplaceSystem, MarketplaceApp, AppInstallation, AppReview, DeveloperAccount, MarketplaceAnalytics };

