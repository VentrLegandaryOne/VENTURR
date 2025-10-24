import { z } from 'zod';
import { ImportError, ImportWarning, ImportResult } from '../../shared/importExportTypes';

export class ImportValidator<T> {
  private errors: ImportError[] = [];
  private warnings: ImportWarning[] = [];

  constructor(private schema: z.ZodSchema<T>) {}

  validate(data: any[], rowOffset: number = 2): { result: ImportResult; validatedData: T[] } {
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
          error.issues.forEach((err: z.ZodIssue) => {
            this.errors.push({
              row: rowNumber,
              field: err.path.join('.'),
              value: row[err.path[0] as string],
              message: err.message,
              severity: 'error'
            });
          });
        }
      }
    });

    return {
      result: {
        success: this.errors.length === 0,
        totalRows: data.length,
        successCount: validatedData.length,
        errorCount: this.errors.length,
        warningCount: this.warnings.length,
        errors: this.errors,
        warnings: this.warnings
      },
      validatedData
    };
  }

  addWarning(row: number, field: string, message: string) {
    this.warnings.push({ row, field, message });
  }

  detectDuplicates(data: any[], keyFields: string[]): ImportWarning[] {
    const warnings: ImportWarning[] = [];
    const seen = new Map<string, number>();
    
    data.forEach((row, index) => {
      const key = keyFields.map(field => row[field]).join('|');
      if (seen.has(key)) {
        warnings.push({
          row: index + 2,
          field: keyFields.join(', '),
          message: `Duplicate entry found (first occurrence at row ${seen.get(key)})`
        });
      } else {
        seen.set(key, index + 2);
      }
    });
    
    this.warnings.push(...warnings);
    return warnings;
  }
}

