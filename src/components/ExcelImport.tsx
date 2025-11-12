import { useState, useRef } from "react";
import { Upload, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { downloadExcelTemplate, importExcelFile } from "@/utils/excelUtils";
import { Customer, mockCustomers } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

interface ExcelImportProps {
  onImportComplete: (customers: Partial<Customer>[]) => void;
}

export function ExcelImport({ onImportComplete }: ExcelImportProps) {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<Partial<Customer>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a valid Excel file (.xlsx or .csv)",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);

    try {
      const customers = await importExcelFile(file);
      setPreview(customers);
      
      toast({
        title: "File Parsed Successfully",
        description: `Found ${customers.length} customer(s) in the file`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to parse Excel file",
        variant: "destructive",
      });
      setPreview([]);
    } finally {
      setImporting(false);
    }
  };

  const handleImport = () => {
    if (preview.length === 0) return;

    // Validate preview data
    const validCustomers = preview.filter(c => c.name && c.consumerNumber);
    
    if (validCustomers.length === 0) {
      toast({
        title: "No Valid Data",
        description: "Please ensure each row has at least Name and Consumer Number",
        variant: "destructive",
      });
      return;
    }

    onImportComplete(validCustomers);
    
    toast({
      title: "Import Successful",
      description: `Imported ${validCustomers.length} customer(s) successfully`,
    });

    // Reset
    setPreview([]);
    setOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadTemplate = () => {
    downloadExcelTemplate();
    toast({
      title: "Template Downloaded",
      description: "Excel template has been downloaded successfully",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Customers from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx or .csv) to import multiple customers at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template Button */}
          <div className="flex justify-between items-center p-4 border rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Need a template?</p>
              <p className="text-sm text-muted-foreground">Download our sample Excel template</p>
            </div>
            <Button variant="secondary" onClick={handleDownloadTemplate} className="gap-2">
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
              id="excel-upload"
            />
            <label htmlFor="excel-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium">Click to upload Excel file</p>
              <p className="text-xs text-muted-foreground mt-1">Supports .xlsx and .csv files</p>
            </label>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Preview ({preview.length} customers)</h3>
              <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Consumer No.</th>
                      <th className="p-2 text-left">Mobile</th>
                      <th className="p-2 text-left">Capacity (kW)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((customer, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{customer.name || '-'}</td>
                        <td className="p-2">{customer.consumerNumber || '-'}</td>
                        <td className="p-2">{customer.mobile || '-'}</td>
                        <td className="p-2">{customer.systemCapacity || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The imported customers will be added to your system. You can edit them later.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreview([])}>
                  Cancel
                </Button>
                <Button onClick={handleImport}>
                  Import {preview.length} Customer(s)
                </Button>
              </div>
            </div>
          )}

          {importing && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Processing file...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}