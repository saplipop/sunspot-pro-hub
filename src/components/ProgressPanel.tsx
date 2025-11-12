import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  ListChecks,
  Cable,
  ClipboardCheck,
  Zap,
  CheckCircle,
} from "lucide-react";

interface SectionProgress {
  name: string;
  progress: number;
  icon: React.ElementType;
  status: "pending" | "in_progress" | "completed";
}

interface ProgressPanelProps {
  sections: SectionProgress[];
  overallProgress: number;
}

export function ProgressPanel({ sections, overallProgress }: ProgressPanelProps) {
  const getStatusColor = (progress: number) => {
    if (progress >= 80) return "bg-success text-success-foreground";
    if (progress >= 40) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  const getStatusText = (progress: number) => {
    if (progress === 0) return "🟥 Pending";
    if (progress === 100) return "🟩 Completed";
    return "🟨 In Progress";
  };

  return (
    <Card className="sticky top-4 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Project Progress</span>
          <Badge className={getStatusColor(overallProgress)}>
            {overallProgress}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Completion</span>
            <span className="text-muted-foreground">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
          <p className="text-xs text-muted-foreground text-center">
            {getStatusText(overallProgress)}
          </p>
        </div>

        {/* Section Progress */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Section Details</h4>
          {sections.map((section, index) => (
            <div
              key={section.name}
              className="space-y-1 p-2 rounded-lg hover:bg-muted/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <section.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{section.name}</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    section.progress >= 80
                      ? "border-success text-success"
                      : section.progress >= 40
                      ? "border-warning text-warning"
                      : "border-destructive text-destructive"
                  }`}
                >
                  {section.progress}%
                </Badge>
              </div>
              <Progress value={section.progress} className="h-1.5" />
            </div>
          ))}
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t">
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-lg font-bold text-destructive">
              {sections.filter((s) => s.progress === 0).length}
            </p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-lg font-bold text-warning">
              {sections.filter((s) => s.progress > 0 && s.progress < 100).length}
            </p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-lg font-bold text-success">
              {sections.filter((s) => s.progress === 100).length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}