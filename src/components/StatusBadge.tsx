import { Badge } from "@/components/ui/badge";
import { Status } from "@/data/mockData";

interface StatusBadgeProps {
  status: Status;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground hover:bg-success/90 shadow-sm";
      case "in_progress":
        return "bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm";
      case "pending":
        return "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm";
      default:
        return "";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "completed":
        return "✓ Completed";
      case "in_progress":
        return "◷ In Progress";
      case "pending":
        return "○ Pending";
      default:
        return status;
    }
  };

  return <Badge className={`${getStatusStyles()} transition-all duration-200 font-medium`}>{getStatusLabel()}</Badge>;
};
