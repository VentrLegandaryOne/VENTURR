/**
 * Third-Party Integrations Module
 * Handles integration with external services (Stripe, SendGrid, Slack, etc.)
 */

import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';

// Integration types
export type IntegrationType = 'stripe' | 'sendgrid' | 'slack' | 'google_maps' | 'twilio' | 'zapier';

export interface IntegrationConfig {
  type: IntegrationType;
  apiKey: string;
  apiSecret?: string;
  webhookUrl?: string;
  enabled: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  customerId: string;
  metadata?: Record<string, any>;
}

export interface EmailMessage {
  to: string[];
  from: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
}

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: any[];
  attachments?: any[];
}

// Validation schemas
const IntegrationConfigSchema = z.object({
  type: z.enum(['stripe', 'sendgrid', 'slack', 'google_maps', 'twilio', 'zapier']),
  apiKey: z.string(),
  apiSecret: z.string().optional(),
  webhookUrl: z.string().url().optional(),
  enabled: z.boolean().default(true),
});

// Integration Manager
export class IntegrationManager {
  private configs: Map<IntegrationType, IntegrationConfig> = new Map();
  private clients: Map<IntegrationType, AxiosInstance> = new Map();

  /**
   * Initialize integration
   */
  initialize(config: IntegrationConfig): void {
    const validated = IntegrationConfigSchema.parse(config);
    this.configs.set(config.type, validated);

    if (validated.enabled) {
      this.setupClient(config.type, validated);
    }
  }

  /**
   * Setup HTTP client for integration
   */
  private setupClient(type: IntegrationType, config: IntegrationConfig): void {
    const baseURLs: Record<IntegrationType, string> = {
      stripe: 'https://api.stripe.com/v1',
      sendgrid: 'https://api.sendgrid.com/v3',
      slack: 'https://slack.com/api',
      google_maps: 'https://maps.googleapis.com',
      twilio: 'https://api.twilio.com/2010-04-01',
      zapier: 'https://hooks.zapier.com/hooks/catch',
    };

    const client = axios.create({
      baseURL: baseURLs[type],
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    this.clients.set(type, client);
  }

  /**
   * Get client for integration
   */
  private getClient(type: IntegrationType): AxiosInstance {
    const client = this.clients.get(type);
    if (!client) {
      throw new Error(`Integration ${type} not initialized`);
    }
    return client;
  }

  // ==================== STRIPE INTEGRATION ====================

  /**
   * Create Stripe payment intent
   */
  async createPaymentIntent(
    amount: number,
    customerId: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    try {
      const client = this.getClient('stripe');
      const response = await client.post('/payment_intents', {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'aud',
        customer: customerId,
        metadata,
      });

      return {
        id: response.data.id,
        amount,
        currency: 'aud',
        status: response.data.status,
        customerId,
        metadata,
      };
    } catch (error) {
      console.error('[Stripe] Payment intent creation failed:', error);
      throw error;
    }
  }

  /**
   * Confirm Stripe payment
   */
  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<PaymentIntent> {
    try {
      const client = this.getClient('stripe');
      const response = await client.post(`/payment_intents/${paymentIntentId}/confirm`, {
        payment_method: paymentMethodId,
      });

      return {
        id: response.data.id,
        amount: response.data.amount / 100,
        currency: response.data.currency,
        status: response.data.status,
        customerId: response.data.customer,
      };
    } catch (error) {
      console.error('[Stripe] Payment confirmation failed:', error);
      throw error;
    }
  }

  /**
   * Create Stripe customer
   */
  async createCustomer(email: string, name: string): Promise<string> {
    try {
      const client = this.getClient('stripe');
      const response = await client.post('/customers', { email, name });
      return response.data.id;
    } catch (error) {
      console.error('[Stripe] Customer creation failed:', error);
      throw error;
    }
  }

  // ==================== SENDGRID INTEGRATION ====================

  /**
   * Send email via SendGrid
   */
  async sendEmail(message: EmailMessage): Promise<{ messageId: string; status: string }> {
    try {
      const client = this.getClient('sendgrid');
      const response = await client.post('/mail/send', {
        personalizations: [
          {
            to: message.to.map(email => ({ email })),
          },
        ],
        from: { email: message.from },
        subject: message.subject,
        content: [
          {
            type: 'text/html',
            value: message.html,
          },
        ],
        attachments: message.attachments?.map(att => ({
          filename: att.filename,
          content: att.content.toString('base64'),
          type: 'application/octet-stream',
        })),
      });

      return {
        messageId: response.headers['x-message-id'] || 'unknown',
        status: 'sent',
      };
    } catch (error) {
      console.error('[SendGrid] Email send failed:', error);
      throw error;
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(messages: EmailMessage[]): Promise<Array<{ email: string; status: string }>> {
    const results: Array<{ email: string; status: string }> = [];

    for (const message of messages) {
      try {
        await this.sendEmail(message);
        message.to.forEach(email => {
          results.push({ email, status: 'sent' });
        });
      } catch (error) {
        message.to.forEach(email => {
          results.push({ email, status: 'failed' });
        });
      }
    }

    return results;
  }

  // ==================== SLACK INTEGRATION ====================

  /**
   * Send Slack message
   */
  async sendSlackMessage(message: SlackMessage): Promise<{ ok: boolean; ts: string }> {
    try {
      const client = this.getClient('slack');
      const response = await client.post('/chat.postMessage', {
        channel: message.channel,
        text: message.text,
        blocks: message.blocks,
        attachments: message.attachments,
      });

      return {
        ok: response.data.ok,
        ts: response.data.ts,
      };
    } catch (error) {
      console.error('[Slack] Message send failed:', error);
      throw error;
    }
  }

  /**
   * Send Slack notification
   */
  async notifySlack(channel: string, title: string, message: string, color: string = '#0099ff'): Promise<void> {
    await this.sendSlackMessage({
      channel,
      text: title,
      attachments: [
        {
          color,
          text: message,
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    });
  }

  // ==================== GOOGLE MAPS INTEGRATION ====================

  /**
   * Geocode address to coordinates
   */
  async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number }> {
    try {
      const client = this.getClient('google_maps');
      const response = await client.get('/geocoding/json', {
        params: { address },
      });

      if (response.data.results.length === 0) {
        throw new Error('Address not found');
      }

      const location = response.data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    } catch (error) {
      console.error('[Google Maps] Geocoding failed:', error);
      throw error;
    }
  }

  /**
   * Get distance between two locations
   */
  async getDistance(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ): Promise<{ distance: number; duration: number }> {
    try {
      const client = this.getClient('google_maps');
      const response = await client.get('/distancematrix/json', {
        params: {
          origins: `${origin.latitude},${origin.longitude}`,
          destinations: `${destination.latitude},${destination.longitude}`,
          units: 'metric',
        },
      });

      const element = response.data.rows[0].elements[0];
      return {
        distance: element.distance.value / 1000, // Convert to km
        duration: element.duration.value / 60, // Convert to minutes
      };
    } catch (error) {
      console.error('[Google Maps] Distance calculation failed:', error);
      throw error;
    }
  }

  // ==================== TWILIO INTEGRATION ====================

  /**
   * Send SMS via Twilio
   */
  async sendSMS(to: string, message: string): Promise<{ messageId: string; status: string }> {
    try {
      const client = this.getClient('twilio');
      const config = this.configs.get('twilio');
      if (!config?.apiSecret) throw new Error('Twilio account SID not configured');

      const response = await client.post(
        `/${config.apiSecret}/Messages.json`,
        new URLSearchParams({
          From: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
          To: to,
          Body: message,
        })
      );

      return {
        messageId: response.data.sid,
        status: response.data.status,
      };
    } catch (error) {
      console.error('[Twilio] SMS send failed:', error);
      throw error;
    }
  }

  // ==================== ZAPIER INTEGRATION ====================

  /**
   * Trigger Zapier webhook
   */
  async triggerZapier(webhookId: string, data: Record<string, any>): Promise<{ success: boolean }> {
    try {
      const client = this.getClient('zapier');
      await client.post(`/${webhookId}`, data);
      return { success: true };
    } catch (error) {
      console.error('[Zapier] Webhook trigger failed:', error);
      throw error;
    }
  }

  /**
   * Get integration status
   */
  getStatus(type: IntegrationType): { enabled: boolean; configured: boolean } {
    const config = this.configs.get(type);
    return {
      enabled: config?.enabled || false,
      configured: !!config,
    };
  }

  /**
   * Get all integration statuses
   */
  getAllStatuses(): Record<IntegrationType, { enabled: boolean; configured: boolean }> {
    const statuses: Record<IntegrationType, { enabled: boolean; configured: boolean }> = {
      stripe: this.getStatus('stripe'),
      sendgrid: this.getStatus('sendgrid'),
      slack: this.getStatus('slack'),
      google_maps: this.getStatus('google_maps'),
      twilio: this.getStatus('twilio'),
      zapier: this.getStatus('zapier'),
    };
    return statuses;
  }
}

// Export singleton instance
export const integrationManager = new IntegrationManager();

