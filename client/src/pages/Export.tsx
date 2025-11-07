import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Download, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { generateCSV, downloadFile } from "@shared/importExport";
import * as XLSX from "xlsx";

export default function Export() {
  const [exportType, setExportType] = useState<"materials" | "projects" | "quotes" | "all">("all");
  const [format, setFormat] = useState<"csv" | "excel">("csv");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // Fetch data
  const projects: any[] = [];
  const quotes: any[] = [];

  const handleExport = async () => {
    setExporting(true);
    setExportComplete(false);

    try {
      const timestamp = new Date().toISOString().split("T")[0];
      
      if (exportType === "materials" || exportType === "all") {
        await exportMaterials(timestamp);
      }
      
      if (exportType === "projects" || exportType === "all") {
        await exportProjects(timestamp);
      }
      
      if (exportType === "quotes" || exportType === "all") {
        await exportQuotes(timestamp);
      }

      setExportComplete(true);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  const exportMaterials = async (timestamp: string) => {
    // Import materials from shared module
    const expandedMaterials = await import("@shared/expandedMaterials");
    const materials = (expandedMaterials as any).materials || [];
    
    const headers = [
      "manufacturer",
      "productName",
      "category",
      "profile",
      "bmt",
      "coverWidth",
      "minPitch",
      "pricePerUnit",
      "unit",
      "windRating",
      "coastalSuitable",
      "balRatings",
      "complianceStandards",
      "installationNotes",
    ];

    const data = materials.map((m: any) => ({
      manufacturer: m.manufacturer,
      productName: m.productName,
      category: m.category,
      profile: m.profile || "",
      bmt: m.bmt || "",
      coverWidth: m.coverWidth || "",
      minPitch: m.minPitch || "",
      pricePerUnit: m.pricePerUnit,
      unit: m.unit || "m²",
      windRating: m.windRating || "",
      coastalSuitable: m.coastalSuitable ? "true" : "false",
      balRatings: Array.isArray(m.balRatings) ? m.balRatings.join(",") : "",
      complianceStandards: Array.isArray(m.complianceStandards) ? m.complianceStandards.join(",") : "",
      installationNotes: m.installationNotes || "",
    }));

    if (format === "csv") {
      const csv = generateCSV(data, headers);
      downloadFile(csv, `venturr_materials_${timestamp}.csv`);
    } else {
      exportToExcel(data, headers, `venturr_materials_${timestamp}.xlsx`);
    }
  };

  const exportProjects = async (timestamp: string) => {
    if (!projects || projects.length === 0) {
      console.warn("No projects to export");
      return;
    }

    const headers = [
      "projectNumber",
      "name",
      "clientName",
      "clientEmail",
      "clientPhone",
      "propertyAddress",
      "propertyType",
      "status",
      "priority",
      "notes",
      "createdAt",
      "updatedAt",
    ];

    const data = projects.map(p => ({
      projectNumber: "",
      name: p.title,
      clientName: p.clientName || "",
      clientEmail: p.clientEmail || "",
      clientPhone: p.clientPhone || "",
      propertyAddress: p.address || "",
      propertyType: p.propertyType || "",
      status: p.status,
      priority: "medium",
      notes: "",
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : "",
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : "",
    }));

    if (format === "csv") {
      const csv = generateCSV(data, headers);
      downloadFile(csv, `venturr_projects_${timestamp}.csv`);
    } else {
      exportToExcel(data, headers, `venturr_projects_${timestamp}.xlsx`);
    }
  };

  const exportQuotes = async (timestamp: string) => {
    if (!quotes || quotes.length === 0) {
      console.warn("No quotes to export");
      return;
    }

    const headers = [
      "quoteNumber",
      "projectName",
      "clientName",
      "clientEmail",
      "subtotal",
      "gst",
      "total",
      "status",
      "validUntil",
      "createdAt",
      "sentAt",
    ];

    const data = quotes.map(q => ({
      quoteNumber: q.quoteNumber || "",
      projectName: "",
      clientName: "",
      clientEmail: "",
      subtotal: q.subtotal || "",
      gst: q.gst || "",
      total: q.total || "",
      status: q.status,
      validUntil: q.validUntil ? new Date(q.validUntil).toISOString().split("T")[0] : "",
      createdAt: q.createdAt ? new Date(q.createdAt).toISOString().split("T")[0] : "",
      sentAt: "",
    }));

    if (format === "csv") {
      const csv = generateCSV(data, headers);
      downloadFile(csv, `venturr_quotes_${timestamp}.csv`);
    } else {
      exportToExcel(data, headers, `venturr_quotes_${timestamp}.xlsx`);
    }
  };

  const exportToExcel = (data: any[], headers: string[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-lime-50 relative">
      {/* Futuristic Chequered Background */}
      <div className="background-glow fixed inset-0 z-0" />
      
      <div className="container mx-auto py-8 relative z-2 animate-fadeInUp">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Export Data</h1>
        <p className="text-muted-foreground mt-2">
          Export your data for backup, analysis, or integration with other systems
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>Choose what data to export and in which format</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Data to Export</Label>
              <RadioGroup value={exportType} onValueChange={(v) => setExportType(v as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="font-normal cursor-pointer">
                    All Data (Materials, Projects, Quotes)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="materials" id="materials" />
                  <Label htmlFor="materials" className="font-normal cursor-pointer">
                    Materials Only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="projects" id="projects" />
                  <Label htmlFor="projects" className="font-normal cursor-pointer">
                    Projects Only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quotes" id="quotes" />
                  <Label htmlFor="quotes" className="font-normal cursor-pointer">
                    Quotes Only
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>File Format</Label>
              <RadioGroup value={format} onValueChange={(v) => setFormat(v as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv" className="font-normal cursor-pointer">
                    CSV (.csv) - Universal format
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel" className="font-normal cursor-pointer">
                    Excel (.xlsx) - Formatted spreadsheet
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="archived"
                checked={includeArchived}
                onCheckedChange={(checked) => setIncludeArchived(checked as boolean)}
              />
              <Label htmlFor="archived" className="font-normal cursor-pointer">
                Include archived/completed items
              </Label>
            </div>

            <Button onClick={handleExport} disabled={exporting} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              {exporting ? "Exporting..." : "Export Data"}
            </Button>

            {exportComplete && (
              <Alert>
                <CheckCircle2 className="w-4 h-4" />
                <AlertDescription>
                  Export completed successfully! Your files have been downloaded.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium">Materials</span>
                  <span className="text-sm text-muted-foreground">100+ items</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium">Projects</span>
                  <span className="text-sm text-muted-foreground">
                    {projects?.length || 0} projects
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium">Quotes</span>
                  <span className="text-sm text-muted-foreground">
                    {quotes?.length || 0} quotes
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">File Formats</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>CSV: Universal format compatible with all spreadsheet applications</li>
                    <li>Excel: Formatted spreadsheet with proper column types</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Data Usage</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Use exports for backup and disaster recovery</li>
                    <li>Analyze data in Excel, Google Sheets, or BI tools</li>
                    <li>Import into accounting software (Xero, MYOB, QuickBooks)</li>
                    <li>Share with team members or external consultants</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Data Security</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Exported files contain sensitive business data</li>
                    <li>Store files securely and encrypt if sharing via email</li>
                    <li>Delete old export files when no longer needed</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export to Xero
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export to MYOB
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export to QuickBooks
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Direct integrations coming soon. For now, use CSV export and import manually.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}

