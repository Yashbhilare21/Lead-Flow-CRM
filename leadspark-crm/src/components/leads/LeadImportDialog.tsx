import { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLeadImport } from '@/hooks/useLeadImport';
import { toast } from 'sonner';
import { Upload, FileText, Download, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface LeadImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function LeadImportDialog({ open, onOpenChange, onSuccess }: LeadImportDialogProps) {
  const { importFromCSV, downloadTemplate, isImporting } = useLeadImport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    const result = await importFromCSV(selectedFile);
    setImportResult(result);

    if (result.success > 0) {
      toast.success(`Successfully imported ${result.success} lead(s)`);
      onSuccess();
    }

    if (result.failed > 0) {
      toast.error(`Failed to import ${result.failed} lead(s)`);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Leads from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import leads
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Download Template */}
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={downloadTemplate}
          >
            <Download className="w-4 h-4" />
            Download CSV Template
          </Button>

          {/* File Upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2 text-foreground">
                <FileText className="w-5 h-5" />
                <span className="font-medium">{selectedFile.name}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">CSV files only</p>
              </div>
            )}
          </div>

          {/* Import Result */}
          {importResult && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">{importResult.success} imported</span>
                </div>
                {importResult.failed > 0 && (
                  <div className="flex items-center gap-1 text-destructive">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{importResult.failed} failed</span>
                  </div>
                )}
              </div>
              {importResult.errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto text-xs text-muted-foreground space-y-1">
                  {importResult.errors.slice(0, 5).map((error, i) => (
                    <p key={i}>{error}</p>
                  ))}
                  {importResult.errors.length > 5 && (
                    <p>...and {importResult.errors.length - 5} more errors</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              {importResult ? 'Close' : 'Cancel'}
            </Button>
            {!importResult && (
              <Button
                onClick={handleImport}
                disabled={!selectedFile || isImporting}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
