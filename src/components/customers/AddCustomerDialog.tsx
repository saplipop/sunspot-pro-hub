import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddCustomerDialog = ({ open, onOpenChange }: AddCustomerDialogProps) => {
  const { addCustomer } = useData();
  const [formData, setFormData] = useState({
    name: '',
    consumerNumber: '',
    mobile: '',
    address: '',
    systemCapacity: '',
    orderAmount: '',
    orderDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomer({
      ...formData,
      systemCapacity: parseFloat(formData.systemCapacity),
      orderAmount: parseFloat(formData.orderAmount),
    });
    onOpenChange(false);
    setFormData({
      name: '',
      consumerNumber: '',
      mobile: '',
      address: '',
      systemCapacity: '',
      orderAmount: '',
      orderDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Create a new solar project. All sections will be initialized automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Customer Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="consumerNumber">Consumer Number *</Label>
              <Input
                id="consumerNumber"
                value={formData.consumerNumber}
                onChange={(e) =>
                  setFormData({ ...formData, consumerNumber: e.target.value })
                }
                placeholder="123456789"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+91 9876543210"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street, City, State, PIN"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="systemCapacity">System Capacity (kW) *</Label>
                <Input
                  id="systemCapacity"
                  type="number"
                  step="0.1"
                  value={formData.systemCapacity}
                  onChange={(e) =>
                    setFormData({ ...formData, systemCapacity: e.target.value })
                  }
                  placeholder="5.0"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="orderAmount">Order Amount (₹) *</Label>
                <Input
                  id="orderAmount"
                  type="number"
                  value={formData.orderAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, orderAmount: e.target.value })
                  }
                  placeholder="250000"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="orderDate">Order Date *</Label>
              <Input
                id="orderDate"
                type="date"
                value={formData.orderDate}
                onChange={(e) =>
                  setFormData({ ...formData, orderDate: e.target.value })
                }
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Customer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerDialog;
