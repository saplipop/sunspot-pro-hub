import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserPlus, User, Plus } from "lucide-react";
import { Employee } from "@/data/mockData";
import { storage, STORAGE_CHANGE_EVENT } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { TaskManagement } from "./TaskManagement";

interface EmployeeAssignmentProps {
  customerId: string;
  customerName: string;
  currentAssignee?: string | null;
  onAssign: (employeeId: string) => void;
}

export function EmployeeAssignment({
  customerId,
  customerName,
  currentAssignee,
  onAssign,
}: EmployeeAssignmentProps) {
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>(currentAssignee || "");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [showSuspended, setShowSuspended] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEmployees();

    const handleStorageChange = () => {
      loadEmployees();
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    };
  }, []);

  const loadEmployees = () => {
    setEmployees(storage.getEmployees());
  };

  const activeEmployees = employees.filter((emp) => emp.status === "active");
  const displayedEmployees = showSuspended 
    ? employees 
    : employees.filter((emp) => emp.status !== "suspended");
  const assignedEmployee = employees.find((emp) => emp.id === currentAssignee);

  const handleAssign = () => {
    if (!selectedEmployee) {
      toast({
        title: "No Employee Selected",
        description: "Please select an employee to assign",
        variant: "destructive",
      });
      return;
    }

    onAssign(selectedEmployee);

    const employee = activeEmployees.find((emp) => emp.id === selectedEmployee);
    toast({
      title: "Employee Assigned",
      description: `${employee?.name} has been assigned to ${customerName}`,
    });

    setOpen(false);
    
    // Optionally open task creation modal
    setTaskModalOpen(true);
  };

  const handleAutoAssign = () => {
    // Find employee with least assignments
    const sortedEmployees = [...activeEmployees].sort(
      (a, b) => a.assignedCustomers.length - b.assignedCustomers.length
    );

    if (sortedEmployees.length > 0) {
      setSelectedEmployee(sortedEmployees[0].id);
      toast({
        title: "Auto-Assigned",
        description: `${sortedEmployees[0].name} (${sortedEmployees[0].assignedCustomers.length} projects)`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {assignedEmployee ? (
          <Button variant="outline" size="sm" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{assignedEmployee.name}</span>
            <Badge variant="secondary" className="ml-1">
              Change
            </Badge>
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Assign Employee</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Employee</DialogTitle>
          <DialogDescription>
            Select an employee to assign to {customerName}'s project
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Select Employee</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoAssign}
              >
                Auto-Assign
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSuspended(!showSuspended)}
              >
                {showSuspended ? "Hide" : "Show"} Suspended
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an employee..." />
              </SelectTrigger>
              <SelectContent>
                {displayedEmployees.map((emp) => (
                  <SelectItem 
                    key={emp.id} 
                    value={emp.id}
                    disabled={emp.status === "suspended"}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{emp.name}</span>
                      <Badge 
                        variant={emp.status === "suspended" ? "destructive" : "outline"} 
                        className="text-xs"
                      >
                        {emp.status === "suspended" 
                          ? "Suspended" 
                          : `${emp.assignedCustomers.length} projects`}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEmployee && (
            <div className="p-3 bg-muted rounded-lg space-y-1 animate-fade-in">
              <p className="text-sm font-medium">
                {activeEmployees.find((emp) => emp.id === selectedEmployee)?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {activeEmployees.find((emp) => emp.id === selectedEmployee)?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Currently assigned to{" "}
                {activeEmployees.find((emp) => emp.id === selectedEmployee)?.assignedCustomers
                  .length || 0}{" "}
                projects
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign}>
            Assign {selectedEmployee && "& Create Task"}
          </Button>
        </div>
      </DialogContent>

      <TaskManagement
        customerId={customerId}
        customerName={customerName}
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        selectedEmployee={employees.find((e) => e.id === selectedEmployee)}
      />
    </Dialog>
  );
}