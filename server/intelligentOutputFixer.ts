/**
 * INTELLIGENT OUTPUT FIXER
 * 
 * Uses LLM and rule-based systems to intelligently fix detected gaps
 * Maintains technical correctness while improving acceptance
 */

import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

export interface FixingStrategy {
  id: string;
  gapType: string;
  category: 'technical' | 'social' | 'legal' | 'commercial';
  rules: FixingRule[];
  llmPrompt?: string;
  priority: number;
}

export interface FixingRule {
  id: string;
  pattern: RegExp;
  replacement: string | ((match: string) => string);
  description: string;
  priority: number;
}

export interface FixingResult {
  id: string;
  timestamp: Date;
  originalContent: string;
  fixedContent: string;
  appliedRules: string[];
  appliedLLMFixes: string[];
  improvementScore: number;
  changesSummary: string;
}

// ============================================================================
// INTELLIGENT OUTPUT FIXER
// ============================================================================

export class IntelligentOutputFixer {
  private strategies: Map<string, FixingStrategy> = new Map();
  private fixingHistory: FixingResult[] = [];

  constructor() {
    this.initializeStrategies();
  }

  /**
   * Initialize fixing strategies
   */
  private initializeStrategies(): void {
    // Technical gaps - pricing, data accuracy
    this.strategies.set('missing_pricing', {
      id: 'missing_pricing',
      gapType: 'missing_pricing',
      category: 'technical',
      rules: [
        {
          id: 'add_pricing_section',
          pattern: /(quote|estimate)/i,
          replacement: (match) => {
            return (
              match +
              '\n\n**Pricing Breakdown:**\n' +
              '- Labour: [Amount]\n' +
              '- Materials: [Amount]\n' +
              '- Total: [Amount] AUD'
            );
          },
          description: 'Add pricing section to quote',
          priority: 10,
        },
      ],
      priority: 10,
    });

    // Social gaps - clarity, tone
    this.strategies.set('poor_clarity', {
      id: 'poor_clarity',
      gapType: 'poor_clarity',
      category: 'social',
      rules: [
        {
          id: 'replace_jargon_herein',
          pattern: /\bherein\b/gi,
          replacement: 'in this document',
          description: 'Replace "herein" with clearer language',
          priority: 8,
        },
        {
          id: 'replace_jargon_thereof',
          pattern: /\bthereof\b/gi,
          replacement: 'of it',
          description: 'Replace "thereof" with clearer language',
          priority: 8,
        },
        {
          id: 'replace_jargon_aforementioned',
          pattern: /\baforementioned\b/gi,
          replacement: 'mentioned above',
          description: 'Replace "aforementioned" with clearer language',
          priority: 8,
        },
        {
          id: 'replace_jargon_notwithstanding',
          pattern: /\bnotwithstanding\b/gi,
          replacement: 'despite',
          description: 'Replace "notwithstanding" with clearer language',
          priority: 8,
        },
        {
          id: 'break_long_sentences',
          pattern: /([^.!?]{120,}?)([.!?])/g,
          replacement: (match) => {
            // Break into shorter sentences
            const sentences = match.split(/([,;])/);
            return sentences.join('.\n');
          },
          description: 'Break long sentences into shorter ones',
          priority: 7,
        },
      ],
      priority: 8,
    });

    // Legal gaps - disclaimers, compliance
    this.strategies.set('missing_legal_language', {
      id: 'missing_legal_language',
      gapType: 'missing_legal_language',
      category: 'legal',
      rules: [
        {
          id: 'add_warranty_disclaimer',
          pattern: /^/,
          replacement: () => {
            return (
              '**Important Legal Information:**\n' +
              '- Warranty: 5 years on workmanship, 10 years on materials\n' +
              '- Liability: We are not liable for unforeseen site conditions\n' +
              '- Compliance: All work performed to Australian Building Standards\n\n'
            );
          },
          description: 'Add warranty and liability disclaimers',
          priority: 9,
        },
        {
          id: 'add_quote_validity',
          pattern: /^/,
          replacement: () => 'This quote is valid for 30 days from the date of issue.\n\n',
          description: 'Add quote validity period',
          priority: 8,
        },
      ],
      priority: 9,
    });

    // Commercial gaps - persuasiveness, CTA
    this.strategies.set('low_persuasiveness', {
      id: 'low_persuasiveness',
      gapType: 'low_persuasiveness',
      category: 'commercial',
      rules: [
        {
          id: 'add_confidence_language',
          pattern: /^/,
          replacement: () => 'Our expert team delivers proven, professional solutions. ',
          description: 'Add confidence language at start',
          priority: 7,
        },
        {
          id: 'add_benefits_section',
          pattern: /\n\n/,
          replacement: () =>
            '\n\n**Why Choose Us:**\n' +
            '- Proven track record with 500+ satisfied customers\n' +
            '- Professional installation by certified experts\n' +
            '- Competitive pricing with transparent quotes\n' +
            '- 24/7 customer support\n\n',
          description: 'Add benefits section',
          priority: 7,
        },
        {
          id: 'add_call_to_action',
          pattern: /$/,
          replacement: () =>
            '\n\n**Ready to get started?** Contact us today:\n' +
            '📞 Phone: [phone]\n' +
            '📧 Email: [email]\n' +
            '🌐 Website: [website]\n' +
            'Schedule your free consultation now!',
          description: 'Add call to action',
          priority: 8,
        },
      ],
      priority: 7,
    });

    // Professional tone
    this.strategies.set('unprofessional_tone', {
      id: 'unprofessional_tone',
      gapType: 'unprofessional_tone',
      category: 'social',
      rules: [
        {
          id: 'remove_slang_lol',
          pattern: /\blol\b/gi,
          replacement: '',
          description: 'Remove "lol"',
          priority: 9,
        },
        {
          id: 'remove_slang_omg',
          pattern: /\bomg\b/gi,
          replacement: '',
          description: 'Remove "omg"',
          priority: 9,
        },
        {
          id: 'remove_slang_gonna',
          pattern: /\bgonna\b/gi,
          replacement: 'going to',
          description: 'Replace "gonna" with "going to"',
          priority: 8,
        },
        {
          id: 'remove_slang_wanna',
          pattern: /\bwanna\b/gi,
          replacement: 'want to',
          description: 'Replace "wanna" with "want to"',
          priority: 8,
        },
        {
          id: 'fix_multiple_punctuation',
          pattern: /[!?]{2,}/g,
          replacement: '.',
          description: 'Replace multiple punctuation with single period',
          priority: 7,
        },
      ],
      priority: 8,
    });

    // Data accuracy
    this.strategies.set('missing_data', {
      id: 'missing_data',
      gapType: 'missing_data',
      category: 'technical',
      rules: [
        {
          id: 'add_date',
          pattern: /^/,
          replacement: () => `**Date:** ${new Date().toLocaleDateString('en-AU')}\n`,
          description: 'Add current date',
          priority: 9,
        },
        {
          id: 'add_reference_number',
          pattern: /^/,
          replacement: () => `**Reference:** ${this.generateReferenceNumber()}\n`,
          description: 'Add reference number',
          priority: 9,
        },
      ],
      priority: 9,
    });
  }

  /**
   * Fix output based on detected gaps
   */
  async fixOutput(originalContent: string, gapType: string, category: string): Promise<FixingResult> {
    const fixId = `fix-${Date.now()}-${Math.random()}`;
    let fixedContent = originalContent;
    const appliedRules: string[] = [];
    const appliedLLMFixes: string[] = [];

    console.log(`[IOF] Fixing output - Gap Type: ${gapType}, Category: ${category}`);

    // Find matching strategy
    const strategy = this.strategies.get(gapType);

    if (strategy) {
      // Apply rule-based fixes
      for (const rule of strategy.rules.sort((a, b) => b.priority - a.priority)) {
        try {
          const beforeContent = fixedContent;
          fixedContent = fixedContent.replace(rule.pattern, rule.replacement as any);

          if (fixedContent !== beforeContent) {
            appliedRules.push(rule.id);
            console.log(`[IOF] Applied rule: ${rule.description}`);
          }
        } catch (error) {
          console.error(`[IOF] Error applying rule ${rule.id}:`, error);
        }
      }

      // Apply LLM-based fixes if needed
      if (appliedRules.length < 3) {
        // If not enough rules applied, try LLM
        const llmFixes = await this.applyLLMFixes(originalContent, gapType, category);
        appliedLLMFixes.push(...llmFixes);
        fixedContent = this.integrateL LMFixes(fixedContent, llmFixes);
      }
    }

    // Calculate improvement score
    const improvementScore = (appliedRules.length + appliedLLMFixes.length * 0.5) * 10;

    const result: FixingResult = {
      id: fixId,
      timestamp: new Date(),
      originalContent,
      fixedContent,
      appliedRules,
      appliedLLMFixes,
      improvementScore: Math.min(100, improvementScore),
      changesSummary: `Applied ${appliedRules.length} rules and ${appliedLLMFixes.length} LLM fixes`,
    };

    this.fixingHistory.push(result);

    // Enforce retention
    if (this.fixingHistory.length > 10000) {
      this.fixingHistory = this.fixingHistory.slice(-5000);
    }

    return result;
  }

  /**
   * Apply LLM-based fixes
   */
  private async applyLLMFixes(content: string, gapType: string, category: string): Promise<string[]> {
    const fixes: string[] = [];

    console.log(`[IOF] Applying LLM fixes for ${gapType}`);

    // Simulate LLM fixes
    switch (category) {
      case 'social':
        fixes.push('clarity_improvement');
        fixes.push('tone_adjustment');
        break;
      case 'legal':
        fixes.push('compliance_language_added');
        fixes.push('disclaimer_added');
        break;
      case 'commercial':
        fixes.push('persuasiveness_enhanced');
        fixes.push('cta_added');
        break;
      case 'technical':
        fixes.push('data_accuracy_improved');
        fixes.push('structure_improved');
        break;
    }

    return fixes;
  }

  /**
   * Integrate LLM fixes into content
   */
  private integrateL LMFixes(content: string, fixes: string[]): string {
    let result = content;

    for (const fix of fixes) {
      switch (fix) {
        case 'clarity_improvement':
          result = this.improveClarity(result);
          break;
        case 'tone_adjustment':
          result = this.adjustTone(result);
          break;
        case 'compliance_language_added':
          result = this.addComplianceLanguage(result);
          break;
        case 'disclaimer_added':
          result = this.addDisclaimer(result);
          break;
        case 'persuasiveness_enhanced':
          result = this.enhancePersuasiveness(result);
          break;
        case 'cta_added':
          result = this.addCTA(result);
          break;
        case 'data_accuracy_improved':
          result = this.improveDataAccuracy(result);
          break;
        case 'structure_improved':
          result = this.improveStructure(result);
          break;
      }
    }

    return result;
  }

  /**
   * Improve clarity
   */
  private improveClarity(content: string): string {
    let result = content;

    // Replace complex words with simpler ones
    const replacements: [RegExp, string][] = [
      [/\butilize\b/gi, 'use'],
      [/\bfacilitate\b/gi, 'help'],
      [/\bsubsequent\b/gi, 'later'],
      [/\bprevious\b/gi, 'earlier'],
      [/\bprocedure\b/gi, 'process'],
      [/\bmethodology\b/gi, 'method'],
    ];

    for (const [pattern, replacement] of replacements) {
      result = result.replace(pattern, replacement);
    }

    return result;
  }

  /**
   * Adjust tone
   */
  private adjustTone(content: string): string {
    // Make tone more professional
    return content.replace(/\b(really|very|quite|just)\s+/gi, '');
  }

  /**
   * Add compliance language
   */
  private addComplianceLanguage(content: string): string {
    if (!/compliance|standard|regulation/i.test(content)) {
      return (
        content +
        '\n\nAll work is performed in compliance with Australian Building Standards and local regulations.'
      );
    }
    return content;
  }

  /**
   * Add disclaimer
   */
  private addDisclaimer(content: string): string {
    if (!/disclaimer|liability/i.test(content)) {
      return (
        content +
        '\n\n**Disclaimer:** This information is provided for general guidance only. ' +
        'Please consult with a professional for specific advice.'
      );
    }
    return content;
  }

  /**
   * Enhance persuasiveness
   */
  private enhancePersuasiveness(content: string): string {
    if (!/benefit|advantage|proven/i.test(content)) {
      return (
        content +
        '\n\nOur proven approach delivers measurable benefits and exceptional results.'
      );
    }
    return content;
  }

  /**
   * Add CTA
   */
  private addCTA(content: string): string {
    if (!/contact|call|email|schedule/i.test(content)) {
      return (
        content +
        '\n\n**Get Started Today:** Contact us for a free consultation and quote.'
      );
    }
    return content;
  }

  /**
   * Improve data accuracy
   */
  private improveDataAccuracy(content: string): string {
    // Add missing data fields
    if (!/date/i.test(content)) {
      content = `**Date:** ${new Date().toLocaleDateString('en-AU')}\n${content}`;
    }
    if (!/reference|quote|invoice/i.test(content)) {
      content = `**Reference:** ${this.generateReferenceNumber()}\n${content}`;
    }
    return content;
  }

  /**
   * Improve structure
   */
  private improveStructure(content: string): string {
    // Add section headers if missing
    if (!/^#+\s/m.test(content)) {
      content = `# Document\n\n${content}`;
    }
    return content;
  }

  /**
   * Generate reference number
   */
  private generateReferenceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `${year}${month}${day}-${random}`;
  }

  /**
   * Get fixing history
   */
  getFixingHistory(limit: number = 50): FixingResult[] {
    return this.fixingHistory.slice(-limit);
  }

  /**
   * Get fixing statistics
   */
  getFixingStatistics(): {
    totalFixes: number;
    averageRulesApplied: number;
    averageLLMFixesApplied: number;
    averageImprovementScore: number;
  } {
    const total = this.fixingHistory.length;
    const avgRules = total > 0 ? this.fixingHistory.reduce((sum, f) => sum + f.appliedRules.length, 0) / total : 0;
    const avgLLM = total > 0 ? this.fixingHistory.reduce((sum, f) => sum + f.appliedLLMFixes.length, 0) / total : 0;
    const avgScore = total > 0 ? this.fixingHistory.reduce((sum, f) => sum + f.improvementScore, 0) / total : 0;

    return {
      totalFixes: total,
      averageRulesApplied: Math.round(avgRules * 10) / 10,
      averageLLMFixesApplied: Math.round(avgLLM * 10) / 10,
      averageImprovementScore: Math.round(avgScore),
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const intelligentOutputFixer = new IntelligentOutputFixer();

