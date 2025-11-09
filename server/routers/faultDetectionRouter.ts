/**
 * FAULT DETECTION & DIAGNOSIS ROUTER
 * 
 * tRPC procedures for fault detection and diagnosis
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { faultDetectionDiagnosis } from '../faultDetectionDiagnosis';

export const faultDetectionRouter = router({
  /**
   * Detect faults in system data
   */
  detectFaults: protectedProcedure
    .input(z.object({
      systemData: z.record(z.any()),
    }))
    .mutation(async ({ input }) => {
      const faults = await faultDetectionDiagnosis.detectFaults(input.systemData);

      return {
        faultsDetected: faults.length,
        faults: faults.map((f) => ({
          id: f.id,
          timestamp: f.timestamp,
          type: f.type,
          severity: f.severity,
          description: f.description,
          affectedComponent: f.affectedComponent,
          affectedWorkflows: f.affectedWorkflows,
          userImpact: f.userImpact,
          businessImpact: f.businessImpact,
        })),
      };
    }),

  /**
   * Diagnose detected faults
   */
  diagnoseFaults: protectedProcedure
    .input(z.object({
      systemData: z.record(z.any()),
    }))
    .mutation(async ({ input }) => {
      const faults = await faultDetectionDiagnosis.detectFaults(input.systemData);
      const diagnoses = await faultDetectionDiagnosis.diagnoseFaults(faults);

      return {
        faultsDetected: faults.length,
        diagnoses: diagnoses.map((d) => ({
          faultId: d.faultId,
          timestamp: d.timestamp,
          rootCause: d.rootCause,
          rootCauseCategory: d.rootCauseCategory,
          confidence: d.confidence.toFixed(1),
          affectedComponents: d.affectedComponents,
          cascadingEffects: d.cascadingEffects,
          estimatedResolutionTime: d.estimatedResolutionTime,
          recommendations: d.recommendations.map((r) => ({
            id: r.id,
            type: r.type,
            priority: r.priority,
            action: r.action,
            component: r.component,
            estimatedTime: r.estimatedTime,
            expectedImprovement: r.expectedImprovement.toFixed(1),
            riskLevel: r.riskLevel,
            prerequisites: r.prerequisites,
          })),
        })),
      };
    }),

  /**
   * Get detected faults history
   */
  getDetectedFaults: protectedProcedure.query(() => {
    const faults = faultDetectionDiagnosis.getDetectedFaults(50);

    return faults.map((f) => ({
      id: f.id,
      timestamp: f.timestamp,
      type: f.type,
      severity: f.severity,
      description: f.description,
      affectedComponent: f.affectedComponent,
      affectedWorkflows: f.affectedWorkflows,
      userImpact: f.userImpact,
      businessImpact: f.businessImpact,
    }));
  }),

  /**
   * Get diagnoses history
   */
  getDiagnoses: protectedProcedure.query(() => {
    const diagnoses = faultDetectionDiagnosis.getDiagnoses(50);

    return diagnoses.map((d) => ({
      faultId: d.faultId,
      timestamp: d.timestamp,
      rootCause: d.rootCause,
      rootCauseCategory: d.rootCauseCategory,
      confidence: d.confidence.toFixed(1),
      affectedComponents: d.affectedComponents,
      cascadingEffects: d.cascadingEffects,
      estimatedResolutionTime: d.estimatedResolutionTime,
    }));
  }),

  /**
   * Get fault detection statistics
   */
  getStatistics: protectedProcedure.query(() => {
    const stats = faultDetectionDiagnosis.getStatistics();

    return {
      totalFaultsDetected: stats.totalFaultsDetected,
      faultsByType: stats.faultsByType,
      faultsBySeverity: stats.faultsBySeverity,
      totalDiagnoses: stats.totalDiagnoses,
      averageConfidence: stats.averageConfidence.toFixed(1),
    };
  }),
});

