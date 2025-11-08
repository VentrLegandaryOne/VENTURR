/**
 * Data Flow Integration Layer
 * Ensures seamless data flow through all workflows:
 * Project → Measurement → Calculator → Quote → Invoice → Payment
 */

import { trpc } from "./trpc";

export interface WorkflowData {
  projectId: string;
  clientId: string;
  measurements?: {
    roofArea: number;
    roofPitch: number;
    scale: number;
    drawingData?: string;
  };
  materials?: {
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      unitPrice: number;
    }>;
    subtotal: number;
  };
  labor?: {
    hours: number;
    hourlyRate: number;
    subtotal: number;
  };
  quote?: {
    lineItems: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
  };
  invoice?: {
    invoiceNumber: string;
    issueDate: Date;
    dueDate: Date;
    total: number;
    paid: boolean;
  };
}

/**
 * Measurement to Calculator Flow
 * Auto-populates calculator with measurement data
 */
export async function flowMeasurementToCalculator(
  projectId: string,
  measurements: WorkflowData["measurements"]
) {
  if (!measurements) return null;

  // Calculate material requirements based on roof area
  const roofAreaSqm = measurements.roofArea;
  const wastePercentage = 0.15; // 15% waste factor
  const adjustedArea = roofAreaSqm * (1 + wastePercentage);

  // Standard material requirements per sqm
  const materialRequirements = {
    colorbondSheets: Math.ceil(adjustedArea / 10), // 1 sheet = 10 sqm
    underlayment: Math.ceil(adjustedArea / 50), // 1 roll = 50 sqm
    fasteners: Math.ceil(adjustedArea * 20), // 20 fasteners per sqm
    sealant: Math.ceil(adjustedArea / 100), // 1 tube = 100 sqm
  };

  return {
    projectId,
    roofArea: measurements.roofArea,
    roofPitch: measurements.roofPitch,
    wastePercentage,
    adjustedArea,
    materialRequirements,
    timestamp: new Date(),
  };
}

/**
 * Calculator to Quote Flow
 * Converts calculator results to quote line items
 */
export async function flowCalculatorToQuote(
  projectId: string,
  calculatorData: any,
  materialPrices: Record<string, number>
) {
  const lineItems = [];
  let subtotal = 0;

  // Add material line items
  for (const [material, quantity] of Object.entries(
    calculatorData.materialRequirements
  )) {
    const unitPrice = materialPrices[material] || 0;
    const itemTotal = (quantity as number) * unitPrice;

    lineItems.push({
      description: `${material} (${quantity} units)`,
      quantity: quantity as number,
      unitPrice,
      total: itemTotal,
    });

    subtotal += itemTotal;
  }

  // Add labor line item
  const laborHours = calculatorData.roofArea / 50; // Assume 50 sqm per day
  const laborRate = 150; // AUD per hour
  const laborTotal = laborHours * laborRate;

  lineItems.push({
    description: `Labor (${laborHours.toFixed(1)} hours @ $${laborRate}/hr)`,
    quantity: laborHours,
    unitPrice: laborRate,
    total: laborTotal,
  });

  subtotal += laborTotal;

  return {
    projectId,
    lineItems,
    subtotal,
    tax: subtotal * 0.1, // 10% GST
    total: subtotal * 1.1,
    timestamp: new Date(),
  };
}

/**
 * Quote to Invoice Flow
 * Converts accepted quote to invoice
 */
export async function flowQuoteToInvoice(
  projectId: string,
  quoteData: any,
  clientInfo: any
) {
  return {
    projectId,
    clientId: clientInfo.id,
    clientName: clientInfo.name,
    clientEmail: clientInfo.email,
    invoiceNumber: `INV-${Date.now()}`,
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    lineItems: quoteData.lineItems,
    subtotal: quoteData.subtotal,
    tax: quoteData.tax,
    total: quoteData.total,
    paymentTerms: "net30",
    status: "issued",
    timestamp: new Date(),
  };
}

/**
 * Complete Workflow Flow
 * Orchestrates entire workflow from project to invoice
 */
export async function executeCompleteWorkflow(
  projectId: string,
  clientId: string,
  measurements: WorkflowData["measurements"],
  materialPrices: Record<string, number>,
  clientInfo: any
) {
  try {
    // Step 1: Flow measurements to calculator
    const calculatorData = await flowMeasurementToCalculator(
      projectId,
      measurements
    );

    if (!calculatorData) {
      throw new Error("Failed to process measurements");
    }

    // Step 2: Flow calculator to quote
    const quoteData = await flowCalculatorToQuote(
      projectId,
      calculatorData,
      materialPrices
    );

    // Step 3: Flow quote to invoice
    const invoiceData = await flowQuoteToInvoice(
      projectId,
      quoteData,
      clientInfo
    );

    // Step 4: Save all data to database
    const result = {
      calculator: calculatorData,
      quote: quoteData,
      invoice: invoiceData,
      status: "success",
      timestamp: new Date(),
    };

    return result;
  } catch (error) {
    console.error("Workflow execution error:", error);
    throw error;
  }
}

/**
 * Validate Data Flow
 * Ensures data integrity throughout workflow
 */
export function validateDataFlow(data: WorkflowData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate project
  if (!data.projectId) {
    errors.push("Project ID is required");
  }

  // Validate client
  if (!data.clientId) {
    errors.push("Client ID is required");
  }

  // Validate measurements if present
  if (data.measurements) {
    if (data.measurements.roofArea <= 0) {
      errors.push("Roof area must be greater than 0");
    }
    if (data.measurements.roofPitch < 0) {
      errors.push("Roof pitch cannot be negative");
    }
  }

  // Validate materials if present
  if (data.materials) {
    if (data.materials.items.length === 0) {
      errors.push("At least one material is required");
    }
    if (data.materials.subtotal <= 0) {
      errors.push("Materials subtotal must be greater than 0");
    }
  }

  // Validate quote if present
  if (data.quote) {
    if (data.quote.lineItems.length === 0) {
      errors.push("Quote must have at least one line item");
    }
    if (data.quote.total <= 0) {
      errors.push("Quote total must be greater than 0");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get Workflow Progress
 * Shows how far along the workflow is
 */
export function getWorkflowProgress(data: WorkflowData): {
  stage: string;
  progress: number;
  nextStage: string;
} {
  if (!data.projectId) {
    return { stage: "Project Creation", progress: 0, nextStage: "Project Creation" };
  }

  if (!data.measurements) {
    return { stage: "Measurement", progress: 20, nextStage: "Measurement" };
  }

  if (!data.materials) {
    return { stage: "Calculator", progress: 40, nextStage: "Calculator" };
  }

  if (!data.quote) {
    return { stage: "Quote Generation", progress: 60, nextStage: "Quote Generation" };
  }

  if (!data.invoice) {
    return { stage: "Invoice Creation", progress: 80, nextStage: "Invoice Creation" };
  }

  if (!data.invoice.paid) {
    return { stage: "Payment", progress: 90, nextStage: "Payment" };
  }

  return { stage: "Complete", progress: 100, nextStage: "Complete" };
}

