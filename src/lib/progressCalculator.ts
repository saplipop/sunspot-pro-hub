/**
 * Progress Calculator
 * Calculates overall progress based on section completion weights
 */

import { storage } from "./storage";
import { Status } from "@/data/mockData";

// Section weights (total = 100%)
const SECTION_WEIGHTS = {
  documents: 25,
  checklist: 20,
  wiring: 20,
  inspection: 20,
  commissioning: 15,
};

// Calculate section progress
function getSectionProgress(status: Status): number {
  switch (status) {
    case "completed":
      return 100;
    case "in_progress":
      return 50;
    case "pending":
    default:
      return 0;
  }
}

// Calculate document section progress
export function calculateDocumentProgress(customerId: string): number {
  const documents = storage.getCustomerDocuments(customerId);
  if (documents.length === 0) return 0;

  const totalProgress = documents.reduce((sum, doc) => {
    return sum + getSectionProgress(doc.status);
  }, 0);

  const progress = totalProgress / documents.length;
  // Return exact value if all complete, otherwise round down
  return progress === 100 ? 100 : Math.floor(progress);
}

// Calculate checklist progress
export function calculateChecklistProgress(customerId: string): number {
  const checklist = storage.getCustomerChecklist(customerId);
  if (checklist.length === 0) return 0;

  const totalProgress = checklist.reduce((sum, item) => {
    return sum + getSectionProgress(item.status);
  }, 0);

  const progress = totalProgress / checklist.length;
  return progress === 100 ? 100 : Math.floor(progress);
}

// Calculate wiring progress
export function calculateWiringProgress(customerId: string): number {
  const wiring = storage.getCustomerWiring(customerId);
  if (!wiring) return 0;
  return getSectionProgress(wiring.status);
}

// Calculate inspection progress
export function calculateInspectionProgress(customerId: string): number {
  const inspections = storage.getCustomerInspections(customerId);
  if (inspections.length === 0) return 0;

  const totalProgress = inspections.reduce((sum, inspection) => {
    return sum + getSectionProgress(inspection.status);
  }, 0);

  const progress = totalProgress / inspections.length;
  return progress === 100 ? 100 : Math.floor(progress);
}

// Calculate commissioning progress
export function calculateCommissioningProgress(customerId: string): number {
  const commissioning = storage.getCustomerCommissioning(customerId);
  if (!commissioning) return 0;
  return getSectionProgress(commissioning.status);
}

// Calculate overall customer progress
export function calculateOverallProgress(customerId: string): number {
  const documentProgress = calculateDocumentProgress(customerId);
  const checklistProgress = calculateChecklistProgress(customerId);
  const wiringProgress = calculateWiringProgress(customerId);
  const inspectionProgress = calculateInspectionProgress(customerId);
  const commissioningProgress = calculateCommissioningProgress(customerId);

  // Check if all sections are at 100%
  const allComplete = 
    documentProgress === 100 &&
    checklistProgress === 100 &&
    wiringProgress === 100 &&
    inspectionProgress === 100 &&
    commissioningProgress === 100;

  if (allComplete) return 100;

  const weighted =
    (documentProgress * SECTION_WEIGHTS.documents +
      checklistProgress * SECTION_WEIGHTS.checklist +
      wiringProgress * SECTION_WEIGHTS.wiring +
      inspectionProgress * SECTION_WEIGHTS.inspection +
      commissioningProgress * SECTION_WEIGHTS.commissioning) /
    100;

  return Math.floor(weighted);
}

// Get customer status based on progress
export function getCustomerStatus(customerId: string): "pending" | "in_progress" | "completed" {
  const progress = calculateOverallProgress(customerId);
  
  if (progress === 100) return "completed";
  if (progress > 0) return "in_progress";
  return "pending";
}

// Get section status color
export function getStatusColor(status: Status): string {
  switch (status) {
    case "completed":
      return "text-success bg-success/10";
    case "in_progress":
      return "text-warning bg-warning/10";
    case "pending":
    default:
      return "text-destructive bg-destructive/10";
  }
}

// Get progress color
export function getProgressColor(progress: number): string {
  if (progress === 100) return "bg-success";
  if (progress >= 50) return "bg-warning";
  return "bg-destructive";
}
