/**
 * Compliance Content Utility
 * Provides manufacturer documentation, standards, and compliance information
 */

export interface ComplianceDocument {
  id: string;
  title: string;
  type: 'standard' | 'manufacturer' | 'guide' | 'certification';
  url: string;
  description: string;
  applicability: string[];
}

export interface ComplianceRequirement {
  standard: string;
  title: string;
  description: string;
  requirements: string[];
  verificationMethod: string;
}

// Australian Standards for Metal Roofing
export const australianStandards: ComplianceRequirement[] = [
  {
    standard: 'AS 1562.1:2018',
    title: 'Design and installation of sheet roof and wall cladding - Metal',
    description: 'Primary standard for metal roofing installation in Australia',
    requirements: [
      'Minimum roof pitch requirements for different profiles',
      'Fastener specifications and spacing',
      'Flashing and weatherproofing details',
      'Structural adequacy and load considerations',
      'Corrosion protection requirements'
    ],
    verificationMethod: 'Design certification and installation inspection'
  },
  {
    standard: 'AS/NZS 1170.2:2021',
    title: 'Structural design actions - Wind actions',
    description: 'Wind load calculations for roofing systems',
    requirements: [
      'Wind region classification (A, B, C, D)',
      'Terrain category assessment',
      'Building height and shape factors',
      'Pressure coefficients for roof surfaces',
      'Fastener load capacity verification'
    ],
    verificationMethod: 'Engineering calculations and certification'
  },
  {
    standard: 'AS 4040.3:2018',
    title: 'Durability of building materials - Metal',
    description: 'Corrosion resistance and durability requirements',
    requirements: [
      'Coastal zone classification (Severe/Moderate/Mild)',
      'Appropriate coating systems for environment',
      'Fastener material compatibility',
      'Maintenance requirements',
      'Expected service life documentation'
    ],
    verificationMethod: 'Material certification and environmental assessment'
  },
  {
    standard: 'NCC 2022 (Building Code of Australia)',
    title: 'National Construction Code',
    description: 'Building code compliance for roofing systems',
    requirements: [
      'Waterproofing and weather resistance (Section B1)',
      'Fire resistance requirements (Section C)',
      'Structural performance (Section B1)',
      'Energy efficiency (Section J)',
      'Condensation management'
    ],
    verificationMethod: 'Building surveyor approval and certification'
  },
  {
    standard: 'AS 3959:2018',
    title: 'Construction of buildings in bushfire-prone areas',
    description: 'Bushfire Attack Level (BAL) requirements',
    requirements: [
      'BAL rating determination (BAL-LOW to BAL-FZ)',
      'Appropriate roofing materials for BAL rating',
      'Ember guard requirements',
      'Roof penetration sealing',
      'Valley and gutter ember protection'
    ],
    verificationMethod: 'BAL assessment and bushfire consultant certification'
  }
];

// Manufacturer Documentation
export const manufacturerDocs: Record<string, ComplianceDocument[]> = {
  lysaght: [
    {
      id: 'lysaght-install-manual',
      title: 'Lysaght Installation Manual - Roofing and Walling',
      type: 'manufacturer',
      url: 'https://www.lysaght.com/wp-content/uploads/2021/05/LYT0026-2020-11-04-L1P0W1-Installation-Manual-Roofing-and-Walling.pdf',
      description: 'Comprehensive 63-page installation guide covering all Lysaght profiles',
      applicability: ['klip-lok', 'trimdek', 'custom-orb', 'spandek']
    },
    {
      id: 'lysaght-kliplok-guide',
      title: 'Klip-Lok 700 Hi-Strength Technical Guide',
      type: 'guide',
      url: 'https://www.lysaght.com/products/roofing/klip-lok-700-hi-strength/',
      description: 'Specific technical data for Klip-Lok 700 concealed fix system',
      applicability: ['klip-lok']
    },
    {
      id: 'lysaght-trimdek-guide',
      title: 'Trimdek Technical Guide',
      type: 'guide',
      url: 'https://www.lysaght.com/products/roofing/trimdek/',
      description: 'Technical specifications and installation for Trimdek profile',
      applicability: ['trimdek']
    },
    {
      id: 'lysaght-colorbond-warranty',
      title: 'COLORBOND® steel Warranty Information',
      type: 'certification',
      url: 'https://www.lysaght.com/colorbond-steel/warranty/',
      description: 'Warranty terms and conditions for COLORBOND® steel products',
      applicability: ['all-colorbond']
    }
  ],
  stramit: [
    {
      id: 'stramit-install-guide',
      title: 'Stramit Installation Guide',
      type: 'manufacturer',
      url: 'https://www.stramit.com.au/technical-support/installation-guides/',
      description: 'Installation guidelines for all Stramit roofing profiles',
      applicability: ['monoclad', 'speed-deck', 'megaclad']
    },
    {
      id: 'stramit-monoclad-spec',
      title: 'Monoclad® Product Specification',
      type: 'guide',
      url: 'https://www.stramit.com.au/products/roofing/monoclad/',
      description: 'Technical specifications for Monoclad concealed fix system',
      applicability: ['monoclad']
    },
    {
      id: 'stramit-coastal-guide',
      title: 'Coastal Installation Guide',
      type: 'guide',
      url: 'https://www.stramit.com.au/technical-support/coastal-applications/',
      description: 'Special requirements for coastal installations',
      applicability: ['all-coastal']
    }
  ],
  metroll: [
    {
      id: 'metroll-install-manual',
      title: 'Metroll Installation Manual',
      type: 'manufacturer',
      url: 'https://www.metroll.com.au/technical-library/installation-guides/',
      description: 'Complete installation manual for Metroll products',
      applicability: ['metlok', 'metdek', 'metrib', 'hi-deck']
    },
    {
      id: 'metroll-metlok-spec',
      title: 'Metlok 700 Technical Specification',
      type: 'guide',
      url: 'https://www.metroll.com.au/products/roofing/metlok-700/',
      description: 'Technical data for Metlok 700 concealed fix roofing',
      applicability: ['metlok']
    },
    {
      id: 'metroll-wind-rating',
      title: 'Wind Rating Guide',
      type: 'certification',
      url: 'https://www.metroll.com.au/technical-library/wind-ratings/',
      description: 'Wind load capacity and fastening requirements',
      applicability: ['all-profiles']
    }
  ]
};

// Get compliance documents for a specific material
export function getComplianceDocsForMaterial(materialId: string): ComplianceDocument[] {
  const docs: ComplianceDocument[] = [];
  
  // Determine manufacturer from material ID
  let manufacturer = '';
  if (materialId.toLowerCase().includes('lysaght')) manufacturer = 'lysaght';
  else if (materialId.toLowerCase().includes('stramit')) manufacturer = 'stramit';
  else if (materialId.toLowerCase().includes('metroll')) manufacturer = 'metroll';
  
  if (manufacturer && manufacturerDocs[manufacturer]) {
    // Get all manufacturer docs
    docs.push(...manufacturerDocs[manufacturer]);
  }
  
  return docs;
}

// Get applicable standards for a project
export function getApplicableStandards(params: {
  coastal?: boolean;
  windRegion?: string;
  balRating?: string;
}): ComplianceRequirement[] {
  const standards: ComplianceRequirement[] = [];
  
  // AS 1562.1 always applies
  standards.push(australianStandards[0]);
  
  // AS/NZS 1170.2 always applies for wind
  standards.push(australianStandards[1]);
  
  // AS 4040.3 applies if coastal
  if (params.coastal) {
    standards.push(australianStandards[2]);
  }
  
  // NCC always applies
  standards.push(australianStandards[3]);
  
  // AS 3959 applies if BAL rating specified
  if (params.balRating && params.balRating !== 'BAL-LOW') {
    standards.push(australianStandards[4]);
  }
  
  return standards;
}

// Generate compliance checklist
export function generateComplianceChecklist(params: {
  materialId: string;
  coastal?: boolean;
  windRegion?: string;
  balRating?: string;
  roofPitch?: number;
}): { item: string; status: 'required' | 'recommended' | 'optional'; checked: boolean }[] {
  const checklist: { item: string; status: 'required' | 'recommended' | 'optional'; checked: boolean }[] = [];
  
  // Basic requirements
  checklist.push({
    item: 'Verify roof pitch meets minimum for selected profile',
    status: 'required',
    checked: false
  });
  
  checklist.push({
    item: 'Confirm fastener specification matches wind region',
    status: 'required',
    checked: false
  });
  
  checklist.push({
    item: 'Check flashing details comply with AS 1562.1',
    status: 'required',
    checked: false
  });
  
  // Coastal requirements
  if (params.coastal) {
    checklist.push({
      item: 'Specify Class 4 or stainless steel fasteners for coastal zone',
      status: 'required',
      checked: false
    });
    
    checklist.push({
      item: 'Include quarterly maintenance schedule',
      status: 'recommended',
      checked: false
    });
  }
  
  // BAL requirements
  if (params.balRating && params.balRating !== 'BAL-LOW') {
    checklist.push({
      item: 'Verify roofing material approved for BAL rating',
      status: 'required',
      checked: false
    });
    
    checklist.push({
      item: 'Specify ember guard for valleys and gutters',
      status: 'required',
      checked: false
    });
  }
  
  // Wind requirements
  if (params.windRegion === 'C' || params.windRegion === 'D') {
    checklist.push({
      item: 'Increase fastener density for cyclonic region',
      status: 'required',
      checked: false
    });
    
    checklist.push({
      item: 'Obtain engineer certification for wind loads',
      status: 'required',
      checked: false
    });
  }
  
  return checklist;
}

