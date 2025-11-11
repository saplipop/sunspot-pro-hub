import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface WiringStatusSectionProps {
  customerId: string;
}

const WiringStatusSection = ({ customerId }: WiringStatusSectionProps) => {
  const { getCustomerData } = useData();
  const data = getCustomerData(customerId);
  const section = data?.wiringStatus || { status: 'pending', components: [] };

  const verifiedCount = section.components?.filter((comp: any) => comp.verified).length || 0;
  const totalComponents = section.components?.length || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Wiring Status</CardTitle>
          <Badge variant={section.status === 'completed' ? 'default' : 'secondary'}>
            {section.status}
          </Badge>
        </div>
        {totalComponents > 0 && (
          <Progress value={(verifiedCount / totalComponents) * 100} className="mt-2" />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Technician</label>
              <p className="text-sm text-muted-foreground mt-1">
                {section.technicianName || 'Not assigned'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <p className="text-sm text-muted-foreground mt-1">
                {section.startDate || 'Not started'}
              </p>
            </div>
          </div>
          {section.remarks && (
            <div>
              <label className="text-sm font-medium">Remarks</label>
              <p className="text-sm text-muted-foreground mt-1">{section.remarks}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WiringStatusSection;
