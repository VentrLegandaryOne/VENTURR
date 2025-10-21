/**
 * Import/Export Utility for Venturr Platform
 * Handles CSV/Excel import and export for materials, projects, and quotes
 */

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  data?: any[];
}

export interface ExportOptions {
  format: 'csv' | 'excel';
  filename: string;
  includeHeaders?: boolean;
}

// ============================================================================
// MATERIAL IMPORT/EXPORT
// ============================================================================

export interface MaterialImportRow {
  manufacturer: string;
  productName: string;
  category: 'roofing_sheet' | 'fastener' | 'flashing' | 'insulation' | 'accessory';
  profile?: string;
  bmt?: number;
  coverWidth?: number;
  minPitch?: number;
  pricePerUnit: number;
  unit?: string;
  windRating?: string;
  coastalSuitable?: boolean;
  balRatings?: string; // Comma-separated
  complianceStandards?: string; // Comma-separated
  installationNotes?: string;
}

export function validateMaterialRow(row: any, rowIndex: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!row.manufacturer || row.manufacturer.trim() === '') {
    errors.push(`Row ${rowIndex}: Manufacturer is required`);
  }
  
  if (!row.productName || row.productName.trim() === '') {
    errors.push(`Row ${rowIndex}: Product name is required`);
  }
  
  if (!row.category || !['roofing_sheet', 'fastener', 'flashing', 'insulation', 'accessory'].includes(row.category)) {
    errors.push(`Row ${rowIndex}: Invalid category. Must be one of: roofing_sheet, fastener, flashing, insulation, accessory`);
  }
  
  if (!row.pricePerUnit || isNaN(parseFloat(row.pricePerUnit))) {
    errors.push(`Row ${rowIndex}: Price per unit must be a valid number`);
  }
  
  // Optional numeric fields
  if (row.bmt && isNaN(parseFloat(row.bmt))) {
    errors.push(`Row ${rowIndex}: BMT must be a valid number`);
  }
  
  if (row.coverWidth && isNaN(parseFloat(row.coverWidth))) {
    errors.push(`Row ${rowIndex}: Cover width must be a valid number`);
  }
  
  if (row.minPitch && isNaN(parseInt(row.minPitch))) {
    errors.push(`Row ${rowIndex}: Min pitch must be a valid integer`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function parseMaterialImportRow(row: any): MaterialImportRow {
  return {
    manufacturer: row.manufacturer?.trim() || '',
    productName: row.productName?.trim() || '',
    category: row.category?.toLowerCase().trim() as any,
    profile: row.profile?.trim() || undefined,
    bmt: row.bmt ? parseFloat(row.bmt) : undefined,
    coverWidth: row.coverWidth ? parseFloat(row.coverWidth) : undefined,
    minPitch: row.minPitch ? parseInt(row.minPitch) : undefined,
    pricePerUnit: parseFloat(row.pricePerUnit),
    unit: row.unit?.trim() || 'm²',
    windRating: row.windRating?.trim() || undefined,
    coastalSuitable: row.coastalSuitable === 'true' || row.coastalSuitable === '1' || row.coastalSuitable === true,
    balRatings: row.balRatings?.trim() || undefined,
    complianceStandards: row.complianceStandards?.trim() || undefined,
    installationNotes: row.installationNotes?.trim() || undefined,
  };
}

export function getMaterialImportTemplate(): string[][] {
  return [
    [
      'manufacturer',
      'productName',
      'category',
      'profile',
      'bmt',
      'coverWidth',
      'minPitch',
      'pricePerUnit',
      'unit',
      'windRating',
      'coastalSuitable',
      'balRatings',
      'complianceStandards',
      'installationNotes'
    ],
    [
      'Lysaght',
      'Klip-Lok 700',
      'roofing_sheet',
      'Klip-Lok 700',
      '0.42',
      '0.70',
      '1',
      '52.00',
      'm²',
      'N3',
      'true',
      'BAL-12.5,BAL-19,BAL-29',
      'AS 1562.1,AS/NZS 1170.2',
      'Concealed fix system with proprietary clips'
    ],
    [
      'Stramit',
      'Monoclad 700',
      'roofing_sheet',
      'Monoclad',
      '0.42',
      '0.70',
      '1',
      '54.00',
      'm²',
      'N4',
      'true',
      'BAL-12.5,BAL-19,BAL-29,BAL-40',
      'AS 1562.1,AS/NZS 1170.2',
      'Concealed fix with enhanced wind resistance'
    ],
  ];
}

// ============================================================================
// PROJECT IMPORT/EXPORT
// ============================================================================

export interface ProjectImportRow {
  projectNumber?: string;
  name: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  propertyAddress?: string;
  propertyType?: string;
  status?: 'draft' | 'active' | 'quoted' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

export function validateProjectRow(row: any, rowIndex: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!row.name || row.name.trim() === '') {
    errors.push(`Row ${rowIndex}: Project name is required`);
  }
  
  if (!row.clientName || row.clientName.trim() === '') {
    errors.push(`Row ${rowIndex}: Client name is required`);
  }
  
  if (row.clientEmail && !isValidEmail(row.clientEmail)) {
    errors.push(`Row ${rowIndex}: Invalid email format`);
  }
  
  if (row.status && !['draft', 'active', 'quoted', 'approved', 'in_progress', 'completed', 'cancelled'].includes(row.status)) {
    errors.push(`Row ${rowIndex}: Invalid status`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function parseProjectImportRow(row: any): ProjectImportRow {
  return {
    projectNumber: row.projectNumber?.trim() || undefined,
    name: row.name?.trim() || '',
    clientName: row.clientName?.trim() || '',
    clientEmail: row.clientEmail?.trim() || undefined,
    clientPhone: row.clientPhone?.trim() || undefined,
    propertyAddress: row.propertyAddress?.trim() || undefined,
    propertyType: row.propertyType?.trim() || undefined,
    status: row.status?.toLowerCase().trim() as any || 'draft',
    priority: row.priority?.toLowerCase().trim() as any || 'medium',
    notes: row.notes?.trim() || undefined,
  };
}

export function getProjectImportTemplate(): string[][] {
  return [
    [
      'projectNumber',
      'name',
      'clientName',
      'clientEmail',
      'clientPhone',
      'propertyAddress',
      'propertyType',
      'status',
      'priority',
      'notes'
    ],
    [
      'PRJ-001',
      'Residential Roof Replacement',
      'John Smith',
      'john@example.com',
      '0412345678',
      '123 Main St, Sydney NSW 2000',
      'Residential',
      'active',
      'high',
      'Client requires Colorbond steel roof'
    ],
    [
      'PRJ-002',
      'Commercial Warehouse Roofing',
      'ABC Company Pty Ltd',
      'info@abccompany.com.au',
      '0298765432',
      '456 Industrial Dr, Parramatta NSW 2150',
      'Commercial',
      'quoted',
      'medium',
      'Large commercial project, requires engineering approval'
    ],
  ];
}

// ============================================================================
// QUOTE IMPORT/EXPORT
// ============================================================================

export interface QuoteImportRow {
  quoteNumber?: string;
  projectName: string;
  clientName: string;
  clientEmail?: string;
  lineItemDescription: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  terms?: string;
  notes?: string;
  validUntil?: string;
}

export function validateQuoteRow(row: any, rowIndex: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!row.projectName || row.projectName.trim() === '') {
    errors.push(`Row ${rowIndex}: Project name is required`);
  }
  
  if (!row.clientName || row.clientName.trim() === '') {
    errors.push(`Row ${rowIndex}: Client name is required`);
  }
  
  if (!row.lineItemDescription || row.lineItemDescription.trim() === '') {
    errors.push(`Row ${rowIndex}: Line item description is required`);
  }
  
  if (!row.quantity || isNaN(parseFloat(row.quantity))) {
    errors.push(`Row ${rowIndex}: Quantity must be a valid number`);
  }
  
  if (!row.unitPrice || isNaN(parseFloat(row.unitPrice))) {
    errors.push(`Row ${rowIndex}: Unit price must be a valid number`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function getQuoteImportTemplate(): string[][] {
  return [
    [
      'quoteNumber',
      'projectName',
      'clientName',
      'clientEmail',
      'lineItemDescription',
      'quantity',
      'unit',
      'unitPrice',
      'terms',
      'notes',
      'validUntil'
    ],
    [
      'Q-001',
      'Residential Roof Replacement',
      'John Smith',
      'john@example.com',
      'Lysaght Klip-Lok 700 0.42mm COLORBOND® - Supply and Install',
      '85.5',
      'm²',
      '165.00',
      'Payment: 50% deposit, 50% on completion. Warranty: 10 years materials, 5 years workmanship.',
      'Includes all flashings and gutters',
      '2025-02-15'
    ],
  ];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function generateCSV(data: any[], headers: string[]): string {
  const rows = [headers];
  
  data.forEach(item => {
    const row = headers.map(header => {
      const value = item[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    });
    rows.push(row);
  });
  
  return rows.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')
  ).join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

