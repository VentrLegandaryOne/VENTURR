/**
 * OUTPUT QUALITY ASSURANCE SYSTEM
 * 
 * Ensures all platform outputs (quotes, invoices, reports, documents)
 * meet real-world standards for clarity, compliance, professionalism,
 * and commercial persuasiveness.
 */

import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

export type OutputType =
  | 'quote'
  | 'invoice'
  | 'compliance_doc'
  | 'schedule'
  | 'report'
  | 'communication'
  | 'contract'
  | 'estimate';

export interface QualityCheckResult {
  checkId: string;
  outputType: OutputType;
  timestamp: Date;
  checks: QualityCheck[];
  overallScore: number;
  passed: boolean;
  issues: QualityIssue[];
  recommendations: string[];
}

export interface QualityCheck {
  name: string;
  category: 'clarity' | 'compliance' | 'professionalism' | 'completeness' | 'accuracy';
  passed: boolean;
  score: number; // 0-10
  feedback: string;
}

export interface QualityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  location?: string;
  suggestion: string;
}

export interface OutputTemplate {
  type: OutputType;
  requiredFields: string[];
  complianceRequirements: string[];
  professionalStandards: string[];
  acceptanceCriteria: string[];
}

// ============================================================================
// QUALITY ASSURANCE ENGINE
// ============================================================================

export class OutputQualityAssurance {
  private templates: Map<OutputType, OutputTemplate> = new Map();
  private checkHistory: QualityCheckResult[] = [];

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize output templates with quality standards
   */
  private initializeTemplates(): void {
    // Quote Template
    this.templates.set('quote', {
      type: 'quote',
      requiredFields: [
        'client_name',
        'project_address',
        'project_description',
        'scope_of_work',
        'materials_list',
        'labor_cost',
        'material_cost',
        'total_cost',
        'timeline',
        'warranty',
        'terms_conditions',
        'validity_period',
        'company_name',
        'company_contact',
        'quote_number',
        'quote_date',
      ],
      complianceRequirements: [
        'ABN/ACN displayed',
        'Insurance details included',
        'Warranty terms clear',
        'Exclusions listed',
        'Payment terms specified',
        'Variation clause included',
        'Cancellation policy stated',
      ],
      professionalStandards: [
        'Professional formatting',
        'Clear typography',
        'Consistent branding',
        'High-quality images',
        'Proper spacing',
        'No spelling errors',
        'Professional tone',
      ],
      acceptanceCriteria: [
        'Client can understand scope',
        'Pricing is clear and justified',
        'Timeline is realistic',
        'Risks are disclosed',
        'Next steps are clear',
        'Easy to approve and sign',
      ],
    });

    // Invoice Template
    this.templates.set('invoice', {
      type: 'invoice',
      requiredFields: [
        'invoice_number',
        'invoice_date',
        'due_date',
        'client_name',
        'client_address',
        'client_contact',
        'company_name',
        'company_address',
        'company_contact',
        'line_items',
        'subtotal',
        'tax',
        'total',
        'payment_terms',
        'payment_methods',
        'abn',
      ],
      complianceRequirements: [
        'ABN/ACN displayed',
        'Tax invoice declaration',
        'GST amount shown separately',
        'Due date specified',
        'Payment terms clear',
        'Business details complete',
        'Invoice number sequential',
      ],
      professionalStandards: [
        'Professional layout',
        'Clear itemization',
        'Consistent formatting',
        'Easy to read',
        'Professional tone',
        'Proper alignment',
        'No errors',
      ],
      acceptanceCriteria: [
        'Amount is clear',
        'Payment instructions clear',
        'Due date obvious',
        'Itemization detailed',
        'Easy to process payment',
        'Professional appearance',
      ],
    });

    // Compliance Document Template
    this.templates.set('compliance_doc', {
      type: 'compliance_doc',
      requiredFields: [
        'document_title',
        'document_date',
        'compliance_standard',
        'certifications',
        'inspection_results',
        'sign_off',
        'inspector_details',
        'next_review_date',
      ],
      complianceRequirements: [
        'Regulatory standards met',
        'Certifications current',
        'Sign-off authority verified',
        'Date and time recorded',
        'Inspector credentials shown',
        'Scope clearly defined',
        'Exclusions noted',
      ],
      professionalStandards: [
        'Official format used',
        'Clear structure',
        'Professional language',
        'Proper documentation',
        'Easy to verify',
        'Audit-ready',
      ],
      acceptanceCriteria: [
        'Compliance clearly demonstrated',
        'Standards met',
        'Certifications valid',
        'Inspector qualified',
        'Document authentic',
        'Legally defensible',
      ],
    });

    // Schedule Template
    this.templates.set('schedule', {
      type: 'schedule',
      requiredFields: [
        'project_name',
        'start_date',
        'end_date',
        'milestones',
        'tasks',
        'resource_allocation',
        'dependencies',
        'contingencies',
      ],
      complianceRequirements: [
        'Realistic timelines',
        'Weather contingencies',
        'Supply chain risks noted',
        'Approval gates defined',
        'Change control process',
        'Escalation procedures',
      ],
      professionalStandards: [
        'Clear visualization',
        'Consistent formatting',
        'Easy to understand',
        'Professional appearance',
        'Color coding used',
        'Legends provided',
      ],
      acceptanceCriteria: [
        'Timeline is realistic',
        'Milestones are clear',
        'Dependencies understood',
        'Contingencies planned',
        'Resources allocated',
        'Easy to track progress',
      ],
    });

    // Report Template
    this.templates.set('report', {
      type: 'report',
      requiredFields: [
        'title',
        'date',
        'executive_summary',
        'findings',
        'analysis',
        'recommendations',
        'conclusion',
        'appendices',
        'author',
        'approval',
      ],
      complianceRequirements: [
        'Data accuracy verified',
        'Sources cited',
        'Methodology explained',
        'Limitations noted',
        'Assumptions stated',
        'Audit trail included',
      ],
      professionalStandards: [
        'Professional formatting',
        'Clear structure',
        'Proper grammar',
        'Consistent style',
        'Appropriate visuals',
        'Professional tone',
      ],
      acceptanceCriteria: [
        'Findings are clear',
        'Recommendations actionable',
        'Data supports conclusions',
        'Easy to understand',
        'Professionally presented',
        'Trustworthy',
      ],
    });
  }

  /**
   * Perform quality assurance check on output
   */
  async checkQuality(
    outputType: OutputType,
    content: string,
    metadata?: Record<string, any>
  ): Promise<QualityCheckResult> {
    const checkId = 'qa-' + Date.now();
    const template = this.templates.get(outputType);

    if (!template) {
      throw new Error(`Unknown output type: ${outputType}`);
    }

    const checks: QualityCheck[] = [];
    const issues: QualityIssue[] = [];

    // Check clarity
    const clarityCheck = this.checkClarity(content, template);
    checks.push(clarityCheck);
    if (!clarityCheck.passed) {
      issues.push({
        severity: 'high',
        category: 'Clarity',
        description: clarityCheck.feedback,
        suggestion: 'Simplify language and improve structure for better understanding',
      });
    }

    // Check compliance
    const complianceCheck = this.checkCompliance(content, template);
    checks.push(complianceCheck);
    if (!complianceCheck.passed) {
      issues.push({
        severity: 'critical',
        category: 'Compliance',
        description: complianceCheck.feedback,
        suggestion: 'Add missing compliance requirements before publishing',
      });
    }

    // Check professionalism
    const professionalCheck = this.checkProfessionalism(content, template);
    checks.push(professionalCheck);
    if (!professionalCheck.passed) {
      issues.push({
        severity: 'medium',
        category: 'Professionalism',
        description: professionalCheck.feedback,
        suggestion: 'Improve formatting and presentation to meet professional standards',
      });
    }

    // Check completeness
    const completenessCheck = this.checkCompleteness(content, template);
    checks.push(completenessCheck);
    if (!completenessCheck.passed) {
      issues.push({
        severity: 'high',
        category: 'Completeness',
        description: completenessCheck.feedback,
        suggestion: 'Add missing required fields before publishing',
      });
    }

    // Check accuracy
    const accuracyCheck = this.checkAccuracy(content, metadata);
    checks.push(accuracyCheck);
    if (!accuracyCheck.passed) {
      issues.push({
        severity: 'critical',
        category: 'Accuracy',
        description: accuracyCheck.feedback,
        suggestion: 'Verify data accuracy and correct any errors',
      });
    }

    // Calculate overall score
    const overallScore =
      checks.reduce((sum, check) => sum + check.score, 0) / checks.length;

    // Determine pass/fail
    const passed =
      overallScore >= 8.0 &&
      checks.every((c) => c.score >= 7.0) &&
      issues.filter((i) => i.severity === 'critical').length === 0;

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      checks,
      issues,
      passed
    );

    const result: QualityCheckResult = {
      checkId,
      outputType,
      timestamp: new Date(),
      checks,
      overallScore,
      passed,
      issues,
      recommendations,
    };

    this.checkHistory.push(result);

    return result;
  }

  /**
   * Check clarity
   */
  private checkClarity(content: string, template: OutputTemplate): QualityCheck {
    let score = 10;
    const issues: string[] = [];

    // Check for complex sentences
    const sentences = content.split(/[.!?]+/);
    const avgLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
    if (avgLength > 25) {
      score -= 2;
      issues.push('Sentences are too long');
    }

    // Check for jargon
    const jargonTerms = ['hereinafter', 'notwithstanding', 'aforementioned'];
    const jargonCount = jargonTerms.filter((term) => content.includes(term)).length;
    if (jargonCount > 0) {
      score -= jargonCount;
      issues.push(`Found ${jargonCount} jargon terms`);
    }

    // Check for passive voice
    const passiveVoicePattern = /is\s+\w+ed|are\s+\w+ed|was\s+\w+ed|were\s+\w+ed/g;
    const passiveCount = (content.match(passiveVoicePattern) || []).length;
    if (passiveCount > content.split(' ').length * 0.1) {
      score -= 1;
      issues.push('Too much passive voice');
    }

    return {
      name: 'Clarity Check',
      category: 'clarity',
      passed: score >= 8,
      score: Math.max(0, score),
      feedback:
        issues.length > 0
          ? `Issues: ${issues.join('; ')}`
          : 'Content is clear and easy to understand',
    };
  }

  /**
   * Check compliance
   */
  private checkCompliance(content: string, template: OutputTemplate): QualityCheck {
    let score = 10;
    const missingRequirements: string[] = [];

    for (const requirement of template.complianceRequirements) {
      const found = content.toLowerCase().includes(requirement.toLowerCase());
      if (!found) {
        score -= 1;
        missingRequirements.push(requirement);
      }
    }

    return {
      name: 'Compliance Check',
      category: 'compliance',
      passed: score >= 8,
      score: Math.max(0, score),
      feedback:
        missingRequirements.length > 0
          ? `Missing compliance requirements: ${missingRequirements.slice(0, 3).join(', ')}`
          : 'All compliance requirements met',
    };
  }

  /**
   * Check professionalism
   */
  private checkProfessionalism(content: string, template: OutputTemplate): QualityCheck {
    let score = 10;
    const issues: string[] = [];

    // Check for spelling errors (simplified)
    const commonMisspellings = ['recieve', 'occured', 'seperate', 'definately'];
    const misspellingCount = commonMisspellings.filter((word) =>
      content.includes(word)
    ).length;
    if (misspellingCount > 0) {
      score -= misspellingCount * 2;
      issues.push(`Found ${misspellingCount} spelling errors`);
    }

    // Check for inconsistent formatting
    if (!content.includes('---') && !content.includes('===')) {
      score -= 1;
      issues.push('Missing section dividers');
    }

    // Check for professional tone
    const unprofessionalTerms = ['gonna', 'wanna', 'kinda', 'sorta'];
    const unprofessionalCount = unprofessionalTerms.filter((term) =>
      content.includes(term)
    ).length;
    if (unprofessionalCount > 0) {
      score -= unprofessionalCount * 2;
      issues.push('Unprofessional language detected');
    }

    return {
      name: 'Professionalism Check',
      category: 'professionalism',
      passed: score >= 8,
      score: Math.max(0, score),
      feedback:
        issues.length > 0
          ? `Issues: ${issues.join('; ')}`
          : 'Content meets professional standards',
    };
  }

  /**
   * Check completeness
   */
  private checkCompleteness(content: string, template: OutputTemplate): QualityCheck {
    let score = 10;
    const missingFields: string[] = [];

    for (const field of template.requiredFields) {
      const found = content.toLowerCase().includes(field.toLowerCase().replace(/_/g, ' '));
      if (!found) {
        score -= 1;
        missingFields.push(field);
      }
    }

    return {
      name: 'Completeness Check',
      category: 'completeness',
      passed: score >= 8,
      score: Math.max(0, score),
      feedback:
        missingFields.length > 0
          ? `Missing fields: ${missingFields.slice(0, 3).join(', ')}`
          : 'All required fields present',
    };
  }

  /**
   * Check accuracy
   */
  private checkAccuracy(
    content: string,
    metadata?: Record<string, any>
  ): QualityCheck {
    let score = 10;
    const issues: string[] = [];

    // Check for placeholder text
    const placeholders = ['[NAME]', '[DATE]', '[AMOUNT]', 'TODO', 'FIXME'];
    const placeholderCount = placeholders.filter((p) => content.includes(p)).length;
    if (placeholderCount > 0) {
      score -= placeholderCount * 3;
      issues.push(`Found ${placeholderCount} placeholder values`);
    }

    // Check for data consistency
    if (metadata) {
      if (metadata.total && content.includes(metadata.total.toString())) {
        // Data is consistent
      } else if (metadata.total) {
        score -= 2;
        issues.push('Total amount mismatch');
      }
    }

    return {
      name: 'Accuracy Check',
      category: 'accuracy',
      passed: score >= 8,
      score: Math.max(0, score),
      feedback:
        issues.length > 0
          ? `Issues: ${issues.join('; ')}`
          : 'Data appears accurate',
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    checks: QualityCheck[],
    issues: QualityIssue[],
    passed: boolean
  ): string[] {
    const recommendations: string[] = [];

    if (passed) {
      recommendations.push('Ready to publish');
      recommendations.push('Monitor user feedback after publication');
    } else {
      const criticalIssues = issues.filter((i) => i.severity === 'critical');
      const highIssues = issues.filter((i) => i.severity === 'high');

      if (criticalIssues.length > 0) {
        recommendations.push(
          `Fix ${criticalIssues.length} critical issues before publishing`
        );
      }

      if (highIssues.length > 0) {
        recommendations.push(
          `Address ${highIssues.length} high-priority issues`
        );
      }

      const lowScoreChecks = checks.filter((c) => c.score < 7);
      if (lowScoreChecks.length > 0) {
        recommendations.push(
          `Improve ${lowScoreChecks.map((c) => c.category).join(', ')}`
        );
      }

      recommendations.push('Re-run quality check after improvements');
    }

    return recommendations;
  }

  /**
   * Get check history
   */
  getCheckHistory(): QualityCheckResult[] {
    return this.checkHistory;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalChecks: number;
    passed: number;
    failed: number;
    passRate: number;
    averageScore: number;
  } {
    const passed = this.checkHistory.filter((r) => r.passed).length;
    const failed = this.checkHistory.filter((r) => !r.passed).length;
    const total = this.checkHistory.length;
    const averageScore =
      total > 0
        ? this.checkHistory.reduce((sum, r) => sum + r.overallScore, 0) / total
        : 0;

    return {
      totalChecks: total,
      passed,
      failed,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      averageScore,
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const outputQualityAssurance = new OutputQualityAssurance();

