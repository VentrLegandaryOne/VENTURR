import { getDb } from "./db";
import { materials, type InsertMaterial, type Material } from "../drizzle/schema";
import { eq, and, like, or } from "drizzle-orm";

export async function createMaterial(data: InsertMaterial): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(materials).values(data);
}

export async function getMaterial(id: string): Promise<Material | undefined> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.select().from(materials).where(eq(materials.id, id));
  return result[0];
}

export async function getOrganizationMaterials(organizationId: string): Promise<Material[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return await db.select().from(materials).where(eq(materials.organizationId, organizationId));
}

export async function updateMaterial(id: string, updates: Partial<Material>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(materials).set(updates).where(eq(materials.id, id));
}

export async function deleteMaterial(id: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(materials).where(eq(materials.id, id));
}

export async function deleteOrganizationMaterials(organizationId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(materials).where(eq(materials.organizationId, organizationId));
}

export async function searchMaterials(
  organizationId: string,
  filters: {
    category?: string;
    manufacturer?: string;
    searchTerm?: string;
  }
): Promise<Material[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const conditions = [eq(materials.organizationId, organizationId)];
  
  if (filters.category) {
    conditions.push(eq(materials.category, filters.category));
  }
  
  if (filters.manufacturer) {
    conditions.push(eq(materials.manufacturer, filters.manufacturer));
  }
  
  if (filters.searchTerm) {
    conditions.push(
      or(
        like(materials.name, `%${filters.searchTerm}%`),
        like(materials.profile, `%${filters.searchTerm}%`)
      )!
    );
  }
  
  return await db.select().from(materials).where(and(...conditions));
}

export async function batchCreateMaterials(data: InsertMaterial[]): Promise<void> {
  if (data.length === 0) return;
  
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Insert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await db.insert(materials).values(batch);
  }
}

