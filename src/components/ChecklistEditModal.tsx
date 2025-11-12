import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChecklistItem, Status } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/utils/activityUtils";
import { useAuth } from "@/contexts/AuthContext";
import { Info } from "lucide-react";

interface ChecklistEditModalProps {
  item: ChecklistItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: ChecklistItem) => void;
}

export const ChecklistEditModal = ({ item, open, onOpenChange, onSave }: ChecklistEditModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState<ChecklistItem>(
    item || {
      id: "",
      customerId: "",
      task: "",
      status: "pending",
    }
  );

  const handleSave = () => {
    const updatedItem = {
      ...formData,
      doneBy: user?.username || "Admin",
      date: new Date().toISOString().split("T")[0],
    };
    
    onSave(updatedItem);
    
    logActivity(
      user?.username || "Admin",
      user?.username || "admin",
      formData.customerId,
      "Checklist",
      `Updated ${formData.task} - Status: ${formData.status}`
    );

    toast({
      title: "Checklist Updated",
      description: `${formData.task} has been updated successfully`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Checklist Item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="task">Task</Label>
            <Input
              id="task"
              value={formData.task}
              onChange={(e) => setFormData({ ...formData, task: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="status">Status</Label>
              {formData.assignedEmployeeName && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Assigned to: {formData.assignedEmployeeName}</p>
                      {formData.endDate && <p>Due: {formData.endDate}</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Select
              value={formData.status}
              onValueChange={(value: Status) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                    Pending
                  </span>
                </SelectItem>
                <SelectItem value="in_progress">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    In Progress
                  </span>
                </SelectItem>
                <SelectItem value="completed">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                    Completed
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            {formData.assignedEmployeeName && (
              <p className="text-xs text-muted-foreground">
                ℹ️ Assigned to {formData.assignedEmployeeName}
                {formData.status === "completed" && formData.doneBy && ` • Completed by ${formData.doneBy}`}
              </p>
            )}
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