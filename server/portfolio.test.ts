import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { contractors, portfolioProjects, contractorCertifications } from "../drizzle/schema";

describe("Portfolio Procedures", () => {
  let testContractorId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not initialized");

    // Get or create a test contractor
    const existingContractors = await db.select().from(contractors).limit(1);
    if (existingContractors.length > 0) {
      testContractorId = existingContractors[0].id;
    } else {
      const result = await db.insert(contractors).values({
        name: "Test Contractor",
        email: "test@example.com",
        phone: "+61 2 1234 5678",
        isVerified: true,
        avgScore: 85,
        totalReviews: 0,
        totalProjects: 0,
        totalValue: 0,
      });
      testContractorId = 1; // Assume first contractor
    }
  });

  it("should retrieve portfolio projects for a contractor", async () => {
    const caller = appRouter.createCaller({
      user: null as any,
      req: {} as any,
      res: {} as any,
    });

    const projects = await caller.contractors.getPortfolioProjects({
      contractorId: testContractorId,
    });

    expect(projects).toBeDefined();
    expect(Array.isArray(projects)).toBe(true);
    
    // If projects exist, verify structure
    if (projects.length > 0) {
      const project = projects[0];
      expect(project).toHaveProperty("id");
      expect(project).toHaveProperty("title");
      expect(project).toHaveProperty("projectType");
      expect(project).toHaveProperty("afterPhotoUrl");
      expect(project.contractorId).toBe(testContractorId);
    }
  });

  it("should retrieve certifications for a contractor", async () => {
    const caller = appRouter.createCaller({
      user: null as any,
      req: {} as any,
      res: {} as any,
    });

    const certifications = await caller.contractors.getCertifications({
      contractorId: testContractorId,
    });

    expect(certifications).toBeDefined();
    expect(Array.isArray(certifications)).toBe(true);
    
    // If certifications exist, verify structure
    if (certifications.length > 0) {
      const cert = certifications[0];
      expect(cert).toHaveProperty("id");
      expect(cert).toHaveProperty("name");
      expect(cert).toHaveProperty("issuingBody");
      expect(cert).toHaveProperty("category");
      expect(cert).toHaveProperty("isVerified");
      expect(cert.contractorId).toBe(testContractorId);
      
      // Verify category is valid enum value
      expect(["license", "insurance", "qualification", "membership", "award"]).toContain(cert.category);
    }
  });

  it("should only return active (non-expired) certifications", async () => {
    const caller = appRouter.createCaller({
      user: null as any,
      req: {} as any,
      res: {} as any,
    });

    const certifications = await caller.contractors.getCertifications({
      contractorId: testContractorId,
    });

    // All returned certifications should be either without expiry or not expired
    const now = new Date();
    certifications.forEach(cert => {
      if (cert.expiryDate) {
        expect(new Date(cert.expiryDate).getTime()).toBeGreaterThan(now.getTime());
      }
    });
  });

  it("should return empty array for contractor with no portfolio", async () => {
    const caller = appRouter.createCaller({
      user: null as any,
      req: {} as any,
      res: {} as any,
    });

    // Use a non-existent contractor ID
    const projects = await caller.contractors.getPortfolioProjects({
      contractorId: 99999,
    });

    expect(projects).toBeDefined();
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBe(0);
  });
});
