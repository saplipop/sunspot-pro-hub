import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Commissioning, Status } from "@/data/mockData";
import { storage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/utils/activityUtils";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, Info } from "lucide-react";

interface CommissioningEditModalProps {
  commissioning: Commissioning | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (commissioning: Commissioning) => void;
}

export const CommissioningEditModal = ({ commissioning, open, onOpenChange, onSave }: CommissioningEditModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState<Commissioning>(
    commissioning || {
      customerId: "",
      status: "pending",
    }
  );
  const [autoFetchedData, setAutoFetchedData] = useState<{
    customerName?: string;
    consumerNo?: string;
    systemCapacity?: number;
    documentStatus?: string;
    wiringStatus?: string;
    qcApproved?: boolean;
    latestInspectionDate?: string;
  }>({});

  // Auto-fetch customer and project data
  useEffect(() => {
    if (commissioning?.customerId) {
      const customer = storage.getCustomer(commissioning.customerId);
      const documents = storage.getCustomerDocuments(commissioning.customerId);
      const wiring = storage.getCustomerWiring(commissioning.customerId);
      const inspections = storage.getCustomerInspections(commissioning.customerId);

      const docsUploaded = documents.filter((d) => d.uploaded || d.fileId).length;
      const totalDocs = documents.length;
      const documentStatus = `${docsUploaded}/${totalDocs} uploaded (${Math.round((docsUploaded / totalDocs) * 100)}%)`;

      const approvedInspection = inspections.find((i) => i.approvalStatus === "approved");
      const latestInspectionDate = approvedInspection?.approvalDate || inspections[0]?.inspectionDate;

      setAutoFetchedData({
        customerName: customer?.name,
        consumerNo: customer?.consumerNumber,
        systemCapacity: customer?.systemCapacity,
        documentStatus,
        wiringStatus: wiring?.status || "pending",
        qcApproved: !!approvedInspection,
        latestInspectionDate,
      });

      // Auto-mark subsidy received if QC approved and commissioning completed
      if (approvedInspection && commissioning.status === "completed" && !commissioning.subsidyReceivedDate) {
        setFormData({
          ...commissioning,
          subsidyReceivedDate: new Date().toISOString().split("T")[0],
        });
      }
    }
  }, [commissioning]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store file in localStorage as base64 for demo
      const reader = new FileReader();
      reader.onload = () => {
        const fileData = reader.result as string;
        const fileId = `comm_report_${Date.now()}`;
        localStorage.setItem(fileId, fileData);
        setFormData({ ...formData, commissioningReportFileId: fileId });
        toast({
          title: "File Uploaded",
          description: `Commissioning report uploaded successfully`,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(formData);
    
    logActivity(
      user?.username || "Admin",
      user?.username || "admin",
      formData.customerId,
      "Commissioning",
      `Updated commissioning details - Status: ${formData.status}`
    );

    toast({
      title: "Commissioning Updated",
      description: "Commissioning details have been updated successfully",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Commissioning Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Auto-Fetched Project Summary */}
          {autoFetchedData.customerName && (
            <Alert className="bg-primary/5 border-primary/20">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-semibold">Customer:</span> {autoFetchedData.customerName}
                  </div>
                  <div>
                    <span className="font-semibold">Consumer No:</span> {autoFetchedData.consumerNo}
                  </div>
                  <div>
                    <span className="font-semibold">System Capacity:</span> {autoFetchedData.systemCapacity} kWp
                  </div>
                  <div>
                    <span className="font-semibold">Documents:</span> {autoFetchedData.documentStatus}
                  </div>
                  <div>
                    <span className="font-semibold">Wiring:</span>{" "}
                    <span
                      className={
                        autoFetchedData.wiringStatus === "completed"
                          ? "text-success font-semibold"
                          : "text-warning"
                      }
                    >
                      {autoFetchedData.wiringStatus}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">QC Approved:</span>{" "}
                    <span className={autoFetchedData.qcApproved ? "text-success font-semibold" : "text-destructive"}>
                      {autoFetchedData.qcApproved ? "✓ Yes" : "✗ No"}
                    </span>
                  </div>
                  {autoFetchedData.latestInspectionDate && (
                    <div className="col-span-2">
                      <span className="font-semibold">Latest Inspection:</span> {autoFetchedData.latestInspectionDate}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: Status) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate || ""}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate || ""}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subsidyReceivedDate">
              Subsidy Received Date
              {autoFetchedData.qcApproved && formData.status === "completed" && (
                <span className="text-xs text-success ml-2">(Auto-marked after QC approval)</span>
              )}
            </Label>
            <Input
              id="subsidyReceivedDate"
              type="date"
              value={formData.subsidyReceivedDate || ""}
              onChange={(e) => setFormData({ ...formData, subsidyReceivedDate: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Commissioning Report</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="flex-1"
              />
              {formData.commissioningReportFileId && (
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-1" />
                  Uploaded
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="remark">Remark</Label>
            <Textarea
              id="remark"
              value={formData.remark || ""}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
