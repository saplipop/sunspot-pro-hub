import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/data/mockData";

interface CustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
  onSave: (customer: Partial<Customer>) => void;
}

export const CustomerModal = ({ open, onOpenChange, customer, onSave }: CustomerModalProps) => {
  const { toast } = useToast();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>(
    customer || {
      name: "",
      consumerNumber: "",
      mobile: "",
      address: "",
      systemCapacity: 0,
      orderAmount: 0,
      orderDate: new Date().toISOString().split("T")[0],
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync formData with customer prop when it changes
  useEffect(() => {
    if (customer) {
      setFormData(customer);
    } else {
      setFormData({
        name: "",
        consumerNumber: "",
        mobile: "",
        address: "",
        systemCapacity: 0,
        orderAmount: 0,
        orderDate: new Date().toISOString().split("T")[0],
      });
    }
    setErrors({});
  }, [customer, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.consumerNumber?.trim()) {
      newErrors.consumerNumber = "Consumer number is required";
    }

    if (!formData.mobile?.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.systemCapacity || formData.systemCapacity <= 0) {
      newErrors.systemCapacity = "System capacity must be greater than 0";
    }

    if (!formData.orderAmount || formData.orderAmount <= 0) {
      newErrors.orderAmount = "Order amount must be greater than 0";
    }

    if (!formData.orderDate) {
      newErrors.orderDate = "Order date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    // Show confirmation for existing customer updates
    if (customer) {
      setShowConfirmation(true);
    } else {
      confirmSave();
    }
  };

  const confirmSave = () => {
    onSave(formData);
    toast({
      title: customer ? "Customer Updated" : "Customer Added",
      description: `${formData.name} has been ${customer ? "updated" : "added"} successfully`,
    });
    setShowConfirmation(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{customer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="consumerNumber">Consumer Number *</Label>
                <Input
                  id="consumerNumber"
                  value={formData.consumerNumber}
                  onChange={(e) => setFormData({ ...formData, consumerNumber: e.target.value })}
                  className={errors.consumerNumber ? "border-destructive" : ""}
                />
                {errors.consumerNumber && (
                  <p className="text-sm text-destructive">{errors.consumerNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className={errors.mobile ? "border-destructive" : ""}
                />
                {errors.mobile && <p className="text-sm text-destructive">{errors.mobile}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemCapacity">System Capacity (kW) *</Label>
                <Input
                  id="systemCapacity"
                  type="number"
                  step="0.01"
                  value={formData.systemCapacity || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, systemCapacity: parseFloat(e.target.value) || 0 })
                  }
                  className={errors.systemCapacity ? "border-destructive" : ""}
                />
                {errors.systemCapacity && (
                  <p className="text-sm text-destructive">{errors.systemCapacity}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderAmount">Order Amount (₹) *</Label>
                <Input
                  id="orderAmount"
                  type="number"
                  step="0.01"
                  value={formData.orderAmount || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, orderAmount: parseFloat(e.target.value) || 0 })
                  }
                  className={errors.orderAmount ? "border-destructive" : ""}
                />
                {errors.orderAmount && (
                  <p className="text-sm text-destructive">{errors.orderAmount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderDate">Order Date *</Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                  className={errors.orderDate ? "border-destructive" : ""}
                />
                {errors.orderDate && <p className="text-sm text-destructive">{errors.orderDate}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className={errors.address ? "border-destructive" : ""}
              />
              {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{customer ? "Update Customer" : "Add Customer"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Updates */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Customer Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update <strong>{formData.name}</strong>'s details?
              This action will modify the existing customer information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>
              Confirm Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
