# Venturr Platform - CSV/Excel Import/Export Implementation Plan

**Date:** October 21, 2025  
**Feature:** Comprehensive Import/Export System  
**Priority:** High  
**Estimated Duration:** 2-3 days

---

## Executive Summary

This document outlines the implementation plan for a robust CSV/Excel import and export system for the Venturr platform. The system will enable users to bulk manage materials, projects, and quotes through spreadsheet workflows, with comprehensive validation, error reporting, and progress indicators.

---

## Business Requirements

### User Stories

**As a roofing contractor, I want to:**
1. Export my materials database to Excel so I can review and update pricing offline
2. Import updated material prices from a spreadsheet so I don't have to update them one by one
3. Export all my projects to CSV so I can analyze them in Excel or import to accounting software
4. Import multiple projects from a spreadsheet template so I can batch-create jobs
5. Export quotes to Excel so I can share them with clients who prefer spreadsheet format
6. Download template files so I know the correct format for imports
7. See detailed error messages when my import file has issues so I can fix them
8. Track import progress so I know how long bulk operations will take

### Success Criteria

- Users can export materials, projects, and quotes in both CSV and Excel formats
- Users can download template files with correct headers and example data
- Import validation catches format errors, missing required fields, and invalid data
- Error reporting shows specific row numbers and clear error messages
- Progress indicators display during long import/export operations
- Large datasets (1000+ rows) process efficiently without timeout
- Exported files maintain data integrity and can be re-imported without modification

---

## Technical Architecture

### Technology Stack

**Server-Side:**
- **CSV Processing:** `papaparse` (already installed)
- **Excel Processing:** `xlsx` (SheetJS) - needs installation
- **Validation:** `zod` (already installed)
- **File Upload:** `multer` or built-in tRPC file handling
- **Streaming:** Node.js streams for large files

**Client-Side:**
- **File Upload:** HTML5 File API
- **Progress Tracking:** React state + tRPC subscriptions
- **Download:** Blob API + FileSaver.js
- **UI Components:** shadcn/ui (already installed)

### Data Flow

```
EXPORT FLOW:
User clicks Export → Select format (CSV/Excel) → Server queries database → 
Generate file → Stream to client → Browser downloads file

IMPORT FLOW:
User uploads file → Client validates file type → Send to server → 
Parse file → Validate data → Show preview → User confirms → 
Batch insert to database → Return success/error report
```

---

## Implementation Plan

### Phase 1: Foundation (Day 1 Morning)

#### 1.1 Install Dependencies

```bash
pnpm add xlsx
pnpm add -D @types/papaparse
```

#### 1.2 Create Shared Types

**File:** `/shared/importExportTypes.ts`

```typescript
export interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
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
```

#### 1.3 Create Utility Functions

**File:** `/server/utils/csvExport.ts`

```typescript
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export function generateCSV<T>(data: T[], headers: string[]): string {
  return Papa.unparse({
    fields: headers,
    data: data
  });
}

export function generateExcel<T>(
  data: T[], 
  sheetName: string, 
  headers: string[]
): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export function parseCSV<T>(fileContent: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => resolve(results.data),
      error: (error) => reject(error)
    });
  });
}

export function parseExcel<T>(buffer: Buffer, sheetName?: string): T[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = sheetName 
    ? workbook.Sheets[sheetName] 
    : workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json<T>(sheet);
}
```

**File:** `/server/utils/importValidator.ts`

```typescript
import { z } from 'zod';
import { ImportError, ImportResult } from '@/shared/importExportTypes';

export class ImportValidator<T> {
  private errors: ImportError[] = [];
  private warnings: ImportWarning[] = [];

  constructor(private schema: z.ZodSchema<T>) {}

  validate(data: any[], rowOffset: number = 2): ImportResult {
    this.errors = [];
    this.warnings = [];
    const validatedData: T[] = [];

    data.forEach((row, index) => {
      const rowNumber = index + rowOffset; // Account for header row
      
      try {
        const validated = this.schema.parse(row);
        validatedData.push(validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            this.errors.push({
              row: rowNumber,
              field: err.path.join('.'),
              value: row[err.path[0]],
              message: err.message,
              severity: 'error'
            });
          });
        }
      }
    });

    return {
      success: this.errors.length === 0,
      totalRows: data.length,
      successCount: validatedData.length,
      errorCount: this.errors.length,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  addWarning(row: number, field: string, message: string) {
    this.warnings.push({ row, field, message });
  }
}
```

---

### Phase 2: Materials Import/Export (Day 1 Afternoon)

#### 2.1 Server-Side Implementation

**File:** `/server/routers.ts` (add to materials router)

```typescript
// Export materials
export: protectedProcedure
  .input(z.object({
    format: z.enum(['csv', 'xlsx']),
    filters: z.object({
      category: z.string().optional(),
      manufacturer: z.string().optional()
    }).optional()
  }))
  .mutation(async ({ input, ctx }) => {
    const { format, filters } = input;
    
    // Query materials with filters
    let query = db.select().from(materials);
    if (filters?.category) {
      query = query.where(eq(materials.category, filters.category));
    }
    if (filters?.manufacturer) {
      query = query.where(eq(materials.manufacturer, filters.manufacturer));
    }
    
    const data = await query;
    
    // Transform to export format
    const exportData = data.map(m => ({
      name: m.name,
      category: m.category,
      manufacturer: m.manufacturer,
      profile: m.profile,
      thickness: m.thickness,
      coating: m.coating,
      pricePerUnit: m.pricePerUnit,
      unit: m.unit,
      coverWidth: m.coverWidth,
      minPitch: m.minPitch,
      maxSpan: m.maxSpan
    }));
    
    const headers = [
      'name', 'category', 'manufacturer', 'profile', 
      'thickness', 'coating', 'pricePerUnit', 'unit',
      'coverWidth', 'minPitch', 'maxSpan'
    ];
    
    if (format === 'csv') {
      const csv = generateCSV(exportData, headers);
      return {
        content: csv,
        filename: `materials-${new Date().toISOString().split('T')[0]}.csv`,
        mimeType: 'text/csv'
      };
    } else {
      const excel = generateExcel(exportData, 'Materials', headers);
      return {
        content: excel.toString('base64'),
        filename: `materials-${new Date().toISOString().split('T')[0]}.xlsx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
    }
  }),

// Download template
downloadTemplate: protectedProcedure
  .input(z.object({
    type: z.enum(['materials', 'projects', 'quotes']),
    format: z.enum(['csv', 'xlsx'])
  }))
  .mutation(async ({ input }) => {
    const templates = {
      materials: [
        {
          name: 'Lysaght Klip-Lok 700 0.42mm COLORBOND',
          category: 'Roofing',
          manufacturer: 'Lysaght',
          profile: 'Klip-Lok 700',
          thickness: '0.42',
          coating: 'COLORBOND',
          pricePerUnit: 52,
          unit: 'm²',
          coverWidth: 0.7,
          minPitch: 1,
          maxSpan: 1200
        }
      ],
      projects: [
        {
          title: 'Sample Residential Roof',
          propertyType: 'Residential',
          address: '123 Main St, Sydney NSW 2000',
          clientName: 'John Smith',
          clientEmail: 'john@example.com',
          clientPhone: '0412345678',
          status: 'Draft',
          location: 'Sydney, NSW',
          coastalDistance: 5,
          windRegion: 'Region B',
          balRating: 'BAL-LOW'
        }
      ],
      quotes: [
        {
          projectTitle: 'Sample Residential Roof',
          itemDescription: 'Roofing Material',
          quantity: 100,
          unit: 'm²',
          unitPrice: 52,
          category: 'Materials',
          notes: 'Includes delivery'
        }
      ]
    };
    
    const data = templates[input.type];
    const headers = Object.keys(data[0]);
    
    if (input.format === 'csv') {
      const csv = generateCSV(data, headers);
      return {
        content: csv,
        filename: `${input.type}-template.csv`,
        mimeType: 'text/csv'
      };
    } else {
      const excel = generateExcel(data, input.type, headers);
      return {
        content: excel.toString('base64'),
        filename: `${input.type}-template.xlsx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
    }
  }),

// Import materials
import: protectedProcedure
  .input(z.object({
    fileContent: z.string(),
    format: z.enum(['csv', 'xlsx']),
    mode: z.enum(['append', 'replace', 'update'])
  }))
  .mutation(async ({ input, ctx }) => {
    const { fileContent, format, mode } = input;
    
    // Parse file
    let parsedData;
    if (format === 'csv') {
      parsedData = await parseCSV<MaterialImportRow>(fileContent);
    } else {
      const buffer = Buffer.from(fileContent, 'base64');
      parsedData = parseExcel<MaterialImportRow>(buffer);
    }
    
    // Validate data
    const materialSchema = z.object({
      name: z.string().min(1, 'Name is required'),
      category: z.string().min(1, 'Category is required'),
      manufacturer: z.string().min(1, 'Manufacturer is required'),
      profile: z.string().min(1, 'Profile is required'),
      thickness: z.string().min(1, 'Thickness is required'),
      coating: z.string().min(1, 'Coating is required'),
      pricePerUnit: z.number().positive('Price must be positive'),
      unit: z.string().min(1, 'Unit is required'),
      coverWidth: z.number().positive().optional(),
      minPitch: z.number().positive().optional(),
      maxSpan: z.number().positive().optional()
    });
    
    const validator = new ImportValidator(materialSchema);
    const validationResult = validator.validate(parsedData);
    
    if (!validationResult.success) {
      return validationResult;
    }
    
    // Handle import mode
    if (mode === 'replace') {
      await db.delete(materials).where(eq(materials.userId, ctx.user.id));
    }
    
    // Batch insert
    const insertData = parsedData.map(row => ({
      id: nanoid(),
      userId: ctx.user.id,
      ...row,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    await db.insert(materials).values(insertData);
    
    return {
      ...validationResult,
      success: true
    };
  })
```

#### 2.2 Client-Side Implementation

**File:** `/client/src/pages/MaterialsLibrary.tsx`

```typescript
export default function MaterialsLibrary() {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace' | 'update'>('append');
  const [validationResult, setValidationResult] = useState<ImportResult | null>(null);
  
  const exportMutation = trpc.materials.export.useMutation();
  const importMutation = trpc.materials.import.useMutation();
  const downloadTemplateMutation = trpc.materials.downloadTemplate.useMutation();
  
  const handleExport = async (format: 'csv' | 'xlsx') => {
    const result = await exportMutation.mutateAsync({ format });
    
    // Create blob and download
    const blob = format === 'csv' 
      ? new Blob([result.content], { type: result.mimeType })
      : new Blob([Buffer.from(result.content, 'base64')], { type: result.mimeType });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${format.toUpperCase()} successfully`);
  };
  
  const handleDownloadTemplate = async (format: 'csv' | 'xlsx') => {
    const result = await downloadTemplateMutation.mutateAsync({ 
      type: 'materials', 
      format 
    });
    
    const blob = format === 'csv' 
      ? new Blob([result.content], { type: result.mimeType })
      : new Blob([Buffer.from(result.content, 'base64')], { type: result.mimeType });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setValidationResult(null);
    }
  };
  
  const handleImportValidate = async () => {
    if (!importFile) return;
    
    const fileContent = await readFileAsText(importFile);
    const format = importFile.name.endsWith('.csv') ? 'csv' : 'xlsx';
    
    const result = await importMutation.mutateAsync({
      fileContent: format === 'csv' ? fileContent : await readFileAsBase64(importFile),
      format,
      mode: importMode
    });
    
    setValidationResult(result);
    
    if (result.success) {
      toast.success(`Successfully imported ${result.successCount} materials`);
      setImportDialogOpen(false);
      setImportFile(null);
    } else {
      toast.error(`Import failed with ${result.errorCount} errors`);
    }
  };
  
  return (
    <div>
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export Materials</CardTitle>
          <CardDescription>Download your materials database</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => handleExport('xlsx')}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </CardContent>
      </Card>
      
      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle>Import Materials</CardTitle>
          <CardDescription>Upload a CSV or Excel file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleDownloadTemplate('csv')}>
              <FileText className="mr-2 h-4 w-4" />
              Download CSV Template
            </Button>
            <Button variant="outline" onClick={() => handleDownloadTemplate('xlsx')}>
              <FileText className="mr-2 h-4 w-4" />
              Download Excel Template
            </Button>
          </div>
          
          <Button onClick={() => setImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import Materials
          </Button>
        </CardContent>
      </Card>
      
      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Materials</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file to import materials
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Import Mode</Label>
              <Select value={importMode} onValueChange={(v) => setImportMode(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="append">Append (add to existing)</SelectItem>
                  <SelectItem value="replace">Replace (delete all existing)</SelectItem>
                  <SelectItem value="update">Update (merge by name)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Select File</Label>
              <Input 
                type="file" 
                accept=".csv,.xlsx" 
                onChange={handleFileSelect}
              />
            </div>
            
            {validationResult && !validationResult.success && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Errors</AlertTitle>
                <AlertDescription>
                  <div className="max-h-60 overflow-y-auto">
                    {validationResult.errors.map((error, i) => (
                      <div key={i} className="text-sm">
                        Row {error.row}: {error.field} - {error.message}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImportValidate}
              disabled={!importFile || importMutation.isLoading}
            >
              {importMutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

### Phase 3: Projects Import/Export (Day 2 Morning)

Similar implementation to materials but with project-specific schema:

```typescript
const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  propertyType: z.enum(['Residential', 'Commercial', 'Industrial']),
  address: z.string().min(1, 'Address is required'),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional(),
  clientPhone: z.string().optional(),
  status: z.enum(['Draft', 'Active', 'Completed', 'Cancelled']),
  location: z.string().optional(),
  coastalDistance: z.number().positive().optional(),
  windRegion: z.string().optional(),
  balRating: z.string().optional()
});
```

---

### Phase 4: Quotes Import/Export (Day 2 Afternoon)

Quote export will include:
- Project reference
- Line items with descriptions, quantities, prices
- Subtotals, GST, totals
- Client information

Import will support:
- Creating new quotes from templates
- Updating existing quotes
- Bulk quote generation from project list

---

### Phase 5: Advanced Features (Day 3)

#### 5.1 Progress Indicators

**Server-Side Streaming:**

```typescript
import: protectedProcedure
  .input(z.object({
    fileContent: z.string(),
    format: z.enum(['csv', 'xlsx']),
    mode: z.enum(['append', 'replace', 'update'])
  }))
  .subscription(async function* ({ input, ctx }) {
    const parsedData = await parseFile(input.fileContent, input.format);
    const batchSize = 100;
    
    for (let i = 0; i < parsedData.length; i += batchSize) {
      const batch = parsedData.slice(i, i + batchSize);
      await processBatch(batch);
      
      yield {
        progress: Math.round(((i + batch.length) / parsedData.length) * 100),
        processed: i + batch.length,
        total: parsedData.length
      };
    }
  })
```

**Client-Side Progress Bar:**

```typescript
const [progress, setProgress] = useState(0);

trpc.materials.import.useSubscription(
  { fileContent, format, mode },
  {
    onData: (data) => {
      setProgress(data.progress);
    }
  }
);

return (
  <Progress value={progress} className="w-full" />
);
```

#### 5.2 Duplicate Detection

```typescript
function detectDuplicates(data: MaterialImportRow[]): ImportWarning[] {
  const warnings: ImportWarning[] = [];
  const seen = new Map<string, number>();
  
  data.forEach((row, index) => {
    const key = `${row.manufacturer}-${row.profile}-${row.thickness}`;
    if (seen.has(key)) {
      warnings.push({
        row: index + 2,
        field: 'name',
        message: `Duplicate material found (first occurrence at row ${seen.get(key)})`
      });
    } else {
      seen.set(key, index + 2);
    }
  });
  
  return warnings;
}
```

#### 5.3 Data Transformation

```typescript
function transformImportData(row: any): MaterialImportRow {
  return {
    name: row.name?.trim(),
    category: capitalizeWords(row.category),
    manufacturer: capitalizeWords(row.manufacturer),
    profile: row.profile?.trim(),
    thickness: normalizeThickness(row.thickness),
    coating: row.coating?.toUpperCase(),
    pricePerUnit: parseFloat(row.pricePerUnit),
    unit: row.unit?.toLowerCase(),
    coverWidth: row.coverWidth ? parseFloat(row.coverWidth) : undefined,
    minPitch: row.minPitch ? parseFloat(row.minPitch) : undefined,
    maxSpan: row.maxSpan ? parseFloat(row.maxSpan) : undefined
  };
}
```

#### 5.4 Error Recovery

```typescript
// Allow users to download error report
function generateErrorReport(result: ImportResult): string {
  const errorRows = result.errors.map(err => ({
    Row: err.row,
    Field: err.field,
    Value: err.value,
    Error: err.message
  }));
  
  return generateCSV(errorRows, ['Row', 'Field', 'Value', 'Error']);
}

// Download error report button
<Button onClick={() => {
  const csv = generateErrorReport(validationResult);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'import-errors.csv';
  a.click();
}}>
  Download Error Report
</Button>
```

---

## UI/UX Design

### Import/Export Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ Materials Library                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Export Materials                                     │ │
│ │ Download your materials database                     │ │
│ │                                                       │ │
│ │ [Export CSV]  [Export Excel]                         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Import Materials                                     │ │
│ │ Upload a CSV or Excel file                           │ │
│ │                                                       │ │
│ │ [Download CSV Template]  [Download Excel Template]   │ │
│ │                                                       │ │
│ │ [Import Materials]                                   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Materials Table                                      │ │
│ │ ┌──────────┬──────────┬──────────┬──────────┬─────┐ │ │
│ │ │ Name     │ Category │ Manufact │ Price    │ ... │ │ │
│ │ ├──────────┼──────────┼──────────┼──────────┼─────┤ │ │
│ │ │ ...      │ ...      │ ...      │ ...      │ ... │ │ │
│ │ └──────────┴──────────┴──────────┴──────────┴─────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Import Dialog

```
┌─────────────────────────────────────────────────────────┐
│ Import Materials                                    [X]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Import Mode:                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Append (add to existing)                         ▼  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Select File:                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ materials.xlsx                           [Browse]   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ⚠ Validation Errors (3)                             │ │
│ │                                                      │ │
│ │ Row 5: pricePerUnit - Must be a positive number     │ │
│ │ Row 12: category - Invalid category                 │ │
│ │ Row 18: manufacturer - Manufacturer is required     │ │
│ │                                                      │ │
│ │ [Download Error Report]                             │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│                                    [Cancel]  [Import]    │
└─────────────────────────────────────────────────────────┘
```

---

## Testing Plan

### Unit Tests

```typescript
describe('CSV Export', () => {
  it('should generate valid CSV from materials data', () => {
    const data = [{ name: 'Test', price: 50 }];
    const csv = generateCSV(data, ['name', 'price']);
    expect(csv).toContain('name,price');
    expect(csv).toContain('Test,50');
  });
});

describe('Import Validation', () => {
  it('should detect missing required fields', () => {
    const data = [{ name: 'Test' }]; // missing price
    const validator = new ImportValidator(materialSchema);
    const result = validator.validate(data);
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
  });
  
  it('should detect invalid data types', () => {
    const data = [{ name: 'Test', pricePerUnit: 'invalid' }];
    const validator = new ImportValidator(materialSchema);
    const result = validator.validate(data);
    expect(result.errors[0].field).toBe('pricePerUnit');
  });
});
```

### Integration Tests

```typescript
describe('Materials Import/Export E2E', () => {
  it('should export materials and re-import without errors', async () => {
    // Create test materials
    await createTestMaterials(10);
    
    // Export
    const exportResult = await exportMaterials({ format: 'csv' });
    
    // Clear database
    await clearMaterials();
    
    // Import
    const importResult = await importMaterials({
      fileContent: exportResult.content,
      format: 'csv',
      mode: 'append'
    });
    
    expect(importResult.success).toBe(true);
    expect(importResult.successCount).toBe(10);
  });
});
```

---

## Performance Considerations

### Large File Handling

**Streaming for Files > 10MB:**

```typescript
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

async function processLargeImport(fileStream: Readable) {
  const batchSize = 1000;
  let batch: any[] = [];
  
  await pipeline(
    fileStream,
    Papa.parse(Papa.NODE_STREAM_INPUT, { header: true }),
    async function* (source) {
      for await (const row of source) {
        batch.push(row);
        
        if (batch.length >= batchSize) {
          await processBatch(batch);
          batch = [];
          yield { processed: batch.length };
        }
      }
      
      if (batch.length > 0) {
        await processBatch(batch);
      }
    }
  );
}
```

### Database Optimization

```typescript
// Use batch inserts instead of individual inserts
async function batchInsert(data: any[], batchSize = 100) {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await db.insert(materials).values(batch);
  }
}

// Use transactions for atomicity
async function importWithTransaction(data: any[]) {
  await db.transaction(async (tx) => {
    await tx.delete(materials); // if replace mode
    await tx.insert(materials).values(data);
  });
}
```

---

## Security Considerations

### File Upload Validation

```typescript
// Validate file size (max 10MB)
if (file.size > 10 * 1024 * 1024) {
  throw new Error('File size exceeds 10MB limit');
}

// Validate file type
const allowedTypes = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}

// Sanitize file content
function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    return value.replace(/[<>]/g, ''); // Remove HTML tags
  }
  return value;
}
```

### Rate Limiting

```typescript
// Limit import operations to 5 per hour per user
const importRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many import operations, please try again later'
});
```

---

## Deployment Checklist

- [ ] Install `xlsx` package
- [ ] Create import/export utility functions
- [ ] Add import/export mutations to materials router
- [ ] Add import/export mutations to projects router
- [ ] Add import/export mutations to quotes router
- [ ] Create template generation functions
- [ ] Build import/export UI components
- [ ] Add progress indicators
- [ ] Implement validation error display
- [ ] Add duplicate detection
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Test with large files (1000+ rows)
- [ ] Test error scenarios
- [ ] Update user documentation
- [ ] Create video tutorials

---

## Success Metrics

### Adoption Metrics
- Percentage of users who export data within first week
- Percentage of users who import data within first month
- Average file size of imports
- Average number of rows imported per operation

### Performance Metrics
- Import processing time for 100 rows: < 2 seconds
- Import processing time for 1000 rows: < 10 seconds
- Export generation time for 100 rows: < 1 second
- Export generation time for 1000 rows: < 5 seconds

### Quality Metrics
- Import success rate: > 95%
- Validation accuracy: > 99%
- Data integrity after round-trip (export → import): 100%

---

## Future Enhancements

### Phase 2 Features
1. **Scheduled Exports:** Automatic daily/weekly exports to email or cloud storage
2. **API Integration:** Direct import from supplier APIs (Lysaght, Stramit, Metroll)
3. **Mapping Wizard:** Visual column mapping for non-standard formats
4. **Data Transformation Rules:** Custom transformation rules for imports
5. **Version History:** Track changes from imports with rollback capability
6. **Collaborative Import:** Multiple users can review and approve imports
7. **Smart Matching:** AI-powered duplicate detection and merging
8. **Multi-Sheet Support:** Import multiple entity types from single Excel file

---

## Conclusion

This implementation plan provides a comprehensive roadmap for building a robust CSV/Excel import/export system for the Venturr platform. The system will enable users to efficiently manage bulk data operations while maintaining data integrity and providing excellent user experience through validation, error reporting, and progress tracking.

**Estimated Timeline:** 2-3 days  
**Complexity:** Medium  
**Dependencies:** xlsx package  
**Risk Level:** Low

The implementation follows industry best practices for file handling, validation, and user feedback, ensuring a production-ready feature that will significantly enhance the platform's usability for roofing contractors managing large material databases and project portfolios.

