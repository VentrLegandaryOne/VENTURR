import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { organizations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
  SUBSCRIPTION_PLANS,
  type PlanType,
} from "../lib/stripe";

export const subscriptionsRouter = router({
  /**
   * Get current organization's subscription status
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Get user's organization
    const orgs = await db
      .select()
      .from(organizations)
      .where(eq(organizations.ownerId, userId))
      .limit(1);

    if (orgs.length === 0) {
      return null;
    }

    const org = orgs[0];

    // If no Stripe customer ID, they haven't subscribed yet
    if (!org.stripeCustomerId) {
      return {
        status: 'none' as const,
        plan: org.subscriptionPlan,
        trialEnd: null,
        currentPeriodEnd: org.currentPeriodEnd,
      };
    }

    // Get subscription from Stripe
    const subscription = await getSubscriptionStatus(org.stripeCustomerId);

    return {
      status: org.subscriptionStatus,
      plan: org.subscriptionPlan,
      trialEnd: subscription?.trialEnd || null,
      currentPeriodEnd: subscription?.currentPeriodEnd || org.currentPeriodEnd,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
    };
  }),

  /**
   * Create a Stripe Checkout session for subscription
   */
  createCheckout: protectedProcedure
    .input(
      z.object({
        planType: z.enum(['starter', 'pro', 'growth', 'enterprise']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('[Stripe Checkout] Starting checkout creation', { user: ctx.user, planType: input.planType });
      
      if (!ctx.user) {
        console.error('[Stripe Checkout] No user in context');
        throw new Error('User not authenticated');
      }
      
      const userId = ctx.user.id;
      const userEmail = ctx.user.email;
      console.log('[Stripe Checkout] User authenticated', { userId, userEmail });
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Get or create organization
      let orgs = await db
        .select()
        .from(organizations)
        .where(eq(organizations.ownerId, userId))
        .limit(1);

      let organizationId: string;

      if (orgs.length === 0) {
        // Create organization if it doesn't exist
        const newOrgId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.insert(organizations).values({
          id: newOrgId,
          name: `${ctx.user.name || 'My'} Organization`,
          ownerId: userId,
          subscriptionPlan: input.planType as any,
          subscriptionStatus: 'trialing',
        });
        organizationId = newOrgId;
      } else {
        organizationId = orgs[0].id;
      }

      // Create Stripe Checkout session
      const session = await createCheckoutSession({
        organizationId,
        planType: input.planType as PlanType,
        successUrl: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/dashboard?subscription=success`,
        cancelUrl: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/pricing?subscription=canceled`,
        customerEmail: userEmail || undefined,
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),

  /**
   * Create a Stripe Customer Portal session for subscription management
   */
  createPortal: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Get user's organization
    const orgs = await db
      .select()
      .from(organizations)
      .where(eq(organizations.ownerId, userId))
      .limit(1);

    if (orgs.length === 0 || !orgs[0].stripeCustomerId) {
      throw new Error('No active subscription found');
    }

    const org = orgs[0];

    // Create portal session
    const session = await createPortalSession({
      customerId: org.stripeCustomerId!,
      returnUrl: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/dashboard`,
    });

    return {
      url: session.url,
    };
  }),

  /**
   * Get available subscription plans
   */
  getPlans: protectedProcedure.query(async () => {
    return Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      amount: plan.amount,
      interval: plan.interval,
      features: plan.features,
    }));
  }),
});

