import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WiringDetails, Status } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/utils/activityUtils";
import { useAuth } from "@/contexts/AuthContext";
import { UserCheck } from "lucide-react";

interface WiringEditModalProps {
  wiring: WiringDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (wiring: WiringDetails) => void;
}

export const WiringEditModal = ({ wiring, open, onOpenChange, onSave }: WiringEditModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState<WiringDetails>(
    wiring || {
      customerId: "",
      status: "pending",
    }
  );

  const handleSave = () => {
    onSave(formData);
    
    logActivity(
      user?.username || "Admin",
      user?.username || "admin",
      formData.customerId,
      "Wiring",
      `Updated wiring details - Status: ${formData.status}`
    );

    toast({
      title: "Wiring Details Updated",
      description: "Wiring information has been updated successfully",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Wiring Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {formData.technicianId && (
            <Alert className="bg-primary/10 border-primary/20">
              <UserCheck className="h-4 w-4" />
              <AlertDescription>
                <span className="font-semibold">Auto-assigned from Employee Task</span>
                <p className="text-xs mt-1">
                  This technician was automatically linked when assigned to the customer.
                  Changes to dates will sync with the task.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="technicianName">
                Technician Name
                {formData.technicianId && (
                  <span className="text-xs text-muted-foreground ml-2">(Auto-filled)</span>
                )}
              </Label>
              <Input
                id="technicianName"
                value={formData.technicianName || ""}
                onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
                disabled={!!formData.technicianId}
                className={formData.technicianId ? "bg-muted" : ""}
              />
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">
                Start Date
                {formData.technicianId && (
                  <span className="text-xs text-muted-foreground ml-2">(Synced with task)</span>
                )}
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate || ""}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endDate">
                End Date
                {formData.technicianId && (
                  <span className="text-xs text-muted-foreground ml-2">(Synced with task)</span>
                )}
              </Label>
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
              <Label htmlFor="pvModuleNo">PV Module No.</Label>
              <Input
                id="pvModuleNo"
                value={formData.pvModuleNo || ""}
                onChange={(e) => setFormData({ ...formData, pvModuleNo: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="aggregateCapacity">Aggregate Capacity (kWp)</Label>
              <Input
                id="aggregateCapacity"
                type="number"
                step="0.1"
                value={formData.aggregateCapacity || ""}
                onChange={(e) => setFormData({ ...formData, aggregateCapacity: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="inverterType">Inverter Type</Label>
              <Input
                id="inverterType"
                value={formData.inverterType || ""}
                onChange={(e) => setFormData({ ...formData, inverterType: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="acVoltage">AC Voltage</Label>
              <Input
                id="acVoltage"
                value={formData.acVoltage || ""}
                onChange={(e) => setFormData({ ...formData, acVoltage: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="mountingStructure">Mounting Structure</Label>
              <Input
                id="mountingStructure"
                value={formData.mountingStructure || ""}
                onChange={(e) => setFormData({ ...formData, mountingStructure: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dcdb">DCDB</Label>
              <Input
                id="dcdb"
                value={formData.dcdb || ""}
                onChange={(e) => setFormData({ ...formData, dcdb: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="acdb">ACDB</Label>
              <Input
                id="acdb"
                value={formData.acdb || ""}
                onChange={(e) => setFormData({ ...formData, acdb: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cables">Cables</Label>
              <Input
                id="cables"
                value={formData.cables || ""}
                onChange={(e) => setFormData({ ...formData, cables: e.target.value })}
              />
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