/**
 * Manufacturer Specifications Integration
 * Links materials to manufacturer documentation and compliance requirements
 */

export interface ManufacturerDocumentation {
  manufacturer: string;
  productName: string;
  installationManualUrl?: string;
  technicalDataSheetUrl?: string;
  warrantyDocumentUrl?: string;
  complianceStandards: string[];
  minimumPitch: number; // degrees
  maximumSpan: number; // mm
  fixingRequirements: {
    type: 'concealed' | 'pierce-fix';
    fastenersPerM2: number;
    fastenerType: string;
    notes: string[];
  };
  warrantyConditions: string[];
}

/**
 * Manufacturer documentation database
 */
export const manufacturerDocs: Record<string, ManufacturerDocumentation> = {
  // Lysaght Products
  'lysaght-kliplok-700': {
    manufacturer: 'Lysaght (BlueScope)',
    productName: 'Klip-Lok 700 Hi-Tensile',
    installationManualUrl: 'https://www.lysaght.com/content/dam/lysaght/australia/documents/installation-manuals/LYT0026-Installation-Manual-Roofing-and-Walling.pdf',
    technicalDataSheetUrl: 'https://www.lysaght.com/content/dam/lysaght/australia/documents/technical-data-sheets/kliplok-700.pdf',
    warrantyDocumentUrl: 'https://www.lysaght.com/en-au/warranty',
    complianceStandards: ['AS 1562.1:2018', 'AS/NZS 1170.2:2021', 'AS 4040.0:2018', 'NCC 2022'],
    minimumPitch: 1,
    maximumSpan: 1200,
    fixingRequirements: {
      type: 'concealed',
      fastenersPerM2: 8,
      fastenerType: 'Proprietary Klip-Lok clips',
      notes: [
        'Clips must be installed at every rib',
        'No exposed fasteners',
        'Follow clip spacing guide in manual section 9.1',
        'Ensure proper clip engagement before securing',
      ],
    },
    warrantyConditions: [
      'Installation must follow Lysaght Installation Manual LYT0026',
      'Use only genuine Lysaght accessories',
      'Regular maintenance required (annual inspection)',
      'Warranty void if dissimilar metals in contact',
      'Coastal installations require enhanced maintenance',
    ],
  },
  'lysaght-trimdek': {
    manufacturer: 'Lysaght (BlueScope)',
    productName: 'Trimdek',
    installationManualUrl: 'https://www.lysaght.com/content/dam/lysaght/australia/documents/installation-manuals/LYT0026-Installation-Manual-Roofing-and-Walling.pdf',
    technicalDataSheetUrl: 'https://www.lysaght.com/content/dam/lysaght/australia/documents/technical-data-sheets/trimdek.pdf',
    warrantyDocumentUrl: 'https://www.lysaght.com/en-au/warranty',
    complianceStandards: ['AS 1562.1:2018', 'AS/NZS 1170.2:2021', 'NCC 2022'],
    minimumPitch: 5,
    maximumSpan: 900,
    fixingRequirements: {
      type: 'pierce-fix',
      fastenersPerM2: 8,
      fastenerType: 'Self-drilling screws with bonded washers',
      notes: [
        'Fix through crest only',
        'Fasteners at every third corrugation minimum',
        'Side-lap fasteners every 300mm',
        'Follow manual section 7.3 for fixing patterns',
      ],
    },
    warrantyConditions: [
      'Installation must follow Lysaght Installation Manual LYT0026',
      'Minimum pitch 5° for standard applications',
      'Use Class 3 or higher fasteners',
      'Regular cleaning in coastal/industrial areas',
    ],
  },
  'lysaght-custom-orb': {
    manufacturer: 'Lysaght (BlueScope)',
    productName: 'Custom Orb',
    installationManualUrl: 'https://www.lysaght.com/content/dam/lysaght/australia/documents/installation-manuals/LYT0026-Installation-Manual-Roofing-and-Walling.pdf',
    technicalDataSheetUrl: 'https://www.lysaght.com/content/dam/lysaght/australia/documents/technical-data-sheets/custom-orb.pdf',
    warrantyDocumentUrl: 'https://www.lysaght.com/en-au/warranty',
    complianceStandards: ['AS 1562.1:2018', 'NCC 2022'],
    minimumPitch: 5,
    maximumSpan: 900,
    fixingRequirements: {
      type: 'pierce-fix',
      fastenersPerM2: 10,
      fastenerType: 'Self-drilling screws with bonded washers',
      notes: [
        'Fix through crest of corrugation',
        'Every corrugation at supports',
        'Alternate corrugations at intermediate supports',
        'Side-lap fasteners every 200mm',
      ],
    },
    warrantyConditions: [
      'Installation per Lysaght manual',
      'Minimum 5° pitch',
      'Appropriate fastener grade for environment',
      'No walking on troughs',
    ],
  },
  
  // Stramit Products
  'stramit-monoclad': {
    manufacturer: 'Stramit',
    productName: 'Monoclad',
    installationManualUrl: 'https://www.stramit.com.au/wp-content/uploads/2021/03/Stramit-Installation-Guide.pdf',
    complianceStandards: ['AS 1562.1:2018', 'AS/NZS 1170.2:2021', 'NCC 2022'],
    minimumPitch: 1,
    maximumSpan: 1200,
    fixingRequirements: {
      type: 'concealed',
      fastenersPerM2: 8,
      fastenerType: 'Monoclad concealed clips',
      notes: [
        'Proprietary clip system',
        'No exposed fasteners',
        'Clips at every pan',
        'Follow Stramit installation guide',
      ],
    },
    warrantyConditions: [
      'Use genuine Stramit clips and accessories',
      'Installation by licensed contractor',
      'Regular maintenance schedule',
      'Coastal installations require quarterly cleaning',
    ],
  },
  'stramit-speed-deck-ultra': {
    manufacturer: 'Stramit',
    productName: 'Speed Deck Ultra',
    installationManualUrl: 'https://www.stramit.com.au/wp-content/uploads/2021/03/Stramit-Installation-Guide.pdf',
    complianceStandards: ['AS 1562.1:2018', 'AS/NZS 1170.2:2021', 'NCC 2022'],
    minimumPitch: 2,
    maximumSpan: 1100,
    fixingRequirements: {
      type: 'pierce-fix',
      fastenersPerM2: 8,
      fastenerType: 'Self-drilling screws',
      notes: [
        'Fix through crest',
        'Every third rib minimum',
        'Enhanced fixing in high wind areas',
      ],
    },
    warrantyConditions: [
      'Stramit installation guide compliance',
      'Appropriate fastener selection',
      'Annual inspection recommended',
    ],
  },

  // Metroll Products
  'metroll-metlok-700': {
    manufacturer: 'Metroll',
    productName: 'Metlok 700',
    installationManualUrl: 'https://www.metroll.com.au/wp-content/uploads/Installation-Manual.pdf',
    complianceStandards: ['AS 1562.1:2018', 'AS/NZS 1170.2:2021', 'NCC 2022'],
    minimumPitch: 1,
    maximumSpan: 1200,
    fixingRequirements: {
      type: 'concealed',
      fastenersPerM2: 8,
      fastenerType: 'Metlok concealed clips',
      notes: [
        'Concealed clip system',
        'Clips at every rib',
        'No exposed fasteners',
        'Follow Metroll installation manual',
      ],
    },
    warrantyConditions: [
      'Genuine Metroll accessories only',
      'Licensed installer required',
      'Maintenance per manufacturer schedule',
    ],
  },
  'metroll-metdek-700': {
    manufacturer: 'Metroll',
    productName: 'Metdek 700',
    installationManualUrl: 'https://www.metroll.com.au/wp-content/uploads/Installation-Manual.pdf',
    complianceStandards: ['AS 1562.1:2018', 'AS/NZS 1170.2:2021', 'NCC 2022'],
    minimumPitch: 3,
    maximumSpan: 1000,
    fixingRequirements: {
      type: 'pierce-fix',
      fastenersPerM2: 8,
      fastenerType: 'Self-drilling screws with bonded washers',
      notes: [
        'Fix through crest',
        'Standard fixing pattern per manual',
        'Side-lap fasteners every 300mm',
      ],
    },
    warrantyConditions: [
      'Installation per Metroll manual',
      'Appropriate environmental protection',
      'Regular maintenance',
    ],
  },
  'lysaght-spandek': {
    manufacturer: 'Lysaght (BlueScope)',
    productName: 'Spandek',
    installationManualUrl: 'https://www.lysaght.com/content/dam/lysaght/australia/documents/installation-manuals/LYT0026-Installation-Manual-Roofing-and-Walling.pdf',
    technicalDataSheetUrl: 'https://www.lysaght.com/content/dam/lysaght/australia/documents/technical-data-sheets/spandek.pdf',
    warrantyDocumentUrl: 'https://www.lysaght.com/en-au/warranty',
    complianceStandards: ['AS 1562.1:2018', 'AS/NZS 1170.2:2021', 'NCC 2022'],
    minimumPitch: 2,
    maximumSpan: 900,
    fixingRequirements: {
      type: 'pierce-fix',
      fastenersPerM2: 8,
      fastenerType: 'Self-drilling screws with bonded washers',
      notes: [
        'Fix through crest of rib',
        'Every third rib at supports',
        'Side-lap fasteners every 300mm',
      ],
    },
    warrantyConditions: [
      'Follow Lysaght Installation Manual LYT0026',
      'Minimum pitch 2° for standard applications',
      'Use Class 3 or higher fasteners',
    ],
  },
  'stramit-megaclad': {
    manufacturer: 'Stramit',
    productName: 'Megaclad',
    installationManualUrl: 'https://www.stramit.com.au/wp-content/uploads/2021/03/Stramit-Installation-Guide.pdf',
    complianceStandards: ['AS 1562.1:2018', 'AS/NZS 1170.2:2021', 'NCC 2022'],
    minimumPitch: 1,
    maximumSpan: 1400,
    fixingRequirements: {
      type: 'pierce-fix',
      fastenersPerM2: 7,
      fastenerType: 'Self-drilling screws',
      notes: [
        'Wide cover width reduces fixing points',
        'Fix through crest',
        'Enhanced for long spans',
      ],
    },
    warrantyConditions: [
      'Stramit installation guide compliance',
      'Suitable for commercial applications',
      'Regular inspection in coastal areas',
    ],
  },
  'stramit-speed-deck': {
    manufacturer: 'Stramit',
    productName: 'Speed Deck',
    installationManualUrl: 'https://www.stramit.com.au/wp-content/uploads/2021/03/Stramit-Installation-Guide.pdf',
    complianceStandards: ['AS 1562.1:2018', 'AS/NZS 1170.2:2021', 'NCC 2022'],
    minimumPitch: 2,
    maximumSpan: 1000,
    fixingRequirements: {
      type: 'concealed',
      fastenersPerM2: 8,
      fastenerType: 'Concealed clips',
      notes: [
        'Concealed fix system',
        'Clean architectural appearance',
        'Clips at every rib',
      ],
    },
    warrantyConditions: [
      'Use genuine Stramit clips',
      'Licensed installer recommended',
      'Annual maintenance inspection',
    ],
  },
  'metroll-metrib': {
    manufacturer: 'Metroll',
    productName: 'Metrib',
    installationManualUrl: 'https://www.metroll.com.au/wp-content/uploads/Installation-Manual.pdf',
    complianceStandards: ['AS 1562.1:2018', 'NCC 2022'],
    minimumPitch: 5,
    maximumSpan: 900,
    fixingRequirements: {
      type: 'pierce-fix',
      fastenersPerM2: 10,
      fastenerType: 'Self-drilling screws with bonded washers',
      notes: [
        'Low rib corrugated profile',
        'Fix through crest',
        'Every corrugation at supports',
      ],
    },
    warrantyConditions: [
      'Follow Metroll installation manual',
      'Suitable for residential applications',
      'Regular maintenance required',
    ],
  },
  'metroll-hi-deck': {
    manufacturer: 'Metroll',
    productName: 'Hi-Deck 650',
    installationManualUrl: 'https://www.metroll.com.au/wp-content/uploads/Installation-Manual.pdf',
    complianceStandards: ['AS 1562.1:2018', 'AS/NZS 1170.2:2021', 'NCC 2022'],
    minimumPitch: 2,
    maximumSpan: 1100,
    fixingRequirements: {
      type: 'pierce-fix',
      fastenersPerM2: 8,
      fastenerType: 'Self-drilling screws',
      notes: [
        'High rib trapezoidal profile',
        'Enhanced structural capacity',
        'Fix through crest',
      ],
    },
    warrantyConditions: [
      'Installation per Metroll specifications',
      'Suitable for commercial and industrial',
      'Maintenance per schedule',
    ],
  },
};

/**
 * Get manufacturer documentation for a material
 * Normalizes material ID to match documentation keys
 */
export function getManufacturerDocs(materialId: string): ManufacturerDocumentation | null {
  // Normalize material ID by extracting manufacturer and profile
  // e.g., 'lysaght_kliplok_700_042_colorbond' -> 'lysaght-kliplok-700'
  // e.g., 'lysaght_trimdek_042_colorbond' -> 'lysaght-trimdek'
  
  const normalized = materialId
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/-\d+\.?\d*-(colorbond|zincalume|galvanized|zam).*$/, '') // Remove BMT and coating
    .replace(/-\d+\.?\d*$/, ''); // Remove trailing numbers
  
  // Try exact match first
  if (manufacturerDocs[normalized]) {
    return manufacturerDocs[normalized];
  }
  
  // Try to find by profile name (e.g., kliplok-700, trimdek, custom-orb)
  for (const [key, doc] of Object.entries(manufacturerDocs)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return doc;
    }
  }
  
  return null;
}

/**
 * Verify if project specifications meet manufacturer requirements
 */
export interface ComplianceCheck {
  compliant: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
}

export function verifyManufacturerCompliance(
  materialId: string,
  pitch: number,
  span: number,
  fastenerGrade: string,
  environment: { coastal: boolean; windRegion?: string }
): ComplianceCheck {
  const docs = getManufacturerDocs(materialId);
  const result: ComplianceCheck = {
    compliant: true,
    issues: [],
    warnings: [],
    recommendations: [],
  };

  if (!docs) {
    result.compliant = false;
    result.issues.push('No manufacturer documentation found for this material');
    return result;
  }

  // Check pitch
  if (pitch < docs.minimumPitch) {
    result.compliant = false;
    result.issues.push(
      `Roof pitch ${pitch}° is below minimum ${docs.minimumPitch}° for ${docs.productName}`
    );
    result.recommendations.push(`Increase pitch to minimum ${docs.minimumPitch}° or select different profile`);
  }

  // Check span
  if (span > docs.maximumSpan) {
    result.compliant = false;
    result.issues.push(
      `Span ${span}mm exceeds maximum ${docs.maximumSpan}mm for ${docs.productName}`
    );
    result.recommendations.push(`Reduce span to ${docs.maximumSpan}mm or add additional supports`);
  }

  // Check fastener grade for environment
  if (environment.coastal) {
    if (!fastenerGrade.includes('Stainless') && !fastenerGrade.includes('Class 4')) {
      result.warnings.push(
        'Coastal environment detected: Consider upgrading to Class 4 or Stainless Steel fasteners'
      );
      result.recommendations.push('Upgrade fastener specification for coastal durability');
    }
  }

  // Check wind region
  if (environment.windRegion === 'C' || environment.windRegion === 'D') {
    result.warnings.push(
      `High wind region ${environment.windRegion}: Enhanced fastening density required`
    );
    result.recommendations.push('Increase fastener density per AS/NZS 1170.2');
  }

  // Add general recommendations
  result.recommendations.push(
    `Review ${docs.manufacturer} installation manual before commencing work`,
    'Use only genuine manufacturer accessories to maintain warranty',
    'Schedule regular maintenance per manufacturer guidelines'
  );

  return result;
}

/**
 * Generate installation checklist based on manufacturer requirements
 */
export function generateInstallationChecklist(materialId: string): string[] {
  const docs = getManufacturerDocs(materialId);
  if (!docs) {
    return ['No manufacturer documentation available'];
  }

  const checklist: string[] = [
    '=== PRE-INSTALLATION ===',
    `Review ${docs.manufacturer} installation manual`,
    `Verify roof pitch meets minimum ${docs.minimumPitch}°`,
    `Confirm span does not exceed ${docs.maximumSpan}mm`,
    'Check all materials for damage',
    'Verify correct fastener grade for environment',
    'Ensure all accessories are genuine manufacturer parts',
    '',
    '=== INSTALLATION ===',
    ...docs.fixingRequirements.notes,
    `Maintain ${docs.fixingRequirements.fastenersPerM2} fasteners per m² minimum`,
    'Install sarking/blanket if required',
    'Ensure proper overlap at side-laps',
    'Install flashings per manufacturer details',
    '',
    '=== POST-INSTALLATION ===',
    'Remove all swarf immediately',
    'Clean roof surface',
    'Inspect all fasteners for proper sealing',
    'Verify no exposed cut edges',
    'Document installation date for warranty',
    'Provide client with maintenance schedule',
    '',
    '=== WARRANTY COMPLIANCE ===',
    ...docs.warrantyConditions,
  ];

  return checklist;
}

