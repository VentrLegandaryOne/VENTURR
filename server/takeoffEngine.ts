/**
 * Takeoff Engine for Venturr
 * Rule-based calculators following Australian standards (HB-39, NCC)
 */

export interface TakeoffInput {
  area: number; // square meters
  linearMeters?: number; // for gutters, flashings
  roofPitch?: number; // degrees
  roofType: string; // gable, hip, flat, skillion
  profile: string; // Trimdek, Colorbond, etc.
  location: string; // for coastal allowances
  height?: number; // for scaffolding calculations
}

export interface MaterialItem {
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  wastePercentage: number;
}

export interface TakeoffResult {
  materials: MaterialItem[];
  labour: MaterialItem[];
  plant: MaterialItem[];
  subtotal: number;
  gst: number;
  total: number;
  complianceNotes: string[];
}

// Australian Standard Roof Profiles
const ROOF_PROFILES = {
  trimdek: {
    name: "Trimdek .48 BMT",
    coverWidth: 0.762, // meters
    wasteFactor: 1.15, // 15% waste
    fixingsPerSheet: 24,
  },
  colorbond: {
    name: "Colorbond Ultra",
    coverWidth: 0.762,
    wasteFactor: 1.12,
    fixingsPerSheet: 24,
  },
  corrugated: {
    name: "Corrugated CGI",
    coverWidth: 0.762,
    wasteFactor: 1.10,
    fixingsPerSheet: 20,
  },
};

// VENTURR Standards Baseline Pricing (Australian)
const BASELINE_PRICING = {
  // Materials (per unit)
  roofing_sheet: 45.0, // per meter
  ridge_capping: 28.0, // per meter
  valley_flashing: 32.0, // per meter
  apron_flashing: 25.0, // per meter
  gutter_flashing: 22.0, // per meter
  fixings_box: 85.0, // per box (500 screws)
  sarking: 12.0, // per m²
  
  // Labour (per unit)
  labour_install_roofing: 35.0, // per m²
  labour_install_flashings: 45.0, // per linear meter
  labour_install_gutters: 40.0, // per linear meter
  
  // Plant/Equipment (per day)
  scaffolding_day: 450.0,
  crane_hire_day: 1200.0,
  safety_equipment: 150.0,
};

// Coastal allowance multiplier
const COASTAL_MULTIPLIER = 1.15;

/**
 * Calculate roofing materials based on area and profile
 */
function calculateRoofingMaterials(
  area: number,
  profile: string,
  location: string
): MaterialItem[] {
  const profileData = ROOF_PROFILES[profile as keyof typeof ROOF_PROFILES] || ROOF_PROFILES.trimdek;
  
  // Calculate sheets needed
  const areaWithWaste = area * profileData.wasteFactor;
  const sheetsNeeded = Math.ceil(areaWithWaste / (profileData.coverWidth * 3.0)); // Assuming 3m sheets
  
  // Calculate fixings
  const fixingsNeeded = sheetsNeeded * profileData.fixingsPerSheet;
  const fixingBoxes = Math.ceil(fixingsNeeded / 500);
  
  // Apply coastal multiplier if needed
  const isCoastal = location.toLowerCase().includes("coast") || 
                    location.toLowerCase().includes("beach") ||
                    location.toLowerCase().includes("ocean");
  const priceMultiplier = isCoastal ? COASTAL_MULTIPLIER : 1.0;
  
  const materials: MaterialItem[] = [
    {
      category: "Roofing",
      description: `${profileData.name} Roofing Sheets`,
      quantity: sheetsNeeded,
      unit: "sheets",
      unitPrice: BASELINE_PRICING.roofing_sheet * priceMultiplier,
      totalPrice: sheetsNeeded * BASELINE_PRICING.roofing_sheet * priceMultiplier,
      wastePercentage: (profileData.wasteFactor - 1) * 100,
    },
    {
      category: "Roofing",
      description: "Roofing Screws (500/box)",
      quantity: fixingBoxes,
      unit: "boxes",
      unitPrice: BASELINE_PRICING.fixings_box,
      totalPrice: fixingBoxes * BASELINE_PRICING.fixings_box,
      wastePercentage: 0,
    },
    {
      category: "Roofing",
      description: "Roof Sarking/Underlay",
      quantity: area,
      unit: "m²",
      unitPrice: BASELINE_PRICING.sarking,
      totalPrice: area * BASELINE_PRICING.sarking,
      wastePercentage: 5,
    },
  ];
  
  return materials;
}

/**
 * Calculate flashings based on roof type and linear meters
 */
function calculateFlashings(
  roofType: string,
  linearMeters: number,
  area: number
): MaterialItem[] {
  const flashings: MaterialItem[] = [];
  
  // Ridge capping (for gable and hip roofs)
  if (roofType === "gable" || roofType === "hip") {
    const ridgeLength = roofType === "hip" ? Math.sqrt(area) * 1.5 : Math.sqrt(area);
    flashings.push({
      category: "Flashings",
      description: "Ridge Capping",
      quantity: ridgeLength,
      unit: "m",
      unitPrice: BASELINE_PRICING.ridge_capping,
      totalPrice: ridgeLength * BASELINE_PRICING.ridge_capping,
      wastePercentage: 10,
    });
  }
  
  // Valley flashings (for hip roofs)
  if (roofType === "hip") {
    const valleyLength = Math.sqrt(area) * 0.5;
    flashings.push({
      category: "Flashings",
      description: "Valley Flashing",
      quantity: valleyLength,
      unit: "m",
      unitPrice: BASELINE_PRICING.valley_flashing,
      totalPrice: valleyLength * BASELINE_PRICING.valley_flashing,
      wastePercentage: 10,
    });
  }
  
  // Apron flashings (wall junctions)
  if (linearMeters > 0) {
    flashings.push({
      category: "Flashings",
      description: "Apron/Wall Flashing",
      quantity: linearMeters,
      unit: "m",
      unitPrice: BASELINE_PRICING.apron_flashing,
      totalPrice: linearMeters * BASELINE_PRICING.apron_flashing,
      wastePercentage: 10,
    });
  }
  
  // Gutter flashings
  const gutterLength = Math.sqrt(area) * 2; // Estimate based on area
  flashings.push({
    category: "Flashings",
    description: "Gutter Flashing",
    quantity: gutterLength,
    unit: "m",
    unitPrice: BASELINE_PRICING.gutter_flashing,
    totalPrice: gutterLength * BASELINE_PRICING.gutter_flashing,
    wastePercentage: 10,
  });
  
  return flashings;
}

/**
 * Calculate labour costs
 */
function calculateLabour(area: number, linearMeters: number): MaterialItem[] {
  return [
    {
      category: "Labour",
      description: "Roofing Installation",
      quantity: area,
      unit: "m²",
      unitPrice: BASELINE_PRICING.labour_install_roofing,
      totalPrice: area * BASELINE_PRICING.labour_install_roofing,
      wastePercentage: 0,
    },
    {
      category: "Labour",
      description: "Flashings Installation",
      quantity: linearMeters,
      unit: "m",
      unitPrice: BASELINE_PRICING.labour_install_flashings,
      totalPrice: linearMeters * BASELINE_PRICING.labour_install_flashings,
      wastePercentage: 0,
    },
  ];
}

/**
 * Calculate plant/equipment costs
 */
function calculatePlant(area: number, height?: number): MaterialItem[] {
  const plant: MaterialItem[] = [];
  
  // Scaffolding required for heights > 2m or areas > 50m²
  if ((height && height > 2) || area > 50) {
    const scaffoldDays = Math.ceil(area / 100); // 1 day per 100m²
    plant.push({
      category: "Plant",
      description: "Scaffolding Hire",
      quantity: scaffoldDays,
      unit: "days",
      unitPrice: BASELINE_PRICING.scaffolding_day,
      totalPrice: scaffoldDays * BASELINE_PRICING.scaffolding_day,
      wastePercentage: 0,
    });
  }
  
  // Safety equipment (always required)
  plant.push({
    category: "Plant",
    description: "Safety Equipment & PPE",
    quantity: 1,
    unit: "job",
    unitPrice: BASELINE_PRICING.safety_equipment,
    totalPrice: BASELINE_PRICING.safety_equipment,
    wastePercentage: 0,
  });
  
  return plant;
}

/**
 * Generate compliance notes based on project parameters
 */
function generateComplianceNotes(input: TakeoffInput): string[] {
  const notes: string[] = [];
  
  // Height-based compliance
  if (input.height && input.height > 2) {
    notes.push("Work at height > 2m requires fall protection as per WHS Regulations 2011");
    notes.push("Scaffolding must comply with AS/NZS 1576 and be inspected before use");
  }
  
  // Roof pitch compliance
  if (input.roofPitch && input.roofPitch > 25) {
    notes.push("Roof pitch > 25° requires additional fall protection measures");
  }
  
  // Coastal compliance
  if (input.location.toLowerCase().includes("coast") || 
      input.location.toLowerCase().includes("beach")) {
    notes.push("Coastal location requires corrosion-resistant fixings (AS 3566)");
    notes.push("Wind rating must comply with AS 1562 for coastal exposure");
  }
  
  // General compliance
  notes.push("All work must comply with HB-39 Installation Code for Metal Roof and Wall Cladding");
  notes.push("Roof must comply with NCC 2022 Volume 2 weatherproofing requirements");
  notes.push("Building permit required for re-roofing work (check local council)");
  
  return notes;
}

/**
 * Main takeoff calculation function
 */
export function calculateTakeoff(input: TakeoffInput): TakeoffResult {
  const materials: MaterialItem[] = [];
  const labour: MaterialItem[] = [];
  const plant: MaterialItem[] = [];
  
  // Calculate roofing materials
  materials.push(...calculateRoofingMaterials(input.area, input.profile, input.location));
  
  // Calculate flashings
  materials.push(...calculateFlashings(input.roofType, input.linearMeters || 0, input.area));
  
  // Calculate labour
  labour.push(...calculateLabour(input.area, input.linearMeters || 0));
  
  // Calculate plant/equipment
  plant.push(...calculatePlant(input.area, input.height));
  
  // Calculate totals
  const materialsTotal = materials.reduce((sum, item) => sum + item.totalPrice, 0);
  const labourTotal = labour.reduce((sum, item) => sum + item.totalPrice, 0);
  const plantTotal = plant.reduce((sum, item) => sum + item.totalPrice, 0);
  
  const subtotal = materialsTotal + labourTotal + plantTotal;
  const gst = subtotal * 0.1; // 10% GST
  const total = subtotal + gst;
  
  // Generate compliance notes
  const complianceNotes = generateComplianceNotes(input);
  
  return {
    materials,
    labour,
    plant,
    subtotal,
    gst,
    total,
    complianceNotes,
  };
}

/**
 * Apply markup tiers to takeoff result
 */
export function applyMarkup(
  takeoff: TakeoffResult,
  markupTiers: {
    materials: number; // e.g., 1.3 for 30% markup
    labour: number;
    plant: number;
  }
): TakeoffResult {
  const materials = takeoff.materials.map(item => ({
    ...item,
    unitPrice: item.unitPrice * markupTiers.materials,
    totalPrice: item.totalPrice * markupTiers.materials,
  }));
  
  const labour = takeoff.labour.map(item => ({
    ...item,
    unitPrice: item.unitPrice * markupTiers.labour,
    totalPrice: item.totalPrice * markupTiers.labour,
  }));
  
  const plant = takeoff.plant.map(item => ({
    ...item,
    unitPrice: item.unitPrice * markupTiers.plant,
    totalPrice: item.totalPrice * markupTiers.plant,
  }));
  
  const materialsTotal = materials.reduce((sum, item) => sum + item.totalPrice, 0);
  const labourTotal = labour.reduce((sum, item) => sum + item.totalPrice, 0);
  const plantTotal = plant.reduce((sum, item) => sum + item.totalPrice, 0);
  
  const subtotal = materialsTotal + labourTotal + plantTotal;
  const gst = subtotal * 0.1;
  const total = subtotal + gst;
  
  return {
    materials,
    labour,
    plant,
    subtotal,
    gst,
    total,
    complianceNotes: takeoff.complianceNotes,
  };
}

