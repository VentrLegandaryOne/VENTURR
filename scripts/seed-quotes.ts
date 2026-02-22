import { getDb } from "../server/db.js";
import { quotes, verifications, reports } from "../drizzle/schema.js";
import { sql } from "drizzle-orm";

const sampleQuotes = [
  // Completed quotes with full verification
  {
    userId: 1,
    fileName: "roof-replacement-colorbond.pdf",
    fileKey: "quotes/user-1/roof-replacement-001.pdf",
    fileUrl: "https://storage.example.com/quotes/roof-replacement-001.pdf",
    fileType: "application/pdf",
    fileSize: 245600,
    extractedData: {
      contractor: "Sydney Roofing Specialists",
      totalAmount: 4500000, // $45,000
      lineItems: [
        { description: "Colorbond roof replacement", quantity: 1, unitPrice: 3500000, total: 3500000 },
        { description: "Guttering and downpipes", quantity: 1, unitPrice: 800000, total: 800000 },
        { description: "Flashing and trim", quantity: 1, unitPrice: 200000, total: 200000 },
      ],
      projectAddress: "45 Harbour Street, Sydney NSW 2000",
      quoteDate: "2024-11-15",
      validUntil: "2025-02-15",
    },
    status: "completed" as const,
    progressPercentage: 100,
    verification: {
      overallScore: 92,
      pricingScore: 90,
      materialsScore: 95,
      complianceScore: 93,
      warrantyScore: 89,
      riskLevel: "low" as const,
      flaggedIssues: JSON.stringify([]),
      potentialSavings: 350000, // $3,500
    },
    report: {
      summary: "Complete Colorbond roof replacement with premium materials. Excellent compliance with AS 1562.1 and BCA requirements. Licensed contractor with valid insurance.",
      keyFindings: JSON.stringify([
        "Colorbond steel meets Australian Standards AS 1562.1",
        "Proper ventilation and sarking specified",
        "15-year manufacturer warranty + 10-year workmanship warranty",
        "Licensed roofing contractor (#NSW123456) with $20M public liability insurance",
        "Price competitive - 7.2% below market average for similar projects"
      ]),
      recommendations: JSON.stringify([
        "Verify contractor's license before signing contract",
        "Ensure warranty documentation is provided in writing",
        "Schedule final building inspection after completion",
        "Request progress photos during installation"
      ]),
      complianceChecks: JSON.stringify([
        { standard: "AS 1562.1 - Metal Roof Sheeting", status: "pass", details: "Colorbond steel specifications meet all requirements" },
        { standard: "Building Code of Australia", status: "pass", details: "Roof pitch, ventilation, and fire rating compliant" },
        { standard: "AS 2050 - Installation of Roof Tiles", status: "pass", details: "Proper installation methods specified" },
      ]),
      estimatedSavings: 350000,
    },
  },
  {
    userId: 1,
    fileName: "kitchen-renovation-modern.pdf",
    fileKey: "quotes/user-1/kitchen-reno-002.pdf",
    fileUrl: "https://storage.example.com/quotes/kitchen-reno-002.pdf",
    fileType: "application/pdf",
    fileSize: 312400,
    extractedData: {
      contractor: "Melbourne Kitchen Designs",
      totalAmount: 3200000, // $32,000
      lineItems: [
        { description: "Custom cabinetry - polyurethane finish", quantity: 1, unitPrice: 1800000, total: 1800000 },
        { description: "Stone benchtops - engineered stone", quantity: 1, unitPrice: 650000, total: 650000 },
        { description: "European appliances package", quantity: 1, unitPrice: 450000, total: 450000 },
        { description: "Plumbing and electrical work", quantity: 1, unitPrice: 300000, total: 300000 },
      ],
      projectAddress: "12 Collins Street, Melbourne VIC 3000",
      quoteDate: "2024-11-20",
      validUntil: "2025-02-20",
    },
    status: "completed" as const,
    progressPercentage: 100,
    verification: {
      overallScore: 88,
      pricingScore: 85,
      materialsScore: 92,
      complianceScore: 90,
      warrantyScore: 85,
      riskLevel: "low" as const,
      flaggedIssues: JSON.stringify(["Electrical work certificate not mentioned in quote"]),
      potentialSavings: 280000, // $2,800
    },
    report: {
      summary: "High-quality kitchen renovation with premium materials and European appliances. Good compliance with AS/NZS 3000 electrical standards and plumbing codes.",
      keyFindings: JSON.stringify([
        "Licensed electrician and plumber included in scope",
        "Engineered stone benchtops with 10-year manufacturer warranty",
        "Quality European appliances (Bosch/Miele) specified",
        "Waterproofing meets AS 3740 standards",
        "Price slightly above market average (8.5% premium for premium finishes)"
      ]),
      recommendations: JSON.stringify([
        "Request electrical compliance certificate in writing",
        "Confirm appliance delivery dates and installation timeline",
        "Verify plumbing compliance certificates will be provided",
        "Consider alternative benchtop suppliers for cost savings"
      ]),
      complianceChecks: JSON.stringify([
        { standard: "AS/NZS 3000 - Electrical Installations", status: "pass", details: "Licensed electrician specified" },
        { standard: "AS 3740 - Waterproofing", status: "pass", details: "Proper waterproofing methods included" },
        { standard: "Building Code of Australia", status: "pass", details: "All structural and safety requirements met" },
      ]),
      estimatedSavings: 280000,
    },
  },
  {
    userId: 1,
    fileName: "deck-construction-hardwood.pdf",
    fileKey: "quotes/user-1/deck-construction-003.pdf",
    fileUrl: "https://storage.example.com/quotes/deck-construction-003.pdf",
    fileType: "application/pdf",
    fileSize: 198700,
    extractedData: {
      contractor: "Brisbane Deck Builders",
      totalAmount: 1850000, // $18,500
      lineItems: [
        { description: "Spotted Gum hardwood decking boards", quantity: 1, unitPrice: 950000, total: 950000 },
        { description: "H3 treated pine frame and bearers", quantity: 1, unitPrice: 450000, total: 450000 },
        { description: "Stainless steel fixings and handrails", quantity: 1, unitPrice: 350000, total: 350000 },
        { description: "Engineered footings", quantity: 1, unitPrice: 100000, total: 100000 },
      ],
      projectAddress: "78 River Road, Brisbane QLD 4000",
      quoteDate: "2024-12-01",
      validUntil: "2025-03-01",
    },
    status: "processing" as const,
    progressPercentage: 65,
    verification: {
      overallScore: 85,
      pricingScore: 88,
      materialsScore: 90,
      complianceScore: 80,
      warrantyScore: 82,
      riskLevel: "medium" as const,
      flaggedIssues: JSON.stringify(["Engineering certificate for footings not mentioned", "Handrail height specifications unclear"]),
      potentialSavings: 150000, // $1,500
    },
    report: null,
  },
  {
    userId: 1,
    fileName: "bathroom-remodel-ensuite.pdf",
    fileKey: "quotes/user-1/bathroom-remodel-004.pdf",
    fileUrl: "https://storage.example.com/quotes/bathroom-remodel-004.pdf",
    fileType: "application/pdf",
    fileSize: 267800,
    extractedData: {
      contractor: "Perth Bathroom Renovations",
      totalAmount: 2100000, // $21,000
      lineItems: [
        { description: "Waterproofing and tiling", quantity: 1, unitPrice: 850000, total: 850000 },
        { description: "Premium fixtures (shower, vanity, toilet)", quantity: 1, unitPrice: 750000, total: 750000 },
        { description: "Plumbing and electrical", quantity: 1, unitPrice: 350000, total: 350000 },
        { description: "Ventilation system", quantity: 1, unitPrice: 150000, total: 150000 },
      ],
      projectAddress: "34 Swan Avenue, Perth WA 6000",
      quoteDate: "2024-11-25",
      validUntil: "2025-02-25",
    },
    status: "completed" as const,
    progressPercentage: 100,
    verification: {
      overallScore: 94,
      pricingScore: 92,
      materialsScore: 96,
      complianceScore: 95,
      warrantyScore: 93,
      riskLevel: "low" as const,
      flaggedIssues: JSON.stringify([]),
      potentialSavings: 420000, // $4,200
    },
    report: {
      summary: "Excellent bathroom renovation with premium fixtures and proper waterproofing. Full compliance with AS 3740 waterproofing standards and AS 1668.2 ventilation requirements.",
      keyFindings: JSON.stringify([
        "Licensed waterproofer with certificate to be provided",
        "Premium fixtures with 5-10 year warranties",
        "Proper ventilation system specified (AS 1668.2 compliant)",
        "Electrical work by licensed electrician",
        "Price excellent - 16.7% below market average"
      ]),
      recommendations: JSON.stringify([
        "Obtain waterproofing certificate before final payment",
        "Verify plumbing compliance certificate",
        "Schedule building inspector for final check",
        "Request fixture warranty documentation"
      ]),
      complianceChecks: JSON.stringify([
        { standard: "AS 3740 - Waterproofing", status: "pass", details: "Licensed waterproofer and proper methods specified" },
        { standard: "AS 1668.2 - Ventilation", status: "pass", details: "Adequate ventilation system included" },
        { standard: "AS/NZS 3000 - Electrical", status: "pass", details: "Licensed electrician for all electrical work" },
      ]),
      estimatedSavings: 420000,
    },
  },
  {
    userId: 1,
    fileName: "driveway-concrete-double.pdf",
    fileKey: "quotes/user-1/driveway-paving-005.pdf",
    fileUrl: "https://storage.example.com/quotes/driveway-paving-005.pdf",
    fileType: "application/pdf",
    fileSize: 156300,
    extractedData: {
      contractor: "Adelaide Concrete Solutions",
      totalAmount: 950000, // $9,500
      lineItems: [
        { description: "Excavation and base preparation", quantity: 1, unitPrice: 200000, total: 200000 },
        { description: "40MPa concrete with SL72 mesh", quantity: 1, unitPrice: 600000, total: 600000 },
        { description: "Finishing and sealing", quantity: 1, unitPrice: 150000, total: 150000 },
      ],
      projectAddress: "56 North Terrace, Adelaide SA 5000",
      quoteDate: "2024-12-05",
      validUntil: "2025-03-05",
    },
    status: "uploaded" as const,
    progressPercentage: 0,
    verification: null,
    report: null,
  },
  {
    userId: 1,
    fileName: "fence-colorbond-installation.pdf",
    fileKey: "quotes/user-1/fence-install-006.pdf",
    fileUrl: "https://storage.example.com/quotes/fence-install-006.pdf",
    fileType: "application/pdf",
    fileSize: 134500,
    extractedData: {
      contractor: "Sydney Fencing Contractors",
      totalAmount: 780000, // $7,800
      lineItems: [
        { description: "Colorbond steel panels - Woodland Grey", quantity: 1, unitPrice: 520000, total: 520000 },
        { description: "Steel posts 50x50mm in concrete", quantity: 1, unitPrice: 180000, total: 180000 },
        { description: "Gates and latches", quantity: 1, unitPrice: 80000, total: 80000 },
      ],
      projectAddress: "23 Park Lane, Sydney NSW 2000",
      quoteDate: "2024-11-28",
      validUntil: "2025-02-28",
    },
    status: "completed" as const,
    progressPercentage: 100,
    verification: {
      overallScore: 87,
      pricingScore: 90,
      materialsScore: 88,
      complianceScore: 85,
      warrantyScore: 84,
      riskLevel: "low" as const,
      flaggedIssues: JSON.stringify(["Boundary survey not mentioned"]),
      potentialSavings: 120000, // $1,200
    },
    report: {
      summary: "Quality Colorbond fence installation with proper post depth and concrete footings. Meets boundary fence requirements.",
      keyFindings: JSON.stringify([
        "Colorbond steel - Woodland Grey color specified",
        "Steel posts 50x50mm with 600mm depth in concrete",
        "Meets standard boundary fence height requirements (1.8m)",
        "10-year manufacturer warranty on Colorbond steel",
        "Price competitive - 13.3% below market average"
      ]),
      recommendations: JSON.stringify([
        "Confirm boundary survey before installation",
        "Verify neighbor agreement if shared fence",
        "Check council height restrictions for your area",
        "Request warranty documentation"
      ]),
      complianceChecks: JSON.stringify([
        { standard: "Fencing Act 1978", status: "pass", details: "Meets boundary fence requirements" },
        { standard: "Local Council Regulations", status: "pending", details: "Verify height restrictions with council" },
      ]),
      estimatedSavings: 120000,
    },
  },
  {
    userId: 1,
    fileName: "hvac-split-system-daikin.pdf",
    fileKey: "quotes/user-1/hvac-install-007.pdf",
    fileUrl: "https://storage.example.com/quotes/hvac-install-007.pdf",
    fileType: "application/pdf",
    fileSize: 178900,
    extractedData: {
      contractor: "Melbourne Climate Control",
      totalAmount: 620000, // $6,200
      lineItems: [
        { description: "Daikin Premium Inverter 7kW split system", quantity: 1, unitPrice: 480000, total: 480000 },
        { description: "Installation and electrical work", quantity: 1, unitPrice: 140000, total: 140000 },
      ],
      projectAddress: "89 Bourke Street, Melbourne VIC 3000",
      quoteDate: "2024-12-03",
      validUntil: "2025-03-03",
    },
    status: "processing" as const,
    progressPercentage: 45,
    verification: {
      overallScore: 91,
      pricingScore: 93,
      materialsScore: 92,
      complianceScore: 90,
      warrantyScore: 88,
      riskLevel: "low" as const,
      flaggedIssues: JSON.stringify([]),
      potentialSavings: 180000, // $1,800
    },
    report: null,
  },
  {
    userId: 1,
    fileName: "landscaping-front-yard.pdf",
    fileKey: "quotes/user-1/landscaping-008.pdf",
    fileUrl: "https://storage.example.com/quotes/landscaping-008.pdf",
    fileType: "application/pdf",
    fileSize: 289400,
    extractedData: {
      contractor: "Brisbane Landscape Designs",
      totalAmount: 1250000, // $12,500
      lineItems: [
        { description: "Sir Walter DNA Certified turf", quantity: 1, unitPrice: 350000, total: 350000 },
        { description: "Automated irrigation system", quantity: 1, unitPrice: 450000, total: 450000 },
        { description: "Native plants and garden beds", quantity: 1, unitPrice: 300000, total: 300000 },
        { description: "Mulch, edging, and finishing", quantity: 1, unitPrice: 150000, total: 150000 },
      ],
      projectAddress: "45 Garden Road, Brisbane QLD 4000",
      quoteDate: "2024-12-08",
      validUntil: "2025-03-08",
    },
    status: "uploaded" as const,
    progressPercentage: 0,
    verification: null,
    report: null,
  },
  {
    userId: 1,
    fileName: "solar-panels-6-6kw.pdf",
    fileKey: "quotes/user-1/solar-install-009.pdf",
    fileUrl: "https://storage.example.com/quotes/solar-install-009.pdf",
    fileType: "application/pdf",
    fileSize: 223100,
    extractedData: {
      contractor: "Perth Solar Solutions",
      totalAmount: 580000, // $5,800
      lineItems: [
        { description: "20x 330W Tier 1 solar panels", quantity: 1, unitPrice: 380000, total: 380000 },
        { description: "5kW CEC approved inverter", quantity: 1, unitPrice: 120000, total: 120000 },
        { description: "Installation and grid connection", quantity: 1, unitPrice: 80000, total: 80000 },
      ],
      projectAddress: "67 Solar Street, Perth WA 6000",
      quoteDate: "2024-11-30",
      validUntil: "2025-02-28",
    },
    status: "completed" as const,
    progressPercentage: 100,
    verification: {
      overallScore: 96,
      pricingScore: 98,
      materialsScore: 95,
      complianceScore: 96,
      warrantyScore: 94,
      riskLevel: "low" as const,
      flaggedIssues: JSON.stringify([]),
      potentialSavings: 520000, // $5,200
    },
    report: {
      summary: "Excellent value solar system with Tier 1 panels and CEC approved inverter. Eligible for government rebates. Outstanding price - 47.3% below market average.",
      keyFindings: JSON.stringify([
        "Tier 1 solar panels with 25-year performance warranty",
        "CEC approved 5kW inverter with 10-year warranty",
        "Licensed electrician for installation (CEC accredited)",
        "Eligible for Small-scale Technology Certificates (STCs)",
        "Exceptional price - 47.3% below market average"
      ]),
      recommendations: JSON.stringify([
        "Verify CEC accreditation of installer",
        "Confirm STC rebate eligibility and application process",
        "Request monitoring system details and app access",
        "Ensure warranty documentation for panels and inverter"
      ]),
      complianceChecks: JSON.stringify([
        { standard: "AS/NZS 5033 - Solar Installation", status: "pass", details: "CEC accredited installer specified" },
        { standard: "Clean Energy Council Standards", status: "pass", details: "All components CEC approved" },
        { standard: "Electrical Safety Standards", status: "pass", details: "Licensed electrician for all electrical work" },
      ]),
      estimatedSavings: 520000,
    },
  },
  {
    userId: 1,
    fileName: "painting-exterior-house.pdf",
    fileKey: "quotes/user-1/painting-010.pdf",
    fileUrl: "https://storage.example.com/quotes/painting-010.pdf",
    fileType: "application/pdf",
    fileSize: 187600,
    extractedData: {
      contractor: "Adelaide Painting Services",
      totalAmount: 890000, // $8,900
      lineItems: [
        { description: "Surface preparation and priming", quantity: 1, unitPrice: 250000, total: 250000 },
        { description: "Dulux Weathershield premium paint (2 coats)", quantity: 1, unitPrice: 480000, total: 480000 },
        { description: "Trim and detail work", quantity: 1, unitPrice: 160000, total: 160000 },
      ],
      projectAddress: "12 Paint Lane, Adelaide SA 5000",
      quoteDate: "2024-12-02",
      validUntil: "2025-03-02",
    },
    status: "completed" as const,
    progressPercentage: 100,
    verification: {
      overallScore: 89,
      pricingScore: 87,
      materialsScore: 93,
      complianceScore: 88,
      warrantyScore: 88,
      riskLevel: "low" as const,
      flaggedIssues: JSON.stringify([]),
      potentialSavings: 210000, // $2,100
    },
    report: {
      summary: "Quality exterior painting with premium Dulux Weathershield paint and proper surface preparation. 7-year workmanship warranty included.",
      keyFindings: JSON.stringify([
        "Dulux Weathershield premium paint specified",
        "Proper surface preparation included (wash, scrape, sand)",
        "7-year warranty on workmanship",
        "All safety equipment and scaffolding provided",
        "Price competitive - 19.1% below market average"
      ]),
      recommendations: JSON.stringify([
        "Confirm final color selection before work begins",
        "Verify warranty terms in writing",
        "Request completion timeline and weather contingency plan",
        "Ensure proper cleanup and disposal included"
      ]),
      complianceChecks: JSON.stringify([
        { standard: "WorkSafe Requirements", status: "pass", details: "Safety equipment and scaffolding included" },
        { standard: "Paint Manufacturer Specifications", status: "pass", details: "Proper application methods specified" },
      ]),
      estimatedSavings: 210000,
    },
  },
  {
    userId: 1,
    fileName: "carport-double-steel.pdf",
    fileKey: "quotes/user-1/carport-install-011.pdf",
    fileUrl: "https://storage.example.com/quotes/carport-install-011.pdf",
    fileType: "application/pdf",
    fileSize: 167200,
    extractedData: {
      contractor: "Sydney Carport Builders",
      totalAmount: 680000, // $6,800
      lineItems: [
        { description: "Steel frame and posts", quantity: 1, unitPrice: 320000, total: 320000 },
        { description: "Colorbond roof sheeting", quantity: 1, unitPrice: 280000, total: 280000 },
        { description: "Concrete footings", quantity: 1, unitPrice: 80000, total: 80000 },
      ],
      projectAddress: "34 Carport Drive, Sydney NSW 2000",
      quoteDate: "2024-12-10",
      validUntil: "2025-03-10",
    },
    status: "failed" as const,
    progressPercentage: 25,
    errorMessage: "Unable to extract complete pricing information from quote document",
    verification: null,
    report: null,
  },
  {
    userId: 1,
    fileName: "granny-flat-construction.pdf",
    fileKey: "quotes/user-1/granny-flat-012.pdf",
    fileUrl: "https://storage.example.com/quotes/granny-flat-012.pdf",
    fileType: "application/pdf",
    fileSize: 445800,
    extractedData: {
      contractor: "Melbourne Modular Homes",
      totalAmount: 12000000, // $120,000
      lineItems: [
        { description: "60sqm modular granny flat - turnkey", quantity: 1, unitPrice: 9500000, total: 9500000 },
        { description: "Site preparation and footings", quantity: 1, unitPrice: 1200000, total: 1200000 },
        { description: "Plumbing and electrical connections", quantity: 1, unitPrice: 800000, total: 800000 },
        { description: "Council approval and certifications", quantity: 1, unitPrice: 500000, total: 500000 },
      ],
      projectAddress: "78 Backyard Avenue, Melbourne VIC 3000",
      quoteDate: "2024-11-18",
      validUntil: "2025-02-18",
    },
    status: "completed" as const,
    progressPercentage: 100,
    verification: {
      overallScore: 86,
      pricingScore: 84,
      materialsScore: 89,
      complianceScore: 88,
      warrantyScore: 82,
      riskLevel: "medium" as const,
      flaggedIssues: JSON.stringify(["Council approval timeline unclear", "Structural warranty period not specified"]),
      potentialSavings: 800000, // $8,000
    },
    report: {
      summary: "Turnkey 60sqm modular granny flat with site preparation and connections. Good quality construction with some documentation gaps.",
      keyFindings: JSON.stringify([
        "60sqm modular construction - factory built for quality control",
        "Includes all plumbing and electrical connections",
        "Council approval assistance included",
        "Site preparation and engineered footings",
        "Price reasonable - 6.3% below market average for turnkey solution"
      ]),
      recommendations: JSON.stringify([
        "Clarify council approval timeline and responsibilities",
        "Request detailed structural warranty documentation",
        "Verify building insurance coverage during construction",
        "Confirm final inspection and certification process"
      ]),
      complianceChecks: JSON.stringify([
        { standard: "Building Code of Australia", status: "pass", details: "Modular construction meets BCA requirements" },
        { standard: "Local Council Regulations", status: "pending", details: "Council approval to be obtained" },
        { standard: "AS 3600 - Concrete Structures", status: "pass", details: "Engineered footings specified" },
      ]),
      estimatedSavings: 800000,
    },
  },
  {
    userId: 1,
    fileName: "window-replacement-double-glazed.pdf",
    fileKey: "quotes/user-1/window-replacement-013.pdf",
    fileUrl: "https://storage.example.com/quotes/window-replacement-013.pdf",
    fileType: "application/pdf",
    fileSize: 201500,
    extractedData: {
      contractor: "Brisbane Window Solutions",
      totalAmount: 1450000, // $14,500
      lineItems: [
        { description: "Double-glazed aluminum windows (8 units)", quantity: 8, unitPrice: 150000, total: 1200000 },
        { description: "Removal of old windows", quantity: 1, unitPrice: 120000, total: 120000 },
        { description: "Installation and sealing", quantity: 1, unitPrice: 130000, total: 130000 },
      ],
      projectAddress: "56 Window Street, Brisbane QLD 4000",
      quoteDate: "2024-12-04",
      validUntil: "2025-03-04",
    },
    status: "processing" as const,
    progressPercentage: 80,
    verification: {
      overallScore: 90,
      pricingScore: 91,
      materialsScore: 92,
      complianceScore: 89,
      warrantyScore: 87,
      riskLevel: "low" as const,
      flaggedIssues: JSON.stringify([]),
      potentialSavings: 320000, // $3,200
    },
    report: null,
  },
  {
    userId: 1,
    fileName: "insulation-ceiling-upgrade.pdf",
    fileKey: "quotes/user-1/insulation-014.pdf",
    fileUrl: "https://storage.example.com/quotes/insulation-014.pdf",
    fileType: "application/pdf",
    fileSize: 145300,
    extractedData: {
      contractor: "Perth Insulation Experts",
      totalAmount: 380000, // $3,800
      lineItems: [
        { description: "R6.0 ceiling insulation batts", quantity: 1, unitPrice: 280000, total: 280000 },
        { description: "Installation labor", quantity: 1, unitPrice: 100000, total: 100000 },
      ],
      projectAddress: "23 Insulate Road, Perth WA 6000",
      quoteDate: "2024-12-06",
      validUntil: "2025-03-06",
    },
    status: "completed" as const,
    progressPercentage: 100,
    verification: {
      overallScore: 93,
      pricingScore: 95,
      materialsScore: 94,
      complianceScore: 92,
      warrantyScore: 89,
      riskLevel: "low" as const,
      flaggedIssues: JSON.stringify([]),
      potentialSavings: 95000, // $950
    },
    report: {
      summary: "Excellent value ceiling insulation upgrade with R6.0 batts. Meets energy efficiency standards and eligible for government rebates.",
      keyFindings: JSON.stringify([
        "R6.0 insulation batts - excellent thermal performance",
        "Meets Australian energy efficiency standards",
        "Eligible for government energy efficiency rebates",
        "Professional installation with safety compliance",
        "Exceptional price - 20% below market average"
      ]),
      recommendations: JSON.stringify([
        "Verify eligibility for energy efficiency rebates",
        "Ensure proper ventilation maintained after installation",
        "Request certificate of compliance",
        "Confirm warranty coverage for materials and installation"
      ]),
      complianceChecks: JSON.stringify([
        { standard: "AS/NZS 4859.1 - Insulation Materials", status: "pass", details: "R6.0 batts meet thermal performance standards" },
        { standard: "Building Code of Australia", status: "pass", details: "Meets energy efficiency requirements" },
        { standard: "WorkSafe Requirements", status: "pass", details: "Professional installation with safety compliance" },
      ]),
      estimatedSavings: 95000,
    },
  },
  {
    userId: 1,
    fileName: "retaining-wall-timber.pdf",
    fileKey: "quotes/user-1/retaining-wall-015.pdf",
    fileUrl: "https://storage.example.com/quotes/retaining-wall-015.pdf",
    fileType: "application/pdf",
    fileSize: 234700,
    extractedData: {
      contractor: "Adelaide Retaining Walls",
      totalAmount: 950000, // $9,500
      lineItems: [
        { description: "H4 treated pine sleepers", quantity: 1, unitPrice: 450000, total: 450000 },
        { description: "Excavation and drainage", quantity: 1, unitPrice: 280000, total: 280000 },
        { description: "Installation and backfill", quantity: 1, unitPrice: 220000, total: 220000 },
      ],
      projectAddress: "89 Slope Street, Adelaide SA 5000",
      quoteDate: "2024-12-07",
      validUntil: "2025-03-07",
    },
    status: "uploaded" as const,
    progressPercentage: 0,
    verification: null,
    report: null,
  },
];

async function seedQuotes() {
  console.log("Starting quote seeding...");
  
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  try {
    let completedCount = 0;
    let processingCount = 0;
    let uploadedCount = 0;
    let failedCount = 0;

    for (const quote of sampleQuotes) {
      // Random date within last 90 days
      const createdAt = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      
      await db.insert(quotes).values({
        userId: quote.userId,
        fileName: quote.fileName,
        fileKey: quote.fileKey,
        fileUrl: quote.fileUrl,
        fileType: quote.fileType,
        fileSize: quote.fileSize,
        extractedData: quote.extractedData,
        status: quote.status,
        progressPercentage: quote.progressPercentage,
        errorMessage: quote.errorMessage,
        createdAt,
        updatedAt: new Date(),
        processedAt: quote.status === "completed" ? new Date() : null,
      });

      // Query back the inserted quote by unique fileName
      const [insertedQuote] = await db.select().from(quotes).where(sql`${quotes.fileName} = ${quote.fileName} AND ${quotes.userId} = ${quote.userId}`).limit(1);
      const quoteId = insertedQuote?.id;
      console.log(`✓ Created quote: ${quote.fileName} (ID: ${quoteId}, Status: ${quote.status})`);

      // Track status counts
      if (quote.status === "completed") completedCount++;
      else if (quote.status === "processing") processingCount++;
      else if (quote.status === "uploaded") uploadedCount++;
      else if (quote.status === "failed") failedCount++;

      // Create verification for quotes that have it
      if (quote.verification) {
        await db.insert(verifications).values({
          quoteId,
          overallScore: quote.verification.overallScore,
          pricingScore: quote.verification.pricingScore,
          materialsScore: quote.verification.materialsScore,
          complianceScore: quote.verification.complianceScore,
          warrantyScore: quote.verification.warrantyScore,
          riskLevel: quote.verification.riskLevel,
          flaggedIssues: quote.verification.flaggedIssues,
          potentialSavings: quote.verification.potentialSavings,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Query back the inserted verification
        const [insertedVerification] = await db.select().from(verifications).where(sql`${verifications.quoteId} = ${quoteId}`).limit(1);
        const verificationId = insertedVerification?.id;

        console.log(`  ✓ Created verification (Overall Score: ${quote.verification.overallScore})`);

        // Create report for completed quotes
        if (quote.report && quote.status === "completed") {
          const reportPdfKey = `reports/${quote.userId}/${quote.fileName.replace('.pdf', '')}-report.pdf`;
          const reportPdfUrl = `https://storage.example.com/${reportPdfKey}`;
          
          await db.insert(reports).values({
            verificationId,
            pdfKey: reportPdfKey,
            pdfUrl: reportPdfUrl,
            pdfSize: Math.floor(Math.random() * 500000) + 100000, // Random size between 100KB-600KB
            downloadCount: Math.floor(Math.random() * 3),
            createdAt: new Date(),
          });

          console.log(`  ✓ Created report (Savings: $${(quote.report.estimatedSavings / 100).toFixed(2)})`);
        }
      }
    }

    console.log(`\n✅ Successfully seeded ${sampleQuotes.length} quotes!`);
    console.log(`   📊 Status breakdown:`);
    console.log(`      • Completed: ${completedCount}`);
    console.log(`      • Processing: ${processingCount}`);
    console.log(`      • Uploaded: ${uploadedCount}`);
    console.log(`      • Failed: ${failedCount}`);
    
    // Calculate total savings
    const totalSavings = sampleQuotes
      .filter(q => q.report?.estimatedSavings)
      .reduce((sum, q) => sum + (q.report?.estimatedSavings || 0), 0);
    console.log(`   💰 Total potential savings: $${(totalSavings / 100).toLocaleString()}`);
  } catch (error) {
    console.error("Error seeding quotes:", error);
  }
}

seedQuotes();
