import { mockActivities, ActivityLog } from "@/data/mockData";

export const logActivity = (
  user: string,
  userId: string,
  customerId: string,
  section: string,
  action: string
): void => {
  const newActivity: ActivityLog = {
    id: `act${Date.now()}`,
    user,
    userId,
    customerId,
    section,
    action,
    date: new Date().toISOString(),
  };
  
  mockActivities.unshift(newActivity);
  
  // Keep only last 100 activities
  if (mockActivities.length > 100) {
    mockActivities.pop();
  }
};

export const getRecentActivities = (limit: number = 10): ActivityLog[] => {
  return mockActivities.slice(0, limit);
};

export const getCustomerActivities = (customerId: string): ActivityLog[] => {
  return mockActivities.filter((activity) => activity.customerId === customerId);
};

export const getEmployeeActivities = (userId: string): ActivityLog[] => {
  return mockActivities.filter((activity) => activity.userId === userId);
};
