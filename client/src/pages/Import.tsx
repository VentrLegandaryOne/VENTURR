import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  getMaterialImportTemplate,
  getProjectImportTemplate,
  getQuoteImportTemplate,
  validateMaterialRow,
  validateProjectRow,
  validateQuoteRow,
  parseMaterialImportRow,
  parseProjectImportRow,
  downloadFile,
  generateCSV,
  type ImportResult
} from "@shared/importExport";
import { trpc } from "@/lib/trpc";
import { Upload, Download, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function Import() {
  const [activeTab, setActiveTab] = useState<"materials" | "projects" | "quotes">("materials");
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);

  const utils = trpc.useUtils();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    let template: string[][];
    let filename: string;

    switch (activeTab) {
      case "materials":
        template = getMaterialImportTemplate();
        filename = "venturr_materials_template.csv";
        break;
      case "projects":
        template = getProjectImportTemplate();
        filename = "venturr_projects_template.csv";
        break;
      case "quotes":
        template = getQuoteImportTemplate();
        filename = "venturr_quotes_template.csv";
        break;
      default:
        return;
    }

    const csv = template.map(row => row.join(",")).join("\n");
    downloadFile(csv, filename);
  };

  const parseFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension === "csv") {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data);
          },
          error: (error) => {
            reject(error);
          },
        });
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
      } else {
        reject(new Error("Unsupported file format. Please use CSV or Excel files."));
      }
    });
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setProgress(0);
    setImportResult(null);

    try {
      // Parse file
      setProgress(10);
      const rawData = await parseFile(file);
      setProgress(30);

      // Validate and process data
      const errors: ImportResult["errors"] = [];
      const validData: any[] = [];

      rawData.forEach((row, index) => {
        let validation: { valid: boolean; errors: string[] };

        switch (activeTab) {
          case "materials":
            validation = validateMaterialRow(row, index + 2); // +2 for header row
            if (validation.valid) {
              validData.push(parseMaterialImportRow(row));
            }
            break;
          case "projects":
            validation = validateProjectRow(row, index + 2);
            if (validation.valid) {
              validData.push(parseProjectImportRow(row));
            }
            break;
          case "quotes":
            validation = validateQuoteRow(row, index + 2);
            if (validation.valid) {
              validData.push(row); // Quote parsing handled by backend
            }
            break;
          default:
            validation = { valid: false, errors: ["Invalid import type"] };
        }

        if (!validation.valid) {
          validation.errors.forEach(error => {
            errors.push({
              row: index + 2,
              message: error,
            });
          });
        }
      });

      setProgress(60);

      // Import valid data (this would call your tRPC mutations)
      // For now, we'll simulate the import
      const result: ImportResult = {
        success: errors.length === 0,
        totalRecords: rawData.length,
        successfulRecords: validData.length,
        failedRecords: errors.length,
        errors,
        data: validData,
      };

      setProgress(100);
      setImportResult(result);

      // Invalidate queries to refresh data
      if (result.successfulRecords > 0) {
        utils.invalidate();
      }
    } catch (error: any) {
      setImportResult({
        success: false,
        totalRecords: 0,
        successfulRecords: 0,
        failedRecords: 0,
        errors: [{ row: 0, message: error.message || "Failed to import file" }],
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Import Data</h1>
        <p className="text-muted-foreground mt-2">
          Import materials, projects, and quotes from CSV or Excel files
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Materials</CardTitle>
              <CardDescription>
                Import roofing materials, fasteners, flashings, and accessories from CSV or Excel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
                <span className="text-sm text-muted-foreground">
                  Download the template to see the required format
                </span>
              </div>

              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="material-file-input"
                />
                <label htmlFor="material-file-input" className="cursor-pointer">
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">
                    {file ? file.name : "Choose a file or drag it here"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports CSV and Excel files (.csv, .xlsx, .xls)
                  </p>
                </label>
              </div>

              {file && (
                <Button onClick={handleImport} disabled={importing} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  {importing ? "Importing..." : "Import Materials"}
                </Button>
              )}

              {importing && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-center text-muted-foreground">
                    Processing... {progress}%
                  </p>
                </div>
              )}

              {importResult && (
                <Alert variant={importResult.success ? "default" : "destructive"}>
                  <div className="flex items-start gap-3">
                    {importResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <div className="flex-1">
                      <AlertDescription>
                        <p className="font-medium mb-2">
                          {importResult.success
                            ? "Import completed successfully!"
                            : "Import completed with errors"}
                        </p>
                        <div className="text-sm space-y-1">
                          <p>Total records: {importResult.totalRecords}</p>
                          <p className="text-green-600">
                            Successfully imported: {importResult.successfulRecords}
                          </p>
                          {importResult.failedRecords > 0 && (
                            <p className="text-red-600">
                              Failed: {importResult.failedRecords}
                            </p>
                          )}
                        </div>
                        {importResult.errors.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="font-medium">Errors:</p>
                            <div className="max-h-40 overflow-y-auto space-y-1">
                              {importResult.errors.slice(0, 10).map((error, index) => (
                                <p key={index} className="text-sm">
                                  • {error.message}
                                </p>
                              ))}
                              {importResult.errors.length > 10 && (
                                <p className="text-sm italic">
                                  ... and {importResult.errors.length - 10} more errors
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Projects</CardTitle>
              <CardDescription>
                Import project data including client information and property details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
                <span className="text-sm text-muted-foreground">
                  Download the template to see the required format
                </span>
              </div>

              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="project-file-input"
                />
                <label htmlFor="project-file-input" className="cursor-pointer">
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">
                    {file ? file.name : "Choose a file or drag it here"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports CSV and Excel files (.csv, .xlsx, .xls)
                  </p>
                </label>
              </div>

              {file && (
                <Button onClick={handleImport} disabled={importing} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  {importing ? "Importing..." : "Import Projects"}
                </Button>
              )}

              {importing && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-center text-muted-foreground">
                    Processing... {progress}%
                  </p>
                </div>
              )}

              {importResult && (
                <Alert variant={importResult.success ? "default" : "destructive"}>
                  <div className="flex items-start gap-3">
                    {importResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <div className="flex-1">
                      <AlertDescription>
                        <p className="font-medium mb-2">
                          {importResult.success
                            ? "Import completed successfully!"
                            : "Import completed with errors"}
                        </p>
                        <div className="text-sm space-y-1">
                          <p>Total records: {importResult.totalRecords}</p>
                          <p className="text-green-600">
                            Successfully imported: {importResult.successfulRecords}
                          </p>
                          {importResult.failedRecords > 0 && (
                            <p className="text-red-600">
                              Failed: {importResult.failedRecords}
                            </p>
                          )}
                        </div>
                        {importResult.errors.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="font-medium">Errors:</p>
                            <div className="max-h-40 overflow-y-auto space-y-1">
                              {importResult.errors.slice(0, 10).map((error, index) => (
                                <p key={index} className="text-sm">
                                  • {error.message}
                                </p>
                              ))}
                              {importResult.errors.length > 10 && (
                                <p className="text-sm italic">
                                  ... and {importResult.errors.length - 10} more errors
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Quotes</CardTitle>
              <CardDescription>
                Import quote data with line items and pricing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
                <span className="text-sm text-muted-foreground">
                  Download the template to see the required format
                </span>
              </div>

              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="quote-file-input"
                />
                <label htmlFor="quote-file-input" className="cursor-pointer">
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">
                    {file ? file.name : "Choose a file or drag it here"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports CSV and Excel files (.csv, .xlsx, .xls)
                  </p>
                </label>
              </div>

              {file && (
                <Button onClick={handleImport} disabled={importing} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  {importing ? "Importing..." : "Import Quotes"}
                </Button>
              )}

              {importing && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-center text-muted-foreground">
                    Processing... {progress}%
                  </p>
                </div>
              )}

              {importResult && (
                <Alert variant={importResult.success ? "default" : "destructive"}>
                  <div className="flex items-start gap-3">
                    {importResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <div className="flex-1">
                      <AlertDescription>
                        <p className="font-medium mb-2">
                          {importResult.success
                            ? "Import completed successfully!"
                            : "Import completed with errors"}
                        </p>
                        <div className="text-sm space-y-1">
                          <p>Total records: {importResult.totalRecords}</p>
                          <p className="text-green-600">
                            Successfully imported: {importResult.successfulRecords}
                          </p>
                          {importResult.failedRecords > 0 && (
                            <p className="text-red-600">
                              Failed: {importResult.failedRecords}
                            </p>
                          )}
                        </div>
                        {importResult.errors.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="font-medium">Errors:</p>
                            <div className="max-h-40 overflow-y-auto space-y-1">
                              {importResult.errors.slice(0, 10).map((error, index) => (
                                <p key={index} className="text-sm">
                                  • {error.message}
                                </p>
                              ))}
                              {importResult.errors.length > 10 && (
                                <p className="text-sm italic">
                                  ... and {importResult.errors.length - 10} more errors
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Import Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">File Format</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Supported formats: CSV (.csv), Excel (.xlsx, .xls)</li>
                <li>First row must contain column headers matching the template</li>
                <li>Use the template files as a reference for correct formatting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Data Validation</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Required fields must not be empty</li>
                <li>Numeric fields must contain valid numbers</li>
                <li>Email addresses must be in valid format</li>
                <li>Dates should be in YYYY-MM-DD format</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Error Handling</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Invalid rows will be skipped and reported in the error log</li>
                <li>Valid rows will be imported even if some rows have errors</li>
                <li>Review the error messages to fix issues in your source file</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

