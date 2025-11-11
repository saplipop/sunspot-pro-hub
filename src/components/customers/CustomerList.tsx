import { useNavigate } from 'react-router-dom';
import { Customer } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap } from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
}

const CustomerList = ({ customers }: CustomerListProps) => {
  const navigate = useNavigate();

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
          className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-primary"
          onClick={() => navigate(`/customer/${customer.id}`)}
        >
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 space-y-3">
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

              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CustomerList;
