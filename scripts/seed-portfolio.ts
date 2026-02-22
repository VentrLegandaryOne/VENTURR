import { drizzle } from "drizzle-orm/mysql2";
import { portfolioProjects, contractorCertifications, contractors } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function seedPortfolio() {
  console.log("🌱 Seeding portfolio data...");

  // Get existing contractors
  const existingContractors = await db.select().from(contractors).limit(5);
  
  if (existingContractors.length === 0) {
    console.log("❌ No contractors found. Please seed contractors first.");
    return;
  }

  console.log(`Found ${existingContractors.length} contractors`);

  // Sample portfolio projects
  const portfolioData = [
    {
      contractorId: existingContractors[0].id,
      title: "Modern Kitchen Renovation",
      description: "Complete kitchen transformation with custom cabinetry, stone benchtops, and premium appliances. Includes plumbing, electrical, and tiling work.",
      projectType: "Kitchen Renovation",
      location: "Bondi, NSW",
      beforePhotoUrl: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800",
      afterPhotoUrl: "https://images.unsplash.com/photo-1556912167-f556f1f39faa?w=800",
      completionDate: new Date("2024-11-15"),
      projectCost: 4500000, // $45,000
      duration: 21,
      clientTestimonial: "Absolutely thrilled with the result! The team was professional, on time, and the quality exceeded our expectations.",
      displayOrder: 1,
      isPublic: true,
    },
    {
      contractorId: existingContractors[0].id,
      title: "Colorbond Roof Replacement",
      description: "Full roof replacement with Colorbond steel roofing. Includes removal of old tiles, sarking installation, and new guttering system.",
      projectType: "Roof Replacement",
      location: "Manly, NSW",
      beforePhotoUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
      afterPhotoUrl: "https://images.unsplash.com/photo-1585128903994-1a7e8c4b3f6e?w=800",
      completionDate: new Date("2024-10-22"),
      projectCost: 2800000, // $28,000
      duration: 7,
      clientTestimonial: "Great work! The new roof looks fantastic and was completed ahead of schedule.",
      displayOrder: 2,
      isPublic: true,
    },
    {
      contractorId: existingContractors[1]?.id || existingContractors[0].id,
      title: "Bathroom Ensuite Remodel",
      description: "Luxury ensuite bathroom with frameless shower, freestanding bath, heated floors, and custom vanity.",
      projectType: "Bathroom Renovation",
      location: "Mosman, NSW",
      beforePhotoUrl: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800",
      afterPhotoUrl: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800",
      completionDate: new Date("2024-09-30"),
      projectCost: 3200000, // $32,000
      duration: 14,
      displayOrder: 1,
      isPublic: true,
    },
    {
      contractorId: existingContractors[1]?.id || existingContractors[0].id,
      title: "Hardwood Deck Construction",
      description: "Custom hardwood deck with built-in seating, pergola, and LED lighting. Merbau timber with stainless steel fittings.",
      projectType: "Deck Construction",
      location: "Balmoral, NSW",
      beforePhotoUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      afterPhotoUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      completionDate: new Date("2024-08-18"),
      projectCost: 1850000, // $18,500
      duration: 10,
      displayOrder: 2,
      isPublic: true,
    },
  ];

  console.log(`Inserting ${portfolioData.length} portfolio projects...`);
  
  for (const project of portfolioData) {
    await db.insert(portfolioProjects).values(project);
  }

  console.log("✅ Portfolio projects seeded");

  // Sample certifications
  const certificationsData = [
    {
      contractorId: existingContractors[0].id,
      name: "Licensed Builder",
      issuingBody: "NSW Fair Trading",
      certificateNumber: "LIC-123456",
      issueDate: new Date("2018-03-15"),
      expiryDate: new Date("2026-03-15"),
      isVerified: true,
      category: "license" as const,
      displayOrder: 1,
    },
    {
      contractorId: existingContractors[0].id,
      name: "Public Liability Insurance",
      issuingBody: "CGU Insurance",
      certificateNumber: "POL-789012",
      issueDate: new Date("2024-01-01"),
      expiryDate: new Date("2025-01-01"),
      isVerified: true,
      category: "insurance" as const,
      displayOrder: 2,
    },
    {
      contractorId: existingContractors[0].id,
      name: "Master Builders Association Member",
      issuingBody: "Master Builders Association",
      certificateNumber: "MBA-345678",
      issueDate: new Date("2019-06-01"),
      isVerified: true,
      category: "membership" as const,
      displayOrder: 3,
    },
    {
      contractorId: existingContractors[0].id,
      name: "White Card (Construction Induction)",
      issuingBody: "SafeWork NSW",
      certificateNumber: "WC-901234",
      issueDate: new Date("2017-11-20"),
      isVerified: true,
      category: "qualification" as const,
      displayOrder: 4,
    },
    {
      contractorId: existingContractors[1]?.id || existingContractors[0].id,
      name: "Licensed Plumber",
      issuingBody: "NSW Fair Trading",
      certificateNumber: "PL-567890",
      issueDate: new Date("2016-08-10"),
      expiryDate: new Date("2026-08-10"),
      isVerified: true,
      category: "license" as const,
      displayOrder: 1,
    },
    {
      contractorId: existingContractors[1]?.id || existingContractors[0].id,
      name: "Professional Indemnity Insurance",
      issuingBody: "QBE Insurance",
      certificateNumber: "PI-234567",
      issueDate: new Date("2024-02-01"),
      expiryDate: new Date("2025-02-01"),
      isVerified: true,
      category: "insurance" as const,
      displayOrder: 2,
    },
    {
      contractorId: existingContractors[1]?.id || existingContractors[0].id,
      name: "HIA Excellence Award 2023",
      issuingBody: "Housing Industry Association",
      issueDate: new Date("2023-10-15"),
      isVerified: true,
      category: "award" as const,
      displayOrder: 3,
    },
  ];

  console.log(`Inserting ${certificationsData.length} certifications...`);
  
  for (const cert of certificationsData) {
    await db.insert(contractorCertifications).values(cert);
  }

  console.log("✅ Certifications seeded");
  console.log("🎉 Portfolio seeding complete!");
}

seedPortfolio()
  .then(() => {
    console.log("✅ Seeding successful");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
