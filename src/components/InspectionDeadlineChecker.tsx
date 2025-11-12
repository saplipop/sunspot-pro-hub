import { useEffect, useState } from "react";
import { dataManager } from "@/lib/dataManager";
import { Task } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InspectionDeadlineChecker() {
  const [deadlines, setDeadlines] = useState<{ nearDeadline: Task[]; overdue: Task[] }>({
    nearDeadline: [],
    overdue: [],
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [newEndDate, setNewEndDate] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    checkDeadlines();
    const interval = setInterval(checkDeadlines, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkDeadlines = () => {
    const result = dataManager.checkTaskDeadlines();
    setDeadlines(result);
  };

  const handleMarkComplete = (task: Task) => {
    const today = new Date();
    const endDate = new Date(task.endDate);

    if (today < endDate) {
      toast({
        title: "Cannot Mark Complete",
        description: "Task cannot be marked complete before its due date",
        variant: "destructive",
      });
      return;
    }

    dataManager.updateTask(task.id, { status: "completed" }, "System", "system");
    toast({
      title: "Task Completed",
      description: `${task.title} has been marked as completed`,
    });
    checkDeadlines();
  };

  const handleExtend = (task: Task) => {
    setSelectedTask(task);
    setNewEndDate(task.endDate);
    setExtendDialogOpen(true);
  };

  const confirmExtend = () => {
    if (!selectedTask || !newEndDate) return;

    dataManager.updateTask(selectedTask.id, { endDate: newEndDate }, "Admin", "admin");
    toast({
      title: "Deadline Extended",
      description: `New deadline: ${new Date(newEndDate).toLocaleDateString()}`,
    });
    setExtendDialogOpen(false);
    setSelectedTask(null);
    checkDeadlines();
  };

  const totalAlerts = deadlines.nearDeadline.length + deadlines.overdue.length;

  if (totalAlerts === 0) return null;

  return (
    <>
      <Card className="border-warning">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Task Deadline Alerts ({totalAlerts})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {deadlines.overdue.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Overdue ({deadlines.overdue.length})
              </h4>
              {deadlines.overdue.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(task.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleExtend(task)}>
                      <Clock className="h-4 w-4 mr-1" />
                      Extend
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleMarkComplete(task)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {deadlines.nearDeadline.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-warning flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Due Soon ({deadlines.nearDeadline.length})
              </h4>
              {deadlines.nearDeadline.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-warning/10 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(task.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleExtend(task)}>
                      <Clock className="h-4 w-4 mr-1" />
                      Extend
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleMarkComplete(task)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Task Deadline</DialogTitle>
            <DialogDescription>
              Set a new deadline for: {selectedTask?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Deadline</Label>
              <Input
                type="date"
                value={selectedTask?.endDate || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>New Deadline</Label>
              <Input
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmExtend}>Confirm Extension</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
