/**
 * Job Costing Structure - Based on Thomco Roofing Template
 * Implements industry-standard job costing methodology
 */

export interface JobCostingTemplate {
  // Project Information
  projectInfo: {
    projectName: string;
    clientName: string;
    address: string;
    phone: string;
    email: string;
    quoteNumber: string;
    date: string;
    projectManager: string;
    estimatedStart: string;
    estimatedCompletion: string;
  };

  // Materials Section
  materials: MaterialLineItem[];
  materialsSubtotal: number;

  // Labor Section
  labor: LaborLineItem[];
  laborSubtotal: number;

  // Equipment Section
  equipment: EquipmentLineItem[];
  equipmentSubtotal: number;

  // Subcontractors Section
  subcontractors: SubcontractorLineItem[];
  subcontractorsSubtotal: number;

  // Other Costs
  otherCosts: OtherCostLineItem[];
  otherCostsSubtotal: number;

  // Cost Summary
  costSummary: CostSummary;

  // Profit Calculation
  profitCalculation: ProfitCalculation;

  // Final Pricing
  finalPricing: FinalPricing;
}

export interface MaterialLineItem {
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  supplier: string;
  category?: 'roofing' | 'flashings' | 'fasteners' | 'insulation' | 'accessories' | 'other';
}

export interface LaborLineItem {
  description: string;
  hours: number;
  rate: number;
  totalCost: number;
  crew?: string;
  skillLevel?: 'apprentice' | 'tradesperson' | 'supervisor';
}

export interface EquipmentLineItem {
  description: string;
  quantity: number;
  unit: string; // 'day', 'week', 'month', 'job'
  rate: number;
  totalCost: number;
  supplier?: string;
}

export interface SubcontractorLineItem {
  description: string;
  scope: string;
  totalCost: number;
  contractor: string;
  quoteReference?: string;
}

export interface OtherCostLineItem {
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  category?: 'permits' | 'waste' | 'transport' | 'contingency' | 'other';
}

export interface CostSummary {
  materialsTotal: number;
  laborTotal: number;
  equipmentTotal: number;
  subcontractorsTotal: number;
  otherCostsTotal: number;
  directCostsTotal: number; // Sum of all above
}

export interface ProfitCalculation {
  directCosts: number;
  overheadPercentage: number; // Typically 10-15%
  overheadAmount: number;
  totalCostsWithOverhead: number;
  profitMarginPercentage: number; // Typically 20-30%
  profitAmount: number;
  subtotalBeforeGST: number;
  gstPercentage: number; // 10% in Australia
  gstAmount: number;
  totalPrice: number;
}

export interface FinalPricing {
  totalPrice: number;
  pricePerSquareMeter: number;
  depositAmount: number; // Typically 30-50%
  depositPercentage: number;
  progressPayments?: ProgressPayment[];
  paymentTerms: string;
}

export interface ProgressPayment {
  stage: string;
  percentage: number;
  amount: number;
  description: string;
}

/**
 * Calculate job costing based on Thomco methodology
 */
export function calculateJobCosting(
  materials: MaterialLineItem[],
  labor: LaborLineItem[],
  equipment: EquipmentLineItem[],
  subcontractors: SubcontractorLineItem[],
  otherCosts: OtherCostLineItem[],
  options: {
    overheadPercentage?: number;
    profitMarginPercentage?: number;
    gstPercentage?: number;
    depositPercentage?: number;
  } = {}
): JobCostingTemplate {
  const {
    overheadPercentage = 12.5,
    profitMarginPercentage = 25,
    gstPercentage = 10,
    depositPercentage = 40,
  } = options;

  // Calculate subtotals
  const materialsSubtotal = materials.reduce((sum, item) => sum + item.totalCost, 0);
  const laborSubtotal = labor.reduce((sum, item) => sum + item.totalCost, 0);
  const equipmentSubtotal = equipment.reduce((sum, item) => sum + item.totalCost, 0);
  const subcontractorsSubtotal = subcontractors.reduce((sum, item) => sum + item.totalCost, 0);
  const otherCostsSubtotal = otherCosts.reduce((sum, item) => sum + item.totalCost, 0);

  // Cost summary
  const directCostsTotal =
    materialsSubtotal +
    laborSubtotal +
    equipmentSubtotal +
    subcontractorsSubtotal +
    otherCostsSubtotal;

  const costSummary: CostSummary = {
    materialsTotal: materialsSubtotal,
    laborTotal: laborSubtotal,
    equipmentTotal: equipmentSubtotal,
    subcontractorsTotal: subcontractorsSubtotal,
    otherCostsTotal: otherCostsSubtotal,
    directCostsTotal,
  };

  // Profit calculation (Profit First methodology)
  const overheadAmount = (directCostsTotal * overheadPercentage) / 100;
  const totalCostsWithOverhead = directCostsTotal + overheadAmount;
  const profitAmount = (totalCostsWithOverhead * profitMarginPercentage) / 100;
  const subtotalBeforeGST = totalCostsWithOverhead + profitAmount;
  const gstAmount = (subtotalBeforeGST * gstPercentage) / 100;
  const totalPrice = subtotalBeforeGST + gstAmount;

  const profitCalculation: ProfitCalculation = {
    directCosts: directCostsTotal,
    overheadPercentage,
    overheadAmount,
    totalCostsWithOverhead,
    profitMarginPercentage,
    profitAmount,
    subtotalBeforeGST,
    gstPercentage,
    gstAmount,
    totalPrice,
  };

  // Final pricing
  const depositAmount = (totalPrice * depositPercentage) / 100;

  const finalPricing: FinalPricing = {
    totalPrice,
    pricePerSquareMeter: 0, // To be calculated based on roof area
    depositAmount,
    depositPercentage,
    paymentTerms: 'Standard payment terms apply',
  };

  return {
    projectInfo: {
      projectName: '',
      clientName: '',
      address: '',
      phone: '',
      email: '',
      quoteNumber: '',
      date: new Date().toISOString().split('T')[0],
      projectManager: '',
      estimatedStart: '',
      estimatedCompletion: '',
    },
    materials,
    materialsSubtotal,
    labor,
    laborSubtotal,
    equipment,
    equipmentSubtotal,
    subcontractors,
    subcontractorsSubtotal,
    otherCosts,
    otherCostsSubtotal,
    costSummary,
    profitCalculation,
    finalPricing,
  };
}

/**
 * Calculate labor hours based on roof complexity
 * Based on industry standards and Thomco experience
 */
export function calculateLaborHours(params: {
  roofArea: number; // m²
  roofType: 'gable' | 'hip' | 'valley' | 'skillion' | 'flat' | 'complex';
  pitch: number; // degrees
  height: number; // meters
  accessDifficulty: 'easy' | 'moderate' | 'difficult';
  removalRequired: boolean;
  customFabrication: boolean;
}): {
  installationHours: number;
  removalHours: number;
  fabricationHours: number;
  totalHours: number;
  crewSize: number;
  days: number;
} {
  const { roofArea, roofType, pitch, height, accessDifficulty, removalRequired, customFabrication } = params;

  // Base installation rate (hours per m²)
  let baseRate = 0.5; // Standard gable roof

  // Roof type multiplier
  const roofTypeMultipliers = {
    gable: 1.0,
    skillion: 0.9,
    hip: 1.2,
    valley: 1.3,
    flat: 0.8,
    complex: 1.5,
  };
  baseRate *= roofTypeMultipliers[roofType];

  // Pitch multiplier
  if (pitch < 10) {
    baseRate *= 1.1; // Low pitch requires more care
  } else if (pitch > 30) {
    baseRate *= 1.3; // Steep pitch is slower and more dangerous
  }

  // Height multiplier
  if (height > 6) {
    baseRate *= 1.2; // Additional scaffolding and safety requirements
  }

  // Access difficulty multiplier
  const accessMultipliers = {
    easy: 1.0,
    moderate: 1.15,
    difficult: 1.3,
  };
  baseRate *= accessMultipliers[accessDifficulty];

  // Calculate installation hours
  const installationHours = roofArea * baseRate;

  // Calculate removal hours (if required)
  const removalHours = removalRequired ? roofArea * 0.3 : 0;

  // Calculate fabrication hours (if required)
  const fabricationHours = customFabrication ? roofArea * 0.2 : 0;

  // Total hours
  const totalHours = installationHours + removalHours + fabricationHours;

  // Determine crew size and days
  let crewSize = 2; // Standard crew
  if (roofArea > 100) crewSize = 3;
  if (roofArea > 200) crewSize = 4;

  const workingHoursPerDay = 7; // Realistic working hours
  const days = Math.ceil(totalHours / (crewSize * workingHoursPerDay));

  return {
    installationHours,
    removalHours,
    fabricationHours,
    totalHours,
    crewSize,
    days,
  };
}

/**
 * Generate quote number in Thomco format
 * Format: TRC-YYYY-MMDD-INITIALS
 */
export function generateQuoteNumber(initials: string = 'VR'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `TRC-${year}-${month}${day}-${initials}-${random}`;
}

/**
 * Calculate material waste percentage based on roof complexity
 */
export function calculateWastePercentage(params: {
  roofType: string;
  pitch: number;
  valleys: number;
  hips: number;
  penetrations: number;
}): number {
  let wastePercentage = 10; // Base waste

  // Roof type adjustment
  if (params.roofType === 'complex' || params.roofType === 'valley') {
    wastePercentage += 5;
  }

  // Pitch adjustment
  if (params.pitch > 30) {
    wastePercentage += 3;
  }

  // Complexity adjustment
  if (params.valleys > 2 || params.hips > 4) {
    wastePercentage += 5;
  }

  if (params.penetrations > 5) {
    wastePercentage += 2;
  }

  return Math.min(wastePercentage, 25); // Cap at 25%
}

