import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Employee, mockCustomers } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface EmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (employee: Partial<Employee>) => void;
  employee?: Employee;
}

export const EmployeeModal = ({ open, onOpenChange, onSave, employee }: EmployeeModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: "",
    email: "",
    phone: "",
    assignedCustomers: [],
  });

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        assignedCustomers: [],
      });
    }
  }, [employee, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
    onOpenChange(false);
    toast({
      title: "Success",
      description: employee ? "Employee updated successfully" : "Employee added successfully",
    });
  };

  const toggleCustomerAssignment = (customerId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedCustomers: prev.assignedCustomers?.includes(customerId)
        ? prev.assignedCustomers.filter((id) => id !== customerId)
        : [...(prev.assignedCustomers || []), customerId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter employee name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="employee@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="9123456789"
            />
          </div>

          <div className="space-y-2">
            <Label>Assign Customers</Label>
            <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
              {mockCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`customer-${customer.id}`}
                    checked={formData.assignedCustomers?.includes(customer.id)}
                    onCheckedChange={() => toggleCustomerAssignment(customer.id)}
                  />
                  <Label htmlFor={`customer-${customer.id}`} className="cursor-pointer flex-1">
                    {customer.name} ({customer.consumerNumber})
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};