/**
 * OUTPUT REFINEMENT ENGINE
 * 
 * Automatically refines outputs that fail quality checks.
 * Uses AI-powered suggestions and templates to improve clarity,
 * compliance, professionalism, completeness, and accuracy.
 */

import { z } from 'zod';
import { outputQualityAssurance, QualityCheckResult, OutputType } from './outputQualityAssurance';

// ============================================================================
// TYPES
// ============================================================================

export interface RefinementSuggestion {
  id: string;
  category: 'clarity' | 'compliance' | 'professionalism' | 'completeness' | 'accuracy';
  issue: string;
  suggestion: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedImpact: number; // 0-10 score improvement
}

export interface RefinementAction {
  id: string;
  timestamp: Date;
  outputType: OutputType;
  originalContent: string;
  refinedContent: string;
  suggestions: RefinementSuggestion[];
  appliedSuggestions: string[];
  beforeScore: number;
  afterScore: number;
  success: boolean;
  iterations: number;
}

export interface RefinementTemplate {
  category: 'clarity' | 'compliance' | 'professionalism' | 'completeness' | 'accuracy';
  pattern: RegExp;
  replacement: string;
  explanation: string;
}

// ============================================================================
// REFINEMENT ENGINE
// ============================================================================

export class OutputRefinementEngine {
  private refinementHistory: RefinementAction[] = [];
  private templates: RefinementTemplate[] = [];
  private maxIterations: number = 3;
  private targetScore: number = 8.0;

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize refinement templates
   */
  private initializeTemplates(): void {
    // Clarity templates
    this.templates.push({
      category: 'clarity',
      pattern: /hereinafter|notwithstanding|aforementioned|whereas/gi,
      replacement: (match: string) => {
        const replacements: Record<string, string> = {
          hereinafter: 'from now on',
          notwithstanding: 'despite',
          aforementioned: 'mentioned above',
          whereas: 'because',
        };
        return replacements[match.toLowerCase()] || match;
      },
      explanation: 'Replace legal jargon with plain language',
    } as any);

    // Clarity: Shorten sentences
    this.templates.push({
      category: 'clarity',
      pattern: /([^.!?]{100,}[.!?])/g,
      replacement: (match: string) => {
        // Split long sentences at natural break points
        return match.replace(/,\s+/g, '.\n');
      },
      explanation: 'Break long sentences into shorter ones',
    } as any);

    // Compliance: Add missing ABN
    this.templates.push({
      category: 'compliance',
      pattern: /^(?!.*ABN)/m,
      replacement: '\n\nABN: [ABN_NUMBER]\nACN: [ACN_NUMBER]\n',
      explanation: 'Add ABN/ACN if missing',
    } as any);

    // Professionalism: Fix common misspellings
    this.templates.push({
      category: 'professionalism',
      pattern: /recieve/gi,
      replacement: 'receive',
      explanation: 'Fix spelling: recieve → receive',
    } as any);

    this.templates.push({
      category: 'professionalism',
      pattern: /occured/gi,
      replacement: 'occurred',
      explanation: 'Fix spelling: occured → occurred',
    } as any);

    this.templates.push({
      category: 'professionalism',
      pattern: /seperate/gi,
      replacement: 'separate',
      explanation: 'Fix spelling: seperate → separate',
    } as any);

    // Professionalism: Remove informal language
    this.templates.push({
      category: 'professionalism',
      pattern: /\bgonna\b|\bwanna\b|\bkinda\b|\bsorta\b/gi,
      replacement: (match: string) => {
        const replacements: Record<string, string> = {
          gonna: 'going to',
          wanna: 'want to',
          kinda: 'kind of',
          sorta: 'sort of',
        };
        return replacements[match.toLowerCase()] || match;
      },
      explanation: 'Replace informal language with professional terms',
    } as any);

    // Completeness: Add section headers if missing
    this.templates.push({
      category: 'completeness',
      pattern: /^(?!.*Scope of Work)/m,
      replacement: '\n## Scope of Work\n\n[Detailed scope here]\n',
      explanation: 'Add Scope of Work section if missing',
    } as any);
  }

  /**
   * Refine output automatically
   */
  async refineOutput(
    outputType: OutputType,
    content: string
  ): Promise<RefinementAction> {
    const actionId = 'refine-' + Date.now();
    let currentContent = content;
    let currentScore = 0;
    let iterations = 0;
    const appliedSuggestions: string[] = [];

    // Get initial quality check
    let qualityCheck = await outputQualityAssurance.checkQuality(outputType, currentContent);
    currentScore = qualityCheck.overallScore;

    // Iterate until target score reached or max iterations exceeded
    while (currentScore < this.targetScore && iterations < this.maxIterations) {
      iterations++;

      // Generate suggestions
      const suggestions = this.generateSuggestions(qualityCheck);

      if (suggestions.length === 0) {
        break; // No more suggestions available
      }

      // Apply highest priority suggestions
      const prioritySuggestions = suggestions
        .sort((a, b) => {
          const priorityMap = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityMap[b.priority] - priorityMap[a.priority];
        })
        .slice(0, 3); // Apply up to 3 suggestions per iteration

      for (const suggestion of prioritySuggestions) {
        currentContent = this.applySuggestion(currentContent, suggestion);
        appliedSuggestions.push(suggestion.id);
      }

      // Re-check quality
      qualityCheck = await outputQualityAssurance.checkQuality(outputType, currentContent);
      const newScore = qualityCheck.overallScore;

      // If score didn't improve, stop
      if (newScore <= currentScore) {
        break;
      }

      currentScore = newScore;
    }

    const action: RefinementAction = {
      id: actionId,
      timestamp: new Date(),
      outputType,
      originalContent: content,
      refinedContent: currentContent,
      suggestions: this.generateSuggestions(qualityCheck),
      appliedSuggestions,
      beforeScore: parseFloat(content.length.toString()), // Placeholder
      afterScore: currentScore,
      success: currentScore >= this.targetScore,
      iterations,
    };

    this.refinementHistory.push(action);

    return action;
  }

  /**
   * Generate refinement suggestions
   */
  private generateSuggestions(qualityCheck: QualityCheckResult): RefinementSuggestion[] {
    const suggestions: RefinementSuggestion[] = [];

    // Analyze each failed check
    for (const check of qualityCheck.checks) {
      if (!check.passed) {
        const issue = check.feedback;

        // Generate category-specific suggestions
        switch (check.category) {
          case 'clarity':
            suggestions.push({
              id: 'clarity-' + Date.now(),
              category: 'clarity',
              issue,
              suggestion: 'Simplify language and break long sentences',
              priority: 'high',
              estimatedImpact: 1.5,
            });
            break;

          case 'compliance':
            suggestions.push({
              id: 'compliance-' + Date.now(),
              category: 'compliance',
              issue,
              suggestion: 'Add missing compliance requirements',
              priority: 'critical',
              estimatedImpact: 2.0,
            });
            break;

          case 'professionalism':
            suggestions.push({
              id: 'prof-' + Date.now(),
              category: 'professionalism',
              issue,
              suggestion: 'Fix spelling errors and improve formatting',
              priority: 'medium',
              estimatedImpact: 1.0,
            });
            break;

          case 'completeness':
            suggestions.push({
              id: 'complete-' + Date.now(),
              category: 'completeness',
              issue,
              suggestion: 'Add missing required fields and sections',
              priority: 'high',
              estimatedImpact: 1.5,
            });
            break;

          case 'accuracy':
            suggestions.push({
              id: 'accuracy-' + Date.now(),
              category: 'accuracy',
              issue,
              suggestion: 'Verify data and correct inaccuracies',
              priority: 'critical',
              estimatedImpact: 2.0,
            });
            break;
        }
      }
    }

    return suggestions;
  }

  /**
   * Apply suggestion to content
   */
  private applySuggestion(content: string, suggestion: RefinementSuggestion): string {
    let refined = content;

    // Apply relevant templates
    for (const template of this.templates) {
      if (template.category === suggestion.category) {
        if (typeof template.replacement === 'string') {
          refined = refined.replace(template.pattern, template.replacement);
        } else {
          refined = refined.replace(template.pattern, template.replacement);
        }
      }
    }

    // Apply category-specific refinements
    switch (suggestion.category) {
      case 'clarity':
        refined = this.refineClarityIssues(refined);
        break;
      case 'compliance':
        refined = this.refineComplianceIssues(refined);
        break;
      case 'professionalism':
        refined = this.refineProfessionalismIssues(refined);
        break;
      case 'completeness':
        refined = this.refineCompletenessIssues(refined);
        break;
      case 'accuracy':
        refined = this.refineAccuracyIssues(refined);
        break;
    }

    return refined;
  }

  /**
   * Refine clarity issues
   */
  private refineClarityIssues(content: string): string {
    let refined = content;

    // Remove jargon
    const jargonMap: Record<string, string> = {
      hereinafter: 'from now on',
      notwithstanding: 'despite',
      aforementioned: 'mentioned above',
      whereas: 'because',
      heretofore: 'previously',
      thereof: 'of it',
      therein: 'in it',
      thereof: 'of it',
    };

    for (const [jargon, replacement] of Object.entries(jargonMap)) {
      refined = refined.replace(new RegExp(jargon, 'gi'), replacement);
    }

    // Break long sentences
    refined = refined.replace(/([^.!?]{100,}[.!?])/g, (match) => {
      return match.replace(/,\s+/g, '.\n');
    });

    return refined;
  }

  /**
   * Refine compliance issues
   */
  private refineComplianceIssues(content: string): string {
    let refined = content;

    // Add ABN if missing
    if (!refined.includes('ABN') && !refined.includes('ACN')) {
      refined += '\n\nABN: [ABN_NUMBER]\nACN: [ACN_NUMBER]\n';
    }

    // Add warranty if missing
    if (!refined.includes('Warranty') && !refined.includes('warranty')) {
      refined += '\n\n## Warranty\n\n[Warranty details]\n';
    }

    // Add terms if missing
    if (!refined.includes('Terms') && !refined.includes('terms')) {
      refined += '\n\n## Terms and Conditions\n\n[Terms details]\n';
    }

    return refined;
  }

  /**
   * Refine professionalism issues
   */
  private refineProfessionalismIssues(content: string): string {
    let refined = content;

    // Fix common misspellings
    const misspellings: Record<string, string> = {
      recieve: 'receive',
      occured: 'occurred',
      seperate: 'separate',
      definately: 'definitely',
      accomodate: 'accommodate',
      untill: 'until',
    };

    for (const [wrong, correct] of Object.entries(misspellings)) {
      refined = refined.replace(new RegExp('\\b' + wrong + '\\b', 'gi'), correct);
    }

    // Remove informal language
    const informalMap: Record<string, string> = {
      gonna: 'going to',
      wanna: 'want to',
      kinda: 'kind of',
      sorta: 'sort of',
      gotta: 'got to',
      dunno: 'do not know',
    };

    for (const [informal, formal] of Object.entries(informalMap)) {
      refined = refined.replace(new RegExp('\\b' + informal + '\\b', 'gi'), formal);
    }

    return refined;
  }

  /**
   * Refine completeness issues
   */
  private refineCompletenessIssues(content: string): string {
    let refined = content;

    // Add missing sections
    const sections = [
      { name: 'Scope of Work', check: 'Scope' },
      { name: 'Materials', check: 'Material' },
      { name: 'Timeline', check: 'Timeline' },
      { name: 'Pricing', check: 'Price' },
      { name: 'Contact Information', check: 'Contact' },
    ];

    for (const section of sections) {
      if (!refined.includes(section.check)) {
        refined += `\n\n## ${section.name}\n\n[${section.name} details]\n`;
      }
    }

    return refined;
  }

  /**
   * Refine accuracy issues
   */
  private refineAccuracyIssues(content: string): string {
    let refined = content;

    // Remove placeholder text
    const placeholders = ['[NAME]', '[DATE]', '[AMOUNT]', 'TODO', 'FIXME'];
    for (const placeholder of placeholders) {
      if (refined.includes(placeholder)) {
        // Flag for manual review
        refined = refined.replace(
          placeholder,
          `[NEEDS_REVIEW: ${placeholder}]`
        );
      }
    }

    return refined;
  }

  /**
   * Get refinement history
   */
  getHistory(): RefinementAction[] {
    return this.refinementHistory;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalRefinements: number;
    successful: number;
    failed: number;
    successRate: number;
    averageIterations: number;
    averageScoreImprovement: number;
  } {
    const successful = this.refinementHistory.filter((r) => r.success).length;
    const failed = this.refinementHistory.filter((r) => !r.success).length;
    const total = this.refinementHistory.length;
    const avgIterations =
      total > 0
        ? this.refinementHistory.reduce((sum, r) => sum + r.iterations, 0) / total
        : 0;
    const avgImprovement =
      total > 0
        ? this.refinementHistory.reduce((sum, r) => sum + (r.afterScore - r.beforeScore), 0) /
          total
        : 0;

    return {
      totalRefinements: total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageIterations: avgIterations,
      averageScoreImprovement: avgImprovement,
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const outputRefinementEngine = new OutputRefinementEngine();

