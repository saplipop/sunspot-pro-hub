import { useEffect, useState } from "react";
import { STORAGE_CHANGE_EVENT } from "@/lib/storage";
import { employeeAssignmentManager } from "@/lib/employeeAssignmentManager";

/**
 * Hook to monitor employee assignment status in real-time
 */
export function useEmployeeSync(customerId: string) {
  const [assignmentStatus, setAssignmentStatus] = useState(() =>
    employeeAssignmentManager.getCustomerAssignmentStatus(customerId)
  );

  useEffect(() => {
    const updateStatus = () => {
      setAssignmentStatus(
        employeeAssignmentManager.getCustomerAssignmentStatus(customerId)
      );
    };

    // Update on storage changes
    window.addEventListener(STORAGE_CHANGE_EVENT, updateStatus);

    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, updateStatus);
    };
  }, [customerId]);

  return assignmentStatus;
}
