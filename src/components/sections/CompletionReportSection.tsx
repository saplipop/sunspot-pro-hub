import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CompletionReportSectionProps {
  customerId: string;
}

const CompletionReportSection = ({ customerId }: CompletionReportSectionProps) => {
  const { getCustomerData } = useData();
  const data = getCustomerData(customerId);
  const section = data?.completionReport || { status: 'pending', documents: {} };

  const documents = [
    { key: 'modelAgreement', label: 'Model Agreement' },
    { key: 'annexureA', label: 'Annexure A' },
    { key: 'annexureB', label: 'Annexure B' },
    { key: 'testReport', label: 'Test Report' },
    { key: 'singleLineDiagram', label: 'Single Line Diagram' },
    { key: 'workCompletion', label: 'Work Completion Certificate' },
    { key: 'invoiceWithTax', label: 'Invoice with Tax' },
    { key: 'invoice', label: 'Invoice' },
    { key: 'panCard', label: 'PAN Card' },
    { key: 'cancelledCheque', label: 'Cancelled Cheque' },
    { key: 'gstCertificate', label: 'GST Certificate' },
    { key: 'inspectionReport', label: 'Inspection Report' },
    { key: 'netMeterPhoto', label: 'Net Meter Photo' },
    { key: 'plantPhoto', label: 'Plant Photo' },
  ];

  const completedCount = documents.filter(
    (doc) => section.documents[doc.key] === 'uploaded' || section.documents[doc.key] === 'verified'
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Completion Report</CardTitle>
          <Badge variant={section.status === 'completed' ? 'default' : 'secondary'}>
            {completedCount}/{documents.length} Uploaded
          </Badge>
        </div>
        <Progress value={(completedCount / documents.length) * 100} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {documents.map((doc) => {
            const status = section.documents[doc.key] || 'pending';
            return (
              <div
                key={doc.key}
                className="flex items-center justify-between p-2 border rounded text-sm"
              >
                <span>{doc.label}</span>
                <Badge
                  variant={
                    status === 'verified'
                      ? 'default'
                      : status === 'uploaded'
                      ? 'secondary'
                      : 'outline'
                  }
                  className="text-xs"
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

export default CompletionReportSection;
