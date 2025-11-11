import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SolarChecklistSectionProps {
  customerId: string;
}

const SolarChecklistSection = ({ customerId }: SolarChecklistSectionProps) => {
  const { getCustomerData } = useData();
  const data = getCustomerData(customerId);
  const section = data?.solarChecklist || { status: 'pending' };

  const checklist = [
    { key: 'newConnection', label: 'New Connection' },
    { key: 'loadExtension', label: 'Load Extension' },
    { key: 'pvApplication', label: 'PV Application' },
    { key: 'feasibility', label: 'Feasibility' },
    { key: 'netMeter', label: 'Net Meter' },
  ];

  const completedCount = checklist.filter((item) => section[item.key] === 'completed').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Solar Process Checklist</CardTitle>
          <Badge variant={section.status === 'completed' ? 'default' : 'secondary'}>
            {completedCount}/{checklist.length} Done
          </Badge>
        </div>
        <Progress value={(completedCount / checklist.length) * 100} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checklist.map((item) => {
            const status = section[item.key] || 'pending';
            return (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <span className="font-medium">{item.label}</span>
                <Badge
                  variant={
                    status === 'completed'
                      ? 'default'
                      : status === 'in-progress'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {status}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SolarChecklistSection;
