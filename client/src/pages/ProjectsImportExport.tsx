import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Upload, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ProjectsImportExport({ organizationId }: { organizationId: string }) {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  
  const exportMutation = trpc.projects.export.useMutation();
  const importMutation = trpc.projects.import.useMutation();
  const downloadTemplateMutation = trpc.projects.downloadTemplate.useMutation();
  
  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      const result = await exportMutation.mutateAsync({ organizationId, format });
      
      let blob: Blob;
      if (format === 'csv') {
        blob = new Blob([result.content], { type: result.mimeType });
      } else {
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
  
  const handleImport = async () => {
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
      
      if (result.success) {
        toast.success(`Successfully imported ${result.successCount} projects`);
        setImportDialogOpen(false);
        setImportFile(null);
        window.location.reload(); // Refresh to show new projects
      } else {
        toast.error(`Import failed with ${result.errorCount} errors`);
      }
    } catch (error) {
      toast.error('Import failed');
      console.error(error);
    }
  };
  
  return (
    <div className="space-y-4 mb-6 animate-fadeInUp">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export Projects</CardTitle>
          <CardDescription>Download your projects database</CardDescription>
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
          <CardTitle>Import Projects</CardTitle>
          <CardDescription>Upload a CSV or Excel file to bulk import projects</CardDescription>
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
            Import Projects
          </Button>
        </CardContent>
      </Card>
      
      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Projects</DialogTitle>
            <DialogDescription>Upload a CSV or Excel file to import projects</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Import Mode</Label>
              <Select value={importMode} onValueChange={(v: any) => setImportMode(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="append">Append (add to existing)</SelectItem>
                  <SelectItem value="replace">Replace (clear and import)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {importMode === 'append' 
                  ? 'New projects will be added to your existing library'
                  : 'All existing projects will be deleted and replaced with imported data'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Select File</Label>
              <Input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileSelect}
              />
              {importFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {importFile.name} ({(importFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
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
