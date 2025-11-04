import { PDFDocument, PDFPage, rgb } from "pdf-lib";
import { Takeoff, Quote } from "../drizzle/schema";

/**
 * PDF export service for Venturr
 * Generates professional PDF documents for quotes and takeoffs
 */

export interface PDFExportOptions {
  companyName: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyABN?: string;
  includeTerms?: boolean;
  includeNotes?: boolean;
  theme?: "professional" | "colorful" | "minimal";
}

/**
 * Generate PDF for takeoff calculation
 */
export async function generateTakeoffPDF(
  takeoff: any,
  projectTitle: string,
  clientName: string,
  options: PDFExportOptions
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();

  let yPosition = height - 50;

  // Header
  yPosition = drawHeader(page, yPosition, options);

  // Title
  yPosition = drawTitle(page, yPosition, "Takeoff Calculation");

  // Project Information
  yPosition = drawSection(page, yPosition, "Project Information", [
    { label: "Project", value: projectTitle },
    { label: "Client", value: clientName },
    { label: "Date", value: new Date().toLocaleDateString() },
  ]);

  // Takeoff Details
  if (takeoff.roofArea) {
    yPosition = drawSection(page, yPosition, "Roof Specifications", [
      { label: "Roof Area", value: `${takeoff.roofArea} m²` },
      { label: "Roof Type", value: takeoff.roofType || "Not specified" },
      { label: "Roof Pitch", value: takeoff.roofPitch || "Not specified" },
      { label: "Waste Percentage", value: `${takeoff.wastePercentage || 10}%` },
    ]);
  }

  // Materials Table
  if (takeoff.materials) {
    yPosition = drawMaterialsTable(page, yPosition, takeoff.materials);
  }

  // Cost Summary
  if (takeoff.calculations) {
    yPosition = drawCostSummary(page, yPosition, takeoff.calculations);
  }

  // Terms and Notes
  if (options.includeTerms && takeoff.terms) {
    yPosition = drawSection(page, yPosition, "Terms & Conditions", [
      { label: "", value: takeoff.terms },
    ]);
  }

  if (options.includeNotes && takeoff.notes) {
    yPosition = drawSection(page, yPosition, "Notes", [
      { label: "", value: takeoff.notes },
    ]);
  }

  // Footer
  drawFooter(page, options);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Generate PDF for quote
 */
export async function generateQuotePDF(
  quote: any,
  projectTitle: string,
  clientName: string,
  clientEmail: string,
  options: PDFExportOptions
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();

  let yPosition = height - 50;

  // Header
  yPosition = drawHeader(page, yPosition, options);

  // Title
  yPosition = drawTitle(page, yPosition, `Quote #${quote.quoteNumber}`);

  // Client Information
  yPosition = drawSection(page, yPosition, "Bill To", [
    { label: "Name", value: clientName },
    { label: "Email", value: clientEmail },
  ]);

  // Quote Details
  yPosition = drawSection(page, yPosition, "Quote Details", [
    { label: "Project", value: projectTitle },
    { label: "Quote Date", value: new Date().toLocaleDateString() },
    {
      label: "Valid Until",
      value: quote.validUntil
        ? new Date(quote.validUntil).toLocaleDateString()
        : "Upon request",
    },
  ]);

  // Line Items Table
  if (quote.items && quote.items.length > 0) {
    yPosition = drawLineItemsTable(page, yPosition, quote.items);
  }

  // Totals
  yPosition = drawTotals(page, yPosition, quote);

  // Terms
  if (options.includeTerms && quote.terms) {
    yPosition = drawSection(page, yPosition, "Terms & Conditions", [
      { label: "", value: quote.terms },
    ]);
  }

  // Notes
  if (options.includeNotes && quote.notes) {
    yPosition = drawSection(page, yPosition, "Notes", [
      { label: "", value: quote.notes },
    ]);
  }

  // Footer
  drawFooter(page, options);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Helper functions for PDF generation
 */

function drawHeader(
  page: PDFPage,
  yPosition: number,
  options: PDFExportOptions
): number {
  const { width } = page.getSize();

  // Company name
  page.drawText(options.companyName || "Venturr", {
    x: 50,
    y: yPosition,
    size: 24,
    color: rgb(0.1, 0.3, 0.8), // Blue
  });

  // Company details
  const detailsText = [
    options.companyAddress,
    options.companyPhone,
    options.companyEmail,
  ]
    .filter(Boolean)
    .join(" | ");

  if (detailsText) {
    page.drawText(detailsText, {
      x: 50,
      y: yPosition - 20,
      size: 10,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  // ABN
  if (options.companyABN) {
    page.drawText(`ABN: ${options.companyABN}`, {
      x: 50,
      y: yPosition - 35,
      size: 9,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  // Divider line
  page.drawLine({
    start: { x: 50, y: yPosition - 45 },
    end: { x: width - 50, y: yPosition - 45 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  return yPosition - 65;
}

function drawTitle(page: PDFPage, yPosition: number, title: string): number {
  page.drawText(title, {
    x: 50,
    y: yPosition,
    size: 20,
    color: rgb(0.1, 0.1, 0.1),
  });

  return yPosition - 35;
}

function drawSection(
  page: PDFPage,
  yPosition: number,
  sectionTitle: string,
  items: Array<{ label: string; value: string }>
): number {
  // Section title
  page.drawText(sectionTitle, {
    x: 50,
    y: yPosition,
    size: 12,
    color: rgb(0.1, 0.3, 0.8),
  });

  yPosition -= 20;

  // Section items
  items.forEach(({ label, value }) => {
    if (label) {
      page.drawText(`${label}:`, {
        x: 50,
        y: yPosition,
        size: 10,
        color: rgb(0.3, 0.3, 0.3),
      });

      page.drawText(value, {
        x: 150,
        y: yPosition,
        size: 10,
        color: rgb(0, 0, 0),
      });
    } else {
      // For multi-line values
      const lines = value.split("\n");
      lines.forEach((line) => {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 10,
          color: rgb(0, 0, 0),
        });
        yPosition -= 15;
      });
      return;
    }

    yPosition -= 15;
  });

  return yPosition - 10;
}

function drawMaterialsTable(
  page: PDFPage,
  yPosition: number,
  materials: any[]
): number {
  const { width } = page.getSize();

  // Table header
  page.drawText("Materials", {
    x: 50,
    y: yPosition,
    size: 12,
    color: rgb(0.1, 0.3, 0.8),
  });

  yPosition -= 20;

  // Column headers
  const columns = [
    { label: "Material", x: 50, width: 200 },
    { label: "Qty", x: 250, width: 50 },
    { label: "Unit", x: 300, width: 50 },
    { label: "Price", x: 350, width: 80 },
    { label: "Total", x: 430, width: 80 },
  ];

  columns.forEach(({ label, x }) => {
    page.drawText(label, {
      x,
      y: yPosition,
      size: 10,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  yPosition -= 15;

  // Table rows
  materials.forEach((material) => {
    page.drawText(material.name || "", {
      x: 50,
      y: yPosition,
      size: 9,
      color: rgb(0, 0, 0),
    });

    page.drawText((material.quantity || 0).toString(), {
      x: 250,
      y: yPosition,
      size: 9,
      color: rgb(0, 0, 0),
    });

    page.drawText(material.unit || "", {
      x: 300,
      y: yPosition,
      size: 9,
      color: rgb(0, 0, 0),
    });

    page.drawText(`$${(material.price || 0).toFixed(2)}`, {
      x: 350,
      y: yPosition,
      size: 9,
      color: rgb(0, 0, 0),
    });

    const total = (material.quantity || 0) * (material.price || 0);
    page.drawText(`$${total.toFixed(2)}`, {
      x: 430,
      y: yPosition,
      size: 9,
      color: rgb(0, 0, 0),
    });

    yPosition -= 15;
  });

  return yPosition - 10;
}

function drawLineItemsTable(
  page: PDFPage,
  yPosition: number,
  items: any[]
): number {
  const { width } = page.getSize();

  // Table header
  page.drawText("Line Items", {
    x: 50,
    y: yPosition,
    size: 12,
    color: rgb(0.1, 0.3, 0.8),
  });

  yPosition -= 20;

  // Column headers
  const columns = [
    { label: "Description", x: 50, width: 250 },
    { label: "Qty", x: 300, width: 50 },
    { label: "Unit Price", x: 350, width: 80 },
    { label: "Amount", x: 430, width: 80 },
  ];

  columns.forEach(({ label, x }) => {
    page.drawText(label, {
      x,
      y: yPosition,
      size: 10,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  yPosition -= 15;

  // Table rows
  items.forEach((item) => {
    page.drawText(item.description || "", {
      x: 50,
      y: yPosition,
      size: 9,
      color: rgb(0, 0, 0),
    });

    page.drawText((item.quantity || 0).toString(), {
      x: 300,
      y: yPosition,
      size: 9,
      color: rgb(0, 0, 0),
    });

    page.drawText(`$${(item.unitPrice || 0).toFixed(2)}`, {
      x: 350,
      y: yPosition,
      size: 9,
      color: rgb(0, 0, 0),
    });

    const total = (item.quantity || 0) * (item.unitPrice || 0);
    page.drawText(`$${total.toFixed(2)}`, {
      x: 430,
      y: yPosition,
      size: 9,
      color: rgb(0, 0, 0),
    });

    yPosition -= 15;
  });

  return yPosition - 10;
}

function drawCostSummary(
  page: PDFPage,
  yPosition: number,
  calculations: any
): number {
  page.drawText("Cost Summary", {
    x: 50,
    y: yPosition,
    size: 12,
    color: rgb(0.1, 0.3, 0.8),
  });

  yPosition -= 20;

  const items = [
    { label: "Materials", value: calculations.materials || 0 },
    { label: "Labour", value: calculations.labour || 0 },
    { label: "Subtotal", value: calculations.subtotal || 0 },
    { label: "GST (10%)", value: calculations.gst || 0 },
    { label: "Total", value: calculations.total || 0 },
  ];

  items.forEach(({ label, value }) => {
    const isTotal = label === "Total";
    const fontSize = isTotal ? 12 : 10;
    const color = isTotal ? rgb(0.1, 0.3, 0.8) : rgb(0, 0, 0);

    page.drawText(label, {
      x: 350,
      y: yPosition,
      size: fontSize,
      color,
    });

    page.drawText(`$${value.toFixed(2)}`, {
      x: 480,
      y: yPosition,
      size: fontSize,
      color,
    });

    yPosition -= 15;
  });

  return yPosition - 10;
}

function drawTotals(page: PDFPage, yPosition: number, quote: any): number {
  const subtotal = parseFloat(quote.subtotal || 0);
  const gst = parseFloat(quote.gst || 0);
  const total = parseFloat(quote.total || 0);

  // Divider line
  page.drawLine({
    start: { x: 350, y: yPosition },
    end: { x: 550, y: yPosition },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  yPosition -= 15;

  // Subtotal
  page.drawText("Subtotal:", {
    x: 350,
    y: yPosition,
    size: 10,
    color: rgb(0, 0, 0),
  });

  page.drawText(`$${subtotal.toFixed(2)}`, {
    x: 480,
    y: yPosition,
    size: 10,
    color: rgb(0, 0, 0),
  });

  yPosition -= 15;

  // GST
  page.drawText("GST (10%):", {
    x: 350,
    y: yPosition,
    size: 10,
    color: rgb(0, 0, 0),
  });

  page.drawText(`$${gst.toFixed(2)}`, {
    x: 480,
    y: yPosition,
    size: 10,
    color: rgb(0, 0, 0),
  });

  yPosition -= 20;

  // Total (bold)
  page.drawText("TOTAL:", {
    x: 350,
    y: yPosition,
    size: 12,
    color: rgb(0.1, 0.3, 0.8),
  });

  page.drawText(`$${total.toFixed(2)}`, {
    x: 480,
    y: yPosition,
    size: 12,
    color: rgb(0.1, 0.3, 0.8),
  });

  return yPosition - 30;
}

function drawFooter(page: PDFPage, options: PDFExportOptions): void {
  const { width, height } = page.getSize();

  // Footer text
  page.drawText(
    `Generated by Venturr | ${new Date().toLocaleDateString()}`,
    {
      x: 50,
      y: 30,
      size: 8,
      color: rgb(0.7, 0.7, 0.7),
    }
  );

  // Page number
  page.drawText("Page 1", {
    x: width - 100,
    y: 30,
    size: 8,
    color: rgb(0.7, 0.7, 0.7),
  });
}

