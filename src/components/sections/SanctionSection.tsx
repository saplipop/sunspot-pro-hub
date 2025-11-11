import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SanctionSectionProps {
  customerId: string;
}

const SanctionSection = ({ customerId }: SanctionSectionProps) => {
  const { getCustomerData } = useData();
  const data = getCustomerData(customerId);
  const section = data?.sanction || { status: 'pending' };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sanction Details</CardTitle>
          <Badge variant={section.status === 'completed' ? 'default' : 'secondary'}>
            {section.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Sanction Number</label>
              <p className="text-sm text-muted-foreground mt-1">
                {section.sanctionNumber || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Sanction KW</label>
              <p className="text-sm text-muted-foreground mt-1">
                {section.sanctionKW ? `${section.sanctionKW} kW` : 'Not provided'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Sanction Date</label>
              <p className="text-sm text-muted-foreground mt-1">
                {section.sanctionDate || 'Not provided'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SanctionSection;
