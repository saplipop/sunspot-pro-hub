import api from "./interceptor";
import { Inspection } from "@/data/mockData";

export interface InspectionResponse {
  success: boolean;
  data: {
    inspections?: Inspection[];
    inspection?: Inspection;
  };
  message?: string;
}

const inspectionService = {
  getCustomerInspections: async (customerId: string): Promise<Inspection[]> => {
    const response = await api.get<InspectionResponse>(`/customers/${customerId}/inspections`);
    return response.data.data.inspections || [];
  },

  update: async (
    customerId: string,
    inspectionId: string,
    data: Partial<Inspection>
  ): Promise<Inspection> => {
    const response = await api.put<InspectionResponse>(
      `/customers/${customerId}/inspections/${inspectionId}`,
      data
    );
    return response.data.data.inspection!;
  },
};

export default inspectionService;
