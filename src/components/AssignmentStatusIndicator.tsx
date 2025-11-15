import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Cable, ClipboardCheck, Zap, ListChecks, User, Wifi } from "lucide-react";
import { useEmployeeSync } from "@/hooks/useEmployeeSync";
import { storage } from "@/lib/storage";
import { useEffect, useState } from "react";
import { STORAGE_CHANGE_EVENT } from "@/lib/storage";

interface AssignmentStatusIndicatorProps {
  customerId: string;
}

export function AssignmentStatusIndicator({ customerId }: AssignmentStatusIndicatorProps) {
  const status = useEmployeeSync(customerId);
  const customer = storage.getCustomer(customerId);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const assignedEmployee = customer?.assignedTo 
    ? storage.getEmployees().find(e => e.id === customer.assignedTo)
    : null;

  // Show sync animation when data updates
  useEffect(() => {
    const handleUpdate = () => {
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 1000);
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleUpdate);
    return () => window.removeEventListener(STORAGE_CHANGE_EVENT, handleUpdate);
  }, []);

  const sections = [
    {
      icon: User,
      label: "Customer",
      connected: status.hasCustomerAssignment,
      color: "text-blue-500",
    },
    {
      icon: ListChecks,
      label: "Checklist",
      connected: status.hasChecklistAssignment,
      color: "text-purple-500",
    },
    {
      icon: Cable,
      label: "Wiring",
      connected: status.hasWiringAssignment,
      color: "text-orange-500",
    },
    {
      icon: ClipboardCheck,
      label: "Inspection",
      connected: status.hasInspectionAssignment,
      color: "text-green-500",
    },
    {
      icon: Zap,
      label: "Commissioning",
      connected: status.hasCommissioningAssignment,
      color: "text-yellow-500",
    },
  ];

  const connectedCount = sections.filter(s => s.connected).length;
  const totalCount = sections.length;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden">
      {/* Sync animation overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-primary/10 animate-pulse pointer-events-none z-10" />
      )}
      
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            Real-Time Assignment Status
            {isUpdating && (
              <Wifi className="h-4 w-4 text-primary animate-pulse" />
            )}
          </span>
          <Badge variant={connectedCount === totalCount ? "default" : "secondary"}>
            {connectedCount}/{totalCount} Connected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {assignedEmployee && (
          <div className="p-3 bg-background rounded-lg border">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">{assignedEmployee.name}</p>
                <p className="text-xs text-muted-foreground">{assignedEmployee.email}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {assignedEmployee.assignedCustomers.length} projects
              </Badge>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.label}
                className={`
                  p-3 rounded-lg border transition-all
                  ${section.connected 
                    ? 'bg-success/10 border-success/30' 
                    : 'bg-muted/50 border-muted'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-1 text-center">
                  <div className="relative">
                    <Icon className={`h-5 w-5 ${section.connected ? section.color : 'text-muted-foreground'}`} />
                    {section.connected ? (
                      <CheckCircle2 className="h-3 w-3 text-success absolute -top-1 -right-1 bg-background rounded-full" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-muted-foreground absolute -top-1 -right-1 bg-background rounded-full" />
                    )}
                  </div>
                  <span className="text-xs font-medium">{section.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {connectedCount === totalCount && assignedEmployee && (
          <div className="p-3 bg-success/10 rounded-lg border border-success/30 text-center">
            <p className="text-sm text-success font-medium flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              All sections synchronized with {assignedEmployee.name}
            </p>
          </div>
        )}

        {connectedCount === 0 && (
          <div className="p-3 bg-muted/50 rounded-lg border text-center">
            <p className="text-sm text-muted-foreground">
              No employee assigned yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
