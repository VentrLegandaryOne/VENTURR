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
  
  // Auto-size columns
  const maxWidth = 50;
  const colWidths = headers.map(header => {
    const headerWidth = header.length;
    const maxDataWidth = Math.max(
      ...data.map(row => {
        const value = (row as any)[header];
        return value ? String(value).length : 0;
      })
    );
    return Math.min(Math.max(headerWidth, maxDataWidth) + 2, maxWidth);
  });
  
  worksheet['!cols'] = colWidths.map(w => ({ wch: w }));
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

export function parseCSV<T>(fileContent: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
      complete: (results) => resolve(results.data),
      error: (error: Error) => reject(error)
    });
  });
}

export function parseExcel<T>(buffer: Buffer, sheetName?: string): T[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = sheetName 
    ? workbook.Sheets[sheetName] 
    : workbook.Sheets[workbook.SheetNames[0]];
  
  if (!sheet) {
    throw new Error(`Sheet ${sheetName || 'default'} not found`);
  }
  
  return XLSX.utils.sheet_to_json<T>(sheet, {
    raw: false,
    defval: undefined
  });
}

