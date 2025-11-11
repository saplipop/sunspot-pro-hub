import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InspectionQCSectionProps {
  customerId: string;
}

const InspectionQCSection = ({ customerId }: InspectionQCSectionProps) => {
  const { getCustomerData } = useData();
  const data = getCustomerData(customerId);
  const section = data?.inspectionQC || { status: 'pending' };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Inspection & QC</CardTitle>
          <Badge
            variant={
              section.inspectionApproved
                ? 'default'
                : section.documentSubmitted
                ? 'secondary'
                : 'outline'
            }
          >
            {section.inspectionApproved
              ? 'Approved'
              : section.documentSubmitted
              ? 'Submitted'
              : 'Pending'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Document Submitted</label>
              <p className="text-sm text-muted-foreground mt-1">
                {section.documentSubmitted ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Submission Date</label>
              <p className="text-sm text-muted-foreground mt-1">
                {section.submissionDate || 'Not submitted'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Inward Number</label>
              <p className="text-sm text-muted-foreground mt-1">
                {section.inwardNumber || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">QC Name</label>
              <p className="text-sm text-muted-foreground mt-1">
                {section.qcName || 'Not assigned'}
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

export default InspectionQCSection;
