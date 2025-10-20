/**
 * Expanded Australian Metal Roofing Materials Database
 * Generated from comprehensive data acquisition operation
 * Source: Perplexity API + Manufacturer Technical Data
 * Date: 2025-10-20
 */

export interface RoofingMaterial {
  id: string;
  manufacturer: string;
  name: string;
  profile: string;
  category: 'roofing_sheet' | 'flashing' | 'fastener' | 'accessory' | 'insulation';
  material_type: string;
  bmt?: number;
  cover_width_mm?: number;
  min_pitch_degrees?: number;
  price_per_unit: number;
  unit: 'm²' | 'LM' | 'each' | 'box';
  wind_rating?: string;
  coastal_suitable: boolean;
  bal_suitable?: string[];
  compliance_standards: string[];
  typical_applications: string[];
  installation_notes?: string;
}

export const EXPANDED_MATERIALS: RoofingMaterial[] = [
  // LYSAGHT PRODUCTS
  {
    id: 'lysaght_kliplok_700_042_colorbond',
    manufacturer: 'Lysaght',
    name: 'Klip-Lok 700 0.42mm COLORBOND®',
    profile: 'Klip-Lok 700 (Concealed Fix)',
    category: 'roofing_sheet',
    material_type: 'COLORBOND® Steel G550',
    bmt: 0.42,
    cover_width_mm: 700,
    min_pitch_degrees: 1,
    price_per_unit: 52,
    unit: 'm²',
    wind_rating: 'AS/NZS 1170.2 compliant',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19', 'BAL-29'],
    compliance_standards: ['AS 1562.1', 'AS/NZS 1170.2', 'AS 4040'],
    typical_applications: ['Commercial roofing', 'Residential premium', 'Long-span applications'],
    installation_notes: 'Concealed fix with proprietary clips. No exposed fasteners.'
  },
  {
    id: 'lysaght_kliplok_700_048_colorbond',
    manufacturer: 'Lysaght',
    name: 'Klip-Lok 700 0.48mm COLORBOND®',
    profile: 'Klip-Lok 700 (Concealed Fix)',
    category: 'roofing_sheet',
    material_type: 'COLORBOND® Steel G550',
    bmt: 0.48,
    cover_width_mm: 700,
    min_pitch_degrees: 1,
    price_per_unit: 62,
    unit: 'm²',
    wind_rating: 'Enhanced wind load capacity',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19', 'BAL-29', 'BAL-40'],
    compliance_standards: ['AS 1562.1', 'AS/NZS 1170.2', 'AS 4040'],
    typical_applications: ['Commercial heavy-duty', 'Cyclonic regions', 'High wind zones'],
    installation_notes: 'Heavier gauge for increased span and wind resistance.'
  },
  {
    id: 'lysaght_kliplok_700_042_zincalume',
    manufacturer: 'Lysaght',
    name: 'Klip-Lok 700 0.42mm ZINCALUME®',
    profile: 'Klip-Lok 700 (Concealed Fix)',
    category: 'roofing_sheet',
    material_type: 'ZINCALUME® Steel G550',
    bmt: 0.42,
    cover_width_mm: 700,
    min_pitch_degrees: 1,
    price_per_unit: 45,
    unit: 'm²',
    wind_rating: 'AS/NZS 1170.2 compliant',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19', 'BAL-29'],
    compliance_standards: ['AS 1562.1', 'AS/NZS 1170.2', 'AS 4040'],
    typical_applications: ['Industrial', 'Agricultural', 'Cost-effective commercial'],
    installation_notes: 'Natural metallic finish. 20-year warranty.'
  },
  {
    id: 'lysaght_trimdek_042_colorbond',
    manufacturer: 'Lysaght',
    name: 'Trimdek 0.42mm COLORBOND®',
    profile: 'Trimdek (Trapezoidal)',
    category: 'roofing_sheet',
    material_type: 'COLORBOND® Steel G550',
    bmt: 0.42,
    cover_width_mm: 762,
    min_pitch_degrees: 2,
    price_per_unit: 48,
    unit: 'm²',
    wind_rating: 'Standard wind regions A & B',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19', 'BAL-29'],
    compliance_standards: ['AS 1562.1', 'AS/NZS 1170.2'],
    typical_applications: ['Residential', 'Light commercial', 'Sheds'],
    installation_notes: 'Pierce-fixed through crest. Popular residential profile.'
  },
  {
    id: 'lysaght_trimdek_048_colorbond',
    manufacturer: 'Lysaght',
    name: 'Trimdek 0.48mm COLORBOND®',
    profile: 'Trimdek (Trapezoidal)',
    category: 'roofing_sheet',
    material_type: 'COLORBOND® Steel G550',
    bmt: 0.48,
    cover_width_mm: 762,
    min_pitch_degrees: 2,
    price_per_unit: 58,
    unit: 'm²',
    wind_rating: 'Enhanced for regions B & C',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19', 'BAL-29', 'BAL-40'],
    compliance_standards: ['AS 1562.1', 'AS/NZS 1170.2'],
    typical_applications: ['Commercial', 'High wind areas', 'Larger spans'],
    installation_notes: 'Heavier gauge for commercial applications.'
  },
  {
    id: 'lysaght_trimdek_042_zincalume',
    manufacturer: 'Lysaght',
    name: 'Trimdek 0.42mm ZINCALUME®',
    profile: 'Trimdek (Trapezoidal)',
    category: 'roofing_sheet',
    material_type: 'ZINCALUME® Steel G550',
    bmt: 0.42,
    cover_width_mm: 762,
    min_pitch_degrees: 2,
    price_per_unit: 42,
    unit: 'm²',
    wind_rating: 'Standard wind regions A & B',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19', 'BAL-29'],
    compliance_standards: ['AS 1562.1', 'AS/NZS 1170.2'],
    typical_applications: ['Budget residential', 'Sheds', 'Garages'],
    installation_notes: 'Cost-effective alternative to Colorbond.'
  },
  {
    id: 'lysaght_custom_orb_042_colorbond',
    manufacturer: 'Lysaght',
    name: 'Custom Orb 0.42mm COLORBOND®',
    profile: 'Custom Orb (Corrugated)',
    category: 'roofing_sheet',
    material_type: 'COLORBOND® Steel G300',
    bmt: 0.42,
    cover_width_mm: 762,
    min_pitch_degrees: 5,
    price_per_unit: 44,
    unit: 'm²',
    wind_rating: 'Standard residential',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19'],
    compliance_standards: ['AS 1562.1'],
    typical_applications: ['Residential', 'Heritage', 'Traditional styling'],
    installation_notes: 'Classic corrugated profile. Requires 5° minimum pitch.'
  },
  {
    id: 'lysaght_custom_orb_042_zincalume',
    manufacturer: 'Lysaght',
    name: 'Custom Orb 0.42mm ZINCALUME®',
    profile: 'Custom Orb (Corrugated)',
    category: 'roofing_sheet',
    material_type: 'ZINCALUME® Steel G300',
    bmt: 0.42,
    cover_width_mm: 762,
    min_pitch_degrees: 5,
    price_per_unit: 38,
    unit: 'm²',
    wind_rating: 'Standard residential',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19'],
    compliance_standards: ['AS 1562.1'],
    typical_applications: ['Budget roofing', 'Sheds', 'Outbuildings'],
    installation_notes: 'Most economical roofing option.'
  },
  {
    id: 'lysaght_spandek_042_colorbond',
    manufacturer: 'Lysaght',
    name: 'Spandek 0.42mm COLORBOND®',
    profile: 'Spandek (Wide Rib)',
    category: 'roofing_sheet',
    material_type: 'COLORBOND® Steel G550',
    bmt: 0.42,
    cover_width_mm: 690,
    min_pitch_degrees: 2,
    price_per_unit: 46,
    unit: 'm²',
    wind_rating: 'Standard to moderate',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19', 'BAL-29'],
    compliance_standards: ['AS 1562.1', 'AS/NZS 1170.2'],
    typical_applications: ['Residential', 'Commercial', 'Industrial'],
    installation_notes: 'Versatile profile for various applications.'
  },

  // STRAMIT PRODUCTS
  {
    id: 'stramit_monoclad_042_colorbond',
    manufacturer: 'Stramit',
    name: 'Monoclad® 0.42mm COLORBOND®',
    profile: 'Monoclad (Concealed Fix, 700mm)',
    category: 'roofing_sheet',
    material_type: 'COLORBOND® Steel G550',
    bmt: 0.42,
    cover_width_mm: 700,
    min_pitch_degrees: 1,
    price_per_unit: 54,
    unit: 'm²',
    wind_rating: 'Cyclonic regions tested',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19', 'BAL-29', 'BAL-40'],
    compliance_standards: ['AS 1562.1', 'AS 4040', 'AS/NZS 1170'],
    typical_applications: ['Commercial', 'Architectural', 'Premium residential'],
    installation_notes: 'Concealed clip system. Automatic bird-proofing.'
  },
  {
    id: 'stramit_monoclad_048_colorbond',
    manufacturer: 'Stramit',
    name: 'Monoclad® 0.48mm COLORBOND®',
    profile: 'Monoclad (Concealed Fix, 700mm)',
    category: 'roofing_sheet',
    material_type: 'COLORBOND® Steel G550',
    bmt: 0.48,
    cover_width_mm: 700,
    min_pitch_degrees: 1,
    price_per_unit: 64,
    unit: 'm²',
    wind_rating: 'Enhanced cyclonic performance',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19', 'BAL-29', 'BAL-40', 'BAL-FZ'],
    compliance_standards: ['AS 1562.1', 'AS 4040', 'AS/NZS 1170'],
    typical_applications: ['Cyclonic commercial', 'High-end residential', 'Long spans'],
    installation_notes: 'Maximum span capacity. Premium performance.'
  },
  {
    id: 'stramit_speeddeck_ultra_042_colorbond',
    manufacturer: 'Stramit',
    name: 'Speed Deck Ultra® 0.42mm COLORBOND®',
    profile: 'Speed Deck Ultra (Concealed Fix, 700mm)',
    category: 'roofing_sheet',
    material_type: 'COLORBOND® Steel G550',
    bmt: 0.42,
    cover_width_mm: 700,
    min_pitch_degrees: 1,
    price_per_unit: 56,
    unit: 'm²',
    wind_rating: 'Unrivalled wind load performance',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19', 'BAL-29', 'BAL-40'],
    compliance_standards: ['AS 1562.1', 'AS 4040', 'AS/NZS 1170'],
    typical_applications: ['High wind zones', 'Cyclonic regions', 'Premium commercial'],
    installation_notes: 'Superior wind resistance. Concealed fixing.'
  },
  {
    id: 'stramit_speeddeck_500_048_colorbond',
    manufacturer: 'Stramit',
    name: 'Speed Deck 500® 0.48mm COLORBOND®',
    profile: 'Speed Deck 500 (Concealed Fix, 500mm)',
    category: 'roofing_sheet',
    material_type: 'COLORBOND® Steel G550',
    bmt: 0.48,
    cover_width_mm: 500,
    min_pitch_degrees: 1,
    price_per_unit: 68,
    unit: 'm²',
    wind_rating: 'High wind load resistance',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19', 'BAL-29', 'BAL-40'],
    compliance_standards: ['AS 1562.1', 'AS 4040', 'AS/NZS 1170'],
    typical_applications: ['Large commercial', 'Industrial', 'Wide spans'],
    installation_notes: 'Narrower cover for enhanced strength.'
  },
  {
    id: 'stramit_megaclad_042_colorbond',
    manufacturer: 'Stramit',
    name: 'Megaclad® 0.42mm COLORBOND®',
    profile: 'Megaclad (800mm cover, deep rib)',
    category: 'roofing_sheet',
    material_type: 'COLORBOND® Steel G550',
    bmt: 0.42,
    cover_width_mm: 800,
    min_pitch_degrees: 2,
    price_per_unit: 50,
    unit: 'm²',
    wind_rating: 'Standard to moderate',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19', 'BAL-29'],
    compliance_standards: ['AS 1562.1', 'AS 4040', 'AS/NZS 1170'],
    typical_applications: ['Commercial', 'Industrial', 'Large roofs'],
    installation_notes: 'Wide cover for efficiency. Through-fixed.'
  },
  {
    id: 'stramit_megaclad_048_colorbond',
    manufacturer: 'Stramit',
    name: 'Megaclad® 0.48mm COLORBOND®',
    profile: 'Megaclad (800mm cover, deep rib)',
    category: 'roofing_sheet',
    material_type: 'COLORBOND® Steel G550',
    bmt: 0.48,
    cover_width_mm: 800,
    min_pitch_degrees: 2,
    price_per_unit: 60,
    unit: 'm²',
    wind_rating: 'Enhanced commercial',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19', 'BAL-29', 'BAL-40'],
    compliance_standards: ['AS 1562.1', 'AS 4040', 'AS/NZS 1170'],
    typical_applications: ['Heavy commercial', 'Industrial', 'High wind areas'],
    installation_notes: 'Heavier gauge for demanding applications.'
  },

  // METROLL PRODUCTS
  {
    id: 'metroll_metlok700_042_colorbond',
    manufacturer: 'Metroll',
    name: 'Metlok 700 0.42mm COLORBOND®',
    profile: 'Metlok 700 (Standing Seam)',
    category: 'roofing_sheet',
    material_type: 'COLORBOND® Steel G550',
    bmt: 0.42,
    cover_width_mm: 700,
    min_pitch_degrees: 1,
    price_per_unit: 53,
    unit: 'm²',
    wind_rating: 'AS/NZS 1170.2 compliant',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19', 'BAL-29'],
    compliance_standards: ['AS/NZS 1562.1', 'AS/NZS 1170.2', 'AS 1397'],
    typical_applications: ['Commercial', 'Long-run applications', 'Architectural'],
    installation_notes: 'Concealed fix with proprietary clips.'
  },
  {
    id: 'metroll_metlok700_048_colorbond',
    manufacturer: 'Metroll',
    name: 'Metlok 700 0.48mm COLORBOND®',
    profile: 'Metlok 700 (Standing Seam)',
    category: 'roofing_sheet',
    material_type: 'COLORBOND® Steel G550',
    bmt: 0.48,
    cover_width_mm: 700,
    min_pitch_degrees: 1,
    price_per_unit: 63,
    unit: 'm²',
    wind_rating: 'Enhanced wind performance',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19', 'BAL-29', 'BAL-40'],
    compliance_standards: ['AS/NZS 1562.1', 'AS/NZS 1170.2', 'AS 1397'],
    typical_applications: ['Commercial heavy-duty', 'Cyclonic areas', 'Premium projects'],
    installation_notes: 'Maximum span and wind resistance.'
  },
  {
    id: 'metroll_metlok700_055_colorbond',
    manufacturer: 'Metroll',
    name: 'Metlok 700 0.55mm COLORBOND®',
    profile: 'Metlok 700 (Standing Seam)',
    category: 'roofing_sheet',
    material_type: 'COLORBOND® Steel G550',
    bmt: 0.55,
    cover_width_mm: 700,
    min_pitch_degrees: 1,
    price_per_unit: 73,
    unit: 'm²',
    wind_rating: 'Premium wind performance',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19', 'BAL-29', 'BAL-40', 'BAL-FZ'],
    compliance_standards: ['AS/NZS 1562.1', 'AS/NZS 1170.2', 'AS 1397'],
    typical_applications: ['Extreme conditions', 'Very long spans', 'Cyclonic commercial'],
    installation_notes: 'Heavy-duty for extreme applications.'
  },
  {
    id: 'metroll_metdek700_042_colorbond',
    manufacturer: 'Metroll',
    name: 'Metdek 700 0.42mm COLORBOND®',
    profile: 'Metdek 700 (Trapezoidal, concealed fix)',
    category: 'roofing_sheet',
    material_type: 'COLORBOND® Steel G550',
    bmt: 0.42,
    cover_width_mm: 700,
    min_pitch_degrees: 2,
    price_per_unit: 49,
    unit: 'm²',
    wind_rating: 'Standard commercial',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19', 'BAL-29'],
    compliance_standards: ['AS/NZS 1562.1', 'AS/NZS 1170.2', 'AS 1397'],
    typical_applications: ['Commercial', 'Industrial', 'Residential'],
    installation_notes: 'Concealed fix with clips.'
  },
  {
    id: 'metroll_metrib_042_colorbond',
    manufacturer: 'Metroll',
    name: 'Metrib 0.42mm COLORBOND®',
    profile: 'Metrib (Low rib, corrugated)',
    category: 'roofing_sheet',
    material_type: 'COLORBOND® Steel G550',
    bmt: 0.42,
    cover_width_mm: 762,
    min_pitch_degrees: 2,
    price_per_unit: 43,
    unit: 'm²',
    wind_rating: 'Standard residential',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19'],
    compliance_standards: ['AS/NZS 1562.1', 'AS/NZS 1170.2', 'AS 1397'],
    typical_applications: ['Residential', 'Sheds', 'Garages'],
    installation_notes: 'Pierce-fixed through crest.'
  },
  {
    id: 'metroll_hideck650_042_colorbond',
    manufacturer: 'Metroll',
    name: 'Hi-Deck 650 0.42mm COLORBOND®',
    profile: 'Hi-Deck 650 (High rib, trapezoidal)',
    category: 'roofing_sheet',
    material_type: 'COLORBOND® Steel G550',
    bmt: 0.42,
    cover_width_mm: 650,
    min_pitch_degrees: 2,
    price_per_unit: 51,
    unit: 'm²',
    wind_rating: 'Enhanced commercial',
    coastal_suitable: true,
    bal_suitable: ['BAL-12.5', 'BAL-19', 'BAL-29'],
    compliance_standards: ['AS/NZS 1562.1', 'AS/NZS 1170.2', 'AS 1397'],
    typical_applications: ['Commercial', 'Industrial', 'Wide spans'],
    installation_notes: 'High rib for increased strength.'
  },

  // FASTENERS
  {
    id: 'fastener_class3_12g_65mm',
    manufacturer: 'Generic',
    name: 'Class 3 Galvanized Screw 12g x 65mm',
    profile: 'Self-drilling screw with bonded washer',
    category: 'fastener',
    material_type: 'Zinc/aluminium alloy coating',
    price_per_unit: 0.12,
    unit: 'each',
    coastal_suitable: false,
    compliance_standards: ['AS 3566'],
    typical_applications: ['Inland areas', 'Low pollution environments', 'Standard residential'],
    installation_notes: 'Suitable for wind regions A & B. Not for coastal use.'
  },
  {
    id: 'fastener_class4_12g_65mm',
    manufacturer: 'Generic',
    name: 'Class 4 Galvanized Screw 12g x 65mm',
    profile: 'Self-drilling screw with bonded washer',
    category: 'fastener',
    material_type: 'Heavy-duty zinc coating',
    price_per_unit: 0.18,
    unit: 'each',
    coastal_suitable: true,
    compliance_standards: ['AS 3566'],
    typical_applications: ['Coastal areas', 'Industrial zones', 'Cyclonic regions'],
    installation_notes: 'Required for coastal and high-wind applications.'
  },
  {
    id: 'fastener_stainless_12g_65mm',
    manufacturer: 'Generic',
    name: 'Stainless Steel 316 Screw 12g x 65mm',
    profile: 'Self-drilling screw with bonded washer',
    category: 'fastener',
    material_type: 'Marine grade stainless steel 316',
    price_per_unit: 0.24,
    unit: 'each',
    coastal_suitable: true,
    compliance_standards: ['AS 3566'],
    typical_applications: ['Severe coastal', 'Marine environments', 'High BAL zones'],
    installation_notes: 'Maximum corrosion resistance. Required for severe marine.'
  },

  // FLASHINGS
  {
    id: 'flashing_ridge_colorbond',
    manufacturer: 'Generic',
    name: 'Ridge Capping COLORBOND®',
    profile: 'Ridge cap flashing',
    category: 'flashing',
    material_type: 'COLORBOND® Steel 0.42mm',
    price_per_unit: 22,
    unit: 'LM',
    coastal_suitable: true,
    compliance_standards: ['AS 1562.1'],
    typical_applications: ['All roof types', 'Ridge terminations'],
    installation_notes: 'Minimum 100mm overlap at joints.'
  },
  {
    id: 'flashing_valley_colorbond',
    manufacturer: 'Generic',
    name: 'Valley Flashing COLORBOND®',
    profile: 'Valley gutter',
    category: 'flashing',
    material_type: 'COLORBOND® Steel 0.42mm',
    price_per_unit: 28,
    unit: 'LM',
    coastal_suitable: true,
    compliance_standards: ['AS 1562.1'],
    typical_applications: ['Valley intersections', 'Water channeling'],
    installation_notes: 'Minimum 400mm width required. Install before sheets.'
  },
  {
    id: 'flashing_barge_colorbond',
    manufacturer: 'Generic',
    name: 'Barge Flashing COLORBOND®',
    profile: 'Barge/gable trim',
    category: 'flashing',
    material_type: 'COLORBOND® Steel 0.42mm',
    price_per_unit: 18,
    unit: 'LM',
    coastal_suitable: true,
    compliance_standards: ['AS 1562.1'],
    typical_applications: ['Gable ends', 'Edge protection'],
    installation_notes: 'Install after sheets, before ridge.'
  },
  {
    id: 'flashing_apron_colorbond',
    manufacturer: 'Generic',
    name: 'Apron Flashing COLORBOND®',
    profile: 'Wall abutment flashing',
    category: 'flashing',
    material_type: 'COLORBOND® Steel 0.42mm',
    price_per_unit: 24,
    unit: 'LM',
    coastal_suitable: true,
    compliance_standards: ['AS 1562.1'],
    typical_applications: ['Wall junctions', 'Chimney flashings'],
    installation_notes: 'Install before sheets. Seal with compatible sealant.'
  },

  // INSULATION
  {
    id: 'sarking_foil_standard',
    manufacturer: 'Generic',
    name: 'Foil Sarking Standard',
    profile: 'Reflective foil underlay',
    category: 'insulation',
    material_type: 'Aluminium foil laminate',
    price_per_unit: 9,
    unit: 'm²',
    coastal_suitable: true,
    compliance_standards: ['AS/NZS 4200.1'],
    typical_applications: ['Residential', 'Commercial', 'Condensation control'],
    installation_notes: 'Install horizontally with 150mm overlap. Tape joints.'
  },
  {
    id: 'insulation_blanket_r20',
    manufacturer: 'Generic',
    name: 'Roof Insulation Blanket R2.0',
    profile: 'Foil-faced glasswool',
    category: 'insulation',
    material_type: 'Glasswool with foil facing',
    price_per_unit: 15,
    unit: 'm²',
    coastal_suitable: true,
    compliance_standards: ['AS/NZS 4200.1', 'NCC Section J'],
    typical_applications: ['Energy efficiency', 'Thermal insulation', 'Condensation control'],
    installation_notes: 'Install under sheets. Provides thermal and acoustic benefits.'
  },
  {
    id: 'insulation_blanket_r40',
    manufacturer: 'Generic',
    name: 'Roof Insulation Blanket R4.0',
    profile: 'Premium foil-faced glasswool',
    category: 'insulation',
    material_type: 'High-density glasswool with foil',
    price_per_unit: 25,
    unit: 'm²',
    coastal_suitable: true,
    compliance_standards: ['AS/NZS 4200.1', 'NCC Section J'],
    typical_applications: ['Premium energy efficiency', 'Extreme climates', 'Commercial'],
    installation_notes: 'Maximum thermal performance. Thicker profile.'
  }
];

// Helper function to filter materials by category
export function getMaterialsByCategory(category: RoofingMaterial['category']): RoofingMaterial[] {
  return EXPANDED_MATERIALS.filter(m => m.category === category);
}

// Helper function to get coastal-suitable materials
export function getCoastalSuitableMaterials(): RoofingMaterial[] {
  return EXPANDED_MATERIALS.filter(m => m.coastal_suitable);
}

// Helper function to get materials by manufacturer
export function getMaterialsByManufacturer(manufacturer: string): RoofingMaterial[] {
  return EXPANDED_MATERIALS.filter(m => m.manufacturer.toLowerCase() === manufacturer.toLowerCase());
}

// Helper function to get materials suitable for specific BAL rating
export function getMaterialsByBAL(balRating: string): RoofingMaterial[] {
  return EXPANDED_MATERIALS.filter(m => 
    m.bal_suitable && m.bal_suitable.includes(balRating)
  );
}

