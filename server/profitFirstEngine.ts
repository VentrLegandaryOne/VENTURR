// Venturr Profit-First Engine
// Financial optimization for sustainable roofing business

import type {
  ProfitFirstCalculation,
  QuoteRequest,
  QuoteResult,
} from '../shared/workforceTypes';

import {
  PROFIT_FIRST_ALLOCATIONS,
  OVERHEAD_RATES,
  PROFIT_MARGINS,
} from '../shared/workforceTypes';

export class ProfitFirstEngine {
  /**
   * Calculate Profit-First allocation from revenue
   */
  static calculateProfitFirst(revenue: number): ProfitFirstCalculation {
    const allocations = PROFIT_FIRST_ALLOCATIONS;

    const profit = revenue * allocations.profit;
    const ownerPay = revenue * allocations.ownerPay;
    const tax = revenue * allocations.tax;
    const opex = revenue * allocations.opex;

    const recommendations: string[] = [];

    // Generate recommendations
    if (profit < revenue * 0.20) {
      recommendations.push('⚠️ Profit margin below 20% - consider increasing prices or reducing costs');
    }

    if (ownerPay < revenue * 0.25) {
      recommendations.push('⚠️ Owner compensation below 25% - ensure fair owner pay');
    }

    if (opex > revenue * 0.35) {
      recommendations.push('⚠️ Operating expenses above 35% - review cost structure');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Financial allocations are healthy and sustainable');
    }

    return {
      revenue,
      profitAllocation: allocations.profit,
      ownerPay: allocations.ownerPay,
      taxAllocation: allocations.tax,
      operatingExpenses: allocations.opex,
      breakdown: {
        profit: Math.round(profit),
        ownerPay: Math.round(ownerPay),
        tax: Math.round(tax),
        opex: Math.round(opex),
      },
      recommendations,
    };
  }

  /**
   * Generate complete project quote with Profit-First methodology
   */
  static generateQuote(request: QuoteRequest): QuoteResult {
    const { projectId, materials, labor, overhead, profitMargin, gst } = request;

    // Calculate material costs
    const materialsCost = materials.reduce(
      (sum, m) => sum + m.quantity * m.unitCost,
      0
    );

    // Labor cost from analysis
    const laborCost = labor.costs.totalCost;

    // Equipment cost (estimate 5% of labor)
    const equipmentCost = laborCost * 0.05;

    // Subcontractors (if any)
    const subcontractorsCost = 0;

    // Subtotal
    const subtotal = materialsCost + laborCost + equipmentCost + subcontractorsCost;

    // Overhead
    const overheadAmount = subtotal * overhead;

    // Profit
    const profitAmount = (subtotal + overheadAmount) * profitMargin;

    // GST
    const gstAmount = gst ? (subtotal + overheadAmount + profitAmount) * 0.1 : 0;

    // Total
    const total = subtotal + overheadAmount + profitAmount + gstAmount;

    // Calculate price per square meter
    const roofArea = request.labor.breakdown.installation / 0.35; // reverse calculate from installation hours
    const pricePerSqm = total / roofArea;

    // Apply Profit-First analysis
    const profitFirst = this.calculateProfitFirst(total);

    // Assess competitiveness
    const competitiveness = this.assessCompetitiveness(pricePerSqm);

    // Generate recommendations
    const recommendations = this.generateQuoteRecommendations(
      pricePerSqm,
      profitMargin,
      labor
    );

    return {
      quoteId: `Q-${Date.now()}`,
      projectId,
      totals: {
        materials: Math.round(materialsCost),
        labor: Math.round(laborCost),
        equipment: Math.round(equipmentCost),
        subcontractors: Math.round(subcontractorsCost),
        subtotal: Math.round(subtotal),
        overhead: Math.round(overheadAmount),
        profit: Math.round(profitAmount),
        gst: Math.round(gstAmount),
        total: Math.round(total),
      },
      pricePerSqm: Math.round(pricePerSqm * 100) / 100,
      profitFirst,
      competitiveness,
      recommendations,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };
  }

  /**
   * Assess quote competitiveness based on price per sqm
   */
  private static assessCompetitiveness(
    pricePerSqm: number
  ): 'low' | 'competitive' | 'high' {
    // Industry benchmarks (Australian market 2025)
    const LOW_THRESHOLD = 140;
    const HIGH_THRESHOLD = 200;

    if (pricePerSqm < LOW_THRESHOLD) {
      return 'low';
    } else if (pricePerSqm > HIGH_THRESHOLD) {
      return 'high';
    } else {
      return 'competitive';
    }
  }

  /**
   * Generate quote recommendations
   */
  private static generateQuoteRecommendations(
    pricePerSqm: number,
    profitMargin: number,
    labor: any
  ): string[] {
    const recommendations: string[] = [];

    // Price recommendations
    if (pricePerSqm < 140) {
      recommendations.push('⚠️ Price below market rate - consider increasing to $150-180/m²');
    } else if (pricePerSqm > 200) {
      recommendations.push('⚠️ Price above market rate - may reduce competitiveness');
    } else {
      recommendations.push('✅ Competitive pricing in the $150-180/m² sweet spot');
    }

    // Profit margin recommendations
    if (profitMargin < PROFIT_MARGINS.minimum) {
      recommendations.push('⚠️ Profit margin below 15% - not sustainable long-term');
    } else if (profitMargin >= PROFIT_MARGINS.standard) {
      recommendations.push('✅ Healthy profit margin ensuring business sustainability');
    }

    // Labor optimization recommendations
    if (labor.optimization.trainingOpportunity) {
      recommendations.push(`✅ Training opportunity: Apprentice development saves $${labor.optimization.costSavings}/day`);
    }

    if (labor.optimization.efficiency > 1.1) {
      recommendations.push(`✅ High-efficiency crew (${Math.round(labor.optimization.efficiency * 100)}%) - faster completion`);
    }

    // Duration recommendations
    if (labor.duration.days <= 2) {
      recommendations.push('✅ Quick turnaround - excellent for customer satisfaction');
    } else if (labor.duration.days > 5) {
      recommendations.push('⚠️ Extended timeline - consider larger crew for faster completion');
    }

    return recommendations;
  }

  /**
   * Calculate optimal overhead rate based on project characteristics
   */
  static calculateOptimalOverhead(
    isCoastal: boolean,
    isComplex: boolean
  ): number {
    if (isComplex) {
      return OVERHEAD_RATES.complex;
    } else if (isCoastal) {
      return OVERHEAD_RATES.coastal;
    } else {
      return OVERHEAD_RATES.standard;
    }
  }

  /**
   * Calculate optimal profit margin based on project characteristics
   */
  static calculateOptimalProfitMargin(
    complexity: 'simple' | 'standard' | 'complex',
    urgency: 'standard' | 'priority' | 'urgent'
  ): number {
    let margin = PROFIT_MARGINS.standard;

    if (complexity === 'complex') {
      margin = PROFIT_MARGINS.premium;
    } else if (complexity === 'simple') {
      margin = PROFIT_MARGINS.minimum;
    }

    // Increase margin for urgent projects
    if (urgency === 'urgent') {
      margin += 0.05;
    } else if (urgency === 'priority') {
      margin += 0.025;
    }

    return Math.min(margin, 0.40); // Cap at 40%
  }

  /**
   * Validate quote against business rules
   */
  static validateQuote(quote: QuoteResult): {
    valid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check minimum profit margin
    const actualMargin = quote.totals.profit / (quote.totals.subtotal + quote.totals.overhead);
    if (actualMargin < PROFIT_MARGINS.minimum) {
      errors.push(`Profit margin ${Math.round(actualMargin * 100)}% below minimum 15%`);
    }

    // Check price per sqm
    if (quote.pricePerSqm < 100) {
      errors.push('Price per m² below $100 - unsustainable');
    } else if (quote.pricePerSqm < 140) {
      warnings.push('Price per m² below market rate');
    }

    // Check Profit-First allocations
    if (quote.profitFirst.breakdown.profit < quote.totals.total * 0.20) {
      warnings.push('Profit allocation below 20% of revenue');
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors,
    };
  }
}

