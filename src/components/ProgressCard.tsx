import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "./StatusBadge";
import { getProjectStatus } from "@/utils/progressUtils";

interface ProgressCardProps {
  progress: number;
  customerName: string;
  systemCapacity: number;
}

export const ProgressCard = ({ progress, customerName, systemCapacity }: ProgressCardProps) => {
  const status = getProjectStatus(progress);

  return (
    <Card className="hover:shadow-lg transition-all">
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{customerName}</h3>
          <StatusBadge status={status} />
        </div>
        <p className="text-sm text-muted-foreground">{systemCapacity} kW System</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};
