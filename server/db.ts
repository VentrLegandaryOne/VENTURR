import { eq, sum, and, or, lt, desc, gt, gte, lte, ne } from "drizzle-orm";
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
  inventoryItems,
  fieldActivityLogs,
  InsertFieldActivityLog,
  offlineDataQueue,
  InsertOfflineDataQueue,
  projectCosts,
  InsertProjectCost,
  projectBudgetTracking,
  InsertProjectBudgetTracking,
  projectProfitability,
  InsertProjectProfitability,
  suppliers,
  InsertSupplier,
  supplierPricing,
  InsertSupplierPricing,
  purchaseOrders,
  InsertPurchaseOrder,
  purchaseOrderItems,
  InsertPurchaseOrderItem,
  laborTimesheets,
  InsertLaborTimesheet,
  laborCostsSummary,
  InsertLaborCostsSummary,
  customerPortalAccess,
  InsertCustomerPortalAccess,
  customerInvoices,
  InsertCustomerInvoice,
  customerDocuments,
  InsertCustomerDocument,
  analyticsMetrics,
  InsertAnalyticsMetric,
  kpiDashboard,
  InsertKPIDashboard,
  revenueTrends,
  InsertRevenueTrend,
  workflowAutomations,
  InsertWorkflowAutomation,
  workflowExecutionLogs,
  InsertWorkflowExecutionLog
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




// ===== FIELD ACTIVITY TRACKING FUNCTIONS =====

/**
 * Log field activity (material usage, photos, GPS, issues)
 */
export async function logFieldActivity(
  projectId: string,
  activityType: "material_usage" | "task_completion" | "photo_capture" | "location_update" | "issue_report",
  data: {
    allocationId?: string;
    description?: string;
    quantity?: number;
    latitude?: number;
    longitude?: number;
    photoUrl?: string;
    offlineSync?: boolean;
  },
  createdBy: string
): Promise<{ success: boolean; activityId?: string; message: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const activityId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.insert(fieldActivityLogs).values({
      id: activityId,
      projectId,
      allocationId: data.allocationId,
      activityType,
      description: data.description,
      quantity: data.quantity?.toString(),
      latitude: data.latitude?.toString(),
      longitude: data.longitude?.toString(),
      photoUrl: data.photoUrl,
      offlineSync: data.offlineSync ? "true" : "false",
      createdBy,
    });

    return { success: true, activityId, message: "Activity logged successfully" };
  } catch (error) {
    console.error("[Database] Failed to log field activity:", error);
    return { success: false, message: "Failed to log activity" };
  }
}

/**
 * Get field activities for a project
 */
export async function getProjectFieldActivities(projectId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(fieldActivityLogs)
    .where(eq(fieldActivityLogs.projectId, projectId));
}

/**
 * Queue offline data for sync
 */
export async function queueOfflineData(
  userId: string,
  projectId: string,
  dataType: string,
  payload: any
): Promise<{ success: boolean; queueId?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const queueId = `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.insert(offlineDataQueue).values({
      id: queueId,
      userId,
      projectId,
      dataType,
      payload: JSON.stringify(payload),
      status: "pending",
    });

    return { success: true, queueId };
  } catch (error) {
    console.error("[Database] Failed to queue offline data:", error);
    return { success: false };
  }
}

/**
 * Get pending offline data for sync
 */
export async function getPendingOfflineData(userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(offlineDataQueue)
    .where(eq(offlineDataQueue.userId, userId))
    .where(eq(offlineDataQueue.status, "pending"));
}

/**
 * Mark offline data as synced
 */
export async function markOfflineDataSynced(queueId: string): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.update(offlineDataQueue)
      .set({ status: "synced", syncedAt: new Date() })
      .where(eq(offlineDataQueue.id, queueId));

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to mark offline data synced:", error);
    return { success: false };
  }
}

/**
 * Get real-time activity summary for project
 */
export async function getProjectActivitySummary(projectId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const activities = await db.select().from(fieldActivityLogs)
    .where(eq(fieldActivityLogs.projectId, projectId));

  const summary = {
    totalActivities: activities.length,
    materialUsageCount: activities.filter(a => a.activityType === "material_usage").length,
    photosCount: activities.filter(a => a.activityType === "photo_capture").length,
    issuesCount: activities.filter(a => a.activityType === "issue_report").length,
    tasksCompleted: activities.filter(a => a.activityType === "task_completion").length,
    lastUpdate: activities.length > 0 ? activities[activities.length - 1].createdAt : null,
    offlineSyncPending: activities.filter(a => a.offlineSync === "true").length,
  };

  return summary;
}




// ===== PROJECT PROFITABILITY TRACKING FUNCTIONS =====

/**
 * Add project cost (material, labor, equipment, etc.)
 */
export async function addProjectCost(
  projectId: string,
  costType: "material" | "labor" | "equipment" | "subcontractor" | "other",
  description: string,
  amount: number,
  data: {
    quantity?: number;
    unitPrice?: number;
    allocationId?: string;
  },
  createdBy: string
): Promise<{ success: boolean; costId?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const costId = `cost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.insert(projectCosts).values({
      id: costId,
      projectId,
      costType,
      description,
      amount: amount.toString(),
      quantity: data.quantity?.toString(),
      unitPrice: data.unitPrice?.toString(),
      allocationId: data.allocationId,
      status: "actual",
      createdBy,
    });

    // Update project profitability
    await updateProjectProfitability(projectId);

    return { success: true, costId };
  } catch (error) {
    console.error("[Database] Failed to add project cost:", error);
    return { success: false };
  }
}

/**
 * Get all costs for a project
 */
export async function getProjectCosts(projectId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(projectCosts)
    .where(eq(projectCosts.projectId, projectId));
}

/**
 * Calculate total project costs
 */
export async function calculateProjectTotalCosts(projectId: string): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const costs = await getProjectCosts(projectId);
  return costs.reduce((sum, cost) => sum + parseFloat(cost.amount || "0"), 0);
}

/**
 * Update project budget tracking
 */
export async function updateProjectBudgetTracking(
  projectId: string,
  budgetedAmount: number
): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const actualCosts = await calculateProjectTotalCosts(projectId);
    const variance = budgetedAmount - actualCosts;
    const variancePercentage = ((variance / budgetedAmount) * 100).toFixed(2);
    
    let status: "on_track" | "at_risk" | "over_budget" | "under_budget";
    if (variance > 0 && parseFloat(variancePercentage) > 10) {
      status = "under_budget";
    } else if (variance > 0 && parseFloat(variancePercentage) <= 10) {
      status = "on_track";
    } else if (variance < 0 && Math.abs(parseFloat(variancePercentage)) <= 10) {
      status = "at_risk";
    } else {
      status = "over_budget";
    }

    // Check if tracking exists
    const existing = await db.select().from(projectBudgetTracking)
      .where(eq(projectBudgetTracking.projectId, projectId)).limit(1);

    if (existing.length > 0) {
      await db.update(projectBudgetTracking)
        .set({
          budgetedAmount: budgetedAmount.toString(),
          actualAmount: actualCosts.toString(),
          variance: variance.toString(),
          variancePercentage: variancePercentage,
          status,
        })
        .where(eq(projectBudgetTracking.projectId, projectId));
    } else {
      const trackingId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(projectBudgetTracking).values({
        id: trackingId,
        projectId,
        budgetedAmount: budgetedAmount.toString(),
        actualAmount: actualCosts.toString(),
        variance: variance.toString(),
        variancePercentage: variancePercentage,
        status,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to update budget tracking:", error);
    return { success: false };
  }
}

/**
 * Update project profitability
 */
export async function updateProjectProfitability(projectId: string): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Get project quote amount
    const project = await getProject(projectId);
    if (!project) {
      return { success: false };
    }

    const quoteAmount = parseFloat(project.quoteAmount || "0");
    const totalCosts = await calculateProjectTotalCosts(projectId);
    const grossProfit = quoteAmount - totalCosts;
    const profitMargin = quoteAmount > 0 ? ((grossProfit / quoteAmount) * 100).toFixed(2) : "0";
    
    let status: "profitable" | "break_even" | "loss";
    if (grossProfit > 0) {
      status = "profitable";
    } else if (grossProfit === 0) {
      status = "break_even";
    } else {
      status = "loss";
    }

    // Check if profitability record exists
    const existing = await db.select().from(projectProfitability)
      .where(eq(projectProfitability.projectId, projectId)).limit(1);

    if (existing.length > 0) {
      await db.update(projectProfitability)
        .set({
          quoteAmount: quoteAmount.toString(),
          totalCosts: totalCosts.toString(),
          grossProfit: grossProfit.toString(),
          profitMargin: profitMargin,
          status,
        })
        .where(eq(projectProfitability.projectId, projectId));
    } else {
      const profitId = `profit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(projectProfitability).values({
        id: profitId,
        projectId,
        quoteAmount: quoteAmount.toString(),
        totalCosts: totalCosts.toString(),
        grossProfit: grossProfit.toString(),
        profitMargin: profitMargin,
        status,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to update profitability:", error);
    return { success: false };
  }
}

/**
 * Get project profitability summary
 */
export async function getProjectProfitabilitySummary(projectId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const profitability = await db.select().from(projectProfitability)
    .where(eq(projectProfitability.projectId, projectId)).limit(1);

  if (profitability.length === 0) {
    return null;
  }

  return profitability[0];
}

/**
 * Get budget tracking for project
 */
export async function getProjectBudgetTracking(projectId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const tracking = await db.select().from(projectBudgetTracking)
    .where(eq(projectBudgetTracking.projectId, projectId)).limit(1);

  return tracking.length > 0 ? tracking[0] : null;
}

/**
 * Get cost breakdown by type for project
 */
export async function getProjectCostBreakdown(projectId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const costs = await getProjectCosts(projectId);
  
  const breakdown = {
    material: 0,
    labor: 0,
    equipment: 0,
    subcontractor: 0,
    other: 0,
    total: 0,
  };

  costs.forEach(cost => {
    const amount = parseFloat(cost.amount || "0");
    breakdown[cost.costType as keyof typeof breakdown] += amount;
    breakdown.total += amount;
  });

  return breakdown;
}

/**
 * Check for budget overruns and alert
 */
export async function checkBudgetAlerts(projectId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const budgetTracking = await getProjectBudgetTracking(projectId);
  if (!budgetTracking) return [];

  const alerts = [];

  if (budgetTracking.status === "over_budget") {
    alerts.push({
      severity: "critical",
      message: `Project is over budget by $${Math.abs(parseFloat(budgetTracking.variance || "0")).toFixed(2)}`,
      variance: budgetTracking.variance,
    });
  } else if (budgetTracking.status === "at_risk") {
    alerts.push({
      severity: "warning",
      message: `Project is approaching budget limit. ${Math.abs(parseFloat(budgetTracking.variancePercentage || "0")).toFixed(1)}% remaining`,
      variance: budgetTracking.variance,
    });
  }

  const profitability = await getProjectProfitabilitySummary(projectId);
  if (profitability && profitability.status === "loss") {
    alerts.push({
      severity: "critical",
      message: `Project is unprofitable. Loss: $${Math.abs(parseFloat(profitability.grossProfit || "0")).toFixed(2)}`,
      grossProfit: profitability.grossProfit,
    });
  }

  return alerts;
}




// ===== SUPPLIER MANAGEMENT FUNCTIONS =====

/**
 * Create or update supplier
 */
export async function upsertSupplier(
  organizationId: string,
  data: {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    leadTime?: string;
    minimumOrderQuantity?: string;
    paymentTerms?: string;
  }
): Promise<{ success: boolean; supplierId?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const supplierId = data.id || `sup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const existing = await db.select().from(suppliers)
      .where(eq(suppliers.id, supplierId)).limit(1);

    if (existing.length > 0) {
      await db.update(suppliers).set(data).where(eq(suppliers.id, supplierId));
    } else {
      await db.insert(suppliers).values({
        id: supplierId,
        organizationId,
        ...data,
      });
    }

    return { success: true, supplierId };
  } catch (error) {
    console.error("[Database] Failed to upsert supplier:", error);
    return { success: false };
  }
}

/**
 * Get all suppliers for organization
 */
export async function getOrganizationSuppliers(organizationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(suppliers)
    .where(eq(suppliers.organizationId, organizationId))
    .where(eq(suppliers.isActive, "true"));
}

/**
 * Add supplier pricing
 */
export async function addSupplierPricing(
  supplierId: string,
  inventoryItemId: string,
  price: number,
  minimumQuantity: number = 1
): Promise<{ success: boolean; pricingId?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const pricingId = `pricing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(supplierPricing).values({
      id: pricingId,
      supplierId,
      inventoryItemId,
      price: price.toString(),
      minimumQuantity: minimumQuantity.toString(),
    });

    return { success: true, pricingId };
  } catch (error) {
    console.error("[Database] Failed to add supplier pricing:", error);
    return { success: false };
  }
}

/**
 * Get best supplier pricing for item
 */
export async function getBestSupplierPricing(inventoryItemId: string, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const pricing = await db.select().from(supplierPricing)
    .where(eq(supplierPricing.inventoryItemId, inventoryItemId))
    .where(eq(supplierPricing.isActive, "true"))
    .where(lt(supplierPricing.minimumQuantity, quantity.toString()));

  if (pricing.length === 0) return null;

  // Sort by price ascending and return lowest
  return pricing.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[0];
}

/**
 * Create purchase order
 */
export async function createPurchaseOrder(
  organizationId: string,
  supplierId: string,
  items: Array<{ inventoryItemId: string; quantity: number; unitPrice: number }>,
  createdBy: string,
  expectedDeliveryDate?: Date
): Promise<{ success: boolean; poId?: string; poNumber?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const poId = `po_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const poNumber = `PO-${Date.now()}`;
    
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    await db.insert(purchaseOrders).values({
      id: poId,
      organizationId,
      supplierId,
      poNumber,
      totalAmount: totalAmount.toString(),
      expectedDeliveryDate,
      createdBy,
    });

    // Add items to PO
    for (const item of items) {
      const lineTotal = item.quantity * item.unitPrice;
      const itemId = `poi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await db.insert(purchaseOrderItems).values({
        id: itemId,
        purchaseOrderId: poId,
        inventoryItemId: item.inventoryItemId,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        lineTotal: lineTotal.toString(),
      });
    }

    return { success: true, poId, poNumber };
  } catch (error) {
    console.error("[Database] Failed to create purchase order:", error);
    return { success: false };
  }
}

/**
 * Get purchase orders for organization
 */
export async function getOrganizationPurchaseOrders(organizationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(purchaseOrders)
    .where(eq(purchaseOrders.organizationId, organizationId));
}

/**
 * Auto-generate purchase order for low stock item
 */
export async function autoGeneratePurchaseOrder(
  organizationId: string,
  inventoryItemId: string,
  reorderQuantity: number,
  createdBy: string
): Promise<{ success: boolean; poId?: string; message: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Get best supplier pricing
    const pricing = await getBestSupplierPricing(inventoryItemId, reorderQuantity);
    if (!pricing) {
      return { success: false, message: "No supplier pricing found for this item" };
    }

    // Get supplier details
    const supplier = await db.select().from(suppliers)
      .where(eq(suppliers.id, pricing.supplierId)).limit(1);
    
    if (supplier.length === 0) {
      return { success: false, message: "Supplier not found" };
    }

    // Calculate expected delivery date
    const leadTime = parseInt(supplier[0].leadTime || "7");
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + leadTime);

    // Create PO
    const result = await createPurchaseOrder(
      organizationId,
      pricing.supplierId,
      [{ inventoryItemId, quantity: reorderQuantity, unitPrice: parseFloat(pricing.price) }],
      createdBy,
      expectedDelivery
    );

    if (!result.success) {
      return { success: false, message: "Failed to create purchase order" };
    }

    return {
      success: true,
      poId: result.poId,
      message: `Auto-generated PO ${result.poNumber} from ${supplier[0].name}. Expected delivery: ${expectedDelivery.toDateString()}`,
    };
  } catch (error) {
    console.error("[Database] Failed to auto-generate PO:", error);
    return { success: false, message: "Failed to auto-generate purchase order" };
  }
}

/**
 * Update purchase order status
 */
export async function updatePurchaseOrderStatus(
  poId: string,
  status: "draft" | "sent" | "confirmed" | "shipped" | "received" | "canceled",
  actualDeliveryDate?: Date
): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const updates: any = { status };
    if (actualDeliveryDate && status === "received") {
      updates.actualDeliveryDate = actualDeliveryDate;
    }

    await db.update(purchaseOrders).set(updates).where(eq(purchaseOrders.id, poId));

    // If received, update inventory
    if (status === "received") {
      const po = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, poId)).limit(1);
      if (po.length > 0) {
        const items = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, poId));
        
        for (const item of items) {
          const quantity = parseInt(item.quantity || "0");
          const currentItem = await db.select().from(inventoryItems)
            .where(eq(inventoryItems.id, item.inventoryItemId)).limit(1);
          
          if (currentItem.length > 0) {
            const currentStock = parseInt(currentItem[0].currentStock || "0");
            await db.update(inventoryItems)
              .set({ currentStock: (currentStock + quantity).toString() })
              .where(eq(inventoryItems.id, item.inventoryItemId));
          }
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to update PO status:", error);
    return { success: false };
  }
}

/**
 * Get pending purchase orders (not yet received)
 */
export async function getPendingPurchaseOrders(organizationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(purchaseOrders)
    .where(eq(purchaseOrders.organizationId, organizationId))
    .where(or(
      eq(purchaseOrders.status, "sent"),
      eq(purchaseOrders.status, "confirmed"),
      eq(purchaseOrders.status, "shipped")
    ));
}

/**
 * Check for overdue purchase orders
 */
export async function getOverduePurchaseOrders(organizationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const pending = await getPendingPurchaseOrders(organizationId);

  return pending.filter(po => {
    if (!po.expectedDeliveryDate) return false;
    return new Date(po.expectedDeliveryDate) < now;
  });
}




// ===== LABOR TRACKING FUNCTIONS =====

/**
 * Submit labor timesheet entry
 */
export async function submitLaborTimesheet(
  projectId: string,
  userId: string,
  date: Date,
  hoursWorked: number,
  hourlyRate: number,
  taskDescription?: string
): Promise<{ success: boolean; timesheetId?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const timesheetId = `ts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const totalCost = hoursWorked * hourlyRate;

    await db.insert(laborTimesheets).values({
      id: timesheetId,
      projectId,
      userId,
      date,
      hoursWorked: hoursWorked.toString(),
      hourlyRate: hourlyRate.toString(),
      totalCost: totalCost.toString(),
      taskDescription,
      status: "submitted",
    });

    // Update labor costs summary
    await updateLaborCostsSummary(projectId);

    return { success: true, timesheetId };
  } catch (error) {
    console.error("[Database] Failed to submit labor timesheet:", error);
    return { success: false };
  }
}

/**
 * Get labor timesheets for project
 */
export async function getProjectLaborTimesheets(projectId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(laborTimesheets)
    .where(eq(laborTimesheets.projectId, projectId));
}

/**
 * Approve labor timesheet
 */
export async function approveLaborTimesheet(timesheetId: string): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.update(laborTimesheets)
      .set({ status: "approved" })
      .where(eq(laborTimesheets.id, timesheetId));

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to approve timesheet:", error);
    return { success: false };
  }
}

/**
 * Update labor costs summary for project
 */
export async function updateLaborCostsSummary(projectId: string): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const timesheets = await getProjectLaborTimesheets(projectId);
    
    const totalHours = timesheets.reduce((sum, ts) => sum + parseFloat(ts.hoursWorked || "0"), 0);
    const totalCost = timesheets.reduce((sum, ts) => sum + parseFloat(ts.totalCost || "0"), 0);
    const averageHourlyRate = timesheets.length > 0 ? totalCost / totalHours : 0;

    // Check if summary exists
    const existing = await db.select().from(laborCostsSummary)
      .where(eq(laborCostsSummary.projectId, projectId)).limit(1);

    if (existing.length > 0) {
      await db.update(laborCostsSummary)
        .set({
          totalHours: totalHours.toString(),
          totalCost: totalCost.toString(),
          averageHourlyRate: averageHourlyRate.toString(),
        })
        .where(eq(laborCostsSummary.projectId, projectId));
    } else {
      const summaryId = `lcs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(laborCostsSummary).values({
        id: summaryId,
        projectId,
        totalHours: totalHours.toString(),
        totalCost: totalCost.toString(),
        averageHourlyRate: averageHourlyRate.toString(),
      });
    }

    // Add labor cost to project costs
    await addProjectCost(
      projectId,
      "labor",
      `Labor costs for ${totalHours} hours`,
      totalCost,
      {},
      "system"
    );

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to update labor costs summary:", error);
    return { success: false };
  }
}

/**
 * Get labor costs summary for project
 */
export async function getProjectLaborCostsSummary(projectId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const summary = await db.select().from(laborCostsSummary)
    .where(eq(laborCostsSummary.projectId, projectId)).limit(1);

  return summary.length > 0 ? summary[0] : null;
}

/**
 * Get labor timesheets by user
 */
export async function getUserLaborTimesheets(userId: string, projectId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.select().from(laborTimesheets)
    .where(eq(laborTimesheets.userId, userId));

  if (projectId) {
    query = query.where(eq(laborTimesheets.projectId, projectId));
  }

  return await query;
}

/**
 * Calculate labor variance (budgeted vs actual)
 */
export async function calculateLaborVariance(
  projectId: string,
  budgetedHours: number
): Promise<{ variance: number; variancePercentage: number; status: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const summary = await getProjectLaborCostsSummary(projectId);
  if (!summary) {
    return { variance: 0, variancePercentage: 0, status: "no_data" };
  }

  const actualHours = parseFloat(summary.totalHours || "0");
  const variance = budgetedHours - actualHours;
  const variancePercentage = budgetedHours > 0 ? (variance / budgetedHours) * 100 : 0;

  let status = "on_track";
  if (variancePercentage < -10) {
    status = "over_budget";
  } else if (variancePercentage < 0) {
    status = "at_risk";
  } else if (variancePercentage > 10) {
    status = "under_budget";
  }

  return { variance, variancePercentage, status };
}

/**
 * Get pending timesheets for approval
 */
export async function getPendingTimesheets(projectId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.select().from(laborTimesheets)
    .where(eq(laborTimesheets.status, "submitted"));

  if (projectId) {
    query = query.where(eq(laborTimesheets.projectId, projectId));
  }

  return await query;
}




// ===== CUSTOMER PORTAL FUNCTIONS =====

/**
 * Generate customer portal access token
 */
export async function generateCustomerPortalAccess(
  organizationId: string,
  clientId: string,
  expiresInDays: number = 365
): Promise<{ success: boolean; accessToken?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const accessToken = `portal_${Date.now()}_${Math.random().toString(36).substr(2, 20)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const id = `cpa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(customerPortalAccess).values({
      id,
      organizationId,
      clientId,
      accessToken,
      expiresAt,
    });

    return { success: true, accessToken };
  } catch (error) {
    console.error("[Database] Failed to generate portal access:", error);
    return { success: false };
  }
}

/**
 * Verify customer portal access token
 */
export async function verifyCustomerPortalAccess(accessToken: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const access = await db.select().from(customerPortalAccess)
    .where(eq(customerPortalAccess.accessToken, accessToken))
    .where(eq(customerPortalAccess.isActive, "true"))
    .limit(1);

  if (access.length === 0) {
    return null;
  }

  const record = access[0];
  if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
    return null; // Token expired
  }

  return record;
}

/**
 * Create customer invoice
 */
export async function createCustomerInvoice(
  organizationId: string,
  clientId: string,
  projectId: string,
  amount: number,
  dueDate?: Date,
  notes?: string
): Promise<{ success: boolean; invoiceId?: string; invoiceNumber?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const invoiceNumber = `INV-${Date.now()}`;

    await db.insert(customerInvoices).values({
      id: invoiceId,
      organizationId,
      clientId,
      projectId,
      invoiceNumber,
      amount: amount.toString(),
      dueDate,
      notes,
      status: "draft",
    });

    return { success: true, invoiceId, invoiceNumber };
  } catch (error) {
    console.error("[Database] Failed to create customer invoice:", error);
    return { success: false };
  }
}

/**
 * Get customer invoices
 */
export async function getClientInvoices(clientId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(customerInvoices)
    .where(eq(customerInvoices.clientId, clientId));
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  status: "draft" | "sent" | "viewed" | "overdue" | "paid" | "canceled",
  paidDate?: Date
): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const updates: any = { status };
    if (paidDate && status === "paid") {
      updates.paidDate = paidDate;
    }

    await db.update(customerInvoices).set(updates).where(eq(customerInvoices.id, invoiceId));

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to update invoice status:", error);
    return { success: false };
  }
}

/**
 * Add customer document
 */
export async function addCustomerDocument(
  organizationId: string,
  clientId: string,
  projectId: string,
  documentName: string,
  documentType: string,
  fileUrl: string,
  fileSize?: number
): Promise<{ success: boolean; documentId?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(customerDocuments).values({
      id: documentId,
      organizationId,
      clientId,
      projectId,
      documentName,
      documentType,
      fileUrl,
      fileSize: fileSize?.toString(),
    });

    return { success: true, documentId };
  } catch (error) {
    console.error("[Database] Failed to add customer document:", error);
    return { success: false };
  }
}

/**
 * Get customer documents for project
 */
export async function getProjectCustomerDocuments(projectId: string, clientId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(customerDocuments)
    .where(eq(customerDocuments.projectId, projectId))
    .where(eq(customerDocuments.clientId, clientId));
}

/**
 * Get customer portal dashboard data
 */
export async function getCustomerPortalDashboard(clientId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const invoices = await getClientInvoices(clientId);
    
    const totalInvoiced = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount || "0"), 0);
    const totalPaid = invoices
      .filter(inv => inv.status === "paid")
      .reduce((sum, inv) => sum + parseFloat(inv.amount || "0"), 0);
    const totalOutstanding = totalInvoiced - totalPaid;
    
    const overdueInvoices = invoices.filter(inv => {
      if (!inv.dueDate || inv.status === "paid") return false;
      return new Date(inv.dueDate) < new Date();
    });

    return {
      success: true,
      data: {
        totalInvoiced,
        totalPaid,
        totalOutstanding,
        invoiceCount: invoices.length,
        overdueCount: overdueInvoices.length,
        invoices,
        overdueInvoices,
      },
    };
  } catch (error) {
    console.error("[Database] Failed to get portal dashboard:", error);
    return { success: false };
  }
}

/**
 * Get overdue invoices
 */
export async function getOverdueInvoices(organizationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const invoices = await db.select().from(customerInvoices)
    .where(eq(customerInvoices.organizationId, organizationId));

  return invoices.filter(inv => {
    if (!inv.dueDate || inv.status === "paid") return false;
    return new Date(inv.dueDate) < now;
  });
}

/**
 * Send invoice to customer
 */
export async function sendInvoiceToCustomer(invoiceId: string): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.update(customerInvoices)
      .set({ status: "sent" })
      .where(eq(customerInvoices.id, invoiceId));

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to send invoice:", error);
    return { success: false };
  }
}




// ===== ANALYTICS & REPORTING FUNCTIONS =====

/**
 * Record analytics metric
 */
export async function recordAnalyticsMetric(
  organizationId: string,
  metricType: string,
  metricName: string,
  metricValue: number,
  period: string = "daily"
): Promise<{ success: boolean; metricId?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const metricId = `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const periodDate = new Date();

    await db.insert(analyticsMetrics).values({
      id: metricId,
      organizationId,
      metricType,
      metricName,
      metricValue: metricValue.toString(),
      period,
      periodDate,
    });

    return { success: true, metricId };
  } catch (error) {
    console.error("[Database] Failed to record metric:", error);
    return { success: false };
  }
}

/**
 * Calculate and update KPI dashboard
 */
export async function updateKPIDashboard(organizationId: string): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Get all projects for organization
    const projects = await db.select().from(projects as any)
      .where(eq(projects.organizationId, organizationId));

    // Calculate metrics
    const totalRevenue = projects.reduce((sum, p) => sum + parseFloat(p.quoteAmount || "0"), 0);
    const activeProjects = projects.filter(p => p.status === "in_progress").length;
    const averageProjectValue = projects.length > 0 ? totalRevenue / projects.length : 0;

    // Get profitability data
    const profitability = await db.select().from(projectProfitability as any)
      .where(eq(projectProfitability.organizationId, organizationId));

    const totalProfit = profitability.reduce((sum, p) => sum + parseFloat(p.grossProfit || "0"), 0);
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : "0";

    // Get cost breakdown
    const costs = await db.select().from(projectCosts as any)
      .where(eq(projectCosts.organizationId, organizationId));

    const laborCosts = costs
      .filter(c => c.costType === "labor")
      .reduce((sum, c) => sum + parseFloat(c.amount || "0"), 0);
    const materialCosts = costs
      .filter(c => c.costType === "material")
      .reduce((sum, c) => sum + parseFloat(c.amount || "0"), 0);
    const totalCosts = costs.reduce((sum, c) => sum + parseFloat(c.amount || "0"), 0);

    const laborCostPercentage = totalRevenue > 0 ? ((laborCosts / totalRevenue) * 100).toFixed(2) : "0";
    const materialCostPercentage = totalRevenue > 0 ? ((materialCosts / totalRevenue) * 100).toFixed(2) : "0";

    // Check if KPI exists
    const existing = await db.select().from(kpiDashboard)
      .where(eq(kpiDashboard.organizationId, organizationId)).limit(1);

    if (existing.length > 0) {
      await db.update(kpiDashboard)
        .set({
          totalRevenue: totalRevenue.toString(),
          totalProjects: projects.length.toString(),
          activeProjects: activeProjects.toString(),
          averageProjectValue: averageProjectValue.toString(),
          profitMargin: profitMargin,
          laborCostPercentage: laborCostPercentage,
          materialCostPercentage: materialCostPercentage,
        })
        .where(eq(kpiDashboard.organizationId, organizationId));
    } else {
      const kpiId = `kpi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(kpiDashboard).values({
        id: kpiId,
        organizationId,
        totalRevenue: totalRevenue.toString(),
        totalProjects: projects.length.toString(),
        activeProjects: activeProjects.toString(),
        averageProjectValue: averageProjectValue.toString(),
        profitMargin: profitMargin,
        laborCostPercentage: laborCostPercentage,
        materialCostPercentage: materialCostPercentage,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to update KPI dashboard:", error);
    return { success: false };
  }
}

/**
 * Get KPI dashboard data
 */
export async function getKPIDashboard(organizationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const kpi = await db.select().from(kpiDashboard)
    .where(eq(kpiDashboard.organizationId, organizationId)).limit(1);

  return kpi.length > 0 ? kpi[0] : null;
}

/**
 * Record revenue trend
 */
export async function recordRevenueTrend(
  organizationId: string,
  month: string,
  revenue: number,
  costs: number,
  projectCount: number,
  projectedRevenue?: number
): Promise<{ success: boolean; trendId?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const trendId = `trend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const profit = revenue - costs;

    await db.insert(revenueTrends).values({
      id: trendId,
      organizationId,
      month,
      revenue: revenue.toString(),
      projectedRevenue: projectedRevenue?.toString(),
      costs: costs.toString(),
      profit: profit.toString(),
      projectCount: projectCount.toString(),
    });

    return { success: true, trendId };
  } catch (error) {
    console.error("[Database] Failed to record revenue trend:", error);
    return { success: false };
  }
}

/**
 * Get revenue trends for period
 */
export async function getRevenueTrends(organizationId: string, months: number = 12) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const trends = await db.select().from(revenueTrends)
    .where(eq(revenueTrends.organizationId, organizationId))
    .orderBy(desc(revenueTrends.createdAt))
    .limit(months);

  return trends.reverse();
}

/**
 * Get analytics metrics by type
 */
export async function getAnalyticsMetricsByType(
  organizationId: string,
  metricType: string,
  period: string = "daily"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(analyticsMetrics)
    .where(and(
      eq(analyticsMetrics.organizationId, organizationId),
      eq(analyticsMetrics.metricType, metricType),
      eq(analyticsMetrics.period, period)
    ))
    .orderBy(desc(analyticsMetrics.createdAt));
}

/**
 * Calculate project profitability trend
 */
export async function calculateProfitabilityTrend(organizationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const profitability = await db.select().from(projectProfitability as any)
      .where(eq(projectProfitability.organizationId, organizationId));

    const profitable = profitability.filter(p => p.status === "profitable").length;
    const breakEven = profitability.filter(p => p.status === "break_even").length;
    const loss = profitability.filter(p => p.status === "loss").length;
    const total = profitability.length;

    const profitablePercentage = total > 0 ? ((profitable / total) * 100).toFixed(2) : "0";
    const lossPercentage = total > 0 ? ((loss / total) * 100).toFixed(2) : "0";

    return {
      profitable,
      breakEven,
      loss,
      total,
      profitablePercentage,
      lossPercentage,
    };
  } catch (error) {
    console.error("[Database] Failed to calculate profitability trend:", error);
    return null;
  }
}

/**
 * Get top performing projects
 */
export async function getTopPerformingProjects(organizationId: string, limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const profitability = await db.select().from(projectProfitability as any)
      .where(eq(projectProfitability.organizationId, organizationId))
      .orderBy(desc(projectProfitability.grossProfit))
      .limit(limit);

    return profitability;
  } catch (error) {
    console.error("[Database] Failed to get top projects:", error);
    return [];
  }
}

/**
 * Get underperforming projects (losses)
 */
export async function getUnderperformingProjects(organizationId: string, limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const profitability = await db.select().from(projectProfitability as any)
      .where(eq(projectProfitability.organizationId, organizationId))
      .orderBy(projectProfitability.grossProfit)
      .limit(limit);

    return profitability.filter(p => parseFloat(p.grossProfit || "0") < 0);
  } catch (error) {
    console.error("[Database] Failed to get underperforming projects:", error);
    return [];
  }
}




// ===== WORKFLOW AUTOMATION FUNCTIONS =====

/**
 * Create workflow automation
 */
export async function createWorkflowAutomation(
  organizationId: string,
  name: string,
  trigger: string,
  action: string,
  triggerCondition?: string,
  actionData?: string,
  description?: string
): Promise<{ success: boolean; workflowId?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(workflowAutomations).values({
      id: workflowId,
      organizationId,
      name,
      trigger,
      action,
      triggerCondition,
      actionData,
      description,
    });

    return { success: true, workflowId };
  } catch (error) {
    console.error("[Database] Failed to create workflow:", error);
    return { success: false };
  }
}

/**
 * Get organization workflows
 */
export async function getOrganizationWorkflows(organizationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(workflowAutomations)
    .where(eq(workflowAutomations.organizationId, organizationId))
    .orderBy(desc(workflowAutomations.createdAt));
}

/**
 * Get active workflows
 */
export async function getActiveWorkflows(organizationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(workflowAutomations)
    .where(and(
      eq(workflowAutomations.organizationId, organizationId),
      eq(workflowAutomations.isActive, "true")
    ));
}

/**
 * Update workflow
 */
export async function updateWorkflow(
  workflowId: string,
  updates: Partial<InsertWorkflowAutomation>
): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.update(workflowAutomations)
      .set(updates)
      .where(eq(workflowAutomations.id, workflowId));

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to update workflow:", error);
    return { success: false };
  }
}

/**
 * Disable workflow
 */
export async function disableWorkflow(workflowId: string): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.update(workflowAutomations)
      .set({ isActive: "false" })
      .where(eq(workflowAutomations.id, workflowId));

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to disable workflow:", error);
    return { success: false };
  }
}

/**
 * Log workflow execution
 */
export async function logWorkflowExecution(
  workflowId: string,
  organizationId: string,
  status: "pending" | "running" | "success" | "failed",
  triggeredBy?: string,
  result?: string,
  errorMessage?: string
): Promise<{ success: boolean; logId?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const logId = `wflog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(workflowExecutionLogs).values({
      id: logId,
      workflowId,
      organizationId,
      status,
      triggeredBy,
      result,
      errorMessage,
      executedAt: new Date(),
    });

    return { success: true, logId };
  } catch (error) {
    console.error("[Database] Failed to log workflow execution:", error);
    return { success: false };
  }
}

/**
 * Get workflow execution logs
 */
export async function getWorkflowExecutionLogs(workflowId: string, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(workflowExecutionLogs)
    .where(eq(workflowExecutionLogs.workflowId, workflowId))
    .orderBy(desc(workflowExecutionLogs.createdAt))
    .limit(limit);
}

/**
 * Get failed workflow executions
 */
export async function getFailedWorkflowExecutions(organizationId: string, limit: number = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(workflowExecutionLogs)
    .where(and(
      eq(workflowExecutionLogs.organizationId, organizationId),
      eq(workflowExecutionLogs.status, "failed")
    ))
    .orderBy(desc(workflowExecutionLogs.createdAt))
    .limit(limit);
}

/**
 * Get workflow statistics
 */
export async function getWorkflowStatistics(organizationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const workflows = await getOrganizationWorkflows(organizationId);
    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter(w => w.isActive === "true").length;

    const executionLogs = await db.select().from(workflowExecutionLogs)
      .where(eq(workflowExecutionLogs.organizationId, organizationId));

    const successCount = executionLogs.filter(l => l.status === "success").length;
    const failedCount = executionLogs.filter(l => l.status === "failed").length;
    const totalExecutions = executionLogs.length;
    const successRate = totalExecutions > 0 ? ((successCount / totalExecutions) * 100).toFixed(2) : "0";

    return {
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      successCount,
      failedCount,
      successRate,
    };
  } catch (error) {
    console.error("[Database] Failed to get workflow statistics:", error);
    return null;
  }
}

/**
 * Delete workflow
 */
export async function deleteWorkflow(workflowId: string): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.delete(workflowAutomations)
      .where(eq(workflowAutomations.id, workflowId));

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to delete workflow:", error);
    return { success: false };
  }
}

/**
 * Get workflows by trigger type
 */
export async function getWorkflowsByTrigger(organizationId: string, trigger: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(workflowAutomations)
    .where(and(
      eq(workflowAutomations.organizationId, organizationId),
      eq(workflowAutomations.trigger, trigger)
    ));
}

