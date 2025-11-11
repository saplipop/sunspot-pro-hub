import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface JansamarthSectionProps {
  customerId: string;
}

const JansamarthSection = ({ customerId }: JansamarthSectionProps) => {
  const { getCustomerData } = useData();
  const data = getCustomerData(customerId);
  const section = data?.jansamarth || { status: 'pending', documents: [] };

  const submittedCount = section.documents?.filter((doc: any) => doc.submitted).length || 0;
  const totalDocs = section.documents?.length || 8;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Jansamarth Documents</CardTitle>
          <Badge variant={section.status === 'completed' ? 'default' : 'secondary'}>
            {submittedCount}/{totalDocs} Submitted
          </Badge>
        </div>
        <Progress value={(submittedCount / totalDocs) * 100} className="mt-2" />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Track bank submission documents and dates
        </p>
      </CardContent>
    </Card>
  );
};

export default JansamarthSection;
