import { invokeLLM } from './llm';

/**
 * LLM-Powered Smart Quoting Engine
 * Generates intelligent quotes based on site measurements and materials
 */

export interface MeasurementData {
  totalArea: number;
  roofPitch: number;
  complexity: 'simple' | 'moderate' | 'complex';
  materials: string[];
  location: string;
  notes?: string;
}

export interface QuoteGenerationRequest {
  projectId: string;
  measurements: MeasurementData;
  laborRate: number;
  materialMarkup: number;
  businessName: string;
}

export interface GeneratedQuote {
  summary: string;
  itemizedBreakdown: Array<{
    item: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  laborCost: number;
  materialCost: number;
  subtotal: number;
  markup: number;
  tax: number;
  total: number;
  timeline: string;
  notes: string;
}

/**
 * Generate intelligent quote using LLM
 */
export async function generateSmartQuote(request: QuoteGenerationRequest): Promise<GeneratedQuote> {
  try {
    const prompt = buildQuotePrompt(request);

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are an expert roofing contractor assistant. Generate detailed, accurate roofing quotes based on measurements and materials. Always provide itemized breakdowns with realistic pricing.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'roofing_quote',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              summary: {
                type: 'string',
                description: 'Executive summary of the quote',
              },
              itemizedBreakdown: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    item: { type: 'string' },
                    quantity: { type: 'number' },
                    unit: { type: 'string' },
                    unitPrice: { type: 'number' },
                    total: { type: 'number' },
                  },
                  required: ['item', 'quantity', 'unit', 'unitPrice', 'total'],
                },
              },
              laborCost: { type: 'number' },
              materialCost: { type: 'number' },
              subtotal: { type: 'number' },
              markup: { type: 'number' },
              tax: { type: 'number' },
              total: { type: 'number' },
              timeline: { type: 'string' },
              notes: { type: 'string' },
            },
            required: [
              'summary',
              'itemizedBreakdown',
              'laborCost',
              'materialCost',
              'subtotal',
              'markup',
              'tax',
              'total',
              'timeline',
              'notes',
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (typeof content === 'string') {
      return JSON.parse(content);
    }

    throw new Error('Invalid LLM response format');
  } catch (error) {
    console.error('[LLM Quoting] Quote generation failed:', error);
    throw new Error('Failed to generate quote');
  }
}

/**
 * Build detailed prompt for quote generation
 */
function buildQuotePrompt(request: QuoteGenerationRequest): string {
  const { measurements, laborRate, materialMarkup, businessName } = request;

  return `
Generate a professional roofing quote with the following details:

PROJECT INFORMATION:
- Business: ${businessName}
- Location: ${measurements.location}
- Total Roof Area: ${measurements.totalArea} m²
- Roof Pitch: ${measurements.roofPitch}:12
- Complexity Level: ${measurements.complexity}
- Materials: ${measurements.materials.join(', ')}
- Additional Notes: ${measurements.notes || 'None'}

PRICING PARAMETERS:
- Labor Rate: $${laborRate}/hour
- Material Markup: ${materialMarkup}%

REQUIREMENTS:
1. Calculate accurate material quantities based on roof area and pitch
2. Estimate labor hours based on complexity
3. Apply material markup to all materials
4. Include all necessary components (underlayment, fasteners, flashing, etc.)
5. Provide realistic timeline for completion
6. Include relevant compliance notes for Australian standards
7. Format all prices in AUD

Please generate a detailed, itemized quote that a professional roofing contractor would provide.
`;
}

/**
 * Estimate project complexity based on measurements
 */
export function estimateComplexity(measurements: MeasurementData): 'simple' | 'moderate' | 'complex' {
  const { totalArea, roofPitch, materials } = measurements;

  let complexity: 'simple' | 'moderate' | 'complex' = 'simple';

  // Area-based complexity
  if (totalArea > 200) complexity = 'moderate';
  if (totalArea > 500) complexity = 'complex';

  // Pitch-based complexity
  if (roofPitch > 8) complexity = 'moderate';
  if (roofPitch > 12) complexity = 'complex';

  // Material-based complexity
  if (materials.includes('metal') || materials.includes('slate')) {
    complexity = 'moderate';
  }
  if (materials.includes('custom') || materials.includes('specialty')) {
    complexity = 'complex';
  }

  return complexity;
}

/**
 * Validate measurements for quote generation
 */
export function validateMeasurements(measurements: MeasurementData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (measurements.totalArea <= 0) {
    errors.push('Total area must be greater than 0');
  }

  if (measurements.roofPitch < 0 || measurements.roofPitch > 24) {
    errors.push('Roof pitch must be between 0 and 24');
  }

  if (!measurements.materials || measurements.materials.length === 0) {
    errors.push('At least one material must be specified');
  }

  if (!measurements.location) {
    errors.push('Location is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate labor hours based on complexity and area
 */
export function calculateLaborHours(measurements: MeasurementData): number {
  const baseHours = measurements.totalArea / 50; // 50 m² per hour base rate

  // Complexity multipliers
  const complexityMultiplier = {
    simple: 1.0,
    moderate: 1.3,
    complex: 1.6,
  };

  // Pitch multiplier (steeper = more time)
  const pitchMultiplier = 1 + measurements.roofPitch / 24;

  return Math.round(baseHours * complexityMultiplier[measurements.complexity] * pitchMultiplier * 10) / 10;
}

/**
 * Calculate material quantities based on area and pitch
 */
export function calculateMaterialQuantities(measurements: MeasurementData): Record<string, number> {
  const { totalArea, roofPitch } = measurements;

  // Adjust for pitch (steeper roofs need more materials)
  const pitchFactor = Math.sqrt(1 + (roofPitch / 12) ** 2);
  const adjustedArea = totalArea * pitchFactor;

  return {
    underlayment: Math.ceil(adjustedArea / 100) * 100, // m²
    fasteners: Math.ceil(adjustedArea / 10) * 100, // count
    flashing: Math.ceil(adjustedArea / 50) * 10, // linear meters
    sealant: Math.ceil(adjustedArea / 100) * 5, // liters
    waste: Math.ceil(adjustedArea * 0.1), // 10% waste factor
  };
}

/**
 * Get Australian compliance notes for quote
 */
export function getComplianceNotes(location: string): string[] {
  return [
    'Complies with AS 1562.1:2018 - Metal Roof and Wall Cladding Code of Practice',
    'Meets AS/NZS 1170.2:2021 wind load requirements',
    'Complies with NCC 2022 Building Code requirements',
    'Includes AS 3959:2018 bushfire protection measures',
    'All work performed by licensed contractors',
    'Warranty: 10 years materials, 5 years workmanship',
  ];
}

export default {
  generateSmartQuote,
  estimateComplexity,
  validateMeasurements,
  calculateLaborHours,
  calculateMaterialQuantities,
  getComplianceNotes,
};

