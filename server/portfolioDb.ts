import { eq, desc, and } from "drizzle-orm";
import { getDb } from "./db";
import { 
  portfolioProjects, 
  PortfolioProject, 
  InsertPortfolioProject,
  contractorCertifications,
  ContractorCertification,
  InsertContractorCertification
} from "../drizzle/schema";

/**
 * Portfolio Projects Database Operations
 */

export async function getContractorProjects(contractorId: number): Promise<PortfolioProject[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(portfolioProjects)
    .where(
      and(
        eq(portfolioProjects.contractorId, contractorId),
        eq(portfolioProjects.isPublic, true)
      )
    )
    .orderBy(desc(portfolioProjects.displayOrder), desc(portfolioProjects.completionDate));
}

export async function getProjectById(projectId: number): Promise<PortfolioProject | null> {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(portfolioProjects)
    .where(eq(portfolioProjects.id, projectId))
    .limit(1);

  return results[0] || null;
}

export async function createPortfolioProject(project: InsertPortfolioProject): Promise<PortfolioProject> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(portfolioProjects).values(project);

  // Query back to get the inserted project
  const results = await db
    .select()
    .from(portfolioProjects)
    .where(
      and(
        eq(portfolioProjects.contractorId, project.contractorId),
        eq(portfolioProjects.title, project.title)
      )
    )
    .orderBy(desc(portfolioProjects.createdAt))
    .limit(1);

  if (!results[0]) {
    throw new Error("Failed to create portfolio project");
  }

  return results[0];
}

export async function updatePortfolioProject(
  projectId: number,
  updates: Partial<InsertPortfolioProject>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(portfolioProjects)
    .set(updates)
    .where(eq(portfolioProjects.id, projectId));
}

export async function deletePortfolioProject(projectId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(portfolioProjects)
    .where(eq(portfolioProjects.id, projectId));
}

/**
 * Contractor Certifications Database Operations
 */

export async function getContractorCertifications(contractorId: number): Promise<ContractorCertification[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(contractorCertifications)
    .where(eq(contractorCertifications.contractorId, contractorId))
    .orderBy(desc(contractorCertifications.displayOrder), desc(contractorCertifications.issueDate));
}

export async function getCertificationById(certificationId: number): Promise<ContractorCertification | null> {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(contractorCertifications)
    .where(eq(contractorCertifications.id, certificationId))
    .limit(1);

  return results[0] || null;
}

export async function createCertification(cert: InsertContractorCertification): Promise<ContractorCertification> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(contractorCertifications).values(cert);

  // Query back to get the inserted certification
  const results = await db
    .select()
    .from(contractorCertifications)
    .where(
      and(
        eq(contractorCertifications.contractorId, cert.contractorId),
        eq(contractorCertifications.name, cert.name)
      )
    )
    .orderBy(desc(contractorCertifications.createdAt))
    .limit(1);

  if (!results[0]) {
    throw new Error("Failed to create certification");
  }

  return results[0];
}

export async function updateCertification(
  certificationId: number,
  updates: Partial<InsertContractorCertification>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(contractorCertifications)
    .set(updates)
    .where(eq(contractorCertifications.id, certificationId));
}

export async function deleteCertification(certificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(contractorCertifications)
    .where(eq(contractorCertifications.id, certificationId));
}

/**
 * Get active (non-expired) certifications for a contractor
 */
export async function getActiveCertifications(contractorId: number): Promise<ContractorCertification[]> {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const allCerts = await getContractorCertifications(contractorId);

  // Filter for active certifications (no expiry or expiry in future)
  return allCerts.filter(cert => 
    !cert.expiryDate || new Date(cert.expiryDate) > now
  );
}
