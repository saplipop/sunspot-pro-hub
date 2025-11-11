import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ReleaseOrderSectionProps {
  customerId: string;
}

const ReleaseOrderSection = ({ customerId }: ReleaseOrderSectionProps) => {
  const { getCustomerData } = useData();
  const data = getCustomerData(customerId);
  const section = data?.releaseOrder || { status: 'pending' };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Release Order</CardTitle>
          <Badge variant={section.status === 'completed' ? 'default' : 'secondary'}>
            {section.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Release Number</label>
              <p className="text-sm text-muted-foreground mt-1">
                {section.releaseNumber || 'Not issued'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Release Date</label>
              <p className="text-sm text-muted-foreground mt-1">
                {section.releaseDate || 'Not issued'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReleaseOrderSection;
