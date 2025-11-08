/**
 * tRPC Routers for Advanced Features
 * Chatbot, Marketplace, and Pricing Engine endpoints
 */

import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { chatbotSystem } from "../_core/chatbot";
import { marketplaceSystem } from "../_core/marketplace";
import { pricingEngine } from "../_core/pricingEngine";

/**
 * Chatbot Router
 */
export const chatbotRouter = router({
  // Create new chat session
  createSession: protectedProcedure
    .input(z.object({
      title: z.string().optional().default("New Chat"),
    }))
    .mutation(({ ctx, input }) => {
      const session = chatbotSystem.createChatSession(ctx.user.id, input.title);
      return {
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
      };
    }),

  // Send message and get response
  sendMessage: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      message: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const response = await chatbotSystem.sendMessage(
          input.sessionId,
          ctx.user.id,
          input.message
        );
        return { success: true, response };
      } catch (error) {
        return { success: false, error: "Failed to process message" };
      }
    }),

  // Get chat session
  getSession: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .query(({ input }) => {
      const session = chatbotSystem.getChatSession(input.sessionId);
      if (!session) return null;

      return {
        id: session.id,
        title: session.title,
        messages: session.messages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
          sentiment: m.sentiment,
        })),
        status: session.status,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      };
    }),

  // Get user chat sessions
  getSessions: protectedProcedure.query(({ ctx }) => {
    const sessions = chatbotSystem.getUserChatSessions(ctx.user.id);
    return sessions.map(s => ({
      id: s.id,
      title: s.title,
      status: s.status,
      messageCount: s.messages.length,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }),

  // Close chat session
  closeSession: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .mutation(({ input }) => {
      return chatbotSystem.closeChatSession(input.sessionId);
    }),

  // Get chatbot analytics
  getAnalytics: protectedProcedure.query(() => {
    return chatbotSystem.getAnalytics();
  }),

  // Get FAQ database
  getFAQ: protectedProcedure.query(() => {
    return chatbotSystem.getFAQDatabase();
  }),

  // Mark FAQ as helpful
  markFAQHelpful: protectedProcedure
    .input(z.object({
      faqId: z.string(),
      helpful: z.boolean(),
    }))
    .mutation(({ input }) => {
      return chatbotSystem.markFAQHelpful(input.faqId, input.helpful);
    }),
});

/**
 * Marketplace Router
 */
export const marketplaceRouter = router({
  // Get all apps
  getApps: protectedProcedure
    .input(z.object({
      category: z.string().optional(),
      sort: z.enum(["rating", "installs", "newest"]).optional().default("rating"),
    }))
    .query(({ input }) => {
      const apps = marketplaceSystem.getAllApps(input.category, input.sort);
      return apps.map(app => ({
        id: app.id,
        name: app.name,
        description: app.description,
        category: app.category,
        developer: app.developer,
        version: app.version,
        rating: app.rating,
        reviews: app.reviews,
        installs: app.installs,
        price: app.price,
        monthlyPrice: app.monthlyPrice,
        icon: app.icon,
        featured: app.featured,
      }));
    }),

  // Get featured apps
  getFeatured: protectedProcedure.query(() => {
    const apps = marketplaceSystem.getFeaturedApps();
    return apps.map(app => ({
      id: app.id,
      name: app.name,
      description: app.description,
      icon: app.icon,
      rating: app.rating,
      installs: app.installs,
    }));
  }),

  // Get app details
  getApp: protectedProcedure
    .input(z.object({
      appId: z.string(),
    }))
    .query(({ input }) => {
      const app = marketplaceSystem.getApp(input.appId);
      if (!app) return null;

      return {
        id: app.id,
        name: app.name,
        description: app.description,
        category: app.category,
        developer: app.developer,
        version: app.version,
        rating: app.rating,
        reviews: app.reviews,
        installs: app.installs,
        price: app.price,
        monthlyPrice: app.monthlyPrice,
        icon: app.icon,
        screenshots: app.screenshots,
        documentation: app.documentation,
        scopes: app.scopes,
      };
    }),

  // Install app
  installApp: protectedProcedure
    .input(z.object({
      appId: z.string(),
      settings: z.record(z.unknown()).optional(),
    }))
    .mutation(({ ctx, input }) => {
      const installation = marketplaceSystem.installApp(
        ctx.user.id,
        input.appId,
        input.settings
      );
      return {
        id: installation.id,
        accessToken: installation.accessToken,
        status: installation.status,
      };
    }),

  // Get user installations
  getInstallations: protectedProcedure.query(({ ctx }) => {
    const installations = marketplaceSystem.getUserInstallations(ctx.user.id);
    return installations.map(i => ({
      id: i.id,
      appId: i.appId,
      status: i.status,
      installDate: i.installDate,
      lastUsed: i.lastUsed,
    }));
  }),

  // Uninstall app
  uninstallApp: protectedProcedure
    .input(z.object({
      installationId: z.string(),
    }))
    .mutation(({ input }) => {
      return marketplaceSystem.uninstallApp(input.installationId);
    }),

  // Add review
  addReview: protectedProcedure
    .input(z.object({
      appId: z.string(),
      rating: z.number().min(1).max(5),
      title: z.string(),
      content: z.string(),
    }))
    .mutation(({ ctx, input }) => {
      const review = marketplaceSystem.addReview(
        input.appId,
        ctx.user.id,
        input.rating,
        input.title,
        input.content
      );
      return { id: review.id, createdAt: review.createdAt };
    }),

  // Get app reviews
  getReviews: protectedProcedure
    .input(z.object({
      appId: z.string(),
    }))
    .query(({ input }) => {
      return marketplaceSystem.getAppReviews(input.appId);
    }),

  // Get marketplace analytics
  getAnalytics: protectedProcedure.query(() => {
    return marketplaceSystem.getAnalytics();
  }),

  // Get integrations
  getIntegrations: protectedProcedure.query(() => {
    return marketplaceSystem.getAllIntegrations();
  }),
});

/**
 * Pricing Engine Router
 */
export const pricingRouter = router({
  // Get pricing recommendation
  getRecommendation: protectedProcedure
    .input(z.object({
      projectId: z.string().optional(),
      materialCost: z.number(),
      laborCost: z.number(),
      projectType: z.string().optional(),
      location: z.string().optional(),
      complexity: z.enum(["low", "medium", "high"]).optional(),
      teamSize: z.number().optional(),
    }))
    .query(({ input }) => {
      return pricingEngine.getPricingRecommendation(input);
    }),

  // Record pricing data
  recordPricing: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      materialCost: z.number(),
      laborCost: z.number(),
      quotedPrice: z.number(),
      acceptedPrice: z.number().optional(),
      projectType: z.string(),
      location: z.string(),
      complexity: z.enum(["low", "medium", "high"]),
      teamSize: z.number(),
      accepted: z.boolean(),
      profitMargin: z.number(),
    }))
    .mutation(({ input }) => {
      pricingEngine.recordPricingData({
        ...input,
        date: new Date(),
      });
      return { success: true };
    }),

  // Get pricing metrics
  getMetrics: protectedProcedure.query(() => {
    return pricingEngine.getMetrics();
  }),

  // Get revenue forecast
  getRevenueForecast: protectedProcedure
    .input(z.object({
      months: z.number().optional().default(12),
    }))
    .query(({ input }) => {
      return pricingEngine.getRevenueForecast(input.months);
    }),

  // Run A/B test
  runABTest: protectedProcedure
    .input(z.object({
      strategyA: z.object({
        name: z.string(),
        priceMultiplier: z.number(),
      }),
      strategyB: z.object({
        name: z.string(),
        priceMultiplier: z.number(),
      }),
    }))
    .mutation(({ input }) => {
      return pricingEngine.runABTest(input.strategyA, input.strategyB);
    }),

  // Get ML model info
  getModelInfo: protectedProcedure.query(() => {
    return pricingEngine.getModelInfo();
  }),
});

/**
 * Combined Advanced Features Router
 */
export const advancedFeaturesRouter = router({
  chatbot: chatbotRouter,
  marketplace: marketplaceRouter,
  pricing: pricingRouter,
});

