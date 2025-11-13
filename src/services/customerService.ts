import api from "./interceptor";
import { Customer } from "@/data/mockData";

export interface CustomerResponse {
  success: boolean;
  data: {
    customer?: Customer;
    customers?: Customer[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message?: string;
}

const customerService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sort?: string;
  }): Promise<Customer[]> => {
    const response = await api.get<CustomerResponse>("/customers", { params });
    return response.data.data.customers || [];
  },

  getById: async (customerId: string): Promise<Customer | null> => {
    const response = await api.get<CustomerResponse>(`/customers/${customerId}`);
    return response.data.data.customer || null;
  },

  create: async (customerData: Partial<Customer>): Promise<Customer> => {
    const response = await api.post<CustomerResponse>("/customers", customerData);
    return response.data.data.customer!;
  },

  update: async (customerId: string, customerData: Partial<Customer>): Promise<Customer> => {
    const response = await api.put<CustomerResponse>(`/customers/${customerId}`, customerData);
    return response.data.data.customer!;
  },

  delete: async (customerId: string): Promise<void> => {
    await api.delete(`/customers/${customerId}`);
  },
};

export default customerService;
