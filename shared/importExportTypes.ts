export interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  warningCount: number;
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ImportError {
  row: number;
  field: string;
  value: any;
  message: string;
  severity: 'error' | 'warning';
}

export interface ImportWarning {
  row: number;
  field: string;
  message: string;
}

export interface ExportOptions {
  format: 'csv' | 'xlsx';
  includeHeaders: boolean;
  dateFormat?: string;
  currencyFormat?: string;
}

export interface MaterialImportRow {
  name: string;
  category: string;
  manufacturer: string;
  profile: string;
  thickness: string;
  coating: string;
  pricePerUnit: number;
  unit: string;
  coverWidth?: number;
  minPitch?: number;
  maxSpan?: number;
}

export interface ProjectImportRow {
  title: string;
  propertyType: string;
  address: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  status: string;
  location?: string;
  coastalDistance?: number;
  windRegion?: string;
  balRating?: string;
}

export interface QuoteImportRow {
  projectTitle: string;
  itemDescription: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  category: string;
  notes?: string;
}

export interface ExportResult {
  content: string;
  filename: string;
  mimeType: string;
}

