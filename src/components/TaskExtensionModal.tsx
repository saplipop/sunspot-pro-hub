import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Task } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { taskWiringSyncManager } from "@/lib/taskWiringSync";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TaskExtensionModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExtended: () => void;
}

export function TaskExtensionModal({ task, open, onOpenChange, onExtended }: TaskExtensionModalProps) {
  const [newEndDate, setNewEndDate] = useState<Date>();
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  if (!task) return null;

  const currentEndDate = new Date(task.endDate);

  const handleExtend = () => {
    if (!newEndDate) {
      toast({
        title: "Date Required",
        description: "Please select a new end date",
        variant: "destructive",
      });
      return;
    }

    if (newEndDate <= currentEndDate) {
      toast({
        title: "Invalid Date",
        description: "New end date must be after current end date",
        variant: "destructive",
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for the extension",
        variant: "destructive",
      });
      return;
    }

    taskWiringSyncManager.extendTaskDeadline(
      task.id,
      format(newEndDate, "yyyy-MM-dd"),
      reason,
      user?.username || "Admin"
    );

    toast({
      title: "Deadline Extended",
      description: `Task deadline extended to ${format(newEndDate, "PPP")}`,
    });

    onExtended();
    onOpenChange(false);
    setNewEndDate(undefined);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Extend Task Deadline</DialogTitle>
          <DialogDescription>
            Extend the deadline for "{task.title}". Changes will sync to wiring and checklist.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="text-sm">
                <p className="font-semibold">Current End Date: {format(currentEndDate, "PPP")}</p>
                {task.role === "technician" && (
                  <p className="text-xs mt-1 text-muted-foreground">
                    This will also update the wiring section and linked checklist items
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>New End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !newEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newEndDate ? format(newEndDate, "PPP") : "Select new date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newEndDate}
                  onSelect={setNewEndDate}
                  disabled={(date) => date <= currentEndDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Extension *</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for extending the deadline..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExtend}>
            Extend Deadline
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
