/**
 * ARCHETYPE SIMULATION ENGINE
 * 
 * Simulates perception and acceptance of platform outputs from 10 distinct archetypes:
 * - ThomCo Staff: Director, Admin, Estimator, Site Lead, Installer
 * - Clients: Strata Manager, Insurer, Builder, High-Detail Homeowner, Government/Asset Manager
 * 
 * Performs continuous role-based validation to ensure outputs are:
 * - Technically correct
 * - Socially acceptable
 * - Legally defensible
 * - Commercially persuasive
 */

import { z } from 'zod';

// ============================================================================
// ARCHETYPE DEFINITIONS
// ============================================================================

export const ArchetypeType = z.enum([
  // ThomCo Staff
  'director',
  'admin',
  'estimator',
  'site_lead',
  'installer',
  // Clients
  'strata_manager',
  'insurer',
  'builder',
  'homeowner',
  'government_asset_manager',
]);

export type ArchetypeType = z.infer<typeof ArchetypeType>;

export interface ArchetypeProfile {
  id: ArchetypeType;
  name: string;
  role: string;
  organization: string;
  keyConcerns: string[];
  decisionCriteria: string[];
  acceptanceStandards: string[];
}

export const ARCHETYPE_PROFILES: Record<ArchetypeType, ArchetypeProfile> = {
  // ThomCo Staff Archetypes
  director: {
    id: 'director',
    name: 'Michael Thomson',
    role: 'Business Owner',
    organization: 'ThomCo Metal Roofing',
    keyConcerns: [
      'Profitability and cash flow',
      'Risk management and liability',
      'Compliance with regulations',
      'Team productivity and efficiency',
      'Customer satisfaction and retention',
    ],
    decisionCriteria: [
      'Will this improve bottom line?',
      'Does this reduce risk exposure?',
      'Is this legally defensible?',
      'Will this improve customer relationships?',
      'Can my team execute this?',
    ],
    acceptanceStandards: [
      'Executive summary must be clear and data-driven',
      'Financial impact must be quantified',
      'Risk mitigation must be explicit',
      'Compliance must be documented',
      'ROI must be obvious',
    ],
  },
  admin: {
    id: 'admin',
    name: 'Sarah Chen',
    role: 'Operations Manager',
    organization: 'ThomCo Metal Roofing',
    keyConcerns: [
      'Process efficiency and consistency',
      'Data accuracy and completeness',
      'Team coordination and communication',
      'Schedule management and deadlines',
      'Quality control and compliance',
    ],
    decisionCriteria: [
      'Is this easy to use and understand?',
      'Does this reduce manual work?',
      'Is the data accurate and complete?',
      'Can I track progress and status?',
      'Will this help me manage the team?',
    ],
    acceptanceStandards: [
      'Workflows must be clear and logical',
      'Data entry must be minimal and validated',
      'Status tracking must be real-time',
      'Reports must be actionable',
      'Alerts must be timely and specific',
    ],
  },
  estimator: {
    id: 'estimator',
    name: 'David Park',
    role: 'Senior Estimator',
    organization: 'ThomCo Metal Roofing',
    keyConcerns: [
      'Accurate material and labor pricing',
      'Competitive quotes and margins',
      'Compliance with specifications',
      'Professional presentation',
      'Customer confidence in pricing',
    ],
    decisionCriteria: [
      'Is the pricing accurate and competitive?',
      'Are all materials and labor included?',
      'Is the quote professional and clear?',
      'Can I explain the pricing to customers?',
      'Does this protect our margins?',
    ],
    acceptanceStandards: [
      'Material pricing must be current and accurate',
      'Labor rates must reflect actual costs',
      'Quotes must include all items',
      'Pricing logic must be transparent',
      'Compliance must be visible',
      'Professional formatting required',
    ],
  },
  site_lead: {
    id: 'site_lead',
    name: 'James Wilson',
    role: 'Senior Site Lead',
    organization: 'ThomCo Metal Roofing',
    keyConcerns: [
      'Project schedule and milestones',
      'Material availability and logistics',
      'Team coordination and safety',
      'Quality assurance and compliance',
      'Customer communication and satisfaction',
    ],
    decisionCriteria: [
      'Is the schedule realistic and achievable?',
      'Are materials available when needed?',
      'Can I coordinate my team effectively?',
      'Is quality and safety maintained?',
      'Can I keep the customer informed?',
    ],
    acceptanceStandards: [
      'Schedules must be realistic and detailed',
      'Material lists must be complete and accurate',
      'Task assignments must be clear',
      'Safety requirements must be explicit',
      'Customer updates must be professional',
    ],
  },
  installer: {
    id: 'installer',
    name: 'Marcus Johnson',
    role: 'Experienced Installer',
    organization: 'ThomCo Metal Roofing',
    keyConcerns: [
      'Clear instructions and specifications',
      'Material availability on site',
      'Safety requirements and procedures',
      'Quality standards and expectations',
      'Time efficiency and productivity',
    ],
    decisionCriteria: [
      'Are the instructions clear and complete?',
      'Are all materials available?',
      'Are safety procedures clear?',
      'What\'s the quality standard?',
      'How long should this take?',
    ],
    acceptanceStandards: [
      'Instructions must be clear and visual',
      'Material lists must be complete',
      'Safety requirements must be prominent',
      'Quality checklist must be provided',
      'Time estimates must be realistic',
    ],
  },

  // Client Archetypes
  strata_manager: {
    id: 'strata_manager',
    name: 'Patricia Williams',
    role: 'Strata Manager',
    organization: '50-unit residential complex',
    keyConcerns: [
      'Budget compliance and cost control',
      'Minimal disruption to residents',
      'Professional and timely communication',
      'Compliance with building codes',
      'Warranty and liability protection',
    ],
    decisionCriteria: [
      'Is this within budget?',
      'Will this disrupt residents?',
      'Is the contractor professional?',
      'Are there compliance issues?',
      'What\'s the warranty coverage?',
    ],
    acceptanceStandards: [
      'Quote must be itemized and clear',
      'Timeline must minimize disruption',
      'Communication plan must be detailed',
      'Compliance documentation required',
      'Warranty must be comprehensive',
    ],
  },
  insurer: {
    id: 'insurer',
    name: 'Robert Chen',
    role: 'Claims Manager',
    organization: 'Insurance Company',
    keyConcerns: [
      'Compliance with building codes',
      'Risk mitigation and liability',
      'Proper installation and workmanship',
      'Documentation and evidence',
      'Warranty and coverage protection',
    ],
    decisionCriteria: [
      'Is this compliant with codes?',
      'Are risks properly mitigated?',
      'Is workmanship professional?',
      'Is documentation complete?',
      'Is warranty adequate?',
    ],
    acceptanceStandards: [
      'Compliance documentation must be comprehensive',
      'Risk assessment must be detailed',
      'Installation photos must be professional',
      'Warranty must be clear and complete',
      'Insurance requirements must be met',
    ],
  },
  builder: {
    id: 'builder',
    name: 'Jennifer Martinez',
    role: 'Project Manager',
    organization: 'Construction Company',
    keyConcerns: [
      'Schedule adherence and coordination',
      'Quality and workmanship standards',
      'Compliance with specifications',
      'Professional communication',
      'Warranty and liability protection',
    ],
    decisionCriteria: [
      'Can they meet our schedule?',
      'Is their quality acceptable?',
      'Are they compliant?',
      'Are they professional?',
      'What\'s the warranty?',
    ],
    acceptanceStandards: [
      'Schedule must integrate with project timeline',
      'Quality standards must be clear',
      'Compliance must be documented',
      'Communication must be professional',
      'Warranty must be comprehensive',
    ],
  },
  homeowner: {
    id: 'homeowner',
    name: 'Dr. Elizabeth Park',
    role: 'Homeowner',
    organization: 'Private residence',
    keyConcerns: [
      'Professional appearance and quality',
      'Clear explanation of work',
      'Compliance and safety',
      'Warranty and protection',
      'Professional communication',
    ],
    decisionCriteria: [
      'Does this look professional?',
      'Do I understand what\'s being done?',
      'Is this safe and compliant?',
      'What\'s covered by warranty?',
      'Are they professional?',
    ],
    acceptanceStandards: [
      'Quote must be clear and professional',
      'Explanation must be understandable',
      'Compliance must be visible',
      'Warranty must be comprehensive',
      'Communication must be professional',
    ],
  },
  government_asset_manager: {
    id: 'government_asset_manager',
    name: 'David Thompson',
    role: 'Asset Manager',
    organization: 'Local Government',
    keyConcerns: [
      'Compliance with regulations',
      'Budget and cost control',
      'Professional documentation',
      'Risk management',
      'Warranty and liability',
    ],
    decisionCriteria: [
      'Is this compliant with regulations?',
      'Is this within budget?',
      'Is documentation complete?',
      'Are risks managed?',
      'Is warranty adequate?',
    ],
    acceptanceStandards: [
      'Compliance documentation must be comprehensive',
      'Budget must be itemized and justified',
      'Documentation must be complete',
      'Risk assessment must be detailed',
      'Warranty must be clear',
    ],
  },
};

// ============================================================================
// PERCEPTION & ACCEPTANCE CRITERIA
// ============================================================================

export interface PerceptionCriteria {
  clarity: number; // 0-10
  compliance: number; // 0-10
  professionalism: number; // 0-10
  riskVisibility: number; // 0-10
}

export interface AcceptanceScore {
  archetype: ArchetypeType;
  clarity: number;
  compliance: number;
  professionalism: number;
  riskVisibility: number;
  overall: number;
  feedback: string[];
  gaps: string[];
}

// ============================================================================
// SIMULATION ENGINE
// ============================================================================

export class ArchetypeSimulationEngine {
  /**
   * Simulate perception of output from a specific archetype
   */
  async simulateArchetypePerception(
    archetype: ArchetypeType,
    output: {
      type: 'quote' | 'invoice' | 'compliance' | 'schedule' | 'report' | 'ui_screen';
      content: string;
      metadata?: Record<string, any>;
    }
  ): Promise<AcceptanceScore> {
    const profile = ARCHETYPE_PROFILES[archetype];

    // Evaluate clarity from archetype perspective
    const clarity = await this.evaluateClarity(output, profile);

    // Evaluate compliance from archetype perspective
    const compliance = await this.evaluateCompliance(output, profile);

    // Evaluate professionalism from archetype perspective
    const professionalism = await this.evaluateProfessionalism(output, profile);

    // Evaluate risk visibility from archetype perspective
    const riskVisibility = await this.evaluateRiskVisibility(output, profile);

    // Calculate overall acceptance score
    const overall = (clarity + compliance + professionalism + riskVisibility) / 4;

    // Generate feedback and identify gaps
    const feedback = this.generateFeedback(
      archetype,
      clarity,
      compliance,
      professionalism,
      riskVisibility
    );

    const gaps = this.identifyGaps(output, profile, {
      clarity,
      compliance,
      professionalism,
      riskVisibility,
    });

    return {
      archetype,
      clarity,
      compliance,
      professionalism,
      riskVisibility,
      overall,
      feedback,
      gaps,
    };
  }

  /**
   * Simulate perception from all archetypes
   */
  async simulateAllArchetypes(output: {
    type: 'quote' | 'invoice' | 'compliance' | 'schedule' | 'report' | 'ui_screen';
    content: string;
    metadata?: Record<string, any>;
  }): Promise<AcceptanceScore[]> {
    const archetypes: ArchetypeType[] = [
      'director',
      'admin',
      'estimator',
      'site_lead',
      'installer',
      'strata_manager',
      'insurer',
      'builder',
      'homeowner',
      'government_asset_manager',
    ];

    const scores = await Promise.all(
      archetypes.map((archetype) => this.simulateArchetypePerception(archetype, output))
    );

    return scores;
  }

  /**
   * Evaluate clarity of output
   */
  private async evaluateClarity(
    output: any,
    profile: ArchetypeProfile
  ): Promise<number> {
    let score = 10;

    // Check for jargon and technical terms
    const technicalTerms = [
      'algorithm',
      'API',
      'database',
      'encryption',
      'optimization',
      'synchronization',
    ];
    const content = output.content.toLowerCase();
    for (const term of technicalTerms) {
      if (content.includes(term.toLowerCase())) {
        score -= 1;
      }
    }

    // Check for clear structure
    if (!output.content.includes('Summary') && !output.content.includes('Overview')) {
      score -= 1;
    }

    // Check for key information highlighting
    if (!output.content.includes('**') && !output.content.includes('###')) {
      score -= 1;
    }

    // Check for simple language
    const complexWords = output.content.match(/\b\w{15,}\b/g) || [];
    if (complexWords.length > 10) {
      score -= 2;
    }

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Evaluate compliance of output
   */
  private async evaluateCompliance(
    output: any,
    profile: ArchetypeProfile
  ): Promise<number> {
    let score = 10;

    const content = output.content.toLowerCase();

    // Check for Australian building codes
    const complianceReferences = [
      'AS 1562.1',
      'AS/NZS 1170.2',
      'AS 3959',
      'NCC 2022',
      'building code',
      'compliance',
      'standard',
    ];

    let foundReferences = 0;
    for (const ref of complianceReferences) {
      if (content.includes(ref.toLowerCase())) {
        foundReferences++;
      }
    }

    if (foundReferences === 0) {
      score -= 3;
    } else if (foundReferences < 2) {
      score -= 1;
    }

    // Check for warranty terms
    if (!content.includes('warranty') && !content.includes('guarantee')) {
      score -= 2;
    }

    // Check for liability allocation
    if (!content.includes('liability') && !content.includes('responsibility')) {
      score -= 1;
    }

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Evaluate professionalism of output
   */
  private async evaluateProfessionalism(
    output: any,
    profile: ArchetypeProfile
  ): Promise<number> {
    let score = 10;

    // Check for spelling and grammar errors
    const commonErrors = ['teh', 'recieve', 'occured', 'seperate', 'untill'];
    const content = output.content.toLowerCase();
    for (const error of commonErrors) {
      if (content.includes(error)) {
        score -= 1;
      }
    }

    // Check for professional formatting
    if (!output.content.includes('#') && !output.content.includes('---')) {
      score -= 2;
    }

    // Check for consistent branding
    if (output.metadata?.branding !== 'consistent') {
      score -= 1;
    }

    // Check for professional tone
    if (content.includes('!!!') || content.includes('???')) {
      score -= 1;
    }

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Evaluate risk visibility of output
   */
  private async evaluateRiskVisibility(
    output: any,
    profile: ArchetypeProfile
  ): Promise<number> {
    let score = 10;

    const content = output.content.toLowerCase();

    // Check for risk disclosure
    const riskKeywords = ['risk', 'danger', 'hazard', 'caution', 'warning', 'exclusion'];
    let foundRisks = 0;
    for (const keyword of riskKeywords) {
      if (content.includes(keyword)) {
        foundRisks++;
      }
    }

    if (foundRisks === 0) {
      score -= 4;
    } else if (foundRisks < 2) {
      score -= 2;
    }

    // Check for exclusions
    if (!content.includes('exclusion') && !content.includes('not included')) {
      score -= 2;
    }

    // Check for assumptions
    if (!content.includes('assumption') && !content.includes('assumes')) {
      score -= 1;
    }

    // Check for contingencies
    if (!content.includes('contingency') && !content.includes('if')) {
      score -= 1;
    }

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Generate feedback for archetype
   */
  private generateFeedback(
    archetype: ArchetypeType,
    clarity: number,
    compliance: number,
    professionalism: number,
    riskVisibility: number
  ): string[] {
    const feedback: string[] = [];

    if (clarity < 7) {
      feedback.push(
        `Clarity concern: This content may be difficult for ${ARCHETYPE_PROFILES[archetype].name} to understand`
      );
    }

    if (compliance < 7) {
      feedback.push(
        `Compliance concern: This content may not meet regulatory requirements for ${ARCHETYPE_PROFILES[archetype].role}`
      );
    }

    if (professionalism < 7) {
      feedback.push(
        `Professionalism concern: This content may not reflect well on ThomCo to ${ARCHETYPE_PROFILES[archetype].name}`
      );
    }

    if (riskVisibility < 7) {
      feedback.push(
        `Risk visibility concern: Risks and exclusions are not clearly visible to ${ARCHETYPE_PROFILES[archetype].name}`
      );
    }

    return feedback;
  }

  /**
   * Identify gaps in output
   */
  private identifyGaps(
    output: any,
    profile: ArchetypeProfile,
    criteria: PerceptionCriteria
  ): string[] {
    const gaps: string[] = [];

    // Check for missing sections based on output type
    if (output.type === 'quote') {
      if (!output.content.includes('Materials')) gaps.push('Missing materials section');
      if (!output.content.includes('Labor')) gaps.push('Missing labor section');
      if (!output.content.includes('Total')) gaps.push('Missing total cost');
      if (!output.content.includes('Timeline')) gaps.push('Missing timeline');
      if (!output.content.includes('Warranty')) gaps.push('Missing warranty information');
    }

    if (output.type === 'compliance') {
      if (!output.content.includes('AS 1562.1')) gaps.push('Missing AS 1562.1 reference');
      if (!output.content.includes('AS/NZS 1170.2')) gaps.push('Missing AS/NZS 1170.2 reference');
      if (!output.content.includes('AS 3959')) gaps.push('Missing AS 3959 reference');
      if (!output.content.includes('NCC 2022')) gaps.push('Missing NCC 2022 reference');
    }

    // Check for missing information based on archetype concerns
    const concerns = profile.keyConcerns.join(' ').toLowerCase();
    if (concerns.includes('budget') && !output.content.toLowerCase().includes('cost')) {
      gaps.push('Missing budget/cost information');
    }

    if (concerns.includes('schedule') && !output.content.toLowerCase().includes('timeline')) {
      gaps.push('Missing schedule/timeline information');
    }

    if (concerns.includes('safety') && !output.content.toLowerCase().includes('safety')) {
      gaps.push('Missing safety information');
    }

    return gaps;
  }

  /**
   * Calculate overall acceptance across all archetypes
   */
  calculateOverallAcceptance(scores: AcceptanceScore[]): {
    average: number;
    minimum: number;
    maximum: number;
    byArchetype: Record<ArchetypeType, number>;
  } {
    const byArchetype: Record<ArchetypeType, number> = {} as any;

    for (const score of scores) {
      byArchetype[score.archetype] = score.overall;
    }

    const overallScores = scores.map((s) => s.overall);

    return {
      average: overallScores.reduce((a, b) => a + b, 0) / overallScores.length,
      minimum: Math.min(...overallScores),
      maximum: Math.max(...overallScores),
      byArchetype,
    };
  }

  /**
   * Determine if output meets real-world standard
   */
  meetsRealWorldStandard(scores: AcceptanceScore[]): boolean {
    const overall = this.calculateOverallAcceptance(scores);

    // Real-world standard: 8.0+ average, no archetype below 7.0
    return (
      overall.average >= 8.0 &&
      overall.minimum >= 7.0 &&
      scores.every((s) => s.clarity >= 7 && s.compliance >= 7 && s.professionalism >= 7)
    );
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const simulationEngine = new ArchetypeSimulationEngine();

