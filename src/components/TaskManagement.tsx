import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Task, Employee } from "@/data/mockData";
import { storage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, AlertCircle } from "lucide-react";

interface TaskManagementProps {
  customerId: string;
  customerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEmployee?: Employee;
}

export function TaskManagement({
  customerId,
  customerName,
  open,
  onOpenChange,
  selectedEmployee,
}: TaskManagementProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee) {
      toast({
        title: "No Employee Selected",
        description: "Please select an employee first",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const task: Task = {
      id: `task_${Date.now()}`,
      customerId,
      assignedTo: selectedEmployee.id,
      ...formData,
      status: "pending",
      role: selectedEmployee.name.toLowerCase().includes("tech") ? "technician" : "other",
      createdBy: "Admin",
      createdDate: new Date().toISOString().split("T")[0],
    };

    storage.addTask(task);

    toast({
      title: "Task Created",
      description: `Task assigned to ${selectedEmployee.name}`,
    });

    onOpenChange(false);
    setFormData({
      title: "",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      priority: "medium",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Task for {customerName}</DialogTitle>
          <DialogDescription>
            Assign a task to {selectedEmployee?.name || "selected employee"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Complete wiring installation"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide task details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedEmployee && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">Assigned To:</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedEmployee.name}</Badge>
                <span className="text-xs text-muted-foreground">
                  {selectedEmployee.email}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
