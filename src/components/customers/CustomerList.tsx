import { useNavigate } from 'react-router-dom';
import { Customer } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Pencil } from 'lucide-react';
import EditCustomerDialog from './EditCustomerDialog';
import { useState } from 'react';

interface CustomerListProps {
  customers: Customer[];
}

const CustomerList = ({ customers }: CustomerListProps) => {
  const navigate = useNavigate();
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'in-progress':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-danger text-danger-foreground';
    }
  };

  const getStatusText = (progress: number) => {
    if (progress === 100) return 'Completed';
    if (progress > 0) return 'In Progress';
    return 'Pending';
  };

  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Zap className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            No customers yet
          </p>
          <p className="text-sm text-muted-foreground">
            Add your first solar project to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {customers.map((customer) => (
        <Card
          key={customer.id}
          className="hover:shadow-md transition-all border-l-4 border-l-primary"
        >
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div 
                className="flex-1 space-y-3 cursor-pointer"
                onClick={() => navigate(`/customer/${customer.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Consumer: {customer.consumerNumber}
                    </p>
                  </div>
                  <Badge className={getStatusColor(customer.status)}>
                    {getStatusText(customer.progress)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Capacity</p>
                    <p className="font-medium">{customer.systemCapacity} kW</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium">₹{customer.orderAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Order Date</p>
                    <p className="font-medium">
                      {new Date(customer.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{customer.progress}%</span>
                  </div>
                  <Progress value={customer.progress} className="h-2" />
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCustomer(customer);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate(`/customer/${customer.id}`)}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {editingCustomer && (
        <EditCustomerDialog 
          customer={editingCustomer} 
          open={!!editingCustomer}
          onOpenChange={(open) => !open && setEditingCustomer(null)}
        />
      )}
    </div>
  );
};

export default CustomerList;
