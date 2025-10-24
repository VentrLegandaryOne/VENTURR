import { useState } from 'react';

import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Upload, FileText, Loader2, AlertCircle, Trash2, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { ImportResult } from '../../../shared/importExportTypes';

export default function MaterialsLibrary() {
  const [organizationId] = useState('default-org'); // TODO: Get from context
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [validationResult, setValidationResult] = useState<ImportResult | null>(null);
  
  // Queries
  const materialsQuery = trpc.materials.list.useQuery({ organizationId });
  const materials = materialsQuery.data;
  const refetch = materialsQuery.refetch;
  
  // Mutations
  const exportMutation = trpc.materials.export.useMutation();
  const importMutation = trpc.materials.import.useMutation();
  const downloadTemplateMutation = trpc.materials.downloadTemplate.useMutation();
  const deleteMutation = trpc.materials.delete.useMutation();
  
  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      const result = await exportMutation.mutateAsync({ 
        organizationId,
        format 
      });
      
      // Create blob and download
      let blob: Blob;
      if (format === 'csv') {
        blob = new Blob([result.content], { type: result.mimeType });
      } else {
        // Decode base64 for Excel files
        const binaryString = atob(result.content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: result.mimeType });
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${format.toUpperCase()} successfully`);
    } catch (error) {
      toast.error('Export failed');
      console.error(error);
    }
  };
  
  const handleDownloadTemplate = async (format: 'csv' | 'xlsx') => {
    try {
      const result = await downloadTemplateMutation.mutateAsync({ format });
      
      let blob: Blob;
      if (format === 'csv') {
        blob = new Blob([result.content], { type: result.mimeType });
      } else {
        // Decode base64 for Excel files
        const binaryString = atob(result.content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: result.mimeType });
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Template downloaded');
    } catch (error) {
      toast.error('Download failed');
      console.error(error);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setValidationResult(null);
    }
  };
  
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };
  
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const handleImportValidate = async () => {
    if (!importFile) return;
    
    try {
      const format = importFile.name.endsWith('.csv') ? 'csv' : 'xlsx';
      const fileContent = format === 'csv' 
        ? await readFileAsText(importFile)
        : await readFileAsBase64(importFile);
      
      const result = await importMutation.mutateAsync({
        organizationId,
        fileContent,
        format,
        mode: importMode
      });
      
      setValidationResult(result);
      
      if (result.success) {
        toast.success(`Successfully imported ${result.successCount} materials`);
        setImportDialogOpen(false);
        setImportFile(null);
        refetch();
      } else {
        toast.error(`Import failed with ${result.errorCount} errors`);
      }
    } catch (error) {
      toast.error('Import failed');
      console.error(error);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success('Material deleted');
      refetch();
    } catch (error) {
      toast.error('Delete failed');
      console.error(error);
    }
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Materials Library</h1>
          <p className="text-muted-foreground">Manage your roofing materials database</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Material
        </Button>
      </div>
      
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export Materials</CardTitle>
          <CardDescription>Download your materials database</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={() => handleExport('csv')} disabled={exportMutation.isPending}>
            {exportMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export CSV
          </Button>
          <Button onClick={() => handleExport('xlsx')} disabled={exportMutation.isPending}>
            {exportMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export Excel
          </Button>
        </CardContent>
      </Card>
      
      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle>Import Materials</CardTitle>
          <CardDescription>Upload a CSV or Excel file to bulk import materials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleDownloadTemplate('csv')}
              disabled={downloadTemplateMutation.isPending}
            >
              <FileText className="mr-2 h-4 w-4" />
              Download CSV Template
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleDownloadTemplate('xlsx')}
              disabled={downloadTemplateMutation.isPending}
            >
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
      
      {/* Materials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Materials ({materials?.length || 0})</CardTitle>
          <CardDescription>Your current materials inventory</CardDescription>
        </CardHeader>
        <CardContent>
          {materials && materials.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material: any) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell>{material.category}</TableCell>
                    <TableCell>{material.manufacturer}</TableCell>
                    <TableCell>{material.profile}</TableCell>
                    <TableCell>${material.pricePerUnit}</TableCell>
                    <TableCell>{material.unit}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(material.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No materials found. Import materials to get started.</p>
            </div>
          )}
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
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                {importMode === 'append' 
                  ? 'New materials will be added to your existing library'
                  : 'All existing materials will be deleted and replaced with imported data'}
              </p>
            </div>
            
            <div>
              <Label>Select File</Label>
              <Input 
                type="file" 
                accept=".csv,.xlsx" 
                onChange={handleFileSelect}
                className="mt-1"
              />
              {importFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {importFile.name} ({(importFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
            
            {validationResult && !validationResult.success && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Errors ({validationResult.errorCount})</AlertTitle>
                <AlertDescription>
                  <div className="max-h-60 overflow-y-auto mt-2 space-y-1">
                    {validationResult.errors.slice(0, 10).map((error, i) => (
                      <div key={i} className="text-sm font-mono">
                        Row {error.row}: <span className="font-semibold">{error.field}</span> - {error.message}
                      </div>
                    ))}
                    {validationResult.errors.length > 10 && (
                      <div className="text-sm italic">
                        ... and {validationResult.errors.length - 10} more errors
                      </div>
                    )}
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
              disabled={!importFile || importMutation.isPending}
            >
              {importMutation.isPending ? (
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

