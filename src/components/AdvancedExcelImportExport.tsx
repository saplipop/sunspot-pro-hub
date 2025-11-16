import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { exportFullDataToExcel, importFullDataFromExcel } from "@/utils/advancedExcelUtils";
import { useToast } from "@/hooks/use-toast";

export function AdvancedExcelImportExport() {
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<any>(null);
  const { toast } = useToast();

  const handleExport = () => {
    try {
      const summary = exportFullDataToExcel();
      
      toast({
        title: "Export Successful",
        description: `Exported ${summary.customers} customers, ${summary.employees} employees, ${summary.tasks} tasks, ${summary.documents} documents, and ${summary.activities} activities`,
      });
      
      setExportOpen(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportSummary(null);

    try {
      const summary = await importFullDataFromExcel(file);
      setImportSummary(summary);

      if (summary.errors.length === 0) {
        toast({
          title: "Import Successful",
          description: `Created: ${summary.created}, Updated: ${summary.updated}, Skipped: ${summary.skipped}`,
        });
      } else {
        toast({
          title: "Import Completed with Errors",
          description: `${summary.errors.length} errors occurred. Check details below.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import data",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Export Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Full Export
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Full Data to Excel</DialogTitle>
            <DialogDescription>
              Export all system data to a comprehensive Excel file with multiple sheets
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Export includes 5 sheets:</p>
                  <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
                    <li><strong>Customers:</strong> All customer details with task/document counts</li>
                    <li><strong>Employees:</strong> Employee profiles with assignments</li>
                    <li><strong>Tasks:</strong> All tasks with wiring links and status</li>
                    <li><strong>Documents:</strong> Document details with numbers and verification</li>
                    <li><strong>Activity Log:</strong> Last 1000 activity entries</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Use Cases:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Complete system backup</li>
                <li>Data analysis in Excel/Google Sheets</li>
                <li>Sharing with external stakeholders</li>
                <li>Audit trail and compliance reporting</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setExportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Full Import
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Data from Excel</DialogTitle>
            <DialogDescription>
              Import customers, employees, and tasks from an Excel file. Duplicates will be updated.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert className="bg-amber-500/10 border-amber-500/20">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                <p className="font-semibold text-sm mb-1">Important Notes:</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Duplicate customers (by Consumer Number) will be updated</li>
                  <li>• Duplicate employees (by Email) will be updated</li>
                  <li>• File must follow the export schema (use Full Export for template)</li>
                  <li>• Invalid rows will be skipped with error report</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImport}
                disabled={importing}
                className="hidden"
                id="full-import"
              />
              <label htmlFor="full-import" className={importing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}>
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {importing ? "Importing..." : "Click to upload Excel file"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports .xlsx files with multiple sheets
                </p>
              </label>
            </div>

            {importSummary && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Created</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{importSummary.created}</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Updated</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{importSummary.updated}</p>
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium">Skipped</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{importSummary.skipped}</p>
                  </div>
                </div>

                {importSummary.errors.length > 0 && (
                  <div className="border rounded-lg p-4 bg-destructive/5">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <p className="font-semibold text-sm">Errors ({importSummary.errors.length})</p>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {importSummary.errors.map((err: any, idx: number) => (
                        <p key={idx} className="text-xs text-muted-foreground">
                          Row {err.row}: {err.error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => {
              setImportOpen(false);
              setImportSummary(null);
            }}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
