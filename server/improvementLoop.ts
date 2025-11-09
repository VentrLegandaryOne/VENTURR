/**
 * CLOSED IMPROVEMENT LOOP
 * 
 * Implements continuous refinement cycle:
 * 1. Generate output
 * 2. Simulate perception from all archetypes
 * 3. Identify gaps
 * 4. Auto-refine output
 * 5. Re-integrate into system
 * 6. Re-evaluate acceptance
 * 7. Decision: Deploy, Minor Refinements, or Major Revision
 */

import { z } from 'zod';
import { simulationEngine, AcceptanceScore, ArchetypeType } from './archetypeSimulation';

// ============================================================================
// IMPROVEMENT LOOP TYPES
// ============================================================================

export interface OutputVersion {
  id: string;
  version: number;
  outputType: 'quote' | 'invoice' | 'compliance' | 'schedule' | 'report' | 'ui_screen';
  content: string;
  metadata: Record<string, any>;
  createdAt: Date;
  scores: AcceptanceScore[];
  overallAcceptance: number;
  status: 'draft' | 'ready_for_refinement' | 'refined' | 'deployed';
}

export interface RefinementAction {
  type: 'clarity' | 'compliance' | 'professionalism' | 'risk_visibility' | 'completeness';
  description: string;
  changes: string[];
  impact: 'high' | 'medium' | 'low';
}

export interface ImprovementLoopResult {
  outputId: string;
  initialVersion: number;
  finalVersion: number;
  initialAcceptance: number;
  finalAcceptance: number;
  improvement: number;
  refinements: RefinementAction[];
  decision: 'deploy' | 'minor_refinements' | 'major_revision';
  reason: string;
  meetsRealWorldStandard: boolean;
}

// ============================================================================
// CLOSED IMPROVEMENT LOOP ENGINE
// ============================================================================

export class ClosedImprovementLoop {
  private versions: Map<string, OutputVersion[]> = new Map();
  private refinementHistory: Map<string, ImprovementLoopResult[]> = new Map();

  /**
   * Execute complete improvement loop
   */
  async executeImprovementLoop(
    outputId: string,
    outputType: 'quote' | 'invoice' | 'compliance' | 'schedule' | 'report' | 'ui_screen',
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<ImprovementLoopResult> {
    console.log(`[Improvement Loop] Starting for ${outputId}`);

    // Step 1: Create initial version
    const initialVersion = await this.createVersion(outputId, outputType, content, metadata);
    console.log(`[Improvement Loop] Created version ${initialVersion.version}`);

    // Step 2: Simulate perception from all archetypes
    const initialScores = await simulationEngine.simulateAllArchetypes({
      type: outputType,
      content,
      metadata,
    });
    initialVersion.scores = initialScores;
    initialVersion.overallAcceptance = this.calculateAcceptance(initialScores);
    console.log(
      `[Improvement Loop] Initial acceptance: ${initialVersion.overallAcceptance.toFixed(2)}/10`
    );

    // Step 3: Identify gaps and refinements
    const refinements = await this.identifyRefinements(initialVersion, initialScores);
    console.log(`[Improvement Loop] Identified ${refinements.length} refinements`);

    // Step 4: Auto-refine output
    let refinedContent = content;
    for (const refinement of refinements) {
      refinedContent = await this.applyRefinement(refinedContent, refinement);
    }

    // Step 5: Create refined version
    const refinedVersion = await this.createVersion(
      outputId,
      outputType,
      refinedContent,
      metadata
    );
    console.log(`[Improvement Loop] Created refined version ${refinedVersion.version}`);

    // Step 6: Re-evaluate acceptance
    const refinedScores = await simulationEngine.simulateAllArchetypes({
      type: outputType,
      content: refinedContent,
      metadata,
    });
    refinedVersion.scores = refinedScores;
    refinedVersion.overallAcceptance = this.calculateAcceptance(refinedScores);
    console.log(
      `[Improvement Loop] Refined acceptance: ${refinedVersion.overallAcceptance.toFixed(2)}/10`
    );

    // Step 7: Make decision
    const decision = this.makeDecision(
      initialVersion.overallAcceptance,
      refinedVersion.overallAcceptance,
      refinedScores
    );

    const improvement =
      refinedVersion.overallAcceptance - initialVersion.overallAcceptance;
    const meetsStandard = simulationEngine.meetsRealWorldStandard(refinedScores);

    const result: ImprovementLoopResult = {
      outputId,
      initialVersion: initialVersion.version,
      finalVersion: refinedVersion.version,
      initialAcceptance: initialVersion.overallAcceptance,
      finalAcceptance: refinedVersion.overallAcceptance,
      improvement,
      refinements,
      decision,
      reason: this.getDecisionReason(decision, meetsStandard, improvement),
      meetsRealWorldStandard: meetsStandard,
    };

    // Store result
    if (!this.refinementHistory.has(outputId)) {
      this.refinementHistory.set(outputId, []);
    }
    this.refinementHistory.get(outputId)!.push(result);

    console.log(`[Improvement Loop] Decision: ${decision}`);
    console.log(`[Improvement Loop] Meets real-world standard: ${meetsStandard}`);

    return result;
  }

  /**
   * Create new version of output
   */
  private async createVersion(
    outputId: string,
    outputType: 'quote' | 'invoice' | 'compliance' | 'schedule' | 'report' | 'ui_screen',
    content: string,
    metadata: Record<string, any>
  ): Promise<OutputVersion> {
    if (!this.versions.has(outputId)) {
      this.versions.set(outputId, []);
    }

    const versions = this.versions.get(outputId)!;
    const version: OutputVersion = {
      id: outputId,
      version: versions.length + 1,
      outputType,
      content,
      metadata,
      createdAt: new Date(),
      scores: [],
      overallAcceptance: 0,
      status: 'draft',
    };

    versions.push(version);
    return version;
  }

  /**
   * Identify refinements needed
   */
  private async identifyRefinements(
    version: OutputVersion,
    scores: AcceptanceScore[]
  ): Promise<RefinementAction[]> {
    const refinements: RefinementAction[] = [];

    // Analyze each dimension
    for (const score of scores) {
      // Clarity refinements
      if (score.clarity < 8) {
        refinements.push({
          type: 'clarity',
          description: `Improve clarity for ${score.archetype}`,
          changes: [
            'Simplify technical language',
            'Add section headers and structure',
            'Highlight key information',
            'Use shorter sentences',
            'Add visual hierarchy',
          ],
          impact: 'high',
        });
      }

      // Compliance refinements
      if (score.compliance < 8) {
        refinements.push({
          type: 'compliance',
          description: `Improve compliance for ${score.archetype}`,
          changes: [
            'Add Australian building code references',
            'Include warranty terms',
            'Clarify liability allocation',
            'Add safety requirements',
            'Document assumptions',
          ],
          impact: 'high',
        });
      }

      // Professionalism refinements
      if (score.professionalism < 8) {
        refinements.push({
          type: 'professionalism',
          description: `Improve professionalism for ${score.archetype}`,
          changes: [
            'Fix spelling and grammar',
            'Improve formatting',
            'Add professional headers',
            'Use consistent branding',
            'Add company logo and contact info',
          ],
          impact: 'medium',
        });
      }

      // Risk visibility refinements
      if (score.riskVisibility < 8) {
        refinements.push({
          type: 'risk_visibility',
          description: `Improve risk visibility for ${score.archetype}`,
          changes: [
            'Add explicit risk disclosure',
            'Highlight exclusions',
            'Document assumptions',
            'Identify contingencies',
            'Add warning sections',
          ],
          impact: 'high',
        });
      }
    }

    // Check for missing sections
    const gaps = scores.flatMap((s) => s.gaps);
    if (gaps.length > 0) {
      refinements.push({
        type: 'completeness',
        description: 'Add missing sections and information',
        changes: gaps,
        impact: 'high',
      });
    }

    // Deduplicate refinements
    const uniqueRefinements = Array.from(
      new Map(refinements.map((r) => [r.description, r])).values()
    );

    return uniqueRefinements;
  }

  /**
   * Apply refinement to content
   */
  private async applyRefinement(
    content: string,
    refinement: RefinementAction
  ): Promise<string> {
    let refined = content;

    switch (refinement.type) {
      case 'clarity':
        refined = this.improveClarityRefinement(refined);
        break;
      case 'compliance':
        refined = this.improveComplianceRefinement(refined);
        break;
      case 'professionalism':
        refined = this.improveProfessionalismRefinement(refined);
        break;
      case 'risk_visibility':
        refined = this.improveRiskVisibilityRefinement(refined);
        break;
      case 'completeness':
        refined = this.improveCompletenessRefinement(refined);
        break;
    }

    return refined;
  }

  /**
   * Improve clarity
   */
  private improveClarityRefinement(content: string): string {
    let improved = content;

    // Add section headers if missing
    if (!improved.includes('##')) {
      improved = `## Summary\n\n${improved}`;
    }

    // Simplify technical terms
    const simplifications: Record<string, string> = {
      algorithm: 'process',
      API: 'interface',
      database: 'data storage',
      encryption: 'security',
      optimization: 'improvement',
      synchronization: 'updating',
    };

    for (const [technical, simple] of Object.entries(simplifications)) {
      const regex = new RegExp(`\\b${technical}\\b`, 'gi');
      improved = improved.replace(regex, simple);
    }

    // Break up long paragraphs
    improved = improved
      .split('\n\n')
      .map((para) => {
        if (para.length > 500) {
          // Split long paragraphs
          const sentences = para.match(/[^.!?]+[.!?]+/g) || [];
          return sentences.slice(0, 3).join('') + '\n\n' + sentences.slice(3).join('');
        }
        return para;
      })
      .join('\n\n');

    return improved;
  }

  /**
   * Improve compliance
   */
  private improveComplianceRefinement(content: string): string {
    let improved = content;

    // Add compliance section if missing
    if (!improved.includes('Compliance') && !improved.includes('compliance')) {
      improved += `\n\n## Compliance\n\nThis work complies with the following Australian standards:\n- AS 1562.1:2018 - Roofing and waterproofing\n- AS/NZS 1170.2:2021 - Structural design actions\n- AS 3959:2018 - Construction in bushfire-prone areas\n- NCC 2022 - National Construction Code`;
    }

    // Add warranty section if missing
    if (!improved.includes('Warranty') && !improved.includes('warranty')) {
      improved += `\n\n## Warranty\n\nAll work is covered by a comprehensive warranty. See warranty documentation for details.`;
    }

    // Add liability section if missing
    if (!improved.includes('Liability') && !improved.includes('liability')) {
      improved += `\n\n## Liability\n\nThomCo Metal Roofing maintains comprehensive liability insurance covering all work performed.`;
    }

    return improved;
  }

  /**
   * Improve professionalism
   */
  private improveProfessionalismRefinement(content: string): string {
    let improved = content;

    // Fix common spelling errors
    const corrections: Record<string, string> = {
      teh: 'the',
      recieve: 'receive',
      occured: 'occurred',
      seperate: 'separate',
      untill: 'until',
    };

    for (const [error, correct] of Object.entries(corrections)) {
      const regex = new RegExp(`\\b${error}\\b`, 'gi');
      improved = improved.replace(regex, correct);
    }

    // Add professional header if missing
    if (!improved.startsWith('#')) {
      improved = `# Professional Document\n\n${improved}`;
    }

    // Add footer with company info
    if (!improved.includes('ThomCo Metal Roofing')) {
      improved += `\n\n---\n\n**ThomCo Metal Roofing**\nPhone: (02) 9876 5432\nEmail: info@thomco.com.au\nABN: 12 345 678 901`;
    }

    return improved;
  }

  /**
   * Improve risk visibility
   */
  private improveRiskVisibilityRefinement(content: string): string {
    let improved = content;

    // Add risks section if missing
    if (!improved.includes('Risk') && !improved.includes('risk')) {
      improved += `\n\n## Risks and Exclusions\n\n### Identified Risks\n- Weather delays\n- Material availability\n- Site access issues\n\n### Exclusions\n- This quote does not include:\n  - Removal of existing materials\n  - Structural repairs\n  - Additional site preparation`;
    }

    // Add assumptions section if missing
    if (!improved.includes('Assumption') && !improved.includes('assumption')) {
      improved += `\n\n## Assumptions\n\nThis quote assumes:\n- Standard site conditions\n- No structural issues\n- Access for equipment and materials\n- Weather suitable for installation`;
    }

    // Add contingencies section if missing
    if (!improved.includes('Contingency') && !improved.includes('contingency')) {
      improved += `\n\n## Contingencies\n\nIf site conditions differ from assumptions, additional costs may apply. We will notify you immediately if changes are required.`;
    }

    return improved;
  }

  /**
   * Improve completeness
   */
  private improveCompletenessRefinement(content: string): string {
    let improved = content;

    // Add missing sections based on output type
    if (!improved.includes('Summary')) {
      improved = `## Summary\n\nThis document provides a comprehensive overview of the proposed work.\n\n${improved}`;
    }

    if (!improved.includes('Next Steps')) {
      improved += `\n\n## Next Steps\n\n1. Review this document\n2. Contact us with any questions\n3. Approve and sign to proceed`;
    }

    if (!improved.includes('Contact')) {
      improved += `\n\n## Contact Information\n\nFor questions or to proceed, please contact:\n- Phone: (02) 9876 5432\n- Email: info@thomco.com.au`;
    }

    return improved;
  }

  /**
   * Calculate overall acceptance
   */
  private calculateAcceptance(scores: AcceptanceScore[]): number {
    const overallScores = scores.map((s) => s.overall);
    return overallScores.reduce((a, b) => a + b, 0) / overallScores.length;
  }

  /**
   * Make decision based on acceptance scores
   */
  private makeDecision(
    initialAcceptance: number,
    refinedAcceptance: number,
    refinedScores: AcceptanceScore[]
  ): 'deploy' | 'minor_refinements' | 'major_revision' {
    const meetsStandard = simulationEngine.meetsRealWorldStandard(refinedScores);

    if (meetsStandard && refinedAcceptance >= 8.0) {
      return 'deploy';
    } else if (refinedAcceptance >= 6.0 && refinedAcceptance < 8.0) {
      return 'minor_refinements';
    } else {
      return 'major_revision';
    }
  }

  /**
   * Get human-readable decision reason
   */
  private getDecisionReason(
    decision: 'deploy' | 'minor_refinements' | 'major_revision',
    meetsStandard: boolean,
    improvement: number
  ): string {
    switch (decision) {
      case 'deploy':
        return `Ready for deployment. Meets real-world standard with ${improvement.toFixed(1)} point improvement.`;
      case 'minor_refinements':
        return `Minor refinements needed. Improved by ${improvement.toFixed(1)} points but not yet at real-world standard.`;
      case 'major_revision':
        return `Major revision required. Improvement of ${improvement.toFixed(1)} points insufficient for deployment.`;
    }
  }

  /**
   * Get improvement history for output
   */
  getImprovementHistory(outputId: string): ImprovementLoopResult[] {
    return this.refinementHistory.get(outputId) || [];
  }

  /**
   * Get all versions of output
   */
  getVersions(outputId: string): OutputVersion[] {
    return this.versions.get(outputId) || [];
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const improvementLoop = new ClosedImprovementLoop();

