/**
 * Seed quote templates for common Australian construction projects
 * Run with: npx tsx scripts/seed-templates.ts
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { quoteTemplates } from "../drizzle/schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

// Comprehensive Australian construction templates
const templateData = [
  // 1. Roof Replacement - Colorbond
  {
    name: "Colorbond Roof Replacement",
    category: "Roofing",
    description: "Complete roof replacement using Colorbond steel roofing with Zincalume base. Includes removal of existing roof, installation of sarking, new Colorbond sheeting, ridge capping, and valley flashings. Suitable for residential properties up to 200m².",
    specifications: {
      materials: [
        "Colorbond steel roofing (0.42mm BMT)",
        "Anticon blanket sarking",
        "Galvanised steel battens",
        "Colorbond ridge capping",
        "Valley and box gutter flashings"
      ],
      dimensions: "Up to 200m² roof area",
      workmanship: "Licensed roof plumber, 10-year workmanship warranty",
      duration: "5-7 working days",
      standards: ["AS 1562.1:2018 - Metal roof and wall cladding"]
    },
    complianceRequirements: {
      buildingCode: "Building Code of Australia (BCA) Volume 2 - Class 1 and 10 buildings",
      standards: [
        "AS 1562.1:2018 - Design and installation of sheet roof and wall cladding",
        "AS/NZS 2904:1995 - Damp-proof courses and flashings"
      ],
      permits: "Building permit required for structural changes",
      insurance: "Public liability insurance $20M minimum",
      licensing: "Roof plumbing license required in all states"
    },
    estimatedCost: 4500000, // $45,000 in cents
    usageCount: 0,
    createdAt: new Date(),
  },

  // 2. Kitchen Renovation - Full
  {
    name: "Full Kitchen Renovation",
    category: "Kitchen",
    description: "Complete kitchen transformation including new cabinetry, benchtops, appliances, plumbing, and electrical work. Features soft-close drawers, stone benchtops, quality appliances, and modern lighting. Includes demolition and disposal of existing kitchen.",
    specifications: {
      materials: [
        "Polyurethane or 2-pac painted cabinets",
        "20mm stone benchtops (Caesarstone or similar)",
        "Stainless steel undermount sink",
        "Quality appliances (oven, cooktop, rangehood, dishwasher)",
        "LED downlights and under-cabinet lighting",
        "Soft-close drawer runners and hinges"
      ],
      dimensions: "Standard kitchen 3m x 3m (9m²)",
      workmanship: "Licensed plumber and electrician, 5-year cabinet warranty",
      duration: "3-4 weeks",
      standards: ["AS/NZS 3000:2018 - Electrical installations", "AS/NZS 3500 - Plumbing and drainage"]
    },
    complianceRequirements: {
      buildingCode: "BCA Volume 2 - Plumbing and electrical compliance",
      standards: [
        "AS/NZS 3000:2018 - Wiring rules",
        "AS/NZS 3500.1:2018 - Water services",
        "AS 1428.1:2009 - Design for access and mobility"
      ],
      permits: "Plumbing and electrical permits required",
      insurance: "Public liability insurance required",
      licensing: "Licensed plumber (PL number) and electrician (EC number) required"
    },
    estimatedCost: 3500000, // $35,000
    usageCount: 0,
    createdAt: new Date(),
  },

  // 3. Timber Deck Construction
  {
    name: "Hardwood Timber Deck",
    category: "Deck",
    description: "Ground-level or elevated hardwood timber deck using treated pine frame and hardwood decking boards. Includes stumps/footings, bearers, joists, decking, and balustrade if elevated. Perfect for outdoor entertaining areas.",
    specifications: {
      materials: [
        "H4 treated pine stumps and frame (90x90mm, 90x45mm)",
        "Merbau or Spotted Gum decking boards (90x19mm)",
        "Galvanised joist hangers and fixings",
        "Stainless steel decking screws",
        "Timber or aluminium balustrade (if elevated)"
      ],
      dimensions: "20-30m² deck area",
      workmanship: "Licensed builder, 7-year structural warranty",
      duration: "1-2 weeks",
      standards: ["AS 1684 - Residential timber-framed construction", "AS 1720.1 - Timber structures"]
    },
    complianceRequirements: {
      buildingCode: "BCA Volume 2 - Structural requirements for decks",
      standards: [
        "AS 1684.2:2010 - Residential timber-framed construction - Non-cyclonic areas",
        "AS 1720.1:2010 - Timber structures - Design methods",
        "AS 1657:2018 - Fixed platforms, walkways, stairways and ladders"
      ],
      permits: "Building permit required for decks over 1m high or attached to dwelling",
      insurance: "Public liability and structural warranty insurance",
      licensing: "Building license required (DB-L or equivalent)"
    },
    estimatedCost: 1800000, // $18,000
    usageCount: 0,
    createdAt: new Date(),
  },

  // 4. Bathroom Renovation
  {
    name: "Complete Bathroom Renovation",
    category: "Bathroom",
    description: "Full bathroom makeover including new tiles, vanity, shower, toilet, and fixtures. Includes waterproofing, plumbing, electrical, and tiling. Modern design with quality fittings and finishes.",
    specifications: {
      materials: [
        "600x600mm porcelain floor tiles",
        "300x600mm wall tiles",
        "Wall-hung vanity with stone top",
        "Frameless glass shower screen",
        "Quality tapware (chrome or matte black)",
        "Wall-faced toilet suite",
        "Exhaust fan with timer"
      ],
      dimensions: "Standard bathroom 2.5m x 2m (5m²)",
      workmanship: "Licensed plumber and tiler, 7-year waterproofing warranty",
      duration: "2-3 weeks",
      standards: ["AS 3740:2010 - Waterproofing of wet areas", "AS/NZS 3500 - Plumbing"]
    },
    complianceRequirements: {
      buildingCode: "BCA Volume 2 - Waterproofing and ventilation requirements",
      standards: [
        "AS 3740:2010 - Waterproofing of domestic wet areas within residential buildings",
        "AS/NZS 3500.2:2018 - Sanitary plumbing and drainage",
        "AS/NZS 3000:2018 - Electrical installations (wet areas)"
      ],
      permits: "Plumbing permit required, building permit if structural changes",
      insurance: "Public liability insurance required",
      licensing: "Licensed plumber and waterproofer required"
    },
    estimatedCost: 2200000, // $22,000
    usageCount: 0,
    createdAt: new Date(),
  },

  // 5. Concrete Driveway
  {
    name: "Exposed Aggregate Concrete Driveway",
    category: "Driveway",
    description: "New exposed aggregate concrete driveway with proper base preparation, reinforcement, and quality finish. Includes excavation, compacted road base, steel mesh reinforcement, and exposed aggregate concrete pour.",
    specifications: {
      materials: [
        "100mm thick N32 concrete",
        "SL82 steel mesh reinforcement",
        "100mm compacted road base",
        "Exposed aggregate finish (choice of aggregate)",
        "Control joints every 3m"
      ],
      dimensions: "Single car driveway 3m x 6m (18m²)",
      workmanship: "Experienced concretor, 5-year warranty",
      duration: "2-3 days plus 7-day cure time",
      standards: ["AS 3600:2018 - Concrete structures", "AS 3727:1993 - Guide to residential pavements"]
    },
    complianceRequirements: {
      buildingCode: "Local council requirements for crossovers and drainage",
      standards: [
        "AS 3600:2018 - Concrete structures",
        "AS 3727:1993 - Guide to residential pavements",
        "AS 1379:2007 - Specification and supply of concrete"
      ],
      permits: "Council approval required for new crossover",
      insurance: "Public liability insurance required",
      licensing: "Concreting license recommended"
    },
    estimatedCost: 1200000, // $12,000
    usageCount: 0,
    createdAt: new Date(),
  },

  // 6. Fence Installation - Colorbond
  {
    name: "Colorbond Fence Installation",
    category: "Fencing",
    description: "New Colorbond steel fencing with concrete posts and rails. Includes post holes, concrete footings, steel posts, rails, and Colorbond panels. Available in various heights and colors.",
    specifications: {
      materials: [
        "Colorbond steel panels (0.48mm BMT)",
        "Galvanised steel posts (50x50mm SHS)",
        "Galvanised steel rails (40x40mm SHS)",
        "Concrete footings (300mm diameter, 600mm deep)",
        "Post caps and fixings"
      ],
      dimensions: "1.8m high fence, 30 linear meters",
      workmanship: "Professional fence installer, 10-year warranty",
      duration: "2-3 days",
      standards: ["AS 2870:2011 - Residential slabs and footings", "AS/NZS 1170 - Structural design actions"]
    },
    complianceRequirements: {
      buildingCode: "Local council fencing regulations (height and setback)",
      standards: [
        "AS 2870:2011 - Residential slabs and footings",
        "AS/NZS 1170.2:2011 - Wind actions",
        "Fencing Act 1978 (varies by state)"
      ],
      permits: "Council approval may be required for front fences over 1m",
      insurance: "Public liability insurance required",
      licensing: "Fencing contractor license"
    },
    estimatedCost: 900000, // $9,000
    usageCount: 0,
    createdAt: new Date(),
  },

  // 7. Air Conditioning Installation
  {
    name: "Ducted Air Conditioning System",
    category: "HVAC",
    description: "Complete ducted reverse cycle air conditioning system for whole-home comfort. Includes outdoor compressor unit, indoor fan coil unit, ductwork, ceiling diffusers, and wall controller. Energy-efficient inverter technology.",
    specifications: {
      materials: [
        "Inverter ducted system (10-12kW capacity)",
        "Insulated flexible ductwork",
        "Ceiling diffusers (8-10 zones)",
        "Zone control system with dampers",
        "Wall-mounted controller",
        "Outdoor compressor unit"
      ],
      dimensions: "Suitable for 150-200m² home",
      workmanship: "Licensed refrigeration mechanic, 5-year parts and labor warranty",
      duration: "2-3 days",
      standards: ["AS/NZS 3000:2018 - Electrical installations", "AS/NZS 60335.2.40 - Air conditioners"]
    },
    complianceRequirements: {
      buildingCode: "BCA Volume 2 - Energy efficiency and electrical safety",
      standards: [
        "AS/NZS 3000:2018 - Wiring rules",
        "AS/NZS 60335.2.40:2013 - Safety of household appliances - Air conditioners",
        "ARC (Australian Refrigeration Council) license requirements"
      ],
      permits: "Electrical permit required",
      insurance: "Public liability insurance required",
      licensing: "ARC license (refrigeration) and electrical license required"
    },
    estimatedCost: 1500000, // $15,000
    usageCount: 0,
    createdAt: new Date(),
  },

  // 8. Pergola Construction
  {
    name: "Timber Pergola with Polycarbonate Roof",
    category: "Outdoor",
    description: "Freestanding or attached timber pergola with clear polycarbonate roofing for weather protection. Features treated pine posts, beams, and rafters with modern polycarbonate sheeting. Perfect for outdoor entertaining.",
    specifications: {
      materials: [
        "H4 treated pine posts (140x140mm)",
        "H3 treated pine beams and rafters (190x45mm)",
        "10mm multiwall polycarbonate roofing",
        "Galvanised post anchors and fixings",
        "Aluminium flashing and trim",
        "Concrete footings"
      ],
      dimensions: "4m x 4m (16m²) pergola",
      workmanship: "Licensed builder, 7-year structural warranty",
      duration: "3-5 days",
      standards: ["AS 1684 - Residential timber-framed construction", "AS/NZS 1170 - Structural design"]
    },
    complianceRequirements: {
      buildingCode: "BCA Volume 2 - Structural requirements for pergolas",
      standards: [
        "AS 1684.2:2010 - Residential timber-framed construction",
        "AS/NZS 1170.2:2011 - Wind actions",
        "AS 2870:2011 - Residential slabs and footings"
      ],
      permits: "Building permit required for attached pergolas or over 20m²",
      insurance: "Public liability and structural warranty insurance",
      licensing: "Building license required for attached structures"
    },
    estimatedCost: 800000, // $8,000
    usageCount: 0,
    createdAt: new Date(),
  },

  // 9. Retaining Wall - Concrete Sleepers
  {
    name: "Concrete Sleeper Retaining Wall",
    category: "Landscaping",
    description: "Engineered concrete sleeper retaining wall with proper drainage and compaction. Includes excavation, concrete footings, steel posts, concrete sleepers, drainage cell, and backfill. Suitable for level changes up to 1.5m.",
    specifications: {
      materials: [
        "200mm concrete sleepers (2.4m length)",
        "Galvanised steel posts (100x100mm RHS)",
        "Concrete footings (300x300mm)",
        "Drainage cell and agricultural pipe",
        "Compacted fill material",
        "Geofabric filter cloth"
      ],
      dimensions: "1.2m high wall, 10 linear meters",
      workmanship: "Experienced landscaper or builder, 5-year warranty",
      duration: "3-5 days",
      standards: ["AS 4678:2002 - Earth-retaining structures"]
    },
    complianceRequirements: {
      buildingCode: "BCA Volume 2 - Retaining walls over 1m require engineering",
      standards: [
        "AS 4678:2002 - Earth-retaining structures",
        "AS 2870:2011 - Residential slabs and footings",
        "AS 3798:2007 - Guidelines on earthworks for commercial and residential developments"
      ],
      permits: "Building permit required for walls over 1m or within 1.5m of boundary",
      insurance: "Public liability insurance required",
      licensing: "Building license required for engineered walls"
    },
    estimatedCost: 650000, // $6,500
    usageCount: 0,
    createdAt: new Date(),
  },

  // 10. Carport Construction
  {
    name: "Steel Frame Carport",
    category: "Carport",
    description: "Freestanding or attached steel frame carport with Colorbond roof. Includes engineered steel posts and beams, concrete footings, Colorbond roofing, and guttering. Single or double car configuration available.",
    specifications: {
      materials: [
        "Galvanised steel posts (100x100mm RHS)",
        "Galvanised steel beams and purlins",
        "Colorbond roofing (0.42mm BMT)",
        "Colorbond guttering and downpipes",
        "Concrete footings (400mm diameter, 800mm deep)",
        "Engineer-certified design"
      ],
      dimensions: "Single carport 3m x 6m (18m²)",
      workmanship: "Licensed builder, 10-year structural warranty",
      duration: "2-3 days",
      standards: ["AS 4100:2020 - Steel structures", "AS/NZS 1170 - Structural design actions"]
    },
    complianceRequirements: {
      buildingCode: "BCA Volume 2 - Structural requirements for carports",
      standards: [
        "AS 4100:2020 - Steel structures",
        "AS/NZS 1170.2:2011 - Wind actions",
        "AS 2870:2011 - Residential slabs and footings"
      ],
      permits: "Building permit required",
      insurance: "Public liability and structural warranty insurance",
      licensing: "Building license required"
    },
    estimatedCost: 550000, // $5,500
    usageCount: 0,
    createdAt: new Date(),
  },

  // 11. Laundry Renovation
  {
    name: "Laundry Renovation",
    category: "Laundry",
    description: "Complete laundry makeover with new cabinetry, benchtop, sink, and storage solutions. Includes plumbing updates, tiling, and modern fixtures. Maximizes space efficiency with smart storage.",
    specifications: {
      materials: [
        "Laminate or polyurethane cabinets",
        "Laminate or stone benchtop",
        "Stainless steel laundry tub",
        "Wall and floor tiles",
        "Chrome tapware",
        "Overhead cabinets and shelving"
      ],
      dimensions: "Standard laundry 2m x 2m (4m²)",
      workmanship: "Licensed plumber and cabinetmaker, 5-year warranty",
      duration: "1-2 weeks",
      standards: ["AS/NZS 3500 - Plumbing and drainage"]
    },
    complianceRequirements: {
      buildingCode: "BCA Volume 2 - Plumbing compliance",
      standards: [
        "AS/NZS 3500.1:2018 - Water services",
        "AS/NZS 3500.2:2018 - Sanitary plumbing and drainage",
        "AS 3740:2010 - Waterproofing (if floor waste installed)"
      ],
      permits: "Plumbing permit required",
      insurance: "Public liability insurance required",
      licensing: "Licensed plumber required"
    },
    estimatedCost: 1100000, // $11,000
    usageCount: 0,
    createdAt: new Date(),
  },

  // 12. Solar Panel Installation
  {
    name: "Residential Solar Panel System",
    category: "Solar",
    description: "Complete 6.6kW solar PV system with premium panels and inverter. Includes design, installation, electrical connection, and grid connection approval. Eligible for government rebates and feed-in tariffs.",
    specifications: {
      materials: [
        "Tier 1 solar panels (20x 330W panels)",
        "5kW hybrid inverter",
        "Roof mounting rails and clamps",
        "DC isolators and AC switchboard",
        "Monitoring system",
        "Electrical cabling and conduit"
      ],
      dimensions: "6.6kW system (approximately 35m² roof space)",
      workmanship: "CEC accredited installer, 10-year installation warranty, 25-year panel warranty",
      duration: "1-2 days",
      standards: ["AS/NZS 5033:2021 - Solar PV arrays", "AS/NZS 3000:2018 - Electrical installations"]
    },
    complianceRequirements: {
      buildingCode: "BCA Volume 2 - Electrical safety and structural load",
      standards: [
        "AS/NZS 5033:2021 - Installation and safety requirements for PV arrays",
        "AS/NZS 3000:2018 - Wiring rules",
        "AS/NZS 4777.1:2016 - Grid connection of energy systems via inverters"
      ],
      permits: "Electrical permit and network approval required",
      insurance: "Public liability insurance required",
      licensing: "CEC (Clean Energy Council) accreditation and electrical license required"
    },
    estimatedCost: 700000, // $7,000
    usageCount: 0,
    createdAt: new Date(),
  },

  // 13. Pool Fencing - Glass
  {
    name: "Frameless Glass Pool Fence",
    category: "Fencing",
    description: "Premium frameless glass pool fencing compliant with Australian pool safety standards. Features 12mm toughened glass panels, stainless steel spigots, and self-closing gate. Provides unobstructed pool views while ensuring safety.",
    specifications: {
      materials: [
        "12mm toughened safety glass panels",
        "Stainless steel spigots (core-drilled)",
        "Self-closing, self-latching gate",
        "Stainless steel gate hardware",
        "Compliant latch height (1500mm minimum)"
      ],
      dimensions: "Pool perimeter up to 25 linear meters",
      workmanship: "Certified pool fence installer, 10-year warranty",
      duration: "1-2 days",
      standards: ["AS 1926.1:2012 - Swimming pool safety - Fencing for swimming pools"]
    },
    complianceRequirements: {
      buildingCode: "BCA Volume 2 - Pool safety requirements",
      standards: [
        "AS 1926.1:2012 - Swimming pool safety - Part 1: Safety barriers for swimming pools",
        "AS 1926.2:2007 - Swimming pool safety - Part 2: Location of safety barriers for swimming pools",
        "AS 2208:1996 - Safety glazing materials in buildings"
      ],
      permits: "Pool safety certificate required",
      insurance: "Public liability insurance required",
      licensing: "Pool fence installer license/certification required"
    },
    estimatedCost: 1400000, // $14,000
    usageCount: 0,
    createdAt: new Date(),
  },

  // 14. Granny Flat Construction
  {
    name: "Single Bedroom Granny Flat",
    category: "Granny Flat",
    description: "Complete turnkey granny flat construction including slab, frame, roof, internal fit-out, plumbing, electrical, and finishes. Features 1 bedroom, bathroom, kitchen, and living area. Compliant with secondary dwelling regulations.",
    specifications: {
      materials: [
        "Concrete slab with steel reinforcement",
        "Timber or steel frame construction",
        "Colorbond roof",
        "Brick veneer or weatherboard cladding",
        "Plasterboard internal walls",
        "Standard kitchen and bathroom fit-out",
        "Carpet and vinyl flooring"
      ],
      dimensions: "60m² granny flat (1 bedroom + bathroom + kitchen/living)",
      workmanship: "Licensed builder, 6-year structural warranty",
      duration: "12-16 weeks",
      standards: ["AS 1684 - Residential timber-framed construction", "AS 3600 - Concrete structures"]
    },
    complianceRequirements: {
      buildingCode: "BCA Volume 2 - Class 1a dwelling requirements",
      standards: [
        "AS 1684.2:2010 - Residential timber-framed construction",
        "AS 3600:2018 - Concrete structures",
        "AS 3740:2010 - Waterproofing",
        "AS/NZS 3000:2018 - Electrical installations",
        "AS/NZS 3500 - Plumbing and drainage"
      ],
      permits: "Development approval and building permit required (subject to local council regulations)",
      insurance: "Home warranty insurance required for work over $20,000",
      licensing: "Building license (DB-L or equivalent) required"
    },
    estimatedCost: 12000000, // $120,000
    usageCount: 0,
    createdAt: new Date(),
  },

  // 15. Painting - Exterior
  {
    name: "Exterior House Painting",
    category: "Painting",
    description: "Complete exterior house painting including preparation, repairs, and two coats of premium acrylic paint. Includes pressure washing, scraping, filling, priming, and painting of all exterior surfaces. 10-year paint warranty.",
    specifications: {
      materials: [
        "Premium 100% acrylic exterior paint",
        "Primer/sealer for bare surfaces",
        "Filler and caulk for cracks",
        "Scaffolding or extension ladders",
        "Drop sheets and masking materials"
      ],
      dimensions: "Standard single-storey house (150-200m² painted surface)",
      workmanship: "Professional painter, 10-year paint warranty",
      duration: "5-7 days",
      standards: ["AS/NZS 2311:2009 - Painting of buildings"]
    },
    complianceRequirements: {
      buildingCode: "No specific BCA requirements for painting",
      standards: [
        "AS/NZS 2311:2009 - Guide to the painting of buildings",
        "AS 4361.1:2017 - Guide to lead paint management - Industrial applications"
      ],
      permits: "No permits required (scaffolding permit may be required for street access)",
      insurance: "Public liability insurance required",
      licensing: "Painting contractor license recommended"
    },
    estimatedCost: 850000, // $8,500
    usageCount: 0,
    createdAt: new Date(),
  },

  // 16. Window Replacement - Double Glazed
  {
    name: "Double Glazed Window Replacement",
    category: "Windows",
    description: "Energy-efficient double glazed window replacement with aluminum frames. Includes removal of old windows, installation of new double glazed units, sealing, and finishing. Improves thermal and acoustic performance.",
    specifications: {
      materials: [
        "Thermally broken aluminum frames",
        "6mm low-E glass with 12mm argon-filled cavity",
        "Weatherproof seals and gaskets",
        "Stainless steel hardware",
        "Flyscreens included"
      ],
      dimensions: "6-8 standard windows (1200x1200mm average)",
      workmanship: "Licensed glazier, 10-year warranty",
      duration: "2-3 days",
      standards: ["AS 2047:2014 - Windows and external glazed doors", "AS 1288:2006 - Glass in buildings"]
    },
    complianceRequirements: {
      buildingCode: "BCA Volume 2 - Energy efficiency (Section J) and safety glazing",
      standards: [
        "AS 2047:2014 - Windows and external glazed doors in buildings",
        "AS 1288:2006 - Glass in buildings - Selection and installation",
        "AS 2208:1996 - Safety glazing materials in buildings"
      ],
      permits: "Building permit may be required for structural changes",
      insurance: "Public liability insurance required",
      licensing: "Glazier license required"
    },
    estimatedCost: 1600000, // $16,000
    usageCount: 0,
    createdAt: new Date(),
  },

  // 17. Paving - Outdoor Entertaining Area
  {
    name: "Outdoor Paving - Natural Stone",
    category: "Landscaping",
    description: "Premium natural stone paving for outdoor entertaining area. Includes excavation, compacted base, bedding sand, natural stone pavers, and polymeric sand jointing. Creates beautiful, durable outdoor living space.",
    specifications: {
      materials: [
        "Natural stone pavers (bluestone, sandstone, or travertine)",
        "100mm compacted road base",
        "30mm bedding sand",
        "Polymeric jointing sand",
        "Edge restraints"
      ],
      dimensions: "25-30m² paved area",
      workmanship: "Experienced paving contractor, 5-year warranty",
      duration: "3-5 days",
      standards: ["AS 3727:1993 - Guide to residential pavements"]
    },
    complianceRequirements: {
      buildingCode: "Local council requirements for drainage and setbacks",
      standards: [
        "AS 3727:1993 - Guide to residential pavements",
        "AS 3798:2007 - Guidelines on earthworks"
      ],
      permits: "Generally no permit required for ground-level paving",
      insurance: "Public liability insurance required",
      licensing: "Paving contractor license recommended"
    },
    estimatedCost: 950000, // $9,500
    usageCount: 0,
    createdAt: new Date(),
  },

  // 18. Garage Door Replacement
  {
    name: "Sectional Garage Door with Motor",
    category: "Garage",
    description: "Modern sectional garage door with automatic opener. Includes removal of old door, installation of new Colorbond sectional door, electric motor with remote controls, and safety sensors. Quiet and reliable operation.",
    specifications: {
      materials: [
        "Colorbond sectional garage door (panel lift)",
        "Electric garage door opener (belt or chain drive)",
        "2x remote controls",
        "Safety beam sensors",
        "Internal wall button",
        "Emergency release mechanism"
      ],
      dimensions: "Standard double garage door (5.4m wide x 2.1m high)",
      workmanship: "Certified installer, 5-year motor warranty, 10-year door warranty",
      duration: "4-6 hours",
      standards: ["AS 4420.1:2016 - Automatic garage doors - Safety"]
    },
    complianceRequirements: {
      buildingCode: "BCA Volume 2 - Electrical safety",
      standards: [
        "AS 4420.1:2016 - Automatic garage doors and other power-operated doors - Safety",
        "AS/NZS 3000:2018 - Electrical installations"
      ],
      permits: "Electrical permit required for motor installation",
      insurance: "Public liability insurance required",
      licensing: "Electrical license required for motor installation"
    },
    estimatedCost: 280000, // $2,800
    usageCount: 0,
    createdAt: new Date(),
  },

  // 19. Gutter Replacement
  {
    name: "Colorbond Gutter and Downpipe Replacement",
    category: "Roofing",
    description: "Complete gutter and downpipe replacement using Colorbond steel. Includes removal of old gutters, installation of new quad or half-round gutters, downpipes, and leaf guard. Improves drainage and prevents water damage.",
    specifications: {
      materials: [
        "Colorbond quad or half-round gutters",
        "Colorbond downpipes (90mm diameter)",
        "Gutter brackets and fixings",
        "Leaf guard/gutter guard",
        "Rainwater head/sumps if required"
      ],
      dimensions: "Standard house perimeter (approximately 40 linear meters)",
      workmanship: "Licensed roof plumber, 10-year warranty",
      duration: "1-2 days",
      standards: ["AS/NZS 3500.3:2018 - Stormwater drainage"]
    },
    complianceRequirements: {
      buildingCode: "BCA Volume 2 - Stormwater drainage requirements",
      standards: [
        "AS/NZS 3500.3:2018 - Plumbing and drainage - Stormwater drainage",
        "AS/NZS 2904:1995 - Damp-proof courses and flashings"
      ],
      permits: "Plumbing permit required",
      insurance: "Public liability insurance required",
      licensing: "Roof plumbing license required"
    },
    estimatedCost: 320000, // $3,200
    usageCount: 0,
    createdAt: new Date(),
  },

  // 20. Insulation Installation
  {
    name: "Ceiling and Wall Insulation",
    category: "Insulation",
    description: "Energy-efficient insulation installation for ceiling and walls. Includes polyester or glasswool batts with appropriate R-values for Australian climate zones. Reduces energy costs and improves comfort year-round.",
    specifications: {
      materials: [
        "Ceiling insulation batts (R4.0-R6.0 depending on climate zone)",
        "Wall insulation batts (R2.0-R2.5)",
        "Polyester or glasswool material",
        "Vapor barriers if required"
      ],
      dimensions: "Standard 3-bedroom house (150m² ceiling, 200m² walls)",
      workmanship: "Accredited insulation installer, product warranty",
      duration: "1-2 days",
      standards: ["AS/NZS 4859.1:2018 - Thermal insulation materials"]
    },
    complianceRequirements: {
      buildingCode: "BCA Volume 2 - Energy efficiency (Section J)",
      standards: [
        "AS/NZS 4859.1:2018 - Thermal insulation materials for buildings",
        "AS 3999:2015 - Thermal insulation of dwellings - Bulk insulation"
      ],
      permits: "No permit required for insulation installation",
      insurance: "Public liability insurance required",
      licensing: "Insulation installer accreditation required"
    },
    estimatedCost: 450000, // $4,500
    usageCount: 0,
    createdAt: new Date(),
  },
];

async function seedTemplates() {
  console.log("🌱 Starting quote template seeding...");

  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  try {
    // Insert all template data
    for (const template of templateData) {
      await db.insert(quoteTemplates).values(template);
      console.log(`✅ Seeded: ${template.name} (${template.category}) - Est. ${(template.estimatedCost / 100).toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })}`);
    }

    console.log(`\n🎉 Successfully seeded ${templateData.length} quote templates!`);
    console.log("\nSummary:");
    console.log(`- Categories: Roofing, Kitchen, Bathroom, Deck, Driveway, Fencing, HVAC, Outdoor, Landscaping, Carport, Laundry, Solar, Granny Flat, Painting, Windows, Garage, Insulation`);
    console.log(`- Total templates: ${templateData.length}`);
    console.log(`- All templates include Australian standards and BCA compliance requirements`);
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedTemplates();
