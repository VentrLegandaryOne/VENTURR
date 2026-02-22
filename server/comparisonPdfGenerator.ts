import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Quote, Verification } from "../drizzle/schema";

// Extend jsPDF type for autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

// VENTURR VALDT brand colors
const BRAND = {
  primary: [0, 131, 143] as [number, number, number],     // Teal #00838F
  secondary: [0, 96, 100] as [number, number, number],    // Dark teal #006064
  accent: [255, 171, 0] as [number, number, number],      // Amber #FFAB00
  success: [46, 125, 50] as [number, number, number],     // Green #2E7D32
  danger: [198, 40, 40] as [number, number, number],      // Red #C62828
  warning: [245, 124, 0] as [number, number, number],     // Orange #F57C00
  textDark: [33, 33, 33] as [number, number, number],     // #212121
  textMedium: [97, 97, 97] as [number, number, number],   // #616161
  textLight: [158, 158, 158] as [number, number, number], // #9E9E9E
  bgLight: [245, 245, 245] as [number, number, number],   // #F5F5F5
  white: [255, 255, 255] as [number, number, number],
};

interface QuoteData {
  id: number;
  label: string;
  contractor: string;
  totalAmount: number;
  overallScore: number;
  pricingScore: number;
  materialsScore: number;
  complianceScore: number;
  warrantyScore: number;
  potentialSavings: number;
  statusBadge: string;
  flags: string[];
  recommendations: string[];
}

interface ComparisonAnalysis {
  bestQuoteId: number;
  reasoning: string;
  keyDifferences: Array<{
    category: string;
    winner: number;
    difference: string;
  }>;
  estimatedSavings: number;
  detailedAnalysis: {
    pricing: string;
    materials: string;
    compliance: string;
    warranty: string;
  };
}

/**
 * Generate a branded PDF comparison report
 */
export function generateComparisonPdf(
  groupName: string,
  quotesData: QuoteData[],
  analysis: ComparisonAnalysis | null,
  generatedAt: Date = new Date()
): Buffer {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 0;

  // ─── Helper Functions ───
  function addNewPageIfNeeded(requiredSpace: number) {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
      addPageFooter();
    }
  }

  function addPageFooter() {
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.textLight);
    doc.text(
      `VENTURR VALDT — Confidential Comparison Report — Page ${pageCount}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  function drawScoreBar(x: number, y: number, width: number, score: number) {
    // Background bar
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(x, y, width, 4, 2, 2, "F");
    // Score bar
    const fillWidth = (score / 100) * width;
    if (score >= 70) {
      doc.setFillColor(...BRAND.success);
    } else if (score >= 40) {
      doc.setFillColor(...BRAND.warning);
    } else {
      doc.setFillColor(...BRAND.danger);
    }
    if (fillWidth > 0) {
      doc.roundedRect(x, y, Math.max(fillWidth, 4), 4, 2, 2, "F");
    }
  }

  function getStatusColor(badge: string): [number, number, number] {
    switch (badge) {
      case "green": return BRAND.success;
      case "red": return BRAND.danger;
      default: return BRAND.warning;
    }
  }

  // ─── PAGE 1: Cover ───
  // Header bar
  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, pageWidth, 45, "F");

  // Diagonal accent
  doc.setFillColor(...BRAND.secondary);
  doc.triangle(pageWidth - 60, 0, pageWidth, 0, pageWidth, 45, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.white);
  doc.text("VENTURR VALDT", margin, 20);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Quote Comparison Report", margin, 30);

  // Accent line
  doc.setFillColor(...BRAND.accent);
  doc.rect(margin, 38, 40, 2, "F");

  yPos = 55;

  // Report metadata
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.textMedium);
  doc.text(`Comparison: ${groupName}`, margin, yPos);
  yPos += 6;
  doc.text(`Generated: ${generatedAt.toLocaleDateString("en-AU", { 
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  })}`, margin, yPos);
  yPos += 6;
  doc.text(`Quotes Compared: ${quotesData.length}`, margin, yPos);
  yPos += 12;

  // ─── EXECUTIVE SUMMARY ───
  doc.setFillColor(...BRAND.bgLight);
  doc.roundedRect(margin, yPos, contentWidth, analysis ? 35 : 20, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.primary);
  doc.text("Executive Summary", margin + 5, yPos + 8);

  if (analysis) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.textDark);
    const summaryLines = doc.splitTextToSize(analysis.reasoning, contentWidth - 10);
    doc.text(summaryLines, margin + 5, yPos + 16);

    if (analysis.estimatedSavings > 0) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BRAND.success);
      doc.text(
        `Estimated Savings: $${(analysis.estimatedSavings || 0).toLocaleString("en-AU")}`,
        margin + 5,
        yPos + 30
      );
    }
    yPos += 42;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.textMedium);
    doc.text("AI analysis pending — scores compared below.", margin + 5, yPos + 16);
    yPos += 28;
  }

  // ─── QUOTE OVERVIEW TABLE ───
  addNewPageIfNeeded(60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.primary);
  doc.text("Quote Overview", margin, yPos);
  yPos += 8;

  const overviewHeaders = [["", "Contractor", "Amount", "Score", "Status"]];
  const overviewBody = quotesData.map((q, i) => {
    const isBest = analysis?.bestQuoteId === q.id;
    return [
      `Quote ${i + 1}${isBest ? " ★" : ""}`,
      q.contractor || "Unknown",
      `$${(q.totalAmount || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`,
      `${q.overallScore || 0}/100`,
      q.statusBadge ? q.statusBadge.charAt(0).toUpperCase() + q.statusBadge.slice(1) : "N/A",
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: overviewHeaders,
    body: overviewBody,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: BRAND.primary,
      textColor: BRAND.white,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: BRAND.textDark,
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 25 },
      2: { halign: "right" },
      3: { halign: "center" },
      4: { halign: "center" },
    },
    didParseCell: (data: any) => {
      // Color status cells
      if (data.column.index === 4 && data.section === "body") {
        const val = data.cell.raw?.toString().toLowerCase();
        if (val === "green") {
          data.cell.styles.textColor = BRAND.success;
          data.cell.styles.fontStyle = "bold";
        } else if (val === "red") {
          data.cell.styles.textColor = BRAND.danger;
          data.cell.styles.fontStyle = "bold";
        } else {
          data.cell.styles.textColor = BRAND.warning;
          data.cell.styles.fontStyle = "bold";
        }
      }
      // Highlight best quote row
      if (data.section === "body") {
        const quoteData = quotesData[data.row.index];
        if (quoteData && analysis?.bestQuoteId === quoteData.id) {
          data.cell.styles.fillColor = [232, 245, 233]; // Light green
        }
      }
    },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // ─── SCORE COMPARISON TABLE ───
  addNewPageIfNeeded(60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.primary);
  doc.text("Score Comparison", margin, yPos);
  yPos += 8;

  const scoreHeaders = [["Category", ...quotesData.map((_, i) => `Quote ${i + 1}`), "Winner"]];
  const categories = [
    { key: "overallScore", label: "Overall Score" },
    { key: "pricingScore", label: "Pricing" },
    { key: "materialsScore", label: "Materials" },
    { key: "complianceScore", label: "Compliance" },
    { key: "warrantyScore", label: "Warranty" },
  ];

  const scoreBody = categories.map((cat) => {
    const scores = quotesData.map((q) => (q as any)[cat.key] || 0);
    const maxScore = Math.max(...scores);
    const winnerIdx = scores.indexOf(maxScore);
    return [
      cat.label,
      ...scores.map((s: number) => `${s}/100`),
      maxScore > 0 ? `Quote ${winnerIdx + 1}` : "—",
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: scoreHeaders,
    body: scoreBody,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: BRAND.secondary,
      textColor: BRAND.white,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: BRAND.textDark,
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    columnStyles: {
      0: { fontStyle: "bold" },
    },
    didParseCell: (data: any) => {
      // Highlight winner column
      const lastCol = quotesData.length + 1;
      if (data.column.index === lastCol && data.section === "body") {
        data.cell.styles.textColor = BRAND.success;
        data.cell.styles.fontStyle = "bold";
      }
      // Highlight highest score in each row
      if (data.section === "body" && data.column.index > 0 && data.column.index <= quotesData.length) {
        const scoreStr = data.cell.raw?.toString().replace("/100", "");
        const score = parseInt(scoreStr || "0");
        if (score >= 70) {
          data.cell.styles.textColor = BRAND.success;
        } else if (score >= 40) {
          data.cell.styles.textColor = BRAND.warning;
        } else if (score > 0) {
          data.cell.styles.textColor = BRAND.danger;
        }
      }
    },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // ─── PRICING COMPARISON ───
  addNewPageIfNeeded(50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.primary);
  doc.text("Pricing Analysis", margin, yPos);
  yPos += 8;

  const amounts = quotesData.map((q) => q.totalAmount);
  const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const minAmount = Math.min(...amounts);
  const maxAmount = Math.max(...amounts);

  const pricingHeaders = [["", "Amount", "vs Average", "Potential Savings", "Verdict"]];
  const pricingBody = quotesData.map((q, i) => {
    const diff = q.totalAmount - avgAmount;
    const diffPct = avgAmount > 0 ? ((diff / avgAmount) * 100).toFixed(1) : "0";
    const isCheapest = q.totalAmount === minAmount;
    const isMostExpensive = q.totalAmount === maxAmount;
    return [
      `Quote ${i + 1}`,
      `$${(q.totalAmount || 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`,
      `${diff >= 0 ? "+" : ""}${diffPct}%`,
      (q.potentialSavings || 0) > 0 ? `$${(q.potentialSavings || 0).toLocaleString("en-AU")}` : "—",
      isCheapest ? "Best Price" : isMostExpensive ? "Most Expensive" : "Mid-range",
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: pricingHeaders,
    body: pricingBody,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: BRAND.primary,
      textColor: BRAND.white,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: BRAND.textDark,
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 22 },
      1: { halign: "right" },
      2: { halign: "center" },
      3: { halign: "right" },
      4: { halign: "center" },
    },
    didParseCell: (data: any) => {
      if (data.column.index === 4 && data.section === "body") {
        const val = data.cell.raw?.toString();
        if (val === "Best Price") {
          data.cell.styles.textColor = BRAND.success;
          data.cell.styles.fontStyle = "bold";
        } else if (val === "Most Expensive") {
          data.cell.styles.textColor = BRAND.danger;
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // ─── KEY DIFFERENCES ───
  if (analysis?.keyDifferences && analysis.keyDifferences.length > 0) {
    addNewPageIfNeeded(50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.primary);
    doc.text("Key Differences", margin, yPos);
    yPos += 8;

    const diffHeaders = [["Category", "Winner", "Analysis"]];
    const diffBody = analysis.keyDifferences.map((d) => {
      const winnerQuote = quotesData.find((q) => q.id === d.winner);
      const winnerLabel = winnerQuote
        ? `Quote ${quotesData.indexOf(winnerQuote) + 1}`
        : `Quote ID ${d.winner}`;
      return [
        d.category ? d.category.charAt(0).toUpperCase() + d.category.slice(1) : "General",
        winnerLabel,
        d.difference,
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: diffHeaders,
      body: diffBody,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: BRAND.secondary,
        textColor: BRAND.white,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: BRAND.textDark,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 28 },
        1: { cellWidth: 22, textColor: BRAND.success, fontStyle: "bold" },
        2: { cellWidth: "auto" },
      },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // ─── DETAILED ANALYSIS ───
  if (analysis?.detailedAnalysis) {
    addNewPageIfNeeded(80);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.primary);
    doc.text("Detailed Analysis", margin, yPos);
    yPos += 10;

    const sections = [
      { title: "Pricing Analysis", text: analysis.detailedAnalysis.pricing, color: BRAND.primary },
      { title: "Materials Assessment", text: analysis.detailedAnalysis.materials, color: BRAND.secondary },
      { title: "Compliance Review", text: analysis.detailedAnalysis.compliance, color: BRAND.success },
      { title: "Warranty Comparison", text: analysis.detailedAnalysis.warranty, color: BRAND.warning },
    ];

    for (const section of sections) {
      addNewPageIfNeeded(30);

      // Section header with accent bar
      doc.setFillColor(...section.color);
      doc.rect(margin, yPos, 3, 12, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...section.color);
      doc.text(section.title, margin + 6, yPos + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...BRAND.textDark);
      const lines = doc.splitTextToSize(section.text || "No analysis available.", contentWidth - 8);
      doc.text(lines, margin + 6, yPos + 12);
      yPos += 14 + lines.length * 4;
    }
  }

  // ─── RED FLAGS ───
  const allFlags = quotesData.flatMap((q, i) =>
    (q.flags || []).map((f) => ({ quote: `Quote ${i + 1}`, flag: f }))
  );

  if (allFlags.length > 0) {
    addNewPageIfNeeded(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.danger);
    doc.text("Red Flags & Warnings", margin, yPos);
    yPos += 8;

    const flagHeaders = [["Quote", "Issue"]];
    const flagBody = allFlags.map((f) => [f.quote, f.flag]);

    autoTable(doc, {
      startY: yPos,
      head: flagHeaders,
      body: flagBody,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: BRAND.danger,
        textColor: BRAND.white,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: BRAND.textDark,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 25 },
      },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // ─── RECOMMENDATIONS ───
  const allRecs = quotesData.flatMap((q, i) =>
    (q.recommendations || []).map((r) => ({ quote: `Quote ${i + 1}`, rec: r }))
  );

  if (allRecs.length > 0) {
    addNewPageIfNeeded(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.primary);
    doc.text("Recommendations", margin, yPos);
    yPos += 8;

    const recHeaders = [["Quote", "Recommendation"]];
    const recBody = allRecs.map((r) => [r.quote, r.rec]);

    autoTable(doc, {
      startY: yPos,
      head: recHeaders,
      body: recBody,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: BRAND.primary,
        textColor: BRAND.white,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: BRAND.textDark,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 25 },
      },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // ─── FOOTER on all pages ───
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Bottom bar
    doc.setFillColor(...BRAND.primary);
    doc.rect(0, pageHeight - 15, pageWidth, 15, "F");

    doc.setFontSize(8);
    doc.setTextColor(...BRAND.white);
    doc.text(
      `VENTURR VALDT — Confidential Comparison Report — Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 7,
      { align: "center" }
    );

    // Disclaimer on last page
    if (i === totalPages) {
      addNewPageIfNeeded(20);
      const disclaimerY = Math.min(yPos + 5, pageHeight - 25);
      doc.setFontSize(7);
      doc.setTextColor(...BRAND.textLight);
      doc.text(
        "Disclaimer: This report is generated by VENTURR VALDT's automated analysis system. While every effort is made to ensure accuracy,",
        margin,
        disclaimerY
      );
      doc.text(
        "this report should not be considered as professional financial or legal advice. Always consult qualified professionals before making decisions.",
        margin,
        disclaimerY + 3
      );
    }
  }

  // Return as Buffer
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

/**
 * Prepare quote data from database records for PDF generation
 */
export function prepareQuoteDataForPdf(
  quotes: Quote[],
  verifications: Verification[]
): QuoteData[] {
  return quotes.map((q, i) => {
    const verification = verifications.find((v) => v.quoteId === q.id);
    const extracted = q.extractedData as any;
    return {
      id: q.id,
      label: `Quote ${i + 1}`,
      contractor: extracted?.contractor || extracted?.company || "Unknown Contractor",
      totalAmount: extracted?.totalAmount || extracted?.total || 0,
      overallScore: verification?.overallScore || 0,
      pricingScore: verification?.pricingScore || 0,
      materialsScore: verification?.materialsScore || 0,
      complianceScore: verification?.complianceScore || 0,
      warrantyScore: verification?.warrantyScore || 0,
      potentialSavings: verification?.potentialSavings || 0,
      statusBadge: verification?.statusBadge || "amber",
      flags: Array.isArray(verification?.flags)
        ? (verification.flags as any[]).map((f: any) => typeof f === "string" ? f : f?.message || f?.description || JSON.stringify(f))
        : [],
      recommendations: Array.isArray(verification?.recommendations)
        ? (verification.recommendations as any[]).map((r: any) => typeof r === "string" ? r : r?.title || r?.description || JSON.stringify(r))
        : [],
    };
  });
}
