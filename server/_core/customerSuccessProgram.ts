/**
 * Customer Success Program & Onboarding System
 * Automated onboarding workflows
 * In-app tutorials and guidance
 * Customer engagement tracking
 * Churn prevention and retention
 */

import { EventEmitter } from 'events';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: string;
  duration: number; // minutes
  completed: boolean;
  completedAt?: Date;
}

interface CustomerJourney {
  userId: string;
  stage: 'onboarding' | 'activation' | 'engagement' | 'retention' | 'expansion';
  joinDate: Date;
  lastActivityDate: Date;
  completedSteps: string[];
  engagementScore: number;
  churnRisk: 'low' | 'medium' | 'high';
}

interface InAppTutorial {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  steps: string[];
  targetAudience: 'new_user' | 'power_user' | 'admin';
  duration: number; // seconds
}

class CustomerSuccessProgram extends EventEmitter {
  private onboardingWorkflows: Map<string, OnboardingStep[]> = new Map();
  private customerJourneys: Map<string, CustomerJourney> = new Map();
  private inAppTutorials: InAppTutorial[] = [];
  private engagementCheckInterval: NodeJS.Timer | null = null;

  constructor() {
    super();
    this.initializeProgram();
  }

  /**
   * Initialize customer success program
   */
  private initializeProgram(): void {
    this.createDefaultOnboardingWorkflow();
    this.createInAppTutorials();
    this.startEngagementTracking();
    console.log('[CustomerSuccess] Program initialized');
  }

  /**
   * Create default onboarding workflow
   */
  private createDefaultOnboardingWorkflow(): void {
    const workflow: OnboardingStep[] = [
      {
        id: 'welcome',
        title: 'Welcome to Venturr',
        description: 'Get started with the platform overview',
        action: 'view_welcome_video',
        duration: 5,
        completed: false,
      },
      {
        id: 'profile_setup',
        title: 'Set Up Your Profile',
        description: 'Complete your company and personal information',
        action: 'complete_profile',
        duration: 10,
        completed: false,
      },
      {
        id: 'team_setup',
        title: 'Add Team Members',
        description: 'Invite your team to collaborate',
        action: 'invite_team_members',
        duration: 15,
        completed: false,
      },
      {
        id: 'first_measurement',
        title: 'Create Your First Measurement',
        description: 'Take a site measurement using the measurement tool',
        action: 'create_measurement',
        duration: 20,
        completed: false,
      },
      {
        id: 'first_quote',
        title: 'Generate Your First Quote',
        description: 'Create a quote from your measurement',
        action: 'generate_quote',
        duration: 10,
        completed: false,
      },
      {
        id: 'compliance_setup',
        title: 'Configure Compliance Settings',
        description: 'Set up compliance standards for your region',
        action: 'setup_compliance',
        duration: 15,
        completed: false,
      },
      {
        id: 'analytics_overview',
        title: 'Explore Analytics Dashboard',
        description: 'Learn about your business metrics and insights',
        action: 'explore_analytics',
        duration: 10,
        completed: false,
      },
      {
        id: 'mobile_app',
        title: 'Download Mobile App',
        description: 'Get the mobile app for on-site measurements',
        action: 'download_mobile_app',
        duration: 5,
        completed: false,
      },
    ];

    this.onboardingWorkflows.set('default', workflow);
  }

  /**
   * Create in-app tutorials
   */
  private createInAppTutorials(): void {
    this.inAppTutorials = [
      {
        id: 'site_measurement_101',
        title: 'Site Measurement 101',
        content: 'Learn how to accurately measure roofing sites using the Venturr measurement tool.',
        videoUrl: 'https://videos.venturr.com/site-measurement-101',
        steps: [
          'Open the measurement tool',
          'Select measurement type (metal roofing, guttering, cladding)',
          'Use camera to capture site dimensions',
          'Add photos for documentation',
          'Save measurement',
        ],
        targetAudience: 'new_user',
        duration: 480,
      },
      {
        id: 'quote_generation_101',
        title: 'Quote Generation 101',
        content: 'Master the art of creating professional quotes with Venturr.',
        videoUrl: 'https://videos.venturr.com/quote-generation-101',
        steps: [
          'Select a measurement',
          'Choose materials and specifications',
          'Review material costs',
          'Verify labor calculations',
          'Add compliance notes',
          'Generate quote PDF',
        ],
        targetAudience: 'new_user',
        duration: 600,
      },
      {
        id: 'team_collaboration',
        title: 'Team Collaboration Features',
        content: 'Learn how to collaborate effectively with your team using Venturr.',
        videoUrl: 'https://videos.venturr.com/team-collaboration',
        steps: [
          'Invite team members',
          'Assign projects',
          'Share measurements',
          'Comment on quotes',
          'Track team performance',
        ],
        targetAudience: 'new_user',
        duration: 420,
      },
      {
        id: 'advanced_quoting',
        title: 'Advanced Quoting Techniques',
        content: 'Unlock advanced features to create more accurate and profitable quotes.',
        videoUrl: 'https://videos.venturr.com/advanced-quoting',
        steps: [
          'Use custom pricing',
          'Apply bulk discounts',
          'Add optional services',
          'Create quote templates',
          'Analyze quote profitability',
        ],
        targetAudience: 'power_user',
        duration: 540,
      },
      {
        id: 'analytics_mastery',
        title: 'Analytics Dashboard Mastery',
        content: 'Become an expert at using Venturr analytics to grow your business.',
        videoUrl: 'https://videos.venturr.com/analytics-mastery',
        steps: [
          'View executive summary',
          'Analyze quote metrics',
          'Track team performance',
          'Monitor customer satisfaction',
          'Use predictive insights',
        ],
        targetAudience: 'power_user',
        duration: 480,
      },
      {
        id: 'admin_setup',
        title: 'Administrator Setup Guide',
        content: 'Complete guide for administrators to set up and manage Venturr.',
        videoUrl: 'https://videos.venturr.com/admin-setup',
        steps: [
          'Configure organization settings',
          'Set up compliance standards',
          'Manage user roles',
          'Configure integrations',
          'Set up billing',
        ],
        targetAudience: 'admin',
        duration: 720,
      },
    ];
  }

  /**
   * Start engagement tracking
   */
  private startEngagementTracking(): void {
    this.engagementCheckInterval = setInterval(() => {
      this.analyzeCustomerEngagement();
      this.identifyChurnRisks();
      this.sendEngagementNotifications();
    }, 3600000); // Every hour
  }

  /**
   * Register user for onboarding
   */
  public registerUserForOnboarding(userId: string): void {
    const workflow = this.onboardingWorkflows.get('default');
    if (!workflow) return;

    // Create a copy of the workflow for this user
    const userWorkflow = workflow.map(step => ({ ...step }));
    this.onboardingWorkflows.set(`user-${userId}`, userWorkflow);

    // Create customer journey
    const journey: CustomerJourney = {
      userId,
      stage: 'onboarding',
      joinDate: new Date(),
      lastActivityDate: new Date(),
      completedSteps: [],
      engagementScore: 0,
      churnRisk: 'low',
    };

    this.customerJourneys.set(userId, journey);

    this.emit('user_registered', { userId, workflow: userWorkflow });
    console.log(`[CustomerSuccess] User ${userId} registered for onboarding`);
  }

  /**
   * Complete onboarding step
   */
  public completeOnboardingStep(userId: string, stepId: string): void {
    const workflow = this.onboardingWorkflows.get(`user-${userId}`);
    if (!workflow) return;

    const step = workflow.find(s => s.id === stepId);
    if (!step) return;

    step.completed = true;
    step.completedAt = new Date();

    const journey = this.customerJourneys.get(userId);
    if (journey) {
      journey.completedSteps.push(stepId);
      journey.lastActivityDate = new Date();
      journey.engagementScore += 10;

      // Move to next stage if onboarding complete
      if (journey.completedSteps.length === workflow.length) {
        journey.stage = 'activation';
        this.emit('onboarding_complete', { userId, journey });
      }
    }

    this.emit('step_completed', { userId, stepId, journey });
    console.log(`[CustomerSuccess] User ${userId} completed step: ${stepId}`);
  }

  /**
   * Get onboarding progress
   */
  public getOnboardingProgress(userId: string): {
    totalSteps: number;
    completedSteps: number;
    percentage: number;
    nextStep?: OnboardingStep;
  } {
    const workflow = this.onboardingWorkflows.get(`user-${userId}`);
    if (!workflow) {
      return { totalSteps: 0, completedSteps: 0, percentage: 0 };
    }

    const completedSteps = workflow.filter(s => s.completed).length;
    const nextStep = workflow.find(s => !s.completed);

    return {
      totalSteps: workflow.length,
      completedSteps,
      percentage: Math.round((completedSteps / workflow.length) * 100),
      nextStep,
    };
  }

  /**
   * Get in-app tutorial
   */
  public getInAppTutorial(tutorialId: string): InAppTutorial | undefined {
    return this.inAppTutorials.find(t => t.id === tutorialId);
  }

  /**
   * Get recommended tutorials for user
   */
  public getRecommendedTutorials(userId: string, audience: 'new_user' | 'power_user' | 'admin'): InAppTutorial[] {
    return this.inAppTutorials.filter(t => t.targetAudience === audience);
  }

  /**
   * Analyze customer engagement
   */
  private analyzeCustomerEngagement(): void {
    for (const [userId, journey] of this.customerJourneys) {
      const daysSinceJoin = (Date.now() - journey.joinDate.getTime()) / (1000 * 60 * 60 * 24);
      const daysSinceActivity = (Date.now() - journey.lastActivityDate.getTime()) / (1000 * 60 * 60 * 24);

      // Update engagement score based on activity
      if (daysSinceActivity < 1) {
        journey.engagementScore = Math.min(100, journey.engagementScore + 5);
      } else if (daysSinceActivity > 7) {
        journey.engagementScore = Math.max(0, journey.engagementScore - 10);
      }

      // Update stage based on progress
      if (journey.stage === 'onboarding' && daysSinceJoin > 7) {
        journey.stage = 'activation';
      } else if (journey.stage === 'activation' && journey.engagementScore > 50) {
        journey.stage = 'engagement';
      }
    }
  }

  /**
   * Identify churn risks
   */
  private identifyChurnRisks(): void {
    for (const [userId, journey] of this.customerJourneys) {
      const daysSinceActivity = (Date.now() - journey.lastActivityDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceActivity > 30) {
        journey.churnRisk = 'high';
        this.emit('high_churn_risk', { userId, journey });
      } else if (daysSinceActivity > 14) {
        journey.churnRisk = 'medium';
        this.emit('medium_churn_risk', { userId, journey });
      } else {
        journey.churnRisk = 'low';
      }
    }
  }

  /**
   * Send engagement notifications
   */
  private sendEngagementNotifications(): void {
    for (const [userId, journey] of this.customerJourneys) {
      if (journey.churnRisk === 'high') {
        this.emit('send_notification', {
          userId,
          type: 'churn_prevention',
          message: 'We miss you! Check out new features and get back to growing your business.',
          action: 'open_app',
        });
      } else if (journey.stage === 'onboarding') {
        const progress = this.getOnboardingProgress(userId);
        if (progress.nextStep) {
          this.emit('send_notification', {
            userId,
            type: 'onboarding_reminder',
            message: `Complete your onboarding: ${progress.nextStep.title}`,
            action: 'complete_step',
          });
        }
      }
    }
  }

  /**
   * Get customer journey
   */
  public getCustomerJourney(userId: string): CustomerJourney | undefined {
    return this.customerJourneys.get(userId);
  }

  /**
   * Get all customer journeys
   */
  public getAllCustomerJourneys(): CustomerJourney[] {
    return Array.from(this.customerJourneys.values());
  }

  /**
   * Get churn risk summary
   */
  public getChurnRiskSummary() {
    const journeys = Array.from(this.customerJourneys.values());
    return {
      total: journeys.length,
      highRisk: journeys.filter(j => j.churnRisk === 'high').length,
      mediumRisk: journeys.filter(j => j.churnRisk === 'medium').length,
      lowRisk: journeys.filter(j => j.churnRisk === 'low').length,
    };
  }

  /**
   * Stop engagement tracking
   */
  public stop(): void {
    if (this.engagementCheckInterval) {
      clearInterval(this.engagementCheckInterval);
      this.engagementCheckInterval = null;
    }
    console.log('[CustomerSuccess] Program stopped');
  }
}

// Export singleton instance
export const customerSuccessProgram = new CustomerSuccessProgram();

// Set up event listeners
customerSuccessProgram.on('user_registered', (data) => {
  console.log('[CustomerSuccess] User registered:', data.userId);
});

customerSuccessProgram.on('step_completed', (data) => {
  console.log('[CustomerSuccess] Step completed:', data.stepId);
});

customerSuccessProgram.on('onboarding_complete', (data) => {
  console.log('[CustomerSuccess] Onboarding complete:', data.userId);
});

customerSuccessProgram.on('high_churn_risk', (data) => {
  console.warn('[CustomerSuccess] High churn risk:', data.userId);
});

export { CustomerSuccessProgram, OnboardingStep, CustomerJourney, InAppTutorial };

