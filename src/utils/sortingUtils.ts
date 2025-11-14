import { Customer } from "@/data/mockData";

export type SortOption = "name" | "date" | "capacity" | "amount" | "progress";

export interface CustomerWithProgress extends Customer {
  progress: number;
}

export const sortCustomers = (
  customers: CustomerWithProgress[],
  sortBy: SortOption
): CustomerWithProgress[] => {
  return [...customers].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "date":
        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      case "capacity":
        return b.systemCapacity - a.systemCapacity;
      case "amount":
        return b.orderAmount - a.orderAmount;
      case "progress":
        return b.progress - a.progress;
      default:
        return 0;
    }
  });
};

export const filterCustomersByStatus = (
  customers: CustomerWithProgress[],
  status: string
): CustomerWithProgress[] => {
  if (status === "all") return customers;
  
  return customers.filter((customer) => {
    if (status === "pending") return customer.progress === 0;
    if (status === "in_progress") return customer.progress > 0 && customer.progress < 100;
    if (status === "completed") return customer.progress === 100;
    return true;
  });
};

export const searchCustomers = (
  customers: CustomerWithProgress[],
  searchTerm: string
): CustomerWithProgress[] => {
  if (!searchTerm.trim()) return customers;
  
  const term = searchTerm.toLowerCase();
  return customers.filter((customer) =>
    customer.name.toLowerCase().includes(term) ||
    customer.consumerNumber.toLowerCase().includes(term) ||
    customer.mobile.toLowerCase().includes(term)
  );
};
