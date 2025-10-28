import Stripe from 'stripe';

// Initialize Stripe with secret key (only if key is provided)
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';

export const stripe = STRIPE_KEY ? new Stripe(STRIPE_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
}) : null;

function requireStripe(): Stripe {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.');
  }
  return stripe;
}

// Subscription plan configuration
export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    amount: 4900, // $49.00
    interval: 'month' as const,
    features: [
      'Up to 10 projects/month',
      'Basic takeoff calculator',
      'Quote generation',
      'Email support',
    ],
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    amount: 14900, // $149.00
    interval: 'month' as const,
    features: [
      'Unlimited projects',
      'Advanced takeoff with AI',
      'Site measurement integration',
      'Compliance documentation',
      'Priority support',
      'Team collaboration',
    ],
  },
  growth: {
    name: 'Growth',
    priceId: process.env.STRIPE_GROWTH_PRICE_ID || '',
    amount: 29900, // $299.00
    interval: 'month' as const,
    features: [
      'Everything in Pro',
      'Multi-team support',
      'Advanced analytics',
      'API access',
      'Custom workflows',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    amount: 0, // Custom pricing
    interval: 'month' as const,
    features: [
      'Everything in Growth',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'White-label options',
    ],
  },
} as const;

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;

// Trial period configuration
export const TRIAL_PERIOD_DAYS = 14;

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession({
  organizationId,
  planType,
  successUrl,
  cancelUrl,
  customerEmail,
}: {
  organizationId: string;
  planType: PlanType;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}) {
  const plan = SUBSCRIPTION_PLANS[planType];

  if (!plan.priceId) {
    throw new Error(`Price ID not configured for plan: ${planType}`);
  }

  const stripeClient = requireStripe();
  const session = await stripeClient.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: TRIAL_PERIOD_DAYS,
      metadata: {
        organizationId,
        planType,
      },
    },
    metadata: {
      organizationId,
      planType,
    },
    customer_email: customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: organizationId,
  });

  return session;
}

/**
 * Create a Stripe Customer Portal session for subscription management
 */
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const stripeClient = requireStripe();
  const session = await stripeClient.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Get subscription status for a user
 */
export async function getSubscriptionStatus(customerId: string) {
  const stripeClient = requireStripe();
  const subscriptions = await stripeClient.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 1,
  });

  if (subscriptions.data.length === 0) {
    return null;
  }

  const subscription = subscriptions.data[0];
  
  const sub = subscription as any;
  return {
    id: sub.id,
    status: sub.status,
    currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end || false,
    trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
    planType: (sub.metadata?.planType as PlanType) || 'starter',
  };
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(subscriptionId: string) {
  const stripeClient = requireStripe();
  const subscription = await stripeClient.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  return subscription;
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(subscriptionId: string) {
  const stripeClient = requireStripe();
  const subscription = await stripeClient.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  return subscription;
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  const stripeClient = requireStripe();
  return stripeClient.webhooks.constructEvent(payload, signature, secret);
}

