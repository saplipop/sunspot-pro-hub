import api from "./interceptor";
import { ChecklistItem } from "@/data/mockData";

export interface ChecklistResponse {
  success: boolean;
  data: {
    checklist?: ChecklistItem[];
    item?: ChecklistItem;
  };
  message?: string;
}

const checklistService = {
  getCustomerChecklist: async (customerId: string): Promise<ChecklistItem[]> => {
    const response = await api.get<ChecklistResponse>(`/customers/${customerId}/checklist`);
    return response.data.data.checklist || [];
  },

  updateItem: async (
    customerId: string,
    itemId: string,
    data: Partial<ChecklistItem>
  ): Promise<ChecklistItem> => {
    const response = await api.put<ChecklistResponse>(
      `/customers/${customerId}/checklist/${itemId}`,
      data
    );
    return response.data.data.item!;
  },
};

export default checklistService;
