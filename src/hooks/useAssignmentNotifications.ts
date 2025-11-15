import { useEffect, useRef } from "react";
import { STORAGE_CHANGE_EVENT } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { employeeAssignmentManager } from "@/lib/employeeAssignmentManager";

/**
 * Hook to show real-time notifications when assignments change
 */
export function useAssignmentNotifications(customerId: string, enabled: boolean = true) {
  const { toast } = useToast();
  const previousStatus = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleStorageChange = (event: any) => {
      const section = event.detail?.section;
      
      // Only respond to employee-related changes
      if (!section || !["employees", "customers", "wiring", "inspection", "commissioning", "checklist"].includes(section)) {
        return;
      }

      const currentStatus = employeeAssignmentManager.getCustomerAssignmentStatus(customerId);

      // Check if this is the first load
      if (!previousStatus.current) {
        previousStatus.current = currentStatus;
        return;
      }

      // Detect changes in assignment status
      const changes: string[] = [];

      if (currentStatus.hasWiringAssignment !== previousStatus.current.hasWiringAssignment) {
        changes.push("Wiring");
      }
      if (currentStatus.hasInspectionAssignment !== previousStatus.current.hasInspectionAssignment) {
        changes.push("Inspection");
      }
      if (currentStatus.hasCommissioningAssignment !== previousStatus.current.hasCommissioningAssignment) {
        changes.push("Commissioning");
      }
      if (currentStatus.hasChecklistAssignment !== previousStatus.current.hasChecklistAssignment) {
        changes.push("Checklist");
      }

      // Show notification if there are changes
      if (changes.length > 0) {
        toast({
          title: "🔄 Assignment Updated",
          description: `${changes.join(", ")} section${changes.length > 1 ? "s" : ""} synchronized`,
          duration: 3000,
        });
      }

      previousStatus.current = currentStatus;
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);

    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    };
  }, [customerId, enabled, toast]);
}
