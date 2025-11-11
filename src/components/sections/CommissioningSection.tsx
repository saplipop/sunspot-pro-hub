import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';

interface CommissioningSectionProps {
  customerId: string;
}

const CommissioningSection = ({ customerId }: CommissioningSectionProps) => {
  const { getCustomerData } = useData();
  const data = getCustomerData(customerId);
  const section = data?.commissioning || { status: 'pending' };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Commissioning</CardTitle>
          <Badge variant={section.status === 'completed' ? 'default' : 'secondary'}>
            {section.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            {section.commissioningReportUploaded ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <Clock className="h-5 w-5 text-muted-foreground" />
            )}
            <div className="flex-1">
              <p className="font-medium">Commissioning Report</p>
              <p className="text-sm text-muted-foreground">
                {section.commissioningReportUploaded
                  ? `Uploaded on ${section.uploadDate || 'N/A'}`
                  : 'Not uploaded'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 border rounded-lg">
            {section.subsidyReceived ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <Clock className="h-5 w-5 text-muted-foreground" />
            )}
            <div className="flex-1">
              <p className="font-medium">Subsidy Received</p>
              <p className="text-sm text-muted-foreground">
                {section.subsidyReceived
                  ? `Received on ${section.subsidyReceivedDate || 'N/A'}`
                  : 'Pending'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommissioningSection;
