// Venturr Workforce Intelligence Types
// ThomCo Integration v3.0

export interface CrewMember {
  id: string;
  name: string;
  role: 'lead' | 'experienced' | 'apprentice' | 'laborer';
  hourlyRate: number;
  skillLevel: number; // 1-10
  certifications: string[];
  availability: 'available' | 'busy' | 'unavailable';
  efficiency: number; // 0.7-1.3 multiplier
}

export interface WorkforceStructure {
  totalCrew: number;
  leads: number;
  experienced: number;
  apprentices: number;
  laborers: number;
  averageRate: number;
  teamEfficiency: number;
  monthlyCapacity: number; // hours
}

export interface LaborAnalysisRequest {
  projectId: string;
  roofArea: number;
  roofType: 'gable' | 'hip' | 'skillion' | 'flat' | 'complex';
  pitch: number;
  height: 'single' | 'double' | 'three_plus';
  accessDifficulty: 'easy' | 'moderate' | 'difficult' | 'very_difficult';
  removalRequired: boolean;
  customFabrication: boolean;
  urgency: 'standard' | 'priority' | 'urgent';
}

export interface LaborAnalysisResult {
  estimatedHours: number;
  recommendedCrew: {
    size: number;
    composition: {
      leads: number;
      experienced: number;
      apprentices: number;
      laborers: number;
    };
    members: CrewMember[];
  };
  duration: {
    days: number;
    startDate: Date;
    endDate: Date;
  };
  costs: {
    laborCost: number;
    hourlyRate: number;
    overtimeEstimate: number;
    totalCost: number;
  };
  optimization: {
    efficiency: number;
    trainingOpportunity: boolean;
    costSavings: number;
    qualityScore: number;
  };
  breakdown: {
    removal?: number;
    preparation: number;
    installation: number;
    customWork?: number;
    cleanup: number;
  };
}

export interface ProfitFirstCalculation {
  revenue: number;
  profitAllocation: number; // 25% default
  ownerPay: number; // 30% default
  taxAllocation: number; // 15% default
  operatingExpenses: number; // 30% default
  breakdown: {
    profit: number;
    ownerPay: number;
    tax: number;
    opex: number;
  };
  recommendations: string[];
}

export interface QuoteRequest {
  projectId: string;
  materials: {
    id: string;
    quantity: number;
    unitCost: number;
  }[];
  labor: LaborAnalysisResult;
  overhead: number; // percentage
  profitMargin: number; // percentage
  gst: boolean;
}

export interface QuoteResult {
  quoteId: string;
  projectId: string;
  totals: {
    materials: number;
    labor: number;
    equipment: number;
    subcontractors: number;
    subtotal: number;
    overhead: number;
    profit: number;
    gst: number;
    total: number;
  };
  pricePerSqm: number;
  profitFirst: ProfitFirstCalculation;
  competitiveness: 'low' | 'competitive' | 'high';
  recommendations: string[];
  validUntil: Date;
}

// ThomCo Real Workforce Data (Port Macquarie validated)
export const THOMCO_WORKFORCE: WorkforceStructure = {
  totalCrew: 8,
  leads: 2,
  experienced: 3,
  apprentices: 2,
  laborers: 1,
  averageRate: 45, // $/hour weighted average
  teamEfficiency: 1.15, // 15% above industry standard
  monthlyCapacity: 1280, // hours (8 crew × 160 hours/month)
};

export const THOMCO_CREW_MEMBERS: CrewMember[] = [
  {
    id: 'crew-001',
    name: 'Lead Installer 1',
    role: 'lead',
    hourlyRate: 65,
    skillLevel: 9,
    certifications: ['Working at Heights', 'Roof Safety', 'Supervisor'],
    availability: 'available',
    efficiency: 1.3,
  },
  {
    id: 'crew-002',
    name: 'Lead Installer 2',
    role: 'lead',
    hourlyRate: 60,
    skillLevel: 8,
    certifications: ['Working at Heights', 'Roof Safety'],
    availability: 'available',
    efficiency: 1.25,
  },
  {
    id: 'crew-003',
    name: 'Experienced Roofer 1',
    role: 'experienced',
    hourlyRate: 50,
    skillLevel: 7,
    certifications: ['Working at Heights', 'Roof Safety'],
    availability: 'available',
    efficiency: 1.1,
  },
  {
    id: 'crew-004',
    name: 'Experienced Roofer 2',
    role: 'experienced',
    hourlyRate: 48,
    skillLevel: 7,
    certifications: ['Working at Heights', 'Roof Safety'],
    availability: 'available',
    efficiency: 1.1,
  },
  {
    id: 'crew-005',
    name: 'Experienced Roofer 3',
    role: 'experienced',
    hourlyRate: 45,
    skillLevel: 6,
    certifications: ['Working at Heights'],
    availability: 'available',
    efficiency: 1.0,
  },
  {
    id: 'crew-006',
    name: 'Apprentice 1 (3rd Year)',
    role: 'apprentice',
    hourlyRate: 30,
    skillLevel: 5,
    certifications: ['Working at Heights'],
    availability: 'available',
    efficiency: 0.85,
  },
  {
    id: 'crew-007',
    name: 'Apprentice 2 (2nd Year)',
    role: 'apprentice',
    hourlyRate: 25,
    skillLevel: 4,
    certifications: ['Working at Heights'],
    availability: 'available',
    efficiency: 0.75,
  },
  {
    id: 'crew-008',
    name: 'Laborer',
    role: 'laborer',
    hourlyRate: 35,
    skillLevel: 3,
    certifications: ['Working at Heights', 'White Card'],
    availability: 'available',
    efficiency: 0.9,
  },
];

// Labor estimation constants (validated against Port Macquarie data)
export const LABOR_CONSTANTS = {
  BASE_HOURS_PER_SQM: {
    removal: 0.15, // hours per m²
    preparation: 0.10,
    installation: 0.35,
    cleanup: 0.05,
  },
  COMPLEXITY_MULTIPLIERS: {
    roofType: {
      gable: 1.0,
      hip: 1.15,
      skillion: 0.9,
      flat: 0.85,
      complex: 1.4,
    },
    pitch: {
      low: 1.0, // 0-15°
      medium: 1.1, // 15-25°
      steep: 1.3, // 25-35°
      very_steep: 1.6, // 35°+
    },
    height: {
      single: 1.0,
      double: 1.2,
      three_plus: 1.5,
    },
    access: {
      easy: 1.0,
      moderate: 1.15,
      difficult: 1.35,
      very_difficult: 1.6,
    },
  },
  CUSTOM_FABRICATION_HOURS: 4, // additional hours for custom work
  MINIMUM_CREW_SIZE: 2,
  OPTIMAL_CREW_SIZE: 3,
  MAXIMUM_CREW_SIZE: 5,
};

// Profit-First allocation percentages (Thomco validated)
export const PROFIT_FIRST_ALLOCATIONS = {
  profit: 0.25, // 25% - sustainable growth
  ownerPay: 0.30, // 30% - fair owner compensation
  tax: 0.15, // 15% - tax obligations
  opex: 0.30, // 30% - operating expenses
};

// Overhead rates
export const OVERHEAD_RATES = {
  standard: 0.125, // 12.5% - insurance, admin, tools, vehicle
  coastal: 0.15, // 15% - additional for coastal projects
  complex: 0.175, // 17.5% - additional for complex projects
};

// Profit margin targets
export const PROFIT_MARGINS = {
  minimum: 0.15, // 15% - break-even projects
  standard: 0.25, // 25% - target margin
  premium: 0.35, // 35% - high-value projects
};

