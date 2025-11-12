
// Auto-detect status based on completeness
export const autoDetectDocumentStatus = (doc: {
  uploaded?: boolean;
  fileId?: string;
  verified?: boolean;
}): "pending" | "in_progress" | "completed" => {
  if (doc.verified) return "completed";
  if (doc.uploaded || doc.fileId) return "in_progress";
  return "pending";
};

export const autoDetectChecklistStatus = (item: {
  status?: string;
  startDate?: string;
  endDate?: string;
}): "pending" | "in_progress" | "completed" => {
  if (item.status === "completed" || item.endDate) return "completed";
  if (item.status === "in_progress" || item.startDate) return "in_progress";
  return "pending";
};

export const autoDetectSectionStatus = (section: {
  status?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}): "pending" | "in_progress" | "completed" => {
  // Check if explicitly marked as completed
  if (section.status === "completed") return "completed";
  
  // Check if all required fields are filled
  const hasStartDate = !!section.startDate;
  const hasEndDate = !!section.endDate;
  
  if (hasEndDate) return "completed";
  if (hasStartDate) return "in_progress";
  return "pending";
};

export const getProjectStatus = (progress: number): "pending" | "in_progress" | "completed" => {
  if (progress === 0) return "pending";
  if (progress === 100) return "completed";
  return "in_progress";
};