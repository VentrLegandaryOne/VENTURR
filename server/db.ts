import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  organizations, 
  InsertOrganization,
  memberships,
  projects,
  InsertProject,
  takeoffs,
  InsertTakeoff,
  quotes,
  InsertQuote,
  measurements,
  InsertMeasurement,
  projectTasks,
  InsertProjectTask,
  projectTeamMembers,
  InsertProjectTeamMember,
  projectMilestones,
  InsertProjectMilestone,
  projectBudgets,
  InsertProjectBudget,
  projectDocuments,
  InsertProjectDocument,
  materialAllocations,
  InsertMaterialAllocation,
  inventoryItems
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Organization queries
export async function createOrganization(org: InsertOrganization) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(organizations).values(org);
  return org;
}

export async function getOrganization(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserOrganizations(userId: string) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({ org: organizations })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.organizationId, organizations.id))
    .where(eq(memberships.userId, userId));
  
  return result.map(r => r.org);
}

// Project queries
export async function createProject(project: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(projects).values(project);
  return project;
}

export async function getProject(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrganizationProjects(organizationId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(projects).where(eq(projects.organizationId, organizationId));
}

export async function updateProject(id: string, updates: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(projects).set(updates).where(eq(projects.id, id));
}

// Takeoff queries
export async function createTakeoff(takeoff: InsertTakeoff) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(takeoffs).values(takeoff);
  return takeoff;
}

export async function getProjectTakeoffs(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(takeoffs).where(eq(takeoffs.projectId, projectId));
}

// Quote queries
export async function createQuote(quote: InsertQuote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(quotes).values(quote);
  return quote;
}

export async function getQuote(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProjectQuotes(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(quotes).where(eq(quotes.projectId, projectId));
}

export async function updateQuote(id: string, updates: Partial<InsertQuote>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(quotes).set(updates).where(eq(quotes.id, id));
}

// Measurement queries
export async function createMeasurement(measurement: InsertMeasurement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(measurements).values(measurement);
  return measurement;
}

export async function getProjectMeasurements(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(measurements).where(eq(measurements.projectId, projectId));
}

// PROJECT TASK QUERIES
export async function getProjectTasks(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(projectTasks).where(eq(projectTasks.projectId, projectId));
}

export async function createProjectTask(task: InsertProjectTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(projectTasks).values(task);
  return task;
}

export async function updateProjectTask(taskId: string, updates: Partial<InsertProjectTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(projectTasks).set(updates).where(eq(projectTasks.id, taskId));
}

export async function getProjectTask(taskId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(projectTasks).where(eq(projectTasks.id, taskId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// PROJECT TEAM MEMBER QUERIES
export async function getProjectTeamMembers(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(projectTeamMembers).where(eq(projectTeamMembers.projectId, projectId));
}

export async function addProjectTeamMember(member: InsertProjectTeamMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(projectTeamMembers).values(member);
  return member;
}

export async function removeProjectTeamMember(memberId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(projectTeamMembers).where(eq(projectTeamMembers.id, memberId));
}

// PROJECT MILESTONE QUERIES
export async function getProjectMilestones(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(projectMilestones).where(eq(projectMilestones.projectId, projectId));
}

export async function createProjectMilestone(milestone: InsertProjectMilestone) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(projectMilestones).values(milestone);
  return milestone;
}

export async function updateProjectMilestone(milestoneId: string, updates: Partial<InsertProjectMilestone>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(projectMilestones).set(updates).where(eq(projectMilestones.id, milestoneId));
}

// PROJECT BUDGET QUERIES
export async function getProjectBudget(projectId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(projectBudgets).where(eq(projectBudgets.projectId, projectId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProjectBudget(budget: InsertProjectBudget) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(projectBudgets).values(budget);
  return budget;
}

export async function updateProjectBudget(budgetId: string, updates: Partial<InsertProjectBudget>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(projectBudgets).set(updates).where(eq(projectBudgets.id, budgetId));
}

// PROJECT DOCUMENT QUERIES
export async function getProjectDocuments(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(projectDocuments).where(eq(projectDocuments.projectId, projectId));
}

export async function addProjectDocument(doc: InsertProjectDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(projectDocuments).values(doc);
  return doc;
}

export async function deleteProjectDocument(docId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(projectDocuments).where(eq(projectDocuments.id, docId));
}


// INVENTORY MANAGEMENT QUERIES

export async function createInventoryItem(item: InsertInventoryItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(inventoryItems).values(item);
  return item;
}

export async function getInventoryItem(itemId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(inventoryItems).where(eq(inventoryItems.id, itemId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrganizationInventory(organizationId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(inventoryItems).where(eq(inventoryItems.organizationId, organizationId));
}

export async function updateInventoryItem(itemId: string, updates: Partial<InsertInventoryItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(inventoryItems).set(updates).where(eq(inventoryItems.id, itemId));
}

export async function recordStockMovement(movement: InsertStockMovement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(stockMovements).values(movement);
  return movement;
}

export async function getItemStockMovements(itemId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(stockMovements).where(eq(stockMovements.inventoryItemId, itemId));
}

export async function createStockAlert(alert: InsertStockAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(stockAlerts).values(alert);
  return alert;
}

export async function getActiveAlerts(organizationId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(stockAlerts)
    .innerJoin(inventoryItems, eq(stockAlerts.inventoryItemId, inventoryItems.id))
    .where(eq(inventoryItems.organizationId, organizationId));
}

export async function resolveStockAlert(alertId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(stockAlerts).set({ isResolved: "true", resolvedAt: new Date() }).where(eq(stockAlerts.id, alertId));
}

export async function createReorderOrder(order: InsertReorderOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(reorderOrders).values(order);
  return order;
}

export async function getOrganizationReorderOrders(organizationId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(reorderOrders).where(eq(reorderOrders.organizationId, organizationId));
}

export async function getPendingReorderOrders(organizationId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(reorderOrders)
    .where(eq(reorderOrders.organizationId, organizationId));
}

export async function updateReorderOrder(orderId: string, updates: Partial<InsertReorderOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(reorderOrders).set(updates).where(eq(reorderOrders.id, orderId));
}



// CRM QUERIES

export async function createCrmClient(client: InsertCrmClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(crmClients).values(client);
  return client;
}

export async function getCrmClient(clientId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(crmClients).where(eq(crmClients.id, clientId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrganizationClients(organizationId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(crmClients).where(eq(crmClients.organizationId, organizationId));
}

export async function updateCrmClient(clientId: string, updates: Partial<InsertCrmClient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(crmClients).set(updates).where(eq(crmClients.id, clientId));
}

export async function recordClientCommunication(communication: InsertClientCommunication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(clientCommunications).values(communication);
  return communication;
}

export async function getClientCommunications(clientId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(clientCommunications).where(eq(clientCommunications.clientId, clientId));
}

// FINANCIAL QUERIES

export async function createInvoice(invoice: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(invoices).values(invoice);
  return invoice;
}

export async function getInvoice(invoiceId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrganizationInvoices(organizationId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(invoices).where(eq(invoices.organizationId, organizationId));
}

export async function updateInvoice(invoiceId: string, updates: Partial<InsertInvoice>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(invoices).set(updates).where(eq(invoices.id, invoiceId));
}

export async function createExpense(expense: InsertExpense) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(expenses).values(expense);
  return expense;
}

export async function getOrganizationExpenses(organizationId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(expenses).where(eq(expenses.organizationId, organizationId));
}

export async function createFinancialReport(report: InsertFinancialReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(financialReports).values(report);
  return report;
}

export async function getFinancialReports(organizationId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(financialReports).where(eq(financialReports.organizationId, organizationId));
}

// INTELLIGENT INSIGHTS

export async function createIntelligentInsight(insight: InsertIntelligentInsight) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(intelligentInsights).values(insight);
  return insight;
}

export async function getActiveInsights(organizationId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(intelligentInsights).where(eq(intelligentInsights.organizationId, organizationId)).where(eq(intelligentInsights.isResolved, "false"));
}

export async function resolveInsight(insightId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(intelligentInsights).set({ isResolved: "true", resolvedAt: new Date() }).where(eq(intelligentInsights.id, insightId));
}




// ===== MATERIAL ALLOCATION FUNCTIONS =====

/**
 * Allocate materials to a project with conflict detection
 * Checks available inventory and prevents over-allocation
 */
export async function allocateMaterialToProject(
  projectId: string,
  inventoryItemId: string,
  quantity: number,
  createdBy: string
): Promise<{ success: boolean; message: string; allocation?: any }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Get current inventory item
    const item = await db.select().from(inventoryItems).where(eq(inventoryItems.id, inventoryItemId)).limit(1);
    if (item.length === 0) {
      return { success: false, message: "Inventory item not found" };
    }

    const currentStock = parseInt(item[0].currentStock || "0");
    
    // Get total allocated quantity for this item across all projects
    const allocations = await db.select().from(materialAllocations)
      .where(eq(materialAllocations.inventoryItemId, inventoryItemId))
      .where((col) => col.status !== "completed" && col.status !== "returned");
    
    const totalAllocated = allocations.reduce((sum, a) => sum + parseInt(a.allocatedQuantity || "0"), 0);
    const availableForAllocation = currentStock - totalAllocated;

    if (quantity > availableForAllocation) {
      return {
        success: false,
        message: `Insufficient inventory. Requested: ${quantity}, Available: ${availableForAllocation}, Current Stock: ${currentStock}, Already Allocated: ${totalAllocated}`
      };
    }

    // Create allocation record
    const allocationId = `alloc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(materialAllocations).values({
      id: allocationId,
      projectId,
      inventoryItemId,
      allocatedQuantity: quantity.toString(),
      usedQuantity: "0",
      status: "reserved",
      createdBy,
    });

    return {
      success: true,
      message: `Successfully allocated ${quantity} units to project`,
      allocation: { id: allocationId, quantity, itemName: item[0].name }
    };
  } catch (error) {
    console.error("[Database] Failed to allocate material:", error);
    return { success: false, message: "Failed to allocate material" };
  }
}

/**
 * Get all allocations for a project
 */
export async function getProjectAllocations(projectId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(materialAllocations)
    .where(eq(materialAllocations.projectId, projectId));
}

/**
 * Update material usage during project execution
 */
export async function updateMaterialUsage(
  allocationId: string,
  usedQuantity: number
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const allocation = await db.select().from(materialAllocations)
      .where(eq(materialAllocations.id, allocationId)).limit(1);
    
    if (allocation.length === 0) {
      return { success: false, message: "Allocation not found" };
    }

    const allocated = parseInt(allocation[0].allocatedQuantity || "0");
    if (usedQuantity > allocated) {
      return { success: false, message: `Cannot use more than allocated (${allocated} units)` };
    }

    await db.update(materialAllocations)
      .set({ usedQuantity: usedQuantity.toString(), status: usedQuantity > 0 ? "in_use" : "reserved" })
      .where(eq(materialAllocations.id, allocationId));

    return { success: true, message: `Updated usage to ${usedQuantity} units` };
  } catch (error) {
    console.error("[Database] Failed to update material usage:", error);
    return { success: false, message: "Failed to update material usage" };
  }
}

/**
 * Complete allocation and return unused materials
 */
export async function completeAllocation(
  allocationId: string,
  finalUsedQuantity: number
): Promise<{ success: boolean; message: string; returnedQuantity?: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const allocation = await db.select().from(materialAllocations)
      .where(eq(materialAllocations.id, allocationId)).limit(1);
    
    if (allocation.length === 0) {
      return { success: false, message: "Allocation not found" };
    }

    const allocated = parseInt(allocation[0].allocatedQuantity || "0");
    const returnedQuantity = allocated - finalUsedQuantity;

    await db.update(materialAllocations)
      .set({ 
        usedQuantity: finalUsedQuantity.toString(), 
        status: "completed",
        completionDate: new Date()
      })
      .where(eq(materialAllocations.id, allocationId));

    return { 
      success: true, 
      message: `Allocation completed. Used: ${finalUsedQuantity}, Returned: ${returnedQuantity}`,
      returnedQuantity
    };
  } catch (error) {
    console.error("[Database] Failed to complete allocation:", error);
    return { success: false, message: "Failed to complete allocation" };
  }
}

/**
 * Get available inventory for allocation (not yet reserved)
 */
export async function getAvailableInventory(inventoryItemId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const item = await db.select().from(inventoryItems)
    .where(eq(inventoryItems.id, inventoryItemId)).limit(1);
  
  if (item.length === 0) return null;

  const allocations = await db.select().from(materialAllocations)
    .where(eq(materialAllocations.inventoryItemId, inventoryItemId))
    .where((col) => col.status !== "completed" && col.status !== "returned");
  
  const totalAllocated = allocations.reduce((sum, a) => sum + parseInt(a.allocatedQuantity || "0"), 0);
  const currentStock = parseInt(item[0].currentStock || "0");
  const available = currentStock - totalAllocated;

  return {
    itemId: inventoryItemId,
    itemName: item[0].name,
    currentStock,
    totalAllocated,
    available,
    allocations: allocations.length
  };
}

/**
 * Check for allocation conflicts across projects
 */
export async function checkAllocationConflicts(organizationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const items = await db.select().from(inventoryItems)
    .where(eq(inventoryItems.organizationId, organizationId));

  const conflicts = [];

  for (const item of items) {
    const available = await getAvailableInventory(item.id);
    if (available && available.available < 0) {
      conflicts.push({
        itemId: item.id,
        itemName: item.name,
        shortage: Math.abs(available.available),
        currentStock: available.currentStock,
        totalAllocated: available.totalAllocated
      });
    }
  }

  return conflicts;
}

