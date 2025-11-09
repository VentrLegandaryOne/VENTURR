/**
 * COMPONENT HEALING ROUTER
 * 
 * tRPC procedures for component healing and health management
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { componentHealingSystem } from '../componentHealingSystem';

export const componentHealingRouter = router({
  /**
   * Execute healing for a component
   */
  executeHealing: protectedProcedure
    .input(
      z.object({
        component: z.string(),
        actionType: z.enum(['patch', 'rebuild', 'optimize', 'refactor', 'scale', 'investigate']),
      })
    )
    .mutation(async ({ input }) => {
      const result = await componentHealingSystem.executeHealing(input.component, input.actionType);

      return {
        id: result.id,
        component: result.component,
        actionType: result.actionType,
        status: result.status,
        duration: result.duration,
        improvement: result.improvement.toFixed(2),
        errorMessage: result.errorMessage,
      };
    }),

  /**
   * Get component health
   */
  getComponentHealth: protectedProcedure
    .input(z.object({ component: z.string().optional() }).optional())
    .query(({ input }) => {
      const health = componentHealingSystem.getComponentHealth(input?.component);

      if (Array.isArray(health)) {
        return health.map((h) => ({
          component: h.component,
          healthScore: h.healthScore.toFixed(1),
          status: h.status,
          lastHealed: h.lastHealed,
          healingAttempts: h.healingAttempts,
          successfulHeals: h.successfulHeals,
          failedHeals: h.failedHeals,
          successRate: (h.successRate * 100).toFixed(1),
        }));
      }

      return {
        component: health.component,
        healthScore: health.healthScore.toFixed(1),
        status: health.status,
        lastHealed: health.lastHealed,
        healingAttempts: health.healingAttempts,
        successfulHeals: health.successfulHeals,
        failedHeals: health.failedHeals,
        successRate: (health.successRate * 100).toFixed(1),
      };
    }),

  /**
   * Get healing history
   */
  getHealingHistory: protectedProcedure.query(() => {
    const history = componentHealingSystem.getHealingHistory(50);

    return history.map((h) => ({
      id: h.id,
      timestamp: h.timestamp,
      component: h.component,
      actionType: h.actionType,
      status: h.status,
      duration: h.duration,
      improvement: h.improvement.toFixed(2),
      riskLevel: h.riskLevel,
    }));
  }),

  /**
   * Get healing statistics
   */
  getHealingStatistics: protectedProcedure.query(() => {
    const stats = componentHealingSystem.getHealingStatistics();

    return {
      totalHealingAttempts: stats.totalHealingAttempts,
      successfulHeals: stats.successfulHeals,
      failedHeals: stats.failedHeals,
      successRate: stats.successRate.toFixed(1),
      averageImprovement: stats.averageImprovement.toFixed(2),
      componentStatuses: stats.componentStatuses,
    };
  }),
});

