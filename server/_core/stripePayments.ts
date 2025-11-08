/**
 * Stripe Payment Processing System
 * Subscription management, one-time payments, webhooks, invoices
 */

import Stripe from 'stripe';

export interface SubscriptionPlan {
  id: string;
  name: 'starter' | 'pro' | 'enterprise';
  priceId: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  maxProjects: number;
  maxTeamMembers: number;
  maxStorage: number; // GB
}

export interface CustomerSubscription {
  id: string;
  customerId: string;
  subscriptionId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date;
  createdAt: Date;
}

export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'processing' | 'requires_payment_method' | 'failed';
  type: 'subscription' | 'one_time' | 'invoice';
  description: string;
  invoiceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  customerId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  dueDate: Date;
  paidAt?: Date;
  items: Array<{
    description: string;
    amount: number;
    quantity: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

class StripePaymentManager {
  private stripe: Stripe;
  private subscriptionPlans: Map<string, SubscriptionPlan>;
  private customerSubscriptions: Map<string, CustomerSubscription[]> = new Map();
  private payments: Map<string, Payment[]> = new Map();
  private invoices: Map<string, Invoice[]> = new Map();

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2024-04-10',
    });

    // Initialize subscription plans
    this.subscriptionPlans = new Map([
      [
        'starter',
        {
          id: 'starter',
          name: 'starter',
          priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
          amount: 2999, // $29.99
          currency: 'usd',
          interval: 'month',
          features: [
            'Up to 5 projects',
            'Basic analytics',
            'Email support',
            '10 GB storage',
            'Team chat',
          ],
          maxProjects: 5,
          maxTeamMembers: 3,
          maxStorage: 10,
        },
      ],
      [
        'pro',
        {
          id: 'pro',
          name: 'pro',
          priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
          amount: 7999, // $79.99
          currency: 'usd',
          interval: 'month',
          features: [
            'Unlimited projects',
            'Advanced analytics',
            'Priority support',
            '100 GB storage',
            'Team collaboration',
            'API access',
            'Custom integrations',
          ],
          maxProjects: 999,
          maxTeamMembers: 10,
          maxStorage: 100,
        },
      ],
      [
        'enterprise',
        {
          id: 'enterprise',
          name: 'enterprise',
          priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
          amount: 29999, // $299.99
          currency: 'usd',
          interval: 'month',
          features: [
            'Unlimited everything',
            'Dedicated account manager',
            '24/7 phone support',
            'Unlimited storage',
            'Advanced security',
            'Custom workflows',
            'White-label options',
            'SLA guarantee',
          ],
          maxProjects: 99999,
          maxTeamMembers: 999,
          maxStorage: 10000,
        },
      ],
    ]);
  }

  /**
   * Create a customer in Stripe
   */
  public async createCustomer(
    userId: string,
    email: string,
    name: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
          ...metadata,
        },
      });

      console.log(`[Stripe] Customer created: ${customer.id}`);
      return customer.id;
    } catch (error) {
      console.error('[Stripe] Failed to create customer:', error);
      throw error;
    }
  }

  /**
   * Create subscription
   */
  public async createSubscription(
    customerId: string,
    planId: 'starter' | 'pro' | 'enterprise'
  ): Promise<CustomerSubscription> {
    try {
      const plan = this.subscriptionPlans.get(planId);
      if (!plan) throw new Error(`Plan not found: ${planId}`);

      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: plan.priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      const customerSubscription: CustomerSubscription = {
        id: `sub-${Date.now()}`,
        customerId,
        subscriptionId: subscription.id,
        plan,
        status: subscription.status as any,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        createdAt: new Date(),
      };

      if (!this.customerSubscriptions.has(customerId)) {
        this.customerSubscriptions.set(customerId, []);
      }
      this.customerSubscriptions.get(customerId)!.push(customerSubscription);

      console.log(`[Stripe] Subscription created: ${subscription.id}`);
      return customerSubscription;
    } catch (error) {
      console.error('[Stripe] Failed to create subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  public async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await this.stripe.subscriptions.del(subscriptionId);

      // Update local record
      for (const [, subs] of this.customerSubscriptions) {
        const sub = subs.find((s) => s.subscriptionId === subscriptionId);
        if (sub) {
          sub.status = 'canceled';
          sub.canceledAt = new Date();
        }
      }

      console.log(`[Stripe] Subscription canceled: ${subscriptionId}`);
    } catch (error) {
      console.error('[Stripe] Failed to cancel subscription:', error);
      throw error;
    }
  }

  /**
   * Create one-time payment
   */
  public async createPaymentIntent(
    customerId: string,
    amount: number,
    description: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        customer: customerId,
        description,
        metadata: {
          customerId,
          ...metadata,
        },
      });

      const payment: Payment = {
        id: `pay-${Date.now()}`,
        customerId,
        amount,
        currency: 'usd',
        status: paymentIntent.status as any,
        type: 'one_time',
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!this.payments.has(customerId)) {
        this.payments.set(customerId, []);
      }
      this.payments.get(customerId)!.push(payment);

      console.log(`[Stripe] Payment intent created: ${paymentIntent.id}`);
      return paymentIntent.client_secret || '';
    } catch (error) {
      console.error('[Stripe] Failed to create payment intent:', error);
      throw error;
    }
  }

  /**
   * Create invoice
   */
  public async createInvoice(
    customerId: string,
    items: Array<{ description: string; amount: number; quantity: number }>,
    dueDate: Date = new Date(Date.now() + 30 * 86400000)
  ): Promise<Invoice> {
    try {
      const totalAmount = items.reduce((sum, item) => sum + item.amount * item.quantity, 0);

      const stripeInvoice = await this.stripe.invoices.create({
        customer: customerId,
        due_date: Math.floor(dueDate.getTime() / 1000),
        description: 'Project Invoice',
      });

      // Add line items
      for (const item of items) {
        await this.stripe.invoiceItems.create({
          customer: customerId,
          invoice: stripeInvoice.id,
          description: item.description,
          amount: item.amount * item.quantity,
          currency: 'usd',
        });
      }

      const invoice: Invoice = {
        id: `inv-${Date.now()}`,
        customerId,
        invoiceId: stripeInvoice.id,
        amount: totalAmount,
        currency: 'usd',
        status: stripeInvoice.status as any,
        dueDate,
        items,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!this.invoices.has(customerId)) {
        this.invoices.set(customerId, []);
      }
      this.invoices.get(customerId)!.push(invoice);

      console.log(`[Stripe] Invoice created: ${stripeInvoice.id}`);
      return invoice;
    } catch (error) {
      console.error('[Stripe] Failed to create invoice:', error);
      throw error;
    }
  }

  /**
   * Send invoice to customer
   */
  public async sendInvoice(invoiceId: string): Promise<void> {
    try {
      await this.stripe.invoices.sendInvoice(invoiceId);
      console.log(`[Stripe] Invoice sent: ${invoiceId}`);
    } catch (error) {
      console.error('[Stripe] Failed to send invoice:', error);
      throw error;
    }
  }

  /**
   * Get customer subscriptions
   */
  public getCustomerSubscriptions(customerId: string): CustomerSubscription[] {
    return this.customerSubscriptions.get(customerId) || [];
  }

  /**
   * Get customer payments
   */
  public getCustomerPayments(customerId: string): Payment[] {
    return this.payments.get(customerId) || [];
  }

  /**
   * Get customer invoices
   */
  public getCustomerInvoices(customerId: string): Invoice[] {
    return this.invoices.get(customerId) || [];
  }

  /**
   * Get subscription plan
   */
  public getSubscriptionPlan(planId: string): SubscriptionPlan | undefined {
    return this.subscriptionPlans.get(planId);
  }

  /**
   * Get all subscription plans
   */
  public getAllSubscriptionPlans(): SubscriptionPlan[] {
    return Array.from(this.subscriptionPlans.values());
  }

  /**
   * Handle webhook event
   */
  public async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          console.log('[Stripe] Payment succeeded:', event.data.object);
          break;

        case 'payment_intent.payment_failed':
          console.log('[Stripe] Payment failed:', event.data.object);
          break;

        case 'customer.subscription.updated':
          console.log('[Stripe] Subscription updated:', event.data.object);
          break;

        case 'customer.subscription.deleted':
          console.log('[Stripe] Subscription deleted:', event.data.object);
          break;

        case 'invoice.payment_succeeded':
          console.log('[Stripe] Invoice paid:', event.data.object);
          break;

        case 'invoice.payment_failed':
          console.log('[Stripe] Invoice payment failed:', event.data.object);
          break;

        default:
          console.log('[Stripe] Unhandled webhook event:', event.type);
      }
    } catch (error) {
      console.error('[Stripe] Error handling webhook:', error);
      throw error;
    }
  }

  /**
   * Get revenue metrics
   */
  public getRevenueMetrics() {
    let totalRevenue = 0;
    let activeSubscriptions = 0;
    let totalPayments = 0;

    for (const [, subs] of this.customerSubscriptions) {
      for (const sub of subs) {
        if (sub.status === 'active') {
          activeSubscriptions++;
          totalRevenue += sub.plan.amount;
        }
      }
    }

    for (const [, payments] of this.payments) {
      for (const payment of payments) {
        if (payment.status === 'succeeded') {
          totalRevenue += payment.amount;
          totalPayments++;
        }
      }
    }

    return {
      totalRevenue: totalRevenue / 100, // Convert from cents
      activeSubscriptions,
      totalPayments,
      monthlyRecurringRevenue: (activeSubscriptions * 7999) / 100, // Assuming avg Pro plan
    };
  }
}

// Export singleton instance
export const stripePaymentManager = new StripePaymentManager(
  process.env.STRIPE_SECRET_KEY || ''
);

