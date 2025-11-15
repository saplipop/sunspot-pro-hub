import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Employee } from "@/data/mockData";
import { storage, STORAGE_CHANGE_EVENT } from "@/lib/storage";
import { Cable, ClipboardCheck, Zap, UserPlus, Calendar as CalendarIcon, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type WorkType = "wiring" | "inspection" | "commissioning";

interface WorkItem {
  id: string;
  type: WorkType;
  title: string;
  description: string;
  icon: React.ElementType;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  status?: "pending" | "in_progress" | "completed";
}

interface WorkAssignmentPanelProps {
  customerId: string;
  customerName: string;
  onWorkAssign: (type: WorkType, employeeId: string, dates: { start?: Date; end?: Date }, notes?: string) => void;
}

export function WorkAssignmentPanel({ customerId, customerName, onWorkAssign }: WorkAssignmentPanelProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [assignmentNotes, setAssignmentNotes] = useState("");

  useEffect(() => {
    loadEmployees();
    const handleStorageChange = () => loadEmployees();
    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    return () => window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
  }, []);

  const loadEmployees = () => {
    setEmployees(storage.getEmployees().filter(e => e.status === "active"));
  };

  // Define work items with their current status
  const workItems: WorkItem[] = [
    {
      id: "wiring",
      type: "wiring",
      title: "Wiring Installation",
      description: "Assign technician for solar panel wiring and installation",
      icon: Cable,
      status: "pending",
    },
    {
      id: "inspection",
      type: "inspection",
      title: "Quality Inspection",
      description: "Assign inspector for quality check and compliance",
      icon: ClipboardCheck,
      status: "pending",
    },
    {
      id: "commissioning",
      type: "commissioning",
      title: "System Commissioning",
      description: "Assign engineer for final commissioning and handover",
      icon: Zap,
      status: "pending",
    },
  ];

  const openAssignDialog = (work: WorkItem) => {
    setSelectedWork(work);
    setSelectedEmployee("");
    setStartDate(undefined);
    setEndDate(undefined);
    setAssignmentNotes("");
    setAssignDialog(true);
  };

  const handleAssign = () => {
    if (!selectedEmployee) {
      toast({
        title: "Employee Required",
        description: "Please select an employee to assign",
        variant: "destructive",
      });
      return;
    }

    if (!selectedWork) return;

    onWorkAssign(
      selectedWork.type,
      selectedEmployee,
      { start: startDate, end: endDate },
      assignmentNotes
    );

    const employee = employees.find(e => e.id === selectedEmployee);
    toast({
      title: "Work Assigned",
      description: `${selectedWork.title} assigned to ${employee?.name}`,
    });

    setAssignDialog(false);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-success text-success-foreground hover:bg-success/90">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-warning text-warning-foreground hover:bg-warning/90">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Pending Assignment
          </Badge>
        );
    }
  };

  const activeEmployees = employees.filter(e => e.status === "active");
  const workloadCounts = activeEmployees.reduce((acc, emp) => {
    acc[emp.id] = emp.assignedCustomers.length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Work Assignment Management
          </CardTitle>
          <CardDescription>
            Assign installation, inspection, and commissioning tasks to team members
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Active Employees Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Team Members</CardTitle>
          <CardDescription>{activeEmployees.length} active employees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeEmployees.slice(0, 3).map((emp) => (
              <Card key={emp.id} className="border-muted">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.email}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {workloadCounts[emp.id] || 0} projects
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Work Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workItems.map((work) => {
          const Icon = work.icon;
          return (
            <Card
              key={work.id}
              className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  {getStatusBadge(work.status)}
                </div>
                <CardTitle className="text-base">{work.title}</CardTitle>
                <CardDescription className="text-xs">{work.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {work.assignedTo ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
                      <p className="font-medium text-sm">{work.assignedTo}</p>
                      {work.startDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Start: {work.startDate}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => openAssignDialog(work)}
                    >
                      Reassign
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => openAssignDialog(work)}
                    className="w-full"
                    size="sm"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Team Member
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alert for No Active Employees */}
      {activeEmployees.length === 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No active employees available. Please add employees before assigning work.
          </AlertDescription>
        </Alert>
      )}

      {/* Assignment Dialog */}
      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedWork && <selectedWork.icon className="h-5 w-5 text-primary" />}
              Assign {selectedWork?.title}
            </DialogTitle>
            <DialogDescription>
              Select a team member and set timeline for {customerName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Employee Selection */}
            <div className="space-y-2">
              <Label>Select Team Member *</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {activeEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{emp.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {workloadCounts[emp.id] || 0} projects
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => startDate ? date < startDate : false}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Assignment Notes */}
            <div className="space-y-2">
              <Label>Assignment Notes (Optional)</Label>
              <Textarea
                placeholder="Add any special instructions or requirements..."
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign}>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Work
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
