import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MeterFittingSectionProps {
  customerId: string;
}

const MeterFittingSection = ({ customerId }: MeterFittingSectionProps) => {
  const { getCustomerData } = useData();
  const data = getCustomerData(customerId);
  const section = data?.meterFitting || { status: 'pending' };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Meter Fitting</CardTitle>
          <Badge variant={section.status === 'completed' ? 'default' : 'secondary'}>
            {section.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Generation Meter No.</label>
              <p className="text-sm text-muted-foreground mt-1">
                {section.generationMeterNo || 'Not installed'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Adani Meter No.</label>
              <p className="text-sm text-muted-foreground mt-1">
                {section.adaniMeterNo || 'Not installed'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">System Start Date</label>
              <p className="text-sm text-muted-foreground mt-1">
                {section.systemStartDate || 'Not started'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MeterFittingSection;
