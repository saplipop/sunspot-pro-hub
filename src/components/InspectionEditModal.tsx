import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Inspection, Status } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/utils/activityUtils";
import { useAuth } from "@/contexts/AuthContext";

interface InspectionEditModalProps {
  inspection: Inspection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (inspection: Inspection) => void;
}

export const InspectionEditModal = ({ inspection, open, onOpenChange, onSave }: InspectionEditModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState<Inspection>(
    inspection || {
      id: "",
      customerId: "",
      document: "",
      submitted: false,
      approved: false,
      approvalStatus: "pending",
      status: "pending",
    }
  );

  // Handle QC approval status change
  const handleApprovalStatusChange = (status: "pending" | "approved" | "rejected") => {
    setFormData({
      ...formData,
      approvalStatus: status,
      approved: status === "approved",
      approvedBy: status !== "pending" ? user?.username || "Admin" : undefined,
      approvalDate: status !== "pending" ? new Date().toISOString().split("T")[0] : undefined,
    });
  };

  const handleSave = () => {
    onSave(formData);
    
    logActivity(
      user?.username || "Admin",
      user?.username || "admin",
      formData.customerId,
      "Inspection",
      `Updated ${formData.document} - Status: ${formData.status}`
    );

    toast({
      title: "Inspection Updated",
      description: "Inspection details have been updated successfully",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Inspection</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="document">Document</Label>
            <Input
              id="document"
              value={formData.document}
              onChange={(e) => setFormData({ ...formData, document: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div className="grid gap-2">
              <Label htmlFor="submitted">Submitted</Label>
              <Select
                value={formData.submitted ? "yes" : "no"}
                onValueChange={(value) => setFormData({ ...formData, submitted: value === "yes" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="inwardNo">Inward No.</Label>
              <Input
                id="inwardNo"
                value={formData.inwardNo || ""}
                onChange={(e) => setFormData({ ...formData, inwardNo: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="qcName">QC Name</Label>
              <Input
                id="qcName"
                value={formData.qcName || ""}
                onChange={(e) => setFormData({ ...formData, qcName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="inspectionDate">Inspection Date</Label>
              <Input
                id="inspectionDate"
                type="date"
                value={formData.inspectionDate || ""}
                onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Submission Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date || ""}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          {/* QC Approval Section */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <Label className="text-base font-semibold mb-3 block">QC Approval Status</Label>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="approvalStatus">Approval Decision (Admin Only)</Label>
                <Select
                  value={formData.approvalStatus || "pending"}
                  onValueChange={handleApprovalStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">⏳ Pending Review</SelectItem>
                    <SelectItem value="approved">✅ Approved</SelectItem>
                    <SelectItem value="rejected">❌ Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.approvalStatus !== "pending" && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <div className="grid gap-2">
                    <Label>Approved/Rejected By</Label>
                    <Input value={formData.approvedBy || ""} disabled className="bg-background" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Approval Date</Label>
                    <Input value={formData.approvalDate || ""} disabled className="bg-background" />
                  </div>
                </div>
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