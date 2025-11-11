import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface RTSDocumentSectionProps {
  customerId: string;
}

const RTSDocumentSection = ({ customerId }: RTSDocumentSectionProps) => {
  const { getCustomerData } = useData();
  const data = getCustomerData(customerId);
  const section = data?.rtsDocument || { status: 'pending', documents: {} };

  const documents = [
    { key: 'annexure', label: 'Annexure' },
    { key: 'declaration', label: 'Declaration' },
    { key: 'photo', label: 'Photo' },
    { key: 'approval', label: 'Approval Letter' },
  ];

  const uploadedCount = documents.filter(
    (doc) => section.documents[doc.key] === 'uploaded' || section.documents[doc.key] === 'verified'
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>RTS Documents</CardTitle>
          <Badge variant={section.status === 'completed' ? 'default' : 'secondary'}>
            {uploadedCount}/{documents.length} Uploaded
          </Badge>
        </div>
        <Progress value={(uploadedCount / documents.length) * 100} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((doc) => {
            const status = section.documents[doc.key] || 'pending';
            return (
              <div
                key={doc.key}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <span className="font-medium">{doc.label}</span>
                <Badge
                  variant={
                    status === 'verified'
                      ? 'default'
                      : status === 'uploaded'
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

export default RTSDocumentSection;
