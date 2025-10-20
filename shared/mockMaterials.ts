// Mock material database for roofing takeoff calculator
// Based on Lysaght, Stramit, Metroll, Matrix Steel, and No.1 Roofing products

export interface Material {
  id: string;
  name: string;
  supplier: string;
  category: "roofing" | "flashing" | "gutter" | "fastener" | "insulation" | "accessory";
  profile?: string;
  material: string;
  thickness?: string;
  pricePerUnit: number;
  unit: "m²" | "m" | "each" | "kg";
  coverWidth?: number; // mm
  description: string;
}

export const MOCK_MATERIALS: Material[] = [
  // LYSAGHT ROOFING
  {
    id: "lys-trimdek-zam",
    name: "TRIMDEK® 0.42 BMT ZINCALUME®",
    supplier: "Lysaght",
    category: "roofing",
    profile: "TRIMDEK®",
    material: "ZINCALUME®",
    thickness: "0.42 BMT",
    pricePerUnit: 28.50,
    unit: "m²",
    coverWidth: 762,
    description: "Popular versatile profile suitable for roof and wall cladding"
  },
  {
    id: "lys-trimdek-cb",
    name: "TRIMDEK® 0.42 BMT COLORBOND®",
    supplier: "Lysaght",
    category: "roofing",
    profile: "TRIMDEK®",
    material: "COLORBOND®",
    thickness: "0.42 BMT",
    pricePerUnit: 35.80,
    unit: "m²",
    coverWidth: 762,
    description: "COLORBOND® steel with superior corrosion resistance"
  },
  {
    id: "lys-custom-orb-zam",
    name: "CUSTOM ORB® 0.42 BMT ZINCALUME®",
    supplier: "Lysaght",
    category: "roofing",
    profile: "CUSTOM ORB®",
    material: "ZINCALUME®",
    thickness: "0.42 BMT",
    pricePerUnit: 24.90,
    unit: "m²",
    coverWidth: 762,
    description: "Traditional corrugated profile, economical and versatile"
  },
  {
    id: "lys-custom-orb-cb",
    name: "CUSTOM ORB® 0.42 BMT COLORBOND®",
    supplier: "Lysaght",
    category: "roofing",
    profile: "CUSTOM ORB®",
    material: "COLORBOND®",
    thickness: "0.42 BMT",
    pricePerUnit: 31.50,
    unit: "m²",
    coverWidth: 762,
    description: "Classic corrugated with COLORBOND® finish"
  },
  {
    id: "lys-kliplok-700-zam",
    name: "KLIP-LOK 700 HI-STRENGTH® 0.48 BMT",
    supplier: "Lysaght",
    category: "roofing",
    profile: "KLIP-LOK 700",
    material: "ZINCALUME®",
    thickness: "0.48 BMT",
    pricePerUnit: 42.00,
    unit: "m²",
    coverWidth: 700,
    description: "Concealed fix profile for architectural applications"
  },

  // STRAMIT ROOFING
  {
    id: "str-monoclad-zam",
    name: "MONOCLAD® 0.42 BMT ZINCALUME®",
    supplier: "Stramit",
    category: "roofing",
    profile: "MONOCLAD®",
    material: "ZINCALUME®",
    thickness: "0.42 BMT",
    pricePerUnit: 29.20,
    unit: "m²",
    coverWidth: 762,
    description: "High performance trapezoidal profile"
  },
  {
    id: "str-monoclad-cb",
    name: "MONOCLAD® 0.42 BMT COLORBOND®",
    supplier: "Stramit",
    category: "roofing",
    profile: "MONOCLAD®",
    material: "COLORBOND®",
    thickness: "0.42 BMT",
    pricePerUnit: 36.50,
    unit: "m²",
    coverWidth: 762,
    description: "Trapezoidal profile with COLORBOND® finish"
  },
  {
    id: "str-corrugated-zam",
    name: "CORRUGATED 0.42 BMT ZINCALUME®",
    supplier: "Stramit",
    category: "roofing",
    profile: "CORRUGATED",
    material: "ZINCALUME®",
    thickness: "0.42 BMT",
    pricePerUnit: 25.50,
    unit: "m²",
    coverWidth: 762,
    description: "Standard corrugated profile"
  },

  // METROLL ROOFING
  {
    id: "met-metdek-zam",
    name: "METDEK® 0.42 BMT ZINCALUME®",
    supplier: "Metroll",
    category: "roofing",
    profile: "METDEK®",
    material: "ZINCALUME®",
    thickness: "0.42 BMT",
    pricePerUnit: 28.80,
    unit: "m²",
    coverWidth: 762,
    description: "Wide spanning trapezoidal profile"
  },
  {
    id: "met-metdek-cb",
    name: "METDEK® 0.42 BMT COLORBOND®",
    supplier: "Metroll",
    category: "roofing",
    profile: "METDEK®",
    material: "COLORBOND®",
    thickness: "0.42 BMT",
    pricePerUnit: 36.00,
    unit: "m²",
    coverWidth: 762,
    description: "Trapezoidal profile with COLORBOND® coating"
  },

  // FLASHINGS
  {
    id: "flash-ridge-zam",
    name: "Ridge Capping ZINCALUME®",
    supplier: "Generic",
    category: "flashing",
    material: "ZINCALUME®",
    thickness: "0.42 BMT",
    pricePerUnit: 18.50,
    unit: "m",
    description: "Standard ridge capping"
  },
  {
    id: "flash-ridge-cb",
    name: "Ridge Capping COLORBOND®",
    supplier: "Generic",
    category: "flashing",
    material: "COLORBOND®",
    thickness: "0.42 BMT",
    pricePerUnit: 22.00,
    unit: "m",
    description: "COLORBOND® ridge capping"
  },
  {
    id: "flash-valley-zam",
    name: "Valley Gutter ZINCALUME®",
    supplier: "Generic",
    category: "flashing",
    material: "ZINCALUME®",
    thickness: "0.42 BMT",
    pricePerUnit: 24.00,
    unit: "m",
    description: "Valley gutter flashing"
  },
  {
    id: "flash-barge-zam",
    name: "Barge Capping ZINCALUME®",
    supplier: "Generic",
    category: "flashing",
    material: "ZINCALUME®",
    thickness: "0.42 BMT",
    pricePerUnit: 16.50,
    unit: "m",
    description: "Barge/gable capping"
  },
  {
    id: "flash-apron-zam",
    name: "Apron Flashing ZINCALUME®",
    supplier: "Generic",
    category: "flashing",
    material: "ZINCALUME®",
    thickness: "0.42 BMT",
    pricePerUnit: 19.00,
    unit: "m",
    description: "Wall to roof apron flashing"
  },

  // GUTTERS
  {
    id: "gutter-quad-zam",
    name: "QUAD Gutter 150mm ZINCALUME®",
    supplier: "Lysaght",
    category: "gutter",
    material: "ZINCALUME®",
    thickness: "0.42 BMT",
    pricePerUnit: 15.50,
    unit: "m",
    description: "150mm quad gutter"
  },
  {
    id: "gutter-quad-cb",
    name: "QUAD Gutter 150mm COLORBOND®",
    supplier: "Lysaght",
    category: "gutter",
    material: "COLORBOND®",
    thickness: "0.42 BMT",
    pricePerUnit: 19.00,
    unit: "m",
    description: "150mm quad gutter COLORBOND®"
  },
  {
    id: "gutter-ogee-zam",
    name: "OGEE Gutter 115mm ZINCALUME®",
    supplier: "Generic",
    category: "gutter",
    material: "ZINCALUME®",
    thickness: "0.42 BMT",
    pricePerUnit: 14.00,
    unit: "m",
    description: "115mm ogee gutter"
  },
  {
    id: "downpipe-zam",
    name: "Downpipe 90mm ZINCALUME®",
    supplier: "Generic",
    category: "gutter",
    material: "ZINCALUME®",
    thickness: "0.42 BMT",
    pricePerUnit: 12.50,
    unit: "m",
    description: "90mm round downpipe"
  },

  // FASTENERS
  {
    id: "fast-screw-class3",
    name: "Roofing Screws Class 3 Galvanized",
    supplier: "Generic",
    category: "fastener",
    material: "Class 3 Galvanized",
    pricePerUnit: 0.35,
    unit: "each",
    description: "Standard roofing screws with seal washer"
  },
  {
    id: "fast-screw-class4",
    name: "Roofing Screws Class 4 Galvanized",
    supplier: "Generic",
    category: "fastener",
    material: "Class 4 Galvanized",
    pricePerUnit: 0.55,
    unit: "each",
    description: "Coastal/cyclonic rated screws"
  },
  {
    id: "fast-screw-ss",
    name: "Roofing Screws Stainless Steel 304",
    supplier: "Generic",
    category: "fastener",
    material: "Stainless Steel 304",
    pricePerUnit: 0.95,
    unit: "each",
    description: "Marine grade stainless steel screws"
  },
  {
    id: "fast-tek-screw",
    name: "Tek Screws 12-14 x 50mm",
    supplier: "Generic",
    category: "fastener",
    material: "Galvanized",
    pricePerUnit: 0.28,
    unit: "each",
    description: "Self-drilling screws for battens"
  },

  // INSULATION
  {
    id: "insul-blanket-r2",
    name: "Roof Insulation Blanket R2.0",
    supplier: "Generic",
    category: "insulation",
    material: "Polyester",
    pricePerUnit: 8.50,
    unit: "m²",
    description: "R2.0 thermal insulation blanket"
  },
  {
    id: "insul-blanket-r25",
    name: "Roof Insulation Blanket R2.5",
    supplier: "Generic",
    category: "insulation",
    material: "Polyester",
    pricePerUnit: 10.50,
    unit: "m²",
    description: "R2.5 thermal insulation blanket"
  },
  {
    id: "insul-sisalation",
    name: "Sisalation Foil Underlay",
    supplier: "Generic",
    category: "insulation",
    material: "Foil",
    pricePerUnit: 4.20,
    unit: "m²",
    description: "Reflective foil sarking"
  },

  // ACCESSORIES
  {
    id: "acc-batten-90x45",
    name: "Timber Batten 90x45mm H3 Treated",
    supplier: "Generic",
    category: "accessory",
    material: "Timber",
    pricePerUnit: 8.50,
    unit: "m",
    description: "Treated pine batten"
  },
  {
    id: "acc-closure-foam",
    name: "Foam Closure Strip",
    supplier: "Generic",
    category: "accessory",
    material: "Foam",
    pricePerUnit: 2.80,
    unit: "m",
    description: "Profile foam closure"
  },
  {
    id: "acc-bird-mesh",
    name: "Bird Mesh Guard",
    supplier: "Generic",
    category: "accessory",
    material: "Plastic",
    pricePerUnit: 3.50,
    unit: "m",
    description: "Bird/vermin mesh guard"
  },
  {
    id: "acc-gutter-guard",
    name: "Gutter Guard Mesh",
    supplier: "Generic",
    category: "accessory",
    material: "Aluminum",
    pricePerUnit: 12.00,
    unit: "m",
    description: "Aluminum gutter guard mesh"
  },
];

// Helper functions
export function getMaterialsByCategory(category: Material["category"]): Material[] {
  return MOCK_MATERIALS.filter(m => m.category === category);
}

export function getMaterialById(id: string): Material | undefined {
  return MOCK_MATERIALS.find(m => m.id === id);
}

export function getMaterialsBySupplier(supplier: string): Material[] {
  return MOCK_MATERIALS.filter(m => m.supplier === supplier);
}

export function searchMaterials(query: string): Material[] {
  const lowerQuery = query.toLowerCase();
  return MOCK_MATERIALS.filter(m => 
    m.name.toLowerCase().includes(lowerQuery) ||
    m.supplier.toLowerCase().includes(lowerQuery) ||
    m.description.toLowerCase().includes(lowerQuery)
  );
}

