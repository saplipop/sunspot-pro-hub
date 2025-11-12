import { useState, useEffect } from "react";
import { storage, STORAGE_CHANGE_EVENT } from "@/lib/storage";
import { dataManager } from "@/lib/dataManager";
import { Employee } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, UserCheck, UserX, Edit, Trash2 } from "lucide-react";
import { EmployeeModal } from "@/components/EmployeeModal";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

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

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveEmployee = (employeeData: Partial<Employee>) => {
    try {
      if (selectedEmployee) {
        const updated: Employee = { ...selectedEmployee, ...employeeData };
        dataManager.updateEmployee(updated, user?.username || "Admin", user?.username || "admin");
        toast({
          title: "Employee Updated",
          description: `${employeeData.name} has been updated successfully`,
        });
      } else {
        const newEmployee: Employee = {
          id: `emp${Date.now()}`,
          name: employeeData.name || "",
          email: employeeData.email || "",
          phone: employeeData.phone || "",
          status: "active",
          assignedCustomers: [],
          createdBy: user?.username || "admin",
          createdDate: new Date().toISOString().split("T")[0],
        };
        dataManager.addEmployee(newEmployee, user?.username || "Admin", user?.username || "admin");
        toast({
          title: "Employee Added",
          description: `${employeeData.name} has been added successfully`,
        });
      }
      setModalOpen(false);
      setSelectedEmployee(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save employee",
        variant: "destructive",
      });
    }
  };

  const handleApprove = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (employee) {
      const updated = { ...employee, status: "active" as const };
      dataManager.updateEmployee(updated, user?.username || "Admin", user?.username || "admin");
      toast({
        title: "Employee Approved",
        description: "Employee has been approved and activated",
      });
    }
  };

  const handleSuspend = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (employee) {
      const updated = { 
        ...employee, 
        status: "suspended" as const,
        suspendedAt: new Date().toISOString(),
        suspendedBy: user?.username || "Admin",
      };
      dataManager.updateEmployee(updated, user?.username || "Admin", user?.username || "admin");
      toast({
        title: "Employee Suspended",
        description: "Employee has been suspended",
        variant: "destructive",
      });
    }
  };

  const handleUnsuspend = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (employee) {
      const updated = { 
        ...employee, 
        status: "active" as const,
        suspendedAt: undefined,
        suspendedBy: undefined,
      };
      dataManager.updateEmployee(updated, user?.username || "Admin", user?.username || "admin");
      toast({
        title: "Employee Reactivated",
        description: "Employee has been reactivated",
      });
    }
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalOpen(true);
  };

  const handleDeleteClick = (employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (employeeToDelete) {
      dataManager.deleteEmployee(employeeToDelete, user?.username || "Admin", user?.username || "admin");
      toast({
        title: "Employee Deleted",
        description: "Employee has been removed from the system",
      });
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-success text-success-foreground",
      pending: "bg-warning text-warning-foreground",
      approved: "bg-success text-success-foreground",
      suspended: "bg-destructive text-destructive-foreground",
    };

    return <Badge className={variants[status] || ""}>{status}</Badge>;
  };

  const getAssignedCustomerNames = (customerIds: string[]) => {
    const customers = storage.getCustomers();
    return customerIds
      .map((id) => customers.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Employee Management</h2>
          <p className="text-muted-foreground">
            Manage employee accounts and assignments ({filteredEmployees.length} employees)
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedEmployee(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Customers</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {employee.assignedCustomers.length > 0
                      ? getAssignedCustomerNames(employee.assignedCustomers)
                      : "None"}
                  </TableCell>
                  <TableCell>
                    {new Date(employee.createdDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {employee.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(employee.id)}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      {employee.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSuspend(employee.id)}
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Suspend
                        </Button>
                      )}
                      {employee.status === "suspended" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnsuspend(employee.id)}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Unsuspend
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteClick(employee.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EmployeeModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setSelectedEmployee(null);
        }}
        onSave={handleSaveEmployee}
        employee={selectedEmployee}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee
              account and remove all their assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Employees;