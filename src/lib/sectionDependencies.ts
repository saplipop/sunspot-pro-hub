/**
 * Section Dependencies Manager
 * Handles section unlocking logic and dependencies
 */

import { storage } from "./storage";
import { calculateChecklistProgress, calculateWiringProgress, calculateInspectionProgress } from "./progressCalculator";

// Check if wiring section should be unlocked
export function isWiringUnlocked(customerId: string): boolean {
  const checklistProgress = calculateChecklistProgress(customerId);
  return checklistProgress === 100;
}

// Check if inspection section should be unlocked
export function isInspectionUnlocked(customerId: string): boolean {
  const wiringProgress = calculateWiringProgress(customerId);
  return wiringProgress === 100;
}

// Check if commissioning section should be unlocked
export function isCommissioningUnlocked(customerId: string): boolean {
  const inspectionProgress = calculateInspectionProgress(customerId);
  return inspectionProgress === 100;
}

// Get locked section message
export function getLockedMessage(section: string, customerId: string): string {
  switch (section) {
    case "wiring":
      return "Complete all checklist items to unlock wiring section";
    case "inspection":
      return "Complete wiring section to unlock inspection";
    case "commissioning":
      return "Complete inspection section to unlock commissioning";
    default:
      return "This section is locked";
  }
}

// Lock dependent sections when a section is incomplete
export function lockDependentSections(customerId: string, changedSection: string): void {
  if (changedSection === "checklist") {
    const checklistProgress = calculateChecklistProgress(customerId);
    if (checklistProgress < 100) {
      // Lock wiring, inspection, and commissioning
      const wiring = storage.getCustomerWiring(customerId);
      if (wiring && wiring.status !== "pending") {
        storage.updateWiring(customerId, { ...wiring, status: "pending" });
      }

      const inspections = storage.getCustomerInspections(customerId);
      inspections.forEach((inspection) => {
        if (inspection.status !== "pending") {
          storage.updateInspection({ ...inspection, status: "pending" });
        }
      });

      const commissioning = storage.getCustomerCommissioning(customerId);
      if (commissioning && commissioning.status !== "pending") {
        storage.updateCommissioning(customerId, { ...commissioning, status: "pending" });
      }
    }
  }

  if (changedSection === "wiring") {
    const wiringProgress = calculateWiringProgress(customerId);
    if (wiringProgress < 100) {
      // Lock inspection and commissioning
      const inspections = storage.getCustomerInspections(customerId);
      inspections.forEach((inspection) => {
        if (inspection.status !== "pending") {
          storage.updateInspection({ ...inspection, status: "pending" });
        }
      });

      const commissioning = storage.getCustomerCommissioning(customerId);
      if (commissioning && commissioning.status !== "pending") {
        storage.updateCommissioning(customerId, { ...commissioning, status: "pending" });
      }
    }
  }

  if (changedSection === "inspection") {
    const inspectionProgress = calculateInspectionProgress(customerId);
    if (inspectionProgress < 100) {
      // Lock commissioning
      const commissioning = storage.getCustomerCommissioning(customerId);
      if (commissioning && commissioning.status !== "pending") {
        storage.updateCommissioning(customerId, { ...commissioning, status: "pending" });
      }
    }
  }
}
